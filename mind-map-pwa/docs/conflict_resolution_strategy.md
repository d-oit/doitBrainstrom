# Mind Map PWA - Conflict Resolution Strategy

## Overview

This document outlines the conflict resolution strategy used in the Mind Map PWA application when synchronizing data between local storage (IndexedDB) and remote storage (S3 bucket).

## Current Implementation: Last Write Wins

For the initial phase of the application, a simple "Last Write Wins" strategy is implemented for conflict resolution:

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

## Future Considerations

For future versions of the application, more sophisticated conflict resolution strategies could be implemented:

1. **Three-Way Merge**:
   - Keep track of the base version (last synced version) and compare both the local and remote changes against it.
   - Automatically merge non-conflicting changes.
   - Provide a UI for users to manually resolve conflicting changes.

2. **Operational Transformation (OT)**:
   - Track individual operations (add node, delete link, etc.) rather than just the final state.
   - Transform operations to preserve user intent when applied in different orders.
   - Suitable for real-time collaborative editing.

3. **Conflict-Free Replicated Data Types (CRDTs)**:
   - Use data structures that can be concurrently edited without conflicts.
   - Each operation is designed to be commutative, associative, and idempotent.
   - Eliminates the need for explicit conflict resolution in many cases.

4. **Version Control**:
   - Maintain a history of versions for each mind map.
   - Allow users to view and restore previous versions.
   - Provide a UI for comparing and merging different versions.

## Implementation Notes

The current implementation uses the following components:

- `s3SyncService.ts`: Handles synchronization between IndexedDB and S3.
- `dbService.ts`: Provides functions for interacting with IndexedDB.
- `MindMapContext.tsx`: Manages the mind map state and triggers synchronization.

The conflict resolution logic is primarily implemented in the `syncMindMapData` function in `s3SyncService.ts`.
