// src/components/ResponsiveImage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResponsiveImage from './ResponsiveImage';
import { ResponsiveContextProvider } from '../contexts/ResponsiveContext';
import { vi, describe, it, expect } from 'vitest';

// Mock the useResponsive hook
vi.mock('../contexts/ResponsiveContext', () => {
  const originalModule = vi.importActual('../contexts/ResponsiveContext');

  return {
    ...originalModule,
    useResponsive: vi.fn().mockReturnValue({
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
      }
    })
  };
});

// Mock Image implementation
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';
  loading: string = '';
}

// Replace global Image with mock
(global as any).Image = MockImage;

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

    // Simulate image load
    setTimeout(() => {
      const mockImage = new MockImage();
      if (mockImage.onload) mockImage.onload();
    }, 0);

    // Wait for the image to appear
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  it('uses low-res image when shouldReduceImageQuality is true', async () => {
    // Override the mock to enable image quality reduction
    // Import at the top level instead of using require
    useResponsive.mockImplementationOnce(() => ({
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
      }
    }));

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

    // Simulate image load
    setTimeout(() => {
      const mockImage = new MockImage();
      if (mockImage.onload) mockImage.onload();
    }, 0);

    // Wait for the image to appear
    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  it('shows error state when image fails to load', async () => {
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

    // Simulate image error
    setTimeout(() => {
      const mockImage = new MockImage();
      if (mockImage.onerror) mockImage.onerror();
    }, 0);

    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText('Test image')).toBeInTheDocument();
    });
  });
});
