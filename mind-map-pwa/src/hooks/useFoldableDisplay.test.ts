// src/hooks/useFoldableDisplay.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFoldableDisplay } from './useFoldableDisplay';
import { vi, describe, it, expect, afterEach } from 'vitest';

// Mock window properties for foldable displays
const mockFoldableDisplay = (
  isFoldable: boolean = false,
  isSpanned: boolean = false,
  spanDirection: 'horizontal' | 'vertical' | null = null,
  foldAngle: number | null = null
) => {
  // Mock Window Segments API
  if (isFoldable && isSpanned) {
    // Create mock segments based on span direction
    const segments = spanDirection === 'horizontal'
      ? [
          { top: 0, left: 0, width: 400, height: 800 },
          { top: 0, left: 420, width: 400, height: 800 }
        ]
      : [
          { top: 0, left: 0, width: 800, height: 400 },
          { top: 420, left: 0, width: 800, height: 400 }
        ];

    // Add getWindowSegments method
    (window as any).getWindowSegments = vi.fn().mockReturnValue(segments);
  } else {
    delete (window as any).getWindowSegments;
  }

  // Mock Foldable Device API
  if (isFoldable) {
    (window as any).foldableDevice = {
      isSpanned,
      spanDirection,
      foldAngle: foldAngle || 180
    };
  } else {
    delete (window as any).foldableDevice;
  }
};

describe('useFoldableDisplay', () => {
  // Reset window properties after each test
  afterEach(() => {
    delete (window as any).getWindowSegments;
    delete (window as any).foldableDevice;
  });

  it('should detect non-foldable display', () => {
    mockFoldableDisplay(false);
    const { result } = renderHook(() => useFoldableDisplay());

    expect(result.current.isFoldable).toBe(false);
    expect(result.current.isSpanned).toBe(false);
  });

  it('should detect foldable display in single screen mode', () => {
    mockFoldableDisplay(true, false);
    const { result } = renderHook(() => useFoldableDisplay());

    expect(result.current.isFoldable).toBe(true);
    expect(result.current.isSpanned).toBe(false);
  });

  it('should detect horizontally spanned display', () => {
    mockFoldableDisplay(true, true, 'horizontal');
    const { result } = renderHook(() => useFoldableDisplay());

    expect(result.current.isFoldable).toBe(true);
    expect(result.current.isSpanned).toBe(true);
    expect(result.current.spanDirection).toBe('horizontal');
  });

  it('should detect vertically spanned display', () => {
    mockFoldableDisplay(true, true, 'vertical');
    const { result } = renderHook(() => useFoldableDisplay());

    expect(result.current.isFoldable).toBe(true);
    expect(result.current.isSpanned).toBe(true);
    expect(result.current.spanDirection).toBe('vertical');
  });

  it('should detect fold angle', () => {
    // Set up the mock with a specific fold angle
    mockFoldableDisplay(true, true, 'horizontal', 130);

    // Force the hook to use the foldableDevice API by removing getWindowSegments
    delete (window as any).getWindowSegments;

    const { result } = renderHook(() => useFoldableDisplay());

    expect(result.current.foldAngle).toBe(130);
  });

  it('should update when display configuration changes', () => {
    mockFoldableDisplay(true, false);
    const { result } = renderHook(() => useFoldableDisplay());

    expect(result.current.isSpanned).toBe(false);

    // Simulate changing to spanned mode
    act(() => {
      mockFoldableDisplay(true, true, 'horizontal');
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isSpanned).toBe(true);
    expect(result.current.spanDirection).toBe('horizontal');
  });
});
