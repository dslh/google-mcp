import type { calendar_v3 } from 'googleapis';

export const mockCalendarEvent: calendar_v3.Schema$Event = {
  id: 'event-123',
  summary: 'Test Meeting',
  description: 'A test meeting',
  start: {
    dateTime: '2024-01-15T10:00:00Z',
    timeZone: 'UTC',
  },
  end: {
    dateTime: '2024-01-15T11:00:00Z',
    timeZone: 'UTC',
  },
  attendees: [
    {
      email: 'attendee@example.com',
      responseStatus: 'needsAction',
    },
  ],
  location: 'Conference Room A',
  status: 'confirmed',
};

export const mockCalendarEventsList: calendar_v3.Schema$Events = {
  items: [
    mockCalendarEvent,
    {
      id: 'event-456',
      summary: 'Another Meeting',
      start: {
        dateTime: '2024-01-16T14:00:00Z',
        timeZone: 'UTC',
      },
      end: {
        dateTime: '2024-01-16T15:00:00Z',
        timeZone: 'UTC',
      },
      status: 'confirmed',
    },
  ],
  nextPageToken: undefined,
};

export const mockFreeBusyResponse: calendar_v3.Schema$FreeBusyResponse = {
  calendars: {
    primary: {
      busy: [
        {
          start: '2024-01-15T10:00:00Z',
          end: '2024-01-15T11:00:00Z',
        },
        {
          start: '2024-01-15T14:00:00Z',
          end: '2024-01-15T15:00:00Z',
        },
      ],
    },
  },
};

export const mockCalendarList: calendar_v3.Schema$CalendarList = {
  items: [
    {
      id: 'primary',
      summary: 'Primary Calendar',
      primary: true,
      accessRole: 'owner',
    },
    {
      id: 'calendar2@example.com',
      summary: 'Work Calendar',
      accessRole: 'writer',
    },
  ],
};
