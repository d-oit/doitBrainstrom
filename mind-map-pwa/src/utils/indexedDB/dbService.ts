// src/utils/indexedDB/dbService.ts
import { DB_CONFIG, MindMapRecord } from './config';

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores and indexes
      const { stores } = DB_CONFIG;
      
      if (!db.objectStoreNames.contains(stores.mindMaps.name)) {
        const mindMapsStore = db.createObjectStore(stores.mindMaps.name, { keyPath: stores.mindMaps.keyPath });
        
        // Create indexes
        stores.mindMaps.indexes.forEach(index => {
          mindMapsStore.createIndex(index.name, index.keyPath);
        });
      }
    };
  });
};

// Save a mind map to IndexedDB
export const saveMindMap = async (mindMap: MindMapRecord): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);
      
      const request = store.put(mindMap);
      
      request.onsuccess = () => {
        console.log('Mind map saved to IndexedDB:', mindMap.id);
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error saving mind map to IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return false;
  }
};

// Get a mind map from IndexedDB by ID
export const getMindMap = async (id: string): Promise<MindMapRecord | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result as MindMapRecord;
        resolve(result || null);
      };
      
      request.onerror = (event) => {
        console.error('Error getting mind map from IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return null;
  }
};

// Get all mind maps from IndexedDB
export const getAllMindMaps = async (): Promise<MindMapRecord[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result as MindMapRecord[];
        resolve(results || []);
      };
      
      request.onerror = (event) => {
        console.error('Error getting all mind maps from IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return [];
  }
};

// Get all unsynced mind maps
export const getUnsyncedMindMaps = async (): Promise<MindMapRecord[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);
      const index = store.index('synced');
      
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = () => {
        const results = request.result as MindMapRecord[];
        resolve(results || []);
      };
      
      request.onerror = (event) => {
        console.error('Error getting unsynced mind maps from IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return [];
  }
};

// Delete a mind map from IndexedDB
export const deleteMindMap = async (id: string): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log('Mind map deleted from IndexedDB:', id);
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error deleting mind map from IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return false;
  }
};
