// src/components/sync/SyncErrorDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle
} from '@mui/material';
import { CloudOff, Info } from '@mui/icons-material';
import { useI18n } from '../../contexts/I18nContext';
import { S3ErrorType } from '../../services/s3SyncService';

interface SyncErrorDialogProps {
  open: boolean;
  onClose: () => void;
  errorType: S3ErrorType | undefined;
  errorDetails?: string;
}

const SyncErrorDialog: React.FC<SyncErrorDialogProps> = ({
  open,
  onClose,
  errorType,
  errorDetails
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getErrorTitle = () => {
    switch (errorType) {
      case S3ErrorType.ACCESS_DENIED:
        return t('sync.errors.accessDeniedTitle');
      case S3ErrorType.NETWORK_ERROR:
        return t('sync.errors.networkErrorTitle');
      case S3ErrorType.NOT_CONFIGURED:
        return t('sync.errors.notConfiguredTitle');
      case S3ErrorType.INITIALIZATION_FAILED:
        return t('sync.errors.initFailedTitle');
      default:
        return t('sync.errors.genericErrorTitle');
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case S3ErrorType.ACCESS_DENIED:
        return t('sync.errors.accessDeniedMessage');
      case S3ErrorType.NETWORK_ERROR:
        return t('sync.errors.networkErrorMessage');
      case S3ErrorType.NOT_CONFIGURED:
        return t('sync.errors.notConfiguredMessage');
      case S3ErrorType.INITIALIZATION_FAILED:
        return t('sync.errors.initFailedMessage');
      default:
        return t('sync.errors.genericErrorMessage');
    }
  };

  const getErrorSolution = () => {
    switch (errorType) {
      case S3ErrorType.ACCESS_DENIED:
        return t('sync.errors.accessDeniedSolution');
      case S3ErrorType.NETWORK_ERROR:
        return t('sync.errors.networkErrorSolution');
      case S3ErrorType.NOT_CONFIGURED:
        return t('sync.errors.notConfiguredSolution');
      case S3ErrorType.INITIALIZATION_FAILED:
        return t('sync.errors.initFailedSolution');
      default:
        return t('sync.errors.genericErrorSolution');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'error.light',
        color: 'error.contrastText'
      }}>
        <CloudOff />
        {getErrorTitle()}
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>{t('sync.errors.localStorageNote')}</AlertTitle>
          {t('sync.errors.dataNotLost')}
        </Alert>

        <Typography variant="body1" sx={{ mt: 3, mb: 1 }}>
          {getErrorMessage()}
        </Typography>

        {errorDetails && (
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              my: 2,
              maxHeight: '100px',
              overflow: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'monospace'
            }}
          >
            {errorDetails}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 2 }}>
          <Info color="info" sx={{ mt: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {getErrorSolution()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t('common.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncErrorDialog;
