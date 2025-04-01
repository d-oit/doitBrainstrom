/// <reference types="vite/client" />

interface ImportMetaEnv {
  // S3 Configuration
  readonly VITE_S3_ENDPOINT: string;
  readonly VITE_S3_ACCESS_KEY_ID: string;
  readonly VITE_S3_SECRET_ACCESS_KEY: string;
  readonly VITE_S3_BUCKET_NAME: string;

  // OpenRouter Configuration
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_OPENROUTER_BASE_URL: string;
  readonly VITE_OPENROUTER_DEFAULT_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}