# Google MCP Server

A focused, secure [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server providing Google Drive, Docs, and Calendar integration for AI assistants like Claude.

## Features

- **Minimal & Focused**: 20 carefully chosen tools covering essential Google services operations
- **Secure by Design**: OAuth 2.0 with encrypted token storage and automatic refresh
- **Production Ready**: Comprehensive error handling, validation, and logging
- **Well-Documented**: Clear tool descriptions and detailed setup guides

### Supported Services

- **Google Drive** (7 tools): List, read, create, update files and folders, share files
- **Google Docs** (6 tools): Read, create, modify documents, manage structure
- **Google Calendar** (7 tools): List, create, update, delete events, find free time

## Quick Start

### 1. Installation

```bash
npm install
npm run build
```

### 2. OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Drive, Docs, and Calendar APIs
3. Create OAuth 2.0 credentials
4. Copy `.env.example` to `.env` and fill in your credentials

See [OAUTH_SETUP.md](docs/OAUTH_SETUP.md) for detailed instructions.

### 3. Authenticate

```bash
# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run authentication flow
npm start -- --auth
```

This will open a browser window for you to authorize the application. Once complete, your credentials will be securely stored.

### 4. Use with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "google": {
      "command": "node",
      "args": ["/path/to/google-mcp/dist/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

Restart Claude Desktop, and the Google tools will be available.

## Available Tools

### Google Drive

- `drive_list_files` - List and search files
- `drive_get_file_metadata` - Get detailed file information
- `drive_read_file` - Read file contents
- `drive_create_file` - Create new file
- `drive_update_file` - Update existing file
- `drive_create_folder` - Create folder
- `drive_share_file` - Share file with user

### Google Docs

- `docs_read_document` - Read document contents
- `docs_create_document` - Create new document
- `docs_append_content` - Append to document
- `docs_replace_content` - Find and replace text
- `docs_insert_content` - Insert at position
- `docs_get_structure` - Get document outline

### Google Calendar

- `calendar_list_events` - List events in date range
- `calendar_get_event` - Get event details
- `calendar_create_event` - Create new event
- `calendar_update_event` - Update event
- `calendar_delete_event` - Delete event
- `calendar_find_free_time` - Find available slots
- `calendar_list_calendars` - List all calendars

See [TOOLS.md](docs/TOOLS.md) for detailed tool documentation with examples.

## CLI Usage

```bash
# Start MCP server (for use with Claude Desktop)
npm start

# Authenticate with Google
npm start -- --auth

# Revoke credentials
npm start -- --revoke

# Show help
npm start -- --help
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## Configuration

### Environment Variables

```bash
GOOGLE_CLIENT_ID=your_client_id          # Required
GOOGLE_CLIENT_SECRET=your_client_secret  # Required
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback  # Optional
TOKEN_STORAGE_PATH=~/.google-mcp/tokens.json  # Optional
LOG_LEVEL=info  # Optional: debug, info, warn, error
```

### OAuth Scopes

The server requests these scopes:

- `https://www.googleapis.com/auth/drive` - Full Drive access
- `https://www.googleapis.com/auth/documents` - Docs read/write
- `https://www.googleapis.com/auth/calendar` - Calendar read/write

## Security

- OAuth tokens are stored encrypted at `~/.google-mcp/tokens.json` with file permissions 0600
- Tokens are automatically refreshed before expiration
- No user data is logged or transmitted except to Google APIs
- Client secret should be kept secure and not committed to version control

## Troubleshooting

### "Not authenticated" error

Run `npm start -- --auth` to authenticate.

### Token expired

The server automatically refreshes tokens. If you see auth errors, re-run authentication.

### Google API errors

Check that:
1. APIs are enabled in Google Cloud Console
2. OAuth credentials are correct
3. Redirect URI matches your configuration

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more help.

## Architecture

```
src/
├── index.ts           # MCP server entry point
├── auth/              # OAuth 2.0 implementation
├── tools/             # Tool implementations
│   ├── drive/
│   ├── docs/
│   └── calendar/
├── types/             # TypeScript type definitions
└── utils/             # Error handling, validation, logging
```

## Why This Server?

Existing Google MCP servers often:
- Expose too many tools (overwhelming)
- Mix multiple unrelated services (Gmail, Sheets, etc.)
- Lack proper error handling
- Are published by unknown third parties

This server focuses on:
- **Quality over quantity**: 20 essential tools, not 100 mediocre ones
- **Security**: Proper OAuth 2.0 with token encryption
- **Reliability**: Comprehensive error handling and validation
- **Clarity**: Well-documented, focused feature set

## License

MIT

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure `npm run lint` and `npm test` pass
5. Submit a pull request

## Support

- [Issues](https://github.com/yourusername/google-mcp/issues)
- [Documentation](docs/)
- [MCP Specification](https://modelcontextprotocol.io)

## Roadmap

Potential future additions (not committed):
- Gmail integration
- Google Sheets support
- Batch operations
- Caching for performance
- Web UI for OAuth flow
