// src/components/layout/ResponsiveGrid.tsx
import React, { ReactNode } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';

interface ResponsiveGridProps {
  children: ReactNode;
  container?: boolean;
  fluid?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  autoFit?: boolean;
  autoFill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  safeArea?: boolean;
}

interface ResponsiveGridItemProps {
  children: ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  offset?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  order?: number | 'first' | 'last';
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  container = true,
  fluid = false,
  gap = 'md',
  alignItems,
  justifyContent,
  autoFit = false,
  autoFill = false,
  className = '',
  style,
  as: Component = 'div',
  safeArea = false
}) => {
  const { viewport } = useResponsive();
  
  // Build class names
  let classNames = '';
  
  if (container) {
    classNames += fluid ? 'container-fluid ' : 'container ';
    if (safeArea) {
      classNames += 'safe-area ';
    }
  }
  
  classNames += 'grid ';
  
  if (gap === 'none') {
    classNames += 'grid-no-gap ';
  } else if (gap !== 'md') {
    classNames += `grid-gap-${gap} `;
  }
  
  if (alignItems) {
    classNames += `grid-align-${alignItems} `;
  }
  
  if (justifyContent) {
    classNames += `grid-justify-${justifyContent} `;
  }
  
  if (autoFit) {
    if (viewport.isMobile) {
      classNames += 'grid-auto-fit ';
    } else if (viewport.isTablet) {
      classNames += 'grid-sm-auto-fit ';
    } else {
      classNames += 'grid-md-auto-fit ';
    }
  }
  
  if (autoFill) {
    if (viewport.isMobile) {
      classNames += 'grid-auto-fill ';
    } else if (viewport.isTablet) {
      classNames += 'grid-sm-auto-fill ';
    } else {
      classNames += 'grid-md-auto-fill ';
    }
  }
  
  if (className) {
    classNames += className;
  }
  
  return (
    <Component className={classNames.trim()} style={style}>
      {children}
    </Component>
  );
};

export const ResponsiveGridItem: React.FC<ResponsiveGridItemProps> = ({
  children,
  xs,
  sm,
  md,
  lg,
  xl,
  offset,
  order,
  className = '',
  style,
  as: Component = 'div'
}) => {
  // Build class names
  let classNames = '';
  
  // Column spans
  if (xs !== undefined) {
    classNames += `col-${xs} `;
  }
  
  if (sm !== undefined) {
    classNames += `col-sm-${sm} `;
  }
  
  if (md !== undefined) {
    classNames += `col-md-${md} `;
  }
  
  if (lg !== undefined) {
    classNames += `col-lg-${lg} `;
  }
  
  if (xl !== undefined) {
    classNames += `col-xl-${xl} `;
  }
  
  // Offsets
  if (offset) {
    if (offset.xs !== undefined) {
      classNames += `offset-${offset.xs} `;
    }
    
    if (offset.sm !== undefined) {
      classNames += `offset-sm-${offset.sm} `;
    }
    
    if (offset.md !== undefined) {
      classNames += `offset-md-${offset.md} `;
    }
    
    if (offset.lg !== undefined) {
      classNames += `offset-lg-${offset.lg} `;
    }
    
    if (offset.xl !== undefined) {
      classNames += `offset-xl-${offset.xl} `;
    }
  }
  
  // Order
  if (order !== undefined) {
    if (typeof order === 'number') {
      classNames += `order-${order} `;
    } else {
      classNames += `order-${order} `;
    }
  }
  
  if (className) {
    classNames += className;
  }
  
  return (
    <Component className={classNames.trim()} style={style}>
      {children}
    </Component>
  );
};

export default ResponsiveGrid;
