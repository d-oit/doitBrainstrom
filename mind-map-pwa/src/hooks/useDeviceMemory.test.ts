// src/hooks/useDeviceMemory.test.ts
import { renderHook } from '@testing-library/react';
import { useDeviceMemory } from './useDeviceMemory';
import { describe, it, expect, afterEach } from 'vitest';

// Mock navigator and performance properties
const mockMemoryProperties = (
  deviceMemory: number | null = null,
  jsHeapSizeLimit: number | null = null,
  totalJSHeapSize: number | null = null,
  usedJSHeapSize: number | null = null
) => {
  // Mock navigator.deviceMemory
  if (deviceMemory !== null) {
    Object.defineProperty(navigator, 'deviceMemory', {
      value: deviceMemory,
      writable: true,
      configurable: true
    });
  } else if ('deviceMemory' in navigator) {
    delete (navigator as any).deviceMemory;
  }

  // Mock performance.memory
  if (jsHeapSizeLimit !== null && totalJSHeapSize !== null && usedJSHeapSize !== null) {
    Object.defineProperty(performance, 'memory', {
      value: {
        jsHeapSizeLimit,
        totalJSHeapSize,
        usedJSHeapSize
      },
      writable: true,
      configurable: true
    });
  } else if ('memory' in performance) {
    delete (performance as any).memory;
  }
};

describe('useDeviceMemory', () => {
  // Reset properties after each test
  afterEach(() => {
    if ('deviceMemory' in navigator) {
      delete (navigator as any).deviceMemory;
    }
    if ('memory' in performance) {
      delete (performance as any).memory;
    }
  });

  it('should detect device memory', () => {
    mockMemoryProperties(4);
    const { result } = renderHook(() => useDeviceMemory());

    expect(result.current.deviceMemory).toBe(4);
    expect(result.current.lowMemoryMode).toBe(false);
  });

  it('should detect low memory mode with low device memory', () => {
    mockMemoryProperties(1);
    const { result } = renderHook(() => useDeviceMemory());

    expect(result.current.deviceMemory).toBe(1);
    expect(result.current.lowMemoryMode).toBe(true);
  });

  it('should detect performance memory metrics', () => {
    mockMemoryProperties(
      4, // 4GB device memory
      2000000000, // 2GB heap limit
      1000000000, // 1GB total heap
      500000000 // 500MB used heap
    );
    const { result } = renderHook(() => useDeviceMemory());

    expect(result.current.jsHeapSizeLimit).toBe(2000000000);
    expect(result.current.totalJSHeapSize).toBe(1000000000);
    expect(result.current.usedJSHeapSize).toBe(500000000);
    expect(result.current.lowMemoryMode).toBe(false);
  });

  it('should detect low memory mode with high heap usage', () => {
    mockMemoryProperties(
      4, // 4GB device memory
      1000000000, // 1GB heap limit
      950000000, // 950MB total heap
      950000000 // 950MB used heap (95% usage)
    );
    const { result } = renderHook(() => useDeviceMemory());

    expect(result.current.lowMemoryMode).toBe(true);
  });

  it('should handle missing memory APIs', () => {
    mockMemoryProperties(null, null, null, null);
    const { result } = renderHook(() => useDeviceMemory());

    expect(result.current.deviceMemory).toBeNull();
    expect(result.current.jsHeapSizeLimit).toBeNull();
    expect(result.current.totalJSHeapSize).toBeNull();
    expect(result.current.usedJSHeapSize).toBeNull();
    expect(result.current.lowMemoryMode).toBe(false);
  });
});
