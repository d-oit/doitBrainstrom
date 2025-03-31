// src/hooks/useViewportAdaptation.ts
import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ViewportConfig {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  pixelRatio: number;
}

/**
 * Custom hook for viewport adaptation
 * Returns the current breakpoint and other viewport information
 */
export const useViewportAdaptation = (): ViewportConfig => {
  const [config, setConfig] = useState<ViewportConfig>({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: true,
    isPortrait: false,
    pixelRatio: window.devicePixelRatio || 1
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const pixelRatio = window.devicePixelRatio || 1;
      
      let breakpoint: Breakpoint;
      if (width >= 1440) {
        breakpoint = 'desktop';
      } else if (width >= 768) {
        breakpoint = 'tablet';
      } else {
        breakpoint = 'mobile';
      }

      setConfig({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        isLandscape,
        isPortrait: !isLandscape,
        pixelRatio
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
