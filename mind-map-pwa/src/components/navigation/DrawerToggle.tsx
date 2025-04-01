// src/components/navigation/DrawerToggle.tsx
import React from 'react';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useI18n } from '../../contexts/I18nContext';

interface DrawerToggleProps {
  onClick: () => void;
  className?: string;
}

const DrawerToggle: React.FC<DrawerToggleProps> = ({ onClick, className = '' }) => {
  const { t } = useI18n();
  
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