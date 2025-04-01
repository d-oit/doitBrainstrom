// src/services/enhancedS3SyncService.ts
import { logInfo, logError, logWarn } from '../utils/logger';
import { StorageError } from '../utils/errorHandler';
import { MindMapData } from '../utils/MindMapDataModel';
import { initDB, saveMindMap, getMindMap } from '../utils/indexedDB/dbService';
import { MindMapRecord } from '../utils/indexedDB/types';
import { 
  enqueueOperation, 
  getPendingOperations, 
  updateOperationStatus,
  cleanupCompletedOperations,
  getOperationStats,
  OperationType,
  OperationPriority,
  OperationStatus
} from '../utils/offline-queue';
import {
  createVersionVector,
  incrementVersion,
  mergeVersionVectors,
  compareVersionVectors,
  hasConflict,
  VersionVector
} from '../utils/version-vector';
import { calculateBackoffDelay } from '../utils/offline-queue';

// Import the polyfill first to ensure global is defined
import '../utils/globalPolyfill';

// Define specific S3 error types
export enum S3ErrorType {
  ACCESS_DENIED = 'ACCESS_DENIED',
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFLICT_DETECTED = 'CONFLICT_DETECTED'
}

// Define interfaces for return types
export interface MindMapInitResult {
  data: MindMapData;
  source: 's3' | 'indexeddb' | 'new';
  error: S3ErrorType | null;
}

export interface SaveResult {
  success: boolean;
  error?: S3ErrorType;
  details?: string;
  operationId?: string;
}

export interface SyncResult {
  success: boolean;
  error?: S3ErrorType;
  details?: string;
  conflicts?: boolean;
  pendingOperations?: number;
}

export interface SyncStatus {
  lastSyncTime: string | null;
  syncInProgress: boolean;
  pendingOperations: number;
  lastError: {
    type: S3ErrorType;
    details: string;
  } | null;
  isS3Available: boolean;
  isS3Configured: boolean;
  isBackgroundSyncEnabled: boolean;
  nextSyncAttempt: string | null;
}

// Define variables outside the conditional block
let s3: any = null;
let BUCKET_NAME = '';
let MIND_MAP_KEY = 'mind-map-data.json';
let isS3Initialized = false;
let isS3Available = false;
let lastS3Error: { type: S3ErrorType; details: string } | undefined;
let syncInProgress = false;
let lastSyncTime: string | null = null;
let nextSyncAttempt: string | null = null;
let isBackgroundSyncEnabled = false;
let backgroundSyncIntervalId: number | null = null;

// Get environment variables for retry configuration
const MAX_RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_MAX_RETRY_ATTEMPTS || '5', 10);
const BASE_RETRY_DELAY = parseInt(import.meta.env.VITE_BASE_RETRY_DELAY || '1000', 10);
const MAX_RETRY_DELAY = parseInt(import.meta.env.VITE_MAX_RETRY_DELAY || '60000', 10);
const BACKGROUND_SYNC_INTERVAL = parseInt(import.meta.env.VITE_BACKGROUND_SYNC_INTERVAL || '300000', 10); // 5 minutes default

// Check if S3 is configured
const isS3Configured = () => {
  return !!(import.meta.env.VITE_S3_ENDPOINT &&
    import.meta.env.VITE_S3_ACCESS_KEY_ID &&
    import.meta.env.VITE_S3_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_S3_BUCKET_NAME);
};

