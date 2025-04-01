import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          lodash: ['lodash'],
          react: ['react', 'react-dom'],
          routing: ['react-router', 'react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          vendor: [
            'axios',
            'dayjs',
            'immer',
            'ramda'
          ]
        }
      }
    }
  }
})