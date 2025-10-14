// Test setup file for JSON Viewer extension tests
import { beforeEach, vi } from 'vitest';

// Mock Chrome APIs
global.chrome = {
  devtools: {
    network: {
      onRequestFinished: {
        addListener: vi.fn(),
      },
    },
    panels: {
      create: vi.fn(),
    },
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
