import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock import.meta.env for tests
global.import = global.import || {};
global.import.meta = global.import.meta || {};
global.import.meta.env = {
  MODE: 'test',
  VITE_API_URL: '/api',
};
