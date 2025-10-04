/**
 * Google OAuth 2.0 scopes required for different operations
 */

export const SCOPES = {
  // Drive scopes
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
  DRIVE: 'https://www.googleapis.com/auth/drive',
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',

  // Docs scopes
  DOCUMENTS: 'https://www.googleapis.com/auth/documents',
  DOCUMENTS_READONLY: 'https://www.googleapis.com/auth/documents.readonly',

  // Calendar scopes
  CALENDAR: 'https://www.googleapis.com/auth/calendar',
  CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
  CALENDAR_EVENTS: 'https://www.googleapis.com/auth/calendar.events',
} as const;

/**
 * Default scopes required for the MCP server
 * Uses more restricted scopes where possible
 */
export const DEFAULT_SCOPES = [
  SCOPES.DRIVE, // Need full drive access for listing/reading files
  SCOPES.DOCUMENTS,
  SCOPES.CALENDAR,
] as const;

/**
 * Scope groups for specific features
 */
export const SCOPE_GROUPS = {
  drive: [SCOPES.DRIVE],
  docs: [SCOPES.DOCUMENTS],
  calendar: [SCOPES.CALENDAR],
  readonly: [SCOPES.DRIVE_READONLY, SCOPES.DOCUMENTS_READONLY, SCOPES.CALENDAR_READONLY],
} as const;
