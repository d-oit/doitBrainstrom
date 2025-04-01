// src/components/accessibility/FocusIndicator.tsx
import React, { useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTheme } from '../../contexts/ThemeContext';

// Styled component for the focus indicator
const FocusIndicatorContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 9999,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.15s ease-out',
  boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
  '&.high-contrast': {
    boxShadow: `0 0 0 3px ${theme.palette.secondary.main}, 0 0 0 6px ${theme.palette.primary.main}`,
  },
  '&.reduced-motion': {
    transition: 'none',
  }
}));

/**
 * FocusIndicator component
 * Creates a visual indicator that follows the focused element
 * Enhances keyboard navigation by making the current focus clearly visible
 */
const FocusIndicator: React.FC = () => {
  const { isHighContrastActive, isReducedMotionActive } = useAccessibility();
  const { mode } = useTheme();
  
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [visible, setVisible] = useState(false);
  
  // Track focus changes
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip if the target is the body or document
      if (target === document.body || target === document) {
        setVisible(false);
        return;
      }
      
      // Skip if the target already has a visible outline
      const computedStyle = window.getComputedStyle(target);
      const hasVisibleOutline = 
        computedStyle.outlineStyle !== 'none' && 
        computedStyle.outlineWidth !== '0px' &&
        computedStyle.outlineColor !== 'transparent';
      
      if (hasVisibleOutline) {
        setVisible(false);
        return;
      }
      
      // Update the focused element
      setFocusedElement(target);
      setVisible(true);
      
      // Update position
      updatePosition(target);
    };
    
    const handleFocusOut = () => {
      setVisible(false);
    };
    
    // Update position when window is resized
    const handleResize = () => {
      if (focusedElement) {
        updatePosition(focusedElement);
      }
    };
    
    // Update position when window is scrolled
    const handleScroll = () => {
      if (focusedElement) {
        updatePosition(focusedElement);
      }
    };
    
    // Update position of the focus indicator
    const updatePosition = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      
      setPosition({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      });
    };
    
    // Add event listeners
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [focusedElement]);
  
  // Don't render if not visible
  if (!visible) {
    return null;
  }
  
  return (
    <FocusIndicatorContainer
      className={`
        focus-indicator
        ${isHighContrastActive ? 'high-contrast' : ''}
        ${isReducedMotionActive ? 'reduced-motion' : ''}
        ${mode === 'dark' ? 'dark-mode' : ''}
      `}
      sx={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
      }}
      aria-hidden="true"
    />
  );
};

export default FocusIndicator;
