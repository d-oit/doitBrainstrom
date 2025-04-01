// src/services/appStateService.ts
import { logInfo, logError, logWarn } from '../utils/logger';
import { saveAppState, getAppState } from '../utils/indexedDB/dbService';
import { AppStateRecord } from '../utils/indexedDB/config';

/**
 * Save drawer state to IndexedDB
 * @param isOpen Whether the drawer is open
 */
export const saveDrawerState = async (isOpen: boolean): Promise<boolean> => {
  try {
    logInfo('Saving drawer state to IndexedDB');
    
    const stateRecord: AppStateRecord = {
      id: 'navigation.drawerOpen',
      category: 'navigation',
      data: { drawerOpen: isOpen },
      lastModified: new Date().toISOString()
    };
    
    return await saveAppState(stateRecord);
  } catch (error) {
    logError('Error saving drawer state to IndexedDB:', error);
    
    // Fallback to localStorage
    try {
      localStorage.setItem('doitBrainstorm.navigationState.drawerOpen', JSON.stringify(isOpen));
      logWarn('Saved drawer state to localStorage as fallback');
      return true;
    } catch (localStorageError) {
      logError('Error saving drawer state to localStorage:', localStorageError);
      return false;
    }
  }
};

/**
 * Load drawer state from IndexedDB
 * @returns Whether the drawer is open or default state if not found
 */
export const loadDrawerState = async (): Promise<boolean> => {
  try {
    logInfo('Loading drawer state from IndexedDB');
    
    const stateRecord = await getAppState('navigation.drawerOpen');
    
    if (stateRecord && stateRecord.data && stateRecord.data.drawerOpen !== undefined) {
      logInfo('Drawer state loaded from IndexedDB');
      return stateRecord.data.drawerOpen;
    }
    
    // If not found in IndexedDB, try localStorage
    logInfo('Drawer state not found in IndexedDB, trying localStorage');
    const localStorageState = localStorage.getItem('doitBrainstorm.navigationState.drawerOpen');
    
    if (localStorageState !== null) {
      const parsedState = JSON.parse(localStorageState);
      logInfo('Drawer state loaded from localStorage');
      
      // Save to IndexedDB for next time
      await saveDrawerState(parsedState);
      
      return parsedState;
    }
    
    // Return default state if not found anywhere
    logInfo('No drawer state found, using default based on screen size');
    return window.innerWidth >= 600;
  } catch (error) {
    logError('Error loading drawer state from IndexedDB:', error);
    
    // Fallback to localStorage
    try {
      const localStorageState = localStorage.getItem('doitBrainstorm.navigationState.drawerOpen');
      
      if (localStorageState !== null) {
        logWarn('Loaded drawer state from localStorage as fallback');
        return JSON.parse(localStorageState);
      }
    } catch (localStorageError) {
      logError('Error loading drawer state from localStorage:', localStorageError);
    }
    
    // Return default state if all else fails
    return window.innerWidth >= 600;
  }
};

/**
 * Save tab state to IndexedDB
 * @param tabIndex The active tab index
 */
export const saveTabState = async (tabIndex: number): Promise<boolean> => {
  try {
    logInfo('Saving tab state to IndexedDB');
    
    const stateRecord: AppStateRecord = {
      id: 'navigation.activeTab',
      category: 'navigation',
      data: { activeTab: tabIndex },
      lastModified: new Date().toISOString()
    };
    
    return await saveAppState(stateRecord);
  } catch (error) {
    logError('Error saving tab state to IndexedDB:', error);
    
    // Fallback to localStorage
    try {
      localStorage.setItem('doitBrainstorm.navigationState.activeTab', JSON.stringify(tabIndex));
      logWarn('Saved tab state to localStorage as fallback');
      return true;
    } catch (localStorageError) {
      logError('Error saving tab state to localStorage:', localStorageError);
      return false;
    }
  }
};

/**
 * Load tab state from IndexedDB
 * @returns The active tab index or default (0) if not found
 */
export const loadTabState = async (): Promise<number> => {
  try {
    logInfo('Loading tab state from IndexedDB');
    
    const stateRecord = await getAppState('navigation.activeTab');
    
    if (stateRecord && stateRecord.data && stateRecord.data.activeTab !== undefined) {
      logInfo('Tab state loaded from IndexedDB');
      return stateRecord.data.activeTab;
    }
    
    // If not found in IndexedDB, try localStorage
    logInfo('Tab state not found in IndexedDB, trying localStorage');
    const localStorageState = localStorage.getItem('doitBrainstorm.navigationState.activeTab');
    
    if (localStorageState !== null) {
      const parsedState = JSON.parse(localStorageState);
      logInfo('Tab state loaded from localStorage');
      
      // Save to IndexedDB for next time
      await saveTabState(parsedState);
      
      return parsedState;
    }
    
    // Return default state if not found anywhere
    logInfo('No tab state found, using default (0)');
    return 0;
  } catch (error) {
    logError('Error loading tab state from IndexedDB:', error);
    
    // Fallback to localStorage
    try {
      const localStorageState = localStorage.getItem('doitBrainstorm.navigationState.activeTab');
      
      if (localStorageState !== null) {
        logWarn('Loaded tab state from localStorage as fallback');
        return JSON.parse(localStorageState);
      }
    } catch (localStorageError) {
      logError('Error loading tab state from localStorage:', localStorageError);
    }
    
    // Return default state if all else fails
    return 0;
  }
};