// Initialize S3 client
export const initializeS3 = async (): Promise<{ success: boolean; error?: S3ErrorType; details?: string }> => {
  // If S3 is not configured, return early
  if (!isS3Configured()) {
    logWarn('S3 is not configured');
    isS3Initialized = false;
    isS3Available = false;
    lastS3Error = {
      type: S3ErrorType.NOT_CONFIGURED,
      details: 'S3 environment variables are not configured'
    };
    return {
      success: false,
      error: S3ErrorType.NOT_CONFIGURED,
      details: 'S3 environment variables are not configured'
    };
  }

  try {
    // Get environment variables
    const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT;
    const S3_ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID;
    const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY;
    BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
    MIND_MAP_KEY = import.meta.env.VITE_S3_MIND_MAP_KEY || 'mind-map-data.json';

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
      isS3Available = true;
      lastS3Error = undefined;
      logInfo('S3 client initialized and bucket access confirmed');
      return { success: true };
    } catch (bucketError) {
      logError('S3 bucket access denied:', bucketError);
      isS3Initialized = true; // Client is initialized but bucket access failed
      isS3Available = false;

      // Determine the specific error type
      if ((bucketError as any).code === 'AccessDenied') {
        lastS3Error = {
          type: S3ErrorType.ACCESS_DENIED,
          details: (bucketError as Error).message
        };
      } else {
        lastS3Error = {
          type: S3ErrorType.NETWORK_ERROR,
          details: (bucketError as Error).message
        };
      }

      return {
        success: false,
        error: lastS3Error.type,
        details: lastS3Error.details
      };
    }
  } catch (error) {
    logError('Failed to initialize AWS SDK:', error);
    isS3Initialized = false;
    isS3Available = false;
    lastS3Error = {
      type: S3ErrorType.INITIALIZATION_FAILED,
      details: (error as Error).message
    };
    return {
      success: false,
      error: S3ErrorType.INITIALIZATION_FAILED,
      details: (error as Error).message
    };
  }
};

// Check if S3 is available
export const checkS3Availability = async (forceCheck: boolean = false): Promise<{ available: boolean; error?: S3ErrorType; details?: string }> => {
  // If S3 is not configured, return early
  if (!isS3Configured()) {
    return {
      available: false,
      error: S3ErrorType.NOT_CONFIGURED,
      details: 'S3 environment variables are not configured'
    };
  }

  // If S3 is not initialized, initialize it first
  if (!isS3Initialized) {
    const initResult = await initializeS3();
    if (!initResult.success) {
      return {
        available: false,
        error: initResult.error,
        details: initResult.details
      };
    }
  }

  // If we've already verified S3 is available and we're not forcing a check,
  // return the cached result
  if (!forceCheck && isS3Available) {
    return { available: true };
  }

  try {
    // Verify bucket access
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    isS3Available = true;
    lastS3Error = undefined;
    return { available: true };
  } catch (error) {
    logError('S3 bucket access error:', error);
    isS3Available = false;

    if ((error as any).code === 'AccessDenied') {
      lastS3Error = {
        type: S3ErrorType.ACCESS_DENIED,
        details: (error as Error).message
      };
    } else {
      lastS3Error = {
        type: S3ErrorType.NETWORK_ERROR,
        details: (error as Error).message
      };
    }

    return {
      available: false,
      error: lastS3Error.type,
      details: lastS3Error.details
    };
  }
};

// Get the current sync status
export const getSyncStatus = async (): Promise<SyncStatus> => {
  // Get operation stats
  let pendingOperations = 0;
  try {
    const stats = await getOperationStats();
    pendingOperations = stats.pending + stats.inProgress;
  } catch (error) {
    logError('Error getting operation stats:', error);
  }

  return {
    lastSyncTime,
    syncInProgress,
    pendingOperations,
    lastError: lastS3Error || null,
    isS3Available,
    isS3Configured: isS3Configured(),
    isBackgroundSyncEnabled,
    nextSyncAttempt
  };
};

