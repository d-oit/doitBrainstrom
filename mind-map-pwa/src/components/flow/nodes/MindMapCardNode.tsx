// src/components/flow/nodes/MindMapCardNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, useTheme } from '@mui/material';
import MindMapNode from '../../MindMap/MindMapNode';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { useI18n } from '../../../contexts/I18nContext';

interface MindMapCardNodeData {
  title: string;
  description?: string;
  isSelected?: boolean;
}

const MindMapCardNode: React.FC<NodeProps<MindMapCardNodeData>> = ({
  data,
  isConnectable,
  selected
}) => {
  const theme = useTheme();
  const { } = useAccessibility();
  const { t } = useI18n();

  // Determine border color based on selection state and theme
  const borderColor = selected
    ? theme.palette.primary.main
    : theme.palette.mode === 'dark'
      ? theme.palette.grey[700]
      : theme.palette.grey[300];

  // High contrast styles (disabled for now)
  const highContrastStyles = {};

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
          padding: 0.5,
          minWidth: 150,
          maxWidth: 250,
          ...highContrastStyles
        }}
        aria-selected={selected}
        role="treeitem"
      >
        <MindMapNode
          id={String(Math.random())}
          title={data.title}
          description={data.description}
          isSelected={selected}
          isRoot={false}
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
