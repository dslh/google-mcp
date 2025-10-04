# Troubleshooting Guide

Common issues and solutions for the Google MCP Server.

## Authentication Issues

### "Not authenticated. Please run the OAuth flow first."

**Cause**: No stored credentials found.

**Solution**:
```bash
npm start -- --auth
```

Follow the browser prompts to authorize the application.

---

### "Failed to refresh authentication token"

**Cause**: Refresh token is invalid or expired (happens after 7 days in test mode).

**Solution**:
```bash
# Revoke old credentials
npm start -- --revoke

# Re-authenticate
npm start -- --auth
```

---

### "Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"

**Cause**: Environment variables not set.

**Solution**:
1. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your credentials from Google Cloud Console
3. Or set them inline:
   ```bash
   GOOGLE_CLIENT_ID=your_id GOOGLE_CLIENT_SECRET=your_secret npm start -- --auth
   ```

---

## Google API Errors

### 401 Unauthorized

**Cause**: Token expired or insufficient permissions.

**Solution**:
1. Server should auto-refresh tokens. If it doesn't:
   ```bash
   npm start -- --auth
   ```
2. Check that all required scopes are granted in OAuth consent screen

---

### 403 Forbidden

**Cause**: Insufficient permissions or API not enabled.

**Solution**:
1. Verify APIs are enabled in [Google Cloud Console](https://console.cloud.google.com/):
   - Google Drive API
   - Google Docs API
   - Google Calendar API
2. Re-authenticate to ensure all scopes are granted:
   ```bash
   npm start -- --auth
   ```

---

### 404 Not Found

**Cause**: File/document/event ID doesn't exist or you don't have access.

**Solution**:
1. Verify the ID is correct
2. Check that you have access to the resource
3. For Drive files, check if the file is in trash

---

### 429 Rate Limit Exceeded

**Cause**: Too many requests to Google APIs.

**Solution**:
1. Wait a moment and try again
2. The server will automatically retry with exponential backoff
3. For heavy usage, consider implementing caching or batching

---

## Tool-Specific Issues

### Drive: "File not found"

**Common causes**:
- Wrong file ID
- File is in trash
- File is not shared with the authenticated account

**Solution**:
1. Use `drive_list_files` to find the correct file ID
2. Check file permissions in Google Drive web UI
3. Ensure file isn't in trash

---

### Docs: "Invalid document ID"

**Common causes**:
- Using Drive file ID instead of document ID (they're the same, but format matters)
- Document doesn't exist
- No access to document

**Solution**:
1. Get document ID from URL: `https://docs.google.com/document/d/DOCUMENT_ID/edit`
2. Verify you have access to the document
3. Use `drive_get_file_metadata` to check the file exists

---

### Calendar: "Calendar not found"

**Common causes**:
- Wrong calendar ID
- Calendar not shared with authenticated account
- Using email as calendar ID for a calendar you don't own

**Solution**:
1. Use `calendar_list_calendars` to get available calendar IDs
2. Use `"primary"` for your main calendar
3. Check calendar sharing settings

---

## Build and Installation Issues

### "Cannot find module '@modelcontextprotocol/sdk'"

**Cause**: Dependencies not installed.

**Solution**:
```bash
npm install
npm run build
```

---

### TypeScript compilation errors

**Cause**: TypeScript version mismatch or corrupted `node_modules`.

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### "Error: Cannot find module" when running

**Cause**: Project not built or incorrect path.

**Solution**:
```bash
npm run build
```

Make sure you're running `node dist/index.js`, not `node src/index.ts`.

---

## Claude Desktop Integration Issues

### Tools not appearing in Claude Desktop

**Cause**: Server not configured correctly or not running.

**Solution**:
1. Check Claude Desktop config file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Verify config format:
   ```json
   {
     "mcpServers": {
       "google": {
         "command": "node",
         "args": ["/absolute/path/to/google-mcp/dist/index.js"],
         "env": {
           "GOOGLE_CLIENT_ID": "your_client_id",
           "GOOGLE_CLIENT_SECRET": "your_client_secret"
         }
       }
     }
   }
   ```
3. **Use absolute paths**, not relative
4. Restart Claude Desktop completely
5. Check Claude Desktop logs for errors

---

### "Server failed to start" in Claude Desktop

**Cause**: Incorrect path, missing dependencies, or authentication issues.

**Solution**:
1. Test the server manually:
   ```bash
   cd /path/to/google-mcp
   GOOGLE_CLIENT_ID=your_id GOOGLE_CLIENT_SECRET=your_secret npm start
   ```
2. If authentication error, run:
   ```bash
   npm start -- --auth
   ```
3. Check Claude Desktop logs for specific error
4. Ensure environment variables are set in config

---

## Port Conflicts

### "Error: listen EADDRINUSE: address already in use :::3000"

**Cause**: Port 3000 is being used by another application (only during `--auth`).

**Solution**:
1. Stop the other application using port 3000, or
2. Change the redirect URI:
   ```bash
   # In .env
   GOOGLE_REDIRECT_URI=http://localhost:3001/oauth/callback
   ```
3. Update authorized redirect URI in Google Cloud Console to match

---

## Token Storage Issues

### "Failed to save authentication tokens"

**Cause**: Permission issues or disk full.

**Solution**:
1. Check disk space
2. Verify write permissions:
   ```bash
   ls -la ~/.google-mcp/
   ```
3. Manually create directory:
   ```bash
   mkdir -p ~/.google-mcp
   chmod 700 ~/.google-mcp
   ```

---

### "Failed to load tokens"

**Cause**: Corrupted token file.

**Solution**:
1. Delete tokens and re-authenticate:
   ```bash
   rm ~/.google-mcp/tokens.json
   npm start -- --auth
   ```

---

## Logging and Debugging

### Enable debug logging

Set `LOG_LEVEL=debug` in `.env` or:

```bash
LOG_LEVEL=debug npm start
```

This will show:
- OAuth flow details
- API requests/responses
- Token refresh events
- Detailed error information

---

### Check server logs

Logs are written to stderr. In Claude Desktop, check:
- macOS: `~/Library/Logs/Claude/mcp-server-google.log`
- Windows: `%APPDATA%\Claude\Logs\mcp-server-google.log`

---

## Google Cloud Console Issues

### "Access Not Configured"

**Cause**: Required API not enabled.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Enable:
   - Google Drive API
   - Google Docs API
   - Google Calendar API

---

### "invalid_grant" error

**Cause**: Refresh token revoked or expired.

**Solution**:
```bash
npm start -- --auth
```

Re-authorize the application.

---

## Getting Help

If you're still experiencing issues:

1. **Check the logs** with `LOG_LEVEL=debug`
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Error message
   - Steps to reproduce
   - Debug logs (remove sensitive info)
   - Environment (OS, Node version)

## Useful Commands

```bash
# Re-authenticate
npm start -- --auth

# Revoke credentials
npm start -- --revoke

# Debug mode
LOG_LEVEL=debug npm start

# Test server manually
npm start

# Rebuild
npm run build

# Check Node.js version (needs >= 20)
node --version

# Verify dependencies
npm list
```

## Common File Locations

- **Tokens**: `~/.google-mcp/tokens.json`
- **Config**: `.env` in project root
- **Claude Desktop config**:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- **Server code**: `dist/index.js`
