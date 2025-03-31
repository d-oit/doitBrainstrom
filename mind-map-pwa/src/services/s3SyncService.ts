// src/services/s3SyncService.ts
import AWS from 'aws-sdk';
import { MindMapData } from '../utils/MindMapDataModel';
import {
  saveMindMap,
  getMindMap,
  getUnsyncedMindMaps
} from '../utils/indexedDB/dbService';
import { logInfo, logError, logWarn } from '../utils/logger';
import { StorageError, SyncError } from '../utils/errorHandler';

// Get environment variables
const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT as string;
const S3_ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID as string;
const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY as string;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME as string;

// Initialize S3 client
const s3 = new AWS.S3({
  endpoint: S3_ENDPOINT,
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});
const MIND_MAP_KEY = 'mind-map-data.json';

// Save mind map data to S3
export const saveMindMapToS3 = async (mindMapData: MindMapData): Promise<boolean> => {
  try {
    logInfo('Saving mind map data to S3...');

    const params = {
      Bucket: BUCKET_NAME,
      Key: MIND_MAP_KEY,
      Body: JSON.stringify(mindMapData),
      ContentType: 'application/json'
    };

    await s3.putObject(params).promise();
    logInfo('Mind map data saved to S3 successfully');
    return true;
  } catch (error) {
    const errorMessage = 'Error saving mind map data to S3';
    logError(errorMessage, error);

    // Don't throw here to allow graceful fallback to offline mode
    return false;
  }
};

// Load mind map data from S3
export const loadMindMapFromS3 = async (): Promise<MindMapData | null> => {
  try {
    logInfo('Loading mind map data from S3...');

    const params = {
      Bucket: BUCKET_NAME,
      Key: MIND_MAP_KEY
    };

    const response = await s3.getObject(params).promise();

    if (response.Body) {
      try {
        const data = JSON.parse(response.Body.toString()) as MindMapData;
        logInfo('Mind map data loaded from S3 successfully');
        return data;
      } catch (parseError) {
        const errorMessage = 'Error parsing mind map data from S3';
        logError(errorMessage, parseError);
        return null;
      }
    }

    logWarn('No mind map data found in S3');
    return null;
  } catch (error) {
    // Check if this is a 'NoSuchKey' error, which means the file doesn't exist yet
    if ((error as AWS.AWSError).code === 'NoSuchKey') {
      logInfo('No mind map file exists in S3 yet');
      return null;
    }

    const errorMessage = 'Error loading mind map data from S3';
    logError(errorMessage, error);
    return null;
  }
};

