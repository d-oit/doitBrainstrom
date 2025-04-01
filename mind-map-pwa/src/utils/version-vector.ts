// src/utils/version-vector.ts
import { logInfo, logError } from './logger';

/**
 * Version Vector implementation for conflict detection
 * 
 * A version vector is a map of client IDs to version numbers.
 * It's used to track the state of a document across multiple clients.
 * When two clients have version vectors that are not comparable
 * (neither is a subset of the other), a conflict has occurred.
 */

export interface VersionVector {
  [clientId: string]: number;
}

// Generate a unique client ID
export const generateClientId = (): string => {
  // Use a combination of timestamp, random string, and device info if available
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  
  // Try to get some device-specific information
  let deviceInfo = '';
  try {
    if (navigator.userAgent) {
      // Hash the user agent to keep the ID reasonably short
      deviceInfo = hashString(navigator.userAgent).toString(16);
    }
  } catch (e) {
    // Ignore errors, just use timestamp and random
  }
  
  return `${timestamp}-${random}-${deviceInfo}`;
};

// Get or create a client ID
export const getClientId = (): string => {
  try {
    let clientId = localStorage.getItem('sync_client_id');
    
    if (!clientId) {
      clientId = generateClientId();
      localStorage.setItem('sync_client_id', clientId);
      logInfo('Generated new client ID:', clientId);
    }
    
    return clientId;
  } catch (error) {
    // If localStorage is not available, generate a new ID each time
    logError('Error accessing localStorage for client ID:', error);
    return generateClientId();
  }
};

// Create a new version vector with a single entry for the current client
export const createVersionVector = (): VersionVector => {
  const clientId = getClientId();
  return { [clientId]: 1 };
};

// Increment the version for the current client
export const incrementVersion = (vector: VersionVector): VersionVector => {
  const clientId = getClientId();
  return {
    ...vector,
    [clientId]: (vector[clientId] || 0) + 1
  };
};

// Merge two version vectors, taking the maximum version for each client
export const mergeVersionVectors = (v1: VersionVector, v2: VersionVector): VersionVector => {
  const result: VersionVector = { ...v1 };
  
  // For each client in v2, take the max version
  Object.keys(v2).forEach(clientId => {
    result[clientId] = Math.max(result[clientId] || 0, v2[clientId]);
  });
  
  return result;
};

// Compare two version vectors
// Returns:
// - 'equal' if they are identical
// - 'ancestor' if v1 is an ancestor of v2 (v1 < v2)
// - 'descendant' if v1 is a descendant of v2 (v1 > v2)
// - 'conflict' if they are not comparable (concurrent changes)
export const compareVersionVectors = (
  v1: VersionVector, 
  v2: VersionVector
): 'equal' | 'ancestor' | 'descendant' | 'conflict' => {
  let v1LessThanV2 = false;
  let v2LessThanV1 = false;
  
  // Get all client IDs from both vectors
  const allClients = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  
  for (const clientId of allClients) {
    const v1Version = v1[clientId] || 0;
    const v2Version = v2[clientId] || 0;
    
    if (v1Version < v2Version) {
      v1LessThanV2 = true;
    } else if (v1Version > v2Version) {
      v2LessThanV1 = true;
    }
    
    // If we've found that each vector has at least one version greater than the other,
    // we have a conflict
    if (v1LessThanV2 && v2LessThanV1) {
      return 'conflict';
    }
  }
  
  if (v1LessThanV2 && !v2LessThanV1) {
    return 'ancestor';
  } else if (!v1LessThanV2 && v2LessThanV1) {
    return 'descendant';
  } else {
    return 'equal';
  }
};

// Check if two version vectors are in conflict
export const hasConflict = (v1: VersionVector, v2: VersionVector): boolean => {
  return compareVersionVectors(v1, v2) === 'conflict';
};

// Simple string hashing function
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
