// src/services/s3Service.ts
// Import the polyfill first to ensure global is defined
import '../utils/globalPolyfill';

// Dynamically import AWS SDK only if needed
import { logInfo, logError, logWarn } from '../utils/logger';
import { NetworkError } from '../utils/errorHandler';

// Check if S3 is configured
const isS3Configured = () => {
  return !!(import.meta.env.VITE_S3_ENDPOINT &&
    import.meta.env.VITE_S3_ACCESS_KEY_ID &&
    import.meta.env.VITE_S3_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_S3_BUCKET_NAME);
};

// Initialize S3 client only if configured
let s3: any = null;
let S3_BUCKET_NAME = '';

if (isS3Configured()) {
  try {
    // Get environment variables
    const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT as string;
    const S3_ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID as string;
    const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY as string;
    S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME as string;

    // Dynamically import AWS SDK
    import('aws-sdk').then(AWS => {
      // Initialize S3 client
      s3 = new AWS.S3({
        endpoint: S3_ENDPOINT,
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
        signatureVersion: 'v4',
      });
      logInfo('S3 client initialized successfully');
    }).catch(error => {
      logError('Failed to initialize AWS SDK:', error);
    });
  } catch (error) {
    logError('Error initializing S3 client:', error);
  }
} else {
  logWarn('S3 is not configured. S3 functionality will be disabled.');
}

// Helper function to check if S3 is available
const checkS3Available = () => {
  if (!s3) {
    const message = 'S3 is not configured or initialization failed';
    logWarn(message);
    return false;
  }
  return true;
};

export const listBuckets = async () => { // Example function to test connection
  if (!checkS3Available()) {
    // Return special error object when S3 is not available
    return { error: 'S3 is not configured or initialization failed', buckets: [] };
  }

  try {
    const response = await s3.listBuckets().promise();
    logInfo("S3 Buckets:", response.Buckets);
    return { buckets: response.Buckets || [], error: null }; // Ensure we always return an array
  } catch (error) {
    const errorMessage = "Error connecting to S3";
    logError(errorMessage, error);
    // Return error object with empty buckets array
    return { error: errorMessage, buckets: [] };
  }
};

export const getBucketContents = async (bucketName: string) => {
  if (!checkS3Available()) {
    // Return special error object when S3 is not available
    return { error: 'S3 is not configured or initialization failed', contents: [] };
  }

  try {
    const response = await s3.listObjects({
      Bucket: bucketName || S3_BUCKET_NAME
    }).promise();
    logInfo("Bucket contents:", response.Contents);
    return { contents: response.Contents || [], error: null }; // Ensure we always return an array
  } catch (error) {
    const errorMessage = "Error getting bucket contents";
    logError(errorMessage, error);
    // Return error object with empty contents array
    return { error: errorMessage, contents: [] };
  }
};
