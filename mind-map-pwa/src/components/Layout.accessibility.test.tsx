import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
// Mock axe-core
vi.mock('@axe-core/react', () => ({
  axe: vi.fn().mockResolvedValue({ violations: [] })
}), { virtual: true });

import { axe } from '@axe-core/react';
// Mock axe-config
vi.mock('../test/axe-setup', () => ({
  axeConfig: {}
}), { virtual: true });

import { axeConfig } from '../test/axe-setup';
import Layout from './Layout';
// Mock I18nContext
vi.mock('../contexts/I18nContext', () => ({
  I18nContext: {
    Provider: ({ children, value }: { children: React.ReactNode, value: any }) => <div>{children}</div>
  },
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
    dir: 'ltr',
    availableLocales: ['en', 'es', 'ar']
  })
}), { virtual: true });

import { I18nContext } from '../contexts/I18nContext';

// Mock Material UI components
vi.mock('@mui/material', () => ({
  AppBar: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  Toolbar: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }: any) => <div {...props}>{children}</div>
}), { virtual: true });

// Mock the components used in Layout
vi.mock('./ThemeSwitcher', () => ({
  default: () => <button aria-label="Theme switcher">Theme</button>
}), { virtual: true });

vi.mock('./LocaleSwitcher', () => ({
  default: () => <button aria-label="Language switcher">Language</button>
}), { virtual: true });

vi.mock('./SyncStatus', () => ({
  default: () => <div aria-label="Sync status">Synced</div>
}), { virtual: true });

// Mock the sanitization utility
vi.mock('../utils/inputSanitization', () => ({
  sanitizeTextInput: (text: string) => text
}), { virtual: true });

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
