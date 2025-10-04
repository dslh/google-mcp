import type { GoogleAPIs } from '../index.js';
import type { FindFreeTimeParams, TimeSlot, ToolResponse } from '../../types/schema.js';
import { handleError } from '../../utils/error-handler.js';
import { validateCalendarId, validateDateTime, validateNumber } from '../../utils/validators.js';

export async function findFreeTime(
  args: Record<string, unknown>,
  apis: GoogleAPIs
): Promise<ToolResponse> {
  try {
    const params = args as unknown as FindFreeTimeParams;
    const calendarId = params.calendarId ? validateCalendarId(params.calendarId) : 'primary';
    const timeMin = validateDateTime(params.timeMin, 'timeMin');
    const timeMax = validateDateTime(params.timeMax, 'timeMax');
    const duration = validateNumber(params.duration, 'duration', 1);

    // Get all events in the time range
    const eventsResponse = await apis.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];

    // Find free time slots
    const freeSlots: TimeSlot[] = [];
    const startTime = new Date(timeMin);
    const endTime = new Date(timeMax);
    const durationMs = duration * 60 * 1000;

    let currentTime = startTime;

    for (const event of events) {
      const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
      const eventEnd = new Date(event.end?.dateTime || event.end?.date || '');

      // Check if there's a free slot before this event
      if (eventStart.getTime() - currentTime.getTime() >= durationMs) {
        freeSlots.push({
          start: currentTime.toISOString(),
          end: eventStart.toISOString(),
        });
      }

      // Move current time to end of this event
      if (eventEnd > currentTime) {
        currentTime = eventEnd;
      }
    }

    // Check if there's a free slot after the last event
    if (endTime.getTime() - currentTime.getTime() >= durationMs) {
      freeSlots.push({
        start: currentTime.toISOString(),
        end: endTime.toISOString(),
      });
    }

    return {
      success: true,
      data: {
        freeSlots,
        requestedDuration: duration,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
