// src/utils/globalPolyfill.ts
// This file provides polyfills for Node.js globals in the browser environment
// It must be imported before any AWS SDK or other Node.js-dependent modules

// Polyfill for Node.js 'global' object
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  (window as any).global = window;
}

// Polyfill for Node.js 'process' object if needed
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Export something to make this a proper module
export const globalPolyfillLoaded = true;
