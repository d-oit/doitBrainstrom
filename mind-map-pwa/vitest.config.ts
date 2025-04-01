/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**/*', 'node_modules/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
    // Optimize for memory usage
    pool: 'forks', // Use separate processes for tests
    poolOptions: {
      forks: {
        isolate: true, // Isolate tests in separate processes
        singleFork: false, // Don't run all tests in a single fork
      },
    },
    maxConcurrency: 2, // Limit concurrent tests to reduce memory pressure
    maxThreads: 2, // Limit threads
    minThreads: 1,
    isolate: true, // Isolate tests
    slowTestThreshold: 5000, // Increase slow test threshold
    testTimeout: 30000, // Increase test timeout
    hookTimeout: 10000, // Increase hook timeout
    teardownTimeout: 10000, // Increase teardown timeout
    // Clean up after each test
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
