import { drive_v3, docs_v1, calendar_v3 } from 'googleapis';
import { ToolResponse } from '../types/schema.js';

// Import Drive tools
import { listFiles } from './drive/list-files.js';
import { getFileMetadata } from './drive/get-file-metadata.js';
import { readFile } from './drive/read-file.js';
import { createFile } from './drive/create-file.js';
import { updateFile } from './drive/update-file.js';
import { createFolder } from './drive/create-folder.js';
import { shareFile } from './drive/share-file.js';

// Import Docs tools
import { readDocument } from './docs/read-document.js';
import { createDocument } from './docs/create-document.js';
import { appendContent } from './docs/append-content.js';
import { replaceContent } from './docs/replace-content.js';
import { insertContent } from './docs/insert-content.js';
import { getStructure } from './docs/get-structure.js';

// Import Calendar tools
import { listEvents } from './calendar/list-events.js';
import { getEvent } from './calendar/get-event.js';
import { createEvent } from './calendar/create-event.js';
import { updateEvent } from './calendar/update-event.js';
import { deleteEvent } from './calendar/delete-event.js';
import { findFreeTime } from './calendar/find-free-time.js';
import { listCalendars } from './calendar/list-calendars.js';

export interface GoogleAPIs {
  drive: drive_v3.Drive;
  docs: docs_v1.Docs;
  calendar: calendar_v3.Calendar;
}

type ToolHandler = (args: Record<string, unknown>, apis: GoogleAPIs) => Promise<ToolResponse>;

interface ToolHandlers {
  [key: string]: ToolHandler;
}

