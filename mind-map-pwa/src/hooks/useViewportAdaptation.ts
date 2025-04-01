// src/hooks/useViewportAdaptation.ts
import { useState, useEffect } from 'react';
import { Breakpoint, breakpoints, DeviceCategory, deviceLayouts } from '../styles/breakpoints';

export interface ViewportConfig {
  breakpoint: Breakpoint;
  deviceCategory: DeviceCategory;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWidescreen: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  pixelRatio: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  layout: typeof deviceLayouts.mobile | typeof deviceLayouts.tablet | typeof deviceLayouts.desktop | typeof deviceLayouts.widescreen;
}

/**
 * Custom hook for viewport adaptation
 * Returns the current breakpoint and other viewport information
 */
export const useViewportAdaptation = (): ViewportConfig => {
  const [config, setConfig] = useState<ViewportConfig>({
    breakpoint: 'xl',
    deviceCategory: 'widescreen',
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isWidescreen: true,
    isLandscape: true,
    isPortrait: false,
    pixelRatio: window.devicePixelRatio || 1,
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    layout: deviceLayouts.widescreen
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const pixelRatio = window.devicePixelRatio || 1;

      // Determine breakpoint based on Material UI v7 breakpoints
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

      // Determine device category based on breakpoints
      let deviceCategory: DeviceCategory = 'mobile';
      if (width >= breakpoints.lg) {
        deviceCategory = 'widescreen';
      } else if (width >= breakpoints.md) {
        deviceCategory = 'desktop';
      } else if (width >= breakpoints.sm) {
        deviceCategory = 'tablet';
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
        deviceCategory,
        isMobile: deviceCategory === 'mobile',
        isTablet: deviceCategory === 'tablet',
        isDesktop: deviceCategory === 'desktop',
        isWidescreen: deviceCategory === 'widescreen',
        isLandscape,
        isPortrait: !isLandscape,
        pixelRatio,
        safeAreaInsets,
        layout: deviceLayouts[deviceCategory]
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
