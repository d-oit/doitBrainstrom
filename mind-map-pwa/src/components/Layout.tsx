// src/components/Layout.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Stack } from '@mui/material';
import ThemeSwitcher from './ThemeSwitcher';
import LocaleSwitcher from './LocaleSwitcher';
import SyncStatus from './SyncStatus';
import { useI18n } from '../contexts/I18nContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, dir } = useI18n();

  return (
    <Box sx={{ direction: dir }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <SyncStatus />
            <LocaleSwitcher />
            <ThemeSwitcher />
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ my: 2 }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default Layout;
