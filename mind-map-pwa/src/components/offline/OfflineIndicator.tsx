// src/components/offline/OfflineIndicator.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, AppBar, Typography, Slide } from '@mui/material';
import { WifiOff as WifiOffIcon } from '@mui/icons-material';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { useI18n } from '../../contexts/I18nContext';

// Mobile view offline indicator (bottom toast)
const MobileOfflineIndicator = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.contrastText,
  textAlign: 'center',
  zIndex: theme.zIndex.snackbar,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  boxShadow: theme.shadows[3],
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

// Tablet+ layout offline banner
const TabletOfflineBanner = styled(AppBar)(({ theme }) => ({
  position: 'static',
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.contrastText,
  flexDirection: 'row',
  gap: theme.spacing(1),
}));

// Desktop status bar for offline indicator
const DesktopOfflineStatusBar = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 'auto',
  bottom: 0,
  left: 0,
  right: 0,
  height: 28,
  backgroundColor: theme.palette.warning.main,
  color: theme.palette.warning.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  zIndex: theme.zIndex.appBar - 1,
  fontSize: '0.875rem',
}));

export const OfflineIndicator: React.FC = () => {
  const { network, viewport } = useResponsive();
  const { t } = useI18n();

  // Don't show anything if online
  if (network.online) {
    return null;
  }

  // Mobile view (bottom toast)
  if (viewport.isMobile) {
    return (
      <Slide direction="up" in={!network.online} mountOnEnter unmountOnExit>
        <MobileOfflineIndicator className="safe-area-bottom">
          <WifiOffIcon fontSize="small" />
          <Typography variant="body2">{t('network.offlineMode')}</Typography>
        </MobileOfflineIndicator>
      </Slide>
    );
  }

  // Tablet view (top banner)
  if (viewport.isTablet) {
    return (
      <TabletOfflineBanner>
        <WifiOffIcon fontSize="small" />
        <Typography variant="body2">{t('network.offlineMode')}</Typography>
      </TabletOfflineBanner>
    );
  }

  // Desktop view (status bar)
  return (
    <DesktopOfflineStatusBar className="safe-area-bottom">
      <WifiOffIcon fontSize="small" />
      <Typography variant="caption">
        {t('network.offlineMode')} - {t('network.offlineDetails')}
      </Typography>
    </DesktopOfflineStatusBar>
  );
};

export default OfflineIndicator;
