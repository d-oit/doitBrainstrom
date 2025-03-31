// src/components/SyncStatus.tsx
import React from 'react';
import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { CloudDone, CloudOff, CloudSync, CloudUpload, Refresh } from '@mui/icons-material';
import { useMindMap } from '../contexts/MindMapContext';
import { useI18n } from '../contexts/I18nContext';

const SyncStatus: React.FC = () => {
  const { syncStatus, syncMindMap, isLoading } = useMindMap();
  const { t } = useI18n();
  
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
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={getStatusText()}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          {getStatusIcon()}
        </Box>
      </Tooltip>
      
      <Tooltip title={t('sync.refresh')}>
        <IconButton 
          size="small" 
          onClick={handleSync}
          disabled={syncStatus === 'syncing' || isLoading}
          aria-label={t('sync.refresh')}
        >
          <Refresh />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SyncStatus;
