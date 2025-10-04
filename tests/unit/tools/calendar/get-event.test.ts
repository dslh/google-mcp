import { describe, it, expect, vi } from 'vitest';
import { getEvent } from '../../../../src/tools/calendar/get-event.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockCalendarEvent } from '../../../fixtures/calendar-fixtures.js';

describe('calendar/get-event', () => {
  it('should get event by ID', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.get).mockResolvedValue(createGaxiosResponse(mockCalendarEvent));

    const result = await getEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('event-123');
    expect(result.data?.summary).toBe('Test Meeting');
    expect(apis.calendar.events.get).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
    });
  });

  it('should validate calendarId is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await getEvent(
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

    const result = await getEvent(
      {
        calendarId: 'primary',
        eventId: '',
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('eventId');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Event not found');
    (error as any).code = 404;
    vi.mocked(apis.calendar.events.get).mockRejectedValue(error);

    const result = await getEvent(
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
