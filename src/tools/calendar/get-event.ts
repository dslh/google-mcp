import type { GoogleAPIs } from '../index.js';
import type { GetEventParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateCalendarId, validateString } from '../../utils/validators.js';

export async function getEvent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as GetEventParams;
    const calendarId = validateCalendarId(params.calendarId);
    const eventId = validateString(params.eventId, 'eventId');

    const response = await apis.calendar.events.get({
      calendarId,
      eventId,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
}
