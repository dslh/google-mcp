# Requirements Document: Google Services MCP Server

## 1. Project Overview

**Name**: `google-mcp`

**Purpose**: A focused, trustworthy MCP server providing essential Google Drive, Docs, and Calendar integration for AI assistants.

**Design Philosophy**:
- **Minimal Surface Area**: Only expose tools that provide clear value
- **Security First**: Proper OAuth 2.0 with secure token storage
- **Composability**: Each tool should do one thing well
- **User Control**: Explicit permissions, clear scope requirements
- **Production Ready**: Proper error handling, logging, and token refresh

## 2. Technology Stack

**Language**: TypeScript (Node.js runtime)

**Core Dependencies**:
- `@modelcontextprotocol/sdk` - Official MCP SDK
- `googleapis` - Official Google APIs Node.js client
- `google-auth-library` - OAuth 2.0 authentication

**Development Dependencies**:
- TypeScript 5.x
- Node.js 20.x LTS (minimum)
- ESLint, Prettier for code quality

## 3. Authentication & Authorization

**OAuth 2.0 Flow**:
- Support for both OAuth 2.0 (user auth) and Service Accounts (server-to-server)
- Persistent token storage with automatic refresh
- Clear scope documentation for users
- Handle OAuth consent screen properly (published app, not test mode)

**Required Scopes** (minimal set):
- Drive: `https://www.googleapis.com/auth/drive.file` (files created/opened by app)
- Docs: `https://www.googleapis.com/auth/documents`
- Calendar: `https://www.googleapis.com/auth/calendar`

**Alternative Broader Scopes** (if needed):
- Drive (full): `https://www.googleapis.com/auth/drive`
- Drive (readonly): `https://www.googleapis.com/auth/drive.readonly`

**Configuration**:
- Environment variables or config file for client credentials
- Secure token storage (encrypted local file or system keychain)
- Support for multiple Google accounts (future)

## 4. API Coverage

### 4.1 Google Drive Tools (7 tools)

**Essential Operations**:
1. `drive_list_files` - List/search files with filters (name, type, modified date, folder)
   - Parameters: query, maxResults, orderBy, pageToken
   - Returns: List of file metadata (id, name, mimeType, modifiedTime, webViewLink)

2. `drive_get_file_metadata` - Get file metadata
   - Parameters: fileId
   - Returns: Full file metadata including permissions, parents, size

3. `drive_read_file` - Download/read file content (text files, JSON, CSV, Docs, Sheets as export)
   - Parameters: fileId, mimeType (for export)
   - Returns: File content as text/base64

4. `drive_create_file` - Create new file with content
   - Parameters: name, content, mimeType, folderId (optional)
   - Returns: Created file metadata

5. `drive_update_file` - Update existing file content
   - Parameters: fileId, content
   - Returns: Updated file metadata

6. `drive_create_folder` - Create folder
   - Parameters: name, parentFolderId (optional)
   - Returns: Folder metadata

7. `drive_share_file` - Share file/folder with permissions
   - Parameters: fileId, email, role (reader/writer/commenter)
   - Returns: Permission metadata

**Out of Scope** (too complex/niche):
- Batch operations
- Comments/revisions management
- Advanced permission management (domain sharing, groups)
- File watching/change notifications
- Trash management

### 4.2 Google Docs Tools (6 tools)

**Essential Operations**:
1. `docs_read_document` - Read full document as structured text/markdown
   - Parameters: documentId, format (text/markdown)
   - Returns: Document content with basic formatting

2. `docs_create_document` - Create new document with content
   - Parameters: title, content
   - Returns: Document ID and metadata

3. `docs_append_content` - Append content to existing document
   - Parameters: documentId, content
   - Returns: Success confirmation

4. `docs_replace_content` - Replace text in document (find/replace)
   - Parameters: documentId, findText, replaceText, matchCase (optional)
   - Returns: Number of replacements made

5. `docs_insert_content` - Insert content at specific location
   - Parameters: documentId, content, index
   - Returns: Success confirmation

