import { expect, afterEach, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Make vi available globally
global.vi = vi;

// Setup for each test
beforeEach(() => {
  // Any setup needed before each test
});

// Clean up after each test
afterEach(() => {
  // Clean up any React testing library elements
  cleanup();
  // Reset any mocks
  vi.restoreAllMocks();
});
