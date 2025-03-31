import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vite 6 default settings for code splitting
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