6. `docs_get_structure` - Get document outline/heading structure
   - Parameters: documentId
   - Returns: Document outline with headings and indices

**Out of Scope**:
- Complex formatting operations (colors, fonts, advanced styles)
- Image insertion/management
- Table manipulation
- Collaborative editing features (suggestions, comments)
- Named ranges

### 4.3 Google Calendar Tools (7 tools)

**Essential Operations**:
1. `calendar_list_events` - List events with date/time filters
   - Parameters: calendarId, timeMin, timeMax, maxResults, query
   - Returns: List of events with details

2. `calendar_get_event` - Get event details
   - Parameters: calendarId, eventId
   - Returns: Full event details

3. `calendar_create_event` - Create event with attendees
   - Parameters: calendarId, summary, start, end, description, attendees, location
   - Returns: Created event details

4. `calendar_update_event` - Update event details
   - Parameters: calendarId, eventId, updates (summary, start, end, etc.)
   - Returns: Updated event details

5. `calendar_delete_event` - Delete event
   - Parameters: calendarId, eventId
   - Returns: Success confirmation

6. `calendar_find_free_time` - Find available time slots
   - Parameters: calendarId, timeMin, timeMax, duration
   - Returns: List of available time slots

7. `calendar_list_calendars` - List accessible calendars
   - Parameters: none
   - Returns: List of calendars with metadata

**Out of Scope**:
- Complex recurring event patterns (advanced RRULE)
- Calendar sharing/ACL management
- Conferencing integration (Meet links) - may add later
- Multiple attendee availability (freebusy for multiple calendars)

## 5. Tool Design Principles

**Each tool should**:
- Have a clear, single responsibility
- Accept structured parameters (JSON schema)
- Return consistent, well-formatted responses
- Include proper error handling with actionable messages
- Document required OAuth scopes
- Validate inputs before API calls

**Response Format**:
- Structured data (JSON) for programmatic use
- Include relevant metadata (IDs, URLs, timestamps)
- Human-readable error messages
- Indicate quota/rate limit status when relevant

**Error Handling Philosophy**:
- Fail fast with clear error messages
- Distinguish between user errors and system errors
- Provide actionable remediation steps
- Never expose sensitive information in errors

## 6. Error Handling

**Categories**:
1. **Auth Errors**: Token expired, insufficient permissions
   - Auto-refresh token when possible
   - Clear message about re-authentication if needed
   - Specify missing scopes

2. **API Errors**: Rate limits, quota exceeded, not found
   - Respect rate limits (exponential backoff)
   - Clear message about quota issues
   - Helpful 404 messages

3. **Validation Errors**: Invalid parameters, missing required fields
   - Validate before API call
   - Clear message about what's wrong
   - Include expected format/values

4. **Network Errors**: Timeouts, connection failures
   - Retry with exponential backoff
   - Clear message about network issues
   - Fail after reasonable attempts

**Error Response Format**:
```json
{
  "error": true,
  "errorType": "AuthError" | "APIError" | "ValidationError" | "NetworkError",
  "message": "Human-readable error message",
  "details": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "requiredScopes": ["https://www.googleapis.com/auth/drive"],
    "remediation": "Please re-authenticate with Drive access"
  }
}
```

## 7. Security Considerations

**Sensitive Data**:
- Never log access tokens or refresh tokens
- Encrypt token storage at rest
- Clear tokens on revocation
- Support token rotation
- Use secure file permissions (0600) for token files

**Scope Minimization**:
- Only request necessary scopes
- Document why each scope is needed
- Allow users to review permissions before granting
- Consider using restricted scopes (e.g., drive.file vs drive)

**Input Validation**:
- Sanitize file paths and IDs
- Validate MIME types against allowlist
- Prevent path traversal attacks
- Limit file sizes for uploads
- Rate limit tool calls if needed

**OAuth Security**:
- Use PKCE (Proof Key for Code Exchange) for OAuth flow
- Validate redirect URIs
- Use state parameter to prevent CSRF
- Store client secret securely (never in code)

