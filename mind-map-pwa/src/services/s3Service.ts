// src/services/s3Service.ts
import AWS from 'aws-sdk';
import { logInfo, logError } from '../utils/logger';
import { NetworkError } from '../utils/errorHandler';

// Get environment variables
const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT as string;
const S3_ACCESS_KEY_ID = import.meta.env.VITE_S3_ACCESS_KEY_ID as string;
const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY as string;
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME as string;

const s3 = new AWS.S3({
  endpoint: S3_ENDPOINT,
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

export const listBuckets = async () => { // Example function to test connection
  try {
    const response = await s3.listBuckets().promise();
    logInfo("S3 Buckets:", response.Buckets);
    return response.Buckets;
  } catch (error) {
    const errorMessage = "Error connecting to S3";
    logError(errorMessage, error);
    throw new NetworkError(errorMessage, error as Error);
  }
};

export const getBucketContents = async (bucketName: string) => {
  try {
    const response = await s3.listObjects({
      Bucket: bucketName || S3_BUCKET_NAME
    }).promise();
    logInfo("Bucket contents:", response.Contents);
    return response.Contents;
  } catch (error) {
    const errorMessage = "Error getting bucket contents";
    logError(errorMessage, error);
    throw new NetworkError(errorMessage, error as Error, { bucketName });
  }
};
