// src/utils/offline-queue.ts
import { logInfo, logError, logWarn } from './logger';
import { StorageError } from './errorHandler';
import { initDB } from './indexedDB/dbService';
import { DB_CONFIG } from './indexedDB/config';

// Operation types
export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SYNC = 'SYNC'
}

// Operation priorities
export enum OperationPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

// Operation status
export enum OperationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CONFLICT = 'CONFLICT'
}

// Operation interface
export interface OfflineOperation {
  id: string;
  type: OperationType;
  entityId: string;
  entityType: string;
  data: any;
  timestamp: string;
  priority: OperationPriority;
  status: OperationStatus;
  retryCount: number;
  maxRetries: number;
  lastAttempt: string | null;
  error: string | null;
  version: number; // For conflict detection
}

// Initialize the offline operations store in IndexedDB
export const initOfflineOperationsStore = async (): Promise<void> => {
  try {
    logInfo('Initializing offline operations store');
    const db = await initDB();

    // Check if the store already exists
    if (!db.objectStoreNames.contains('offlineOperations')) {
      // Close the current connection
      db.close();

      // Log a warning instead of trying to create the store with a version increment
      // This avoids conflicts with the main database initialization
      logWarn('Offline operations store does not exist. It should be created during database initialization.');
      return;

      // NOTE: The following code is commented out to prevent version conflicts
      /*
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version + 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create the offline operations store
        const store = db.createObjectStore('offlineOperations', { keyPath: 'id' });

        // Create indexes
        store.createIndex('status', 'status');
        store.createIndex('priority', 'priority');
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('entityId', 'entityId');
        store.createIndex('entityType', 'entityType');
        store.createIndex('type', 'type');

        logInfo('Offline operations store created');
      };

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const db = request.result;
          db.close();
          resolve();
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error || new Error('Unknown IndexedDB error');
          logError('Error creating offline operations store:', error);
          reject(new StorageError('Failed to create offline operations store', error));
        };
      });
      */
    }
  } catch (error) {
    logError('Error initializing offline operations store:', error);
    throw new StorageError('Failed to initialize offline operations store', error as Error);
  }
};

