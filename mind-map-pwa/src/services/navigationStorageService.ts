// src/services/navigationStorageService.ts
import { saveDrawerState, loadDrawerState, saveTabState, loadTabState } from './appStateService';
import { logError } from '../utils/logger';

// Storage keys
const DRAWER_OPEN_KEY = 'doitBrainstorm.navigationState.drawerOpen';
const DRAWER_COLLAPSED_KEY = 'doitBrainstorm.navigationState.drawerCollapsed';

/**
 * Get the drawer state from IndexedDB with localStorage fallback
 * @returns boolean - The drawer state (open or closed)
 */
export const getDrawerState = (): boolean => {
  try {
    // For backward compatibility, still try localStorage first
    const storedState = localStorage.getItem(DRAWER_OPEN_KEY);

    // Return the stored state or default based on screen size
    return storedState !== null
      ? JSON.parse(storedState)
      : window.innerWidth >= 600;
  } catch (error) {
    console.error('Error getting drawer state from localStorage:', error);
    // Fallback to default based on screen size
    return window.innerWidth >= 600;
  }
};

/**
 * Get the drawer collapsed state from localStorage
 * @returns boolean - The drawer collapsed state (collapsed or expanded)
 */
export const getDrawerCollapsedState = (): boolean => {
  try {
    const storedState = localStorage.getItem(DRAWER_COLLAPSED_KEY);

    // Return the stored state or default to false (expanded)
    return storedState !== null
      ? JSON.parse(storedState)
      : false;
  } catch (error) {
    console.error('Error getting drawer collapsed state from localStorage:', error);
    // Fallback to false (expanded)
    return false;
  }
};

/**
 * Set the drawer state in IndexedDB with localStorage fallback
 * @param isOpen boolean - The drawer state to save
 */
export const setDrawerState = (isOpen: boolean): void => {
  try {
    // For backward compatibility, still save to localStorage
    localStorage.setItem(DRAWER_OPEN_KEY, JSON.stringify(isOpen));

    // Also save to IndexedDB
    saveDrawerState(isOpen).catch(error => {
      console.error('Error saving drawer state to IndexedDB:', error);
    });
  } catch (error) {
    console.error('Error setting drawer state:', error);
  }
};

/**
 * Set the drawer collapsed state in localStorage
 * @param isCollapsed boolean - The drawer collapsed state to save
 */
export const setDrawerCollapsedState = (isCollapsed: boolean): void => {
  try {
    localStorage.setItem(DRAWER_COLLAPSED_KEY, JSON.stringify(isCollapsed));
  } catch (error) {
    console.error('Error setting drawer collapsed state:', error);
  }
};

/**
 * Get the drawer state asynchronously from IndexedDB
 * @returns Promise<boolean> - The drawer state (open or closed)
 */
export const getDrawerStateAsync = async (): Promise<boolean> => {
  try {
    return await loadDrawerState();
  } catch (error) {
    logError('Error getting drawer state from IndexedDB:', error);
    return getDrawerState(); // Fall back to synchronous method
  }
};

/**
 * Get the tab state asynchronously from IndexedDB
 * @returns Promise<number> - The active tab index
 */
export const getTabStateAsync = async (): Promise<number> => {
  try {
    return await loadTabState();
  } catch (error) {
    logError('Error getting tab state from IndexedDB:', error);

    // Try localStorage as fallback
    try {
      const storedState = localStorage.getItem('doitBrainstorm.navigationState.activeTab');
      return storedState !== null ? JSON.parse(storedState) : 0;
    } catch (localStorageError) {
      logError('Error getting tab state from localStorage:', localStorageError);
      return 0; // Default to first tab
    }
  }
};

/**
 * Set the tab state in IndexedDB
 * @param tabIndex number - The active tab index
 */
export const setTabState = (tabIndex: number): void => {
  try {
    // For backward compatibility, still save to localStorage
    localStorage.setItem('doitBrainstorm.navigationState.activeTab', JSON.stringify(tabIndex));

    // Also save to IndexedDB
    saveTabState(tabIndex).catch(error => {
      console.error('Error saving tab state to IndexedDB:', error);
    });
  } catch (error) {
    console.error('Error setting tab state:', error);
  }
};