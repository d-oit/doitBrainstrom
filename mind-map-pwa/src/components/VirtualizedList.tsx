// src/components/VirtualizedList.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { useResponsive } from '../contexts/ResponsiveContext';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualizedListProps<T>) {
  const { shouldVirtualizeList } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Handle scroll events - defined outside of any conditionals
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Add scroll event listener - defined outside of any conditionals
  useEffect(() => {
    if (!shouldVirtualizeList) return; // Skip if not virtualizing

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, shouldVirtualizeList]);

  // Calculate visible items range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );

  // If virtualization is disabled, render all items
  if (!shouldVirtualizeList) {
    return (
      <Box
        className={className}
        sx={{
          height,
          overflowY: 'auto'
        }}
      >
        {items.map((item, index) => renderItem(item, index))}
      </Box>
    );
  }

  // Render only visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <Box
        key={i}
        sx={{
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          width: '100%',
          height: itemHeight
        }}
      >
        {renderItem(items[i], i)}
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        height,
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </Box>
    </Box>
  );
}

export default VirtualizedList;
