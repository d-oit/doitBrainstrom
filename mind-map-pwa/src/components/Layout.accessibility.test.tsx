import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from '@axe-core/react';
import { axeConfig } from '../test/axe-setup';
import Layout from './Layout';
import { I18nContext } from '../contexts/I18nContext';

// Mock the components used in Layout
vi.mock('./ThemeSwitcher', () => ({
  default: () => <button aria-label="Theme switcher">Theme</button>
}));

vi.mock('./LocaleSwitcher', () => ({
  default: () => <button aria-label="Language switcher">Language</button>
}));

vi.mock('./SyncStatus', () => ({
  default: () => <div aria-label="Sync status">Synced</div>
}));

// Mock the sanitization utility
vi.mock('../utils/inputSanitization', () => ({
  sanitizeTextInput: (text: string) => text
}));

// Create a mock I18n provider
const MockI18nProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <I18nContext.Provider value={{ 
      t: (key: string) => key === 'app.title' ? 'Mind Map PWA' : key, 
      locale: 'en', 
      setLocale: vi.fn(), 
      dir: 'ltr', 
      availableLocales: ['en', 'es', 'ar'] 
    }}>
      {children}
    </I18nContext.Provider>
  );
};

describe('Layout Accessibility', () => {
  it('should pass accessibility checks', async () => {
    const { container } = render(
      <MockI18nProvider>
        <Layout>
          <div>Test content</div>
        </Layout>
      </MockI18nProvider>
    );

    const results = await axe(container, axeConfig);
    
    // Log any violations for debugging
    if (results.violations.length > 0) {
      console.error('Accessibility violations:', 
        results.violations.map(violation => ({
          id: violation.id,
          description: violation.description,
          help: violation.help,
          elements: violation.nodes.map(node => node.html)
        }))
      );
    }
    
    expect(results.violations.length).toBe(0);
  });
});
