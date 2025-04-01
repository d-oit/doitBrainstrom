// src/utils/accessibility/keyboardNavigation.ts

/**
 * Keyboard shortcut configuration
 * Maps keyboard shortcuts to action names
 */
export interface KeyboardShortcut {
  key: string;          // Key name (e.g., 'a', 'ArrowUp', 'F1')
  ctrlKey?: boolean;    // Whether Ctrl key is required
  shiftKey?: boolean;   // Whether Shift key is required
  altKey?: boolean;     // Whether Alt key is required
  metaKey?: boolean;    // Whether Meta key (Command on Mac) is required
  preventDefault?: boolean; // Whether to prevent default browser behavior
  stopPropagation?: boolean; // Whether to stop event propagation
  description: string;  // Human-readable description of the shortcut
  group?: string;       // Group for organizing shortcuts in help dialogs
  action?: string;      // Action identifier (used internally)
}

/**
 * Keyboard shortcuts registry
 * Maps action names to keyboard shortcuts
 */
export interface KeyboardShortcutsMap {
  [actionName: string]: KeyboardShortcut;
}

/**
 * Default keyboard shortcuts for the application
 */
export const defaultKeyboardShortcuts: KeyboardShortcutsMap = {
  // Global shortcuts
  'help': {
    key: '?',
    shiftKey: true,
    description: 'Show keyboard shortcuts help',
    group: 'Global',
    preventDefault: true
  },
  'toggleTheme': {
    key: 'd',
    ctrlKey: true,
    shiftKey: true,
    description: 'Toggle between light and dark theme',
    group: 'Global',
    preventDefault: true
  },
  'toggleHighContrast': {
    key: 'h',
    ctrlKey: true,
    shiftKey: true,
    description: 'Toggle high contrast mode',
    group: 'Global',
    preventDefault: true
  },
  'skipToContent': {
    key: '/',
    altKey: true,
    description: 'Skip to main content',
    group: 'Navigation',
    preventDefault: true
  },
  'skipToNavigation': {
    key: 'n',
    altKey: true,
    description: 'Skip to navigation',
    group: 'Navigation',
    preventDefault: true
  },

  // Mind map shortcuts
  'addNode': {
    key: 'a',
    description: 'Add a new node',
    group: 'Mind Map',
    preventDefault: true
  },
  'deleteNode': {
    key: 'Delete',
    description: 'Delete selected node',
    group: 'Mind Map',
    preventDefault: true
  },
  'editNode': {
    key: 'e',
    description: 'Edit selected node',
    group: 'Mind Map',
    preventDefault: true
  },
  'connectNodes': {
    key: 'c',
    description: 'Connect selected nodes',
    group: 'Mind Map',
    preventDefault: true
  },
  'selectAll': {
    key: 'a',
    ctrlKey: true,
    description: 'Select all nodes',
    group: 'Mind Map',
    preventDefault: true
  },
  'undo': {
    key: 'z',
    ctrlKey: true,
    description: 'Undo last action',
    group: 'Mind Map',
    preventDefault: true
  },
  'redo': {
    key: 'y',
    ctrlKey: true,
    description: 'Redo last undone action',
    group: 'Mind Map',
    preventDefault: true
  },
  'zoomIn': {
    key: '+',
    description: 'Zoom in',
    group: 'Mind Map',
    preventDefault: true
  },
  'zoomOut': {
    key: '-',
    description: 'Zoom out',
    group: 'Mind Map',
    preventDefault: true
  },
  'resetZoom': {
    key: '0',
    ctrlKey: true,
    description: 'Reset zoom level',
    group: 'Mind Map',
    preventDefault: true
  },
  'centerView': {
    key: 'Home',
    description: 'Center the view',
    group: 'Mind Map',
    preventDefault: true
  },

  // Navigation within mind map
  'moveUp': {
    key: 'ArrowUp',
    description: 'Move selection up',
    group: 'Navigation',
    preventDefault: true
  },
  'moveDown': {
    key: 'ArrowDown',
    description: 'Move selection down',
    group: 'Navigation',
    preventDefault: true
  },
  'moveLeft': {
    key: 'ArrowLeft',
    description: 'Move selection left',
    group: 'Navigation',
    preventDefault: true
  },
  'moveRight': {
    key: 'ArrowRight',
    description: 'Move selection right',
    group: 'Navigation',
    preventDefault: true
  },

  // Sync shortcuts
  'syncNow': {
    key: 's',
    ctrlKey: true,
    shiftKey: true,
    description: 'Sync now',
    group: 'Sync',
    preventDefault: true
  }
};

/**
 * Check if a keyboard event matches a shortcut
 */
export const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  return (
    event.key === shortcut.key &&
    !!event.ctrlKey === !!shortcut.ctrlKey &&
    !!event.shiftKey === !!shortcut.shiftKey &&
    !!event.altKey === !!shortcut.altKey &&
    !!event.metaKey === !!shortcut.metaKey
  );
};

/**
 * Format a keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Meta');

  // Format special keys for better readability
  let key = shortcut.key;
  switch (key) {
    case ' ': key = 'Space'; break;
    case 'ArrowUp': key = '↑'; break;
    case 'ArrowDown': key = '↓'; break;
    case 'ArrowLeft': key = '←'; break;
    case 'ArrowRight': key = '→'; break;
    case 'Delete': key = 'Del'; break;
    case 'Escape': key = 'Esc'; break;
    default: break;
  }

  parts.push(key);

  return parts.join(' + ');
};

/**
 * Get all shortcuts for a specific group
 */
export const getShortcutsByGroup = (shortcuts: KeyboardShortcutsMap): Record<string, KeyboardShortcut[]> => {
  const groups: Record<string, KeyboardShortcut[]> = {};

  Object.entries(shortcuts).forEach(([action, shortcut]) => {
    const group = shortcut.group || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push({ ...shortcut, action });
  });

  return groups;
};

/**
 * Create a keyboard event handler for a component
 */
export const createKeyboardHandler = (
  shortcuts: KeyboardShortcutsMap,
  handlers: { [actionName: string]: () => void },
  isEnabled: boolean = true
) => {
  return (event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Check if the event target is an input element
    const target = event.target as HTMLElement;
    const isInputElement =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // Skip handling if the event is from an input element (unless it's Escape)
    if (isInputElement && event.key !== 'Escape') return;

    // Check each shortcut
    for (const [action, shortcut] of Object.entries(shortcuts)) {
      if (matchesShortcut(event, shortcut)) {
        // Prevent default browser behavior if specified
        if (shortcut.preventDefault) {
          event.preventDefault();
        }

        // Stop event propagation if specified
        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }

        // Call the handler if it exists
        if (handlers[action]) {
          handlers[action]();
          return;
        }
      }
    }
  };
};
