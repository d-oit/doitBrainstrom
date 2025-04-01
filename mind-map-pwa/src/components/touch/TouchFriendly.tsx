// src/components/touch/TouchFriendly.tsx
import React, { ReactNode } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';

interface TouchFriendlyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchMove?: (event: React.TouchEvent<HTMLElement>) => void;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
  preventSelection?: boolean;
}

/**
 * TouchFriendly component
 * Enhances elements with touch-friendly properties
 * such as proper hit areas and touch feedback
 */
export const TouchFriendly: React.FC<TouchFriendlyProps> = ({
  children,
  className = '',
  style,
  as: Component = 'div',
  disabled = false,
  onClick,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  role,
  tabIndex,
  ariaLabel,
  preventSelection = true
}) => {
  const { viewport } = useResponsive();
  
  // Only apply touch-friendly classes on touch devices
  const isTouchDevice = !viewport.isDesktop && !viewport.isWidescreen;
  
  // Build class names
  let classNames = 'interactive';
  
  if (isTouchDevice) {
    classNames += ' touch-target';
  }
  
  if (preventSelection) {
    classNames += ' no-select';
  }
  
  if (disabled) {
    classNames += ' disabled';
  }
  
  if (className) {
    classNames += ` ${className}`;
  }
  
  // Build props
  const props: any = {
    className: classNames.trim(),
    style,
    onClick: disabled ? undefined : onClick,
    onTouchStart: disabled ? undefined : onTouchStart,
    onTouchEnd: disabled ? undefined : onTouchEnd,
    onTouchMove: disabled ? undefined : onTouchMove
  };
  
  // Add accessibility attributes
  if (role) {
    props.role = role;
  }
  
  if (tabIndex !== undefined) {
    props.tabIndex = tabIndex;
  } else if (onClick && !disabled) {
    props.tabIndex = 0;
  }
  
  if (ariaLabel) {
    props['aria-label'] = ariaLabel;
  }
  
  if (disabled) {
    props['aria-disabled'] = true;
  }
  
  return <Component {...props}>{children}</Component>;
};

// Specialized touch-friendly components
export const TouchFriendlyButton: React.FC<Omit<TouchFriendlyProps, 'as' | 'role'>> = (props) => (
  <TouchFriendly {...props} as="button" role="button" />
);

export const TouchFriendlyLink: React.FC<
  TouchFriendlyProps & { href?: string; target?: string; rel?: string }
> = ({ href, target, rel, ...props }) => (
  <TouchFriendly
    {...props}
    as="a"
    role="link"
    style={{ ...props.style, cursor: 'pointer' }}
    {...(href && { href })}
    {...(target && { target })}
    {...(target === '_blank' && { rel: rel || 'noopener noreferrer' })}
  />
);

export const TouchFriendlyCheckbox: React.FC<
  Omit<TouchFriendlyProps, 'as' | 'role'> & { checked?: boolean; onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }
> = ({ children, checked, onChange, className = '', ...props }) => (
  <label className={`touch-friendly-checkbox ${className}`.trim()}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={props.disabled}
    />
    <TouchFriendly {...props}>{children}</TouchFriendly>
  </label>
);

export const TouchFriendlyRadio: React.FC<
  Omit<TouchFriendlyProps, 'as' | 'role'> & {
    checked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    value?: string;
  }
> = ({ children, checked, onChange, name, value, className = '', ...props }) => (
  <label className={`touch-friendly-radio ${className}`.trim()}>
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      name={name}
      value={value}
      disabled={props.disabled}
    />
    <TouchFriendly {...props}>{children}</TouchFriendly>
  </label>
);

export default TouchFriendly;
