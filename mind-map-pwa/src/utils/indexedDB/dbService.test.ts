// src/utils/indexedDB/dbService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initDB,
  saveMindMap,
  getMindMap,
  saveSettings,
  getSettings,
  saveAppState,
  getAppState,
  saveChatMessage,
  getChatMessagesByConversation
} from './dbService';
import { DB_CONFIG } from './config';

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

// Mock IDBRequest
const mockRequest = {
  onsuccess: null as any,
  onerror: null as any,
  onupgradeneeded: null as any,
  result: {
    transaction: vi.fn(),
    close: vi.fn(),
    objectStoreNames: {
      contains: vi.fn().mockReturnValue(true)
    },
    createObjectStore: vi.fn().mockReturnValue({
      createIndex: vi.fn()
    })
  }
};

// Mock IDBTransaction
const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null as any
};

// Mock IDBObjectStore
const mockObjectStore = {
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  index: vi.fn(),
  indexNames: {
    contains: vi.fn().mockReturnValue(true)
  },
  createIndex: vi.fn()
};

// Mock IDBIndex
const mockIndex = {
  getAll: vi.fn()
};

// Mock logger
vi.mock('../logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn()
}));

// Mock error handler
vi.mock('../errorHandler', () => ({
  StorageError: class StorageError extends Error {
    constructor(message: string, cause?: Error) {
      super(message);
      this.name = 'StorageError';
      this.cause = cause;
    }
  }
}));

