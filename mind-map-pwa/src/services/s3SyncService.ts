// src/services/s3SyncService.ts
// Import the polyfill first to ensure global is defined
import '../utils/globalPolyfill';

import { MindMapData } from '../utils/MindMapDataModel';
import {
  saveMindMap,
  getMindMap
} from '../utils/indexedDB/dbService';
import { logInfo, logError, logWarn } from '../utils/logger';
import { StorageError } from '../utils/errorHandler';

// Define variables outside the conditional block
let s3: any = null;
let BUCKET_NAME = '';
const MIND_MAP_KEY = 'mind-map-data.json';
let isS3Initialized = false;

// Define specific S3 error types
export enum S3ErrorType {
  ACCESS_DENIED = 'ACCESS_DENIED',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Define interfaces for return types
export interface MindMapInitResult {
  data: MindMapData;
  source: 's3' | 'indexeddb' | 'new';
  error: S3ErrorType | null;
}

export interface SaveResult {
  success: boolean;
  error: S3ErrorType | null;
}

// Check if S3 is configured
const isS3Configured = () => {
  return !!(import.meta.env.VITE_S3_ENDPOINT &&
    import.meta.env.VITE_S3_ACCESS_KEY_ID &&
    import.meta.env.VITE_S3_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_S3_BUCKET_NAME);
};

// Initialize S3 asynchronously
const initializeS3 = async () => {
  if (isS3Initialized) return true;
  if (!isS3Configured()) {
    logWarn('S3 is not configured');
    return false;
  }

  try {
    // Get environment variables
    const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT;
    const S3_ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID;
    const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY;
    BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;

    // Dynamically import AWS SDK
    const AWS = await import('aws-sdk');

    // Initialize S3 client
    s3 = new AWS.S3({
      endpoint: S3_ENDPOINT,
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
      region: 'us-east-1'
    });

    // Test the connection by checking bucket access
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      isS3Initialized = true;
      logInfo('S3 client initialized and bucket access confirmed');
      return true;
    } catch (bucketError) {
      logError('S3 bucket access denied:', bucketError);
      isS3Initialized = false;
      return false;
    }
  } catch (error) {
    logError('Failed to initialize S3:', error);
    isS3Initialized = false;
    return false;
  }
};

// Helper function to check if S3 is available and accessible
const checkS3Available = async () => {
  if (!isS3Initialized) {
    const initialized = await initializeS3();
    if (!initialized) {
      logWarn('S3 is not configured or initialization failed');
      return false;
    }
  }
  return isS3Initialized && s3 !== null;
};

// Save mind map data to S3
export const saveMindMapToS3 = async (mindMapData: MindMapData): Promise<SaveResult> => {
  const isAvailable = await checkS3Available();
  if (!isAvailable) {
    return {
      success: false,
      error: S3ErrorType.NOT_CONFIGURED
    };
  }

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
    return {
      success: true,
      error: null
    };
  } catch (error) {
    const errorMessage = 'Error saving mind map data to S3';
    logError(errorMessage, error);
    return {
      success: false,
      error: (error as any).code === 'AccessDenied' ? S3ErrorType.ACCESS_DENIED : S3ErrorType.NETWORK_ERROR
    };
  }
};

// Initialize mind map data (from S3 or IndexedDB)
export const initializeMindMapData = async (defaultId: string = 'default'): Promise<MindMapInitResult> => {
  try {
    logInfo('Initializing mind map data...');

    // Try to load from S3 first if available
    const isAvailable = await checkS3Available();
    if (isAvailable) {
      try {
        const params = {
          Bucket: BUCKET_NAME,
          Key: MIND_MAP_KEY
        };

        const response = await s3.getObject(params).promise();
        if (response.Body) {
          const s3Data = JSON.parse(response.Body.toString()) as MindMapData;
          logInfo('Using data from S3');

          try {
            await saveMindMap({
              id: defaultId,
              data: s3Data,
              lastModified: new Date().toISOString(),
              synced: true
            });
          } catch (dbError) {
            logError('Failed to save S3 data to IndexedDB', dbError);
          }

          return {
            data: s3Data,
            source: 's3',
            error: null
          };
        }
      } catch (s3Error) {
        if ((s3Error as any).code === 'AccessDenied') {
          return {
            data: { nodes: [], links: [] },
            source: 'new',
            error: S3ErrorType.ACCESS_DENIED
          };
        }
      }
    }

    // If no S3 data or S3 error, try to load from IndexedDB
    try {
      const localData = await getMindMap(defaultId);

      if (localData) {
        logInfo('Using data from IndexedDB');
        return {
          data: localData.data,
          source: 'indexeddb',
          error: null
        };
      }
    } catch (dbError) {
      logError('Failed to load data from IndexedDB', dbError);
    }

    // If no data exists anywhere, create a new empty mind map
    logInfo('Creating new empty mind map');
    const emptyMindMap: MindMapData = {
      nodes: [],
      links: []
    };

    try {
      await saveMindMap({
        id: defaultId,
        data: emptyMindMap,
        lastModified: new Date().toISOString(),
        synced: false
      });
    } catch (dbError) {
      logError('Failed to save empty mind map to IndexedDB', dbError);
    }

    return {
      data: emptyMindMap,
      source: 'new',
      error: null
    };
  } catch (error) {
    logError('Error initializing mind map data:', error);
    return {
      data: { nodes: [], links: [] },
      source: 'new',
      error: S3ErrorType.NETWORK_ERROR
    };
  }
};

// Save mind map data locally and mark for sync
export const saveMindMapLocally = async (
  mindMapData: MindMapData,
  id: string = 'default'
): Promise<SaveResult> => {
  try {
    logInfo('Saving mind map data locally...');

    // Save to IndexedDB
    try {
      await saveMindMap({
        id,
        data: mindMapData,
        lastModified: new Date().toISOString(),
        synced: false
      });

      // Check if S3 is available
      const isAvailable = await checkS3Available();

      // Try to sync immediately if online and S3 is available
      if (isAvailable && navigator.onLine) {
        try {
          const result = await saveMindMapToS3(mindMapData);
          if (result.success) {
            // Update synced status in IndexedDB
            await saveMindMap({
              id,
              data: mindMapData,
              lastModified: new Date().toISOString(),
              synced: true
            });
          }
          return result;
        } catch (syncError) {
          logError('Failed to sync with S3:', syncError);
          return {
            success: false,
            error: S3ErrorType.NETWORK_ERROR
          };
        }
      }

      return {
        success: true,
        error: null
      };
    } catch (dbError) {
      logError('Error saving to IndexedDB:', dbError);
      throw new StorageError('Failed to save mind map to IndexedDB', dbError as Error);
    }
  } catch (error) {
    logError('Error saving mind map locally:', error);
    return {
      success: false,
      error: S3ErrorType.NETWORK_ERROR
    };
  }
};
