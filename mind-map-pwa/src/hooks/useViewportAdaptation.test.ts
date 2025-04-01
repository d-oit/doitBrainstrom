// src/hooks/useViewportAdaptation.test.ts
import { renderHook, act } from '@testing-library/react';
import { useViewportAdaptation } from './useViewportAdaptation';
import { describe, it, expect, afterEach, vi } from 'vitest';

// Mock window properties
const mockWindowProperties = (width: number, height: number, pixelRatio: number = 1) => {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
  Object.defineProperty(window, 'devicePixelRatio', { value: pixelRatio, writable: true });
  window.dispatchEvent(new Event('resize'));
};

describe('useViewportAdaptation', () => {
  // Reset window properties after each test
  afterEach(() => {
    act(() => {
      mockWindowProperties(1024, 768, 1);
    });
  });

  it('should return xs breakpoint for small screens', () => {
    // Set up window properties before rendering the hook
    act(() => {
      mockWindowProperties(320, 568);
    });

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Assertions
    expect(result.current.breakpoint).toBe('xs');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return sm breakpoint for medium screens', () => {
    // Set up window properties before rendering the hook
    act(() => {
      mockWindowProperties(768, 1024);
    });

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Assertions
    expect(result.current.breakpoint).toBe('sm');
    expect(result.current.isMobile).toBe(false); // isMobile is only true for xs
    expect(result.current.isTablet).toBe(true); // isTablet is true for sm
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.deviceCategory).toBe('tablet');
  });

  it('should return lg breakpoint for large screens', () => {
    // Set up window properties before rendering the hook
    act(() => {
      mockWindowProperties(1440, 900);
    });

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Assertions
    expect(result.current.breakpoint).toBe('lg');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false); // isDesktop is only true for md
    expect(result.current.isWidescreen).toBe(true); // isWidescreen is true for lg and xl
    expect(result.current.deviceCategory).toBe('widescreen');
  });

  it('should detect landscape orientation', () => {
    // Set up window properties before rendering the hook
    act(() => {
      mockWindowProperties(800, 600);
    });

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Assertions
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('should detect portrait orientation', () => {
    // Set up window properties before rendering the hook
    act(() => {
      mockWindowProperties(600, 800);
    });

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Assertions
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  it('should detect high pixel ratio screens', () => {
    // Set up window properties before rendering the hook
    act(() => {
      mockWindowProperties(1024, 768, 2);
    });

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Assertions
    expect(result.current.pixelRatio).toBe(2);
  });

  it('should update when window is resized', () => {
    // Set up window properties before rendering the hook
    mockWindowProperties(320, 568);

    // Render the hook
    const { result } = renderHook(() => useViewportAdaptation());

    // Initial assertion
    expect(result.current.breakpoint).toBe('xs');

    // Simulate window resize
    act(() => {
      mockWindowProperties(1440, 900);
    });

    // Assertion after resize
    expect(result.current.breakpoint).toBe('lg');
  });
});
