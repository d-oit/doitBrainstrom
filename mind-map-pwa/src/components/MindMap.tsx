// src/components/MindMap.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, TextField, Button } from '@mui/material';
import MindMapCard from './MindMapCard';
import { useMindMap } from '../contexts/MindMapContext';
import { useI18n } from '../contexts/I18nContext';

const MindMap: React.FC = () => {
  const {
    mindMapData,
    createNode,
    linkNodes,
    editNodeText,
    updateNodePosition
  } = useMindMap();
  const { t, dir } = useI18n();

  const [newNodeText, setNewNodeText] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateNode = () => {
    if (newNodeText.trim() === '') return;

    // Create node in the center of the container
    const containerRect = containerRef.current?.getBoundingClientRect();
    const x = containerRect ? containerRect.width / 2 - 100 : 100; // Center X - half of default width
    const y = containerRect ? containerRect.height / 2 - 50 : 100; // Center Y - half of default height

    createNode(newNodeText, x, y);
    setNewNodeText('');
  };

  const handleNodeClick = (nodeId: string) => {
    if (selectedNodeId === null) {
      // First node selection
      setSelectedNodeId(nodeId);
    } else if (selectedNodeId !== nodeId) {
      // Second node selection - create link
      linkNodes(selectedNodeId, nodeId);
      setSelectedNodeId(null);
    } else {
      // Deselect if clicking the same node
      setSelectedNodeId(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    const node = mindMapData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Calculate the offset between mouse position and node position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggingNodeId(nodeId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;

    updateNodePosition(draggingNodeId, x, y);
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  useEffect(() => {
    // Add event listeners to handle mouse events outside the component
    const handleGlobalMouseUp = () => {
      setDraggingNodeId(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Draw links between nodes
  const renderLinks = () => {
    return mindMapData.links.map(link => {
      const sourceNode = mindMapData.nodes.find(node => node.id === link.sourceId);
      const targetNode = mindMapData.nodes.find(node => node.id === link.targetId);

      if (!sourceNode || !targetNode) return null;

      // Calculate center points of nodes
      const sourceX = sourceNode.x + sourceNode.width / 2;
      const sourceY = sourceNode.y + sourceNode.height / 2;
      const targetX = targetNode.x + targetNode.width / 2;
      const targetY = targetNode.y + targetNode.height / 2;

      return (
        <svg
          key={link.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke={selectedNodeId ? '#1976d2' : '#666'}
            strokeWidth={2}
          />
        </svg>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          label={t('mindMap.newNode')}
          variant="outlined"
          size="small"
          value={newNodeText}
          onChange={(e) => setNewNodeText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateNode()}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleCreateNode}
          disabled={newNodeText.trim() === ''}
        >
          {t('mindMap.addNode')}
        </Button>
      </Box>

      <Paper
        ref={containerRef}
        sx={{
          flexGrow: 1,
          position: 'relative',
          overflow: 'hidden',
          height: '500px',
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
          cursor: draggingNodeId ? 'grabbing' : 'default',
          direction: dir // Support RTL layout
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {renderLinks()}

        {mindMapData.nodes.map(node => (
          <Box
            key={node.id}
            sx={{
              position: 'absolute',
              top: node.y,
              left: node.x,
              zIndex: 1,
              border: selectedNodeId === node.id ? '2px solid #1976d2' : 'none',
              borderRadius: '4px',
              cursor: draggingNodeId === node.id ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            <MindMapCard
              title={node.text}
              onClick={() => handleNodeClick(node.id)}
            />
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default MindMap;
