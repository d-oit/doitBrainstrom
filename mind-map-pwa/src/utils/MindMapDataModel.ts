// src/utils/MindMapDataModel.ts
export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  language?: string; // For internationalization support
}

export interface MindMapLink {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  direction?: 'ltr' | 'rtl'; // For internationalization support
}

export interface MindMapData {
  nodes: MindMapNode[];
  links: MindMapLink[];
  language?: string; // Current language of the mind map
}

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
