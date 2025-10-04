# Tool Reference

Complete documentation for all 20 Google MCP Server tools.

## Table of Contents

- [Google Drive](#google-drive) (7 tools)
- [Google Docs](#google-docs) (6 tools)
- [Google Calendar](#google-calendar) (7 tools)

---

## Google Drive

### `drive_list_files`

List and search files in Google Drive.

**Parameters:**
- `query` (optional): Search query using Drive query syntax
- `maxResults` (optional): Max files to return (1-100, default: 10)
- `orderBy` (optional): Sort order (e.g., "modifiedTime desc", "name")
- `pageToken` (optional): Token for next page of results

**Example:**
```
List my recent documents
→ Uses: drive_list_files with query "mimeType='application/vnd.google-apps.document'" and orderBy "modifiedTime desc"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "1abc...",
        "name": "My Document",
        "mimeType": "application/vnd.google-apps.document",
        "modifiedTime": "2025-10-04T12:00:00.000Z",
        "webViewLink": "https://docs.google.com/..."
      }
    ],
    "nextPageToken": "..."
  }
}
```

---

### `drive_get_file_metadata`

Get detailed metadata for a specific file.

**Parameters:**
- `fileId` (required): The file ID

**Example:**
```
Get details for file 1abc123
→ Uses: drive_get_file_metadata with fileId "1abc123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1abc123",
    "name": "Report.pdf",
    "mimeType": "application/pdf",
    "size": "524288",
    "createdTime": "2025-10-01T10:00:00.000Z",
    "modifiedTime": "2025-10-04T12:00:00.000Z",
    "owners": [...],
    "permissions": [...]
  }
}
```

---

### `drive_read_file`

Read the contents of a file.

**Parameters:**
- `fileId` (required): The file ID
- `mimeType` (optional): MIME type for export (for Google Docs/Sheets)

**Example:**
```
Read the contents of document 1abc123
→ Uses: drive_read_file with fileId "1abc123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "Meeting Notes",
    "mimeType": "application/vnd.google-apps.document",
    "content": "# Meeting Notes\n\nAttendees: ...\n"
  }
}
```

**Supported file types:**
- Text files (`.txt`, `.md`, `.csv`, etc.)
- Google Docs (exported as text/plain by default)
- Google Sheets (exported as Excel by default)
- Other exportable formats

---

### `drive_create_file`

Create a new file with content.

**Parameters:**
- `name` (required): File name
- `content` (required): File content
- `mimeType` (optional): MIME type (default: text/plain)
- `folderId` (optional): Parent folder ID

**Example:**
```
Create a file called "notes.txt" with content "Hello world"
→ Uses: drive_create_file with name "notes.txt", content "Hello world"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1xyz789",
    "name": "notes.txt",
    "mimeType": "text/plain",
    "webViewLink": "https://drive.google.com/file/d/1xyz789"
  }
}
```

---

### `drive_update_file`

Update the contents of an existing file.

**Parameters:**
- `fileId` (required): File ID to update
- `content` (required): New content

**Example:**
```
Update file 1abc123 with new content
→ Uses: drive_update_file with fileId "1abc123", content "Updated text"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1abc123",
    "name": "notes.txt",
    "modifiedTime": "2025-10-04T13:00:00.000Z"
  }
}
```

---

### `drive_create_folder`

Create a new folder.

**Parameters:**
- `name` (required): Folder name
- `parentFolderId` (optional): Parent folder ID

**Example:**
```
Create a folder called "2025 Reports"
→ Uses: drive_create_folder with name "2025 Reports"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1folder123",
    "name": "2025 Reports",
    "mimeType": "application/vnd.google-apps.folder"
  }
}
```

---

### `drive_share_file`

Share a file or folder with a user.

**Parameters:**
- `fileId` (required): File/folder ID to share
- `email` (required): Email address to share with
- `role` (required): Permission level - `reader`, `writer`, or `commenter`

**Example:**
```
Share file 1abc123 with user@example.com as a reader
→ Uses: drive_share_file with fileId "1abc123", email "user@example.com", role "reader"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "permissionId": "123",
    "emailAddress": "user@example.com",
    "role": "reader",
    "message": "File shared with user@example.com as reader"
  }
}
```

---

## Google Docs

### `docs_read_document`

Read the contents of a Google Doc.

**Parameters:**
- `documentId` (required): Document ID
- `format` (optional): Output format - `text` or `markdown` (default: text)

**Example:**
```
Read document 1abc123 as markdown
→ Uses: docs_read_document with documentId "1abc123", format "markdown"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "1abc123",
    "title": "Project Plan",
    "content": "# Project Plan\n\n## Overview\n\nThis document..."
  }
}
```

---

### `docs_create_document`

Create a new Google Doc.

**Parameters:**
- `title` (required): Document title
- `content` (optional): Initial content

**Example:**
```
Create a document titled "Meeting Notes" with initial content
→ Uses: docs_create_document with title "Meeting Notes", content "Date: 2025-10-04"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "1new123",
    "title": "Meeting Notes",
    "documentUrl": "https://docs.google.com/document/d/1new123/edit"
  }
}
```

---

### `docs_append_content`

Append content to the end of a document.

**Parameters:**
- `documentId` (required): Document ID
- `content` (required): Content to append

**Example:**
```
Add "Next meeting: Friday" to the end of document 1abc123
→ Uses: docs_append_content with documentId "1abc123", content "Next meeting: Friday"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Content appended successfully",
    "documentId": "1abc123"
  }
}
```

---

### `docs_replace_content`

Find and replace text in a document.

**Parameters:**
- `documentId` (required): Document ID
- `findText` (required): Text to find
- `replaceText` (required): Replacement text
- `matchCase` (optional): Case-sensitive matching (default: false)

**Example:**
```
Replace all instances of "TODO" with "DONE" in document 1abc123
→ Uses: docs_replace_content with documentId "1abc123", findText "TODO", replaceText "DONE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Replaced 3 occurrence(s)",
    "replacementCount": 3,
    "documentId": "1abc123"
  }
}
```

---

### `docs_insert_content`

Insert content at a specific position in a document.

**Parameters:**
- `documentId` (required): Document ID
- `content` (required): Content to insert
- `index` (required): Position to insert at (1 = after title)

**Example:**
```
Insert a header at the beginning of document 1abc123
→ Uses: docs_insert_content with documentId "1abc123", content "DRAFT - DO NOT DISTRIBUTE\n\n", index 1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Content inserted at index 1",
    "documentId": "1abc123"
  }
}
```

---

### `docs_get_structure`

Get the outline/heading structure of a document.

**Parameters:**
- `documentId` (required): Document ID

**Example:**
```
Get the outline of document 1abc123
→ Uses: docs_get_structure with documentId "1abc123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "1abc123",
    "title": "Project Plan",
    "structure": {
      "headings": [
        { "level": 1, "text": "Overview", "index": 1 },
        { "level": 2, "text": "Goals", "index": 45 },
        { "level": 2, "text": "Timeline", "index": 123 },
        { "level": 1, "text": "Budget", "index": 234 }
      ]
    }
  }
}
```

---

## Google Calendar

### `calendar_list_events`

List events in a time range.

**Parameters:**
- `calendarId` (optional): Calendar ID (default: "primary")
- `timeMin` (optional): Start time (ISO 8601)
- `timeMax` (optional): End time (ISO 8601)
- `maxResults` (optional): Max events (1-250, default: 10)
- `query` (optional): Free text search

**Example:**
```
Show my events for next week
→ Uses: calendar_list_events with timeMin "2025-10-04T00:00:00Z", timeMax "2025-10-11T00:00:00Z"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event123",
        "summary": "Team Meeting",
        "start": {
          "dateTime": "2025-10-05T10:00:00-07:00",
          "timeZone": "America/Los_Angeles"
        },
        "end": {
          "dateTime": "2025-10-05T11:00:00-07:00"
        },
        "location": "Conference Room A",
        "attendees": [...]
      }
    ]
  }
}
```

---

### `calendar_get_event`

Get details of a specific event.

**Parameters:**
- `calendarId` (required): Calendar ID
- `eventId` (required): Event ID

**Example:**
```
Get details for event event123
→ Uses: calendar_get_event with calendarId "primary", eventId "event123"
```

---

### `calendar_create_event`

Create a new calendar event.

**Parameters:**
- `calendarId` (optional): Calendar ID (default: "primary")
- `summary` (required): Event title
- `start` (required): Start time (ISO 8601)
- `end` (required): End time (ISO 8601)
- `description` (optional): Event description
- `attendees` (optional): Array of email addresses
- `location` (optional): Event location

**Example:**
```
Create a meeting tomorrow at 2pm for 1 hour
→ Uses: calendar_create_event with summary "Team Sync", start "2025-10-05T14:00:00-07:00", end "2025-10-05T15:00:00-07:00"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "newevent123",
    "summary": "Team Sync",
    "htmlLink": "https://calendar.google.com/event?eid=...",
    "start": {
      "dateTime": "2025-10-05T14:00:00-07:00"
    },
    "end": {
      "dateTime": "2025-10-05T15:00:00-07:00"
    }
  }
}
```

---

### `calendar_update_event`

Update an existing event.

**Parameters:**
- `calendarId` (required): Calendar ID
- `eventId` (required): Event ID
- `summary` (optional): New title
- `start` (optional): New start time
- `end` (optional): New end time
- `description` (optional): New description
- `attendees` (optional): New attendees list
- `location` (optional): New location

**Example:**
```
Change the meeting time to 3pm
→ Uses: calendar_update_event with eventId "event123", start "2025-10-05T15:00:00-07:00", end "2025-10-05T16:00:00-07:00"
```

---

### `calendar_delete_event`

Delete an event.

**Parameters:**
- `calendarId` (required): Calendar ID
- `eventId` (required): Event ID

**Example:**
```
Cancel the team meeting
→ Uses: calendar_delete_event with calendarId "primary", eventId "event123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Event deleted successfully",
    "eventId": "event123"
  }
}
```

---

### `calendar_find_free_time`

Find available time slots in a calendar.

**Parameters:**
- `calendarId` (optional): Calendar ID (default: "primary")
- `timeMin` (required): Search start time (ISO 8601)
- `timeMax` (required): Search end time (ISO 8601)
- `duration` (required): Desired duration in minutes

**Example:**
```
Find 30-minute slots available next week
→ Uses: calendar_find_free_time with timeMin "2025-10-07T09:00:00Z", timeMax "2025-10-11T17:00:00Z", duration 30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "freeSlots": [
      {
        "start": "2025-10-07T09:00:00Z",
        "end": "2025-10-07T10:00:00Z"
      },
      {
        "start": "2025-10-07T14:00:00Z",
        "end": "2025-10-07T15:30:00Z"
      }
    ],
    "requestedDuration": 30
  }
}
```

---

### `calendar_list_calendars`

List all accessible calendars.

**Parameters:** None

**Example:**
```
Show all my calendars
→ Uses: calendar_list_calendars
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calendars": [
      {
        "id": "primary",
        "summary": "John Doe",
        "timeZone": "America/Los_Angeles",
        "primary": true
      },
      {
        "id": "team@example.com",
        "summary": "Team Calendar",
        "timeZone": "America/Los_Angeles"
      }
    ]
  }
}
```

---

## Error Responses

All tools return errors in a consistent format:

```json
{
  "error": true,
  "errorType": "AuthError",
  "message": "Token expired",
  "details": {
    "code": "TOKEN_EXPIRED",
    "remediation": "Please re-authenticate by running the OAuth flow again"
  }
}
```

**Error Types:**
- `AuthError` - Authentication/authorization issues
- `APIError` - Google API errors (rate limits, etc.)
- `ValidationError` - Invalid parameters
- `NetworkError` - Network/connectivity issues

## Tips

### Finding File/Document IDs

**From URL:**
- Drive: `https://drive.google.com/file/d/FILE_ID/view`
- Docs: `https://docs.google.com/document/d/DOCUMENT_ID/edit`

**From tool:**
```
Use drive_list_files to search and get IDs
```

### Date/Time Format

All date/time parameters use ISO 8601 format:
- With timezone: `2025-10-04T14:30:00-07:00`
- UTC: `2025-10-04T21:30:00Z`
- Date only: `2025-10-04`

### Search Queries

Drive query syntax examples:
- `name contains 'report'` - Files with "report" in name
- `mimeType='application/pdf'` - PDF files only
- `modifiedTime > '2025-10-01T00:00:00'` - Modified after date
- `'folder_id' in parents` - Files in specific folder

See [Google Drive search](https://developers.google.com/drive/api/guides/search-files) for more.
