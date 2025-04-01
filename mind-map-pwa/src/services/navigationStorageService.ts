// src/services/navigationStorageService.ts

const STORAGE_KEY = 'doitBrainstorm.navigationState.drawerOpen';

/**
 * Get the drawer state from localStorage
 * @returns boolean - The drawer state (open or closed)
 */
export const getDrawerState = (): boolean => {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    
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
 * Set the drawer state in localStorage
 * @param isOpen boolean - The drawer state to save
 */
export const setDrawerState = (isOpen: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen));
  } catch (error) {
    console.error('Error setting drawer state in localStorage:', error);
  }
};