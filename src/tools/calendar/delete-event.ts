import type { GoogleAPIs } from '../index.js';
import type { DeleteEventParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateCalendarId, validateString } from '../../utils/validators.js';

export async function deleteEvent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as DeleteEventParams;
    const calendarId = validateCalendarId(params.calendarId);
    const eventId = validateString(params.eventId, 'eventId');

    await apis.calendar.events.delete({
      calendarId,
      eventId,
    });

    return {
      success: true,
      data: {
        message: 'Event deleted successfully',
        eventId,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
