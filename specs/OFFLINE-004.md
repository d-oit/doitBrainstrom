# specs/OFFLINE-004.md

## Phase 4: Offline Capabilities and Synchronization (OFFLINE-004)

**Functional Requirements:**

1.  **Offline Functionality using IndexedDB:** Implement robust offline capabilities using IndexedDB for data storage, enabling users to access and interact with the mind map even without an internet connection.
2.  **Service Worker Implementation:** Utilize service workers to cache necessary assets and handle offline data management.
3.  **Data Synchronization:** Implement background synchronization to automatically sync local changes with the S3 bucket when online.
4.  **Offline Data Storage:** Use local storage (e.g., IndexedDB, LocalStorage) to persist mind map data offline.
5.  **Conflict Resolution:** Define a strategy for conflict resolution in case of data inconsistencies between local and remote (S3) data.

**Edge Cases:**

1.  **Service Worker Registration/Update Errors:** Handle errors during service worker registration, installation, and updates.
2.  **Caching Errors:** Manage errors during asset and data caching, including storage limits and cache invalidation.
3.  **Synchronization Failures:** Handle synchronization failures due to network issues, S3 errors, or data conflicts.
4.  **Data Loss in Offline Storage:** Prevent data loss in local storage due to browser limitations or user actions.
5.  **Conflict Resolution Issues:** Resolve data conflicts effectively and inform users if manual intervention is needed:
   - Simultaneous offline/online edits
   - Version conflicts between devices
   - Data schema mismatches
6.  **Large Data Sets Offline:** Optimize offline storage and synchronization for large mind maps to maintain performance
7.  **Partial Sync Failures:** Handle scenarios where only part of data syncs successfully
8.  **Network Flakiness:** Manage intermittent connectivity during synchronization
9.  **Credential Rotation:** Handle AWS credential expiration during long sync operations

**Constraints:**

1.  **Implement offline capabilities using service workers.**
2.  **Synchronize data with the S3 bucket.**
3.  **Use local storage for offline data persistence.**
4.  **Define a conflict resolution strategy.**

**Pseudocode:**

