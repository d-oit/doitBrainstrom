// src/components/VirtualizedList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import VirtualizedList from './VirtualizedList';
import { ResponsiveContextProvider } from '../contexts/ResponsiveContext';
import { vi, describe, it, expect } from 'vitest';

// Mock Material UI components
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>
}), { virtual: true });

// Mock the useResponsive hook
vi.mock('../contexts/ResponsiveContext', () => ({
  ResponsiveContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useResponsive: () => ({
    shouldVirtualizeList: true,
    viewport: {
      breakpoint: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLandscape: true,
      isPortrait: false,
      pixelRatio: 1
    },
    network: {
      online: true,
      connectionType: 'wifi',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false
    },
    memory: {
      deviceMemory: 8,
      lowMemoryMode: false
    },
    power: {
      isLowPowerMode: false,
      batteryLevel: 0.8,
      batteryCharging: true,
      reducedMotion: false
    },
    foldable: {
      isFoldable: false,
      isSpanned: false,
      foldSize: null,
      foldAngle: null,
      spanDirection: null,
      screenSegments: null
    },
    shouldReduceAnimations: false,
    shouldReduceImageQuality: false,
    shouldUseOfflineFirst: false
  })
}), { virtual: true });

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

  it('renders virtualized list with visible items only', () => {
    render(
      <ResponsiveContextProvider>
        <VirtualizedList
          items={mockItems}
          height={200}
          itemHeight={50}
          renderItem={(item) => <div data-testid={`item-${item}`}>{item}</div>}
        />
      </ResponsiveContextProvider>
    );

    // With height=200 and itemHeight=50, we should see 4 items plus overscan (default 5)
    // So we should see items 1-9 (4 visible + 5 overscan)
    expect(screen.getByTestId('item-Item 1')).toBeInTheDocument();
    expect(screen.getByTestId('item-Item 9')).toBeInTheDocument();

    // Item 10 should not be rendered
    expect(screen.queryByTestId('item-Item 10')).not.toBeInTheDocument();
  });

  it('renders all items when virtualization is disabled', () => {
    // Override the mock to disable virtualization
    vi.mock('../contexts/ResponsiveContext', () => ({
      ResponsiveContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useResponsive: () => ({
        shouldVirtualizeList: false,
        viewport: {
          breakpoint: 'desktop',
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          isLandscape: true,
          isPortrait: false,
          pixelRatio: 1
        },
        network: {
          online: true,
          connectionType: 'wifi',
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false
        },
        memory: {
          deviceMemory: 8,
          lowMemoryMode: false
        },
        power: {
          isLowPowerMode: false,
          batteryLevel: 0.8,
          batteryCharging: true,
          reducedMotion: false
        },
        foldable: {
          isFoldable: false,
          isSpanned: false,
          foldSize: null,
          foldAngle: null,
          spanDirection: null,
          screenSegments: null
        },
        shouldReduceAnimations: false,
        shouldReduceImageQuality: false,
        shouldUseOfflineFirst: false
      })
    }), { virtual: true });

    render(
      <ResponsiveContextProvider>
        <VirtualizedList
          items={mockItems.slice(0, 20)} // Use only 20 items for this test
          height={200}
          itemHeight={50}
          renderItem={(item) => <div data-testid={`item-${item}`}>{item}</div>}
        />
      </ResponsiveContextProvider>
    );

    // All 20 items should be rendered
    expect(screen.getByTestId('item-Item 1')).toBeInTheDocument();
    expect(screen.getByTestId('item-Item 20')).toBeInTheDocument();
  });
});
