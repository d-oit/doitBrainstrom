// src/components/navigation/DrawerToggle.tsx
import React from 'react';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useI18n } from '../../contexts/I18nContext';
import { useResponsive } from '../../contexts/ResponsiveContext';

interface DrawerToggleProps {
  onClick: () => void;
  className?: string;
}

const DrawerToggle: React.FC<DrawerToggleProps> = ({ onClick, className = '' }) => {
  const { t } = useI18n();
  const { viewport } = useResponsive();

  // Only show the toggle button on mobile devices
  // On desktop/tablet, the sidebar is always visible
  if (!viewport.isMobile) {
    return null;
  }

  return (
    <IconButton
      className={`drawer-toggle ${className}`}
      onClick={onClick}
      aria-label={t('navigation.openDrawer')}
      aria-controls="navigation"
      aria-expanded="false"
      size="large"
    >
      <MenuIcon />
    </IconButton>
  );
};

export default DrawerToggle;