```pseudocode
// Module: offline_sync.ts

// Function: registerServiceWorker
// Registers the service worker for offline functionality
function registerServiceWorker(): Result<Success, Error> {
  // Vitest test example:
  // describe('Service Worker Registration', () => {
  //   it('should register service worker successfully', async () => {
  //     vi.spyOn(navigator.serviceWorker, 'register')
  //       .mockImplementation(() => Promise.resolve({
  //         scope: '/app/',
  //         active: { state: 'activated' }
  //       } as ServiceWorkerRegistration));
  //
  //     const result = await registerServiceWorker();
  //     expect(result.isSuccess()).toBe(true);
  //     expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/serviceWorker.ts');
  //   });
  //
  //   it('should handle registration failure', async () => {
  //     vi.spyOn(navigator.serviceWorker, 'register')
  //       .mockImplementation(() => Promise.reject(new Error('Registration failed')));
  //
  //     const result = await registerServiceWorker();
  //     expect(result.isError()).toBe(true);
  //   });
  // });

  log("Registering service worker...");
  service_worker_registration_script = `
    // src/serviceWorker.ts
    const CACHE_NAME = 'mind-map-cache-v1';
    const STATIC_ASSETS = [
      '/',
      '/index.html',
      '/manifest.json',
      '/assets/styles.css',
      '/assets/app.js'
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        Promise.all([
          // Cache static assets
          caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
          }),
          // Initialize IndexedDB through the worker
          initDB()
        ])
      );
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        Promise.all([
          // Clean up old caches
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                  return caches.delete(cacheName);
                }
              })
            );
          }),
          // Claim clients to ensure the service worker is in control
          self.clients.claim()
        ])
      );
    });

    self.addEventListener('fetch', (event) => {
      // Network-first strategy for API requests
      if (event.request.url.includes('/api/')) {
        event.respondWith(
          fetch(event.request)
            .then((response) => {
              if (response.ok) {
                // Clone the response before using it to respond
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                return response;
              }
              throw new Error('Network response was not ok');
            })
            .catch(() => {
              // If network fails, try to get from cache
              return caches.match(event.request);
            })
        );
      } else {
        // Cache-first strategy for static assets
        event.respondWith(
          caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return fetch(event.request).then((response) => {
                if (!response || response.status !== 200) {
                  return response;
                }
                // Cache new successful responses
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                return response;
              });
            })
        );
      }
    });

    // Background sync handling
    self.addEventListener('sync', (event) => {
      if (event.tag === 'sync-mindmap') {
        event.waitUntil(
          getPendingChanges()
            .then((changes) => {
              return Promise.all(
                changes.map((change) => syncMindMapData())
              );
            })
            .catch((error) => {
              console.error('Sync failed:', error);
              // Retry sync after a delay
              setTimeout(() => {
                self.registration.sync.register('sync-mindmap');
              }, 5000);
            })
        );
      }
    });

    // Handle sync completion notification
    self.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        // Notify all clients about successful sync
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_STATUS',
              status: 'success',
              timestamp: new Date().toISOString()
            });
          });
        });
      }
    });
  `;
  write_to_file("src/serviceWorker.ts", service_worker_registration_script);

  index_tsx_content = `
    // src/index.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import { ThemeContextProvider } from './contexts/ThemeContext';
    import { MindMapContextProvider } from './contexts/MindMapContext'; // Import MindMapContextProvider


    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceWorker.ts')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }


    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ThemeContextProvider>
          <MindMapContextProvider> {/* Wrap App with MindMapContextProvider */}
            <App />
          </MindMapContextProvider>
        </ThemeContextProvider>
      </React.StrictMode>
    );
  `;
  read_file("src/index.tsx");
  write_to_file("src/index.tsx", index_tsx_content);


  if ('serviceWorker' in navigator) { // Check if service worker is supported in environment
    log("Service worker registration logic added to index.tsx and serviceWorker.ts created.");
    return Success;
  } else {
    log_error("Service workers are not supported in this environment.");
    return Error("Service workers not supported."); // Or handle gracefully if offline is optional
  }
}

// Function: implementOfflineDataStorage
// Implements local storage for mind map data (using IndexedDB or LocalStorage)
function implementOfflineDataStorage(): Result<Success, Error> {
  // Vitest test example:
  // describe('Offline Storage', () => {
  //   beforeEach(() => {
  //     localStorage.clear();
  //   });
  //
  //   it('should save and load data from localStorage', () => {
  //     const testData = { nodes: [{ id: '1', text: 'Test' }], links: [] };
  //
  //     expect(saveMindMapDataOffline(testData)).toBe(true);
  //     expect(loadMindMapDataOffline()).toEqual(testData);
  //   });
  //
  //   it('should handle storage errors gracefully', () => {
  //     vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
  //       throw new Error('Storage full');
  //     });
  //
  //     expect(saveMindMapDataOffline({ nodes: [], links: [] })).toBe(false);
  //   });
  //
  //   it('should return null for non-existent data', () => {
  //     expect(loadMindMapDataOffline()).toBeNull();
  //   });
  // });

  log("Implementing offline data storage using IndexedDB...");
  offline_storage_utils_content = `
    // src/utils/offlineStorage.ts
    
    // IndexedDB configuration
    const DB_NAME = 'mindMapDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'mindMapData';

    // IndexedDB setup function
    const initDB = () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      });
    };

    const MIND_MAP_DATA_KEY = 'mindMapData';

    // Save mind map data to IndexedDB
    export const saveMindMapDataOffline = async (data: any): Promise<boolean> => {
      try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);

          // Add timestamp for synchronization
          const dataWithTimestamp = {
            ...data,
            lastModified: new Date().toISOString()
          };

          const request = store.put(dataWithTimestamp);

          request.onsuccess = () => {
            console.log('Mind map data saved to IndexedDB');
            resolve(true);
          };

          request.onerror = () => {
            console.error('Error saving to IndexedDB:', request.error);
            reject(request.error);
          };
        });
      } catch (error) {
        console.error('Error accessing IndexedDB:', error);
        return false;
      }
    };

    // Load mind map data from IndexedDB
    export const loadMindMapDataOffline = async () => {
      try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.getAll();

          request.onsuccess = () => {
            const data = request.result;
            console.log('Mind map data loaded from IndexedDB');
            resolve(data.length > 0 ? data[0] : null);
          };

          request.onerror = () => {
            console.error('Error loading from IndexedDB:', request.error);
            reject(request.error);
          };
        });
      } catch (error) {
        console.error('Error accessing IndexedDB:', error);
        return null;
      }
    };

    // Get all pending changes that need to be synced
    export const getPendingChanges = async () => {
      try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_NAME], 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.getAll();

          request.onsuccess = () => {
            const data = request.result;
            // Filter for unsynced changes
            const pendingChanges = data.filter(item => !item.synced);
            resolve(pendingChanges);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      } catch (error) {
        console.error('Error getting pending changes:', error);
        return [];
      }
    };
  `;
  write_to_file("src/utils/offlineStorage.ts", offline_storage_utils_content);
  if (file_write_successful) {
    log("Offline data storage utilities implemented (LocalStorage example).");
    return Success;
  } else {
    log_error("Offline data storage implementation failed.");
    return Error("Offline data storage implementation failed.");
  }
}

// Function: implementDataSynchronization
// Implements data synchronization with S3 bucket (background sync and initial load)
function implementDataSynchronization(): Result<Success, Error> {
  // Vitest test example:
  // describe('Data Synchronization', () => {
  //   it('should sync data to S3', async () => {
  //     const mockS3Upload = vi.fn().mockResolvedValue({ success: true });
  //     vi.mocked(AWS.S3).mockImplementation(() => ({
  //       upload: mockS3Upload
  //     }));
  //
  //     const testData = { nodes: [{ id: '1', text: 'Test' }], links: [] };
  //     const result = await syncMindMapDataToS3(testData);
  //     expect(result).toBe(true);
  //     expect(mockS3Upload).toHaveBeenCalled();
  //   });
  //
  //   it('should sync data from S3', async () => {
  //     const testData = { nodes: [{ id: '1', text: 'Test' }], links: [] };
  //     const mockS3Get = vi.fn().mockResolvedValue({ Body: JSON.stringify(testData) });
  //     vi.mocked(AWS.S3).mockImplementation(() => ({
  //       getObject: mockS3Get
  //     }));
  //
  //     const result = await loadMindMapDataFromS3();
  //     expect(result).toEqual(testData);
  //   });
  //
  //   it('should handle offline initialization correctly', async () => {
  //     // Mock S3 failure
  //     vi.mocked(loadMindMapDataFromS3).mockResolvedValue(null);
  //     // Mock local data
  //     const localData = { nodes: [{ id: '2', text: 'Offline' }], links: [] };
  //     vi.mocked(loadMindMapDataOffline).mockReturnValue(localData);
  //
  //     const result = await initializeMindMapData();
  //     expect(result).toEqual(localData);
  //   });
  // });

  log("Implementing data synchronization with S3...");
  s3_sync_service_content = `
    // src/services/s3SyncService.ts (Example - needs full implementation)
    import { listBuckets } from './s3Service'; // Example import from s3Service.ts (SETUP-001)
    import { saveMindMapDataOffline, loadMindMapDataOffline } from '../utils/offlineStorage'; // Import offline storage utils

    export const syncMindMapDataToS3 = async (mindMapData: any) => { // Type as MindMapData
      try {
        console.log("Attempting to sync mind map data to S3...", mindMapData);
        // ... Implement logic to save mindMapData to S3 bucket
        // ... Use AWS SDK and S3 credentials from .env
        // ... Handle success and failure scenarios
        console.log("Mind map data synced to S3 successfully.");
        return true;
      } catch (error) {
        console.error("Error syncing mind map data to S3:", error);
        return false;
      }
    };

    export const loadMindMapDataFromS3 = async () => {
      try {
        console.log("Loading mind map data from S3...");
        // ... Implement logic to load mind map data from S3 bucket
        // ... Use AWS SDK and S3 credentials from .env
        // ... Handle success and failure scenarios
        const s3Data = { nodes: [], links: [] }; // Placeholder - replace with actual S3 data retrieval
        console.log("Mind map data loaded from S3.");
        return s3Data;
      } catch (error) {
        console.error("Error loading mind map data from S3:", error);
        return null;
      }
    };

    export const initializeMindMapData = async () => {
      try {
        // 1. Initialize IndexedDB
        await initDB();
        
        // 2. Try to load data from S3
        let mindMapData = await loadMindMapDataFromS3();

        // 3. If S3 load successful, save to IndexedDB
        if (mindMapData) {
          await saveMindMapDataOffline({
            ...mindMapData,
            synced: true
          });
        } else {
          // 4. If S3 load fails, try to load from IndexedDB
          mindMapData = await loadMindMapDataOffline();
        }

        // 5. If still no data, initialize with empty data
        if (!mindMapData) {
          mindMapData = {
            id: 'initial',
            nodes: [],
            links: [],
            synced: true,
            lastModified: new Date().toISOString()
          };
          await saveMindMapDataOffline(mindMapData);
        }

        return mindMapData;
      } catch (error) {
        console.error('Error initializing mind map data:', error);
        // Return empty data structure as fallback
        return {
          id: 'initial',
          nodes: [],
          links: [],
          synced: true,
          lastModified: new Date().toISOString()
        };
      }
    };


    // Background sync function with conflict resolution
    export const syncMindMapData = async () => {
      try {
        const pendingChanges = await getPendingChanges();
        if (pendingChanges.length === 0) {
          console.log("No changes to sync");
          return;
        }

        // Get latest S3 data for conflict resolution
        const s3Data = await loadMindMapDataFromS3();
        
        for (const change of pendingChanges) {
          let syncNeeded = true;

          // Simple conflict resolution: Compare timestamps if S3 data exists
          if (s3Data && s3Data.lastModified) {
            const s3Timestamp = new Date(s3Data.lastModified).getTime();
            const changeTimestamp = new Date(change.lastModified).getTime();

            if (s3Timestamp > changeTimestamp) {
              // S3 has newer data, fetch and update local
              await saveMindMapDataOffline({
                ...s3Data,
                synced: true
              });
              syncNeeded = false;
            }
          }

          if (syncNeeded) {
            // Upload local changes to S3
            const syncSuccess = await syncMindMapDataToS3({
              ...change,
              lastModified: new Date().toISOString()
            });

            if (syncSuccess) {
              // Mark as synced in IndexedDB
              await saveMindMapDataOffline({
                ...change,
                synced: true
              });
              console.log("Background sync completed successfully");
            } else {
              console.error("Background sync failed");
              // Schedule retry through service worker
              if ('serviceWorker' in navigator && 'sync' in registration) {
                await registration.sync.register('sync-mindmap');
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during sync:", error);
        // Schedule retry
        if ('serviceWorker' in navigator && 'sync' in registration) {
          await registration.sync.register('sync-mindmap');
        }
      }
    };
  `;
  write_to_file("src/services/s3SyncService.ts", s3_sync_service_content);
  if (file_write_successful) {
    log("Data synchronization services implemented (S3 and offline).");
    return Success;
  } else {
    log_error("Data synchronization implementation failed.");
    return Error("Data synchronization implementation failed.");
  }
}

// Function: defineConflictResolutionStrategy
// Defines a basic conflict resolution strategy (e.g., last write wins, or more complex merge)
function defineConflictResolutionStrategy(): Result<Success, Error> {
  // Vitest test example:
  // describe('Conflict Resolution Strategy', () => {
  //   it('should define last-write-wins strategy', async () => {
  //     const result = await defineConflictResolutionStrategy();
  //     expect(result.isSuccess()).toBe(true);
  //
  //     const strategyDoc = await fs.readFile('docs/conflict_resolution_strategy.md', 'utf8');
  //     expect(strategyDoc).toContain('Last Write Wins');
  //     expect(strategyDoc).toContain('Future considerations');
  //   });
  //
  //   it('should handle last-write-wins conflict resolution', async () => {
  //     // Test applying the strategy in practice
  //     const localData = { version: 2, nodes: [{ id: '1', text: 'Local' }] };
  //     const remoteData = { version: 1, nodes: [{ id: '1', text: 'Remote' }] };
  //     const resolved = resolveConflict(localData, remoteData);
  //     expect(resolved).toEqual(localData); // Local wins as it's newer
  //   });
  // });

  log("Defining conflict resolution strategy (basic 'last write wins' for now)...");
  conflict_resolution_strategy_doc = `
    // Documentation: Conflict Resolution Strategy

    // For this initial phase, a simple "Last Write Wins" strategy will be used for conflict resolution.
    // When synchronizing data between local offline storage and the remote S3 bucket:

    // - On Upload (Local to S3):  If there are conflicts (unlikely with single-user scenario, but possible in future),
    //   the latest version of the mind map data from the local storage will overwrite the data in the S3 bucket.

    // - On Download (S3 to Local): When loading data from S3, the data from S3 will overwrite the local offline data.

    // This is a basic strategy and may need to be refined in future phases for collaborative scenarios
    // or to implement more sophisticated merging logic.

    // Future considerations for conflict resolution:
    // - Versioning of mind map data
    // - User-driven conflict resolution UI
    // - Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs) for collaborative editing
  `;
  write_to_file("docs/conflict_resolution_strategy.md", conflict_resolution_strategy_doc); // Or specs/docs?
  if (file_write_successful) {
    log("Basic conflict resolution strategy defined (Last Write Wins) and documented.");
    return Success;
  } else {
    log_error("Conflict resolution strategy definition failed.");
    return Error("Conflict resolution strategy definition failed.");
  }
}


// Function: runSetupPhase4
// Orchestrates all setup steps for phase 4
function runSetupPhase4(): Result<Success, AggregateError> {
  log("Starting Phase 4 Setup: Offline Capabilities and Synchronization");
  results = [];

  result = registerServiceWorker();
  results.push(result);
  if (result is Error) { log_error("Service worker registration setup failed, phase may proceed with limited offline capabilities."); } // Non-critical for initial setup

  result = implementOfflineDataStorage();
  results.push(result);
  if (result is Error) { log_error("Offline data storage implementation failed, offline persistence will be limited."); } // Non-critical

  result = implementDataSynchronization();
  results.push(result);
  if (result is Error) { log_error("Data synchronization implementation failed, online sync will be broken."); return AggregateError(results); } // More critical

  result = defineConflictResolutionStrategy();
  results.push(result);
  if (result is Error) { log_error("Conflict resolution strategy definition failed, needs documentation."); } // Non-critical


  if (all_results_successful(results)) {
    log("Phase 4 Setup: Offline Capabilities and Synchronization completed successfully.");
    return Success;
  } else {
    log_error("Phase 4 Setup: Offline Capabilities and Synchronization completed with potential issues.");
    return AggregateError(results);
  }
}

runSetupPhase4();