## 8. Testing Strategy

**Unit Tests**:
- Tool parameter validation
- Response formatting
- Error handling logic
- Token storage encryption/decryption

**Integration Tests**:
- OAuth flow (mocked)
- Google API calls (mocked with realistic responses)
- Token refresh scenarios
- Error handling paths

**Manual Testing**:
- End-to-end flows with real Google account
- Test with Claude Desktop
- Verify all tools work as documented
- Test error scenarios (expired tokens, rate limits, etc.)

**Test Coverage Goals**:
- >80% code coverage
- 100% of error handling paths
- All tool parameters validated
- All response formats verified

## 9. Documentation

**Required Documentation**:
1. **README.md**: Quick start, installation, authentication setup
2. **TOOLS.md**: Detailed tool reference with examples
3. **OAUTH_SETUP.md**: Step-by-step OAuth configuration guide
4. **TROUBLESHOOTING.md**: Common issues and solutions
5. **CONTRIBUTING.md**: Development setup and contribution guidelines

**Each Tool Documentation Should Include**:
- Purpose and use cases
- Required parameters and types
- Optional parameters with defaults
- Response structure with examples
- Example usage (with Claude)
- Required OAuth scopes
- Common errors and solutions

## 10. Project Structure

```
google-mcp/
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── auth/
│   │   ├── oauth-client.ts         # OAuth 2.0 implementation
│   │   ├── token-store.ts          # Secure token storage
│   │   └── scopes.ts               # Scope definitions
│   ├── tools/
│   │   ├── drive/
│   │   │   ├── list-files.ts
│   │   │   ├── get-file-metadata.ts
│   │   │   ├── read-file.ts
│   │   │   ├── create-file.ts
│   │   │   ├── update-file.ts
│   │   │   ├── create-folder.ts
│   │   │   └── share-file.ts
│   │   ├── docs/
│   │   │   ├── read-document.ts
│   │   │   ├── create-document.ts
│   │   │   ├── append-content.ts
│   │   │   ├── replace-content.ts
│   │   │   ├── insert-content.ts
│   │   │   └── get-structure.ts
│   │   ├── calendar/
│   │   │   ├── list-events.ts
│   │   │   ├── get-event.ts
│   │   │   ├── create-event.ts
│   │   │   ├── update-event.ts
│   │   │   ├── delete-event.ts
│   │   │   ├── find-free-time.ts
│   │   │   └── list-calendars.ts
│   │   └── index.ts                # Tool registry
│   ├── types/
│   │   ├── schema.ts               # Tool parameter schemas
│   │   └── responses.ts            # Response type definitions
│   └── utils/
│       ├── error-handler.ts        # Error handling utilities
│       ├── logger.ts               # Logging utilities
│       └── validators.ts           # Input validation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── TOOLS.md
│   ├── OAUTH_SETUP.md
│   └── TROUBLESHOOTING.md
├── .env.example                    # Example environment variables
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

## 11. Development Phases

### Phase 1: Foundation (Days 1-2)
- Project setup (TypeScript, dependencies, linting)
- OAuth 2.0 implementation
- Token storage mechanism
- Basic MCP server skeleton
- Logging and error handling infrastructure

**Deliverables**:
- Working OAuth flow
- Secure token storage
- MCP server that starts and responds to initialization

### Phase 2: Google Drive (Days 3-4)
- Implement all 7 Drive tools
- Unit tests for Drive tools
- Integration tests with mocked Drive API
- Documentation for Drive tools

**Deliverables**:
- All Drive tools functional
- Tests passing
- TOOLS.md documentation for Drive

### Phase 3: Google Docs (Days 5-6)
- Implement all 6 Docs tools
- Unit tests for Docs tools
- Integration tests with mocked Docs API
- Documentation for Docs tools

**Deliverables**:
- All Docs tools functional
- Tests passing
- TOOLS.md documentation for Docs

### Phase 4: Google Calendar (Days 7-8)
- Implement all 7 Calendar tools
- Unit tests for Calendar tools
- Integration tests with mocked Calendar API
- Documentation for Calendar tools

**Deliverables**:
- All Calendar tools functional
- Tests passing
- TOOLS.md documentation for Calendar

### Phase 5: Polish & Documentation (Days 9-10)
- Comprehensive error handling review
- End-to-end testing with Claude Desktop
- Complete all documentation
- Performance optimization
- Security review

**Deliverables**:
- Complete README.md
- OAUTH_SETUP.md guide
- TROUBLESHOOTING.md
- All tests passing
- Ready for release

## 12. Success Criteria

**Functional**:
- ✅ All 20 defined tools work reliably
- ✅ OAuth flow is smooth and secure
- ✅ Token refresh works automatically
- ✅ Works with Claude Desktop
- ✅ Handles errors gracefully

**Quality**:
- ✅ >80% test coverage
- ✅ Clear, comprehensive documentation
- ✅ No security vulnerabilities
- ✅ Proper error messages
- ✅ Code passes linting

**User Experience**:
- ✅ Easy setup (<15 minutes)
- ✅ Intuitive tool names and parameters
- ✅ Helpful error messages
- ✅ Stable and reliable
- ✅ Fast response times

## 13. Future Enhancements (Out of Scope for v1)

**Potential v2 Features**:
- Gmail integration (read, send, search emails)
- Google Sheets integration (read, write, formulas)
- Multi-user support with account switching
- Batch operations for efficiency
- File watching/change notifications
- Google Meet link creation in Calendar
- Advanced Docs formatting (tables, images)
- Caching for frequently accessed data
- Metrics and usage tracking

**Nice-to-Have**:
- Web UI for OAuth flow
- CLI for testing tools
- Docker container for easy deployment
- Homebrew formula for installation
- npx support for zero-install usage

## 14. Dependencies and Versions

**Core Dependencies**:
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "googleapis": "^140.0.0",
  "google-auth-library": "^9.0.0"
}
```

