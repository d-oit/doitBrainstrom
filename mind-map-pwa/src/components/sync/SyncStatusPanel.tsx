// src/components/sync/SyncStatusPanel.tsx
import React from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  Badge, 
  Paper, 
  Typography, 
  LinearProgress,
  styled
} from '@mui/material';
import { 
  CloudDone, 
  CloudOff, 
  CloudSync, 
  CloudUpload, 
  Refresh 
} from '@mui/icons-material';
import { useMindMap } from '../../contexts/MindMapContext';
import { useI18n } from '../../contexts/I18nContext';
import { useResponsive } from '../../contexts/ResponsiveContext';

// Mobile implementation with just an icon and badge
const MobileSyncStatus = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Desktop implementation with detailed panel
const DesktopSyncPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: 320,
  maxWidth: '100%',
}));

export const SyncStatusPanel: React.FC = () => {
  const { syncStatus, syncMindMap, isLoading, lastSyncTime, queuedChanges = 0, syncProgress = 0 } = useMindMap();
  const { t } = useI18n();
  const { viewport } = useResponsive();

  const getStatusIcon = () => {
    if (isLoading) {
      return <CircularProgress size={24} />;
    }

    switch (syncStatus) {
      case 'success':
        return <CloudDone color="success" />;
      case 'error':
        return <CloudOff color="error" />;
      case 'syncing':
        return <CloudSync color="info" />;
      case 'idle':
        return <CloudUpload color="action" />;
      default:
        return <CloudUpload color="action" />;
    }
  };

  const getStatusText = () => {
    if (isLoading) {
      return t('sync.loading');
    }

    switch (syncStatus) {
      case 'success':
        return t('sync.success');
      case 'error':
        return t('sync.error');
      case 'syncing':
        return t('sync.syncing');
      case 'idle':
        return t('sync.idle');
      default:
        return t('sync.idle');
    }
  };

  const handleSync = () => {
    if (syncStatus !== 'syncing' && !isLoading) {
      syncMindMap();
    }
  };

  // Mobile view - just icon with badge
  if (viewport.isMobile) {
    return (
      <MobileSyncStatus>
        <IconButton size="small">
          <Badge badgeContent={queuedChanges > 0 ? queuedChanges : undefined} color="primary">
            <Tooltip title={getStatusText()}>
              {getStatusIcon()}
            </Tooltip>
          </Badge>
        </IconButton>
      </MobileSyncStatus>
    );
  }

  // Tablet view - icon with text
  if (viewport.isTablet) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={getStatusText()}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            {getStatusIcon()}
          </Box>
        </Tooltip>

        <Tooltip title={t('sync.refresh')}>
          <span>
            <IconButton
              size="small"
              onClick={handleSync}
              disabled={syncStatus === 'syncing' || isLoading}
              aria-label={t('sync.refresh')}
            >
              <Refresh />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  }

  // Desktop view - detailed panel
  return (
    <DesktopSyncPanel elevation={2}>
      <Typography variant="h6">{t('sync.status')}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {getStatusIcon()}
        <Typography variant="body2" sx={{ ml: 1 }}>
          {getStatusText()}
        </Typography>
      </Box>
      
      <LinearProgress 
        variant={syncStatus === 'syncing' ? "indeterminate" : "determinate"} 
        value={syncProgress} 
      />
      
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          {t('sync.lastSynced')}: {lastSyncTime || t('sync.never')}
        </Typography>
        <Typography variant="body2">
          {t('sync.queuedChanges')}: {queuedChanges}
        </Typography>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          onClick={handleSync}
          disabled={syncStatus === 'syncing' || isLoading}
          aria-label={t('sync.refresh')}
          size="small"
        >
          <Refresh />
        </IconButton>
      </Box>
    </DesktopSyncPanel>
  );
};

export default SyncStatusPanel;
