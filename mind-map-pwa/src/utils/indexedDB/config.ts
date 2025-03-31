// src/utils/indexedDB/config.ts
export const DB_CONFIG = {
  name: 'mindMapDB',
  version: 1,
  stores: {
    mindMaps: {
      name: 'mindMaps',
      keyPath: 'id',
      indexes: [
        { name: 'lastModified', keyPath: 'lastModified' },
        { name: 'synced', keyPath: 'synced' }
      ]
    }
  }
};

export interface MindMapRecord {
  id: string;
  data: any; // This will contain the MindMapData
  lastModified: string;
  synced: boolean;
}
