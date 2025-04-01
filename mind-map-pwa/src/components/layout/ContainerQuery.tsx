// src/components/layout/ContainerQuery.tsx
import React, { ReactNode } from 'react';

type ContainerType = 'component' | 'layout' | 'card' | 'sidebar' | 'content' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ContainerQueryProps {
  children: ReactNode;
  type?: ContainerType;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

/**
 * ContainerQuery component
 * Creates a container context for component-level responsive design
 * using CSS container queries
 */
export const ContainerQuery: React.FC<ContainerQueryProps> = ({
  children,
  type = 'component',
  name,
  className = '',
  style,
  as: Component = 'div'
}) => {
  // Build class names
  let classNames = '';
  
  // Add container context class based on type
  if (type === 'component') {
    classNames += 'container-context ';
  } else if (type === 'layout') {
    classNames += 'layout-context ';
  } else if (type === 'card') {
    classNames += 'card-context ';
  } else if (type === 'sidebar') {
    classNames += 'sidebar-context ';
  } else if (type === 'content') {
    classNames += 'content-context ';
  } else {
    classNames += `container-${type} `;
  }
  
  if (className) {
    classNames += className;
  }
  
  // Create custom container name if provided
  const containerStyle = name
    ? {
        ...style,
        containerName: name
      }
    : style;
  
  return (
    <Component className={classNames.trim()} style={containerStyle}>
      {children}
    </Component>
  );
};

export default ContainerQuery;
