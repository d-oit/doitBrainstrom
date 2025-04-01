// src/contexts/AccessibilityContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTheme } from './ThemeContext';
import { useResponsive } from './ResponsiveContext';
import { saveAccessibilitySettings, loadAccessibilitySettings } from '../services/settingsService';
import { runAllMigrations } from '../utils/migrationUtils';
import {
  defaultKeyboardShortcuts,
  KeyboardShortcutsMap,
  formatShortcut,
  getShortcutsByGroup
} from '../utils/accessibility/keyboardNavigation';
import {
  announcePolite,
  announceAssertive,
  clearAnnouncements
} from '../utils/accessibility/liveRegion';
import { focusManager } from '../utils/accessibility/focusManager';

// Interface for accessibility settings
export interface AccessibilitySettings {
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  colorBlindnessType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  customKeyboardShortcuts: KeyboardShortcutsMap;
}

// Interface for the context value
export interface AccessibilityContextType {
  // Settings
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;

  // Keyboard shortcuts
  keyboardShortcuts: KeyboardShortcutsMap;
  registerKeyboardShortcut: (action: string, shortcut: any) => void;
  unregisterKeyboardShortcut: (action: string) => void;
  formatShortcut: (shortcut: any) => string;
  getShortcutsByGroup: () => Record<string, any[]>;

  // Screen reader announcements
  announceToScreenReader: (message: string, assertive?: boolean) => void;
  clearScreenReaderAnnouncements: () => void;

  // Focus management
  focusElement: (element: HTMLElement) => void;
  focusFirstElement: (container: HTMLElement) => boolean;
  focusLastElement: (container: HTMLElement) => boolean;

  // Skip links
  addSkipLink: (targetId: string, label: string) => void;
  removeSkipLink: (targetId: string) => void;

  // Derived state
  isReducedMotionActive: boolean;
  isHighContrastActive: boolean;
  isLargeTextActive: boolean;
  isScreenReaderActive: boolean;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  screenReaderSupport: true,
  keyboardNavigation: true,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  colorBlindnessType: 'none',
  customKeyboardShortcuts: {}
};

