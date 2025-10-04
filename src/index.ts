#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { createOAuthClient } from './auth/oauth-client.js';
import { logger } from './utils/logger.js';
import { handleError } from './utils/error-handler.js';
import { tools, handleToolCall } from './tools/index.js';

class GoogleMCPServer {
  private server: Server;
  private oauthClient;

  constructor() {
    this.server = new Server(
      {
        name: 'google-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize OAuth client
    this.oauthClient = createOAuthClient();

    // Set up request handlers
    this.setupHandlers();

    logger.info('Google MCP Server initialized');
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logger.debug(`Tool called: ${name}`, args);

        // Get authenticated Google API client
        const auth = await this.oauthClient.getClient();

        // Initialize Google API clients
        const drive = google.drive({ version: 'v3', auth });
        const docs = google.docs({ version: 'v1', auth });
        const calendar = google.calendar({ version: 'v3', auth });

        // Handle the tool call
        const result = await handleToolCall(name, args || {}, { drive, docs, calendar });

        logger.debug(`Tool result: ${name}`, result);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorResponse = handleError(error);
        logger.error(`Tool error: ${name}`, errorResponse);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(errorResponse, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    // Check if authenticated
    const isAuthenticated = await this.oauthClient.isAuthenticated();

    if (!isAuthenticated) {
      logger.warn('Not authenticated. Please run authentication first.');
      logger.warn('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
      logger.warn('Then run: node dist/index.js --auth');
      throw new Error('Not authenticated');
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('Google MCP Server running on stdio');
  }
}

// Handle CLI arguments
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--auth') || args.includes('-a')) {
    // Run authentication flow
    logger.info('Starting authentication flow...');
    const oauthClient = createOAuthClient();
    await oauthClient.authenticate();
    logger.info('Authentication complete. You can now start the server.');
    process.exit(0);
  } else if (args.includes('--revoke') || args.includes('-r')) {
    // Revoke credentials
    logger.info('Revoking credentials...');
    const oauthClient = createOAuthClient();
    await oauthClient.revoke();
    logger.info('Credentials revoked.');
    process.exit(0);
  } else if (args.includes('--help') || args.includes('-h')) {
    console.error(`
Google MCP Server

Usage:
  google-mcp                 Start the MCP server
  google-mcp --auth          Run OAuth authentication flow
  google-mcp --revoke        Revoke stored credentials
  google-mcp --help          Show this help message

Environment Variables:
  GOOGLE_CLIENT_ID           OAuth 2.0 client ID (required)
  GOOGLE_CLIENT_SECRET       OAuth 2.0 client secret (required)
  GOOGLE_REDIRECT_URI        OAuth redirect URI (default: http://localhost:3000/oauth/callback)
  TOKEN_STORAGE_PATH         Path to store tokens (default: ~/.google-mcp/tokens.json)
  LOG_LEVEL                  Logging level: debug, info, warn, error (default: info)
    `);
    process.exit(0);
  } else {
    // Start the MCP server
    const server = new GoogleMCPServer();
    await server.run();
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    logger.error('Fatal error:', { message: error.message, stack: error.stack });
    console.error('\nError:', error.message);
  } else {
    logger.error('Fatal error:', error);
    console.error('\nError:', error);
  }
  process.exit(1);
});
