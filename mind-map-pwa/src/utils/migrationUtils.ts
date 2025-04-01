// src/utils/migrationUtils.ts
import { logInfo, logError, logWarn } from './logger';
import { saveSettings, getSettings, saveAppState } from './indexedDB/dbService';
import { SettingsRecord, AppStateRecord } from './indexedDB/config';
import { generateId } from './MindMapDataModel';

// Flag to track if migration has been performed
const MIGRATION_FLAG_KEY = 'indexedDB_migration_completed';

/**
 * Check if migration has already been performed
 */
export const isMigrationCompleted = (): boolean => {
  try {
    return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
  } catch (error) {
    logError('Error checking migration status:', error);
    return false;
  }
};

/**
 * Mark migration as completed
 */
export const markMigrationCompleted = (): void => {
  try {
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    logInfo('Migration marked as completed');
  } catch (error) {
    logError('Error marking migration as completed:', error);
  }
};

/**
 * Migrate theme settings from localStorage to IndexedDB
 */
export const migrateThemeSettings = async (): Promise<boolean> => {
  try {
    const themeSettingsKey = 'theme-settings';
    const storedSettings = localStorage.getItem(themeSettingsKey);
    
    if (!storedSettings) {
      logInfo('No theme settings found in localStorage to migrate');
      return true;
    }
    
    const parsedSettings = JSON.parse(storedSettings);
    const timestamp = new Date().toISOString();
    
    const settingsRecord: SettingsRecord = {
      id: 'theme',
      category: 'theme',
      data: parsedSettings,
      lastModified: timestamp
    };
    
    await saveSettings(settingsRecord);
    logInfo('Theme settings migrated from localStorage to IndexedDB');
    
    return true;
  } catch (error) {
    logError('Error migrating theme settings:', error);
    return false;
  }
};

/**
 * Migrate accessibility settings from localStorage to IndexedDB
 */
export const migrateAccessibilitySettings = async (): Promise<boolean> => {
  try {
    const accessibilitySettingsKey = 'accessibility-settings';
    const storedSettings = localStorage.getItem(accessibilitySettingsKey);
    
    if (!storedSettings) {
      logInfo('No accessibility settings found in localStorage to migrate');
      return true;
    }
    
    const parsedSettings = JSON.parse(storedSettings);
    const timestamp = new Date().toISOString();
    
    const settingsRecord: SettingsRecord = {
      id: 'accessibility',
      category: 'accessibility',
      data: parsedSettings,
      lastModified: timestamp
    };
    
    await saveSettings(settingsRecord);
    logInfo('Accessibility settings migrated from localStorage to IndexedDB');
    
    return true;
  } catch (error) {
    logError('Error migrating accessibility settings:', error);
    return false;
  }
};

/**
 * Migrate locale settings from localStorage to IndexedDB
 */
export const migrateLocaleSettings = async (): Promise<boolean> => {
  try {
    const localeKey = 'locale';
    const storedLocale = localStorage.getItem(localeKey);
    
    if (!storedLocale) {
      logInfo('No locale settings found in localStorage to migrate');
      return true;
    }
    
    const timestamp = new Date().toISOString();
    
    const settingsRecord: SettingsRecord = {
      id: 'locale',
      category: 'i18n',
      data: { locale: storedLocale },
      lastModified: timestamp
    };
    
    await saveSettings(settingsRecord);
    logInfo('Locale settings migrated from localStorage to IndexedDB');
    
    return true;
  } catch (error) {
    logError('Error migrating locale settings:', error);
    return false;
  }
};

/**
 * Migrate navigation state from localStorage to IndexedDB
 */
export const migrateNavigationState = async (): Promise<boolean> => {
  try {
    const navigationStateKey = 'doitBrainstorm.navigationState.drawerOpen';
    const storedState = localStorage.getItem(navigationStateKey);
    
    if (!storedState) {
      logInfo('No navigation state found in localStorage to migrate');
      return true;
    }
    
    const parsedState = JSON.parse(storedState);
    const timestamp = new Date().toISOString();
    
    const stateRecord: AppStateRecord = {
      id: 'navigation.drawerOpen',
      category: 'navigation',
      data: { drawerOpen: parsedState },
      lastModified: timestamp
    };
    
    await saveAppState(stateRecord);
    logInfo('Navigation state migrated from localStorage to IndexedDB');
    
    return true;
  } catch (error) {
    logError('Error migrating navigation state:', error);
    return false;
  }
};

/**
 * Migrate client ID from localStorage to IndexedDB
 */
export const migrateClientId = async (): Promise<boolean> => {
  try {
    const clientIdKey = 'sync_client_id';
    const storedClientId = localStorage.getItem(clientIdKey);
    
    if (!storedClientId) {
      logInfo('No client ID found in localStorage to migrate');
      return true;
    }
    
    const timestamp = new Date().toISOString();
    
    const settingsRecord: SettingsRecord = {
      id: 'sync.clientId',
      category: 'sync',
      data: { clientId: storedClientId },
      lastModified: timestamp
    };
    
    await saveSettings(settingsRecord);
    logInfo('Client ID migrated from localStorage to IndexedDB');
    
    return true;
  } catch (error) {
    logError('Error migrating client ID:', error);
    return false;
  }
};

/**
 * Run all migrations
 */
export const runAllMigrations = async (): Promise<boolean> => {
  if (isMigrationCompleted()) {
    logInfo('Migration already completed, skipping');
    return true;
  }
  
  try {
    logInfo('Starting migration from localStorage to IndexedDB');
    
    const themeResult = await migrateThemeSettings();
    const accessibilityResult = await migrateAccessibilitySettings();
    const localeResult = await migrateLocaleSettings();
    const navigationResult = await migrateNavigationState();
    const clientIdResult = await migrateClientId();
    
    const allSuccessful = 
      themeResult && 
      accessibilityResult && 
      localeResult && 
      navigationResult && 
      clientIdResult;
    
    if (allSuccessful) {
      markMigrationCompleted();
      logInfo('All migrations completed successfully');
    } else {
      logWarn('Some migrations failed, will retry on next app load');
    }
    
    return allSuccessful;
  } catch (error) {
    logError('Error running migrations:', error);
    return false;
  }
};
