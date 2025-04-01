/**
 * Security Configuration
 *
 * This module provides security configuration settings and utilities
 * for the application, including HTTPS enforcement, IndexedDB security,
 * and Content Security Policy.
 */

// Import DB_CONFIG to ensure consistency
import { DB_CONFIG } from './indexedDB/config';

/**
 * Security configuration object
 */
export const securityConfig = {
  /**
   * HTTPS configuration
   */
  https: {
    enforce: true,
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    }
  },

  /**
   * IndexedDB security configuration
   */
  indexedDB: {
    // Version management for schema updates
    currentVersion: 3, // Updated to match DB_CONFIG.version
    // Maximum storage quota (in bytes)
    maxStorageQuota: 50 * 1024 * 1024, // 50MB
    // Data retention period (in days)
    dataRetentionPeriod: 30,
    // Security checks
    securityChecks: {
      validateOrigin: true,
      enforceHttps: true,
      validateInputTypes: true,
      preventXSS: true
    }
  },

  /**
   * Content Security Policy directives
   */
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'connect-src': ["'self'", 'https:', 'wss:'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"]
    }
  },

  /**
   * GDPR compliance settings
   */
  gdpr: {
    dataMinimization: true,
    consentRequired: false, // No personal data collected initially
    retentionPeriod: 30, // days
    userRights: {
      access: true,
      rectification: true,
      erasure: true,
      portability: true
    }
  }
};

/**
 * Enforces HTTPS by redirecting HTTP requests to HTTPS
 * Should be called early in the application initialization
 */
export const enforceHttps = (): void => {
  if (
    securityConfig.https.enforce &&
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.match(/^127\./)
  ) {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
};

/**
 * Checks if the application is running in a secure context
 *
 * @returns True if in a secure context, false otherwise
 */
export const isSecureContext = (): boolean => {
  return window.isSecureContext === true;
};

/**
 * Validates the origin for security checks
 *
 * @param allowedOrigins - Array of allowed origins
 * @returns True if current origin is allowed, false otherwise
 */
export const validateOrigin = (allowedOrigins: string[] = []): boolean => {
  const currentOrigin = window.location.origin;

  // If no specific origins are provided, just check for secure context
  if (allowedOrigins.length === 0) {
    return isSecureContext();
  }

  return allowedOrigins.includes(currentOrigin) && isSecureContext();
};

/**
 * Checks security prerequisites for IndexedDB operations
 *
 * @returns True if all security prerequisites are met, false otherwise
 */
export const checkSecurityPrerequisites = (): boolean => {
  const { securityChecks } = securityConfig.indexedDB;

  // Check if we're in a secure context if enforceHttps is enabled
  if (securityChecks.enforceHttps && !isSecureContext()) {
    console.error('Security check failed: Not in a secure context');
    return false;
  }

  // Add more security checks as needed

  return true;
};

/**
 * Sets up secure schema for IndexedDB
 *
 * @param db - The IndexedDB database instance
 */
export const setupSecureSchema = (db: IDBDatabase): void => {
  const { stores } = DB_CONFIG;

  // Create mindMaps store if it doesn't exist
  if (!db.objectStoreNames.contains(stores.mindMaps.name)) {
    const store = db.createObjectStore(stores.mindMaps.name, { keyPath: stores.mindMaps.keyPath });
    stores.mindMaps.indexes.forEach(index => {
      store.createIndex(index.name, index.keyPath, { unique: false });
    });
  }

  // Create offlineOperations store if it doesn't exist
  if (!db.objectStoreNames.contains(stores.offlineOperations.name)) {
    const store = db.createObjectStore(stores.offlineOperations.name, { keyPath: stores.offlineOperations.keyPath });
    stores.offlineOperations.indexes.forEach(index => {
      store.createIndex(index.name, index.keyPath, { unique: false });
    });
  }
};

/**
 * Performs data cleanup based on retention policy
 *
 * @param db - The IndexedDB database instance
 * @returns Promise that resolves when cleanup is complete
 */
export const performDataCleanup = async (db: IDBDatabase): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(['mindMapData'], 'readwrite');
      const store = transaction.objectStore('mindMapData');
      const index = store.index('lastModified');

      // Calculate cutoff date based on retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - securityConfig.indexedDB.dataRetentionPeriod);
      const cutoffTimestamp = cutoffDate.toISOString();

      // Get all records older than the cutoff date
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // Delete the record
          cursor.delete();
          cursor.continue();
        } else {
          // No more records to process
          resolve(true);
        }
      };

      request.onerror = () => {
        reject(new Error('Data cleanup failed'));
      };

      transaction.oncomplete = () => {
        resolve(true);
      };

      transaction.onerror = () => {
        reject(new Error('Data cleanup transaction failed'));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Example usage:
 *
 * // Enforce HTTPS early in the application
 * enforceHttps();
 *
 * // Initialize IndexedDB with security checks
 * const initSecureDB = async () => {
 *   if (!checkSecurityPrerequisites()) {
 *     throw new Error('Security prerequisites not met');
 *   }
 *
 *   const request = indexedDB.open('secureDB', securityConfig.indexedDB.currentVersion);
 *
 *   request.onupgradeneeded = (event) => {
 *     const db = event.target.result;
 *     setupSecureSchema(db);
 *   };
 *
 *   return new Promise((resolve, reject) => {
 *     request.onsuccess = () => resolve(request.result);
 *     request.onerror = () => reject(request.error);
 *   });
 * };
 *
 * // Perform regular data cleanup
 * const cleanupData = async () => {
 *   const db = await initSecureDB();
 *   await performDataCleanup(db);
 * };
 */
