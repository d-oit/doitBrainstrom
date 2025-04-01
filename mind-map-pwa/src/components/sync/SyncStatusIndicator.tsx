// src/components/sync/SyncStatusIndicator.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  Typography,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  styled
} from '@mui/material';
import {
  CloudSync,
  CloudOff,
  CloudDone,
  CloudQueue,
  Warning,
  Error as ErrorIcon,
  Settings,
  Refresh
} from '@mui/icons-material';
import { useI18n } from '../../contexts/I18nContext';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { formatDistanceToNow } from 'date-fns';
import {
  getSyncStatus,
  syncMindMapData,
  processPendingOperations,
  enableBackgroundSync,
  disableBackgroundSync,
  S3ErrorType
} from '../../services/enhancedS3SyncService';

// Styled components
const SyncStatusContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const SyncStatusText = styled(Typography)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'block'
  }
}));

// SyncStatusIndicator component
const SyncStatusIndicator: React.FC = () => {
  const { t } = useI18n();
  const { network } = useResponsive();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(false);
  
  const open = Boolean(anchorEl);
  
  // Fetch sync status on mount and periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSyncStatus();
        setSyncStatus(status);
        setBackgroundSyncEnabled(status.isBackgroundSyncEnabled);
      } catch (error) {
        console.error('Error fetching sync status:', error);
      }
    };
    
    // Initial fetch
    fetchStatus();
    
    // Set up interval for periodic updates
    const intervalId = setInterval(fetchStatus, 10000); // Every 10 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Handle menu open
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle sync button click
  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const result = await syncMindMapData('default', true);
      
      if (!result.success) {
        setSyncError(result.details || t('sync.unknownError'));
      }
    } catch (error) {
      setSyncError((error as Error).message);
    } finally {
      setIsSyncing(false);
      
      // Refresh status
      try {
        const status = await getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error('Error fetching sync status:', error);
      }
    }
  };
  
  // Handle process pending operations
  const handleProcessPending = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const result = await processPendingOperations();
      
      if (!result.success) {
        setSyncError(result.details || t('sync.unknownError'));
      }
    } catch (error) {
      setSyncError((error as Error).message);
    } finally {
      setIsSyncing(false);
      
      // Refresh status
      try {
        const status = await getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error('Error fetching sync status:', error);
      }
    }
  };
  
  // Handle background sync toggle
  const handleBackgroundSyncToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setBackgroundSyncEnabled(enabled);
    
    if (enabled) {
      enableBackgroundSync();
    } else {
      disableBackgroundSync();
    }
  };
  
  // Get sync status icon
  const getSyncStatusIcon = () => {
    if (!syncStatus) {
      return <CloudQueue color="disabled" />;
    }
    
    if (isSyncing) {
      return <CircularProgress size={24} />;
    }
    
    if (!network.online) {
      return <CloudOff color="error" />;
    }
    
    if (!syncStatus.isS3Configured) {
      return <CloudQueue color="disabled" />;
    }
    
    if (!syncStatus.isS3Available) {
      return <CloudOff color="error" />;
    }
    
    if (syncStatus.lastError) {
      return <Warning color="warning" />;
    }
    
    if (syncStatus.pendingOperations > 0) {
      return <CloudSync color="info" />;
    }
    
    return <CloudDone color="success" />;
  };
  
  // Get sync status text
  const getSyncStatusText = () => {
    if (!syncStatus) {
      return t('sync.status.loading');
    }
    
    if (isSyncing) {
      return t('sync.status.syncing');
    }
    
    if (!network.online) {
      return t('sync.status.offline');
    }
    
    if (!syncStatus.isS3Configured) {
      return t('sync.status.notConfigured');
    }
    
    if (!syncStatus.isS3Available) {
      return t('sync.status.unavailable');
    }
    
    if (syncStatus.pendingOperations > 0) {
      return t('sync.status.pendingOperations', { count: syncStatus.pendingOperations });
    }
    
    if (syncStatus.lastSyncTime) {
      return t('sync.status.lastSynced', {
        time: formatDistanceToNow(new Date(syncStatus.lastSyncTime), { addSuffix: true })
      });
    }
    
    return t('sync.status.ready');
  };
  
  // Get error message for the current error
  const getErrorMessage = () => {
    if (!syncStatus?.lastError && !syncError) {
      return null;
    }
    
    const error = syncError || syncStatus?.lastError?.details;
    const errorType = syncStatus?.lastError?.type;
    
    if (errorType === S3ErrorType.NOT_CONFIGURED) {
      return t('sync.error.notConfigured');
    }
    
    if (errorType === S3ErrorType.ACCESS_DENIED) {
      return t('sync.error.accessDenied');
    }
    
    if (errorType === S3ErrorType.NETWORK_ERROR) {
      return t('sync.error.networkError');
    }
    
    if (errorType === S3ErrorType.CONFLICT_DETECTED) {
      return t('sync.error.conflictDetected');
    }
    
    return error || t('sync.error.unknown');
  };
  
  return (
    <Box>
      <Tooltip title={getSyncStatusText()}>
        <IconButton
          onClick={handleClick}
          size="large"
          color="inherit"
          aria-label={t('sync.status.label')}
        >
          <Badge
            color={syncStatus?.pendingOperations > 0 ? 'warning' : 'default'}
            badgeContent={syncStatus?.pendingOperations > 0 ? syncStatus.pendingOperations : 0}
            overlap="circular"
          >
            {getSyncStatusIcon()}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 250, maxWidth: 350 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('sync.status.title')}
          </Typography>
          
          <SyncStatusContainer>
            {getSyncStatusIcon()}
            <SyncStatusText variant="body2">
              {getSyncStatusText()}
            </SyncStatusText>
          </SyncStatusContainer>
          
          {(syncStatus?.lastError || syncError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {getErrorMessage()}
            </Alert>
          )}
          
          {syncStatus?.pendingOperations > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('sync.pendingOperations', { count: syncStatus.pendingOperations })}
            </Typography>
          )}
          
          {syncStatus?.lastSyncTime && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('sync.lastSynced', {
                time: new Date(syncStatus.lastSyncTime).toLocaleString()
              })}
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        <MenuItem
          onClick={handleSync}
          disabled={isSyncing || !network.online || !syncStatus?.isS3Available}
        >
          <Refresh sx={{ mr: 1 }} />
          {t('sync.syncNow')}
        </MenuItem>
        
        {syncStatus?.pendingOperations > 0 && (
          <MenuItem
            onClick={handleProcessPending}
            disabled={isSyncing || !network.online || !syncStatus?.isS3Available}
          >
            <CloudSync sx={{ mr: 1 }} />
            {t('sync.processPending')}
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={backgroundSyncEnabled}
                onChange={handleBackgroundSyncToggle}
                disabled={!network.online || !syncStatus?.isS3Available}
                size="small"
              />
            }
            label={t('sync.backgroundSync')}
          />
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <Settings sx={{ mr: 1 }} />
          {t('sync.settings')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SyncStatusIndicator;