// Save mind map data to S3
export const saveToS3 = async (mindMapData: MindMapData, mindMapId: string = 'default'): Promise<SaveResult> => {
  // Check if S3 is available
  const availabilityCheck = await checkS3Availability();
  if (!availabilityCheck.available) {
    // If S3 is not available, queue the operation for later
    try {
      // Add version vector if not present
      if (!mindMapData.versionVector) {
        mindMapData.versionVector = createVersionVector();
      } else {
        mindMapData.versionVector = incrementVersion(mindMapData.versionVector);
      }

      // Save to IndexedDB first
      await saveMindMap({
        id: mindMapId,
        data: mindMapData,
        lastModified: new Date().toISOString(),
        synced: false
      });

      // Queue the operation
      const operationId = await enqueueOperation(
        OperationType.UPDATE,
        mindMapId,
        'mindMap',
        mindMapData,
        OperationPriority.HIGH,
        MAX_RETRY_ATTEMPTS
      );

      logInfo('Mind map save operation queued for later sync:', { operationId });
      return {
        success: true,
        operationId
      };
    } catch (error) {
      const errorMessage = 'Error queueing mind map save operation';
      logError(errorMessage, error);
      return {
        success: false,
        error: S3ErrorType.NETWORK_ERROR,
        details: (error as Error).message
      };
    }
  }

  try {
    logInfo('Saving mind map data to S3...');

    // Get the current version from S3 first to check for conflicts
    try {
      const currentS3Data = await getFromS3();
      
      // If we have data from S3, check for conflicts
      if (currentS3Data && currentS3Data.data && currentS3Data.data.versionVector) {
        const remoteVector = currentS3Data.data.versionVector as VersionVector;
        const localVector = mindMapData.versionVector as VersionVector || createVersionVector();
        
        // Check if there's a conflict
        if (hasConflict(localVector, remoteVector)) {
          logWarn('Conflict detected between local and remote data');
          
          // Save to IndexedDB with conflict flag
          await saveMindMap({
            id: mindMapId,
            data: {
              ...mindMapData,
              versionVector: localVector
            },
            lastModified: new Date().toISOString(),
            synced: false,
            hasConflict: true,
            remoteData: currentS3Data.data
          });
          
          return {
            success: false,
            error: S3ErrorType.CONFLICT_DETECTED,
            details: 'Conflict detected between local and remote data'
          };
        }
        
        // Merge version vectors
        mindMapData.versionVector = mergeVersionVectors(localVector, remoteVector);
      } else {
        // No data from S3 or no version vector, increment local version
        mindMapData.versionVector = incrementVersion(mindMapData.versionVector || createVersionVector());
      }
    } catch (error) {
      logWarn('Error checking for conflicts, proceeding with save:', error);
      // If we can't get the current data, just increment the local version
      mindMapData.versionVector = incrementVersion(mindMapData.versionVector || createVersionVector());
    }

    // Update lastModified timestamp
    mindMapData.lastModified = new Date().toISOString();

    const params = {
      Bucket: BUCKET_NAME,
      Key: MIND_MAP_KEY,
      Body: JSON.stringify(mindMapData),
      ContentType: 'application/json'
    };

    await s3.putObject(params).promise();
    logInfo('Mind map data saved to S3 successfully');
    
    // Update IndexedDB with synced flag
    await saveMindMap({
      id: mindMapId,
      data: mindMapData,
      lastModified: new Date().toISOString(),
      synced: true
    });
    
    // Update last sync time
    lastSyncTime = new Date().toISOString();
    
    return {
      success: true
    };
  } catch (error) {
    const errorMessage = 'Error saving mind map data to S3';
    logError(errorMessage, error);
    
    // Try to save to IndexedDB with unsynced flag
    try {
      await saveMindMap({
        id: mindMapId,
        data: mindMapData,
        lastModified: new Date().toISOString(),
        synced: false
      });
      
      // Queue the operation for later retry
      const operationId = await enqueueOperation(
        OperationType.UPDATE,
        mindMapId,
        'mindMap',
        mindMapData,
        OperationPriority.HIGH,
        MAX_RETRY_ATTEMPTS
      );
      
      logInfo('Mind map save operation queued for later sync:', { operationId });
    } catch (dbError) {
      logError('Error saving to IndexedDB:', dbError);
    }
    
    return {
      success: false,
      error: (error as any).code === 'AccessDenied' ? S3ErrorType.ACCESS_DENIED : S3ErrorType.NETWORK_ERROR,
      details: (error as Error).message
    };
  }
};

