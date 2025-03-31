/**
 * Performance Monitoring Utilities
 * 
 * This module provides utilities for monitoring and measuring performance
 * using the Performance API and console timers.
 */

/**
 * Start measuring performance for a named operation
 * Creates a performance mark and starts a console timer
 * 
 * @param measureName - Name of the performance measurement
 */
export const startPerformanceMeasure = (measureName: string): void => {
  // Create a performance mark for the start of the measurement
  performance.mark(`start-${measureName}`);
  // Start a console timer for simpler logging
  console.time(measureName);
};

/**
 * End measuring performance for a named operation
 * Creates a performance measure between start and end marks,
 * logs the duration, and cleans up marks
 * 
 * @param measureName - Name of the performance measurement (must match the name used in startPerformanceMeasure)
 * @returns The duration of the measurement in milliseconds
 */
export const endPerformanceMeasure = (measureName: string): number => {
  // Create a performance mark for the end of the measurement
  performance.mark(`end-${measureName}`);
  // Create a performance measure between the start and end marks
  performance.measure(measureName, `start-${measureName}`, `end-${measureName}`);
  // End the console timer
  console.timeEnd(measureName);

  // Get the measurement and log the duration
  const measures = performance.getEntriesByName(measureName);
  let duration = 0;
  
  measures.forEach(measure => {
    duration = measure.duration;
    console.log(`Performance Measure '${measure.name}': Duration = ${measure.duration}ms`);
  });
  
  // Clean up marks and measures to prevent memory leaks
  performance.clearMeasures(measureName);
  performance.clearMarks(`start-${measureName}`);
  performance.clearMarks(`end-${measureName}`);
  
  return duration;
};

/**
 * Measure the execution time of an async function
 * 
 * @param name - Name of the operation being measured
 * @param fn - Async function to measure
 * @returns The result of the async function
 */
export const measureAsyncOperation = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  startPerformanceMeasure(name);
  try {
    const result = await fn();
    endPerformanceMeasure(name);
    return result;
  } catch (error) {
    endPerformanceMeasure(name);
    throw error;
  }
};

/**
 * Measure the execution time of a synchronous function
 * 
 * @param name - Name of the operation being measured
 * @param fn - Synchronous function to measure
 * @returns The result of the synchronous function
 */
export const measureSyncOperation = <T>(
  name: string,
  fn: () => T
): T => {
  startPerformanceMeasure(name);
  try {
    const result = fn();
    endPerformanceMeasure(name);
    return result;
  } catch (error) {
    endPerformanceMeasure(name);
    throw error;
  }
};

/**
 * Get the current First Contentful Paint (FCP) time
 * 
 * @returns The FCP time in milliseconds, or null if not available
 */
export const getFCP = (): number | null => {
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  return fcpEntry ? fcpEntry.startTime : null;
};

/**
 * Get the current Largest Contentful Paint (LCP) time
 * Requires PerformanceObserver to be set up
 * 
 * @returns The LCP time in milliseconds, or null if not available
 */
export const getLCP = (): number | null => {
  // This is a placeholder - actual implementation requires PerformanceObserver
  // which should be set up at application initialization
  return null;
};

/**
 * Initialize performance monitoring for the application
 * Sets up observers for key metrics like LCP, FID, CLS
 */
export const initPerformanceMonitoring = (): void => {
  // Set up LCP observer
  if ('PerformanceObserver' in window) {
    // LCP observer
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        // Here you would send this to your analytics
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('LCP monitoring error:', e);
    }

    // FID observer
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as PerformanceEventTiming;
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          // Here you would send this to your analytics
        });
      }).observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('FID monitoring error:', e);
    }

    // CLS observer
    try {
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          // Ignore entries with 0 layout shift
          if (!(entry as any).value) return;
          
          clsEntries.push(entry);
          // Only consider the 5 largest shifts
          if (clsEntries.length > 5) {
            clsEntries.sort((a, b) => (b as any).value - (a as any).value);
            clsEntries = clsEntries.slice(0, 5);
          }
          
          // Calculate CLS
          clsValue = clsEntries.reduce((sum, entry) => sum + (entry as any).value, 0);
          console.log('CLS:', clsValue);
          // Here you would send this to your analytics
        });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS monitoring error:', e);
    }
  }
};

/**
 * Example usage:
 * 
 * // Initialize performance monitoring
 * initPerformanceMonitoring();
 * 
 * // Measure a specific operation
 * startPerformanceMeasure('MindMapRender');
 * // ... code to measure (e.g., MindMap component rendering)
 * endPerformanceMeasure('MindMapRender');
 * 
 * // Measure an async function
 * const data = await measureAsyncOperation('FetchData', async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 * 
 * // Measure a sync function
 * const result = measureSyncOperation('CalculateLayout', () => {
 *   // Complex layout calculation
 *   return calculatedLayout;
 * });
 */
