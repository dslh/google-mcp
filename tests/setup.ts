import { vi } from 'vitest';

// Mock environment variables
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/oauth/callback';
process.env.TOKEN_STORAGE_PATH = '/tmp/test-tokens.json';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
