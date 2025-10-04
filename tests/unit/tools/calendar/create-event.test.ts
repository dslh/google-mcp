import { describe, it, expect, vi } from 'vitest';
import { createEvent } from '../../../../src/tools/calendar/create-event.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockCalendarEvent } from '../../../fixtures/calendar-fixtures.js';

describe('calendar/create-event', () => {
  it('should create event with required parameters', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.insert).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    const result = await createEvent(
      {
        summary: 'Test Meeting',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.eventId).toBe('event-123');
    expect(result.data?.summary).toBe('Test Meeting');
    expect(apis.calendar.events.insert).toHaveBeenCalledWith({
      calendarId: 'primary',
      requestBody: expect.objectContaining({
        summary: 'Test Meeting',
        start: { dateTime: '2024-01-15T10:00:00Z' },
        end: { dateTime: '2024-01-15T11:00:00Z' },
      }),
    });
  });

  it('should create event with custom calendar ID', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.insert).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    await createEvent(
      {
        calendarId: 'work@example.com',
        summary: 'Work Meeting',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
      },
      apis
    );

    expect(apis.calendar.events.insert).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
      requestBody: expect.any(Object),
    });
  });

  it('should create event with all optional parameters', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.insert).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    const result = await createEvent(
      {
        summary: 'Team Meeting',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
        description: 'Weekly team sync',
        location: 'Conference Room A',
        attendees: ['john@example.com', 'jane@example.com'],
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(apis.calendar.events.insert).toHaveBeenCalledWith({
      calendarId: 'primary',
      requestBody: {
        summary: 'Team Meeting',
        description: 'Weekly team sync',
        start: { dateTime: '2024-01-15T10:00:00Z' },
        end: { dateTime: '2024-01-15T11:00:00Z' },
        location: 'Conference Room A',
        attendees: [{ email: 'john@example.com' }, { email: 'jane@example.com' }],
      },
    });
  });

  it('should validate summary is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createEvent(
      {
        summary: '',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('summary');
  });

  it('should validate start datetime format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createEvent(
      {
        summary: 'Meeting',
        start: 'invalid-date',
        end: '2024-01-15T11:00:00Z',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('start');
  });

  it('should validate end datetime format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await createEvent(
      {
        summary: 'Meeting',
        start: '2024-01-15T10:00:00Z',
        end: 'invalid-date',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('end');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Calendar not found');
    (error as any).code = 404;
    vi.mocked(apis.calendar.events.insert).mockRejectedValue(error);

    const result = await createEvent(
      {
        summary: 'Meeting',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });

  it('should handle attendees as empty array', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.insert).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    await createEvent(
      {
        summary: 'Solo Meeting',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
        attendees: [],
      },
      apis
    );

    expect(apis.calendar.events.insert).toHaveBeenCalledWith({
      calendarId: 'primary',
      requestBody: expect.objectContaining({
        attendees: [],
      }),
    });
  });
});
