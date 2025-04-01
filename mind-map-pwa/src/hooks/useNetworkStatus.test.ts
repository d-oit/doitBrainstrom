// src/hooks/useNetworkStatus.test.ts
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';
import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock navigator properties
const mockNavigatorConnection = (
  online: boolean,
  connectionType: string | null = null,
  effectiveType: string | null = null,
  downlink: number | null = null,
  rtt: number | null = null,
  saveData: boolean = false
) => {
  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', { value: online, writable: true });

  // Mock navigator.connection
  const mockConnection = {
    type: connectionType,
    effectiveType: effectiveType,
    downlink: downlink,
    rtt: rtt,
    saveData: saveData,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  // Add connection to navigator
  if (!(navigator as any).connection) {
    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      writable: true,
      configurable: true
    });
  } else {
    (navigator as any).connection = mockConnection;
  }

  return mockConnection;
};

describe('useNetworkStatus', () => {
  // Reset navigator properties after each test
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  it('should detect online status', () => {
    mockNavigatorConnection(true);
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.online).toBe(true);
  });

  it('should detect offline status', () => {
    mockNavigatorConnection(false);
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.online).toBe(false);
  });

  it('should detect connection type and quality', () => {
    mockNavigatorConnection(true, 'wifi', '4g', 10, 50, false);
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.connectionType).toBe('wifi');
    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.downlink).toBe(10);
    expect(result.current.rtt).toBe(50);
    expect(result.current.saveData).toBe(false);
  });

  it('should update when online status changes', () => {
    mockNavigatorConnection(true);
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.online).toBe(true);

    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.online).toBe(false);

    // Simulate going back online
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.online).toBe(true);
  });

  it('should handle save-data mode', () => {
    mockNavigatorConnection(true, 'cellular', '3g', 5, 100, true);
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.saveData).toBe(true);
  });
});
