// src/components/LocaleSwitcher.tsx
import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Language } from '@mui/icons-material';
import { useI18n, SUPPORTED_LOCALES } from '../contexts/I18nContext';

const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    handleClose();
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        size="large"
        color="inherit"
        aria-label="change language"
      >
        <Language />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {SUPPORTED_LOCALES.map((localeOption) => (
          <MenuItem 
            key={localeOption.code}
            onClick={() => handleLocaleChange(localeOption.code)}
            selected={locale === localeOption.code}
          >
            {localeOption.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LocaleSwitcher;
