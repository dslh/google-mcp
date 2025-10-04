import type { GoogleAPIs } from '../index.js';
import type { CalendarListItem, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';

export async function listCalendars(
  _args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const response = await apis.calendar.calendarList.list();

    const calendars: CalendarListItem[] =
      response.data.items?.map((cal) => ({
        id: cal.id!,
        summary: cal.summary || 'No name',
        description: cal.description || undefined,
        timeZone: cal.timeZone || undefined,
        primary: cal.primary || undefined,
      })) || [];

    return {
      success: true,
      data: {
        calendars,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
