import { expect, afterEach, vi } from 'vitest';

// Make vi available globally
global.vi = vi;

// Mock DOM globals for node environment
global.document = {
  createElement: () => ({
    textContent: '',
    innerHTML: ''
  })
};

// Clean up after each test
afterEach(() => {
  // No cleanup needed in node environment
});
