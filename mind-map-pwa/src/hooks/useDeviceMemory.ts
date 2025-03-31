// src/hooks/useDeviceMemory.ts
import { useState, useEffect } from 'react';

export interface MemoryStatus {
  deviceMemory: number | null;
  jsHeapSizeLimit: number | null;
  totalJSHeapSize: number | null;
  usedJSHeapSize: number | null;
  lowMemoryMode: boolean;
}

/**
 * Custom hook for monitoring device memory
 * Returns the current memory status information
 */
export const useDeviceMemory = (): MemoryStatus => {
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus>({
    deviceMemory: null,
    jsHeapSizeLimit: null,
    totalJSHeapSize: null,
    usedJSHeapSize: null,
    lowMemoryMode: false
  });

  useEffect(() => {
    // Update memory status
    const updateMemoryStatus = () => {
      // Get device memory if available
      const deviceMemory = (navigator as any).deviceMemory || null;
      
      // Get performance memory if available (Chrome only)
      const performanceMemory = (performance as any).memory || null;
      
      // Determine if we're in low memory mode
      // Consider low memory if device has less than 2GB RAM or heap is >90% used
      let lowMemoryMode = false;
      
      if (deviceMemory !== null && deviceMemory < 2) {
        lowMemoryMode = true;
      } else if (performanceMemory !== null) {
        const usageRatio = performanceMemory.usedJSHeapSize / performanceMemory.jsHeapSizeLimit;
        if (usageRatio > 0.9) {
          lowMemoryMode = true;
        }
      }
      
      setMemoryStatus({
        deviceMemory,
        jsHeapSizeLimit: performanceMemory?.jsHeapSizeLimit || null,
        totalJSHeapSize: performanceMemory?.totalJSHeapSize || null,
        usedJSHeapSize: performanceMemory?.usedJSHeapSize || null,
        lowMemoryMode
      });
    };

    // Initial update
    updateMemoryStatus();

    // Set up interval to check memory status periodically
    const intervalId = setInterval(updateMemoryStatus, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return memoryStatus;
};

export default useDeviceMemory;
