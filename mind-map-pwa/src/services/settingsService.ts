// src/services/settingsService.ts
import { logInfo, logError, logWarn } from '../utils/logger';
import { saveSettings, getSettings } from '../utils/indexedDB/dbService';
import { SettingsRecord } from '../utils/indexedDB/config';

/**
 * Save theme settings to IndexedDB
 * @param themeSettings The theme settings to save
 */
export const saveThemeSettings = async (themeSettings: any): Promise<boolean> => {
  try {
    logInfo('Saving theme settings to IndexedDB');

    const settingsRecord: SettingsRecord = {
      id: 'theme',
      category: 'theme',
      data: themeSettings,
      lastModified: new Date().toISOString()
    };

    return await saveSettings(settingsRecord);
  } catch (error) {
    logError('Error saving theme settings to IndexedDB:', error);

    // Fallback to localStorage
    try {
      localStorage.setItem('theme-settings', JSON.stringify(themeSettings));
      logWarn('Saved theme settings to localStorage as fallback');
      return true;
    } catch (localStorageError) {
      logError('Error saving theme settings to localStorage:', localStorageError);
      return false;
    }
  }
};

/**
 * Load theme settings from IndexedDB
 * @returns The theme settings or default settings if not found
 */
export const loadThemeSettings = async (): Promise<any> => {
  try {
    logInfo('Loading theme settings from IndexedDB');

    const settingsRecord = await getSettings('theme');

    if (settingsRecord) {
      logInfo('Theme settings loaded from IndexedDB');
      return settingsRecord.data;
    }

    // If not found in IndexedDB, try localStorage
    logInfo('Theme settings not found in IndexedDB, trying localStorage');
    const localStorageSettings = localStorage.getItem('theme-settings');

    if (localStorageSettings) {
      const parsedSettings = JSON.parse(localStorageSettings);
      logInfo('Theme settings loaded from localStorage');

      // Save to IndexedDB for next time
      await saveThemeSettings(parsedSettings);

      return parsedSettings;
    }

    // Return default settings if not found anywhere
    logInfo('No theme settings found, using defaults');
    return {
      mode: 'system',
      useCssVars: true,
      animations: true,
      reducedMotion: false,
      colorScheme: 'default',
    };
  } catch (error) {
    logError('Error loading theme settings from IndexedDB:', error);

    // Fallback to localStorage
    try {
      const localStorageSettings = localStorage.getItem('theme-settings');

      if (localStorageSettings) {
        logWarn('Loaded theme settings from localStorage as fallback');
        return JSON.parse(localStorageSettings);
      }
    } catch (localStorageError) {
      logError('Error loading theme settings from localStorage:', localStorageError);
    }

    // Return default settings if all else fails
    return {
      mode: 'system',
      useCssVars: true,
      animations: true,
      reducedMotion: false,
      colorScheme: 'default',
    };
  }
};

/**
 * Save accessibility settings to IndexedDB
 * @param accessibilitySettings The accessibility settings to save
 */
export const saveAccessibilitySettings = async (accessibilitySettings: any): Promise<boolean> => {
  try {
    logInfo('Saving accessibility settings to IndexedDB');

    const settingsRecord: SettingsRecord = {
      id: 'accessibility',
      category: 'accessibility',
      data: accessibilitySettings,
      lastModified: new Date().toISOString()
    };

    return await saveSettings(settingsRecord);
  } catch (error) {
    logError('Error saving accessibility settings to IndexedDB:', error);

    // Fallback to localStorage
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(accessibilitySettings));
      logWarn('Saved accessibility settings to localStorage as fallback');
      return true;
    } catch (localStorageError) {
      logError('Error saving accessibility settings to localStorage:', localStorageError);
      return false;
    }
  }
};

/**
 * Load accessibility settings from IndexedDB
 * @returns The accessibility settings or default settings if not found
 */
export const loadAccessibilitySettings = async (): Promise<any> => {
  try {
    logInfo('Loading accessibility settings from IndexedDB');

    const settingsRecord = await getSettings('accessibility');

    if (settingsRecord) {
      logInfo('Accessibility settings loaded from IndexedDB');
      return settingsRecord.data;
    }

    // If not found in IndexedDB, try localStorage
    logInfo('Accessibility settings not found in IndexedDB, trying localStorage');
    const localStorageSettings = localStorage.getItem('accessibility-settings');

    if (localStorageSettings) {
      const parsedSettings = JSON.parse(localStorageSettings);
      logInfo('Accessibility settings loaded from localStorage');

      // Save to IndexedDB for next time
      await saveAccessibilitySettings(parsedSettings);

      return parsedSettings;
    }

    // Return default settings if not found anywhere
    logInfo('No accessibility settings found, using defaults');
    return {
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      colorBlindnessType: 'none',
      customKeyboardShortcuts: {}
    };
  } catch (error) {
    logError('Error loading accessibility settings from IndexedDB:', error);

    // Fallback to localStorage
    try {
      const localStorageSettings = localStorage.getItem('accessibility-settings');

      if (localStorageSettings) {
        logWarn('Loaded accessibility settings from localStorage as fallback');
        return JSON.parse(localStorageSettings);
      }
    } catch (localStorageError) {
      logError('Error loading accessibility settings from localStorage:', localStorageError);
    }

    // Return default settings if all else fails
    return {
      screenReaderSupport: true,
      keyboardNavigation: true,
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      colorBlindnessType: 'none',
      customKeyboardShortcuts: {}
    };
  }
};

/**
 * Save locale settings to IndexedDB
 * @param locale The locale to save
 */
export const saveLocaleSettings = async (locale: string): Promise<boolean> => {
  try {
    logInfo('Saving locale settings to IndexedDB');

    const settingsRecord: SettingsRecord = {
      id: 'locale',
      category: 'i18n',
      data: { locale },
      lastModified: new Date().toISOString()
    };

    return await saveSettings(settingsRecord);
  } catch (error) {
    logError('Error saving locale settings to IndexedDB:', error);

    // Fallback to localStorage
    try {
      localStorage.setItem('locale', locale);
      logWarn('Saved locale settings to localStorage as fallback');
      return true;
    } catch (localStorageError) {
      logError('Error saving locale settings to localStorage:', localStorageError);
      return false;
    }
  }
};

/**
 * Load locale settings from IndexedDB
 * @returns The locale or default locale if not found
 */
export const loadLocaleSettings = async (): Promise<string> => {
  try {
    logInfo('Loading locale settings from IndexedDB');

    const settingsRecord = await getSettings('locale');

    if (settingsRecord && settingsRecord.data && settingsRecord.data.locale) {
      logInfo('Locale settings loaded from IndexedDB');
      return settingsRecord.data.locale;
    }

    // If not found in IndexedDB, try localStorage
    logInfo('Locale settings not found in IndexedDB, trying localStorage');
    const localStorageLocale = localStorage.getItem('locale');

    if (localStorageLocale) {
      logInfo('Locale settings loaded from localStorage');

      // Save to IndexedDB for next time
      await saveLocaleSettings(localStorageLocale);

      return localStorageLocale;
    }

    // Return default locale if not found anywhere
    logInfo('No locale settings found, using default');
    return 'en';
  } catch (error) {
    logError('Error loading locale settings from IndexedDB:', error);

    // Fallback to localStorage
    try {
      const localStorageLocale = localStorage.getItem('locale');

      if (localStorageLocale) {
        logWarn('Loaded locale settings from localStorage as fallback');
        return localStorageLocale;
      }
    } catch (localStorageError) {
      logError('Error loading locale settings from localStorage:', localStorageError);
    }

    // Return default locale if all else fails
    return 'en';
  }
};
