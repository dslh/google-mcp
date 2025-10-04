import { describe, it, expect, vi } from 'vitest';
import { findFreeTime } from '../../../../src/tools/calendar/find-free-time.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';

describe('calendar/find-free-time', () => {
  it('should find free time slots with no events', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse({ items: [] })
    );

    const result = await findFreeTime(
      {
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 60,
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.freeSlots).toHaveLength(1);
    expect(result.data?.freeSlots[0]).toEqual({
      start: '2024-01-15T09:00:00.000Z',
      end: '2024-01-15T17:00:00.000Z',
    });
    expect(result.data?.requestedDuration).toBe(60);
  });

  it('should find free time slots between events', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse({
        items: [
          {
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
          },
          {
            start: { dateTime: '2024-01-15T14:00:00Z' },
            end: { dateTime: '2024-01-15T15:00:00Z' },
          },
        ],
      })
    );

    const result = await findFreeTime(
      {
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 60,
      },
      apis
    );

    expect(result.success).toBe(true);
    expect(result.data?.freeSlots).toHaveLength(3);
    // Before first event
    expect(result.data?.freeSlots[0]).toEqual({
      start: '2024-01-15T09:00:00.000Z',
      end: '2024-01-15T10:00:00.000Z',
    });
    // Between events
    expect(result.data?.freeSlots[1]).toEqual({
      start: '2024-01-15T11:00:00.000Z',
      end: '2024-01-15T14:00:00.000Z',
    });
    // After last event
    expect(result.data?.freeSlots[2]).toEqual({
      start: '2024-01-15T15:00:00.000Z',
      end: '2024-01-15T17:00:00.000Z',
    });
  });

  it('should skip slots that are too short for requested duration', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse({
        items: [
          {
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T10:30:00Z' },
          },
          {
            start: { dateTime: '2024-01-15T10:45:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
          },
        ],
      })
    );

    const result = await findFreeTime(
      {
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 60, // Need 60 minutes
      },
      apis
    );

    expect(result.success).toBe(true);
    // Should only include slots before first event and after last event
    expect(result.data?.freeSlots).toHaveLength(2);
    expect(result.data?.freeSlots[0].start).toBe('2024-01-15T09:00:00.000Z');
    expect(result.data?.freeSlots[1].start).toBe('2024-01-15T11:00:00.000Z');
  });

  it('should use custom calendar ID', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.events.list).mockResolvedValue(
      createGaxiosResponse({ items: [] })
    );

    await findFreeTime(
      {
        calendarId: 'work@example.com',
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 30,
      },
      apis
    );

    expect(apis.calendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'work@example.com',
      })
    );
  });

  it('should validate timeMin format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await findFreeTime(
      {
        timeMin: 'invalid-date',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 60,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('timeMin');
  });

  it('should validate timeMax format', async () => {
    const apis = createMockGoogleAPIs();

    const result = await findFreeTime(
      {
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: 'invalid-date',
        duration: 60,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('timeMax');
  });

  it('should validate duration is positive', async () => {
    const apis = createMockGoogleAPIs();

    const result = await findFreeTime(
      {
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 0,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.message).toContain('duration');
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Calendar not found');
    (error as any).code = 404;
    vi.mocked(apis.calendar.events.list).mockRejectedValue(error);

    const result = await findFreeTime(
      {
        timeMin: '2024-01-15T09:00:00Z',
        timeMax: '2024-01-15T17:00:00Z',
        duration: 60,
      },
      apis
    );

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('ValidationError');
  });
});
