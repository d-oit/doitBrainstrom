// src/utils/migrationUtils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as migrationUtils from './migrationUtils';
import {
  isMigrationCompleted,
  markMigrationCompleted,
  migrateThemeSettings,
  migrateAccessibilitySettings,
  migrateLocaleSettings,
  migrateNavigationState,
  migrateClientId,
  runAllMigrations
} from './migrationUtils';
import * as dbService from './indexedDB/dbService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

// Mock dbService
vi.mock('./indexedDB/dbService', () => ({
  saveSettings: vi.fn().mockResolvedValue(true),
  getSettings: vi.fn().mockResolvedValue(null),
  saveAppState: vi.fn().mockResolvedValue(true),
  getAppState: vi.fn().mockResolvedValue(null)
}));

// Mock logger
vi.mock('./logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn()
}));

describe('Migration Utils', () => {
  beforeEach(() => {
    // Setup mocks
    vi.stubGlobal('localStorage', localStorageMock);

    // Reset mock functions
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.removeItem.mockClear();

    // Reset localStorage mock store
    localStorageMock.clear();

    // Reset dbService mocks
    vi.mocked(dbService.saveSettings).mockClear();
    vi.mocked(dbService.getSettings).mockClear();
    vi.mocked(dbService.saveAppState).mockClear();
    vi.mocked(dbService.getAppState).mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isMigrationCompleted', () => {
    it('should return true if migration flag is set to true', () => {
      localStorageMock.getItem.mockReturnValueOnce('true');

      const result = isMigrationCompleted();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('indexedDB_migration_completed');
    });

    it('should return false if migration flag is not set', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = isMigrationCompleted();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('indexedDB_migration_completed');
    });

    it('should return false if migration flag is set to false', () => {
      localStorageMock.getItem.mockReturnValueOnce('false');

      const result = isMigrationCompleted();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('indexedDB_migration_completed');
    });

    it('should return false if localStorage throws an error', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = isMigrationCompleted();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('indexedDB_migration_completed');
    });
  });

  describe('markMigrationCompleted', () => {
    it('should set migration flag to true', () => {
      markMigrationCompleted();

      expect(localStorageMock.setItem).toHaveBeenCalledWith('indexedDB_migration_completed', 'true');
    });

    it('should handle localStorage errors', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      // Should not throw
      expect(() => markMigrationCompleted()).not.toThrow();
    });
  });

  describe('migrateThemeSettings', () => {
    it('should migrate theme settings from localStorage to IndexedDB', async () => {
      const themeSettings = {
        mode: 'dark',
        useCssVars: true,
        animations: true,
        reducedMotion: false,
        colorScheme: 'default'
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(themeSettings));

      const result = await migrateThemeSettings();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-settings');
      expect(dbService.saveSettings).toHaveBeenCalledWith({
        id: 'theme',
        category: 'theme',
        data: themeSettings,
        lastModified: expect.any(String)
      });
    });

    it('should return true if no theme settings found in localStorage', async () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = await migrateThemeSettings();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-settings');
      expect(dbService.saveSettings).not.toHaveBeenCalled();
    });

    it('should return false if saveSettings fails', async () => {
      const themeSettings = {
        mode: 'dark',
        useCssVars: true,
        animations: true,
        reducedMotion: false,
        colorScheme: 'default'
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(themeSettings));
      vi.mocked(dbService.saveSettings).mockRejectedValueOnce(new Error('Test error'));

      const result = await migrateThemeSettings();

      expect(result).toBe(false);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-settings');
      expect(dbService.saveSettings).toHaveBeenCalled();
    });
  });

  describe('migrateAccessibilitySettings', () => {
    it('should migrate accessibility settings from localStorage to IndexedDB', async () => {
      const accessibilitySettings = {
        screenReaderSupport: true,
        keyboardNavigation: true,
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        colorBlindnessType: 'none',
        customKeyboardShortcuts: {}
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(accessibilitySettings));

      const result = await migrateAccessibilitySettings();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessibility-settings');
      expect(dbService.saveSettings).toHaveBeenCalledWith({
        id: 'accessibility',
        category: 'accessibility',
        data: accessibilitySettings,
        lastModified: expect.any(String)
      });
    });
  });

  describe('migrateLocaleSettings', () => {
    it('should migrate locale settings from localStorage to IndexedDB', async () => {
      localStorageMock.getItem.mockReturnValueOnce('en');

      const result = await migrateLocaleSettings();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('locale');
      expect(dbService.saveSettings).toHaveBeenCalledWith({
        id: 'locale',
        category: 'i18n',
        data: { locale: 'en' },
        lastModified: expect.any(String)
      });
    });
  });

  describe('migrateNavigationState', () => {
    it('should migrate navigation state from localStorage to IndexedDB', async () => {
      localStorageMock.getItem.mockReturnValueOnce('true');

      const result = await migrateNavigationState();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('doitBrainstorm.navigationState.drawerOpen');
      expect(dbService.saveAppState).toHaveBeenCalledWith({
        id: 'navigation.drawerOpen',
        category: 'navigation',
        data: { drawerOpen: true },
        lastModified: expect.any(String)
      });
    });
  });

  describe('migrateClientId', () => {
    it('should migrate client ID from localStorage to IndexedDB', async () => {
      localStorageMock.getItem.mockReturnValueOnce('test-client-id');

      const result = await migrateClientId();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('sync_client_id');
      expect(dbService.saveSettings).toHaveBeenCalledWith({
        id: 'sync.clientId',
        category: 'sync',
        data: { clientId: 'test-client-id' },
        lastModified: expect.any(String)
      });
    });
  });

  describe('runAllMigrations', () => {
    it('should run all migrations and mark migration as completed if all successful', async () => {
      // Mock isMigrationCompleted to return false
      localStorageMock.getItem.mockReturnValueOnce(null);

      // Mock all migrations to succeed
      vi.mocked(dbService.saveSettings).mockResolvedValue(true);
      vi.mocked(dbService.saveAppState).mockResolvedValue(true);

      const result = await runAllMigrations();

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('indexedDB_migration_completed', 'true');
    });

    it('should skip migrations if already completed', async () => {
      // Mock isMigrationCompleted to return true
      localStorageMock.getItem.mockReturnValueOnce('true');

      const result = await runAllMigrations();

      expect(result).toBe(true);
      expect(dbService.saveSettings).not.toHaveBeenCalled();
      expect(dbService.saveAppState).not.toHaveBeenCalled();
    });

    it.skip('should not mark migration as completed if any migration fails', async () => {
      // Mock isMigrationCompleted to return false
      localStorageMock.getItem.mockReturnValueOnce(null);

      // Mock migrateThemeSettings to return false
      const mockMigrateThemeSettings = vi.spyOn(migrationUtils, 'migrateThemeSettings');
      mockMigrateThemeSettings.mockResolvedValueOnce(false);

      // Mock the other migrations to succeed
      const mockMigrateAccessibilitySettings = vi.spyOn(migrationUtils, 'migrateAccessibilitySettings');
      mockMigrateAccessibilitySettings.mockResolvedValueOnce(true);

      const mockMigrateLocaleSettings = vi.spyOn(migrationUtils, 'migrateLocaleSettings');
      mockMigrateLocaleSettings.mockResolvedValueOnce(true);

      const mockMigrateNavigationState = vi.spyOn(migrationUtils, 'migrateNavigationState');
      mockMigrateNavigationState.mockResolvedValueOnce(true);

      const mockMigrateClientId = vi.spyOn(migrationUtils, 'migrateClientId');
      mockMigrateClientId.mockResolvedValueOnce(true);

      const result = await runAllMigrations();

      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('indexedDB_migration_completed', 'true');

      // Clean up
      mockMigrateThemeSettings.mockRestore();
      mockMigrateAccessibilitySettings.mockRestore();
      mockMigrateLocaleSettings.mockRestore();
      mockMigrateNavigationState.mockRestore();
      mockMigrateClientId.mockRestore();
    });
  });
});
