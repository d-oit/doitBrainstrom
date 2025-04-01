// src/components/flow/VisualDiffEngine.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  useTheme
} from '@mui/material';
import { VersionedNode, VersionedEdge } from '../../utils/flow/FlowTypes';
import { useI18n } from '../../contexts/I18nContext';
import { logInfo } from '../../utils/logger';

interface DiffItem<T> {
  local: T;
  remote: T;
  merged?: T;
}

interface VisualDiffEngineProps {
  open: boolean;
  onClose: () => void;
  onResolve: (resolvedNodes: VersionedNode[], resolvedEdges: VersionedEdge[]) => void;
  conflictingNodes: DiffItem<VersionedNode>[];
  conflictingEdges: DiffItem<VersionedEdge>[];
}

const VisualDiffEngine: React.FC<VisualDiffEngineProps> = ({
  open,
  onClose,
  onResolve,
  conflictingNodes,
  conflictingEdges
}) => {
  const { t } = useI18n();
  const theme = useTheme();

  // State for tracking user selections
  const [nodeResolutions, setNodeResolutions] = useState<Record<string, 'local' | 'remote' | 'merged'>>({});
  const [edgeResolutions, setEdgeResolutions] = useState<Record<string, 'local' | 'remote'>>({});

  // Initialize resolutions when conflicts change
  useEffect(() => {
    const initialNodeResolutions: Record<string, 'local' | 'remote' | 'merged'> = {};
    const initialEdgeResolutions: Record<string, 'local' | 'remote'> = {};

    // Default to local version
    conflictingNodes.forEach(item => {
      if (item.local && item.local.id) {
        initialNodeResolutions[item.local.id] = 'local';
      }
    });

    conflictingEdges.forEach(item => {
      if (item.local && item.local.id) {
        initialEdgeResolutions[item.local.id] = 'local';
      }
    });

    setNodeResolutions(initialNodeResolutions);
    setEdgeResolutions(initialEdgeResolutions);
  }, [conflictingNodes, conflictingEdges]);

  // Handle node resolution change
  const handleNodeResolutionChange = (nodeId: string, value: 'local' | 'remote' | 'merged') => {
    setNodeResolutions(prev => ({
      ...prev,
      [nodeId]: value
    }));
  };

  // Handle edge resolution change
  const handleEdgeResolutionChange = (edgeId: string, value: 'local' | 'remote') => {
    setEdgeResolutions(prev => ({
      ...prev,
      [edgeId]: value
    }));
  };

  // Apply resolutions and close dialog
  const handleApplyResolutions = () => {
    // Collect resolved nodes
    const resolvedNodes = conflictingNodes.map(item => {
      const resolution = nodeResolutions[item.local.id] || 'local';
      if (resolution === 'local') return item.local;
      if (resolution === 'remote') return item.remote;
      return item.merged || item.local; // Fallback to local if merged doesn't exist
    });

    // Collect resolved edges
    const resolvedEdges = conflictingEdges.map(item => {
      const resolution = edgeResolutions[item.local.id] || 'local';
      return resolution === 'local' ? item.local : item.remote;
    });

    logInfo('Conflict resolution applied', {
      nodeResolutions,
      edgeResolutions,
      resolvedNodeCount: resolvedNodes.length,
      resolvedEdgeCount: resolvedEdges.length
    });

    // Call the resolve callback
    onResolve(resolvedNodes, resolvedEdges);
    onClose();
  };

  // Render a node diff
  const renderNodeDiff = (item: DiffItem<VersionedNode>, index: number) => {
    const { local, remote, merged } = item;
    const nodeId = local.id;
    const resolution = nodeResolutions[nodeId] || 'local';

    // Determine what changed
    const positionChanged =
      local.position.x !== remote.position.x ||
      local.position.y !== remote.position.y;

    const contentChanged =
      JSON.stringify(local.data) !== JSON.stringify(remote.data);

    return (
      <Paper
        key={`node-${index}`}
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t('conflict.nodeTitle', { id: nodeId })}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('conflict.changes')}:
          </Typography>
          <ul>
            {positionChanged && (
              <li>
                <Typography>
                  {t('conflict.positionChanged')}
                </Typography>
              </li>
            )}
            {contentChanged && (
              <li>
                <Typography>
                  {t('conflict.contentChanged')}
                </Typography>
              </li>
            )}
          </ul>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <RadioGroup
          value={resolution}
          onChange={(e) => handleNodeResolutionChange(nodeId, e.target.value as 'local' | 'remote' | 'merged')}
        >
          <FormControlLabel
            value="local"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle2">
                  {t('conflict.localVersion')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('conflict.lastModified')}: {new Date(local.lastModified).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {local.data.label || local.data.title || t('conflict.noTitle')}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            value="remote"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle2">
                  {t('conflict.remoteVersion')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('conflict.lastModified')}: {new Date(remote.lastModified).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {remote.data.label || remote.data.title || t('conflict.noTitle')}
                </Typography>
              </Box>
            }
          />

          {merged && (
            <FormControlLabel
              value="merged"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle2">
                    {t('conflict.mergedVersion')}
                  </Typography>
                  <Typography variant="body2">
                    {merged.data.label || merged.data.title || t('conflict.noTitle')}
                  </Typography>
                </Box>
              }
            />
          )}
        </RadioGroup>
      </Paper>
    );
  };

  // Render an edge diff
  const renderEdgeDiff = (item: DiffItem<VersionedEdge>, index: number) => {
    const { local, remote } = item;
    const edgeId = local.id;
    const resolution = edgeResolutions[edgeId] || 'local';

    return (
      <Paper
        key={`edge-${index}`}
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t('conflict.edgeTitle', { id: edgeId })}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography>
            {t('conflict.connection')}: {local.source || 'unknown'} → {local.target || 'unknown'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <RadioGroup
          value={resolution}
          onChange={(e) => handleEdgeResolutionChange(edgeId, e.target.value as 'local' | 'remote')}
        >
          <FormControlLabel
            value="local"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle2">
                  {t('conflict.localVersion')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('conflict.lastModified')}: {new Date(local.lastModified).toLocaleString()}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            value="remote"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle2">
                  {t('conflict.remoteVersion')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('conflict.lastModified')}: {new Date(remote.lastModified).toLocaleString()}
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="conflict-resolution-dialog-title"
    >
      <DialogTitle id="conflict-resolution-dialog-title">
        {t('conflict.title')}
      </DialogTitle>

      <DialogContent dividers>
        <Typography paragraph>
          {t('conflict.description')}
        </Typography>

        {conflictingNodes.length === 0 && conflictingEdges.length === 0 ? (
          <Typography>{t('conflict.noConflicts')}</Typography>
        ) : (
          <>
            {conflictingNodes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('conflict.nodeConflicts')}
                </Typography>
                {conflictingNodes.map(renderNodeDiff)}
              </Box>
            )}

            {conflictingEdges.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('conflict.edgeConflicts')}
                </Typography>
                {conflictingEdges.map(renderEdgeDiff)}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('actions.cancel')}
        </Button>
        <Button
          onClick={handleApplyResolutions}
          color="primary"
          variant="contained"
          disabled={conflictingNodes.length === 0 && conflictingEdges.length === 0}
        >
          {t('actions.applyResolution')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisualDiffEngine;
