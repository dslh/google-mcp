import type { GoogleAPIs } from '../index.js';
import type { ListEventsParams, CalendarEvent, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateCalendarId, validateDateTime, validateNumber } from '../../utils/validators.js';

export async function listEvents(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as Partial<ListEventsParams>;
    const calendarId = params.calendarId ? validateCalendarId(params.calendarId) : 'primary';

    if (params.timeMin) {
      validateDateTime(params.timeMin, 'timeMin');
    }

    if (params.timeMax) {
      validateDateTime(params.timeMax, 'timeMax');
    }

    const maxResults = params.maxResults
      ? validateNumber(params.maxResults, 'maxResults', 1, 250)
      : 10;

    const response = await apis.calendar.events.list({
      calendarId,
      timeMin: params.timeMin,
      timeMax: params.timeMax,
      maxResults,
      q: params.query,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events: CalendarEvent[] =
      response.data.items?.map((event) => ({
        id: event.id!,
        summary: event.summary || 'No title',
        description: event.description || undefined,
        start: {
          dateTime: event.start?.dateTime || undefined,
          date: event.start?.date || undefined,
          timeZone: event.start?.timeZone || undefined,
        },
        end: {
          dateTime: event.end?.dateTime || undefined,
          date: event.end?.date || undefined,
          timeZone: event.end?.timeZone || undefined,
        },
        attendees: event.attendees?.map((a) => ({
          email: a.email!,
          displayName: a.displayName || undefined,
          responseStatus: a.responseStatus || undefined,
        })),
        location: event.location || undefined,
        htmlLink: event.htmlLink || undefined,
      })) || [];

    return {
      success: true,
      data: {
        events,
        nextPageToken: response.data.nextPageToken,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
