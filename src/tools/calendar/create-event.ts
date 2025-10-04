import type { GoogleAPIs } from '../index.js';
import type { CreateEventParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateCalendarId, validateString, validateDateTime } from '../../utils/validators.js';

export async function createEvent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as CreateEventParams;
    const calendarId = params.calendarId ? validateCalendarId(params.calendarId) : 'primary';
    const summary = validateString(params.summary, 'summary');
    const start = validateDateTime(params.start, 'start');
    const end = validateDateTime(params.end, 'end');

    const response = await apis.calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description: params.description,
        start: {
          dateTime: start,
        },
        end: {
          dateTime: end,
        },
        attendees: params.attendees?.map((email) => ({ email })),
        location: params.location,
      },
    });

    return {
      success: true,
      data: {
        eventId: response.data.id,
        summary: response.data.summary,
        htmlLink: response.data.htmlLink,
        start: response.data.start,
        end: response.data.end,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
