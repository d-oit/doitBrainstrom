// src/components/accessibility/KeyboardListener.tsx
import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTheme } from '../../contexts/ThemeContext';
import { matchesShortcut } from '../../utils/accessibility/keyboardNavigation';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

/**
 * KeyboardListener component
 * Listens for global keyboard shortcuts and executes the corresponding actions
 */
const KeyboardListener: React.FC = () => {
  const { keyboardShortcuts, settings, updateSettings } = useAccessibility();
  const { mode, setMode } = useTheme();
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  
  // Handle keyboard events
  useEffect(() => {
    // Skip if keyboard navigation is disabled
    if (!settings.keyboardNavigation) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if the event target is an input element
      const target = event.target as HTMLElement;
      const isInputElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
      
      // Skip handling if the event is from an input element (unless it's Escape)
      if (isInputElement && event.key !== 'Escape') return;
      
      // Check for help shortcut
      if (matchesShortcut(event, keyboardShortcuts['help'])) {
        event.preventDefault();
        setShortcutsHelpOpen(true);
        return;
      }
      
      // Check for theme toggle shortcut
      if (matchesShortcut(event, keyboardShortcuts['toggleTheme'])) {
        event.preventDefault();
        setMode(mode === 'light' ? 'dark' : 'light');
        return;
      }
      
      // Check for high contrast toggle shortcut
      if (matchesShortcut(event, keyboardShortcuts['toggleHighContrast'])) {
        event.preventDefault();
        updateSettings({ highContrast: !settings.highContrast });
        if (!settings.highContrast) {
          setMode('high-contrast');
        } else if (mode === 'high-contrast') {
          setMode('light');
        }
        return;
      }
      
      // Check for skip to content shortcut
      if (matchesShortcut(event, keyboardShortcuts['skipToContent'])) {
        event.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView();
        }
        return;
      }
      
      // Check for skip to navigation shortcut
      if (matchesShortcut(event, keyboardShortcuts['skipToNavigation'])) {
        event.preventDefault();
        const navigation = document.getElementById('navigation');
        if (navigation) {
          navigation.focus();
          navigation.scrollIntoView();
        }
        return;
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardShortcuts, settings.keyboardNavigation, mode, setMode, settings.highContrast, updateSettings]);
  
  return (
    <>
      <KeyboardShortcutsHelp
        open={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
    </>
  );
};

export default KeyboardListener;