export const tools = [
  // Drive tools
  {
    name: 'drive_list_files',
    description:
      'List and search files in Google Drive with optional filters for name, type, folder, and modification date',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query (e.g., "name contains \'report\'", "mimeType=\'application/pdf\'")',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of files to return (default: 10, max: 100)',
        },
        orderBy: {
          type: 'string',
          description:
            'Sort order (e.g., "modifiedTime desc", "name", "createdTime desc")',
        },
        pageToken: {
          type: 'string',
          description: 'Token for pagination to get next page of results',
        },
      },
    },
  },
  {
    name: 'drive_get_file_metadata',
    description: 'Get detailed metadata for a specific file in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file',
        },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'drive_read_file',
    description:
      'Read the contents of a file from Google Drive (text files, Google Docs, Sheets, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file to read',
        },
        mimeType: {
          type: 'string',
          description:
            'MIME type for export (for Google Docs/Sheets/Slides, e.g., "text/plain", "application/pdf")',
        },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'drive_create_file',
    description: 'Create a new file in Google Drive with content',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the file',
        },
        content: {
          type: 'string',
          description: 'The content of the file',
        },
        mimeType: {
          type: 'string',
          description: 'MIME type of the file (default: text/plain)',
        },
        folderId: {
          type: 'string',
          description: 'The ID of the folder to create the file in (optional)',
        },
      },
      required: ['name', 'content'],
    },
  },
  {
    name: 'drive_update_file',
    description: 'Update the contents of an existing file in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file to update',
        },
        content: {
          type: 'string',
          description: 'The new content of the file',
        },
      },
      required: ['fileId', 'content'],
    },
  },
  {
    name: 'drive_create_folder',
    description: 'Create a new folder in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the folder',
        },
        parentFolderId: {
          type: 'string',
          description: 'The ID of the parent folder (optional)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'drive_share_file',
    description: 'Share a file or folder with a specific user',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the file or folder to share',
        },
        email: {
          type: 'string',
          description: 'Email address of the user to share with',
        },
        role: {
          type: 'string',
          description: 'Permission role',
          enum: ['reader', 'writer', 'commenter'],
        },
      },
      required: ['fileId', 'email', 'role'],
    },
  },

  // Docs tools
  {
    name: 'docs_read_document',
    description: 'Read the contents of a Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the Google Doc',
        },
        format: {
          type: 'string',
          description: 'Output format',
          enum: ['text', 'markdown'],
        },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'docs_create_document',
    description: 'Create a new Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the document',
        },
        content: {
          type: 'string',
          description: 'Initial content of the document (optional)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'docs_append_content',
    description: 'Append content to the end of a Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the Google Doc',
        },
        content: {
          type: 'string',
          description: 'Content to append',
        },
      },
      required: ['documentId', 'content'],
    },
  },
  {
    name: 'docs_replace_content',
    description: 'Find and replace text in a Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the Google Doc',
        },
        findText: {
          type: 'string',
          description: 'Text to find',
        },
        replaceText: {
          type: 'string',
          description: 'Text to replace with',
        },
        matchCase: {
          type: 'boolean',
          description: 'Whether to match case (default: false)',
        },
      },
      required: ['documentId', 'findText', 'replaceText'],
    },
  },
  {
    name: 'docs_insert_content',
    description: 'Insert content at a specific position in a Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the Google Doc',
        },
        content: {
          type: 'string',
          description: 'Content to insert',
        },
        index: {
          type: 'number',
          description: 'Position to insert at (1 is after the title)',
        },
      },
      required: ['documentId', 'content', 'index'],
    },
  },
  {
    name: 'docs_get_structure',
    description: 'Get the outline/structure of a Google Doc (headings and their positions)',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The ID of the Google Doc',
        },
      },
      required: ['documentId'],
    },
  },

  // Calendar tools
  {
    name: 'calendar_list_events',
    description: 'List events from Google Calendar within a time range',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'Calendar ID (default: "primary")',
        },
        timeMin: {
          type: 'string',
          description: 'Start time (ISO 8601 format)',
        },
        timeMax: {
          type: 'string',
          description: 'End time (ISO 8601 format)',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of events (default: 10, max: 250)',
        },
        query: {
          type: 'string',
          description: 'Free text search terms',
        },
      },
    },
  },
  {
    name: 'calendar_get_event',
    description: 'Get details of a specific calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'Calendar ID',
        },
        eventId: {
          type: 'string',
          description: 'Event ID',
        },
      },
      required: ['calendarId', 'eventId'],
    },
  },
  {
    name: 'calendar_create_event',
    description: 'Create a new calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'Calendar ID (default: "primary")',
        },
        summary: {
          type: 'string',
          description: 'Event title/summary',
        },
        start: {
          type: 'string',
          description: 'Start time (ISO 8601 format)',
        },
        end: {
          type: 'string',
          description: 'End time (ISO 8601 format)',
        },
        description: {
          type: 'string',
          description: 'Event description (optional)',
        },
        attendees: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Email addresses of attendees (optional)',
        },
        location: {
          type: 'string',
          description: 'Event location (optional)',
        },
      },
      required: ['summary', 'start', 'end'],
    },
  },
  {
    name: 'calendar_update_event',
    description: 'Update an existing calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'Calendar ID',
        },
        eventId: {
          type: 'string',
          description: 'Event ID',
        },
        summary: {
          type: 'string',
          description: 'Event title/summary (optional)',
        },
        start: {
          type: 'string',
          description: 'Start time (ISO 8601 format, optional)',
        },
        end: {
          type: 'string',
          description: 'End time (ISO 8601 format, optional)',
        },
        description: {
          type: 'string',
          description: 'Event description (optional)',
        },
        attendees: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Email addresses of attendees (optional)',
        },
        location: {
          type: 'string',
          description: 'Event location (optional)',
        },
      },
      required: ['calendarId', 'eventId'],
    },
  },
  {
    name: 'calendar_delete_event',
    description: 'Delete a calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'Calendar ID',
        },
        eventId: {
          type: 'string',
          description: 'Event ID',
        },
      },
      required: ['calendarId', 'eventId'],
    },
  },
  {
    name: 'calendar_find_free_time',
    description: 'Find available time slots in a calendar',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: {
          type: 'string',
          description: 'Calendar ID (default: "primary")',
        },
        timeMin: {
          type: 'string',
          description: 'Start of search period (ISO 8601 format)',
        },
        timeMax: {
          type: 'string',
          description: 'End of search period (ISO 8601 format)',
        },
        duration: {
          type: 'number',
          description: 'Desired duration in minutes',
        },
      },
      required: ['timeMin', 'timeMax', 'duration'],
    },
  },
  {
    name: 'calendar_list_calendars',
    description: 'List all accessible calendars',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const toolHandlers: ToolHandlers = {
  // Drive handlers
  drive_list_files: listFiles,
  drive_get_file_metadata: getFileMetadata,
  drive_read_file: readFile,
  drive_create_file: createFile,
  drive_update_file: updateFile,
  drive_create_folder: createFolder,
  drive_share_file: shareFile,

  // Docs handlers
  docs_read_document: readDocument,
  docs_create_document: createDocument,
  docs_append_content: appendContent,
  docs_replace_content: replaceContent,
  docs_insert_content: insertContent,
  docs_get_structure: getStructure,

  // Calendar handlers
  calendar_list_events: listEvents,
  calendar_get_event: getEvent,
  calendar_create_event: createEvent,
  calendar_update_event: updateEvent,
  calendar_delete_event: deleteEvent,
  calendar_find_free_time: findFreeTime,
  calendar_list_calendars: listCalendars,
};

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  const handler = toolHandlers[name];

  if (!handler) {
    return {
      error: true,
      errorType: 'ValidationError',
      message: `Unknown tool: ${name}`,
    };
  }

  return await handler(args, apis);
}
