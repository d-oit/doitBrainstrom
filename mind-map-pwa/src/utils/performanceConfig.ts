// src/utils/performanceConfig.ts
import { DeviceCategory } from '../styles/breakpoints';

/**
 * Progressive loading configuration for different device categories
 */
export const loadPriority: Record<DeviceCategory, { initialNodes: number; expandThreshold: number }> = {
  mobile: {
    initialNodes: 5,
    expandThreshold: 3
  },
  tablet: {
    initialNodes: 10,
    expandThreshold: 5
  },
  desktop: {
    initialNodes: 15,
    expandThreshold: 8
  },
  widescreen: {
    initialNodes: 20,
    expandThreshold: 10
  }
};

/**
 * Caching strategy configuration for different device categories
 */
export const cacheConfig: Record<DeviceCategory, { maxMaps: number; maxImages: number; pruneThreshold: string }> = {
  mobile: {
    maxMaps: 3,
    maxImages: 10,
    pruneThreshold: '50MB'
  },
  tablet: {
    maxMaps: 5,
    maxImages: 20,
    pruneThreshold: '100MB'
  },
  desktop: {
    maxMaps: 10,
    maxImages: 50,
    pruneThreshold: '250MB'
  },
  widescreen: {
    maxMaps: 15,
    maxImages: 75,
    pruneThreshold: '500MB'
  }
};

/**
 * Convert string size to bytes
 * @param size Size string (e.g., '50MB', '1GB')
 * @returns Size in bytes
 */
export const sizeToBytes = (size: string): number => {
  const units = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
  };
  
  const match = size.match(/^(\d+)([A-Z]+)$/);
  if (!match) return 0;
  
  const [, value, unit] = match;
  return parseInt(value, 10) * (units[unit as keyof typeof units] || 1);
};

/**
 * Get performance configuration based on device category
 * @param deviceCategory Current device category
 * @returns Performance configuration for the device
 */
export const getPerformanceConfig = (deviceCategory: DeviceCategory) => {
  return {
    loading: loadPriority[deviceCategory],
    caching: cacheConfig[deviceCategory]
  };
};

export default {
  loadPriority,
  cacheConfig,
  sizeToBytes,
  getPerformanceConfig
};
