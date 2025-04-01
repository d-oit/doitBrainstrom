import { vi } from 'vitest';

declare global {
  // Using const instead of var to fix the linting error
  const vi: typeof vi;
}
