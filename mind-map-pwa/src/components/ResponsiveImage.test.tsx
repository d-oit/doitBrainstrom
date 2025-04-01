// src/components/ResponsiveImage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResponsiveImage from './ResponsiveImage';
import { ResponsiveContextProvider } from '../contexts/ResponsiveContext';
import { vi, describe, it, expect } from 'vitest';

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

// Mock Image implementation
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  loading: string = '';
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
    // Mock the img element
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'img') {
        const imgElement = document.createElement('div');
        imgElement.setAttribute('alt', 'Test image');
        imgElement.setAttribute('src', 'test-image.jpg');
        return imgElement;
      }
      return document.createElement(tagName);
    });

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

    // Wait for the image to appear
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    // Restore the original implementation
    vi.restoreAllMocks();
  });

  it('uses low-res image when shouldReduceImageQuality is true', async () => {
    // Mock the useResponsive hook to return shouldReduceImageQuality: true
    vi.mock('../contexts/ResponsiveContext', () => ({
      ResponsiveContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      useResponsive: () => ({
        shouldReduceImageQuality: true,
        network: {
          online: true,
          connectionType: 'cellular',
          effectiveType: '3g',
          downlink: 1.5,
          rtt: 150,
          saveData: true
        },
        power: {
          isLowPowerMode: false,
          batteryLevel: 0.8,
          batteryCharging: true,
          reducedMotion: false
        },
        viewport: {
          breakpoint: 'mobile',
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          isLandscape: false,
          isPortrait: true,
          pixelRatio: 2
        },
        memory: {
          deviceMemory: 4,
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
        shouldVirtualizeList: true,
        shouldUseOfflineFirst: true
      })
    }), { virtual: true });

    // Mock the img element
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'img') {
        const imgElement = document.createElement('div');
        imgElement.setAttribute('alt', 'Test image');
        imgElement.setAttribute('src', 'low-res-image.jpg');
        return imgElement;
      }
      return document.createElement(tagName);
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

    // Wait for the image to appear
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    // Restore the original implementation
    vi.restoreAllMocks();
  });

  it('shows error state when image fails to load', async () => {
    // Override the Image mock to trigger onerror
    vi.spyOn(global, 'Image').mockImplementation(() => {
      const mockImg = new MockImage();
      // Automatically trigger onerror in the next tick when src is set
      Object.defineProperty(mockImg, 'src', {
        set(value) {
          this._src = value;
          if (this.onerror) {
            setTimeout(() => this.onerror?.(), 0);
          }
        },
        get() {
          return this._src;
        }
      });
      return mockImg;
    });

    // Mock the Box component to render the error message
    vi.mock('@mui/material', () => ({
      Skeleton: ({ children, ...props }: any) => <span data-testid="skeleton" role="img" aria-hidden="true" {...props}>{children}</span>,
      Box: ({ children, ...props }: any) => <div data-testid="error-box">{children}</div>
    }), { virtual: true });

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

    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByTestId('error-box')).toBeInTheDocument();
    });

    // Restore the original implementation
    vi.restoreAllMocks();
  });
});
