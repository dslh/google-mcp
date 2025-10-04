import type { GoogleAPIs } from '../index.js';
import type { UpdateEventParams, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateCalendarId, validateString, validateDateTime } from '../../utils/validators.js';

export async function updateEvent(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as UpdateEventParams;
    const calendarId = validateCalendarId(params.calendarId);
    const eventId = validateString(params.eventId, 'eventId');

    // Build update object with only provided fields
    const updateBody: {
      summary?: string;
      description?: string;
      start?: { dateTime: string };
      end?: { dateTime: string };
      attendees?: Array<{ email: string }>;
      location?: string;
    } = {};

    if (params.summary) {
      updateBody.summary = validateString(params.summary, 'summary');
    }

    if (params.description !== undefined) {
      updateBody.description = params.description;
    }

    if (params.start) {
      updateBody.start = { dateTime: validateDateTime(params.start, 'start') };
    }

    if (params.end) {
      updateBody.end = { dateTime: validateDateTime(params.end, 'end') };
    }

    if (params.attendees) {
      updateBody.attendees = params.attendees.map((email) => ({ email }));
    }

    if (params.location !== undefined) {
      updateBody.location = params.location;
    }

    const response = await apis.calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updateBody,
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
