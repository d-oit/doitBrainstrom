// src/test/testUtils.ts
import { vi } from 'vitest';

/**
 * Configure mock for ResizeObserver and IntersectionObserver
 * These are not available in jsdom and often cause memory leaks in tests
 */
export function configureObserverMock() {
  // Mock ResizeObserver
  if (!global.ResizeObserver) {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }

  // Mock IntersectionObserver
  if (!global.IntersectionObserver) {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    }));
  }

  // Mock MutationObserver
  if (!global.MutationObserver) {
    global.MutationObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    }));
  }
}

/**
 * Helper to clean up memory after tests
 */
export function cleanupMemory() {
  // Clear all timeouts and intervals
  vi.clearAllTimers();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Force garbage collection hint (not guaranteed to run)
  if (global.gc) {
    global.gc();
  }
}

/**
 * Mock window properties for testing
 */
export function mockWindowProperties(overrides: Record<string, any> = {}) {
  const originalWindow = { ...window };
  const mockProps: Record<string, any> = {};
  
  // Apply overrides
  Object.entries(overrides).forEach(([key, value]) => {
    mockProps[key] = value;
    if (typeof value === 'function') {
      vi.spyOn(window, key as any).mockImplementation(value);
    } else {
      Object.defineProperty(window, key, {
        value,
        writable: true,
        configurable: true,
      });
    }
  });
  
  // Return cleanup function
  return () => {
    Object.keys(mockProps).forEach((key) => {
      if (key in originalWindow) {
        Object.defineProperty(window, key, {
          value: originalWindow[key as keyof Window],
          writable: true,
          configurable: true,
        });
      } else {
        // @ts-ignore - Delete property that didn't exist originally
        delete window[key];
      }
    });
  };
}
