// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, Stack, Divider } from '@mui/material';
import ThemeSwitcher from './ThemeSwitcher';
import LocaleSwitcher from './LocaleSwitcher';
import SyncStatusPanel from './sync/SyncStatusPanel';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import OfflineIndicator from './offline/OfflineIndicator';
import { useI18n } from '../contexts/I18nContext';
import { useResponsive } from '../contexts/ResponsiveContext';
// Import sanitization utility
import { sanitizeTextInput } from '../utils/inputSanitization';
// Import new responsive components
import { ResponsiveGrid, ResponsiveGridItem } from './layout/ResponsiveGrid';
import ContainerQuery from './layout/ContainerQuery';
import { Heading1, Paragraph } from './typography/FluidTypography';
import TouchFriendly from './touch/TouchFriendly';
// Import accessibility components
import AccessibilityMenu from './accessibility/AccessibilityMenu';
import SkipLinks from './accessibility/SkipLinks';
// Import navigation components
import NavigationDrawer from './navigation/NavigationDrawer';
import DrawerToggle from './navigation/DrawerToggle';
import Breadcrumbs from './navigation/Breadcrumbs';
// Import navigation storage service
import { getDrawerState, setDrawerState } from '../services/navigationStorageService';
// Import CSS
import '../styles/drawer.css';
import '../styles/breadcrumbs.css';

interface LayoutProps {
  children: React.ReactNode;
  currentTab?: number;
  onTabChange?: (tabIndex: number) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentTab = 0, 
  onTabChange = () => {} 
}) => {
  const { t, dir } = useI18n();
  const { viewport } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initialize drawer state from localStorage
  useEffect(() => {
    const initDrawerState = () => {
      const storedState = getDrawerState();
      setDrawerOpen(storedState);
    };
    
    initDrawerState();
  }, []);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    const newState = !drawerOpen;
    setDrawerOpen(newState);
    setDrawerState(newState);
  };

  // Sanitize any text that might come from translations
  const appTitle = sanitizeTextInput(t('app.title'));

  return (
    <Box sx={{
      direction: dir,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%'
    }} className="app-container">
      {/* Skip links for keyboard navigation */}
      <SkipLinks links={[
        { id: 'main-content', label: t('accessibility.skipToMainContent') },
        { id: 'navigation', label: t('accessibility.skipToNavigation') }
      ]} />

      {/* Navigation Drawer */}
      <NavigationDrawer 
        open={drawerOpen} 
        onClose={handleDrawerToggle}
        currentTab={currentTab}
        onTabChange={onTabChange}
      />

      {/* Use semantic header element with safe area padding */}
      <header className="safe-area-top" role="banner">
        {/* Show offline banner for tablet view */}
        {viewport.isTablet && <OfflineIndicator />}

        <AppBar position="static">
          <Toolbar sx={{
            minHeight: viewport.layout.toolbarHeight,
            px: { xs: 1, sm: 2, md: 3 }
          }}>
            {/* Drawer Toggle Button */}
            <DrawerToggle onClick={handleDrawerToggle} />
            
            <ContainerQuery type="component">
              <Heading1
                className="card-title"
                style={{ flexGrow: 1, marginLeft: '16px' }}
                aria-label="Application title"
              >
                {appTitle}
              </Heading1>
            </ContainerQuery>
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems="center"
              role="toolbar"
              aria-label="Application tools"
              className="toolbar-context"
            >
              <TouchFriendly>
                <NetworkStatusIndicator />
              </TouchFriendly>
              {!viewport.isMobile && (
                <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 } }} />
              )}
              <TouchFriendly>
                <SyncStatusPanel />
              </TouchFriendly>
              {!viewport.isMobile && (
                <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.25, sm: 0.5 } }} />
              )}
              <TouchFriendly>
                <LocaleSwitcher />
              </TouchFriendly>
              <TouchFriendly>
                <ThemeSwitcher />
              </TouchFriendly>
              <TouchFriendly>
                <AccessibilityMenu />
              </TouchFriendly>
            </Stack>
          </Toolbar>
        </AppBar>
      </header>

      {/* Show mobile and desktop offline indicators */}
      {(viewport.isMobile || viewport.isDesktop || viewport.isWidescreen) && <OfflineIndicator />}

      {/* Use semantic main element with responsive padding */}
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label={t('accessibility.mainContent')}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        className={`main-content ${drawerOpen && !viewport.isMobile ? 'drawer-open' : ''}`}
      >
        <ResponsiveGrid
          container
          fluid={false}
          gap="md"
          safeArea
          className="content-context"
        >
          <ResponsiveGridItem xs={12}>
            {/* Breadcrumbs */}
            <Breadcrumbs currentTab={currentTab} onTabChange={onTabChange} />
            
            <ContainerQuery type="content">
              <Box className="content-grid" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
              </Box>
            </ContainerQuery>
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </main>

      {/* Add semantic footer with safe area padding */}
      <footer 
        className={`safe-area-bottom ${drawerOpen && !viewport.isMobile ? 'drawer-open' : ''}`} 
        role="contentinfo" 
        aria-label={t('accessibility.footerInfo')}
      >
        <ResponsiveGrid container fluid={false} gap="md">
          <ResponsiveGridItem xs={12}>
            <Box sx={{
              py: { xs: 2, sm: 3 },
              textAlign: 'center',
              mb: viewport.safeAreaInsets.bottom > 0 ? 0 : undefined
            }}>
              <Paragraph className="text-sm">
                © {new Date().getFullYear()} d.o. Brainstroming
              </Paragraph>
              <Box className="sr-only" aria-live="polite" id="screen-reader-announcements"></Box>
            </Box>
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </footer>
    </Box>
  );
};

export default Layout;
