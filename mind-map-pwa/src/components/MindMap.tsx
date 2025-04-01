// src/components/MindMap.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useI18n } from '../contexts/I18nContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import ContainerQuery from './layout/ContainerQuery';
import '../styles/responsive.css';

// Import React Flow components
import FlowOrchestrator from './flow/FlowOrchestrator';
import { VersionedStateManager } from '../utils/versioning/VersionedStateManager';
import 'reactflow/dist/style.css';

const MindMap: React.FC = () => {
  const { t } = useI18n();
  const { announceToScreenReader } = useAccessibility();
  const [isLoading, setIsLoading] = useState(true);
  const [stateManager, setStateManager] = useState<VersionedStateManager | null>(null);

  // Initialize the state manager
  useEffect(() => {
    const initStateManager = async () => {
      try {
        setIsLoading(true);
        const manager = new VersionedStateManager();
        await manager.loadState();
        setStateManager(manager);
      } catch (error) {
        console.error('Error initializing state manager:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initStateManager();
  }, []);

  // Handle save event
  const handleSave = useCallback(() => {
    // Implement save functionality
    announceToScreenReader(t('accessibility.saved'));
  }, [announceToScreenReader, t]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      {/* Accessibility description of the mind map */}
      <Typography id="mind-map-description" sx={{ position: 'absolute', height: 1, width: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)' }}>
        {t('accessibility.mindMapDescription')}
      </Typography>

      <ContainerQuery type="component">
        <Box sx={{ position: 'relative', flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {stateManager ? (
            <FlowOrchestrator
              readOnly={false}
              onSave={handleSave}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </ContainerQuery>
    </Box>
  );
};

export default MindMap;
