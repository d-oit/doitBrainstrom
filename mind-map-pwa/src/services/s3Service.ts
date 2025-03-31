// src/services/s3Service.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: import.meta.env.VITE_S3_ENDPOINT,
  accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

export const listBuckets = async () => { // Example function to test connection
  try {
    const response = await s3.listBuckets().promise();
    console.log("S3 Buckets:", response.Buckets);
    return response.Buckets;
  } catch (error) {
    console.error("Error connecting to S3:", error);
    throw error;
  }
};

export const getBucketContents = async (bucketName: string) => {
  try {
    const response = await s3.listObjects({
      Bucket: bucketName || import.meta.env.VITE_S3_BUCKET_NAME
    }).promise();
    console.log("Bucket contents:", response.Contents);
    return response.Contents;
  } catch (error) {
    console.error("Error getting bucket contents:", error);
    throw error;
  }
};
