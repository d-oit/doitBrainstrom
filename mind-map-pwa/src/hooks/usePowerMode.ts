// src/hooks/usePowerMode.ts
import { useState, useEffect } from 'react';

export interface PowerModeStatus {
  isLowPowerMode: boolean;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  reducedMotion: boolean;
}

/**
 * Custom hook for detecting device power mode
 * Returns the current power mode status
 */
export const usePowerMode = (): PowerModeStatus => {
  const [status, setStatus] = useState<PowerModeStatus>({
    isLowPowerMode: false,
    batteryLevel: null,
    batteryCharging: null,
    reducedMotion: false
  });

  useEffect(() => {
    // Update power mode status
    const updatePowerStatus = async () => {
      let isLowPowerMode = false;
      let batteryLevel = null;
      let batteryCharging = null;
      
      // Check for Battery API
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          
          batteryLevel = battery.level;
          batteryCharging = battery.charging;
          
          // Consider low power mode if battery level is below 20% and not charging
          if (batteryLevel < 0.2 && !batteryCharging) {
            isLowPowerMode = true;
          }
          
          // Add event listeners for battery changes
          battery.addEventListener('levelchange', updatePowerStatus);
          battery.addEventListener('chargingchange', updatePowerStatus);
        } catch (error) {
          console.error('Error accessing Battery API:', error);
        }
      }
      
      // Check for prefers-reduced-motion media query
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // If user prefers reduced motion, consider it as low power mode as well
      if (reducedMotion) {
        isLowPowerMode = true;
      }
      
      // Check for iOS Low Power Mode (indirect detection)
      // iOS often limits animations and background processes in Low Power Mode
      // We can use this as a heuristic
      if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
        // On low memory devices, check if animations are throttled
        const startTime = performance.now();
        let frameCount = 0;
        
        const countFrames = () => {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            // If we're getting less than 30fps, device might be in low power mode
            if (frameCount < 30) {
              setStatus(prev => ({
                ...prev,
                isLowPowerMode: true
              }));
            }
          }
        };
        
        requestAnimationFrame(countFrames);
      }
      
      setStatus({
        isLowPowerMode,
        batteryLevel,
        batteryCharging,
        reducedMotion
      });
    };

    // Initial update
    updatePowerStatus();

    // Add event listener for reduced motion preference change
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', updatePowerStatus);

    // Cleanup
    return () => {
      reducedMotionQuery.removeEventListener('change', updatePowerStatus);
    };
  }, []);

  return status;
};

export default usePowerMode;
