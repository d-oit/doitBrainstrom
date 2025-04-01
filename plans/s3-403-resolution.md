# S3 403 Resolution Plan

## Environment Configuration
```env
# mind-map-pwa/.env
VITE_S3_ENDPOINT=sdf.XX.idrivee2-7.com
VITE_S3_BUCKET_NAME=bucket
VITE_S3_ACCESS_KEY_ID=xx
VITE_S3_SECRET_ACCESS_KEY=xxx
```

## TypeScript Implementation

```ts
// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_S3_ENDPOINT: string
  readonly VITE_S3_BUCKET_NAME: string
  readonly VITE_S3_ACCESS_KEY_ID: string
  readonly VITE_S3_SECRET_ACCESS_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// src/utils/s3Config.ts
import { S3 } from 'aws-sdk';
import { logError, logWarn } from './logger';

export class S3Config {
  private static instance: S3 | null = null;
  private static isInitializing = false;

  public static async getInstance(): Promise<S3 | null> {
    if (this.instance) return this.instance;
    if (!this.isConfigured()) {
      logWarn('S3 environment variables not configured');
      return null;
    }

    try {
      this.isInitializing = true;
      this.instance = new S3({
        endpoint: import.meta.env.VITE_S3_ENDPOINT,
        credentials: {
          accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY
        },
        signatureVersion: 'v4',
        s3ForcePathStyle: true
      });

      // Verify bucket access
      await this.instance.headBucket({
        Bucket: import.meta.env.VITE_S3_BUCKET_NAME
      }).promise();

      return this.instance;
    } catch (error) {
      logError('S3 initialization failed:', error);
      this.instance = null;
      return null;
    } finally {
      this.isInitializing = false;
    }
  }

  private static isConfigured(): boolean {
    return !!(
      import.meta.env.VITE_S3_ENDPOINT &&
      import.meta.env.VITE_S3_BUCKET_NAME &&
      import.meta.env.VITE_S3_ACCESS_KEY_ID &&
      import.meta.env.VITE_S3_SECRET_ACCESS_KEY
    );
  }
}

// src/hooks/useS3.ts
import { useState, useCallback } from 'react';
import { S3Config } from '../utils/s3Config';

interface UseS3Result {
  isLoading: boolean;
  error: Error | null;
  uploadFile: (key: string, body: AWS.S3.Body) => Promise<void>;
  downloadFile: (key: string) => Promise<AWS.S3.GetObjectOutput>;
}

export function useS3(): UseS3Result {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (key: string, body: AWS.S3.Body) => {
    setIsLoading(true);
    setError(null);
    try {
      const s3 = await S3Config.getInstance();
      if (!s3) throw new Error('S3 not configured');

      await s3.putObject({
        Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
        Key: key,
        Body: body
      }).promise();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const s3 = await S3Config.getInstance();
      if (!s3) throw new Error('S3 not configured');

      return await s3.getObject({
        Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
        Key: key
      }).promise();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, uploadFile, downloadFile };
}
```

## Resolution Steps

1. **Environment Variables**
   - Copy .env.example to .env
   - Update variables with your S3 credentials
   - Environment variables are properly typed in `env.d.ts`

2. **S3 Configuration**
   - Single source of truth through `S3Config` singleton
   - Proper error handling and logging
   - Initialization check with bucket access verification

3. **React Integration**
   - React hook pattern with useS3()
   - Loading and error states for UI feedback
   - TypeScript types for all operations

4. **Error Handling**
   - Proper TypeScript error types
   - Error state management in React
   - Descriptive error messages for debugging

This implementation ensures:
- No hardcoded values
- Type safety with TypeScript
- React 18 patterns with hooks
- Proper error handling
- Environment-based configuration