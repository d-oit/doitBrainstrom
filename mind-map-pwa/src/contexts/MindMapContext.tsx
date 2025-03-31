// src/contexts/MindMapContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { MindMapData, MindMapNode, MindMapLink, generateId } from '../utils/MindMapDataModel';

interface MindMapContextProps {
  mindMapData: MindMapData;
  createNode: (text: string, x: number, y: number) => MindMapNode;
  linkNodes: (sourceId: string, targetId: string) => MindMapLink | null;
  editNodeText: (nodeId: string, newText: string) => MindMapNode | null;
  deleteNode: (nodeId: string) => void;
  deleteLink: (linkId: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  updateNodeSize: (nodeId: string, width: number, height: number) => void;
}

const MindMapContext = createContext<MindMapContextProps | undefined>(undefined);

export const MindMapContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mindMapData, setMindMapData] = useState<MindMapData>({ nodes: [], links: [] });

  const createNode = (text: string, x: number, y: number): MindMapNode => {
    const newNode: MindMapNode = {
      id: generateId(),
      text,
      x,
      y,
      width: 200, // Default width
      height: 100, // Default height
    };

    setMindMapData(prevData => ({
      ...prevData,
      nodes: [...prevData.nodes, newNode]
    }));

    return newNode;
  };

  const linkNodes = (sourceId: string, targetId: string): MindMapLink | null => {
    // Check if both nodes exist
    const sourceNode = mindMapData.nodes.find(node => node.id === sourceId);
    const targetNode = mindMapData.nodes.find(node => node.id === targetId);

    if (!sourceNode || !targetNode) {
      console.error('Source or target node not found');
      return null;
    }

    // Check if link already exists
    const existingLink = mindMapData.links.find(
      link => link.sourceId === sourceId && link.targetId === targetId
    );

    if (existingLink) {
      console.log('Link already exists');
      return existingLink;
    }

    const newLink: MindMapLink = {
      id: generateId(),
      sourceId,
      targetId,
    };

    setMindMapData(prevData => ({
      ...prevData,
      links: [...prevData.links, newLink]
    }));

    return newLink;
  };

  const editNodeText = (nodeId: string, newText: string): MindMapNode | null => {
    const nodeIndex = mindMapData.nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex === -1) {
      console.error('Node not found for editing');
      return null;
    }

    const updatedNodes = [...mindMapData.nodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      text: newText
    };

    setMindMapData(prevData => ({
      ...prevData,
      nodes: updatedNodes
    }));

    return updatedNodes[nodeIndex];
  };

  const deleteNode = (nodeId: string): void => {
    // Remove the node
    const updatedNodes = mindMapData.nodes.filter(node => node.id !== nodeId);
    
    // Remove any links connected to this node
    const updatedLinks = mindMapData.links.filter(
      link => link.sourceId !== nodeId && link.targetId !== nodeId
    );

    setMindMapData({
      nodes: updatedNodes,
      links: updatedLinks
    });
  };

  const deleteLink = (linkId: string): void => {
    const updatedLinks = mindMapData.links.filter(link => link.id !== linkId);
    
    setMindMapData(prevData => ({
      ...prevData,
      links: updatedLinks
    }));
  };

  const updateNodePosition = (nodeId: string, x: number, y: number): void => {
    const nodeIndex = mindMapData.nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex === -1) {
      console.error('Node not found for position update');
      return;
    }

    const updatedNodes = [...mindMapData.nodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      x,
      y
    };

    setMindMapData(prevData => ({
      ...prevData,
      nodes: updatedNodes
    }));
  };

  const updateNodeSize = (nodeId: string, width: number, height: number): void => {
    const nodeIndex = mindMapData.nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex === -1) {
      console.error('Node not found for size update');
      return;
    }

    const updatedNodes = [...mindMapData.nodes];
    updatedNodes[nodeIndex] = {
      ...updatedNodes[nodeIndex],
      width,
      height
    };

    setMindMapData(prevData => ({
      ...prevData,
      nodes: updatedNodes
    }));
  };

  const value: MindMapContextProps = {
    mindMapData,
    createNode,
    linkNodes,
    editNodeText,
    deleteNode,
    deleteLink,
    updateNodePosition,
    updateNodeSize
  };

  return (
    <MindMapContext.Provider value={value}>
      {children}
    </MindMapContext.Provider>
  );
};

export const useMindMap = () => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMap must be used within a MindMapContextProvider');
  }
  return context;
};
