// src/utils/accessibility/liveRegion.ts

/**
 * Live region types
 * - polite: Announces when the user is idle
 * - assertive: Announces immediately, interrupting current speech
 * - off: Does not announce (useful for temporarily disabling announcements)
 */
export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

/**
 * Live region options
 */
export interface LiveRegionOptions {
  politeness?: LiveRegionPoliteness;
  timeout?: number; // Time in ms before clearing the announcement
  clearAfterAnnouncement?: boolean; // Whether to clear after timeout
  role?: 'status' | 'alert' | 'log'; // ARIA role for the live region
}

/**
 * Default options for live regions
 */
const defaultOptions: LiveRegionOptions = {
  politeness: 'polite',
  timeout: 5000,
  clearAfterAnnouncement: true,
  role: 'status'
};

/**
 * Creates a live region for screen reader announcements
 */
export const createLiveRegion = (options: LiveRegionOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  let liveRegionElement: HTMLElement | null = null;
  let clearTimeoutId: number | null = null;
  
  /**
   * Initialize the live region element
   */
  const initialize = (): HTMLElement => {
    if (liveRegionElement) return liveRegionElement;
    
    // Create the live region element
    liveRegionElement = document.createElement('div');
    
    // Set attributes for screen readers
    liveRegionElement.setAttribute('aria-live', mergedOptions.politeness || 'polite');
    liveRegionElement.setAttribute('role', mergedOptions.role || 'status');
    liveRegionElement.setAttribute('aria-atomic', 'true');
    
    // Style the element to be visually hidden but accessible to screen readers
    liveRegionElement.style.position = 'absolute';
    liveRegionElement.style.width = '1px';
    liveRegionElement.style.height = '1px';
    liveRegionElement.style.padding = '0';
    liveRegionElement.style.margin = '-1px';
    liveRegionElement.style.overflow = 'hidden';
    liveRegionElement.style.clip = 'rect(0, 0, 0, 0)';
    liveRegionElement.style.whiteSpace = 'nowrap';
    liveRegionElement.style.border = '0';
    
    // Add to the DOM
    document.body.appendChild(liveRegionElement);
    
    return liveRegionElement;
  };
  
  /**
   * Announce a message to screen readers
   */
  const announce = (message: string, announcementOptions: LiveRegionOptions = {}): void => {
    // Initialize if not already done
    const element = initialize();
    
    // Merge options
    const options = { ...mergedOptions, ...announcementOptions };
    
    // Update politeness if changed
    if (options.politeness !== element.getAttribute('aria-live')) {
      element.setAttribute('aria-live', options.politeness || 'polite');
    }
    
    // Update role if changed
    if (options.role !== element.getAttribute('role')) {
      element.setAttribute('role', options.role || 'status');
    }
    
    // Clear any existing timeout
    if (clearTimeoutId !== null) {
      window.clearTimeout(clearTimeoutId);
      clearTimeoutId = null;
    }
    
    // Set the message
    element.textContent = message;
    
    // Clear after timeout if specified
    if (options.clearAfterAnnouncement && options.timeout) {
      clearTimeoutId = window.setTimeout(() => {
        if (element) {
          element.textContent = '';
        }
        clearTimeoutId = null;
      }, options.timeout);
    }
  };
  
  /**
   * Clear the live region
   */
  const clear = (): void => {
    if (liveRegionElement) {
      liveRegionElement.textContent = '';
    }
    
    if (clearTimeoutId !== null) {
      window.clearTimeout(clearTimeoutId);
      clearTimeoutId = null;
    }
  };
  
  /**
   * Update the live region options
   */
  const updateOptions = (newOptions: LiveRegionOptions): void => {
    Object.assign(mergedOptions, newOptions);
    
    if (liveRegionElement) {
      if (newOptions.politeness) {
        liveRegionElement.setAttribute('aria-live', newOptions.politeness);
      }
      
      if (newOptions.role) {
        liveRegionElement.setAttribute('role', newOptions.role);
      }
    }
  };
  
  /**
   * Destroy the live region
   */
  const destroy = (): void => {
    if (liveRegionElement && liveRegionElement.parentNode) {
      liveRegionElement.parentNode.removeChild(liveRegionElement);
      liveRegionElement = null;
    }
    
    if (clearTimeoutId !== null) {
      window.clearTimeout(clearTimeoutId);
      clearTimeoutId = null;
    }
  };
  
  return {
    announce,
    clear,
    updateOptions,
    destroy,
    getElement: () => liveRegionElement
  };
};

/**
 * Global live region instances for common use cases
 */
let globalPoliteRegion: ReturnType<typeof createLiveRegion> | null = null;
let globalAssertiveRegion: ReturnType<typeof createLiveRegion> | null = null;

/**
 * Get or create the global polite live region
 */
export const getPoliteAnnouncer = (): ReturnType<typeof createLiveRegion> => {
  if (!globalPoliteRegion) {
    globalPoliteRegion = createLiveRegion({ politeness: 'polite' });
  }
  return globalPoliteRegion;
};

/**
 * Get or create the global assertive live region
 */
export const getAssertiveAnnouncer = (): ReturnType<typeof createLiveRegion> => {
  if (!globalAssertiveRegion) {
    globalAssertiveRegion = createLiveRegion({ politeness: 'assertive' });
  }
  return globalAssertiveRegion;
};

/**
 * Announce a message politely (when the user is idle)
 */
export const announcePolite = (message: string, options: Omit<LiveRegionOptions, 'politeness'> = {}): void => {
  getPoliteAnnouncer().announce(message, { ...options, politeness: 'polite' });
};

/**
 * Announce a message assertively (immediately, interrupting current speech)
 */
export const announceAssertive = (message: string, options: Omit<LiveRegionOptions, 'politeness'> = {}): void => {
  getAssertiveAnnouncer().announce(message, { ...options, politeness: 'assertive' });
};

/**
 * Clear all global live regions
 */
export const clearAnnouncements = (): void => {
  if (globalPoliteRegion) {
    globalPoliteRegion.clear();
  }
  
  if (globalAssertiveRegion) {
    globalAssertiveRegion.clear();
  }
};
