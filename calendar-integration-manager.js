// Calendar-Integration Manager
// Google Calendar, iCal Export/Import, automatische Kontaktauswahl

class CalendarIntegrationManager {
  constructor() {
    this.googleCalendarEnabled = false;
    this.calendars = [];
  }

  // Google Calendar API initialisieren
  async initGoogleCalendar(clientId, apiKey) {
    if (!clientId || !apiKey) {
      console.warn('Google Calendar: Client ID oder API Key fehlt');
      return false;
    }

    // Google API Script laden
    await this.loadGoogleAPIScript();
    
    // OAuth2 initialisieren
    await gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar',
      });

      this.googleAuth = gapi.auth2.getAuthInstance();
      this.googleCalendarEnabled = true;
    });

    return true;
  }

  // Google API Script laden
  loadGoogleAPIScript() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Google Calendar anmelden
  async signInGoogleCalendar() {
    if (!this.googleAuth) {
      throw new Error('Google Calendar nicht initialisiert');
    }

    try {
      await this.googleAuth.signIn();
      return true;
    } catch (err) {
      console.error('Google Calendar Sign-In Fehler:', err);
      return false;
    }
  }

  // Events zu Google Calendar exportieren
  async exportToGoogleCalendar(events) {
    if (!this.googleCalendarEnabled || !gapi.client.calendar) {
      throw new Error('Google Calendar nicht verfügbar');
    }

    const results = [];

    for (const event of events) {
      try {
        const googleEvent = this.convertToGoogleEvent(event);
        const response = await gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: googleEvent,
        });

        results.push({ event: event.id, googleId: response.result.id, success: true });
      } catch (err) {
        console.error(`Event ${event.id} Export Fehler:`, err);
        results.push({ event: event.id, success: false, error: err.message });
      }
    }

    return results;
  }

  // Event zu Google Calendar Format konvertieren
  convertToGoogleEvent(event) {
    return {
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: event.start_time,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end_time || event.start_time,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.invitee_ids?.map(id => {
        const contact = window.eventCalendar?.contacts.find(c => c.id === id);
        return { email: contact?.email || id };
      }) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };
  }

  // Events aus Google Calendar importieren
  async importFromGoogleCalendar(calendarId = 'primary', maxResults = 50) {
    if (!this.googleCalendarEnabled || !gapi.client.calendar) {
      throw new Error('Google Calendar nicht verfügbar');
    }

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const googleEvents = response.result.items || [];
      const importedEvents = googleEvents.map(event => this.convertFromGoogleEvent(event));

      return importedEvents;
    } catch (err) {
      console.error('Google Calendar Import Fehler:', err);
      throw err;
    }
  }

  // Google Event zu internem Format konvertieren
  convertFromGoogleEvent(googleEvent) {
    return {
      id: googleEvent.id,
      title: googleEvent.summary || 'Ohne Titel',
      description: googleEvent.description || '',
      start_time: googleEvent.start.dateTime || googleEvent.start.date,
      end_time: googleEvent.end.dateTime || googleEvent.end.date,
      location: googleEvent.location || '',
      invitee_ids: googleEvent.attendees?.map(a => a.email) || [],
      source: 'google_calendar',
      created_at: googleEvent.created || new Date().toISOString(),
    };
  }

  // iCal Export
  exportToiCal(events) {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TogetherSystems//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const event of events) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${event.id}@togethersystems.com`);
      lines.push(`DTSTART:${this.formatiCalDate(event.start_time)}`);
      if (event.end_time) {
        lines.push(`DTEND:${this.formatiCalDate(event.end_time)}`);
      }
      lines.push(`SUMMARY:${this.escapeiCal(event.title)}`);
      if (event.description) {
        lines.push(`DESCRIPTION:${this.escapeiCal(event.description)}`);
      }
      if (event.location) {
        lines.push(`LOCATION:${this.escapeiCal(event.location)}`);
      }
      lines.push(`DTSTAMP:${this.formatiCalDate(new Date().toISOString())}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const icalContent = lines.join('\r\n');
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // iCal Import
  async importFromiCal(file) {
    const text = await file.text();
    const events = this.parseiCal(text);
    return events;
  }

  // iCal parsen
  parseiCal(icalText) {
    const events = [];
    const lines = icalText.split(/\r?\n/);
    let currentEvent = null;

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent) {
          events.push(currentEvent);
          currentEvent = null;
        }
      } else if (currentEvent) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':');
        
        switch (key) {
          case 'UID':
            currentEvent.id = value.split('@')[0];
            break;
          case 'SUMMARY':
            currentEvent.title = this.unescapeiCal(value);
            break;
          case 'DESCRIPTION':
            currentEvent.description = this.unescapeiCal(value);
            break;
          case 'LOCATION':
            currentEvent.location = this.unescapeiCal(value);
            break;
          case 'DTSTART':
            currentEvent.start_time = this.parseiCalDate(value);
            break;
          case 'DTEND':
            currentEvent.end_time = this.parseiCalDate(value);
            break;
        }
      }
    }

    return events;
  }

  // Helper-Funktionen für iCal
  formatiCalDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  parseiCalDate(dateString) {
    // Vereinfachte iCal-Datum-Parsing
    const cleaned = dateString.replace(/[TZ]/g, '');
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    const hour = cleaned.substring(9, 11) || '00';
    const minute = cleaned.substring(11, 13) || '00';
    
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`).toISOString();
  }

  escapeiCal(text) {
    return String(text || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  unescapeiCal(text) {
    return String(text || '')
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }
}

// Globale Instanz
const calendarIntegration = new CalendarIntegrationManager();

// Export
if (typeof window !== 'undefined') {
  window.CalendarIntegrationManager = CalendarIntegrationManager;
  window.calendarIntegration = calendarIntegration;
}


