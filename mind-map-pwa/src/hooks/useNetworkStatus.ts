// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  online: boolean;
  connectionType: string | null;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

/**
 * Custom hook for monitoring network status and connection quality
 * Returns the current network status information
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false
  });

  useEffect(() => {
    // Update network status
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      setStatus({
        online: navigator.onLine,
        connectionType: connection?.type || null,
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
        saveData: connection?.saveData || false
      });
    };

    // Initial update
    updateNetworkStatus();

    // Add event listeners for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Add event listener for connection change if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return status;
};

export default useNetworkStatus;
