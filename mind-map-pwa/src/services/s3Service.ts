// src/services/s3Service.ts
// Import the polyfill first to ensure global is defined
import '../utils/globalPolyfill';

// Dynamically import AWS SDK only if needed
import { logInfo, logError, logWarn } from '../utils/logger';

// Define variables outside the conditional block
let s3: any = null;
let S3_BUCKET_NAME = '';
let isInitializing = false;
let initPromise: Promise<boolean> | null = null;

// Check if S3 is configured
const isS3Configured = () => {
  return !!(import.meta.env.VITE_S3_ENDPOINT &&
    import.meta.env.VITE_S3_ACCESS_KEY_ID &&
    import.meta.env.VITE_S3_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_S3_BUCKET_NAME);
};

// Initialize S3 client
const initializeS3 = async (): Promise<boolean> => {
  if (!isS3Configured()) {
    logWarn('S3 is not configured. S3 functionality will be disabled.');
    return false;
  }

  if (s3) return true;
  if (isInitializing) return initPromise!;

  isInitializing = true;
  initPromise = (async () => {
    try {
      // Get environment variables
      const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT as string;
      const S3_ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID as string;
      const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY as string;
      S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME as string;

      // Dynamically import AWS SDK
      const AWS = await import('aws-sdk');

      // Initialize S3 client
      s3 = new AWS.S3({
        endpoint: S3_ENDPOINT,
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
        signatureVersion: 'v4',
        s3ForcePathStyle: true, // Needed for non-AWS S3 endpoints
        region: 'us-east-1', // Default region
      });

      // Test connection by listing buckets
      try {
        await s3.headBucket({ Bucket: S3_BUCKET_NAME }).promise();
        logInfo('S3 client initialized and bucket access confirmed');
        return true;
      } catch (bucketError) {
        logError('Failed to access S3 bucket:', bucketError);
        s3 = null;
        return false;
      }
    } catch (error) {
      logError('Failed to initialize AWS SDK:', error);
      s3 = null;
      return false;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();

  return initPromise;
};

// Helper function to check if S3 is available and initialize if needed
const checkS3Available = async () => {
  if (!s3) {
    const initialized = await initializeS3();
    if (!initialized) {
      const message = 'S3 is not configured or initialization failed';
      logWarn(message);
      return false;
    }
  }
  return true;
};

export const listBuckets = async () => {
  const isAvailable = await checkS3Available();
  if (!isAvailable) {
    return {
      error: 'S3 is not configured or initialization failed',
      buckets: []
    };
  }

  try {
    const response = await s3.listBuckets().promise();
    if (!response.Buckets || response.Buckets.length === 0) {
      return {
        error: 'No buckets found',
        buckets: []
      };
    }
    logInfo("S3 Buckets:", response.Buckets);
    return {
      buckets: response.Buckets,
      error: null
    };
  } catch (error) {
    const errorMessage = "Error connecting to S3";
    logError(errorMessage, error);
    return {
      error: errorMessage,
      buckets: []
    };
  }
};

export const getBucketContents = async (bucketName: string) => {
  const isAvailable = await checkS3Available();
  if (!isAvailable) {
    return {
      error: 'S3 is not configured or initialization failed',
      contents: []
    };
  }

  try {
    const response = await s3.listObjects({
      Bucket: bucketName || S3_BUCKET_NAME
    }).promise();

    if (!response.Contents || response.Contents.length === 0) {
      return {
        error: 'No contents found in bucket',
        contents: []
      };
    }

    logInfo("Bucket contents:", response.Contents);
    return {
      contents: response.Contents,
      error: null
    };
  } catch (error) {
    const errorMessage = "Error getting bucket contents";
    logError(errorMessage, error);
    return {
      error: errorMessage,
      contents: []
    };
  }
};
