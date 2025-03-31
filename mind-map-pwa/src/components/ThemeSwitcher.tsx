// src/components/ThemeSwitcher.tsx
import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Brightness4, Brightness7, SettingsBrightness } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useTheme();
  const { t } = useI18n();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleClose();
  };

  const getThemeIcon = () => {
    if (mode === 'system') return <SettingsBrightness />;
    if (mode === 'dark') return <Brightness4 />;
    return <Brightness7 />;
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        size="large"
        color="inherit"
        aria-label="change theme"
      >
        {getThemeIcon()}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleThemeChange('system')}>{t('theme.system')}</MenuItem>
        <MenuItem onClick={() => handleThemeChange('light')}>{t('theme.light')}</MenuItem>
        <MenuItem onClick={() => handleThemeChange('dark')}>{t('theme.dark')}</MenuItem>
      </Menu>
    </div>
  );
};

export default ThemeSwitcher;
