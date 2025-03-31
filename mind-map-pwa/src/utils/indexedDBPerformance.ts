/**
 * IndexedDB Performance Utilities
 *
 * This module provides utilities for optimizing IndexedDB operations,
 * including transaction management, bulk operations, and performance monitoring.
 */

// Chunk size for large data operations (adjust based on testing)
const CHUNK_SIZE = 1000;

/**
 * Transaction wrapper with automatic retry
 * Handles transaction errors and retries with exponential backoff
 */
export const withTransaction = async (
  db: IDBDatabase,
  storeNames: string[],
  mode: 'readonly' | 'readwrite',
  callback: (transaction: IDBTransaction) => Promise<any>,
  retries = 3
): Promise<any> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const transaction = db.transaction(storeNames, mode);
      const result = await callback(transaction);
      return result;
    } catch (error) {
      attempt++;
      if (attempt === retries) throw error;
      // Exponential backoff before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
};

/**
 * Bulk operation handler with chunking
 * Breaks large datasets into manageable chunks to prevent UI blocking
 */
export const bulkOperation = async (
  db: IDBDatabase,
  storeName: string,
  data: any[],
  operation: 'add' | 'put' | 'delete'
): Promise<any[]> => {
  // Split data into chunks
  const chunks = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    chunks.push(data.slice(i, i + CHUNK_SIZE));
  }

  const results: any[] = [];
  // Process each chunk in a separate transaction
  for (const chunk of chunks) {
    await withTransaction(db, [storeName], 'readwrite', async (transaction) => {
      const store = transaction.objectStore(storeName);
      const promises = chunk.map(item =>
        new Promise((resolve, reject) => {
          const request = store[operation](item);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      );
      results.push(...await Promise.all(promises));
    });
  }
  return results;
};

/**
 * Index optimization utilities
 * Creates optimized indexes for faster queries
 */
export const createOptimizedIndex = (
  db: IDBDatabase,
  storeName: string,
  indexName: string,
  keyPath: string | string[],
  options?: IDBIndexParameters
): void => {
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  if (!store.indexNames.contains(indexName)) {
    store.createIndex(indexName, keyPath, options);
  }
};

/**
 * Performance monitoring for IndexedDB operations
 * Measures and logs operation duration
 */
export const measureIndexedDBOperation = async (
  operationName: string,
  operation: () => Promise<any>
): Promise<any> => {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    console.log(`IndexedDB Operation: ${operationName} took ${duration}ms`);
    // Send metrics to monitoring service if configured
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`IndexedDB Operation: ${operationName} failed after ${duration}ms`, error);
    throw error;
  }
};

/**
 * Memory usage monitoring
 * Tracks JavaScript heap usage (Chrome only)
 */
export const monitorMemoryUsage = (): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} | null => {
  if ('memory' in performance) {
    const usage = (performance as any).memory;
    return {
      usedJSHeapSize: usage.usedJSHeapSize,
      totalJSHeapSize: usage.totalJSHeapSize,
      jsHeapSizeLimit: usage.jsHeapSizeLimit
    };
  }
  return null;
};

/**
 * Example usage:
 *
 * // Optimized bulk save operation
 * export const saveMindMapNodes = async (nodes: Node[]) => {
 *   return await measureIndexedDBOperation('saveMindMapNodes', async () => {
 *     const db = await initDB();
 *     return await bulkOperation(db, 'nodes', nodes, 'put');
 *   });
 * };
 *
 * // Optimized query using indexes
 * export const queryNodesByType = async (type: string) => {
 *   return await measureIndexedDBOperation('queryNodesByType', async () => {
 *     const db = await initDB();
 *     return await withTransaction(db, ['nodes'], 'readonly', async (transaction) => {
 *       const store = transaction.objectStore('nodes');
 *       const index = store.index('type');
 *       return await new Promise((resolve, reject) => {
 *         const request = index.getAll(type);
 *         request.onsuccess = () => resolve(request.result);
 *         request.onerror = () => reject(request.error);
 *       });
 *     });
 *   });
 * };
 */
