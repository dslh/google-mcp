import { OAuth2Client } from 'google-auth-library';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import type { Credentials } from 'google-auth-library';
import { TokenStore } from './token-store.js';
import { DEFAULT_SCOPES } from './scopes.js';
import { logger } from '../utils/logger.js';
import { createAuthError } from '../utils/error-handler.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  scopes?: string[];
}

export class GoogleOAuthClient {
  private oauth2Client: OAuth2Client;
  private tokenStore: TokenStore;
  private scopes: string[];

  constructor(config: OAuthConfig) {
    const redirectUri = config.redirectUri || 'http://localhost:3000/oauth/callback';

    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      redirectUri
    );

    this.scopes = config.scopes || [...DEFAULT_SCOPES];
    this.tokenStore = new TokenStore();

    logger.debug('OAuth client initialized', {
      redirectUri,
      scopes: this.scopes,
    });
  }

  /**
   * Get an authenticated OAuth2 client
   */
  async getClient(): Promise<OAuth2Client> {
    // Try to load existing tokens
    const tokens = await this.tokenStore.load();

    if (tokens) {
      this.oauth2Client.setCredentials(tokens);

      // Check if token is expired and refresh if needed
      if (this.isTokenExpired(tokens)) {
        logger.info('Token expired, refreshing...');
        await this.refreshToken();
      }

      return this.oauth2Client;
    }

    // No tokens found, need to authenticate
    throw createAuthError(
      'Not authenticated. Please run the OAuth flow first.',
      this.scopes
    );
  }

  /**
   * Start the OAuth flow and get tokens
   */
  async authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        try {
          if (!req.url) {
            res.writeHead(400);
            res.end('Bad request');
            return;
          }

          const url = new URL(req.url, 'http://localhost:3000');

          if (url.pathname === '/oauth/callback') {
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');

            if (error) {
              res.writeHead(400);
              res.end(`Authentication error: ${error}`);
              server.close();
              reject(new Error(`OAuth error: ${error}`));
              return;
            }

            if (!code) {
              res.writeHead(400);
              res.end('No authorization code received');
              server.close();
              reject(new Error('No authorization code'));
              return;
            }

            // Exchange code for tokens
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            await this.tokenStore.save(tokens);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head><title>Authentication Successful</title></head>
                <body>
                  <h1>Authentication Successful!</h1>
                  <p>You can close this window and return to the application.</p>
                </body>
              </html>
            `);

            server.close();
            logger.info('Authentication successful');
            resolve();
          }
        } catch (error) {
          logger.error('OAuth callback error:', error);
          res.writeHead(500);
          res.end('Internal server error');
          server.close();
          reject(error);
        }
      });

      server.listen(3000, () => {
        const authUrl = this.oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: this.scopes,
          prompt: 'consent', // Force consent to get refresh token
        });

        logger.info('Please visit this URL to authenticate:');
        console.error('\n' + authUrl + '\n');
      });

      server.on('error', (error) => {
        logger.error('Server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      await this.tokenStore.save(credentials);
      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw createAuthError('Failed to refresh authentication token. Please re-authenticate.');
    }
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  private isTokenExpired(tokens: Credentials): boolean {
    if (!tokens.expiry_date) {
      return false;
    }

    const expiryTime = tokens.expiry_date;
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return expiryTime - currentTime < fiveMinutes;
  }

  /**
   * Revoke tokens and clear stored credentials
   */
  async revoke(): Promise<void> {
    try {
      await this.oauth2Client.revokeCredentials();
      await this.tokenStore.delete();
      logger.info('Credentials revoked and cleared');
    } catch (error) {
      logger.error('Failed to revoke credentials:', error);
      throw new Error('Failed to revoke credentials');
    }
  }

  /**
   * Check if we have valid credentials
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.tokenStore.load();
      return tokens !== null;
    } catch {
      return false;
    }
  }
}

/**
 * Create an OAuth client from environment variables
 */
export function createOAuthClient(): GoogleOAuthClient {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
    );
  }

  return new GoogleOAuthClient({
    clientId,
    clientSecret,
    redirectUri,
  });
}
