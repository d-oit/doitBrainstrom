// src/components/sync/ConflictResolution.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Box,
  Button,
  Divider
} from '@mui/material';
import { Close, CompareArrows } from '@mui/icons-material';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { useI18n } from '../../contexts/I18nContext';

// Types for conflict data
interface Conflict {
  id: string;
  path: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: string;
}

interface ConflictItemProps {
  conflict: Conflict;
  onResolve: (id: string, choice: 'local' | 'remote' | 'merge') => void;
}

// Mobile conflict item component
const ConflictItem: React.FC<ConflictItemProps> = ({ conflict, onResolve }) => {
  const { t } = useI18n();

  return (
    <ListItem divider>
      <ListItemText
        primary={conflict.path}
        secondary={`${t('sync.modified')}: ${conflict.timestamp}`}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onResolve(conflict.id, 'local')}
        >
          {t('sync.keepLocal')}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onResolve(conflict.id, 'remote')}
        >
          {t('sync.keepRemote')}
        </Button>
      </Box>
    </ListItem>
  );
};

// Preview component for mind map data
const MindMapPreview = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  minHeight: 200,
  overflow: 'auto',
}));

interface ConflictResolutionProps {
  open: boolean;
  conflicts: Conflict[];
  onClose: () => void;
  onResolve: (id: string, choice: 'local' | 'remote' | 'merge') => void;
}

export const ConflictResolution: React.FC<ConflictResolutionProps> = ({
  open,
  conflicts,
  onClose,
  onResolve
}) => {
  const { viewport } = useResponsive();
  const { t } = useI18n();
  const [selectedConflict, setSelectedConflict] = React.useState<Conflict | null>(
    conflicts.length > 0 ? conflicts[0] : null
  );

  React.useEffect(() => {
    if (conflicts.length > 0 && !selectedConflict) {
      setSelectedConflict(conflicts[0]);
    }
  }, [conflicts, selectedConflict]);

  // Mobile view - full screen dialog
  if (viewport.isMobile) {
    return (
      <Dialog fullScreen open={open} onClose={onClose}>
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <Close />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
              {t('sync.resolveConflicts')}
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
          {conflicts.map(conflict => (
            <ConflictItem
              key={conflict.id}
              conflict={conflict}
              onResolve={onResolve}
            />
          ))}
        </List>
      </Dialog>
    );
  }

  // Tablet view - bottom sheet
  if (viewport.isTablet) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { position: 'fixed', bottom: 0, m: 0, width: '100%', maxHeight: '70vh' }
        }}
      >
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {t('sync.resolveConflicts')}
            </Typography>
            <IconButton onClick={onClose} aria-label={t('common.close')}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' }, gap: 2 }}>
            <Box>
              <Paper variant="outlined" sx={{ height: '100%', overflow: 'auto' }}>
                <List dense>
                  {conflicts.map(conflict => (
                    <ListItem
                      key={conflict.id}
                      disablePadding
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selectedConflict?.id === conflict.id ? 'action.selected' : 'transparent'
                      }}
                      onClick={() => setSelectedConflict(conflict)}
                    >
                      <ListItemText
                        primary={conflict.path}
                        secondary={conflict.timestamp}
                        sx={{ p: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            {selectedConflict && (
              <Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    {selectedConflict.path}
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onResolve(selectedConflict.id, 'local')}
                    >
                      {t('sync.keepLocal')}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => onResolve(selectedConflict.id, 'remote')}
                    >
                      {t('sync.keepRemote')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CompareArrows />}
                      onClick={() => onResolve(selectedConflict.id, 'merge')}
                    >
                      {t('sync.merge')}
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>
    );
  }

  // Desktop view - side panel with comparison
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {t('sync.resolveConflicts')}
          </Typography>
          <IconButton onClick={onClose} aria-label={t('common.close')}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: 'calc(100% - 64px)' }}>
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <List dense>
            {conflicts.map(conflict => (
              <ListItem
                key={conflict.id}
                disablePadding
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedConflict?.id === conflict.id ? 'action.selected' : 'transparent'
                }}
                onClick={() => setSelectedConflict(conflict)}
              >
                <ListItemText
                  primary={conflict.path}
                  secondary={conflict.timestamp}
                  sx={{ p: 1 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {selectedConflict && (
          <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {selectedConflict.path}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, flex: 1 }}>
              <Box>
                <Typography variant="subtitle1">{t('sync.localChanges')}</Typography>
                <MindMapPreview>
                  <pre>{JSON.stringify(selectedConflict.localVersion, null, 2)}</pre>
                </MindMapPreview>
              </Box>
              <Box>
                <Typography variant="subtitle1">{t('sync.remoteChanges')}</Typography>
                <MindMapPreview>
                  <pre>{JSON.stringify(selectedConflict.remoteVersion, null, 2)}</pre>
                </MindMapPreview>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onResolve(selectedConflict.id, 'local')}
              >
                {t('sync.keepLocal')}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => onResolve(selectedConflict.id, 'remote')}
              >
                {t('sync.keepRemote')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CompareArrows />}
                onClick={() => onResolve(selectedConflict.id, 'merge')}
              >
                {t('sync.merge')}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ConflictResolution;
