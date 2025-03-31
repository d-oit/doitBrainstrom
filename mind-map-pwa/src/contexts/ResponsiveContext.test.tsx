// src/contexts/ResponsiveContext.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsiveContextProvider, useResponsive } from './ResponsiveContext';
import { vi, describe, it, expect } from 'vitest';

// Mock the hooks
vi.mock('../hooks/useViewportAdaptation', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    breakpoint: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isLandscape: false,
    isPortrait: true,
    pixelRatio: 2
  })
}));

vi.mock('../hooks/useNetworkStatus', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    online: true,
    connectionType: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  })
}));

vi.mock('../hooks/useDeviceMemory', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    deviceMemory: 4,
    jsHeapSizeLimit: 2000000000,
    totalJSHeapSize: 1000000000,
    usedJSHeapSize: 500000000,
    lowMemoryMode: false
  })
}));

vi.mock('../hooks/useFoldableDisplay', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    isFoldable: false,
    isSpanned: false,
    foldSize: null,
    foldAngle: null,
    spanDirection: null,
    screenSegments: null
  })
}));

vi.mock('../hooks/usePowerMode', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    isLowPowerMode: false,
    batteryLevel: 0.8,
    batteryCharging: true,
    reducedMotion: false
  })
}));

// Test component that uses the context
const TestComponent = () => {
  const responsive = useResponsive();
  return (
    <div>
      <div data-testid="breakpoint">{responsive.viewport.breakpoint}</div>
      <div data-testid="online">{responsive.network.online ? 'online' : 'offline'}</div>
      <div data-testid="reduce-animations">{responsive.shouldReduceAnimations ? 'yes' : 'no'}</div>
      <div data-testid="virtualize-list">{responsive.shouldVirtualizeList ? 'yes' : 'no'}</div>
      <div data-testid="reduce-image-quality">{responsive.shouldReduceImageQuality ? 'yes' : 'no'}</div>
      <div data-testid="offline-first">{responsive.shouldUseOfflineFirst ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('ResponsiveContext', () => {
  it('should provide responsive context values', () => {
    render(
      <ResponsiveContextProvider>
        <TestComponent />
      </ResponsiveContextProvider>
    );

    expect(screen.getByTestId('breakpoint')).toHaveTextContent('mobile');
    expect(screen.getByTestId('online')).toHaveTextContent('online');
    expect(screen.getByTestId('reduce-animations')).toHaveTextContent('no');
    expect(screen.getByTestId('virtualize-list')).toHaveTextContent('yes');
    expect(screen.getByTestId('reduce-image-quality')).toHaveTextContent('no');
    expect(screen.getByTestId('offline-first')).toHaveTextContent('no');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useResponsive must be used within a ResponsiveContextProvider');

    // Restore console.error
    console.error = originalError;
  });
});
