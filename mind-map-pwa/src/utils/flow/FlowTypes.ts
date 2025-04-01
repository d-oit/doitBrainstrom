// src/utils/flow/FlowTypes.ts
import { Node, Edge, Viewport } from 'reactflow';

/**
 * Versioned Node extends ReactFlow Node with version tracking
 */
export interface VersionedNode extends Node {
  version: number;
  lastModified: string;
  createdBy: string;
}

/**
 * Versioned Edge extends ReactFlow Edge with version tracking
 */
export interface VersionedEdge extends Edge {
  version: number;
  lastModified: string;
  createdBy: string;
}

/**
 * Flow State represents the complete state of the flow diagram
 */
export interface FlowState {
  nodes: VersionedNode[];
  edges: VersionedEdge[];
  viewport: Viewport;
  versionVector: Map<string, number>;
}

/**
 * Operation Priority for offline queue
 */
export enum OperationPriority {
  CRITICAL = 0, // Node deletions
  HIGH = 1,     // Edge changes
  NORMAL = 2    // Position updates
}

/**
 * Operation Type for offline queue
 */
export enum OperationType {
  ADD_NODE = 'ADD_NODE',
  UPDATE_NODE = 'UPDATE_NODE',
  DELETE_NODE = 'DELETE_NODE',
  ADD_EDGE = 'ADD_EDGE',
  UPDATE_EDGE = 'UPDATE_EDGE',
  DELETE_EDGE = 'DELETE_EDGE',
  UPDATE_VIEWPORT = 'UPDATE_VIEWPORT'
}

/**
 * Queued Operation for offline queue
 */
export interface QueuedOperation {
  id: string;
  type: OperationType;
  payload: any;
  priority: OperationPriority;
  timestamp: number;
  versionVector: Map<string, number>;
}

/**
 * Virtualization Configuration for optimized rendering
 */
export interface VirtualizationConfig {
  viewportWidth: number;
  viewportHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  overscanCount: number;
}
