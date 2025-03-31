// src/components/Layout.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Stack, Divider } from '@mui/material';
import ThemeSwitcher from './ThemeSwitcher';
import LocaleSwitcher from './LocaleSwitcher';
import SyncStatus from './SyncStatus';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import { useI18n } from '../contexts/I18nContext';
// Import sanitization utility
import { sanitizeTextInput } from '../utils/inputSanitization';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, dir } = useI18n();

  // Sanitize any text that might come from translations
  const appTitle = sanitizeTextInput(t('app.title'));

  return (
    <Box sx={{ direction: dir }} className="app-container">
      {/* Use semantic header element */}
      <header>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }} aria-label="Application title">
              {appTitle}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" role="toolbar" aria-label="Application tools">
              <NetworkStatusIndicator />
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <SyncStatus />
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <LocaleSwitcher />
              <ThemeSwitcher />
            </Stack>
          </Toolbar>
        </AppBar>
      </header>

      {/* Use semantic main element */}
      <main id="main-content" tabIndex={-1}>
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          <Box sx={{ my: 2 }}>
            {children}
          </Box>
        </Container>
      </main>

      {/* Add semantic footer */}
      <footer>
        <Container maxWidth="lg">
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Mind Map PWA
            </Typography>
          </Box>
        </Container>
      </footer>
    </Box>
  );
};

export default Layout;
