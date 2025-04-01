// src/components/mindmap/MapControls.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  ZoomIn, 
  ZoomOut, 
  Add, 
  Delete, 
  Edit, 
  Undo, 
  Redo, 
  CenterFocusStrong 
} from '@mui/icons-material';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { useI18n } from '../../contexts/I18nContext';

// Mobile-first controls as bottom navigation
const MobileMapControls = styled(BottomNavigation)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: 56,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.appBar,
}));

// Desktop layout controls as floating panel
const DesktopMapControls = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
  padding: 8,
  boxShadow: theme.shadows[2],
  zIndex: 10,
}));

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddNode: () => void;
  onDeleteNode: () => void;
  onEditNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCenter: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onAddNode,
  onDeleteNode,
  onEditNode,
  onUndo,
  onRedo,
  onCenter,
  canUndo,
  canRedo,
  canDelete,
  canEdit
}) => {
  const { viewport } = useResponsive();
  const { t } = useI18n();

  // Mobile view - bottom navigation
  if (viewport.isMobile) {
    return (
      <MobileMapControls 
        showLabels={false}
        className="safe-area-bottom"
      >
        <BottomNavigationAction 
          label={t('mindMap.zoomIn')} 
          icon={<ZoomIn />} 
          onClick={onZoomIn}
        />
        <BottomNavigationAction 
          label={t('mindMap.zoomOut')} 
          icon={<ZoomOut />} 
          onClick={onZoomOut}
        />
        <BottomNavigationAction 
          label={t('mindMap.add')} 
          icon={<Add />} 
          onClick={onAddNode}
        />
        <BottomNavigationAction 
          label={t('mindMap.delete')} 
          icon={<Delete />} 
          onClick={onDeleteNode}
          disabled={!canDelete}
        />
        <BottomNavigationAction 
          label={t('mindMap.edit')} 
          icon={<Edit />} 
          onClick={onEditNode}
          disabled={!canEdit}
        />
      </MobileMapControls>
    );
  }

  // Tablet view - horizontal toolbar
  if (viewport.isTablet) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          left: '50%', 
          transform: 'translateX(-50%)',
          display: 'flex',
          borderRadius: 4,
          p: 0.5,
          zIndex: 10
        }}
      >
        <Tooltip title={t('mindMap.zoomIn')}>
          <IconButton onClick={onZoomIn} size="medium">
            <ZoomIn />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mindMap.zoomOut')}>
          <IconButton onClick={onZoomOut} size="medium">
            <ZoomOut />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mindMap.center')}>
          <IconButton onClick={onCenter} size="medium">
            <CenterFocusStrong />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mindMap.add')}>
          <IconButton onClick={onAddNode} size="medium">
            <Add />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mindMap.edit')}>
          <span>
            <IconButton onClick={onEditNode} disabled={!canEdit} size="medium">
              <Edit />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('mindMap.delete')}>
          <span>
            <IconButton onClick={onDeleteNode} disabled={!canDelete} size="medium">
              <Delete />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('mindMap.undo')}>
          <span>
            <IconButton onClick={onUndo} disabled={!canUndo} size="medium">
              <Undo />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('mindMap.redo')}>
          <span>
            <IconButton onClick={onRedo} disabled={!canRedo} size="medium">
              <Redo />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>
    );
  }

  // Desktop view - vertical toolbar
  return (
    <DesktopMapControls elevation={2}>
      <Tooltip title={t('mindMap.zoomIn')} placement="left">
        <IconButton onClick={onZoomIn} size="small">
          <ZoomIn />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('mindMap.zoomOut')} placement="left">
        <IconButton onClick={onZoomOut} size="small">
          <ZoomOut />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('mindMap.center')} placement="left">
        <IconButton onClick={onCenter} size="small">
          <CenterFocusStrong />
        </IconButton>
      </Tooltip>
      <Box sx={{ height: '1px', bgcolor: 'divider', my: 0.5 }} />
      <Tooltip title={t('mindMap.add')} placement="left">
        <IconButton onClick={onAddNode} size="small">
          <Add />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('mindMap.edit')} placement="left">
        <span>
          <IconButton onClick={onEditNode} disabled={!canEdit} size="small">
            <Edit />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('mindMap.delete')} placement="left">
        <span>
          <IconButton onClick={onDeleteNode} disabled={!canDelete} size="small">
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
      <Box sx={{ height: '1px', bgcolor: 'divider', my: 0.5 }} />
      <Tooltip title={t('mindMap.undo')} placement="left">
        <span>
          <IconButton onClick={onUndo} disabled={!canUndo} size="small">
            <Undo />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t('mindMap.redo')} placement="left">
        <span>
          <IconButton onClick={onRedo} disabled={!canRedo} size="small">
            <Redo />
          </IconButton>
        </span>
      </Tooltip>
    </DesktopMapControls>
  );
};

export default MapControls;
