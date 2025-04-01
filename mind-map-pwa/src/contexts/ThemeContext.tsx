// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ThemeMode, ThemeSettings, ThemeContextType } from '../types/theme';
import {
  createAppTheme,
  createLegacyTheme,
  detectSystemPreference,
  watchSystemPreference,
  loadThemeSettings,
  saveThemeSettings,
  getDefaultThemeSettings
} from '../styles/theme-engine';
import { saveThemeSettings as saveThemeSettingsToIndexedDB, loadThemeSettings as loadThemeSettingsFromIndexedDB } from '../services/settingsService';
import { runAllMigrations } from '../utils/migrationUtils';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load theme settings from localStorage initially, will be updated from IndexedDB
  const [settings, setSettings] = useState<ThemeSettings>(loadThemeSettings());
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(detectSystemPreference());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Destructure settings for easier access
  const { mode, useCssVars } = settings;

  // Initialize settings from IndexedDB
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Run migrations from localStorage to IndexedDB
        await runAllMigrations();

        // Load settings from IndexedDB
        const indexedDBSettings = await loadThemeSettingsFromIndexedDB();
        if (indexedDBSettings) {
          setSettings(indexedDBSettings);
        }
      } catch (error) {
        console.error('Failed to initialize settings from IndexedDB:', error);
        // Already using localStorage settings as fallback
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSettings();
  }, []);

  // Watch for system preference changes
  useEffect(() => {
    const unwatch = watchSystemPreference((preference) => {
      setSystemPreference(preference);
    });
    return unwatch;
  }, []);

  // Update individual settings
  const setMode = (newMode: ThemeMode) => {
    updateSettings({ mode: newMode });
  };

  const setUseCssVars = (newUseCssVars: boolean) => {
    updateSettings({ useCssVars: newUseCssVars });
  };

  // Update multiple settings at once
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to localStorage for backward compatibility
    saveThemeSettings(updatedSettings);

    // Save to IndexedDB
    saveThemeSettingsToIndexedDB(updatedSettings).catch(error => {
      console.error('Failed to save theme settings to IndexedDB:', error);
    });
  };

  // Determine if high contrast mode is active
  const isHighContrastMode = mode === 'high-contrast';

  // Create the appropriate theme based on settings
  const theme = useMemo(() => {
    return useCssVars
      ? createAppTheme(mode === 'system' ? systemPreference : mode, settings)
      : createLegacyTheme(mode === 'system' ? systemPreference : mode, settings);
  }, [mode, systemPreference, settings, useCssVars]);

  // Determine the current mode
  const currentMode = mode === 'system' ? systemPreference : mode;

  // Apply CSS classes to body based on theme
  useEffect(() => {
    const body = document.body;

    // Remove all theme classes first
    body.classList.remove('light-theme', 'dark-theme', 'high-contrast-theme');

    // Add the appropriate theme class
    if (currentMode === 'dark') {
      body.classList.add('dark-theme');
    } else if (currentMode === 'high-contrast') {
      body.classList.add('high-contrast-theme');
      body.classList.add('high-contrast-mode');
    } else {
      body.classList.add('light-theme');
    }

    // Add reduced motion class if needed
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }, [currentMode, settings.reducedMotion]);

  // Create context value
  const contextValue: ThemeContextType = {
    mode,
    setMode,
    useCssVars,
    setUseCssVars,
    settings,
    updateSettings,
    isHighContrastMode,
    systemPreference
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {useCssVars ? (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      ) : (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};
