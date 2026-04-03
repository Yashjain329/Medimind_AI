/**
 * Google Calendar Service
 *
 * Generates "Add to Google Calendar" URLs for appointments.
 * In production, this could use the Google Calendar API for full sync.
 */
import type { Appointment, CalendarService } from '../types';

class CalendarServiceImpl implements CalendarService {
  /**
   * Generates a Google Calendar "Add Event" URL.
   * Opens in a new tab, allowing the user to add the appointment to their calendar.
   */
  generateAddToCalendarUrl(appointment: Appointment, doctorAddress?: string): string {
    const { date, time, duration, reason, doctorName } = appointment;

    // Build start/end datetime in the format Google Calendar expects: YYYYMMDDTHHmmSS
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    const startLocal = `${year}${month}${day}T${hours}${minutes}00`;

    // Calculate end time
    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    const endLocal = [
      endDate.getFullYear(),
      String(endDate.getMonth() + 1).padStart(2, '0'),
      String(endDate.getDate()).padStart(2, '0'),
      'T',
      String(endDate.getHours()).padStart(2, '0'),
      String(endDate.getMinutes()).padStart(2, '0'),
      '00',
    ].join('');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `MediConnect: Appointment with ${doctorName}`,
      dates: `${startLocal}/${endLocal}`,
      details: `Reason: ${reason}\n\nPowered by MediConnect`,
      location: doctorAddress ?? '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
}

/*
 * Full Google Calendar API Integration Point
 *
 * For doctors who want appointments auto-synced to their calendar,
 * the integration would:
 *
 * 1. OAuth2 flow → request 'calendar.events' scope
 * 2. On appointment creation/confirmation:
 *    POST https://www.googleapis.com/calendar/v3/calendars/primary/events
 *    Body: { summary, start, end, attendees, reminders, ... }
 * 3. On appointment update/cancellation:
 *    PATCH/DELETE the corresponding calendar event
 *
 * This requires a backend (Cloud Functions) to store OAuth tokens securely.
 */

export const calendarService: CalendarService = new CalendarServiceImpl();
