// src/utils/indexedDB/config.ts
export const DB_CONFIG = {
  name: 'mindMapDB',
  version: 2, // Increased version for schema update
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
