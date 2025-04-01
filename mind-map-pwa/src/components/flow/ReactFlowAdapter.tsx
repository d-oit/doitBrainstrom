// src/components/flow/ReactFlowAdapter.tsx
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  NodeTypes,
  EdgeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, CircularProgress, useTheme } from '@mui/material';
import { VersionedNode, VersionedEdge, VirtualizationConfig } from '../../utils/flow/FlowTypes';
import { VersionedStateManager } from '../../utils/versioning/VersionedStateManager';
import { sanitizeNode, sanitizeEdge } from '../../utils/security/InputSanitization';
import { useI18n } from '../../contexts/I18nContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { logInfo, logError } from '../../utils/logger';

// Import custom node types
import MindMapCardNode from './nodes/MindMapCardNode';

// Define custom node types
const nodeTypes: NodeTypes = {
  mindMapCard: MindMapCardNode
};

interface ReactFlowAdapterProps {
  stateManager: VersionedStateManager;
  isReadOnly?: boolean;
  virtualizationConfig?: VirtualizationConfig;
  onNodeClick?: (node: VersionedNode) => void;
  onEdgeClick?: (edge: VersionedEdge) => void;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

const ReactFlowAdapter: React.FC<ReactFlowAdapterProps> = ({
  stateManager,
  isReadOnly = false,
  virtualizationConfig,
  onNodeClick,
  onEdgeClick,
  onViewportChange
}) => {
  const { t } = useI18n();
  const { highContrastMode, reducedMotion } = useAccessibility();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get initial state from state manager
  const initialState = stateManager.getState();
  
  // Set up nodes and edges state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState.edges);
  
  // Get ReactFlow instance
  const reactFlowInstance = useReactFlow();
  
  // Load state from state manager
  useEffect(() => {
    const loadState = async () => {
      setIsLoading(true);
      try {
        // Load state from IndexedDB
        const success = await stateManager.loadState();
        if (success) {
          const state = stateManager.getState();
          setNodes(state.nodes);
          setEdges(state.edges);
          
          // Set viewport if available
          if (state.viewport && reactFlowInstance) {
            reactFlowInstance.setViewport(state.viewport);
          }
        }
      } catch (error) {
        logError('Error loading flow state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadState();
  }, [stateManager, setNodes, setEdges, reactFlowInstance]);
  
  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isReadOnly) return;
      
      // Apply changes to local state
      onNodesChange(changes);
      
      // Process each change and update state manager
      changes.forEach(change => {
        if (change.type === 'position' && change.position && change.id) {
          const node = nodes.find(n => n.id === change.id);
          if (node) {
            stateManager.updateNode(change.id, {
              position: change.position
            });
          }
        } else if (change.type === 'remove') {
          stateManager.deleteNode(change.id);
        }
      });
    },
    [nodes, onNodesChange, stateManager, isReadOnly]
  );
  
  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (isReadOnly) return;
      
      // Apply changes to local state
      onEdgesChange(changes);
      
      // Process each change and update state manager
      changes.forEach(change => {
        if (change.type === 'remove') {
          stateManager.deleteEdge(change.id);
        }
      });
    },
    [onEdgesChange, stateManager, isReadOnly]
  );
  
  // Handle edge connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (isReadOnly) return;
      
      // Create a new edge
      const newEdge: Partial<VersionedEdge> = {
        source: connection.source || '',
        target: connection.target || '',
        type: connection.type || 'default'
      };
      
      // Add edge to state manager
      const addedEdge = stateManager.addEdge(newEdge);
      
      // Update local state
      setEdges(prevEdges => [...prevEdges, addedEdge]);
    },
    [setEdges, stateManager, isReadOnly]
  );
  
  // Handle viewport change
  const handleViewportChange = useCallback(
    (viewport: { x: number; y: number; zoom: number }) => {
      // Update state manager
      stateManager.updateViewport(viewport);
      
      // Call external handler if provided
      if (onViewportChange) {
        onViewportChange(viewport);
      }
    },
    [stateManager, onViewportChange]
  );
  
  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node as VersionedNode);
      }
    },
    [onNodeClick]
  );
  
  // Handle edge click
  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge as VersionedEdge);
      }
    },
    [onEdgeClick]
  );
  
  // Virtualized nodes for performance
  const virtualizedNodes = useMemo(() => {
    if (!virtualizationConfig || !reactFlowInstance) {
      return nodes;
    }
    
    const { viewportWidth, viewportHeight, nodeWidth, nodeHeight, overscanCount } = virtualizationConfig;
    const { x, y, zoom } = reactFlowInstance.getViewport();
    
    // Calculate visible area
    const visibleLeft = -x / zoom;
    const visibleTop = -y / zoom;
    const visibleRight = visibleLeft + viewportWidth / zoom;
    const visibleBottom = visibleTop + viewportHeight / zoom;
    
    // Add overscan
    const overscanLeft = visibleLeft - overscanCount * nodeWidth;
    const overscanTop = visibleTop - overscanCount * nodeHeight;
    const overscanRight = visibleRight + overscanCount * nodeWidth;
    const overscanBottom = visibleBottom + overscanCount * nodeHeight;
    
    // Filter nodes to only those in the visible area plus overscan
    return nodes.filter(node => {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      
      return (
        nodeX + nodeWidth >= overscanLeft &&
        nodeX <= overscanRight &&
        nodeY + nodeHeight >= overscanTop &&
        nodeY <= overscanBottom
      );
    });
  }, [nodes, virtualizationConfig, reactFlowInstance]);
  
  // Determine which nodes to render
  const nodesToRender = virtualizationConfig ? virtualizedNodes : nodes;
  
  // Set up accessibility attributes
  const accessibilityProps = {
    'aria-label': t('accessibility.mindMap'),
    'aria-describedby': 'mind-map-description',
    role: 'application',
    tabIndex: 0
  };
  
  // Set up theme-based styles
  const flowStyles = {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper
      elevation={2}
      sx={{
        height: '70vh',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <ReactFlow
        nodes={nodesToRender}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onMove={handleViewportChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        style={flowStyles}
        {...accessibilityProps}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          {/* Custom controls can be added here */}
        </Panel>
      </ReactFlow>
    </Paper>
  );
};

// Wrap with ReactFlowProvider to ensure context is available
const ReactFlowAdapterWithProvider: React.FC<ReactFlowAdapterProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ReactFlowAdapter {...props} />
    </ReactFlowProvider>
  );
};

export default ReactFlowAdapterWithProvider;