describe('IndexedDB Service', () => {
  beforeEach(() => {
    // Setup mocks
    vi.stubGlobal('indexedDB', indexedDB);
    
    // Reset mock functions
    indexedDB.open.mockReset();
    mockObjectStore.put.mockReset();
    mockObjectStore.get.mockReset();
    mockObjectStore.delete.mockReset();
    mockObjectStore.index.mockReset();
    mockIndex.getAll.mockReset();
    
    // Setup mock chain
    indexedDB.open.mockReturnValue(mockRequest);
    mockTransaction.objectStore.mockReturnValue(mockObjectStore);
    mockObjectStore.index.mockReturnValue(mockIndex);
    mockRequest.result.transaction.mockReturnValue(mockTransaction);
    
    // Setup mock put request
    const mockPutRequest = {
      onsuccess: null as any,
      onerror: null as any
    };
    mockObjectStore.put.mockReturnValue(mockPutRequest);
    
    // Setup mock get request
    const mockGetRequest = {
      onsuccess: null as any,
      onerror: null as any,
      result: null
    };
    mockObjectStore.get.mockReturnValue(mockGetRequest);
    
    // Setup mock delete request
    const mockDeleteRequest = {
      onsuccess: null as any,
      onerror: null as any
    };
    mockObjectStore.delete.mockReturnValue(mockDeleteRequest);
    
    // Setup mock getAll request
    const mockGetAllRequest = {
      onsuccess: null as any,
      onerror: null as any,
      result: []
    };
    mockIndex.getAll.mockReturnValue(mockGetAllRequest);
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  
  describe('initDB', () => {
    it('should initialize the database', async () => {
      const initPromise = initDB();
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      const db = await initPromise;
      expect(db).toBe(mockRequest.result);
      expect(indexedDB.open).toHaveBeenCalledWith(DB_CONFIG.name, DB_CONFIG.version);
    });
    
    it('should handle database open error', async () => {
      const initPromise = initDB();
      
      // Simulate database open error
      if (mockRequest.onerror) {
        mockRequest.onerror({ target: { error: new Error('Test error') } } as any);
      }
      
      await expect(initPromise).rejects.toThrow('Failed to open IndexedDB');
    });
  });
  
  describe('saveMindMap', () => {
    it('should save a mind map to IndexedDB', async () => {
      const mindMap = {
        id: 'test-id',
        data: { title: 'Test Mind Map' },
        lastModified: new Date().toISOString(),
        synced: false
      };
      
      const savePromise = saveMindMap(mindMap);
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful put operation
      if (mockObjectStore.put().onsuccess) {
        mockObjectStore.put().onsuccess({} as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await savePromise;
      expect(result).toBe(true);
      expect(mockObjectStore.put).toHaveBeenCalledWith(mindMap);
    });
  });
  
  describe('getMindMap', () => {
    it('should get a mind map from IndexedDB', async () => {
      const mindMap = {
        id: 'test-id',
        data: { title: 'Test Mind Map' },
        lastModified: new Date().toISOString(),
        synced: false
      };
      
      const getPromise = getMindMap('test-id');
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful get operation
      mockObjectStore.get().result = mindMap;
      if (mockObjectStore.get().onsuccess) {
        mockObjectStore.get().onsuccess({ target: mockObjectStore.get() } as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await getPromise;
      expect(result).toEqual(mindMap);
      expect(mockObjectStore.get).toHaveBeenCalledWith('test-id');
    });
  });
  
  describe('saveSettings', () => {
    it('should save settings to IndexedDB', async () => {
      const settings = {
        id: 'theme',
        category: 'theme',
        data: { mode: 'dark' },
        lastModified: new Date().toISOString()
      };
      
      const savePromise = saveSettings(settings);
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful put operation
      if (mockObjectStore.put().onsuccess) {
        mockObjectStore.put().onsuccess({} as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await savePromise;
      expect(result).toBe(true);
      expect(mockObjectStore.put).toHaveBeenCalledWith(settings);
    });
  });
  
  describe('getSettings', () => {
    it('should get settings from IndexedDB', async () => {
      const settings = {
        id: 'theme',
        category: 'theme',
        data: { mode: 'dark' },
        lastModified: new Date().toISOString()
      };
      
      const getPromise = getSettings('theme');
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful get operation
      mockObjectStore.get().result = settings;
      if (mockObjectStore.get().onsuccess) {
        mockObjectStore.get().onsuccess({ target: mockObjectStore.get() } as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await getPromise;
      expect(result).toEqual(settings);
      expect(mockObjectStore.get).toHaveBeenCalledWith('theme');
    });
  });
  
  describe('saveAppState', () => {
    it('should save app state to IndexedDB', async () => {
      const appState = {
        id: 'navigation.drawerOpen',
        category: 'navigation',
        data: { drawerOpen: true },
        lastModified: new Date().toISOString()
      };
      
      const savePromise = saveAppState(appState);
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful put operation
      if (mockObjectStore.put().onsuccess) {
        mockObjectStore.put().onsuccess({} as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await savePromise;
      expect(result).toBe(true);
      expect(mockObjectStore.put).toHaveBeenCalledWith(appState);
    });
  });
  
  describe('getAppState', () => {
    it('should get app state from IndexedDB', async () => {
      const appState = {
        id: 'navigation.drawerOpen',
        category: 'navigation',
        data: { drawerOpen: true },
        lastModified: new Date().toISOString()
      };
      
      const getPromise = getAppState('navigation.drawerOpen');
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful get operation
      mockObjectStore.get().result = appState;
      if (mockObjectStore.get().onsuccess) {
        mockObjectStore.get().onsuccess({ target: mockObjectStore.get() } as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await getPromise;
      expect(result).toEqual(appState);
      expect(mockObjectStore.get).toHaveBeenCalledWith('navigation.drawerOpen');
    });
  });
  
  describe('saveChatMessage', () => {
    it('should save a chat message to IndexedDB', async () => {
      const chatMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date().toISOString()
      };
      
      const savePromise = saveChatMessage(chatMessage);
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful put operation
      if (mockObjectStore.put().onsuccess) {
        mockObjectStore.put().onsuccess({} as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await savePromise;
      expect(result).toBe(true);
      expect(mockObjectStore.put).toHaveBeenCalledWith(chatMessage);
    });
  });
  
  describe('getChatMessagesByConversation', () => {
    it('should get chat messages by conversation ID from IndexedDB', async () => {
      const chatMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'user' as const,
          content: 'Hello',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          role: 'assistant' as const,
          content: 'Hi there',
          timestamp: new Date().toISOString()
        }
      ];
      
      const getPromise = getChatMessagesByConversation('conv-1');
      
      // Simulate successful database open
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
      
      // Simulate successful getAll operation
      mockIndex.getAll().result = chatMessages;
      if (mockIndex.getAll().onsuccess) {
        mockIndex.getAll().onsuccess({ target: mockIndex.getAll() } as any);
      }
      
      // Simulate transaction complete
      if (mockTransaction.oncomplete) {
        mockTransaction.oncomplete({} as any);
      }
      
      const result = await getPromise;
      expect(result).toEqual(chatMessages);
      expect(mockObjectStore.index).toHaveBeenCalledWith('conversationId');
    });
  });
});
