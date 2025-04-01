// src/utils/indexedDB/dbService.ts
import { DB_CONFIG } from './config';
import { logInfo, logError } from '../logger';

// Re-export record types for other modules to use
import { MindMapRecord, SettingsRecord, AppStateRecord, ChatMessageRecord } from './config';
export type { MindMapRecord, SettingsRecord, AppStateRecord, ChatMessageRecord } from './config';
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
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion || DB_CONFIG.version;

      logInfo(`Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);

      // Create object stores and indexes
      const { stores } = DB_CONFIG;

      // Create all stores that don't exist
      // Create mindMaps store if it doesn't exist
      if (!db.objectStoreNames.contains(stores.mindMaps.name)) {
        logInfo('Creating mind maps object store');
        const mindMapsStore = db.createObjectStore(stores.mindMaps.name, { keyPath: stores.mindMaps.keyPath });

        // Create all indexes
        stores.mindMaps.indexes.forEach(index => {
          logInfo(`Creating index: ${index.name}`);
          mindMapsStore.createIndex(index.name, index.keyPath);
        });
      }

      // Create offlineOperations store if it doesn't exist
      if (!db.objectStoreNames.contains(stores.offlineOperations.name)) {
        logInfo('Creating offline operations object store');
        const offlineOperationsStore = db.createObjectStore(stores.offlineOperations.name, { keyPath: stores.offlineOperations.keyPath });

        // Create all indexes
        stores.offlineOperations.indexes.forEach(index => {
          logInfo(`Creating index: ${index.name}`);
          offlineOperationsStore.createIndex(index.name, index.keyPath);
        });
      }

      // Create settings store if it doesn't exist
      if (!db.objectStoreNames.contains(stores.settings.name)) {
        logInfo('Creating settings object store');
        const settingsStore = db.createObjectStore(stores.settings.name, { keyPath: stores.settings.keyPath });

        // Create all indexes
        stores.settings.indexes.forEach(index => {
          logInfo(`Creating index: ${index.name}`);
          settingsStore.createIndex(index.name, index.keyPath);
        });
      }

      // Create appState store if it doesn't exist
      if (!db.objectStoreNames.contains(stores.appState.name)) {
        logInfo('Creating app state object store');
        const appStateStore = db.createObjectStore(stores.appState.name, { keyPath: stores.appState.keyPath });

        // Create all indexes
        stores.appState.indexes.forEach(index => {
          logInfo(`Creating index: ${index.name}`);
          appStateStore.createIndex(index.name, index.keyPath);
        });
      }

      // Create chatHistory store if it doesn't exist
      if (!db.objectStoreNames.contains(stores.chatHistory.name)) {
        logInfo('Creating chat history object store');
        const chatHistoryStore = db.createObjectStore(stores.chatHistory.name, { keyPath: stores.chatHistory.keyPath });

        // Create all indexes
        stores.chatHistory.indexes.forEach(index => {
          logInfo(`Creating index: ${index.name}`);
          chatHistoryStore.createIndex(index.name, index.keyPath);
        });
      }

      // If the store exists but we're upgrading from version 1 to 2, add the new indexes
      if (oldVersion === 1 && newVersion >= 2) {
        logInfo('Upgrading mind maps object store schema from v1 to v2');
        // Access the transaction from the event object correctly
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        if (!transaction) {
          logError('Transaction not available during upgrade');
          return;
        }
        const mindMapsStore = transaction.objectStore(stores.mindMaps.name);

        // Add new indexes if they don't exist
        if (!mindMapsStore.indexNames.contains('hasConflict')) {
          logInfo('Adding hasConflict index');
          mindMapsStore.createIndex('hasConflict', 'hasConflict');
        }
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

      // Get all records and filter them in memory instead of using the index
      // This avoids potential issues with IDBKeyRange.only(false)
      const request = store.getAll();

      request.onsuccess = () => {
        const allRecords = request.result as MindMapRecord[];
        // Filter records where synced is explicitly false
        const results = allRecords.filter(record => record.synced === false);
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

// Get all mind maps with conflicts
export const getConflictedMindMaps = async (): Promise<MindMapRecord[]> => {
  try {
    logInfo('Getting mind maps with conflicts from IndexedDB');
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.mindMaps.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.mindMaps.name);

      // Use the hasConflict index if available
      if (store.indexNames.contains('hasConflict')) {
        const index = store.index('hasConflict');
        const request = index.getAll(IDBKeyRange.only(true));

        request.onsuccess = () => {
          const results = request.result as MindMapRecord[];
          logInfo(`Found ${results.length} mind maps with conflicts in IndexedDB`);
          resolve(results || []);
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error || new Error('Unknown request error');
          logError('Error getting mind maps with conflicts from IndexedDB:', error);
          reject(new StorageError('Failed to get mind maps with conflicts', error));
        };
      } else {
        // Fall back to getting all records and filtering
        const request = store.getAll();

        request.onsuccess = () => {
          const allRecords = request.result as MindMapRecord[];
          // Filter records where hasConflict is true
          const results = allRecords.filter(record => record.hasConflict === true);
          logInfo(`Found ${results.length} mind maps with conflicts in IndexedDB`);
          resolve(results || []);
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error || new Error('Unknown request error');
          logError('Error getting mind maps with conflicts from IndexedDB:', error);
          reject(new StorageError('Failed to get mind maps with conflicts', error));
        };
      }

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB:', error);
    throw new StorageError('Failed to access IndexedDB for getting mind maps with conflicts', error as Error);
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

// Settings operations

// Save settings to IndexedDB
export const saveSettings = async (settings: SettingsRecord): Promise<boolean> => {
  try {
    logInfo('Saving settings to IndexedDB:', { id: settings.id, category: settings.category });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.settings.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.settings.name);

      const request = store.put(settings);

      request.onsuccess = () => {
        logInfo('Settings saved to IndexedDB:', { id: settings.id });
        resolve(true);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error saving settings to IndexedDB:', error);
        reject(new StorageError(`Failed to save settings with ID ${settings.id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for settings:', error);
    throw new StorageError('Failed to access IndexedDB for saving settings', error as Error);
  }
};

