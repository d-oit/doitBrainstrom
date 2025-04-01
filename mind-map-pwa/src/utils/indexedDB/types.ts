// src/utils/indexedDB/types.ts

/**
 * Interface for mind map records stored in IndexedDB
 */
export interface MindMapRecord {
  id: string;
  name: string;
  data: any;
  lastModified: number;
  versionVector?: Record<string, number>;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  lastSynced?: number;
}

/**
 * Interface for database schema
 */
export interface DBSchema {
  mindMaps: {
    key: string;
    value: MindMapRecord;
    indexes: {
      'by-last-modified': number;
    };
  };
  syncOperations: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      timestamp: number;
      status: string;
      priority: number;
      retryCount: number;
    };
    indexes: {
      'by-status': string;
      'by-timestamp': number;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}
