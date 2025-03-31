// src/services/s3SyncService.ts
import AWS from 'aws-sdk';
import { MindMapData } from '../utils/MindMapDataModel';
import { 
  saveMindMap, 
  getMindMap, 
  getUnsyncedMindMaps,
  MindMapRecord 
} from '../utils/indexedDB/dbService';

// Initialize S3 client
const s3 = new AWS.S3({
  endpoint: import.meta.env.VITE_S3_ENDPOINT,
  accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const MIND_MAP_KEY = 'mind-map-data.json';

// Save mind map data to S3
export const saveMindMapToS3 = async (mindMapData: MindMapData): Promise<boolean> => {
  try {
    console.log('Saving mind map data to S3...');
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: MIND_MAP_KEY,
      Body: JSON.stringify(mindMapData),
      ContentType: 'application/json'
    };
    
    await s3.putObject(params).promise();
    console.log('Mind map data saved to S3 successfully');
    return true;
  } catch (error) {
    console.error('Error saving mind map data to S3:', error);
    return false;
  }
};

// Load mind map data from S3
export const loadMindMapFromS3 = async (): Promise<MindMapData | null> => {
  try {
    console.log('Loading mind map data from S3...');
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: MIND_MAP_KEY
    };
    
    const response = await s3.getObject(params).promise();
    
    if (response.Body) {
      const data = JSON.parse(response.Body.toString()) as MindMapData;
      console.log('Mind map data loaded from S3 successfully');
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading mind map data from S3:', error);
    return null;
  }
};

// Initialize mind map data (from S3 or IndexedDB)
export const initializeMindMapData = async (defaultId: string = 'default'): Promise<MindMapData> => {
  try {
    // Try to load from S3 first
    const s3Data = await loadMindMapFromS3();
    
    if (s3Data) {
      // If S3 data exists, save it to IndexedDB and return it
      await saveMindMap({
        id: defaultId,
        data: s3Data,
        lastModified: new Date().toISOString(),
        synced: true
      });
      
      return s3Data;
    }
    
    // If no S3 data, try to load from IndexedDB
    const localData = await getMindMap(defaultId);
    
    if (localData) {
      return localData.data;
    }
    
    // If no data exists anywhere, create a new empty mind map
    const emptyMindMap: MindMapData = {
      nodes: [],
      links: []
    };
    
    // Save the empty mind map to IndexedDB
    await saveMindMap({
      id: defaultId,
      data: emptyMindMap,
      lastModified: new Date().toISOString(),
      synced: false
    });
    
    return emptyMindMap;
  } catch (error) {
    console.error('Error initializing mind map data:', error);
    
    // Return empty mind map as fallback
    return {
      nodes: [],
      links: []
    };
  }
};

// Sync mind map data (from IndexedDB to S3)
export const syncMindMapData = async (): Promise<boolean> => {
  try {
    console.log('Syncing mind map data...');
    
    // Get all unsynced mind maps
    const unsyncedMindMaps = await getUnsyncedMindMaps();
    
    if (unsyncedMindMaps.length === 0) {
      console.log('No unsynced mind maps to sync');
      return true;
    }
    
    // Get the latest S3 data for conflict resolution
    const s3Data = await loadMindMapFromS3();
    
    // Process each unsynced mind map
    for (const mindMap of unsyncedMindMaps) {
      let shouldSync = true;
      
      // Simple conflict resolution: Compare timestamps if S3 data exists
      if (s3Data && s3Data.lastModified) {
        const s3Timestamp = new Date(s3Data.lastModified).getTime();
        const localTimestamp = new Date(mindMap.lastModified).getTime();
        
        if (s3Timestamp > localTimestamp) {
          // S3 has newer data, update local data
          await saveMindMap({
            ...mindMap,
            data: s3Data,
            lastModified: new Date().toISOString(),
            synced: true
          });
          
          shouldSync = false;
        }
      }
      
      if (shouldSync) {
        // Upload local data to S3
        const success = await saveMindMapToS3({
          ...mindMap.data,
          lastModified: new Date().toISOString()
        });
        
        if (success) {
          // Mark as synced in IndexedDB
          await saveMindMap({
            ...mindMap,
            synced: true
          });
        } else {
          console.error('Failed to sync mind map to S3:', mindMap.id);
          return false;
        }
      }
    }
    
    console.log('Mind map data synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing mind map data:', error);
    return false;
  }
};

// Save mind map data locally and mark for sync
export const saveMindMapLocally = async (
  mindMapData: MindMapData, 
  id: string = 'default'
): Promise<boolean> => {
  try {
    // Save to IndexedDB
    const success = await saveMindMap({
      id,
      data: mindMapData,
      lastModified: new Date().toISOString(),
      synced: false
    });
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      syncMindMapData().catch(error => {
        console.error('Background sync failed:', error);
      });
    } else if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
      // Register for background sync when online
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-mindmap');
    }
    
    return success;
  } catch (error) {
    console.error('Error saving mind map locally:', error);
    return false;
  }
};
