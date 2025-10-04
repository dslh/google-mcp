# OAuth 2.0 Setup Guide

This guide will walk you through setting up OAuth 2.0 credentials for the Google MCP Server.

## Overview

The Google MCP Server uses OAuth 2.0 to securely access your Google Drive, Docs, and Calendar data. You'll need to create a Google Cloud project and OAuth credentials.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "MCP Google Integration")
4. Click "Create"
5. Wait for the project to be created, then select it

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable each of these APIs:
   - **Google Drive API** - Click "Enable"
   - **Google Docs API** - Click "Enable"
   - **Google Calendar API** - Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click "Create"

### Fill in the consent screen details:

**App information:**
- App name: `Google MCP Server` (or your choice)
- User support email: Your email address
- App logo: (Optional)

**App domain:**
- Application home page: (Optional)
- Application privacy policy: (Optional)
- Application terms of service: (Optional)

**Authorized domains:**
- Leave empty for local development

**Developer contact information:**
- Enter your email address

4. Click "Save and Continue"

### Add Scopes:

1. Click "Add or Remove Scopes"
2. Filter for and select:
   - `.../auth/drive` - See, edit, create, and delete all of your Google Drive files
   - `.../auth/documents` - See, create, and edit all your Google Docs documents
   - `.../auth/calendar` - See, edit, share, and permanently delete all calendars you can access using Google Calendar
3. Click "Update"
4. Click "Save and Continue"

### Test Users (if using External type):

1. Click "Add Users"
2. Add your Google account email
3. Click "Add"
4. Click "Save and Continue"

### Review:

1. Review your settings
2. Click "Back to Dashboard"

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "**+ Create Credentials**" → "**OAuth client ID**"
3. Choose application type: **Desktop app**
4. Enter a name: `Google MCP Desktop Client`
5. Click "Create"

### Download Credentials:

1. A dialog will appear with your credentials
2. Note down:
   - **Client ID**: Something like `123456789-abc123.apps.googleusercontent.com`
   - **Client Secret**: Something like `GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ`
3. Click "OK"

## Step 5: Configure the MCP Server

1. In your `google-mcp` directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
   TOKEN_STORAGE_PATH=~/.google-mcp/tokens.json
   LOG_LEVEL=info
   ```

3. **Important**: Never commit `.env` to version control. It's already in `.gitignore`.

## Step 6: Authenticate

Run the authentication flow:

```bash
npm start -- --auth
```

This will:
1. Start a local server on port 3000
2. Print a URL to your terminal
3. Open your browser to authorize the application
4. Save your credentials securely

### What to expect:

1. **Browser opens** with Google sign-in
2. **Choose your account**
3. **Warning screen** (if app is not verified):
   - Click "Advanced"
   - Click "Go to Google MCP Server (unsafe)"
   - This is safe - it's your own app
4. **Review permissions** - Click "Allow"
5. **Success!** - Browser shows "Authentication Successful"
6. **Terminal** shows "Authentication complete"

Your tokens are now saved to `~/.google-mcp/tokens.json` with secure file permissions (0600).

## Step 7: Test the Server

Start the MCP server:

```bash
npm start
```

If authentication was successful, you should see:
```
Google MCP Server running on stdio
```

## Troubleshooting

### "Error: redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match your OAuth credentials.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add: `http://localhost:3000/oauth/callback`
4. Click "Save"
5. Try authenticating again

### "This app isn't verified"

**Problem**: Google shows a warning because your app isn't published/verified.

**Solution**: This is expected for development. Click "Advanced" → "Go to [App Name] (unsafe)". For production use, you'd need to submit your app for verification.

### "Access blocked: This app's request is invalid"

**Problem**: Required APIs might not be enabled or scopes are incorrectly configured.

**Solution**:
1. Verify all three APIs are enabled (Drive, Docs, Calendar)
2. Check that scopes are added to the OAuth consent screen
3. Make sure your Google account is added as a test user (if External)

### Port 3000 is already in use

**Problem**: Another application is using port 3000.

**Solution**:
1. Stop the other application, or
2. Change the redirect URI:
   ```bash
   GOOGLE_REDIRECT_URI=http://localhost:3001/oauth/callback
   ```
3. Update the authorized redirect URI in Google Cloud Console

### Tokens expire after 7 days

**Problem**: In test mode (unverified app), refresh tokens expire after 7 days.

**Solution**:
- Re-run authentication: `npm start -- --auth`
- For production, submit your app for verification in Google Cloud Console

## Publishing Your App (Optional)

To avoid the "unverified app" warning and 7-day token expiration:

1. Go to **APIs & Services** → **OAuth consent screen**
2. Click "Publish App"
3. Click "Prepare for Verification" (if required)
4. Submit for verification (requires privacy policy, terms of service, etc.)

**Note**: This is only necessary if distributing to other users. For personal use, test mode is fine.

## Security Best Practices

1. **Never share your client secret** - Treat it like a password
2. **Don't commit `.env`** - It's in `.gitignore` for a reason
3. **Protect token file** - Tokens are stored with 0600 permissions
4. **Revoke if compromised** - Run `npm start -- --revoke` and delete credentials in Google Cloud Console
5. **Use minimal scopes** - Only request what you need (already done)

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)
