// src/utils/security/InputSanitization.test.ts
import { describe, it, expect, vi } from 'vitest';
import { sanitizeNode, sanitizeEdge, validateNode, validateEdge } from './InputSanitization';
import { VersionedNode, VersionedEdge } from '../flow/FlowTypes';
import DOMPurify from 'dompurify';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((content, options) => {
      // Simple mock implementation that removes script tags
      if (typeof content === 'string') {
        return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
      return content;
    })
  }
}));

describe('InputSanitization', () => {
  describe('sanitizeNode', () => {
    it('should sanitize node content', () => {
      const node: VersionedNode = {
        id: 'node1',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Node',
          content: '<b>Valid</b> <script>alert("XSS")</script>'
        },
        type: 'default',
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      };

      const sanitizedNode = sanitizeNode(node);
      
      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(sanitizedNode.data.content).not.toContain('<script>');
    });

    it('should handle nodes without content', () => {
      const node: VersionedNode = {
        id: 'node1',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Node'
        },
        type: 'default',
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      };

      const sanitizedNode = sanitizeNode(node);
      
      expect(sanitizedNode).toEqual(node);
    });
  });

  describe('sanitizeEdge', () => {
    it('should sanitize edge label', () => {
      const edge: VersionedEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        data: {
          label: 'Connection <script>alert("XSS")</script>'
        },
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      };

      const sanitizedEdge = sanitizeEdge(edge);
      
      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(sanitizedEdge.data.label).not.toContain('<script>');
    });

    it('should handle edges without label', () => {
      const edge: VersionedEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        data: {},
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      };

      const sanitizedEdge = sanitizeEdge(edge);
      
      expect(sanitizedEdge).toEqual(edge);
    });
  });

  describe('validateNode', () => {
    it('should validate a valid node', () => {
      const node: VersionedNode = {
        id: 'node1',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' },
        type: 'default',
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      };

      expect(validateNode(node)).toBe(true);
    });

    it('should reject a node with missing required properties', () => {
      const invalidNode = {
        id: 'node1',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' },
        type: 'default',
        // Missing version, lastModified, and createdBy
      } as unknown as VersionedNode;

      expect(validateNode(invalidNode)).toBe(false);
    });

    it('should reject a node with invalid position', () => {
      const invalidNode = {
        id: 'node1',
        position: { x: 'invalid', y: 100 }, // x should be a number
        data: { label: 'Test Node' },
        type: 'default',
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      } as unknown as VersionedNode;

      expect(validateNode(invalidNode)).toBe(false);
    });
  });

  describe('validateEdge', () => {
    it('should validate a valid edge', () => {
      const edge: VersionedEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        data: {},
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      };

      expect(validateEdge(edge)).toBe(true);
    });

    it('should reject an edge with missing required properties', () => {
      const invalidEdge = {
        id: 'edge1',
        source: 'node1',
        // Missing target
        data: {},
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      } as unknown as VersionedEdge;

      expect(validateEdge(invalidEdge)).toBe(false);
    });

    it('should reject an edge with invalid source or target', () => {
      const invalidEdge = {
        id: 'edge1',
        source: 123, // source should be a string
        target: 'node2',
        data: {},
        version: 1,
        lastModified: new Date().toISOString(),
        createdBy: 'user1'
      } as unknown as VersionedEdge;

      expect(validateEdge(invalidEdge)).toBe(false);
    });
  });
});
