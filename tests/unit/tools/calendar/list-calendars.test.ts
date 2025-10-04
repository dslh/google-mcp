import { describe, it, expect, vi } from 'vitest';
import { listCalendars } from '../../../../src/tools/calendar/list-calendars.js';
import { createMockGoogleAPIs, createGaxiosResponse } from '../../../utils/test-helpers.js';
import { mockCalendarList } from '../../../fixtures/calendar-fixtures.js';

describe('calendar/list-calendars', () => {
  it('should list all calendars', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.calendarList.list).mockResolvedValue(
      createGaxiosResponse(mockCalendarList)
    );

    const result = await listCalendars({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.calendars).toHaveLength(2);
    expect(result.data?.calendars[0].id).toBe('primary');
    expect(result.data?.calendars[0].primary).toBe(true);
    expect(apis.calendar.calendarList.list).toHaveBeenCalled();
  });

  it('should handle empty calendar list', async () => {
    const apis = createMockGoogleAPIs();
    vi.mocked(apis.calendar.calendarList.list).mockResolvedValue(
      createGaxiosResponse({ items: [] })
    );

    const result = await listCalendars({}, apis);

    expect(result.success).toBe(true);
    expect(result.data?.calendars).toEqual([]);
  });

  it('should handle API errors', async () => {
    const apis = createMockGoogleAPIs();
    const error = new Error('Authorization failed');
    (error as any).code = 403;
    vi.mocked(apis.calendar.calendarList.list).mockRejectedValue(error);

    const result = await listCalendars({}, apis);

    expect(result.error).toBe(true);
    expect(result.errorType).toBe('AuthError');
  });
});
