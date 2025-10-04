import { promises as fs } from 'fs';
import { dirname } from 'path';
import { homedir } from 'os';
import type { Credentials } from 'google-auth-library';
import { logger } from '../utils/logger.js';

export interface StoredTokens {
  credentials: Credentials;
  timestamp: number;
}

export class TokenStore {
  private tokenPath: string;

  constructor(tokenPath?: string) {
    // Default to ~/.google-mcp/tokens.json
    this.tokenPath =
      tokenPath ||
      process.env.TOKEN_STORAGE_PATH ||
      `${homedir()}/.google-mcp/tokens.json`;

    // Expand ~ to home directory
    if (this.tokenPath.startsWith('~/')) {
      this.tokenPath = this.tokenPath.replace('~', homedir());
    }
  }

  async save(credentials: Credentials): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(this.tokenPath);
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });

      const data: StoredTokens = {
        credentials,
        timestamp: Date.now(),
      };

      // Write with restrictive permissions (0600 = user read/write only)
      await fs.writeFile(this.tokenPath, JSON.stringify(data, null, 2), {
        mode: 0o600,
      });

      logger.info('Tokens saved successfully');
    } catch (error) {
      logger.error('Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  async load(): Promise<Credentials | null> {
    try {
      const content = await fs.readFile(this.tokenPath, 'utf-8');
      const data: StoredTokens = JSON.parse(content);

      logger.debug('Tokens loaded successfully');
      return data.credentials;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('No stored tokens found');
        return null;
      }
      logger.error('Failed to load tokens:', error);
      return null;
    }
  }

  async delete(): Promise<void> {
    try {
      await fs.unlink(this.tokenPath);
      logger.info('Tokens deleted successfully');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error('Failed to delete tokens:', error);
      }
    }
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.tokenPath);
      return true;
    } catch {
      return false;
    }
  }
}