// Generate a unique ID for operations
const generateOperationId = (): string => {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Add an operation to the queue
export const enqueueOperation = async (
  type: OperationType,
  entityId: string,
  entityType: string,
  data: any,
  priority: OperationPriority = OperationPriority.MEDIUM,
  maxRetries: number = 5,
  version: number = 1
): Promise<string> => {
  try {
    // Ensure the store is initialized
    await initOfflineOperationsStore();

    const db = await initDB();
    const transaction = db.transaction(['offlineOperations'], 'readwrite');
    const store = transaction.objectStore('offlineOperations');

    const operationId = generateOperationId();
    const operation: OfflineOperation = {
      id: operationId,
      type,
      entityId,
      entityType,
      data,
      timestamp: new Date().toISOString(),
      priority,
      status: OperationStatus.PENDING,
      retryCount: 0,
      maxRetries,
      lastAttempt: null,
      error: null,
      version
    };

    return new Promise((resolve, reject) => {
      const request = store.add(operation);

      request.onsuccess = () => {
        logInfo('Operation added to queue:', { id: operationId, type, entityId });
        resolve(operationId);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error adding operation to queue:', error);
        reject(new StorageError(`Failed to add operation to queue`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for operation queue:', error);
    throw new StorageError('Failed to access IndexedDB for operation queue', error as Error);
  }
};

// Get pending operations from the queue, ordered by priority and timestamp
export const getPendingOperations = async (
  limit: number = 10,
  entityType?: string
): Promise<OfflineOperation[]> => {
  try {
    await initOfflineOperationsStore();

    const db = await initDB();
    const transaction = db.transaction(['offlineOperations'], 'readonly');
    const store = transaction.objectStore('offlineOperations');

    return new Promise((resolve, reject) => {
      // Get all operations and filter/sort in memory
      // This is simpler than using complex IDBKeyRange queries
      const request = store.getAll();

      request.onsuccess = () => {
        const operations = request.result as OfflineOperation[];

        // Filter by status and optionally by entityType
        let filteredOperations = operations.filter(op =>
          op.status === OperationStatus.PENDING ||
          (op.status === OperationStatus.FAILED && op.retryCount < op.maxRetries)
        );

        if (entityType) {
          filteredOperations = filteredOperations.filter(op => op.entityType === entityType);
        }

        // Sort by priority (ascending) and then by timestamp (ascending)
        filteredOperations.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority; // Lower priority number = higher priority
          }
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        // Limit the number of operations returned
        const limitedOperations = filteredOperations.slice(0, limit);

        logInfo(`Retrieved ${limitedOperations.length} pending operations`);
        resolve(limitedOperations);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error retrieving pending operations:', error);
        reject(new StorageError('Failed to retrieve pending operations', error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for pending operations:', error);
    throw new StorageError('Failed to access IndexedDB for pending operations', error as Error);
  }
};

// Update an operation's status
export const updateOperationStatus = async (
  operationId: string,
  status: OperationStatus,
  error?: string
): Promise<boolean> => {
  try {
    await initOfflineOperationsStore();

    const db = await initDB();
    const transaction = db.transaction(['offlineOperations'], 'readwrite');
    const store = transaction.objectStore('offlineOperations');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(operationId);

      getRequest.onsuccess = () => {
        const operation = getRequest.result as OfflineOperation;

        if (!operation) {
          logWarn(`Operation not found: ${operationId}`);
          resolve(false);
          return;
        }

        // Update the operation
        operation.status = status;
        operation.lastAttempt = new Date().toISOString();

        if (status === OperationStatus.FAILED) {
          operation.retryCount += 1;
          operation.error = error || 'Unknown error';
        } else if (status === OperationStatus.COMPLETED) {
          operation.error = null;
        } else if (status === OperationStatus.CONFLICT) {
          operation.error = error || 'Conflict detected';
        }

        const putRequest = store.put(operation);

        putRequest.onsuccess = () => {
          logInfo(`Operation ${operationId} status updated to ${status}`);
          resolve(true);
        };

        putRequest.onerror = (event) => {
          const error = (event.target as IDBRequest).error || new Error('Unknown request error');
          logError(`Error updating operation ${operationId} status:`, error);
          reject(new StorageError(`Failed to update operation status`, error));
        };
      };

      getRequest.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError(`Error retrieving operation ${operationId}:`, error);
        reject(new StorageError(`Failed to retrieve operation`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError(`Error accessing IndexedDB for updating operation ${operationId}:`, error);
    throw new StorageError('Failed to access IndexedDB for updating operation', error as Error);
  }
};

// Delete completed operations older than a certain age
export const cleanupCompletedOperations = async (
  maxAgeInDays: number = 7
): Promise<number> => {
  try {
    await initOfflineOperationsStore();

    const db = await initDB();
    const transaction = db.transaction(['offlineOperations'], 'readwrite');
    const store = transaction.objectStore('offlineOperations');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const operations = request.result as OfflineOperation[];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

        let deletedCount = 0;

        // Find completed operations older than the cutoff date
        const oldOperations = operations.filter(op =>
          op.status === OperationStatus.COMPLETED &&
          new Date(op.timestamp) < cutoffDate
        );

        if (oldOperations.length === 0) {
          logInfo('No old completed operations to clean up');
          resolve(0);
          return;
        }

        // Delete each old operation
        oldOperations.forEach(op => {
          const deleteRequest = store.delete(op.id);

          deleteRequest.onsuccess = () => {
            deletedCount++;

            if (deletedCount === oldOperations.length) {
              logInfo(`Cleaned up ${deletedCount} old completed operations`);
              resolve(deletedCount);
            }
          };

          deleteRequest.onerror = (event) => {
            const error = (event.target as IDBRequest).error || new Error('Unknown request error');
            logError(`Error deleting operation ${op.id}:`, error);
            // Continue with other deletions
          };
        });
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error retrieving operations for cleanup:', error);
        reject(new StorageError('Failed to retrieve operations for cleanup', error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for cleanup:', error);
    throw new StorageError('Failed to access IndexedDB for cleanup', error as Error);
  }
};

// Get operation statistics
export const getOperationStats = async (): Promise<{
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  conflict: number;
  total: number;
}> => {
  try {
    await initOfflineOperationsStore();

    const db = await initDB();
    const transaction = db.transaction(['offlineOperations'], 'readonly');
    const store = transaction.objectStore('offlineOperations');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const operations = request.result as OfflineOperation[];

        const stats = {
          pending: operations.filter(op => op.status === OperationStatus.PENDING).length,
          inProgress: operations.filter(op => op.status === OperationStatus.IN_PROGRESS).length,
          completed: operations.filter(op => op.status === OperationStatus.COMPLETED).length,
          failed: operations.filter(op => op.status === OperationStatus.FAILED).length,
          conflict: operations.filter(op => op.status === OperationStatus.CONFLICT).length,
          total: operations.length
        };

        logInfo('Operation queue statistics:', stats);
        resolve(stats);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error retrieving operations for stats:', error);
        reject(new StorageError('Failed to retrieve operations for stats', error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for operation stats:', error);
    throw new StorageError('Failed to access IndexedDB for operation stats', error as Error);
  }
};

// Calculate exponential backoff delay for retries
export const calculateBackoffDelay = (
  retryCount: number,
  baseDelay: number = 1000,
  maxDelay: number = 60000
): number => {
  // Exponential backoff: baseDelay * 2^retryCount with jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);

  // Add jitter (±20%) to prevent thundering herd problem
  const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);

  // Apply jitter and cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelay);
};