// Get mind map data from S3
export const getFromS3 = async (): Promise<{ data: MindMapData | null; error?: S3ErrorType; details?: string }> => {
  // Check if S3 is available
  const availabilityCheck = await checkS3Availability();
  if (!availabilityCheck.available) {
    return {
      data: null,
      error: availabilityCheck.error,
      details: availabilityCheck.details
    };
  }

  try {
    logInfo('Getting mind map data from S3...');

    const params = {
      Bucket: BUCKET_NAME,
      Key: MIND_MAP_KEY
    };

    try {
      const response = await s3.getObject(params).promise();
      if (response.Body) {
        const s3Data = JSON.parse(response.Body.toString()) as MindMapData;
        logInfo('Mind map data retrieved from S3 successfully');
        return {
          data: s3Data
        };
      } else {
        logWarn('No mind map data found in S3');
        return {
          data: null
        };
      }
    } catch (error) {
      // Check if the error is because the object doesn't exist
      if ((error as any).code === 'NoSuchKey') {
        logInfo('No mind map data found in S3 (NoSuchKey)');
        return {
          data: null
        };
      }
      
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    const errorMessage = 'Error getting mind map data from S3';
    logError(errorMessage, error);
    return {
      data: null,
      error: (error as any).code === 'AccessDenied' ? S3ErrorType.ACCESS_DENIED : S3ErrorType.NETWORK_ERROR,
      details: (error as Error).message
    };
  }
};

// Initialize mind map data (from S3 or IndexedDB)
export const initializeMindMapData = async (defaultId: string = 'default'): Promise<MindMapInitResult> => {
  try {
    logInfo('Initializing mind map data...');

    // Try to load from S3 only if explicitly configured
    // We don't want to trigger network requests on app load
    // unless S3 has been previously successfully initialized
    if (isS3Configured()) {
      // Initialize S3 if not already initialized
      if (!isS3Initialized) {
        await initializeS3();
      }
      
      // Only try to get from S3 if it's available
      if (isS3Available) {
        const s3Result = await getFromS3();
        
        if (s3Result.data) {
          // Save to IndexedDB for offline access
          try {
            await saveMindMap({
              id: defaultId,
              data: s3Result.data,
              lastModified: new Date().toISOString(),
              synced: true
            });
          } catch (dbError) {
            logError('Failed to save S3 data to IndexedDB', dbError);
          }
          
          return {
            data: s3Result.data,
            source: 's3',
            error: null
          };
        }
      }
    }

    // If we couldn't get data from S3, try IndexedDB
    const dbMindMap = await getMindMap(defaultId);
    
    if (dbMindMap) {
      logInfo('Using data from IndexedDB');
      return {
        data: dbMindMap.data,
        source: 'indexeddb',
        error: null
      };
    }

    // If no data found, create a new empty mind map
    logInfo('Creating new empty mind map');
    const newMindMap: MindMapData = {
      nodes: [],
      links: [],
      lastModified: new Date().toISOString(),
      synced: false,
      versionVector: createVersionVector()
    };
    
    // Save the new mind map to IndexedDB
    try {
      await saveMindMap({
        id: defaultId,
        data: newMindMap,
        lastModified: new Date().toISOString(),
        synced: false
      });
    } catch (dbError) {
      logError('Failed to save new mind map to IndexedDB', dbError);
    }
    
    return {
      data: newMindMap,
      source: 'new',
      error: null
    };
  } catch (error) {
    logError('Error initializing mind map data:', error);
    
    // Return a new empty mind map as a fallback
    const fallbackMindMap: MindMapData = {
      nodes: [],
      links: [],
      lastModified: new Date().toISOString(),
      synced: false,
      versionVector: createVersionVector()
    };
    
    return {
      data: fallbackMindMap,
      source: 'new',
      error: S3ErrorType.INITIALIZATION_FAILED
    };
  }
};

// Process pending operations
export const processPendingOperations = async (limit: number = 10): Promise<SyncResult> => {
  // Check if sync is already in progress
  if (syncInProgress) {
    return {
      success: false,
      details: 'Sync already in progress'
    };
  }
  
  syncInProgress = true;
  
  try {
    // Check if S3 is available
    const availabilityCheck = await checkS3Availability();
    if (!availabilityCheck.available) {
      syncInProgress = false;
      return {
        success: false,
        error: availabilityCheck.error,
        details: availabilityCheck.details
      };
    }
    
    // Get pending operations
    const operations = await getPendingOperations(limit);
    
    if (operations.length === 0) {
      logInfo('No pending operations to process');
      syncInProgress = false;
      return {
        success: true,
        pendingOperations: 0
      };
    }
    
    logInfo(`Processing ${operations.length} pending operations`);
    
    let successCount = 0;
    let failureCount = 0;
    let conflictCount = 0;
    
    // Process each operation
    for (const operation of operations) {
      try {
        // Mark operation as in progress
        await updateOperationStatus(operation.id, OperationStatus.IN_PROGRESS);
        
        // Process based on operation type
        if (operation.type === OperationType.UPDATE) {
          // For mind map updates, save to S3
          const saveResult = await saveToS3(operation.data, operation.entityId);
          
          if (saveResult.success) {
            await updateOperationStatus(operation.id, OperationStatus.COMPLETED);
            successCount++;
          } else if (saveResult.error === S3ErrorType.CONFLICT_DETECTED) {
            await updateOperationStatus(operation.id, OperationStatus.CONFLICT, saveResult.details);
            conflictCount++;
          } else {
            await updateOperationStatus(operation.id, OperationStatus.FAILED, saveResult.details);
            failureCount++;
          }
        } else {
          // Other operation types not yet implemented
          await updateOperationStatus(operation.id, OperationStatus.FAILED, 'Operation type not supported');
          failureCount++;
        }
      } catch (error) {
        logError(`Error processing operation ${operation.id}:`, error);
        await updateOperationStatus(operation.id, OperationStatus.FAILED, (error as Error).message);
        failureCount++;
      }
    }
    
    // Update last sync time
    lastSyncTime = new Date().toISOString();
    
    // Get updated stats
    const stats = await getOperationStats();
    
    // Clean up old completed operations
    await cleanupCompletedOperations(7); // Clean up operations older than 7 days
    
    syncInProgress = false;
    
    return {
      success: true,
      details: `Processed ${operations.length} operations: ${successCount} succeeded, ${failureCount} failed, ${conflictCount} conflicts`,
      conflicts: conflictCount > 0,
      pendingOperations: stats.pending + stats.inProgress
    };
  } catch (error) {
    logError('Error processing pending operations:', error);
    syncInProgress = false;
    return {
      success: false,
      error: S3ErrorType.NETWORK_ERROR,
      details: (error as Error).message
    };
  }
};

// Sync mind map data
export const syncMindMapData = async (mindMapId: string = 'default', force: boolean = false): Promise<SyncResult> => {
  // If sync is already in progress and not forced, return early
  if (syncInProgress && !force) {
    return {
      success: false,
      details: 'Sync already in progress'
    };
  }
  
  syncInProgress = true;
  
  try {
    // Check if S3 is available
    const availabilityCheck = await checkS3Availability(true); // Force check
    if (!availabilityCheck.available) {
      syncInProgress = false;
      
      // Schedule next sync attempt with exponential backoff
      const retryDelay = calculateBackoffDelay(
        lastS3Error?.retryCount || 0,
        BASE_RETRY_DELAY,
        MAX_RETRY_DELAY
      );
      
      const nextAttemptTime = new Date(Date.now() + retryDelay);
      nextSyncAttempt = nextAttemptTime.toISOString();
      
      // Increment retry count
      if (lastS3Error) {
        lastS3Error.retryCount = (lastS3Error.retryCount || 0) + 1;
      }
      
      return {
        success: false,
        error: availabilityCheck.error,
        details: availabilityCheck.details
      };
    }
    
    // Reset retry count on successful connection
    if (lastS3Error) {
      lastS3Error.retryCount = 0;
    }
    
    // Get local mind map data
    const localMindMap = await getMindMap(mindMapId);
    
    if (!localMindMap) {
      syncInProgress = false;
      return {
        success: false,
        details: `Mind map with ID ${mindMapId} not found in IndexedDB`
      };
    }
    
    // Get remote mind map data
    const remoteResult = await getFromS3();
    
    if (!remoteResult.data) {
      // No remote data, upload local data
      logInfo('No remote data found, uploading local data');
      const saveResult = await saveToS3(localMindMap.data, mindMapId);
      
      syncInProgress = false;
      lastSyncTime = new Date().toISOString();
      
      return {
        success: saveResult.success,
        error: saveResult.error,
        details: saveResult.details
      };
    }
    
    // Check for conflicts
    const localVector = localMindMap.data.versionVector as VersionVector || createVersionVector();
    const remoteVector = remoteResult.data.versionVector as VersionVector || createVersionVector();
    
    const comparison = compareVersionVectors(localVector, remoteVector);
    
    if (comparison === 'conflict') {
      logWarn('Conflict detected between local and remote data');
      
      // Save conflict information to IndexedDB
      await saveMindMap({
        ...localMindMap,
        hasConflict: true,
        remoteData: remoteResult.data
      });
      
      syncInProgress = false;
      lastSyncTime = new Date().toISOString();
      
      return {
        success: false,
        error: S3ErrorType.CONFLICT_DETECTED,
        details: 'Conflict detected between local and remote data',
        conflicts: true
      };
    } else if (comparison === 'ancestor') {
      // Local is older than remote, update local
      logInfo('Local data is older than remote, updating local');
      
      await saveMindMap({
        id: mindMapId,
        data: remoteResult.data,
        lastModified: new Date().toISOString(),
        synced: true
      });
      
      syncInProgress = false;
      lastSyncTime = new Date().toISOString();
      
      return {
        success: true,
        details: 'Updated local data from remote'
      };
    } else if (comparison === 'descendant') {
      // Local is newer than remote, update remote
      logInfo('Local data is newer than remote, updating remote');
      
      const saveResult = await saveToS3(localMindMap.data, mindMapId);
      
      syncInProgress = false;
      lastSyncTime = new Date().toISOString();
      
      return {
        success: saveResult.success,
        error: saveResult.error,
        details: saveResult.details
      };
    } else {
      // Data is the same, no action needed
      logInfo('Local and remote data are in sync');
      
      syncInProgress = false;
      lastSyncTime = new Date().toISOString();
      
      return {
        success: true,
        details: 'Local and remote data are in sync'
      };
    }
  } catch (error) {
    logError('Error syncing mind map data:', error);
    syncInProgress = false;
    return {
      success: false,
      error: S3ErrorType.NETWORK_ERROR,
      details: (error as Error).message
    };
  }
};

// Enable background sync
export const enableBackgroundSync = (intervalMs: number = BACKGROUND_SYNC_INTERVAL): void => {
  // Disable any existing background sync first
  disableBackgroundSync();
  
  // Set up new background sync
  backgroundSyncIntervalId = window.setInterval(async () => {
    try {
      // Only attempt sync if not already in progress
      if (!syncInProgress) {
        logInfo('Running background sync');
        await processPendingOperations();
      }
    } catch (error) {
      logError('Error in background sync:', error);
    }
  }, intervalMs);
  
  isBackgroundSyncEnabled = true;
  logInfo(`Background sync enabled with interval of ${intervalMs}ms`);
};

// Disable background sync
export const disableBackgroundSync = (): void => {
  if (backgroundSyncIntervalId !== null) {
    window.clearInterval(backgroundSyncIntervalId);
    backgroundSyncIntervalId = null;
    isBackgroundSyncEnabled = false;
    logInfo('Background sync disabled');
  }
};

// Register service worker for background sync if supported
export const registerBackgroundSync = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Register for background sync
      await registration.sync.register('mindmap-sync');
      
      logInfo('Background sync registered with service worker');
      return true;
    } catch (error) {
      logError('Error registering background sync:', error);
      return false;
    }
  } else {
    logWarn('Background sync not supported in this browser');
    return false;
  }
};

// Initialize the module
(async () => {
  // Initialize offline operations store
  try {
    const { initOfflineOperationsStore } = await import('../utils/offline-queue');
    await initOfflineOperationsStore();
  } catch (error) {
    logError('Error initializing offline operations store:', error);
  }
  
  // Initialize S3 if configured
  if (isS3Configured()) {
    initializeS3().catch(error => {
      logError('Error during automatic S3 initialization:', error);
    });
  }
})();
