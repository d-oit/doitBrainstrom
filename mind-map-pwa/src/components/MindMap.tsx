// src/components/MindMap.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Paper, TextField, Button, Typography, VisuallyHidden, CircularProgress } from '@mui/material';
import { useMindMap } from '../contexts/MindMapContext';
import { useI18n } from '../contexts/I18nContext';
import { useResponsive } from '../contexts/ResponsiveContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { loadPriority } from '../utils/performanceConfig';
import ContainerQuery from './layout/ContainerQuery';
import { Heading4, Paragraph } from './typography/FluidTypography';
import '../styles/responsive.css';

// Import React Flow components
import FlowOrchestrator from './flow/FlowOrchestrator';
import { VersionedStateManager } from '../utils/versioning/VersionedStateManager';
import 'reactflow/dist/style.css';

const MindMap: React.FC = () => {
  const { t } = useI18n();
  const { viewport } = useResponsive();
  const { announceToScreenReader } = useAccessibility();
  const [isLoading, setIsLoading] = useState(true);
  const [stateManager, setStateManager] = useState<VersionedStateManager | null>(null);
  const [newNodeText, setNewNodeText] = useState('');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Accessibility description of the mind map */}
      <VisuallyHidden>
        <Typography id="mind-map-description">
          {t('accessibility.mindMapDescription')}
        </Typography>
      </VisuallyHidden>

      <ContainerQuery type="component">
        <Box sx={{ position: 'relative', flexGrow: 1 }}>
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
