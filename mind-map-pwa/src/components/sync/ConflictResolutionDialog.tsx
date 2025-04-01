// src/components/sync/ConflictResolutionDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CompareArrows,
  MergeType,
  CloudDownload,
  CloudUpload,
  Warning
} from '@mui/icons-material';
import { useI18n } from '../../contexts/I18nContext';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { MindMapData, MindMapNode, MindMapLink } from '../../utils/MindMapDataModel';
import { formatDate } from '../../utils/dateUtils';

// Diff visualization component for showing differences between two versions
const DiffVisualization: React.FC<{
  localData: MindMapData;
  remoteData: MindMapData;
  highlightChanges?: boolean;
}> = ({ localData, remoteData, highlightChanges = true }) => {
  // Get responsive context for viewport adaptations
  const { t } = useI18n();

  // Find added, removed, and modified nodes
  const addedNodes: MindMapNode[] = [];
  const removedNodes: MindMapNode[] = [];
  const modifiedNodes: { local: MindMapNode; remote: MindMapNode }[] = [];

  // Map nodes by ID for easier comparison
  const localNodesMap = new Map(localData.nodes.map(node => [node.id, node]));
  const remoteNodesMap = new Map(remoteData.nodes.map(node => [node.id, node]));

  // Find added and modified nodes
  remoteData.nodes.forEach(remoteNode => {
    const localNode = localNodesMap.get(remoteNode.id);
    if (!localNode) {
      addedNodes.push(remoteNode);
    } else if (JSON.stringify(localNode) !== JSON.stringify(remoteNode)) {
      modifiedNodes.push({ local: localNode, remote: remoteNode });
    }
  });

  // Find removed nodes
  localData.nodes.forEach(localNode => {
    if (!remoteNodesMap.has(localNode.id)) {
      removedNodes.push(localNode);
    }
  });

  // Find added, removed, and modified links
  const addedLinks: MindMapLink[] = [];
  const removedLinks: MindMapLink[] = [];
  const modifiedLinks: { local: MindMapLink; remote: MindMapLink }[] = [];

  // Map links by ID for easier comparison
  const localLinksMap = new Map(localData.links.map(link => [link.id, link]));
  const remoteLinksMap = new Map(remoteData.links.map(link => [link.id, link]));

  // Find added and modified links
  remoteData.links.forEach(remoteLink => {
    const localLink = localLinksMap.get(remoteLink.id);
    if (!localLink) {
      addedLinks.push(remoteLink);
    } else if (JSON.stringify(localLink) !== JSON.stringify(remoteLink)) {
      modifiedLinks.push({ local: localLink, remote: remoteLink });
    }
  });

  // Find removed links
  localData.links.forEach(localLink => {
    if (!remoteLinksMap.has(localLink.id)) {
      removedLinks.push(localLink);
    }
  });

  // No differences
  if (
    addedNodes.length === 0 &&
    removedNodes.length === 0 &&
    modifiedNodes.length === 0 &&
    addedLinks.length === 0 &&
    removedLinks.length === 0 &&
    modifiedLinks.length === 0
  ) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {t('sync.conflict.noDifferences')}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Nodes differences */}
      {(addedNodes.length > 0 || removedNodes.length > 0 || modifiedNodes.length > 0) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('sync.conflict.nodeChanges')}
          </Typography>

          {/* Added nodes */}
          {addedNodes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="success.main">
                {t('sync.conflict.addedNodes', { count: String(addedNodes.length) })}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: highlightChanges ? 'success.light' : 'background.paper' }}>
                {addedNodes.map(node => (
                  <Box key={node.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{node.text}</strong> (ID: {node.id.substring(0, 8)}...)
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {/* Removed nodes */}
          {removedNodes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="error.main">
                {t('sync.conflict.removedNodes', { count: String(removedNodes.length) })}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: highlightChanges ? 'error.light' : 'background.paper' }}>
                {removedNodes.map(node => (
                  <Box key={node.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{node.text}</strong> (ID: {node.id.substring(0, 8)}...)
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {/* Modified nodes */}
          {modifiedNodes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="warning.main">
                {t('sync.conflict.modifiedNodes', { count: String(modifiedNodes.length) })}
              </Typography>
              {modifiedNodes.map(({ local, remote }) => (
                <Paper key={local.id} variant="outlined" sx={{ p: 1, mb: 1, bgcolor: highlightChanges ? 'warning.light' : 'background.paper' }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>ID:</strong> {local.id.substring(0, 8)}...
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('sync.conflict.localVersion')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.text')}:</strong> {local.text}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.position')}:</strong> ({local.x}, {local.y})
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Divider sx={{ display: { xs: 'block', sm: 'none' }, my: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('sync.conflict.remoteVersion')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.text')}:</strong> {remote.text}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.position')}:</strong> ({remote.x}, {remote.y})
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Links differences */}
      {(addedLinks.length > 0 || removedLinks.length > 0 || modifiedLinks.length > 0) && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('sync.conflict.linkChanges')}
          </Typography>

          {/* Added links */}
          {addedLinks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="success.main">
                {t('sync.conflict.addedLinks', { count: String(addedLinks.length) })}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: highlightChanges ? 'success.light' : 'background.paper' }}>
                {addedLinks.map(link => (
                  <Box key={link.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{t('sync.conflict.link')}:</strong> {link.sourceId.substring(0, 8)}... → {link.targetId.substring(0, 8)}...
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {/* Removed links */}
          {removedLinks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="error.main">
                {t('sync.conflict.removedLinks', { count: String(removedLinks.length) })}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: highlightChanges ? 'error.light' : 'background.paper' }}>
                {removedLinks.map(link => (
                  <Box key={link.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{t('sync.conflict.link')}:</strong> {link.sourceId.substring(0, 8)}... → {link.targetId.substring(0, 8)}...
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}

          {/* Modified links */}
          {modifiedLinks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="warning.main">
                {t('sync.conflict.modifiedLinks', { count: String(modifiedLinks.length) })}
              </Typography>
              {modifiedLinks.map(({ local, remote }) => (
                <Paper key={local.id} variant="outlined" sx={{ p: 1, mb: 1, bgcolor: highlightChanges ? 'warning.light' : 'background.paper' }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>ID:</strong> {local.id.substring(0, 8)}...
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('sync.conflict.localVersion')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.source')}:</strong> {local.sourceId.substring(0, 8)}...
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.target')}:</strong> {local.targetId.substring(0, 8)}...
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Divider sx={{ display: { xs: 'block', sm: 'none' }, my: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('sync.conflict.remoteVersion')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.source')}:</strong> {remote.sourceId.substring(0, 8)}...
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('sync.conflict.target')}:</strong> {remote.targetId.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// Interface for the conflict resolution dialog props
interface ConflictResolutionDialogProps {
  open: boolean;
  onClose: () => void;
  localData: MindMapData;
  remoteData: MindMapData;
  localTimestamp: string;
  remoteTimestamp: string;
  onResolve: (resolvedData: MindMapData) => void;
}

// Resolution strategies
type ResolutionStrategy = 'local' | 'remote' | 'merge' | 'custom';

// Conflict Resolution Dialog component
const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  open,
  onClose,
  localData,
  remoteData,
  localTimestamp,
  remoteTimestamp,
  onResolve
}) => {
  const { t } = useI18n();
  const { viewport } = useResponsive();
  const [tabIndex, setTabIndex] = useState(0);
  const [strategy, setStrategy] = useState<ResolutionStrategy>('merge');
  const [isResolving, setIsResolving] = useState(false);
  const [mergedData, setMergedData] = useState<MindMapData | null>(null);

  // Format timestamps for display
  const formattedLocalTime = formatDate(new Date(localTimestamp));
  const formattedRemoteTime = formatDate(new Date(remoteTimestamp));

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Handle strategy change
  const handleStrategyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStrategy(event.target.value as ResolutionStrategy);
  };

  // Generate merged data when strategy changes
  useEffect(() => {
    if (strategy === 'merge') {
      // Create a merged version that combines both changes
      // This is a simple merge that takes all nodes and links from both versions
      // and removes duplicates

      // Start with local data
      const merged: MindMapData = {
        ...localData,
        nodes: [...localData.nodes],
        links: [...localData.links]
      };

      // Add nodes from remote that don't exist in local
      const localNodeIds = new Set(localData.nodes.map(node => node.id));
      remoteData.nodes.forEach(remoteNode => {
        if (!localNodeIds.has(remoteNode.id)) {
          merged.nodes.push(remoteNode);
        }
      });

      // Add links from remote that don't exist in local
      const localLinkIds = new Set(localData.links.map(link => link.id));
      remoteData.links.forEach(remoteLink => {
        if (!localLinkIds.has(remoteLink.id)) {
          merged.links.push(remoteLink);
        }
      });

      setMergedData(merged);
    } else if (strategy === 'local') {
      setMergedData(localData);
    } else if (strategy === 'remote') {
      setMergedData(remoteData);
    } else {
      // Custom strategy - start with merged data as a base
      if (!mergedData) {
        // Create a merged version as a starting point
        const merged: MindMapData = {
          ...localData,
          nodes: [...localData.nodes],
          links: [...localData.links]
        };

        // Add nodes from remote that don't exist in local
        const localNodeIds = new Set(localData.nodes.map(node => node.id));
        remoteData.nodes.forEach(remoteNode => {
          if (!localNodeIds.has(remoteNode.id)) {
            merged.nodes.push(remoteNode);
          }
        });

        // Add links from remote that don't exist in local
        const localLinkIds = new Set(localData.links.map(link => link.id));
        remoteData.links.forEach(remoteLink => {
          if (!localLinkIds.has(remoteLink.id)) {
            merged.links.push(remoteLink);
          }
        });

        setMergedData(merged);
      }
    }
  }, [strategy, localData, remoteData]);

  // Handle resolve button click
  const handleResolve = () => {
    if (!mergedData) return;

    setIsResolving(true);

    // Simulate a delay for UI feedback
    setTimeout(() => {
      onResolve(mergedData);
      setIsResolving(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog
      open={open}
      onClose={isResolving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="conflict-resolution-dialog-title"
    >
      <DialogTitle id="conflict-resolution-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          {t('sync.conflict.title')}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('sync.conflict.description')}
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('sync.conflict.versions')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle2" color="primary">
                {t('sync.conflict.localVersion')}
              </Typography>
              <Typography variant="body2">
                {t('sync.conflict.lastModified')}: {formattedLocalTime}
              </Typography>
              <Typography variant="body2">
                {t('sync.conflict.nodeCount')}: {localData.nodes.length}
              </Typography>
              <Typography variant="body2">
                {t('sync.conflict.linkCount')}: {localData.links.length}
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle2" color="secondary">
                {t('sync.conflict.remoteVersion')}
              </Typography>
              <Typography variant="body2">
                {t('sync.conflict.lastModified')}: {formattedRemoteTime}
              </Typography>
              <Typography variant="body2">
                {t('sync.conflict.nodeCount')}: {remoteData.nodes.length}
              </Typography>
              <Typography variant="body2">
                {t('sync.conflict.linkCount')}: {remoteData.links.length}
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('sync.conflict.resolutionStrategy')}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="resolution-strategy"
              name="resolution-strategy"
              value={strategy}
              onChange={handleStrategyChange}
            >
              <FormControlLabel
                value="merge"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MergeType />
                    <Typography>{t('sync.conflict.strategy.merge')}</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="local"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudUpload />
                    <Typography>{t('sync.conflict.strategy.keepLocal')}</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="remote"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudDownload />
                    <Typography>{t('sync.conflict.strategy.keepRemote')}</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareArrows />
                    <Typography>{t('sync.conflict.strategy.custom')}</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('sync.conflict.differences')}
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              aria-label="conflict-resolution-tabs"
              variant={viewport.isMobile ? 'fullWidth' : 'standard'}
            >
              <Tab
                label={t('sync.conflict.tab.overview')}
                id="conflict-tab-0"
                aria-controls="conflict-tabpanel-0"
              />
              <Tab
                label={t('sync.conflict.tab.details')}
                id="conflict-tab-1"
                aria-controls="conflict-tabpanel-1"
              />
              {strategy === 'merge' && (
                <Tab
                  label={t('sync.conflict.tab.merged')}
                  id="conflict-tab-2"
                  aria-controls="conflict-tabpanel-2"
                />
              )}
            </Tabs>
          </Box>

          {/* Overview tab */}
          <Box
            role="tabpanel"
            hidden={tabIndex !== 0}
            id="conflict-tabpanel-0"
            aria-labelledby="conflict-tab-0"
            sx={{ py: 2 }}
          >
            {tabIndex === 0 && (
              <DiffVisualization
                localData={localData}
                remoteData={remoteData}
                highlightChanges={true}
              />
            )}
          </Box>

          {/* Details tab */}
          <Box
            role="tabpanel"
            hidden={tabIndex !== 1}
            id="conflict-tabpanel-1"
            aria-labelledby="conflict-tab-1"
            sx={{ py: 2 }}
          >
            {tabIndex === 1 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('sync.conflict.detailedComparison')}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('sync.conflict.detailedComparisonInfo')}
                </Alert>
                {/* This would be a more detailed comparison UI */}
                <Typography variant="body2">
                  {t('sync.conflict.detailedComparisonNotImplemented')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Merged result tab */}
          {strategy === 'merge' && (
            <Box
              role="tabpanel"
              hidden={tabIndex !== 2}
              id="conflict-tabpanel-2"
              aria-labelledby="conflict-tab-2"
              sx={{ py: 2 }}
            >
              {tabIndex === 2 && mergedData && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('sync.conflict.mergedResult')}
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {t('sync.conflict.mergedResultInfo')}
                  </Alert>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>{t('sync.conflict.nodeCount')}:</strong> {mergedData.nodes.length}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('sync.conflict.linkCount')}:</strong> {mergedData.links.length}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isResolving}
          color="inherit"
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleResolve}
          disabled={isResolving || !mergedData}
          color="primary"
          variant="contained"
          startIcon={isResolving ? <CircularProgress size={20} /> : <MergeType />}
        >
          {isResolving ? t('sync.conflict.resolving') : t('sync.conflict.resolve')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
