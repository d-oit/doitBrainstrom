import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
// Mock I18nContext
vi.mock('./contexts/I18nContext', () => ({
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

import { I18nContext } from './contexts/I18nContext';

// Mock Material UI components
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Grid: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Alert: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Tabs: ({ children, ...props }: any) => <div role="tablist" {...props}>{children}</div>,
  Tab: ({ ...props }: any) => <div role="tab" {...props}></div>,
  CircularProgress: ({ ...props }: any) => <div {...props}>Loading...</div>
}), { virtual: true });

// Mock Layout component
vi.mock('./components/Layout', () => ({
  default: ({ children }: any) => <div>{children}</div>
}), { virtual: true });

// Mock the components that are lazy loaded
vi.mock('./components/MindMap', () => ({
  default: () => <div data-testid="mock-mind-map">Mock Mind Map</div>
}), { virtual: true });

vi.mock('./components/MindMapCard', () => ({
  default: ({ title, description }: { title: string; description?: string }) => (
    <div data-testid="mock-mind-map-card">
      <h5>{title}</h5>
      {description && <p>{description}</p>}
    </div>
  )
}), { virtual: true });

// Mock the S3 service
vi.mock('./services/s3Service', () => ({
  listBuckets: vi.fn().mockResolvedValue([{ Name: 'test-bucket' }])
}), { virtual: true });

// Create a mock I18n provider
const MockI18nProvider = ({ children }: { children: React.ReactNode }) => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'app.title': 'Mind Map PWA',
      'app.subtitle': 'Create and organize your ideas',
      'tabs.mindMap': 'Mind Map',
      'tabs.s3Connection': 'S3 Connection',
      'tabs.sampleCards': 'Sample Cards',
      's3.connectionTest': 'S3 Connection Test',
      's3.connectionSuccess': 'Successfully connected to S3',
      's3.availableBuckets': 'Available Buckets',
      'mindMap.mainIdea': 'Main Idea',
      'mindMap.mainIdeaDesc': 'Central concept of your mind map',
      'mindMap.supportingConcept': 'Supporting Concept',
      'mindMap.supportingConceptDesc': 'Ideas that support the main concept',
      'mindMap.anotherConcept': 'Another Concept',
      'mindMap.anotherConceptDesc': 'More ideas to explore'
    };
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
      dir: 'ltr',
      availableLocales: ['en', 'es', 'ar']
    }}>
      {children}
    </I18nContext.Provider>
  );
};

describe('App Integration', () => {
  it('renders the App with tabs', async () => {
    render(
      <MockI18nProvider>
        <App />
      </MockI18nProvider>
    );

    // Check for main title
    expect(screen.getByText('Mind Map PWA')).toBeInTheDocument();

    // Check for tabs
    expect(screen.getByRole('tab', { name: /Mind Map/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /S3 Connection/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sample Cards/i })).toBeInTheDocument();

    // Mind Map tab should be active by default
    const mindMapTab = screen.getByRole('tab', { name: /Mind Map/i });
    expect(mindMapTab.getAttribute('aria-selected')).toBe('true');

    // Mind Map component should be rendered (via Suspense)
    expect(await screen.findByTestId('mock-mind-map')).toBeInTheDocument();
  });
});
