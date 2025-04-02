// src/components/Layout.integration.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from './Layout';
import ModernAppBar from './Navigation/AppBar';

// Mock the ModernAppBar component
vi.mock('./Navigation/AppBar', () => ({
  default: vi.fn().mockImplementation(({ title, children }) => (
    <header data-testid="modern-app-bar">
      <h1>{title}</h1>
      {children}
    </header>
  ))
}));

// Mock other components used in Layout
vi.mock('./ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher">Theme Switcher</div>
}));

vi.mock('./LocaleSwitcher', () => ({
  default: () => <div data-testid="locale-switcher">Locale Switcher</div>
}));

vi.mock('./sync/SyncStatusPanel', () => ({
  default: () => <div data-testid="sync-status">Sync Status</div>
}));

vi.mock('./NetworkStatusIndicator', () => ({
  default: () => <div data-testid="network-status">Network Status</div>
}));

vi.mock('./offline/OfflineIndicator', () => ({
  default: () => <div data-testid="offline-indicator">Offline Indicator</div>
}));

vi.mock('./navigation/NavigationDrawer', () => ({
  default: ({ open, onClose, currentTab, onTabChange }) => (
    <div data-testid="navigation-drawer" data-open={open}>
      Navigation Drawer
    </div>
  )
}));

// Mock contexts
vi.mock('../contexts/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    dir: 'ltr'
  })
}));

vi.mock('../contexts/ResponsiveContext', () => ({
  useResponsive: () => ({
    viewport: {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      layout: {
        toolbarHeight: '64px'
      },
      safeAreaInsets: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    }
  })
}));

// Test the integration of Layout with ModernAppBar
describe('Layout with ModernAppBar integration', () => {
  it('renders the Layout with ModernAppBar', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check that ModernAppBar was called
    expect(ModernAppBar).toHaveBeenCalled();
    
    // Check that the content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('passes the correct props to ModernAppBar', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check that ModernAppBar was called with the correct props
    expect(ModernAppBar).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'app.title'
      }),
      expect.anything()
    );
  });
});
