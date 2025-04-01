// src/components/sync/SyncStatusPanel.tsx
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Badge,
  Paper,
  Typography,
  LinearProgress,
  styled,
  Snackbar,
  Alert
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
import SyncErrorDialog from './SyncErrorDialog';
import { S3ErrorType } from '../../services/s3SyncService';

// Mobile implementation with just an icon and badge
const MobileSyncStatus = styled(Box)(() => ({
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
  const { syncStatus, syncMindMap, isLoading, lastSyncTime, syncError, syncErrorDetails } = useMindMap();
  const { t } = useI18n();
  const { viewport } = useResponsive();

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [syncSnackbarOpen, setSyncSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Use real values or fallbacks
  const queuedChanges = 0; // This would come from the context in a real implementation
  const syncProgress = syncStatus === 'syncing' ? 70 : 0; // Example progress value

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
      // Attempt to sync and handle the result
      syncMindMap().then(result => {
        if (result && result.success) {
          setSnackbarSeverity('success');
          setSnackbarMessage(t('sync.syncSuccessful'));
          setSyncSnackbarOpen(true);
        } else if (result && result.error) {
          // Show error dialog instead of just a snackbar for errors
          setErrorDialogOpen(true);
        }
      }).catch(() => {
        // Handle any unexpected errors
        setSnackbarSeverity('error');
        setSnackbarMessage(t('sync.unexpectedError'));
        setSyncSnackbarOpen(true);
      });
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSyncSnackbarOpen(false);
  };

  // Mobile view - just icon with badge that opens dialog on click
  if (viewport.isMobile) {
    return (
      <>
        <MobileSyncStatus>
          <IconButton
            size="small"
            onClick={handleSync}
            disabled={syncStatus === 'syncing' || isLoading}
          >
            <Badge badgeContent={queuedChanges > 0 ? queuedChanges : undefined} color="primary">
              <Tooltip title={getStatusText()}>
                {getStatusIcon()}
              </Tooltip>
            </Badge>
          </IconButton>
        </MobileSyncStatus>

        {/* Error Dialog */}
        <SyncErrorDialog
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          errorType={syncError as S3ErrorType}
          errorDetails={syncErrorDetails}
        />

        {/* Success/Info Snackbar */}
        <Snackbar
          open={syncSnackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Tablet view - icon with text and action button
  if (viewport.isTablet) {
    return (
      <>
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

        {/* Error Dialog */}
        <SyncErrorDialog
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          errorType={syncError as S3ErrorType}
          errorDetails={syncErrorDetails}
        />

        {/* Success/Info Snackbar */}
        <Snackbar
          open={syncSnackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Desktop view - detailed panel
  return (
    <>
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

      {/* Error Dialog */}
      <SyncErrorDialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        errorType={syncError as S3ErrorType}
        errorDetails={syncErrorDetails}
      />

      {/* Success/Info Snackbar */}
      <Snackbar
        open={syncSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SyncStatusPanel;
