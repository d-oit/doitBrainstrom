// src/utils/indexedDB/config.ts
export const DB_CONFIG = {
  name: 'mindMapDB',
  version: 3, // Increased version for schema update with new stores
  stores: {
    mindMaps: {
      name: 'mindMaps',
      keyPath: 'id',
      indexes: [
        { name: 'lastModified', keyPath: 'lastModified' },
        { name: 'synced', keyPath: 'synced' },
        { name: 'hasConflict', keyPath: 'hasConflict' } // New index for conflict detection
      ]
    },
    offlineOperations: {
      name: 'offlineOperations',
      keyPath: 'id',
      indexes: [
        { name: 'status', keyPath: 'status' },
        { name: 'priority', keyPath: 'priority' },
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'entityId', keyPath: 'entityId' },
        { name: 'entityType', keyPath: 'entityType' },
        { name: 'type', keyPath: 'type' }
      ]
    },
    settings: {
      name: 'settings',
      keyPath: 'id',
      indexes: [
        { name: 'category', keyPath: 'category' },
        { name: 'lastModified', keyPath: 'lastModified' }
      ]
    },
    appState: {
      name: 'appState',
      keyPath: 'id',
      indexes: [
        { name: 'category', keyPath: 'category' },
        { name: 'lastModified', keyPath: 'lastModified' }
      ]
    },
    chatHistory: {
      name: 'chatHistory',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'conversationId', keyPath: 'conversationId' }
      ]
    }
  }
};

export interface MindMapRecord {
  id: string;
  data: any; // This will contain the MindMapData
  lastModified: string;
  synced: boolean;
  hasConflict?: boolean; // Whether this mind map has a conflict with the remote version
  remoteData?: any; // The remote version of the data when a conflict is detected
  conflictResolved?: boolean; // Whether the conflict has been resolved
  lastSyncAttempt?: string; // When the last sync attempt was made
}

export interface SettingsRecord {
  id: string; // Unique identifier for the setting (e.g., 'theme', 'accessibility', 'locale')
  category: string; // Category of settings (e.g., 'theme', 'accessibility', 'locale')
  data: any; // The actual settings data
  lastModified: string; // ISO string timestamp
}

export interface AppStateRecord {
  id: string; // Unique identifier for the state (e.g., 'navigation', 'tabs')
  category: string; // Category of state (e.g., 'navigation', 'ui')
  data: any; // The actual state data
  lastModified: string; // ISO string timestamp
}

export interface ChatMessageRecord {
  id: string; // Unique message ID
  conversationId: string; // ID of the conversation this message belongs to
  role: 'user' | 'assistant' | 'system'; // Role of the message sender
  content: string; // Message content
  timestamp: string; // ISO string timestamp
  metadata?: Record<string, any>; // Additional metadata
}
