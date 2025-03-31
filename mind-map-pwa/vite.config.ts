import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
