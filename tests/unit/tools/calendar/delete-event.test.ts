import { describe, it, expect, vi } from 'vitest';
import { deleteEvent } from '../../../../src/tools/calendar/delete-event.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('calendar/delete-event', () => {
  it('should delete event successfully', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.delete).mockResolvedValue(createGaxiosResponse(undefined));

    const result = await deleteEvent(
      {
        calendarId: 'primary',
        eventId: 'event-123',
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.eventId).toBe('event-123');
    expect(result.data?.message).toContain('deleted successfully');
    expect(apis.calendar.events.delete).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event-123',
    });
  });

  it('should validate calendarId is provided', async () => {
    const apis = createMockGoogleAPIs();

    const result = await deleteEvent(
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

    const result = await deleteEvent(
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
    vi.mocked(apis.calendar.events.delete).mockRejectedValue(error);

    const result = await deleteEvent(
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
