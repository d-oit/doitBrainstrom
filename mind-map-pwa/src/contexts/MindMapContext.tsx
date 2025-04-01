// src/contexts/MindMapContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { initializeMindMapData, saveMindMapLocally, S3ErrorType } from '../services/s3SyncService';
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
  isLoading: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncMindMap: () => Promise<boolean>;
}

const MindMapContext = createContext<MindMapContextProps | undefined>(undefined);

export const MindMapContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mindMapData, setMindMapData] = useState<MindMapData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Load mind map data from IndexedDB or S3 on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await initializeMindMapData();
        setMindMapData(result.data);

        // Handle S3 errors and set appropriate status
        if (result.error) {
          let errorMessage = 'Error connecting to S3. Changes will be saved locally.';
          
          switch (result.error) {
            case S3ErrorType.ACCESS_DENIED:
              errorMessage = 'Access denied to S3 storage. Check your permissions.';
              setSyncStatus('error');
              break;
            case S3ErrorType.NOT_CONFIGURED:
              errorMessage = 'S3 storage is not configured. Using local storage.';
              setSyncStatus('idle');
              break;
            case S3ErrorType.NETWORK_ERROR:
              errorMessage = 'Network error connecting to S3. Using local storage.';
              setSyncStatus('error');
              break;
            default:
              setSyncStatus('error');
          }

          if (window.ErrorNotificationContext?.showError) {
            window.ErrorNotificationContext.showError(errorMessage);
          }
          return;
        }

        // Set status based on data source
        setSyncStatus(result.source === 's3' ? 'success' : 'idle');
      } catch (error) {
        console.error('Error loading mind map data:', error);
        setSyncStatus('error');
        if (window.ErrorNotificationContext?.showError) {
          window.ErrorNotificationContext.showError(
            'Failed to load mind map data. Using empty map.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save mind map data to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveMindMapLocally(mindMapData).catch(error => {
        console.error('Error saving mind map data:', error);
        if (window.ErrorNotificationContext?.showError) {
          window.ErrorNotificationContext.showError(
            'Failed to save changes. Please try again.'
          );
        }
      });
    }
  }, [mindMapData, isLoading]);

  // Function to manually trigger synchronization
  const syncMindMap = useCallback(async (): Promise<boolean> => {
    if (navigator.onLine) {
      setSyncStatus('syncing');
      try {
        const result = await saveMindMapLocally(mindMapData);
        
        if (result.error) {
          let errorMessage = 'Error syncing to S3. Changes saved locally.';
          
          switch (result.error) {
            case S3ErrorType.ACCESS_DENIED:
              errorMessage = 'Access denied to S3 storage. Changes saved locally only.';
              break;
            case S3ErrorType.NETWORK_ERROR:
              errorMessage = 'Network error while syncing. Changes saved locally only.';
              break;
          }

          if (window.ErrorNotificationContext?.showError) {
            window.ErrorNotificationContext.showError(errorMessage);
          }
        }

        setSyncStatus(result.success ? 'success' : 'error');
        return result.success;
      } catch (error) {
        console.error('Error syncing mind map:', error);
        setSyncStatus('error');
        if (window.ErrorNotificationContext?.showError) {
          window.ErrorNotificationContext.showError(
            'Failed to sync changes. Will try again later.'
          );
        }
        return false;
      }
    } else {
      console.log('App is offline, sync queued for when online');
      setSyncStatus('idle');
      return false;
    }
  }, [mindMapData, setSyncStatus]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online, attempting to sync...');
      syncMindMap();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncMindMap]);

  // Mind map operations
  const createNode = (text: string, x: number, y: number): MindMapNode => {
    const newNode: MindMapNode = {
      id: generateId(),
      text,
      x,
      y,
      width: 200,
      height: 100,
    };

    setMindMapData(prevData => ({
      ...prevData,
      nodes: [...prevData.nodes, newNode]
    }));

    return newNode;
  };

  const linkNodes = (sourceId: string, targetId: string): MindMapLink | null => {
    const sourceNode = mindMapData.nodes.find(node => node.id === sourceId);
    const targetNode = mindMapData.nodes.find(node => node.id === targetId);

    if (!sourceNode || !targetNode) {
      console.error('Source or target node not found');
      return null;
    }

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
    const updatedNodes = mindMapData.nodes.filter(node => node.id !== nodeId);
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
    updateNodeSize,
    isLoading,
    syncStatus,
    syncMindMap
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
