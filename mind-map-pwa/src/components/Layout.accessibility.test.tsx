/**
 * @vitest-environment jsdom
 */

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

// Mock Material UI components to reduce file loading
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    AppBar: ({ children, ...props }: any) => <div data-testid="appbar" {...props}>{children}</div>,
    Toolbar: ({ children, ...props }: any) => <div data-testid="toolbar" {...props}>{children}</div>,
    IconButton: ({ children, ...props }: any) => <button data-testid="iconbutton" {...props}>{children}</button>,
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    Container: ({ children, ...props }: any) => <div data-testid="container" {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
    Divider: ({ orientation, flexItem, ...props }: any) => <div data-testid="divider" {...props}></div>,
    useTheme: () => ({
      palette: {
        primary: { main: '#1976d2' },
        background: { paper: '#fff' },
        text: { primary: '#000' }
      },
      breakpoints: {
        up: () => false,
        down: () => false
      },
      spacing: (factor: number) => `${factor * 8}px`
    }),
    useMediaQuery: () => false
  };
});

// Mock all icons to reduce file loading
vi.mock('@mui/icons-material', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  Brightness4: () => <div data-testid="dark-mode-icon">Dark</div>,
  Brightness7: () => <div data-testid="light-mode-icon">Light</div>,
  Language: () => <div data-testid="language-icon">Language</div>,
  Accessibility: () => <div data-testid="accessibility-icon">Accessibility</div>,
  AccessibilityNew: () => <div data-testid="accessibility-new-icon">AccessibilityNew</div>,
  Contrast: () => <div data-testid="contrast-icon">Contrast</div>,
  TextFields: () => <div data-testid="text-fields-icon">TextFields</div>,
  Animation: () => <div data-testid="animation-icon">Animation</div>,
  Keyboard: () => <div data-testid="keyboard-icon">Keyboard</div>,
  Speed: () => <div data-testid="speed-icon">Speed</div>,
  VisibilityOff: () => <div data-testid="visibility-off-icon">VisibilityOff</div>,
  Visibility: () => <div data-testid="visibility-icon">Visibility</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  HelpOutline: () => <div data-testid="help-outline-icon">HelpOutline</div>,
  Close: () => <div data-testid="close-icon">Close</div>,
  ColorLens: () => <div data-testid="color-lens-icon">ColorLens</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  RestartAlt: () => <div data-testid="restart-alt-icon">RestartAlt</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Clear: () => <div data-testid="clear-icon">Clear</div>
}));

import Layout from './Layout';
// Mock ThemeContext
vi.mock('../contexts/ThemeContext', () => {
  const mockTheme = {
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: { default: '#fff', paper: '#f5f5f5' },
      text: { primary: '#000', secondary: '#333' }
    }
  };

  return {
    useTheme: () => ({
      mode: 'light',
      toggleTheme: vi.fn(),
      theme: mockTheme
    }),
    ThemeContext: {
      Provider: ({ children }: { children: React.ReactNode }) => children
    }
  };
});

// Mock KeyboardShortcutsContext
vi.mock('../contexts/KeyboardShortcutsContext', () => ({
  useKeyboardShortcuts: () => ({
    registerShortcut: vi.fn(),
    unregisterShortcut: vi.fn(),
    getShortcutsByGroup: vi.fn().mockReturnValue({
      navigation: [
        { id: 'nav-1', keys: ['Ctrl', '+', 'H'], description: 'Home' },
        { id: 'nav-2', keys: ['Ctrl', '+', 'S'], description: 'Save' }
      ],
      editing: [
        { id: 'edit-1', keys: ['Ctrl', '+', 'Z'], description: 'Undo' },
        { id: 'edit-2', keys: ['Ctrl', '+', 'Y'], description: 'Redo' }
      ]
    }),
    triggerShortcut: vi.fn()
  })
}));

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

