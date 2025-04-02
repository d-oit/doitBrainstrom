// src/components/navigation/NavigationLink.tsx
import React, { ReactNode, KeyboardEvent } from 'react';

interface NavigationLinkProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  ariaControls?: string;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  icon,
  label,
  active,
  onClick,
  ariaControls
}) => {
  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
      event.preventDefault();
    }
  };

  return (
    <button
      className={`drawer-nav-link ${active ? 'active' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-current={active ? "page" : undefined}
      {...(ariaControls ? { 'aria-controls': ariaControls } : {})}
      type="button"
      tabIndex={0}
      role="menuitem"
    >
      <span className="drawer-nav-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default NavigationLink;