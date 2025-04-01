// src/components/MindMap.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Paper, TextField, Button } from '@mui/material';
import MindMapCard from './MindMapCard';
import MapControls from './mindmap/MapControls';
import { useMindMap } from '../contexts/MindMapContext';
import { useI18n } from '../contexts/I18nContext';
import { useResponsive } from '../contexts/ResponsiveContext';
import { loadPriority } from '../utils/performanceConfig';
import '../styles/responsive.css';

const MindMap: React.FC = () => {
  const {
    mindMapData,
    createNode,
    linkNodes,
    updateNodePosition
  } = useMindMap();
  const { t, dir } = useI18n();
  const {
    viewport,
    shouldReduceAnimations
  } = useResponsive();

  // Get device-specific loading configuration
  const deviceLoadConfig = loadPriority[viewport.deviceCategory];

  // Responsive configuration based on device category
  const getCanvasConfig = () => {
    // Map device category to canvas configuration
    if (viewport.isMobile) {
      return { nodeSize: 32, fontScale: 0.8, linkWidth: 1, initialNodes: deviceLoadConfig.initialNodes }; // mobile
    } else if (viewport.isTablet) {
      return { nodeSize: 40, fontScale: 1.0, linkWidth: 1.5, initialNodes: deviceLoadConfig.initialNodes }; // tablet
    } else if (viewport.isDesktop) {
      return { nodeSize: 48, fontScale: 1.2, linkWidth: 2, initialNodes: deviceLoadConfig.initialNodes }; // desktop
    } else {
      return { nodeSize: 56, fontScale: 1.3, linkWidth: 2.5, initialNodes: deviceLoadConfig.initialNodes }; // widescreen
    }
  };

  const canvasConfig = getCanvasConfig();

  const [newNodeText, setNewNodeText] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [lastDistance, setLastDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map control functions
  const handleZoomIn = () => {
    setScale(prev => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  const handleCenterMap = () => {
    if (!containerRef.current) return;

    // Reset position and scale
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  // Undo/Redo state (placeholder for actual implementation)
  const [canUndo] = useState(false);
  const [canRedo] = useState(false);

  const handleUndo = () => {
    // Implement undo functionality
    console.log('Undo');
  };

  const handleRedo = () => {
    // Implement redo functionality
    console.log('Redo');
  };

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

  // Touch event handlers for mobile devices
  const handleTouchStart = useCallback((e: React.TouchEvent, nodeId: string) => {
    e.stopPropagation();

    const node = mindMapData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Single touch for dragging
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;

      setDraggingNodeId(nodeId);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  }, [mindMapData.nodes]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && draggingNodeId && containerRef.current) {
      e.preventDefault(); // Prevent scrolling while dragging

      const touch = e.touches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - containerRect.left - dragOffset.x;
      const y = touch.clientY - containerRect.top - dragOffset.y;

      updateNodePosition(draggingNodeId, x, y);
    } else if (e.touches.length === 2) {
      // Handle pinch zoom
      e.preventDefault();

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (!isPinching) {
        setIsPinching(true);
        setLastDistance(distance);
      } else {
        // Calculate new scale
        const delta = distance / lastDistance;
        const newScale = Math.max(0.5, Math.min(2, scale * delta));
        setScale(newScale);
        setLastDistance(distance);
      }
    }
  }, [draggingNodeId, dragOffset, updateNodePosition, isPinching, lastDistance, scale]);

  const handleTouchEnd = useCallback(() => {
    setDraggingNodeId(null);
    setIsPinching(false);
  }, []);

  // Handle canvas panning with touch
  const handleCanvasTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && !draggingNodeId) {
      // Pan the canvas
      e.preventDefault();
      const touch = e.touches[0];
      setPosition(prev => ({
        x: prev.x + touch.clientX - (e.target as HTMLElement).getBoundingClientRect().left,
        y: prev.y + touch.clientY - (e.target as HTMLElement).getBoundingClientRect().top
      }));
    }
  }, [draggingNodeId]);

  useEffect(() => {
    // Add event listeners to handle mouse/touch events outside the component
    const handleGlobalMouseUp = () => {
      setDraggingNodeId(null);
    };

    const handleGlobalTouchEnd = () => {
      setDraggingNodeId(null);
      setIsPinching(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
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
            strokeWidth={canvasConfig.linkWidth}
          />
        </svg>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Only show text input in tablet and larger screens */}
      {!viewport.isMobile && (
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
      )}

      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        <Paper
          ref={containerRef}
          className="mind-map-container"
          sx={{
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden',
            height: viewport.isMobile ?
                    (viewport.isLandscape ? 'calc(100vh - 150px)' : 'calc(100vh - 200px)') :
                    viewport.isTablet ? '600px' :
                    viewport.isDesktop ? '700px' : '800px',
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
            cursor: draggingNodeId ? 'grabbing' : 'default',
            direction: dir, // Support RTL layout
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: '0 0',
            transition: isPinching || shouldReduceAnimations ? 'none' : 'transform 0.1s ease-out',
            touchAction: 'none' // Disable browser handling of touch gestures
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleTouchEnd}
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
                cursor: draggingNodeId === node.id ? 'grabbing' : 'grab',
                touchAction: 'none' // Disable browser handling of touch gestures
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onTouchStart={(e) => handleTouchStart(e, node.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <MindMapCard
                title={node.text}
                onClick={() => handleNodeClick(node.id)}
              />
            </Box>
          ))}
        </Paper>

        {/* Add the map controls */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onAddNode={() => {
            // For mobile, show a prompt to enter text
            if (viewport.isMobile) {
              const text = prompt(t('mindMap.enterNodeText'));
              if (text && text.trim() !== '') {
                setNewNodeText(text);
                handleCreateNode();
              }
            } else {
              // Focus the text field for desktop
              const textField = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (textField) textField.focus();
            }
          }}
          onDeleteNode={() => {
            // Implement delete functionality
            console.log('Delete node', selectedNodeId);
          }}
          onEditNode={() => {
            // Implement edit functionality
            console.log('Edit node', selectedNodeId);
          }}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCenter={handleCenterMap}
          canUndo={canUndo}
          canRedo={canRedo}
          canDelete={selectedNodeId !== null}
          canEdit={selectedNodeId !== null}
        />
      </Box>
    </Box>
  );
};

export default MindMap;
