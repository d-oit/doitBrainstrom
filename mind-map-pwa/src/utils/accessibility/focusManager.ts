// src/utils/accessibility/focusManager.ts

/**
 * Focus trap configuration
 */
export interface FocusTrapOptions {
  initialFocusElement?: HTMLElement | null;
  returnFocusElement?: HTMLElement | null;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

/**
 * Creates a focus trap within a container element
 * Ensures focus stays within the container and returns to a specified element when deactivated
 */
export const createFocusTrap = (
  containerElement: HTMLElement,
  options: FocusTrapOptions = {}
) => {
  // Find all focusable elements within the container
  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ];
    
    const elements = containerElement.querySelectorAll(focusableSelectors.join(','));
    return Array.from(elements).filter(
      el => !el.hasAttribute('disabled') && 
            el.getAttribute('tabindex') !== '-1' && 
            !el.hasAttribute('aria-hidden')
    ) as HTMLElement[];
  };
  
  // Track state
  let active = false;
  let lastFocusedElement: HTMLElement | null = null;
  
  // Event handlers
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!active) return;
    
    // Handle Escape key
    if (options.escapeDeactivates && event.key === 'Escape') {
      event.preventDefault();
      deactivate();
      return;
    }
    
    // Handle Tab key for focus trapping
    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Shift+Tab on first element should wrap to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } 
      // Tab on last element should wrap to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  const handleClick = (event: MouseEvent) => {
    if (!active || !options.clickOutsideDeactivates) return;
    
    // Check if click is outside the container
    if (containerElement && !containerElement.contains(event.target as Node)) {
      deactivate();
    }
  };
  
  // Activate the focus trap
  const activate = () => {
    if (active) return;
    
    // Store the currently focused element to restore later
    lastFocusedElement = document.activeElement as HTMLElement;
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    
    // Set initial focus
    if (options.initialFocusElement) {
      options.initialFocusElement.focus();
    } else {
      // Focus the first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
    
    active = true;
    
    // Call onActivate callback
    if (options.onActivate) {
      options.onActivate();
    }
  };
  
  // Deactivate the focus trap
  const deactivate = () => {
    if (!active) return;
    
    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleClick);
    
    // Restore focus to the element that had focus before activation
    // or to the specified return element
    const elementToFocus = options.returnFocusElement || lastFocusedElement;
    if (elementToFocus && typeof elementToFocus.focus === 'function') {
      elementToFocus.focus();
    }
    
    active = false;
    
    // Call onDeactivate callback
    if (options.onDeactivate) {
      options.onDeactivate();
    }
  };
  
  // Update the container element
  const updateContainerElement = (newContainer: HTMLElement) => {
    containerElement = newContainer;
  };
  
  // Public API
  return {
    activate,
    deactivate,
    updateContainerElement,
    isActive: () => active
  };
};

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Save the current focus state to restore later
   */
  saveFocus: (): HTMLElement | null => {
    return document.activeElement as HTMLElement;
  },
  
  /**
   * Restore focus to a previously saved element
   */
  restoreFocus: (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },
  
  /**
   * Focus the first focusable element within a container
   */
  focusFirstElement: (container: HTMLElement): boolean => {
    const focusableElements = focusManager.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  },
  
  /**
   * Focus the last focusable element within a container
   */
  focusLastElement: (container: HTMLElement): boolean => {
    const focusableElements = focusManager.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  },
  
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ];
    
    const elements = container.querySelectorAll(focusableSelectors.join(','));
    return Array.from(elements).filter(
      el => !el.hasAttribute('disabled') && 
            el.getAttribute('tabindex') !== '-1' && 
            !el.hasAttribute('aria-hidden') &&
            isElementVisible(el as HTMLElement)
    ) as HTMLElement[];
  },
  
  /**
   * Create a skip link for keyboard navigation
   */
  createSkipLink: (targetId: string, label: string): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = label;
    
    // Style the skip link to be visually hidden until focused
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '0';
    skipLink.style.padding = '8px';
    skipLink.style.zIndex = '9999';
    skipLink.style.backgroundColor = '#000';
    skipLink.style.color = '#fff';
    skipLink.style.textDecoration = 'none';
    skipLink.style.transition = 'top 0.2s ease-in-out';
    
    // Show the skip link when it receives focus
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    
    // Hide the skip link when it loses focus
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    return skipLink;
  }
};

/**
 * Check if an element is visible
 */
const isElementVisible = (element: HTMLElement): boolean => {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
};
