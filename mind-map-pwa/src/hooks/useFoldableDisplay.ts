// src/hooks/useFoldableDisplay.ts
import { useState, useEffect } from 'react';

export interface FoldableDisplayStatus {
  isFoldable: boolean;
  isSpanned: boolean;
  foldSize: number | null;
  foldAngle: number | null;
  spanDirection: 'horizontal' | 'vertical' | null;
  screenSegments: any[] | null;
}

/**
 * Custom hook for detecting and adapting to foldable displays
 * Returns the current foldable display status
 */
export const useFoldableDisplay = (): FoldableDisplayStatus => {
  const [status, setStatus] = useState<FoldableDisplayStatus>({
    isFoldable: false,
    isSpanned: false,
    foldSize: null,
    foldAngle: null,
    spanDirection: null,
    screenSegments: null
  });

  useEffect(() => {
    // Update foldable display status
    const updateFoldableStatus = () => {
      // Check for the Window Segments API
      const windowSegments = (window as any).getWindowSegments?.() || null;
      
      // Check for CSS Spanning API
      const cssSpanning = (window as any).visualViewport?.segments || null;
      
      // Check for Foldable Device API
      const foldableDevice = (window as any).foldableDevice || null;
      
      // Determine if the device is foldable and if it's currently spanned
      const isFoldable = !!(windowSegments || cssSpanning || foldableDevice);
      let isSpanned = false;
      let spanDirection: 'horizontal' | 'vertical' | null = null;
      let foldSize: number | null = null;
      let foldAngle: number | null = null;
      let screenSegments: any[] | null = null;
      
      if (windowSegments && windowSegments.length > 1) {
        isSpanned = true;
        screenSegments = windowSegments;
        
        // Determine span direction
        const segment0 = windowSegments[0];
        const segment1 = windowSegments[1];
        
        if (segment0.top === segment1.top) {
          spanDirection = 'horizontal';
        } else if (segment0.left === segment1.left) {
          spanDirection = 'vertical';
        }
        
        // Calculate fold size (gap between segments)
        if (spanDirection === 'horizontal') {
          foldSize = segment1.left - (segment0.left + segment0.width);
        } else if (spanDirection === 'vertical') {
          foldSize = segment1.top - (segment0.top + segment0.height);
        }
      } else if (cssSpanning && cssSpanning.length > 1) {
        isSpanned = true;
        screenSegments = cssSpanning;
        
        // Similar logic for CSS Spanning API
        // Implementation would depend on the exact API structure
      } else if (foldableDevice) {
        isSpanned = foldableDevice.isSpanned || false;
        foldAngle = foldableDevice.foldAngle || null;
        spanDirection = foldableDevice.spanDirection || null;
      }
      
      setStatus({
        isFoldable,
        isSpanned,
        foldSize,
        foldAngle,
        spanDirection,
        screenSegments
      });
    };

    // Initial update
    updateFoldableStatus();

    // Add event listeners for screen change events
    window.addEventListener('resize', updateFoldableStatus);
    
    // Add specific event listeners if available
    if ((window as any).screen?.addEventListener) {
      (window as any).screen.addEventListener('change', updateFoldableStatus);
    }
    if ((window as any).visualViewport?.addEventListener) {
      (window as any).visualViewport.addEventListener('resize', updateFoldableStatus);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateFoldableStatus);
      
      if ((window as any).screen?.removeEventListener) {
        (window as any).screen.removeEventListener('change', updateFoldableStatus);
      }
      if ((window as any).visualViewport?.removeEventListener) {
        (window as any).visualViewport.removeEventListener('resize', updateFoldableStatus);
      }
    };
  }, []);

  return status;
};

export default useFoldableDisplay;
