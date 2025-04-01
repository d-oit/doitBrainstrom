import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin']
    }
  })],
  define: {
    // S3 Configuration
    'import.meta.env.VITE_S3_ENDPOINT': JSON.stringify(env.VITE_S3_ENDPOINT),
    'import.meta.env.VITE_S3_ACCESS_KEY_ID': JSON.stringify(env.VITE_S3_ACCESS_KEY_ID),
    'import.meta.env.VITE_S3_SECRET_ACCESS_KEY': JSON.stringify(env.VITE_S3_SECRET_ACCESS_KEY),
    'import.meta.env.VITE_S3_BUCKET_NAME': JSON.stringify(env.VITE_S3_BUCKET_NAME),

    // OpenRouter Configuration
    'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY),
    'import.meta.env.VITE_OPENROUTER_BASE_URL': JSON.stringify(env.VITE_OPENROUTER_BASE_URL),
    'import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL': JSON.stringify(env.VITE_OPENROUTER_DEFAULT_MODEL),
  },
  build: {
    // Enhanced code splitting configuration
    rollupOptions: {
      output: {
        // Customize code splitting strategy
        manualChunks: (id) => {
          // Create separate chunks for node_modules
          if (id.includes('node_modules')) {
            // Group Material UI packages together
            if (id.includes('@mui')) {
              return 'vendor-mui';
            }
            // Group React packages together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Separate chunk for AWS SDK
            if (id.includes('aws-sdk')) {
              return 'vendor-aws-sdk';
            }
            // Other dependencies in a separate chunk
            return 'vendor';
          }
          // Create separate chunks for major app features
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/contexts/')) {
            return 'contexts';
          }
          if (id.includes('/utils/')) {
            return 'utils';
          }
        },
      },
    },
    // Enable source map for better debugging in production
    sourcemap: true,
    // Optimize chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
  }
})
