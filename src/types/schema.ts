/**
 * Type definitions for tool parameters and responses
 */

export type ErrorType = 'AuthError' | 'APIError' | 'ValidationError' | 'NetworkError';

export interface ErrorResponse {
  error: true;
  errorType: ErrorType;
  message: string;
  details?: {
    code?: string;
    requiredScopes?: string[];
    remediation?: string;
    [key: string]: unknown;
  };
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export type ToolResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Drive Types
export interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  parents?: string[];
}

export interface ListFilesParams {
  query?: string;
  maxResults?: number;
  orderBy?: string;
  pageToken?: string;
}

export interface GetFileMetadataParams {
  fileId: string;
}

export interface ReadFileParams {
  fileId: string;
  mimeType?: string;
}

export interface CreateFileParams {
  name: string;
  content: string;
  mimeType?: string;
  folderId?: string;
}

export interface UpdateFileParams {
  fileId: string;
  content: string;
}

export interface CreateFolderParams {
  name: string;
  parentFolderId?: string;
}

export interface ShareFileParams {
  fileId: string;
  email: string;
  role: 'reader' | 'writer' | 'commenter';
}

// Docs Types
export interface ReadDocumentParams {
  documentId: string;
  format?: 'text' | 'markdown';
}

export interface CreateDocumentParams {
  title: string;
  content?: string;
}

export interface AppendContentParams {
  documentId: string;
  content: string;
}

export interface ReplaceContentParams {
  documentId: string;
  findText: string;
  replaceText: string;
  matchCase?: boolean;
}

export interface InsertContentParams {
  documentId: string;
  content: string;
  index: number;
}

export interface GetStructureParams {
  documentId: string;
}

export interface DocumentStructure {
  headings: Array<{
    level: number;
    text: string;
    index: number;
  }>;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  htmlLink?: string;
}

export interface ListEventsParams {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  query?: string;
}

export interface GetEventParams {
  calendarId: string;
  eventId: string;
}

export interface CreateEventParams {
  calendarId?: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
  attendees?: string[];
  location?: string;
}

export interface UpdateEventParams {
  calendarId: string;
  eventId: string;
  summary?: string;
  start?: string;
  end?: string;
  description?: string;
  attendees?: string[];
  location?: string;
}

export interface DeleteEventParams {
  calendarId: string;
  eventId: string;
}

export interface FindFreeTimeParams {
  calendarId?: string;
  timeMin: string;
  timeMax: string;
  duration: number; // in minutes
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface CalendarListItem {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  primary?: boolean;
}
