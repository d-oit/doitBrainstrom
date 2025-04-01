// src/hooks/useViewportAdaptation.ts
import { useState, useEffect } from 'react';
import { Breakpoint, breakpoints } from '../styles/breakpoints';

export interface ViewportConfig {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Custom hook for viewport adaptation
 * Returns the current breakpoint and other viewport information
 */
export const useViewportAdaptation = (): ViewportConfig => {
  const [config, setConfig] = useState<ViewportConfig>({
    breakpoint: 'xl',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: true,
    isPortrait: false,
    pixelRatio: window.devicePixelRatio || 1,
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const pixelRatio = window.devicePixelRatio || 1;

      // Determine breakpoint based on Material UI v6 breakpoints
      let breakpoint: Breakpoint = 'xs';
      if (width >= breakpoints.xl) {
        breakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        breakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        breakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        breakpoint = 'sm';
      }

      // Get safe area insets if available (for notches, etc.)
      const safeAreaInsets = {
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0', 10),
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0', 10),
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0', 10)
      };

      setConfig({
        breakpoint,
        isMobile: breakpoint === 'xs' || breakpoint === 'sm',
        isTablet: breakpoint === 'md',
        isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
        isLandscape,
        isPortrait: !isLandscape,
        pixelRatio,
        safeAreaInsets
      });
    };

    // Initial update
    updateConfig();

    // Add event listeners for resize and orientation change
    window.addEventListener('resize', updateConfig);
    window.addEventListener('orientationchange', updateConfig);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateConfig);
      window.removeEventListener('orientationchange', updateConfig);
    };
  }, []);

  return config;
};

export default useViewportAdaptation;
