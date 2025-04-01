// src/utils/versioning/VersionedStateManager.ts
import { FlowState, VersionedNode, VersionedEdge } from '../flow/FlowTypes';
import {
  createVersionVector,
  incrementVersion,
  mergeVersionVectors,
  compareVersionVectors
} from '../version-vector';
import { logInfo, logError } from '../logger';
import { sanitizeNode, sanitizeEdge, validateNode, validateEdge } from '../security/InputSanitization';
import { saveMindMap, getMindMap } from '../indexedDB/dbService';
import { generateId } from '../MindMapDataModel';

/**
 * Class to manage versioned state for the flow diagram
 */
export class VersionedStateManager {
  private currentState: FlowState;
  private stateHistory: FlowState[] = [];
  private maxHistorySize: number = 50;
  private clientId: string;

  constructor(initialState?: FlowState) {
    // Generate a client ID for version tracking
    this.clientId = localStorage.getItem('clientId') || this.generateClientId();
    localStorage.setItem('clientId', this.clientId);

    // Initialize with empty state if none provided
    this.currentState = initialState || {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      versionVector: {}
    };

    // Initialize version vector if empty
    if (!this.currentState.versionVector || Object.keys(this.currentState.versionVector).length === 0) {
      this.currentState.versionVector = createVersionVector();
    }

    logInfo('VersionedStateManager initialized', { clientId: this.clientId });
  }

  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return `client_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get the current state
   */
  public getState(): FlowState {
    return this.currentState;
  }

  /**
   * Save the current state to history
   */
  private saveToHistory(): void {
    // Create a deep copy of the current state
    const stateCopy: FlowState = {
      nodes: JSON.parse(JSON.stringify(this.currentState.nodes)),
      edges: JSON.parse(JSON.stringify(this.currentState.edges)),
      viewport: { ...this.currentState.viewport },
      versionVector: { ...this.currentState.versionVector }
    };

    // Add to history
    this.stateHistory.push(stateCopy);

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * Add a node to the state
   * @param node The node to add
   * @returns The added node
   */
  public addNode(node: Partial<VersionedNode>): VersionedNode {
    // Save current state to history
    this.saveToHistory();

    // Create a new node with version information
    const newNode: VersionedNode = {
      id: node.id || generateId(),
      type: node.type || 'default',
      position: node.position || { x: 0, y: 0 },
      data: node.data || { label: 'New Node' },
      version: 1,
      lastModified: new Date().toISOString(),
      createdBy: this.clientId,
      ...node
    };

    // Sanitize and validate the node
    const sanitizedNode = sanitizeNode(newNode);
    if (!validateNode(sanitizedNode)) {
      throw new Error('Invalid node data');
    }

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Add node to state
    this.currentState.nodes.push(sanitizedNode);

    // Persist to IndexedDB
    this.persistState();

    return sanitizedNode;
  }

  /**
   * Update a node in the state
   * @param nodeId The ID of the node to update
   * @param updates The updates to apply
   * @returns The updated node or null if not found
   */
  public updateNode(nodeId: string, updates: Partial<VersionedNode>): VersionedNode | null {
    const nodeIndex = this.currentState.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex === -1) {
      return null;
    }

    // Save current state to history
    this.saveToHistory();

    // Create updated node
    const existingNode = this.currentState.nodes[nodeIndex];
    const updatedNode: VersionedNode = {
      ...existingNode,
      ...updates,
      version: existingNode.version + 1,
      lastModified: new Date().toISOString()
    };

    // Sanitize and validate the node
    const sanitizedNode = sanitizeNode(updatedNode);
    if (!validateNode(sanitizedNode)) {
      throw new Error('Invalid node data');
    }

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Update node in state
    this.currentState.nodes[nodeIndex] = sanitizedNode;

    // Persist to IndexedDB
    this.persistState();

    return sanitizedNode;
  }

  /**
   * Delete a node from the state
   * @param nodeId The ID of the node to delete
   * @returns True if deleted, false if not found
   */
  public deleteNode(nodeId: string): boolean {
    const nodeIndex = this.currentState.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex === -1) {
      return false;
    }

    // Save current state to history
    this.saveToHistory();

    // Remove node from state
    this.currentState.nodes.splice(nodeIndex, 1);

    // Remove any edges connected to this node
    this.currentState.edges = this.currentState.edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Persist to IndexedDB
    this.persistState();

    return true;
  }

  /**
   * Add an edge to the state
   * @param edge The edge to add
   * @returns The added edge
   */
  public addEdge(edge: Partial<VersionedEdge>): VersionedEdge {
    // Save current state to history
    this.saveToHistory();

    // Create a new edge with version information
    const newEdge: VersionedEdge = {
      id: edge.id || generateId(),
      source: edge.source || '',
      target: edge.target || '',
      type: edge.type || 'default',
      data: edge.data || {},
      version: 1,
      lastModified: new Date().toISOString(),
      createdBy: this.clientId,
      ...edge
    };

    // Sanitize and validate the edge
    const sanitizedEdge = sanitizeEdge(newEdge);
    if (!validateEdge(sanitizedEdge)) {
      throw new Error('Invalid edge data');
    }

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Add edge to state
    this.currentState.edges.push(sanitizedEdge);

    // Persist to IndexedDB
    this.persistState();

    return sanitizedEdge;
  }

  /**
   * Update an edge in the state
   * @param edgeId The ID of the edge to update
   * @param updates The updates to apply
   * @returns The updated edge or null if not found
   */
  public updateEdge(edgeId: string, updates: Partial<VersionedEdge>): VersionedEdge | null {
    const edgeIndex = this.currentState.edges.findIndex(edge => edge.id === edgeId);
    if (edgeIndex === -1) {
      return null;
    }

    // Save current state to history
    this.saveToHistory();

    // Create updated edge
    const existingEdge = this.currentState.edges[edgeIndex];
    const updatedEdge: VersionedEdge = {
      ...existingEdge,
      ...updates,
      version: existingEdge.version + 1,
      lastModified: new Date().toISOString()
    };

    // Sanitize and validate the edge
    const sanitizedEdge = sanitizeEdge(updatedEdge);
    if (!validateEdge(sanitizedEdge)) {
      throw new Error('Invalid edge data');
    }

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Update edge in state
    this.currentState.edges[edgeIndex] = sanitizedEdge;

    // Persist to IndexedDB
    this.persistState();

    return sanitizedEdge;
  }

  /**
   * Delete an edge from the state
   * @param edgeId The ID of the edge to delete
   * @returns True if deleted, false if not found
   */
  public deleteEdge(edgeId: string): boolean {
    const edgeIndex = this.currentState.edges.findIndex(edge => edge.id === edgeId);
    if (edgeIndex === -1) {
      return false;
    }

    // Save current state to history
    this.saveToHistory();

    // Remove edge from state
    this.currentState.edges.splice(edgeIndex, 1);

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Persist to IndexedDB
    this.persistState();

    return true;
  }

  /**
   * Update the viewport
   * @param viewport The new viewport
   */
  public updateViewport(viewport: { x: number; y: number; zoom: number }): void {
    // Save current state to history
    this.saveToHistory();

    // Update viewport
    this.currentState.viewport = viewport;

    // Increment version vector
    this.currentState.versionVector = incrementVersion(this.currentState.versionVector);

    // Persist to IndexedDB
    this.persistState();
  }

  /**
   * Undo the last change
   * @returns True if undo was successful, false otherwise
   */
  public undo(): boolean {
    if (this.stateHistory.length === 0) {
      return false;
    }

    // Get the last state from history
    const previousState = this.stateHistory.pop();
    if (!previousState) {
      return false;
    }

    // Restore the previous state
    this.currentState = previousState;

    // Persist to IndexedDB
    this.persistState();

    return true;
  }

  /**
   * Merge a remote state with the current state
   * @param remoteState The remote state to merge
   * @returns True if merge was successful, false if there was a conflict
   */
  public mergeState(remoteState: FlowState): boolean {
    // Compare version vectors
    const comparison = compareVersionVectors(
      this.currentState.versionVector,
      remoteState.versionVector
    );

    // If remote is ancestor of current, no need to merge
    if (comparison === 'descendant') {
      return true;
    }

    // If current is ancestor of remote, replace with remote
    if (comparison === 'ancestor') {
      this.saveToHistory();
      this.currentState = remoteState;
      this.persistState();
      return true;
    }

    // If equal, no need to merge
    if (comparison === 'equal') {
      return true;
    }

    // If conflict, need to resolve
    if (comparison === 'conflict') {
      // For now, just log the conflict
      logInfo('Conflict detected during state merge', {
        local: this.currentState.versionVector,
        remote: remoteState.versionVector
      });

      // TODO: Implement conflict resolution
      // For now, just merge the version vectors
      this.currentState.versionVector = mergeVersionVectors(
        this.currentState.versionVector,
        remoteState.versionVector
      );

      // Persist to IndexedDB
      this.persistState();

      return false;
    }

    return true;
  }

  /**
   * Persist the current state to IndexedDB
   */
  private persistState(): void {
    try {
      // Convert to a format suitable for IndexedDB
      const stateForStorage = {
        id: 'flow-state',
        data: {
          nodes: this.currentState.nodes,
          edges: this.currentState.edges,
          viewport: this.currentState.viewport,
          versionVector: this.currentState.versionVector,
          lastModified: new Date().toISOString(),
          synced: false
        }
      };

      // Save to IndexedDB
      saveMindMap(stateForStorage as any)
        .then(() => logInfo('State persisted to IndexedDB'))
        .catch(error => logError('Error persisting state to IndexedDB:', error));
    } catch (error) {
      logError('Error preparing state for persistence:', error);
    }
  }

  /**
   * Load state from IndexedDB
   * @returns Promise that resolves when state is loaded
   */
  public async loadState(): Promise<boolean> {
    try {
      const storedState = await getMindMap('flow-state');
      if (!storedState) {
        // If no state exists, create a default state with a sample node
        this.createDefaultState();
        // Persist the default state
        this.persistState();
        return true;
      }

      // Convert from storage format
      const loadedState: FlowState = {
        nodes: storedState.data.nodes || [],
        edges: storedState.data.edges || [],
        viewport: storedState.data.viewport || { x: 0, y: 0, zoom: 1 },
        versionVector: storedState.data.versionVector || createVersionVector()
      };

      // Update current state
      this.currentState = loadedState;

      // If there are no nodes, create a default state
      if (this.currentState.nodes.length === 0) {
        this.createDefaultState();
        this.persistState();
      }

      return true;
    } catch (error) {
      logError('Error loading state from IndexedDB:', error);
      // Create a default state on error
      this.createDefaultState();
      this.persistState();
      return true;
    }
  }

  /**
   * Create a default state with a sample node
   */
  private createDefaultState(): void {
    // Create a sample node in the center of the viewport
    const sampleNode: VersionedNode = {
      id: generateId(),
      type: 'mindMapCard',
      position: { x: 100, y: 100 },
      data: {
        title: 'Welcome to Mind Map',
        description: 'Click to edit or drag to move. Add more nodes using the + button.'
      },
      version: 1,
      lastModified: new Date().toISOString(),
      createdBy: this.clientId
    };

    // Set as current state
    this.currentState = {
      nodes: [sampleNode],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      versionVector: createVersionVector()
    };
  }
}