// Create the context
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Provider component
export const AccessibilityContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get theme and responsive context values
  const { mode, settings: themeSettings, updateSettings: updateThemeSettings } = useTheme();
  const { power } = useResponsive();

  // State for accessibility settings
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Initialize settings from IndexedDB
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Run migrations from localStorage to IndexedDB
        await runAllMigrations();

        // Load settings from IndexedDB
        const indexedDBSettings = await loadAccessibilitySettings();
        if (indexedDBSettings) {
          setSettings({ ...defaultSettings, ...indexedDBSettings });
        } else {
          // If not in IndexedDB, try localStorage for backward compatibility
          try {
            const savedSettings = localStorage.getItem('accessibility-settings');
            if (savedSettings) {
              const parsedSettings = JSON.parse(savedSettings);
              setSettings({ ...defaultSettings, ...parsedSettings });
            }
          } catch (localStorageError) {
            console.error('Failed to load accessibility settings from localStorage:', localStorageError);
          }
        }
      } catch (error) {
        console.error('Failed to initialize settings from IndexedDB:', error);
        // Already using default settings as fallback
      }
    };

    initializeSettings();
  }, []);

  // State for keyboard shortcuts
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcutsMap>(defaultKeyboardShortcuts);

  // State for skip links
  const [skipLinks, setSkipLinks] = useState<{ targetId: string; label: string }[]>([]);

  // Derived state
  const isReducedMotionActive = settings.reducedMotion || !!power.reducedMotion;
  const isHighContrastActive = settings.highContrast || mode === 'high-contrast';
  const isLargeTextActive = settings.largeText;
  const isScreenReaderActive = settings.screenReaderSupport;

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };

      // Save to localStorage for backward compatibility
      try {
        localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save accessibility settings to localStorage:', error);
      }

      // Save to IndexedDB
      saveAccessibilitySettings(updated).catch(error => {
        console.error('Failed to save accessibility settings to IndexedDB:', error);
      });

      // Sync with theme settings if needed
      if (newSettings.highContrast !== undefined && newSettings.highContrast !== prev.highContrast) {
        updateThemeSettings({
          mode: newSettings.highContrast ? 'high-contrast' : (mode === 'high-contrast' ? 'light' : mode)
        });
      }

      if (newSettings.reducedMotion !== undefined && newSettings.reducedMotion !== prev.reducedMotion) {
        updateThemeSettings({ reducedMotion: newSettings.reducedMotion });
      }

      if (newSettings.colorBlindnessType !== undefined && newSettings.colorBlindnessType !== prev.colorBlindnessType) {
        updateThemeSettings({
          colorScheme: newSettings.colorBlindnessType === 'none' ? 'default' : newSettings.colorBlindnessType
        });
      }

      return updated;
    });
  }, [mode, updateThemeSettings]);

  // Register a keyboard shortcut
  const registerKeyboardShortcut = useCallback((action: string, shortcut: any) => {
    setKeyboardShortcuts(prev => ({
      ...prev,
      [action]: shortcut
    }));
  }, []);

  // Unregister a keyboard shortcut
  const unregisterKeyboardShortcut = useCallback((action: string) => {
    setKeyboardShortcuts(prev => {
      const updated = { ...prev };
      delete updated[action];
      return updated;
    });
  }, []);

  // Announce to screen reader
  const announceToScreenReader = useCallback((message: string, assertive = false) => {
    if (!settings.screenReaderSupport) return;

    if (assertive) {
      announceAssertive(message);
    } else {
      announcePolite(message);
    }
  }, [settings.screenReaderSupport]);

  // Clear screen reader announcements
  const clearScreenReaderAnnouncements = useCallback(() => {
    clearAnnouncements();
  }, []);

  // Focus an element
  const focusElement = useCallback((element: HTMLElement) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  // Focus the first element in a container
  const focusFirstElement = useCallback((container: HTMLElement) => {
    return focusManager.focusFirstElement(container);
  }, []);

  // Focus the last element in a container
  const focusLastElement = useCallback((container: HTMLElement) => {
    return focusManager.focusLastElement(container);
  }, []);

  // Add a skip link
  const addSkipLink = useCallback((targetId: string, label: string) => {
    setSkipLinks(prev => [...prev, { targetId, label }]);
  }, []);

  // Remove a skip link
  const removeSkipLink = useCallback((targetId: string) => {
    setSkipLinks(prev => prev.filter(link => link.targetId !== targetId));
  }, []);

  // Sync with theme settings on mount
  useEffect(() => {
    updateSettings({
      highContrast: mode === 'high-contrast',
      reducedMotion: themeSettings.reducedMotion,
      colorBlindnessType: themeSettings.colorScheme === 'default' ? 'none' : themeSettings.colorScheme as any
    });
  }, []);

  // Create skip links on mount
  useEffect(() => {
    // Add skip links to the DOM
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.setAttribute('aria-label', 'Skip links navigation');
    skipLinksContainer.style.position = 'absolute';
    skipLinksContainer.style.top = '0';
    skipLinksContainer.style.left = '0';
    skipLinksContainer.style.zIndex = '9999';

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);

    // Add default skip link to main content
    const mainContentLink = focusManager.createSkipLink('main-content', 'Skip to main content');
    skipLinksContainer.appendChild(mainContentLink);

    return () => {
      // Clean up
      if (skipLinksContainer.parentNode) {
        skipLinksContainer.parentNode.removeChild(skipLinksContainer);
      }
    };
  }, []);

  // Update skip links when they change
  useEffect(() => {
    const skipLinksContainer = document.querySelector('.skip-links');
    if (!skipLinksContainer) return;

    // Clear existing skip links
    skipLinksContainer.innerHTML = '';

    // Add default skip link to main content
    const mainContentLink = focusManager.createSkipLink('main-content', 'Skip to main content');
    skipLinksContainer.appendChild(mainContentLink);

    // Add custom skip links
    skipLinks.forEach(link => {
      const skipLink = focusManager.createSkipLink(link.targetId, link.label);
      skipLinksContainer.appendChild(skipLink);
    });
  }, [skipLinks]);

  // Create the context value
  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    keyboardShortcuts,
    registerKeyboardShortcut,
    unregisterKeyboardShortcut,
    formatShortcut,
    getShortcutsByGroup: () => getShortcutsByGroup(keyboardShortcuts),
    announceToScreenReader,
    clearScreenReaderAnnouncements,
    focusElement,
    focusFirstElement,
    focusLastElement,
    addSkipLink,
    removeSkipLink,
    isReducedMotionActive,
    isHighContrastActive,
    isLargeTextActive,
    isScreenReaderActive
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook for using the accessibility context
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityContextProvider');
  }
  return context;
};