// Initialize mind map data (from S3 or IndexedDB)
export const initializeMindMapData = async (defaultId: string = 'default'): Promise<MindMapData> => {
  try {
    logInfo('Initializing mind map data...');

    // Try to load from S3 first
    try {
      const s3Data = await loadMindMapFromS3();

      if (s3Data) {
        logInfo('Using data from S3');
        // If S3 data exists, save it to IndexedDB and return it
        try {
          await saveMindMap({
            id: defaultId,
            data: s3Data,
            lastModified: new Date().toISOString(),
            synced: true
          });
        } catch (dbError) {
          logError('Failed to save S3 data to IndexedDB', dbError);
          // Continue with S3 data even if saving to IndexedDB fails
        }

        return s3Data;
      }
    } catch (s3Error) {
      logWarn('Failed to load data from S3, falling back to local storage', s3Error);
      // Continue with local data if S3 fails
    }

    // If no S3 data or S3 error, try to load from IndexedDB
    try {
      const localData = await getMindMap(defaultId);

      if (localData) {
        logInfo('Using data from IndexedDB');
        return localData.data;
      }
    } catch (dbError) {
      logError('Failed to load data from IndexedDB', dbError);
      // Continue with empty mind map if IndexedDB fails
    }

    // If no data exists anywhere, create a new empty mind map
    logInfo('Creating new empty mind map');
    const emptyMindMap: MindMapData = {
      nodes: [],
      links: []
    };

    // Save the empty mind map to IndexedDB
    try {
      await saveMindMap({
        id: defaultId,
        data: emptyMindMap,
        lastModified: new Date().toISOString(),
        synced: false
      });
    } catch (dbError) {
      logError('Failed to save empty mind map to IndexedDB', dbError);
      // Continue with empty mind map even if saving fails
    }

    return emptyMindMap;
  } catch (error) {
    const errorMessage = 'Error initializing mind map data';
    logError(errorMessage, error);

    // Show error notification
    if (window.ErrorNotificationContext?.showError) {
      window.ErrorNotificationContext.showError(
        'Failed to initialize mind map data. Using empty map.'
      );
    }

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
    logInfo('Syncing mind map data...');

    // Check if online
    if (!navigator.onLine) {
      logWarn('Cannot sync while offline');
      return false;
    }

    // Get all unsynced mind maps
    try {
      const unsyncedMindMaps = await getUnsyncedMindMaps();

      if (unsyncedMindMaps.length === 0) {
        logInfo('No unsynced mind maps to sync');
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
            logInfo('S3 has newer data, updating local data');
            // S3 has newer data, update local data
            try {
              await saveMindMap({
                ...mindMap,
                data: s3Data,
                lastModified: new Date().toISOString(),
                synced: true
              });

              shouldSync = false;
            } catch (dbError) {
              logError('Failed to update local data with S3 data', dbError);
              throw new StorageError('Failed to update local data with S3 data', dbError as Error);
            }
          }
        }

        if (shouldSync) {
          logInfo('Uploading local data to S3');
          // Upload local data to S3
          const success = await saveMindMapToS3({
            ...mindMap.data,
            lastModified: new Date().toISOString()
          });

          if (success) {
            // Mark as synced in IndexedDB
            try {
              await saveMindMap({
                ...mindMap,
                synced: true
              });
            } catch (dbError) {
              logError('Failed to mark mind map as synced', dbError);
              throw new StorageError('Failed to mark mind map as synced', dbError as Error);
            }
          } else {
            const errorMessage = `Failed to sync mind map to S3: ${mindMap.id}`;
            logError(errorMessage);
            throw new SyncError(errorMessage);
          }
        }
      }

      logInfo('Mind map data synced successfully');
      return true;
    } catch (dbError) {
      logError('Error accessing IndexedDB during sync', dbError);
      throw new StorageError('Error accessing IndexedDB during sync', dbError as Error);
    }
  } catch (error) {
    const errorMessage = 'Error syncing mind map data';
    logError(errorMessage, error);

    // Show error notification
    if (window.ErrorNotificationContext?.showError) {
      window.ErrorNotificationContext.showError(
        'Failed to sync your changes. Will try again later.'
      );
    }

    return false;
  }
};

// Save mind map data locally and mark for sync
export const saveMindMapLocally = async (
  mindMapData: MindMapData,
  id: string = 'default'
): Promise<boolean> => {
  try {
    logInfo('Saving mind map data locally...');

    // Save to IndexedDB
    try {
      const success = await saveMindMap({
        id,
        data: mindMapData,
        lastModified: new Date().toISOString(),
        synced: false
      });

      if (!success) {
        throw new StorageError('Failed to save mind map to IndexedDB');
      }

      // Try to sync immediately if online
      if (navigator.onLine) {
        syncMindMapData().catch(error => {
          logError('Background sync failed:', error);
        });
      } else if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
        try {
          // Register for background sync when online
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-mindmap');
          logInfo('Background sync registered');
        } catch (swError) {
          logError('Failed to register background sync', swError);
          // Continue even if background sync registration fails
        }
      } else {
        logInfo('Offline mode: changes will be synced when online');
      }

      return true;
    } catch (dbError) {
      logError('Error saving to IndexedDB:', dbError);
      throw new StorageError('Failed to save mind map to IndexedDB', dbError as Error);
    }
  } catch (error) {
    const errorMessage = 'Error saving mind map locally';
    logError(errorMessage, error);

    // Show error notification
    if (window.ErrorNotificationContext?.showError) {
      window.ErrorNotificationContext.showError(
        'Failed to save your changes. Please try again.'
      );
    }

    return false;
  }
};
