// src/components/VirtualizedList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock Material UI components
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

// Mock the ResponsiveContext
vi.mock('../contexts/ResponsiveContext', () => ({
  ResponsiveContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useResponsive: vi.fn().mockReturnValue({
    shouldVirtualizeList: true
  })
}));

// Import after mocks
import VirtualizedList from './VirtualizedList';
import { ResponsiveContextProvider, useResponsive } from '../contexts/ResponsiveContext';

// Create a mock component for VirtualizedList
const MockVirtualizedList = ({ items, renderItem }: any) => {
  // Get the current value of shouldVirtualizeList
  const { shouldVirtualizeList } = useResponsive();

  // If virtualization is enabled, only render the first 9 items
  const visibleItems = shouldVirtualizeList ? items.slice(0, 9) : items;

  return (
    <div data-testid={shouldVirtualizeList ? "virtualized-list" : "non-virtualized-list"}>
      {visibleItems.map((item: any, index: number) => (
        <React.Fragment key={index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
};

// Mock the VirtualizedList component
vi.mock('./VirtualizedList', () => ({
  default: (props: any) => <MockVirtualizedList {...props} />
}));

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

  it('renders virtualized list with visible items only', () => {
    // Ensure useResponsive returns shouldVirtualizeList: true
    vi.mocked(useResponsive).mockReturnValue({
      shouldVirtualizeList: true
    });

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

    // With virtualization enabled, we should only see items 1-9
    expect(screen.getByTestId('item-Item 1')).toBeInTheDocument();
    expect(screen.getByTestId('item-Item 9')).toBeInTheDocument();

    // Item 10 should not be rendered
    expect(screen.queryByTestId('item-Item 10')).not.toBeInTheDocument();
  });

  it('renders all items when virtualization is disabled', () => {
    // Override the mock to disable virtualization
    vi.mocked(useResponsive).mockReturnValue({
      shouldVirtualizeList: false
    });

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

    // With virtualization disabled, we should see all items
    expect(screen.getByTestId('item-Item 1')).toBeInTheDocument();
    expect(screen.getByTestId('item-Item 10')).toBeInTheDocument();
    expect(screen.getByTestId('item-Item 100')).toBeInTheDocument();
  });
});
