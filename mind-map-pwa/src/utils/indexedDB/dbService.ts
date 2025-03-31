// src/utils/indexedDB/dbService.ts
import { DB_CONFIG } from './config';
import { logInfo, logError } from '../logger';

// Re-export MindMapRecord for other modules to use
export type { MindMapRecord } from './config';
import { StorageError } from '../errorHandler';

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onerror = (event) => {
      const error = (event.target as IDBRequest).error || new Error('Unknown IndexedDB error');
      logError('Error opening IndexedDB:', error);
      reject(new StorageError('Failed to open IndexedDB', error));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      logInfo('IndexedDB connection opened successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores and indexes
      const { stores } = DB_CONFIG;

      if (!db.objectStoreNames.contains(stores.mindMaps.name)) {
        logInfo('Creating mind maps object store');
        const mindMapsStore = db.createObjectStore(stores.mindMaps.name, { keyPath: stores.mindMaps.keyPath });

        // Create indexes
        stores.mindMaps.indexes.forEach(index => {
          logInfo(`Creating index: ${index.name}`);
          mindMapsStore.createIndex(index.name, index.keyPath);
        });
      }
    };
  });
};

// Save a mind map to IndexedDB
export const saveMindMap = async (mindMap: MindMapRecord): Promise<boolean> => {
  try {
    logInfo('Saving mind map to IndexedDB:', { id: mindMap.id });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);

      const request = store.put(mindMap);

      request.onsuccess = () => {
        logInfo('Mind map saved to IndexedDB:', { id: mindMap.id });
        resolve(true);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error saving mind map to IndexedDB:', error);
        reject(new StorageError(`Failed to save mind map with ID ${mindMap.id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB:', error);
    throw new StorageError('Failed to access IndexedDB for saving mind map', error as Error);
  }
};

// Get a mind map from IndexedDB by ID
export const getMindMap = async (id: string): Promise<MindMapRecord | null> => {
  try {
    logInfo('Getting mind map from IndexedDB:', { id });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);

      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as MindMapRecord;
        if (result) {
          logInfo('Mind map found in IndexedDB:', { id });
        } else {
          logInfo('Mind map not found in IndexedDB:', { id });
        }
        resolve(result || null);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting mind map from IndexedDB:', error);
        reject(new StorageError(`Failed to get mind map with ID ${id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB:', error);
    throw new StorageError('Failed to access IndexedDB for getting mind map', error as Error);
  }
};

// Get all mind maps from IndexedDB
export const getAllMindMaps = async (): Promise<MindMapRecord[]> => {
  try {
    logInfo('Getting all mind maps from IndexedDB');
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);

      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as MindMapRecord[];
        logInfo(`Found ${results.length} mind maps in IndexedDB`);
        resolve(results || []);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting all mind maps from IndexedDB:', error);
        reject(new StorageError('Failed to get all mind maps', error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB:', error);
    throw new StorageError('Failed to access IndexedDB for getting all mind maps', error as Error);
  }
};

// Get all unsynced mind maps
export const getUnsyncedMindMaps = async (): Promise<MindMapRecord[]> => {
  try {
    logInfo('Getting unsynced mind maps from IndexedDB');
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);
      const index = store.index('synced');

      const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => {
        const results = request.result as MindMapRecord[];
        logInfo(`Found ${results.length} unsynced mind maps in IndexedDB`);
        resolve(results || []);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting unsynced mind maps from IndexedDB:', error);
        reject(new StorageError('Failed to get unsynced mind maps', error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB:', error);
    throw new StorageError('Failed to access IndexedDB for getting unsynced mind maps', error as Error);
  }
};

// Delete a mind map from IndexedDB
export const deleteMindMap = async (id: string): Promise<boolean> => {
  try {
    logInfo('Deleting mind map from IndexedDB:', { id });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);

      const request = store.delete(id);

      request.onsuccess = () => {
        logInfo('Mind map deleted from IndexedDB:', { id });
        resolve(true);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error deleting mind map from IndexedDB:', error);
        reject(new StorageError(`Failed to delete mind map with ID ${id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB:', error);
    throw new StorageError('Failed to access IndexedDB for deleting mind map', error as Error);
  }
};
