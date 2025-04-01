// src/components/Layout.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Stack, Divider, useTheme as useMuiTheme } from '@mui/material';
import ThemeSwitcher from './ThemeSwitcher';
import LocaleSwitcher from './LocaleSwitcher';
import SyncStatusPanel from './sync/SyncStatusPanel';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import OfflineIndicator from './offline/OfflineIndicator';
import { useI18n } from '../contexts/I18nContext';
import { useResponsive } from '../contexts/ResponsiveContext';
// Import sanitization utility
import { sanitizeTextInput } from '../utils/inputSanitization';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, dir } = useI18n();
  const { viewport } = useResponsive();
  const muiTheme = useMuiTheme();

  // Sanitize any text that might come from translations
  const appTitle = sanitizeTextInput(t('app.title'));

  return (
    <Box sx={{ direction: dir }} className="app-container">
      {/* Use semantic header element with safe area padding */}
      <header className="safe-area-top">
        {/* Show offline banner for tablet view */}
        {viewport.isTablet && <OfflineIndicator />}

        <AppBar position="static">
          <Toolbar sx={{
            minHeight: viewport.layout.toolbarHeight,
            px: { xs: 1, sm: 2, md: 3 }
          }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                flexGrow: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
              aria-label="Application title"
            >
              {appTitle}
            </Typography>
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems="center"
              role="toolbar"
              aria-label="Application tools"
            >
              <NetworkStatusIndicator />
              {!viewport.isMobile && (
                <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 } }} />
              )}
              <SyncStatusPanel />
              {!viewport.isMobile && (
                <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 } }} />
              )}
              <LocaleSwitcher />
              <ThemeSwitcher />
            </Stack>
          </Toolbar>
        </AppBar>
      </header>

      {/* Show mobile and desktop offline indicators */}
      {(viewport.isMobile || viewport.isDesktop || viewport.isWidescreen) && <OfflineIndicator />}

      {/* Use semantic main element with responsive padding */}
      <main id="main-content" tabIndex={-1}>
        <Container
          maxWidth="lg"
          sx={{
            mt: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2, md: 3 }
          }}
          className="safe-area-left safe-area-right"
        >
          <Box sx={{ my: { xs: 1, sm: 2 } }}>
            {children}
          </Box>
        </Container>
      </main>

      {/* Add semantic footer with safe area padding */}
      <footer className="safe-area-bottom">
        <Container maxWidth="lg">
          <Box sx={{
            py: { xs: 2, sm: 3 },
            textAlign: 'center',
            mb: viewport.safeAreaInsets.bottom > 0 ? 0 : undefined
          }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} d.o. Brainstroming
            </Typography>
          </Box>
        </Container>
      </footer>
    </Box>
  );
};

export default Layout;
