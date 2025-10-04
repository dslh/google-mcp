import { describe, it, expect, vi } from 'vitest';
import { listEvents } from '../../../../src/tools/calendar/list-events.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockCalendarEventsList } from '../../../fixtures/calendar-fixtures.js';

describe('calendar/list-events', () => {
  it('should list events with default parameters', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse(mockCalendarEventsList)
    );

    const result = await listEvents({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.events).toHaveLength(2);
    expect(apis.calendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      })
    );
  });

  it('should list events with custom calendar ID', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse(mockCalendarEventsList)
    );

    await listEvents({ calendarId: 'work@example.com' }, apis);

    expect(apis.calendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'work@example.com',
      })
    );
  });

  it('should list events with time range', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse(mockCalendarEventsList)
    );

    await listEvents(
      {
        timeMin: '2024-01-01T00:00:00Z',
        timeMax: '2024-01-31T23:59:59Z',
      },
      apis
    );

    expect(apis.calendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        timeMin: '2024-01-01T00:00:00Z',
        timeMax: '2024-01-31T23:59:59Z',
      })
    );
  });

  it('should list events with custom maxResults', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse(mockCalendarEventsList)
    );

    await listEvents({ maxResults: 50 }, apis);

    expect(apis.calendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        maxResults: 50,
      })
    );
  });

  it('should list events with search query', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse(mockCalendarEventsList)
    );

    await listEvents({ query: 'team meeting' }, apis);

    expect(apis.calendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'team meeting',
      })
    );
  });

  it('should validate timeMin format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await listEvents({ timeMin: 'invalid-date' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('timeMin');
  });

  it('should validate timeMax format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await listEvents({ timeMax: 'invalid-date' }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('timeMax');
  });

  it('should validate maxResults bounds', async () => {
    const apis = createMockGoogleAPIs();

    const result = await listEvents({ maxResults: 300 }, apis);

    expect(result.error).toBe(true);
    expect(result.message).toContain('maxResults');
  });

  it('should handle empty results', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse({ items: [] })
    );

    const result = await listEvents({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.events).toEqual([]);
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Calendar not found');
    (error as any).code = 404;
    vi.mocked(apis.calendar.events.list).mockRejectedValue(error);

    const result = await listEvents({}, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
