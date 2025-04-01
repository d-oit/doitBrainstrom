// src/components/accessibility/AccessibilityProvider.tsx
import React, { ReactNode } from 'react';
import { AccessibilityContextProvider } from '../../contexts/AccessibilityContext';
import KeyboardListener from './KeyboardListener';
import FocusIndicator from './FocusIndicator';
import SkipLinks from './SkipLinks';
import ColorBlindnessFilters from './ColorBlindnessFilters';

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * AccessibilityProvider component
 * Wraps the application with accessibility features and context
 */
const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  return (
    <AccessibilityContextProvider>
      {/* Skip links for keyboard navigation */}
      <SkipLinks />
      
      {/* SVG filters for color blindness simulation */}
      <ColorBlindnessFilters />
      
      {/* Keyboard shortcuts listener */}
      <KeyboardListener />
      
      {/* Focus indicator for keyboard navigation */}
      <FocusIndicator />
      
      {/* Live regions for screen reader announcements are created by the context */}
      
      {/* Application content */}
      {children}
    </AccessibilityContextProvider>
  );
};

export default AccessibilityProvider;
