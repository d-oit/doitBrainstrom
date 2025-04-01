# Mind Map PWA - Conflict Resolution Strategy

## Overview

This document outlines the conflict resolution strategy used in the Mind Map PWA application when synchronizing data between local storage (IndexedDB) and remote storage (S3 bucket). The strategy ensures data consistency across devices and handles scenarios where changes are made both online and offline.

## Current Implementation: Last Write Wins

For the initial phase of the application, a simple "Last Write Wins" strategy is implemented for conflict resolution. This approach was chosen for its simplicity and effectiveness in single-user scenarios:

### Synchronization Process

1. **Local to Remote (Upload)**:
   - When changes are made locally, they are saved to IndexedDB with a timestamp and marked as unsynced.
   - When online, the application attempts to sync these changes to S3.
   - If there are conflicts (multiple devices editing the same mind map), the latest version (based on timestamp) will overwrite the older version.

2. **Remote to Local (Download)**:
   - When loading data from S3, the application compares the timestamp of the S3 data with the local data.
   - If the S3 data is newer, it overwrites the local data.
   - If the local data is newer, it is uploaded to S3.

### Conflict Detection

Conflicts are detected by comparing the `lastModified` timestamp of the local and remote data. This timestamp is updated whenever changes are made to the mind map.

### Limitations

The "Last Write Wins" strategy has some limitations:

- It does not preserve changes made by multiple users simultaneously.
- It may lead to data loss if two users edit the same mind map offline and then sync.
- It does not provide a way for users to manually resolve conflicts.
- It doesn't handle partial updates or selective merging of changes.
- It assumes that newer changes are always more important than older ones.

## Enhanced Conflict Resolution Implementation

The application now implements a more sophisticated conflict resolution system with the following features:

1. **Version Vectors for Conflict Detection**:
   - Each change is tracked with a version vector that records the state of the document.
   - Conflicts are detected by comparing version vectors rather than simple timestamps.
   - This allows for more accurate conflict detection in distributed scenarios.

2. **Conflict Resolution UI**:
   - When conflicts are detected, a visual diff interface is presented to the user.
   - Users can choose which changes to keep or merge changes manually.
   - The UI respects the current theme settings, including high contrast mode for accessibility.

3. **Automatic Merging of Non-Conflicting Changes**:
   - Changes to different parts of the mind map are automatically merged.
   - Only direct conflicts (same node/link modified differently) require manual resolution.
   - This reduces the need for user intervention in most cases.

4. **Offline Operation Queue**:
   - Changes made offline are stored in a prioritized queue.
   - Operations are applied in order when connectivity is restored.
   - The queue is persisted across browser sessions for reliability.

5. **Configurable Retry Logic**:
   - Failed sync operations are retried with exponential backoff.
   - Retry intervals and maximum attempts are configurable via environment variables.
   - Users are notified of sync status and retry attempts.

## Future Considerations

For future versions of the application, even more advanced conflict resolution strategies could be implemented:

1. **Operational Transformation (OT)**:
   - Track individual operations (add node, delete link, etc.) rather than just the final state.
   - Transform operations to preserve user intent when applied in different orders.
   - Suitable for real-time collaborative editing.

2. **Conflict-Free Replicated Data Types (CRDTs)**:
   - Use data structures that can be concurrently edited without conflicts.
   - Each operation is designed to be commutative, associative, and idempotent.
   - Eliminates the need for explicit conflict resolution in many cases.

3. **Full Version Control**:
   - Maintain a complete history of versions for each mind map.
   - Allow users to view and restore previous versions.
   - Provide a UI for comparing and merging different versions.

## Implementation Notes

The current implementation uses the following components:

- `s3SyncService.ts`: Handles synchronization between IndexedDB and S3.
- `dbService.ts`: Provides functions for interacting with IndexedDB.
- `MindMapContext.tsx`: Manages the mind map state and triggers synchronization.
- `offlineStorage.ts`: Manages local data persistence and retrieval.
- `serviceWorker.ts`: Handles background synchronization when online.

The conflict resolution logic is primarily implemented in the `syncMindMapData` function in `s3SyncService.ts`.

### Synchronization Process Details

1. **Data Structure**:
   - Each mind map has a unique ID, content (nodes and links), and metadata (lastModified, synced status).
   - The `lastModified` timestamp is updated whenever changes are made.
   - The `synced` flag indicates whether the local data has been synchronized with S3.

2. **Conflict Detection**:
   - Conflicts are detected by comparing timestamps between local and remote data.
   - If both local and remote data have been modified since the last sync, a conflict exists.

3. **Resolution Algorithm**:
   ```typescript
   // Pseudocode for conflict resolution
   function resolveConflict(localData, remoteData) {
     const localTimestamp = new Date(localData.lastModified).getTime();
     const remoteTimestamp = new Date(remoteData.lastModified).getTime();

     if (localTimestamp >= remoteTimestamp) {
       return localData; // Local changes win
     } else {
       return remoteData; // Remote changes win
     }
   }
   ```

4. **Error Handling**:
   - If synchronization fails due to network issues, the operation is queued for retry.
   - The service worker attempts to sync when the connection is restored.
   - Users are notified of sync status through the UI.
