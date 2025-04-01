# S3 403 Resolution Plan

## Environment Configuration
```env
# Required .env variables
S3_ENDPOINT=your-s3-endpoint
S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## TypeScript Implementation

```ts
// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    S3_ENDPOINT: string;
    S3_BUCKET_NAME: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
  }
}

// src/utils/s3Config.ts
import { S3 } from 'aws-sdk';

export class S3Config {
  private static instance: S3;

  public static getInstance(): S3 {
    if (!this.instance) {
      this.validateEnv();
      this.instance = new S3({
        endpoint: process.env.S3_ENDPOINT,
        signatureVersion: 'v4',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
    }
    return this.instance;
  }

  private static validateEnv(): void {
    const required = [
      'S3_ENDPOINT',
      'S3_BUCKET_NAME',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

// src/services/s3Service.ts
export class S3Service {
  private s3 = S3Config.getInstance();

  async getObject(key: string): Promise<AWS.S3.GetObjectOutput> {
    try {
      return await this.s3.getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error(`Failed to get object ${key}: ${error.message}`);
    }
  }

  async uploadObject(key: string, body: AWS.S3.Body): Promise<AWS.S3.PutObjectOutput> {
    try {
      return await this.s3.putObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: body
      }).promise();
    } catch (error) {
      throw new Error(`Failed to upload object ${key}: ${error.message}`);
    }
  }
}