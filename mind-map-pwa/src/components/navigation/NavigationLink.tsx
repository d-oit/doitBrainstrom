// src/components/navigation/NavigationLink.tsx
import React, { ReactNode } from 'react';

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
  return (
    <button
      className={`drawer-nav-link ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      {...(ariaControls ? { 'aria-controls': ariaControls } : {})}
      type="button"
    >
      <span className="drawer-nav-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default NavigationLink;