// Get settings from IndexedDB by ID
export const getSettings = async (id: string): Promise<SettingsRecord | null> => {
  try {
    logInfo('Getting settings from IndexedDB:', { id });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.settings.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.settings.name);

      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as SettingsRecord;
        if (result) {
          logInfo('Settings found in IndexedDB:', { id });
        } else {
          logInfo('Settings not found in IndexedDB:', { id });
        }
        resolve(result || null);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting settings from IndexedDB:', error);
        reject(new StorageError(`Failed to get settings with ID ${id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for settings:', error);
    throw new StorageError('Failed to access IndexedDB for getting settings', error as Error);
  }
};

// Get settings by category
export const getSettingsByCategory = async (category: string): Promise<SettingsRecord[]> => {
  try {
    logInfo('Getting settings by category from IndexedDB:', { category });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.settings.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.settings.name);
      const index = store.index('category');

      const request = index.getAll(IDBKeyRange.only(category));

      request.onsuccess = () => {
        const results = request.result as SettingsRecord[];
        logInfo(`Found ${results.length} settings in category ${category}`);
        resolve(results || []);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting settings by category from IndexedDB:', error);
        reject(new StorageError(`Failed to get settings for category ${category}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for settings by category:', error);
    throw new StorageError('Failed to access IndexedDB for getting settings by category', error as Error);
  }
};

// App State operations

// Save app state to IndexedDB
export const saveAppState = async (state: AppStateRecord): Promise<boolean> => {
  try {
    logInfo('Saving app state to IndexedDB:', { id: state.id, category: state.category });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.appState.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.appState.name);

      const request = store.put(state);

      request.onsuccess = () => {
        logInfo('App state saved to IndexedDB:', { id: state.id });
        resolve(true);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error saving app state to IndexedDB:', error);
        reject(new StorageError(`Failed to save app state with ID ${state.id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for app state:', error);
    throw new StorageError('Failed to access IndexedDB for saving app state', error as Error);
  }
};

// Get app state from IndexedDB by ID
export const getAppState = async (id: string): Promise<AppStateRecord | null> => {
  try {
    logInfo('Getting app state from IndexedDB:', { id });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.appState.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.appState.name);

      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as AppStateRecord;
        if (result) {
          logInfo('App state found in IndexedDB:', { id });
        } else {
          logInfo('App state not found in IndexedDB:', { id });
        }
        resolve(result || null);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting app state from IndexedDB:', error);
        reject(new StorageError(`Failed to get app state with ID ${id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for app state:', error);
    throw new StorageError('Failed to access IndexedDB for getting app state', error as Error);
  }
};

// Chat History operations

// Save chat message to IndexedDB
export const saveChatMessage = async (message: ChatMessageRecord): Promise<boolean> => {
  try {
    logInfo('Saving chat message to IndexedDB:', { id: message.id, conversationId: message.conversationId });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.chatHistory.name], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.stores.chatHistory.name);

      const request = store.put(message);

      request.onsuccess = () => {
        logInfo('Chat message saved to IndexedDB:', { id: message.id });
        resolve(true);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error saving chat message to IndexedDB:', error);
        reject(new StorageError(`Failed to save chat message with ID ${message.id}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for chat message:', error);
    throw new StorageError('Failed to access IndexedDB for saving chat message', error as Error);
  }
};

// Get chat messages by conversation ID
export const getChatMessagesByConversation = async (conversationId: string): Promise<ChatMessageRecord[]> => {
  try {
    logInfo('Getting chat messages by conversation from IndexedDB:', { conversationId });
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DB_CONFIG.stores.chatHistory.name], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.chatHistory.name);
      const index = store.index('conversationId');

      const request = index.getAll(IDBKeyRange.only(conversationId));

      request.onsuccess = () => {
        const results = request.result as ChatMessageRecord[];
        logInfo(`Found ${results.length} chat messages in conversation ${conversationId}`);
        resolve(results || []);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error || new Error('Unknown request error');
        logError('Error getting chat messages by conversation from IndexedDB:', error);
        reject(new StorageError(`Failed to get chat messages for conversation ${conversationId}`, error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logError('Error accessing IndexedDB for chat messages by conversation:', error);
    throw new StorageError('Failed to access IndexedDB for getting chat messages by conversation', error as Error);
  }
};
