import { vi } from 'vitest';
import type { drive_v3, docs_v1, calendar_v3 } from 'googleapis';
import type { GoogleAPIs } from '../../src/tools/index.js';

/**
 * Create a mock GoogleAPIs object for testing
 */
export function createMockGoogleAPIs(): GoogleAPIs {
  return {
    drive: {
      files: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      permissions: {
        create: vi.fn(),
      },
    } as unknown as drive_v3.Drive,
    docs: {
      documents: {
        get: vi.fn(),
        create: vi.fn(),
        batchUpdate: vi.fn(),
      },
    } as unknown as docs_v1.Docs,
    calendar: {
      events: {
        list: vi.fn(),
        get: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      freebusy: {
        query: vi.fn(),
      },
      calendarList: {
        list: vi.fn(),
      },
    } as unknown as calendar_v3.Calendar,
  };
}

/**
 * Create a successful GaxiosResponse wrapper for Google API responses
 */
export function createGaxiosResponse<T>(data: T) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

/**
 * Create a Google API error
 */
export function createGoogleAPIError(code: number, message: string) {
  const error: any = new Error(message);
  error.code = code;
  error.errors = [{ message, domain: 'global', reason: 'error' }];
  return error;
}
