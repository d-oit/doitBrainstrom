// src/utils/security/InputSanitization.ts
import DOMPurify from 'dompurify';
import { VersionedNode, VersionedEdge } from '../flow/FlowTypes';
import { logError } from '../logger';

/**
 * Sanitizes node content to prevent XSS attacks
 * @param node The node to sanitize
 * @returns Sanitized node
 */
export const sanitizeNode = (node: VersionedNode): VersionedNode => {
  try {
    // Create a deep copy to avoid mutating the original
    const sanitizedNode = { ...node };

    // Sanitize node data content if it exists
    if (sanitizedNode.data && typeof sanitizedNode.data === 'object') {
      const sanitizedData = { ...sanitizedNode.data };

      // Sanitize content field if it exists
      if (sanitizedData.content && typeof sanitizedData.content === 'string') {
        sanitizedData.content = DOMPurify.sanitize(sanitizedData.content, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
          ALLOWED_ATTR: []
        });
      }

      // Sanitize label field if it exists
      if (sanitizedData.label && typeof sanitizedData.label === 'string') {
        sanitizedData.label = DOMPurify.sanitize(sanitizedData.label, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: []
        });
      }

      sanitizedNode.data = sanitizedData;
    }

    return sanitizedNode;
  } catch (error) {
    logError('Error sanitizing node:', error);
    // Return the original node if sanitization fails
    return node;
  }
};

/**
 * Sanitizes edge data to prevent XSS attacks
 * @param edge The edge to sanitize
 * @returns Sanitized edge
 */
export const sanitizeEdge = (edge: VersionedEdge): VersionedEdge => {
  try {
    // Create a deep copy to avoid mutating the original
    const sanitizedEdge = { ...edge };

    // Sanitize edge data if it exists
    if (sanitizedEdge.data && typeof sanitizedEdge.data === 'object') {
      const sanitizedData = { ...sanitizedEdge.data };

      // Sanitize label field if it exists
      if (sanitizedData.label && typeof sanitizedData.label === 'string') {
        sanitizedData.label = DOMPurify.sanitize(sanitizedData.label, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: []
        });
      }

      sanitizedEdge.data = sanitizedData;
    }

    return sanitizedEdge;
  } catch (error) {
    logError('Error sanitizing edge:', error);
    // Return the original edge if sanitization fails
    return edge;
  }
};

/**
 * Validates a node against a schema
 * @param node The node to validate
 * @returns True if valid, false otherwise
 */
export const validateNode = (node: VersionedNode): boolean => {
  // Basic validation
  if (!node || typeof node !== 'object') return false;
  if (!node.id || typeof node.id !== 'string') return false;

  // Validate required properties
  if (node.version === undefined || typeof node.version !== 'number') return false;
  if (!node.lastModified || typeof node.lastModified !== 'string') return false;
  if (!node.createdBy || typeof node.createdBy !== 'string') return false;

  // Validate position
  if (!node.position || typeof node.position !== 'object') return false;
  if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') return false;

  return true;
};

/**
 * Validates an edge against a schema
 * @param edge The edge to validate
 * @returns True if valid, false otherwise
 */
export const validateEdge = (edge: VersionedEdge): boolean => {
  // Basic validation
  if (!edge || typeof edge !== 'object') return false;
  if (!edge.id || typeof edge.id !== 'string') return false;

  // Validate required properties
  if (edge.version === undefined || typeof edge.version !== 'number') return false;
  if (!edge.lastModified || typeof edge.lastModified !== 'string') return false;
  if (!edge.createdBy || typeof edge.createdBy !== 'string') return false;

  // Validate source and target
  if (!edge.source || typeof edge.source !== 'string') return false;
  if (!edge.target || typeof edge.target !== 'string') return false;

  return true;
};

/**
 * Batch sanitizes an array of nodes
 * @param nodes Array of nodes to sanitize
 * @returns Array of sanitized nodes
 */
export const sanitizeNodes = (nodes: VersionedNode[]): VersionedNode[] => {
  return nodes.map(node => sanitizeNode(node));
};

/**
 * Batch sanitizes an array of edges
 * @param edges Array of edges to sanitize
 * @returns Array of sanitized edges
 */
export const sanitizeEdges = (edges: VersionedEdge[]): VersionedEdge[] => {
  return edges.map(edge => sanitizeEdge(edge));
};
