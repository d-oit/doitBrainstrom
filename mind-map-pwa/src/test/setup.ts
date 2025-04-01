import { expect, afterEach, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { configureObserverMock } from './testUtils';

// Make vi available globally
global.vi = vi;

// Setup for each test
beforeEach(() => {
  // Any setup needed before each test
  configureObserverMock();

  // Clear any timers
  vi.clearAllTimers();

  // Clear any mocks
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  // Clean up any React testing library elements
  cleanup();
  // Reset any mocks
  vi.restoreAllMocks();

  // Force garbage collection hint (not guaranteed to run)
  if (global.gc) {
    global.gc();
  }
});

// Before all tests
beforeAll(() => {
  // Mock console methods to reduce noise
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// After all tests
afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();

  // Force garbage collection hint (not guaranteed to run)
  if (global.gc) {
    global.gc();
  }
});
