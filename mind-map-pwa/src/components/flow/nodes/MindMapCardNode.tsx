// src/components/flow/nodes/MindMapCardNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, useTheme } from '@mui/material';
import MindMapCard from '../../MindMapCard';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { useI18n } from '../../../contexts/I18nContext';

interface MindMapCardNodeData {
  title: string;
  description?: string;
  isSelected?: boolean;
}

const MindMapCardNode: React.FC<NodeProps<MindMapCardNodeData>> = ({ 
  id, 
  data, 
  isConnectable,
  selected
}) => {
  const theme = useTheme();
  const { highContrastMode } = useAccessibility();
  const { t } = useI18n();
  
  // Determine border color based on selection state and theme
  const borderColor = selected 
    ? theme.palette.primary.main 
    : theme.palette.mode === 'dark' 
      ? theme.palette.grey[700] 
      : theme.palette.grey[300];
  
  // Apply high contrast mode if enabled
  const highContrastStyles = highContrastMode 
    ? {
        border: `2px solid ${selected ? '#ffffff' : '#000000'}`,
        backgroundColor: selected ? '#000000' : '#ffffff',
        color: selected ? '#ffffff' : '#000000'
      } 
    : {};
  
  return (
    <>
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ 
          background: theme.palette.primary.main,
          width: 10,
          height: 10
        }}
        aria-label={t('accessibility.nodeInputHandle')}
      />
      
      {/* Node content */}
      <Box
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: 2,
          padding: 0.5,
          minWidth: 150,
          maxWidth: 250,
          ...highContrastStyles
        }}
        aria-selected={selected}
        role="treeitem"
      >
        <MindMapCard
          title={data.title}
          description={data.description}
        />
      </Box>
      
      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ 
          background: theme.palette.secondary.main,
          width: 10,
          height: 10
        }}
        aria-label={t('accessibility.nodeOutputHandle')}
      />
      
      {/* Left handle */}
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ 
          background: theme.palette.secondary.main,
          width: 10,
          height: 10
        }}
        aria-label={t('accessibility.nodeLeftHandle')}
      />
      
      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ 
          background: theme.palette.secondary.main,
          width: 10,
          height: 10
        }}
        aria-label={t('accessibility.nodeRightHandle')}
      />
    </>
  );
};

export default memo(MindMapCardNode);
