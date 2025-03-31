// src/components/NetworkStatusIndicator.tsx
import React from 'react';
import { Box, Tooltip, Typography, Badge } from '@mui/material';
import { 
  Wifi as WifiIcon, 
  WifiOff as WifiOffIcon,
  SignalCellular4Bar as HighSignalIcon,
  SignalCellular2Bar as MediumSignalIcon,
  SignalCellular0Bar as LowSignalIcon,
  DataSaverOn as DataSaverIcon
} from '@mui/icons-material';
import { useResponsive } from '../contexts/ResponsiveContext';
import { useI18n } from '../contexts/I18nContext';

const NetworkStatusIndicator: React.FC = () => {
  const { network } = useResponsive();
  const { t } = useI18n();
  
  // Determine connection quality icon
  const getConnectionIcon = () => {
    if (!network.online) {
      return <WifiOffIcon color="error" fontSize="small" />;
    }
    
    if (network.saveData) {
      return <DataSaverIcon color="warning" fontSize="small" />;
    }
    
    if (!network.effectiveType) {
      return <WifiIcon color="success" fontSize="small" />;
    }
    
    switch (network.effectiveType) {
      case '4g':
        return <HighSignalIcon color="success" fontSize="small" />;
      case '3g':
        return <MediumSignalIcon color="info" fontSize="small" />;
      case '2g':
      case 'slow-2g':
        return <LowSignalIcon color="warning" fontSize="small" />;
      default:
        return <WifiIcon color="success" fontSize="small" />;
    }
  };
  
  // Get connection quality text
  const getConnectionText = () => {
    if (!network.online) {
      return t('network.offline');
    }
    
    if (network.saveData) {
      return t('network.dataSaver');
    }
    
    if (!network.effectiveType) {
      return t('network.unknown');
    }
    
    switch (network.effectiveType) {
      case '4g':
        return t('network.fast');
      case '3g':
        return t('network.medium');
      case '2g':
      case 'slow-2g':
        return t('network.slow');
      default:
        return t('network.unknown');
    }
  };
  
  // Get detailed tooltip text
  const getTooltipText = () => {
    if (!network.online) {
      return t('network.offlineDetails');
    }
    
    let details = network.connectionType 
      ? `${t('network.type')}: ${network.connectionType}` 
      : '';
      
    if (network.downlink) {
      details += details ? ', ' : '';
      details += `${t('network.speed')}: ${network.downlink} Mbps`;
    }
    
    if (network.rtt) {
      details += details ? ', ' : '';
      details += `${t('network.latency')}: ${network.rtt}ms`;
    }
    
    if (network.saveData) {
      details += details ? ', ' : '';
      details += t('network.dataSaverEnabled');
    }
    
    return details || t('network.unknownDetails');
  };
  
  return (
    <Tooltip title={getTooltipText()}>
      <Badge
        color={network.online ? 'success' : 'error'}
        variant="dot"
        overlap="circular"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getConnectionIcon()}
          <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {getConnectionText()}
          </Typography>
        </Box>
      </Badge>
    </Tooltip>
  );
};

export default NetworkStatusIndicator;