**Development Dependencies**:
```json
{
  "typescript": "^5.3.0",
  "@types/node": "^20.0.0",
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "prettier": "^3.1.0",
  "vitest": "^1.0.0",
  "@vitest/coverage-v8": "^1.0.0"
}
```

## 15. Configuration

**Environment Variables**:
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
TOKEN_STORAGE_PATH=~/.google-mcp/tokens.json
LOG_LEVEL=info
```

**Config File** (optional, `.google-mcp/config.json`):
```json
{
  "auth": {
    "clientId": "...",
    "clientSecret": "...",
    "redirectUri": "http://localhost:3000/oauth/callback"
  },
  "storage": {
    "tokenPath": "~/.google-mcp/tokens.json",
    "encrypt": true
  },
  "logging": {
    "level": "info",
    "file": "~/.google-mcp/server.log"
  },
  "scopes": [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/calendar"
  ]
}
```

## 16. Performance Considerations

**Response Time Goals**:
- Simple operations (get metadata): <500ms
- Read operations (read file/doc): <2s
- Write operations (create/update): <3s
- List operations: <2s for first page

**Optimization Strategies**:
- Cache Google API client instances
- Reuse authenticated connections
- Implement request deduplication
- Use partial responses (fields parameter)
- Paginate large result sets
- Stream large file downloads

**Resource Limits**:
- Max file size for read: 10MB (configurable)
- Max file size for upload: 5MB (configurable)
- Max results per list: 100 (configurable)
- Request timeout: 30s

## 17. Compliance and Privacy

**Data Handling**:
- No data is stored except OAuth tokens
- No user data is logged
- No analytics or telemetry
- All data processing is local

**OAuth Compliance**:
- Follow Google's OAuth 2.0 policies
- Use official Google libraries
- Implement proper scope requests
- Support token revocation

**Open Source**:
- MIT License (or Apache 2.0)
- Public GitHub repository
- Clear contribution guidelines
- Semantic versioning
