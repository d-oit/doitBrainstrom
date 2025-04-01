// src/components/flow/FlowOrchestrator.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Snackbar, Alert, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import SaveIcon from '@mui/icons-material/Save';
import ReactFlowAdapter from './ReactFlowAdapter';
import { VersionedStateManager } from '../../utils/versioning/VersionedStateManager';
import { VersionedNode, VersionedEdge, VirtualizationConfig } from '../../utils/flow/FlowTypes';
import { useI18n } from '../../contexts/I18nContext';
// import { useResponsive } from '../../contexts/ResponsiveContext';
import { logInfo, logError } from '../../utils/logger';
import { generateId } from '../../utils/MindMapDataModel';

interface FlowOrchestratorProps {
  readOnly?: boolean;
  onSave?: () => void;
}

const FlowOrchestrator: React.FC<FlowOrchestratorProps> = ({
  readOnly = false,
  onSave
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  // const { viewport } = useResponsive();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const stateManagerRef = useRef<VersionedStateManager | null>(null);

  // Initialize state manager
  useEffect(() => {
    const initStateManager = async () => {
      try {
        setIsLoading(true);
        // Create state manager if it doesn't exist
        if (!stateManagerRef.current) {
          stateManagerRef.current = new VersionedStateManager();
          // Load state from IndexedDB
          await stateManagerRef.current.loadState();
        }
      } catch (error) {
        logError('Error initializing state manager:', error);
        setError('Failed to initialize flow diagram. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initStateManager();

    // Cleanup
    return () => {
      // Any cleanup needed
    };
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: VersionedNode) => {
    logInfo('Node clicked:', node);
    // Additional node click handling
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((edge: VersionedEdge) => {
    logInfo('Edge clicked:', edge);
    // Additional edge click handling
  }, []);

  // Handle viewport change
  const handleViewportChange = useCallback((_viewport: { x: number; y: number; zoom: number }) => {
    // Additional viewport change handling
  }, []);

  // Add a new node
  const handleAddNode = useCallback(() => {
    if (!stateManagerRef.current) return;

    try {
      // Create a new node at a random position
      const newNode = stateManagerRef.current.addNode({
        id: generateId(),
        type: 'mindMapCard',
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400
        },
        data: {
          title: t('mindMap.newNode'),
          description: t('mindMap.newNodeDescription')
        }
      });

      setNotification({
        message: t('notifications.nodeAdded'),
        severity: 'success'
      });

      logInfo('Node added:', newNode);
    } catch (error) {
      logError('Error adding node:', error);
      setNotification({
        message: t('errors.nodeAddFailed'),
        severity: 'error'
      });
    }
  }, [t]);

  // Undo last action
  const handleUndo = useCallback(() => {
    if (!stateManagerRef.current) return;

    try {
      const success = stateManagerRef.current.undo();

      if (success) {
        setNotification({
          message: t('notifications.actionUndone'),
          severity: 'success'
        });
      } else {
        setNotification({
          message: t('notifications.nothingToUndo'),
          severity: 'info'
        });
      }
    } catch (error) {
      logError('Error undoing action:', error);
      setNotification({
        message: t('errors.undoFailed'),
        severity: 'error'
      });
    }
  }, [t]);

  // Save the current state
  const handleSave = useCallback(() => {
    // Call external save handler if provided
    if (onSave) {
      onSave();
    }

    setNotification({
      message: t('notifications.saved'),
      severity: 'success'
    });
  }, [onSave, t]);

  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Configure virtualization based on viewport
  const virtualizationConfig: VirtualizationConfig = {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    nodeWidth: 250,
    nodeHeight: 150,
    overscanCount: 2
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {t('errors.title')}
        </Typography>
        <Typography>{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          {t('actions.refresh')}
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Toolbar */}
      <Paper
        elevation={1}
        sx={{
          p: 1,
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          bgcolor: theme.palette.background.paper
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNode}
          disabled={readOnly}
          aria-label={t('accessibility.addNode')}
        >
          {t('actions.addNode')}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<UndoIcon />}
          onClick={handleUndo}
          disabled={readOnly}
          aria-label={t('accessibility.undo')}
        >
          {t('actions.undo')}
        </Button>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          aria-label={t('accessibility.save')}
        >
          {t('actions.save')}
        </Button>
      </Paper>

      {/* Flow diagram */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {stateManagerRef.current ? (
          <ReactFlowAdapter
            stateManager={stateManagerRef.current}
            isReadOnly={readOnly}
            virtualizationConfig={virtualizationConfig}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onViewportChange={handleViewportChange}
          />
        ) : null}
      </Box>

      {/* Notifications */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        ) : <div />}
      </Snackbar>
    </Box>
  );
};

export default FlowOrchestrator;
