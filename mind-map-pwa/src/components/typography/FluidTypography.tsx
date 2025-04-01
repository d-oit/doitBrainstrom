// src/components/typography/FluidTypography.tsx
import React, { ReactNode } from 'react';

type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

interface FluidTypographyProps {
  children: ReactNode;
  size?: TypographySize;
  as?: TypographyElement;
  className?: string;
  style?: React.CSSProperties;
  gutterBottom?: boolean;
}

/**
 * FluidTypography component
 * Renders text with fluid typography that scales smoothly
 * between viewport sizes using CSS clamp()
 */
export const FluidTypography: React.FC<FluidTypographyProps> = ({
  children,
  size = 'md',
  as: Component = 'p',
  className = '',
  style,
  gutterBottom = false
}) => {
  // Map size to appropriate class
  const sizeClass = size === 'md' ? 'text-md' : `text-${size}`;
  
  // Build class names
  let classNames = sizeClass;
  
  if (gutterBottom) {
    classNames += ' mb-md';
  }
  
  if (className) {
    classNames += ` ${className}`;
  }
  
  return (
    <Component className={classNames} style={style}>
      {children}
    </Component>
  );
};

// Predefined typography components
export const Heading1: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="3xl" as="h1" />
);

export const Heading2: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="2xl" as="h2" />
);

export const Heading3: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="xl" as="h3" />
);

export const Heading4: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="lg" as="h4" />
);

export const Heading5: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="md" as="h5" />
);

export const Heading6: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="sm" as="h6" />
);

export const Paragraph: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="md" as="p" />
);

export const Caption: React.FC<Omit<FluidTypographyProps, 'size' | 'as'>> = (props) => (
  <FluidTypography {...props} size="xs" as="span" />
);

export default FluidTypography;