// Mock AccessibilityContext
vi.mock('../contexts/AccessibilityContext', () => ({
  useAccessibility: () => ({
    highContrastMode: false,
    largeText: false,
    reduceAnimations: false,
    screenReaderActive: false,
    keyboardNavigation: false,
    focusVisible: true,
    announceToScreenReader: vi.fn(),
    toggleHighContrast: vi.fn(),
    toggleLargeText: vi.fn(),
    toggleReduceAnimations: vi.fn(),
    toggleKeyboardNavigation: vi.fn(),
    setFocusVisible: vi.fn(),
    settings: {
      highContrastMode: false,
      largeText: false,
      reduceAnimations: false,
      screenReaderSupport: false,
      keyboardNavigation: false
    },
    keyboardShortcuts: {
      'help': {
        key: '?',
        shiftKey: true,
        description: 'Show keyboard shortcuts help',
        group: 'Global',
        preventDefault: true
      },
      'toggleTheme': {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        description: 'Toggle between light and dark theme',
        group: 'Global',
        preventDefault: true
      }
    },
    formatShortcut: vi.fn().mockReturnValue('Ctrl + Shift + ?'),
    getShortcutsByGroup: vi.fn().mockReturnValue({
      Global: [
        { key: '?', shiftKey: true, description: 'Show keyboard shortcuts help', group: 'Global', preventDefault: true, action: 'help' },
        { key: 'd', ctrlKey: true, shiftKey: true, description: 'Toggle between light and dark theme', group: 'Global', preventDefault: true, action: 'toggleTheme' }
      ]
    })
  })
}), { virtual: true });

// Mock ResponsiveContext
vi.mock('../contexts/ResponsiveContext', () => ({
  useResponsive: () => ({
    network: {
      online: true,
      connectionType: 'wifi',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false
    },
    viewport: {
      breakpoint: 'md',
      deviceCategory: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWidescreen: false,
      isLandscape: true,
      isPortrait: false,
      pixelRatio: 1,
      safeAreaInsets: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      layout: {
        sidebarWidth: '380px',
        mapWidth: 'calc(100% - 380px)',
        toolbarHeight: '64px'
      }
    },
    memory: {
      deviceMemory: 8,
      lowMemoryMode: false
    },
    foldable: {
      isFoldable: false,
      isSpanned: false,
      foldSize: null,
      foldAngle: null,
      spanDirection: null,
      screenSegments: null
    },
    power: {
      isLowPowerMode: false,
      batteryLevel: 0.8,
      batteryCharging: true,
      reducedMotion: false
    },
    shouldReduceAnimations: false,
    shouldVirtualizeList: false,
    shouldReduceImageQuality: false,
    shouldUseOfflineFirst: false
  })
}), { virtual: true });

import { I18nContext } from '../contexts/I18nContext';

// Mock NetworkStatusIndicator component
vi.mock('./NetworkStatusIndicator', () => ({
  default: () => <div aria-label="Network status">Online</div>
}), { virtual: true });

// Mock the components used in Layout
vi.mock('./ThemeSwitcher', () => ({
  default: () => <button aria-label="Theme switcher">Theme</button>
}), { virtual: true });

vi.mock('./LocaleSwitcher', () => ({
  default: () => <button aria-label="Language switcher">Language</button>
}), { virtual: true });

vi.mock('./sync/SyncStatusPanel', () => ({
  default: () => <div aria-label="Sync status">Synced</div>
}), { virtual: true });

vi.mock('./offline/OfflineIndicator', () => ({
  default: () => <div aria-label="Offline indicator">Offline</div>
}), { virtual: true });

// Mock the sanitization utility
vi.mock('../utils/inputSanitization', () => ({
  sanitizeTextInput: (text: string) => text
}), { virtual: true });

// Create a mock I18n provider
const MockI18nProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <I18nContext.Provider value={{
      t: (key: string) => key === 'app.title' ? 'd.o. Brainstroming' : key,
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
