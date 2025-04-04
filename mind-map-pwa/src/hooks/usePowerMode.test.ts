// src/hooks/usePowerMode.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePowerMode } from './usePowerMode';
import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock navigator and window properties
const mockPowerMode = (
  batteryLevel: number | null = null,
  batteryCharging: boolean | null = null,
  reducedMotion: boolean = false
) => {
  // Mock Battery API
  if (batteryLevel !== null && batteryCharging !== null) {
    const mockBattery = {
      level: batteryLevel,
      charging: batteryCharging,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    (navigator as any).getBattery = vi.fn().mockResolvedValue(mockBattery);
  } else {
    delete (navigator as any).getBattery;
  }

  // Mock prefers-reduced-motion media query
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: reducedMotion,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('usePowerMode', () => {
  // Reset mocks after each test
  afterEach(() => {
    delete (navigator as any).getBattery;
    vi.resetAllMocks();
  });

  it('should detect normal power mode', async () => {
    mockPowerMode(0.8, true, false);

    const { result } = renderHook(() => usePowerMode());

    // Wait for async effects to complete
    await act(async () => {
      await vi.waitFor(() => {
        return result.current.batteryLevel === 0.8;
      }, { timeout: 2000 });
    });

    // Make assertions after act has completed
    expect(result.current.isLowPowerMode).toBe(false);
    expect(result.current.batteryLevel).toBe(0.8);
    expect(result.current.batteryCharging).toBe(true);
    expect(result.current.reducedMotion).toBe(false);
  });

  it('should detect low power mode with low battery', async () => {
    mockPowerMode(0.15, false, false);

    const { result } = renderHook(() => usePowerMode());

    // Wait for async effects to complete
    await act(async () => {
      await vi.waitFor(() => {
        return result.current.batteryLevel === 0.15;
      }, { timeout: 2000 });
    });

    // Make assertions after act has completed
    expect(result.current.isLowPowerMode).toBe(true);
    expect(result.current.batteryLevel).toBe(0.15);
    expect(result.current.batteryCharging).toBe(false);
  });

  it('should detect reduced motion preference', async () => {
    mockPowerMode(0.5, true, true);

    const { result } = renderHook(() => usePowerMode());

    // Wait for async effects to complete
    await act(async () => {
      await vi.waitFor(() => {
        return result.current.batteryLevel === 0.5;
      }, { timeout: 2000 });
    });

    // Make assertions after act has completed
    expect(result.current.isLowPowerMode).toBe(true);
    expect(result.current.reducedMotion).toBe(true);
  });

  it('should handle missing Battery API', async () => {
    mockPowerMode(null, null, false);

    const { result } = renderHook(() => usePowerMode());

    // Wait for async effects to complete
    await act(async () => {
      // Just wait a bit for the hook to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Make assertions after act has completed
    expect(result.current.batteryLevel).toBeNull();
    expect(result.current.batteryCharging).toBeNull();
  });
});
