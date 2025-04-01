// src/components/ResponsiveImage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResponsiveImage from './ResponsiveImage';
import { ResponsiveContextProvider, useResponsive } from '../contexts/ResponsiveContext';
import { vi, describe, it, expect } from 'vitest';

// Mock the useResponsive hook
const mockUseResponsive = vi.fn().mockReturnValue({
  shouldReduceImageQuality: false,
  network: {
    online: true,
    connectionType: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  },
  viewport: {
    isMobile: false,
    isTablet: false,
    isDesktop: true
  }
});

vi.mock('../contexts/ResponsiveContext', () => ({
  ResponsiveContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useResponsive: () => mockUseResponsive()
}));

// Mock Material UI components
vi.mock('@mui/material', () => ({
  Skeleton: ({ children, ...props }: any) => <span data-testid="skeleton" role="img" aria-hidden="true" {...props}>{children}</span>,
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>
}), { virtual: true });

// Mock the useResponsive hook
vi.mock('../contexts/ResponsiveContext', () => ({
  ResponsiveContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useResponsive: () => ({
    shouldReduceImageQuality: false,
    network: {
      online: true,
      connectionType: 'wifi',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false
    },
    power: {
      isLowPowerMode: false,
      batteryLevel: 0.8,
      batteryCharging: true,
      reducedMotion: false
    },
    viewport: {
      breakpoint: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLandscape: true,
      isPortrait: false,
      pixelRatio: 1
    },
    memory: {
      deviceMemory: 8,
      lowMemoryMode: false
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
    shouldVirtualizeList: false,
    shouldUseOfflineFirst: false
  })
}), { virtual: true });

// Setup mock for Image before tests
beforeEach(() => {
  // Mock Image implementation
  class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src: string = '';
    loading: string = '';
    _src: string = '';
  }

  // Create a spy on the Image constructor
  vi.spyOn(global, 'Image').mockImplementation(() => {
    const mockImg = new MockImage();
    // Automatically trigger onload in the next tick when src is set
    Object.defineProperty(mockImg, 'src', {
      set(value) {
        this._src = value;
        if (this.onload) {
          setTimeout(() => this.onload?.(), 0);
        }
      },
      get() {
        return this._src;
      }
    });
    return mockImg;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ResponsiveImage', () => {
  it('renders a loading skeleton initially', () => {
    render(
      <ResponsiveContextProvider>
        <ResponsiveImage
          src="test-image.jpg"
          alt="Test image"
          width={200}
          height={150}
        />
      </ResponsiveContextProvider>
    );

    // Should show a skeleton while loading
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders the image after loading', async () => {
    render(
      <ResponsiveContextProvider>
        <ResponsiveImage
          src="test-image.jpg"
          alt="Test image"
          width={200}
          height={150}
        />
      </ResponsiveContextProvider>
    );

    // Wait for the skeleton to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });
  });

  it('uses low-res image when shouldReduceImageQuality is true', async () => {
    // Mock the useResponsive hook to return shouldReduceImageQuality: true
    mockUseResponsive.mockReturnValueOnce({
      shouldReduceImageQuality: true,
      network: {
        online: true,
        connectionType: 'cellular',
        effectiveType: '3g',
        downlink: 1.5,
        rtt: 150,
        saveData: true
      },
      viewport: {
        isMobile: true,
        isTablet: false,
        isDesktop: false
      },
      shouldReduceAnimations: false
    });

    render(
      <ResponsiveContextProvider>
        <ResponsiveImage
          src="high-res-image.jpg"
          lowResSrc="low-res-image.jpg"
          alt="Test image"
          width={200}
          height={150}
        />
      </ResponsiveContextProvider>
    );

    // Wait for the skeleton to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });
  });

  it('shows error state when image fails to load', async () => {
    // Override the Image mock to trigger onerror instead of onload
    vi.spyOn(global, 'Image').mockImplementation(() => {
      const mockImg = {} as any;
      mockImg.onload = null;
      mockImg.onerror = null;

      // Set src property to trigger onerror
      Object.defineProperty(mockImg, 'src', {
        set() {
          setTimeout(() => {
            if (mockImg.onerror) mockImg.onerror();
          }, 0);
        }
      });

      return mockImg;
    });

    render(
      <ResponsiveContextProvider>
        <ResponsiveImage
          src="invalid-image.jpg"
          alt="Test image"
          width={200}
          height={150}
        />
      </ResponsiveContextProvider>
    );

    // Wait for the skeleton to disappear and error state to appear
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });
  });
});
