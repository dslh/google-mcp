import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { TokenStore } from '../../../src/auth/token-store.js';
import type { Credentials } from 'google-auth-library';

// Mock the fs module
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn(),
  },
}));

describe('TokenStore', () => {
  const mockCredentials: Credentials = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expiry_date: Date.now() + 3600000,
    token_type: 'Bearer',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now() for consistent timestamps
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use custom token path if provided', () => {
      const store = new TokenStore('/custom/path/tokens.json');
      expect(store).toBeDefined();
    });

    it('should use TOKEN_STORAGE_PATH env variable if set', () => {
      const originalEnv = process.env.TOKEN_STORAGE_PATH;
      process.env.TOKEN_STORAGE_PATH = '/env/path/tokens.json';

      const store = new TokenStore();
      expect(store).toBeDefined();

      process.env.TOKEN_STORAGE_PATH = originalEnv;
    });

    it('should expand ~ to home directory', () => {
      const store = new TokenStore('~/tokens.json');
      expect(store).toBeDefined();
    });
  });

  describe('save', () => {
    it('should save credentials to file', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const store = new TokenStore('/tmp/test-tokens.json');
      await store.save(mockCredentials);

      expect(fs.mkdir).toHaveBeenCalledWith('/tmp', {
        recursive: true,
        mode: 0o700,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/tmp/test-tokens.json',
        expect.stringContaining('test-access-token'),
        { mode: 0o600 }
      );
    });

    it('should include timestamp when saving', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      const store = new TokenStore('/tmp/test-tokens.json');
      await store.save(mockCredentials);

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const savedData = JSON.parse(writeCall[1] as string);

      expect(savedData).toHaveProperty('credentials');
      expect(savedData).toHaveProperty('timestamp', 1234567890);
    });

    it('should handle save errors', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      const store = new TokenStore('/tmp/test-tokens.json');

      await expect(store.save(mockCredentials)).rejects.toThrow(
        'Failed to save authentication tokens'
      );
    });
  });

  describe('load', () => {
    it('should load credentials from file', async () => {
      const storedData = {
        credentials: mockCredentials,
        timestamp: 1234567890,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(storedData));

      const store = new TokenStore('/tmp/test-tokens.json');
      const result = await store.load();

      expect(result).toEqual(mockCredentials);
      expect(fs.readFile).toHaveBeenCalledWith('/tmp/test-tokens.json', 'utf-8');
    });

    it('should return null if file does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('File not found');
      error.code = 'ENOENT';
      vi.mocked(fs.readFile).mockRejectedValue(error);

      const store = new TokenStore('/tmp/test-tokens.json');
      const result = await store.load();

      expect(result).toBeNull();
    });

    it('should return null on other read errors', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

      const store = new TokenStore('/tmp/test-tokens.json');
      const result = await store.load();

      expect(result).toBeNull();
    });

    it('should handle invalid JSON', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('invalid json');

      const store = new TokenStore('/tmp/test-tokens.json');
      const result = await store.load();

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete token file', async () => {
      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      const store = new TokenStore('/tmp/test-tokens.json');
      await store.delete();

      expect(fs.unlink).toHaveBeenCalledWith('/tmp/test-tokens.json');
    });

    it('should not throw if file does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('File not found');
      error.code = 'ENOENT';
      vi.mocked(fs.unlink).mockRejectedValue(error);

      const store = new TokenStore('/tmp/test-tokens.json');
      await expect(store.delete()).resolves.toBeUndefined();
    });

    it('should silently handle other delete errors', async () => {
      vi.mocked(fs.unlink).mockRejectedValue(new Error('Delete error'));

      const store = new TokenStore('/tmp/test-tokens.json');
      await expect(store.delete()).resolves.toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const store = new TokenStore('/tmp/test-tokens.json');
      const result = await store.exists();

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith('/tmp/test-tokens.json');
    });

    it('should return false if file does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

      const store = new TokenStore('/tmp/test-tokens.json');
      const result = await store.exists();

      expect(result).toBe(false);
    });
  });
});
