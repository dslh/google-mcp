import { describe, it, expect, vi } from 'vitest';
import { updateEvent } from '../../../../src/tools/calendar/update-event.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockCalendarEvent } from '../../../fixtures/calendar-fixtures.js';

describe('calendar/update-event', () => {
  it('should update event summary', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.patch).mockResolvedValue(
      createGaxiosResponse({ ...mockCalendarEvent, summary: 'Updated Meeting' })
    );

    const result = await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
        summary: 'Updated Meeting',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.summary).toBe('Updated Meeting');
    expect(apis.calendar.events.patch).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
      requestBody: {
        summary: 'Updated Meeting',
      },
    });
  });

  it('should update event start and end times', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.patch).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
        start: '2024-02-01T10:00:00Z',
        end: '2024-02-01T11:00:00Z',
      },
      apis
    );

    expect(apis.calendar.events.patch).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
      requestBody: {
        start: { dateTime: '2024-02-01T10:00:00Z' },
        end: { dateTime: '2024-02-01T11:00:00Z' },
      },
    });
  });

  it('should update event description and location', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.patch).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
        description: 'Updated description',
        location: 'New location',
      },
      apis
    );

    expect(apis.calendar.events.patch).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
      requestBody: {
        description: 'Updated description',
        location: 'New location',
      },
    });
  });

  it('should update event attendees', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.patch).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
        attendees: ['new1@example.com', 'new2@example.com'],
      },
      apis
    );

    expect(apis.calendar.events.patch).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
      requestBody: {
        attendees: [{ email: 'new1@example.com' }, { email: 'new2@example.com' }],
      },
    });
  });

  it('should update multiple fields at once', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.patch).mockResolvedValue(
      createGaxiosResponse(mockCalendarEvent)
    );

    await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
        summary: 'New Title',
        start: '2024-02-01T14:00:00Z',
        end: '2024-02-01T15:00:00Z',
        location: 'Virtual',
      },
      apis
    );

    expect(apis.calendar.events.patch).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
      requestBody: {
        summary: 'New Title',
        start: { dateTime: '2024-02-01T14:00:00Z' },
        end: { dateTime: '2024-02-01T15:00:00Z' },
        location: 'Virtual',
      },
    });
  });

  it('should validate calendarId is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await updateEvent(
      {
        calendarId: '',
        eventId: 'event-123',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('calendarId');
  });

  it('should validate eventId is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await updateEvent(
      {
        calendarId: 'primary',
        eventId: '',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('eventId');
  });

  it('should validate start datetime format if provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
        start: 'invalid-date',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('start');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Event not found');
    (error as any).code = 404;
    vi.mocked(apis.calendar.events.patch).mockRejectedValue(error);

    const result = await updateEvent(
      {
        calendarId: 'primary',
        eventId: 'nonexistent',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
