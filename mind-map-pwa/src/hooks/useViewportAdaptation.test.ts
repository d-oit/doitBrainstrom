// src/hooks/useViewportAdaptation.test.ts
import { renderHook, act } from '@testing-library/react';
import { useViewportAdaptation } from './useViewportAdaptation';
import { describe, it, expect, afterEach } from 'vitest';

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
    mockWindowProperties(1024, 768, 1);
  });

  it('should return mobile breakpoint for small screens', () => {
    mockWindowProperties(320, 568);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return tablet breakpoint for medium screens', () => {
    mockWindowProperties(768, 1024);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.breakpoint).toBe('tablet');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return desktop breakpoint for large screens', () => {
    mockWindowProperties(1440, 900);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should detect landscape orientation', () => {
    mockWindowProperties(800, 600);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it('should detect portrait orientation', () => {
    mockWindowProperties(600, 800);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.isLandscape).toBe(false);
    expect(result.current.isPortrait).toBe(true);
  });

  it('should detect high pixel ratio screens', () => {
    mockWindowProperties(1024, 768, 2);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.pixelRatio).toBe(2);
  });

  it('should update when window is resized', () => {
    mockWindowProperties(320, 568);
    const { result } = renderHook(() => useViewportAdaptation());

    expect(result.current.breakpoint).toBe('mobile');

    // Simulate window resize
    act(() => {
      mockWindowProperties(1440, 900);
    });

    expect(result.current.breakpoint).toBe('desktop');
  });
});
