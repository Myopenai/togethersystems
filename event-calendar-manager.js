// Event-Kalender & Meetups Manager
// Vollständige Implementierung für Events, Kalender und automatische Kontaktauswahl

class EventCalendarManager {
  constructor(apiBase = '/api') {
    this.apiBase = apiBase;
    this.events = [];
    this.contacts = []; // Kontakte aus Adressbuch
    this.networkConnections = []; // Netzwerk-Verbindungen
  }

  // Initialisieren
  async init() {
    // Kontakte laden (Adressbuch, Netzwerk-Verbindungen)
    await this.loadContacts();
    
    // Events laden
    await this.loadEvents();
    
    // Calendar-Integration vorbereiten
    await this.initCalendarIntegration();
  }

  // Kontakte laden (Adressbuch + Netzwerk-Verbindungen)
  async loadContacts() {
    try {
      // 1. Lokale Kontakte aus LocalStorage
      const localContacts = this.loadLocalContacts();
      
      // 2. Netzwerk-Verbindungen (aus API)
      const networkContacts = await this.loadNetworkConnections();
      
      // 3. Browser-Contacts API (falls verfügbar)
      const browserContacts = await this.loadBrowserContacts();
      
      // Kombiniere alle Kontakte
      this.contacts = [
        ...localContacts,
        ...networkContacts,
        ...browserContacts,
      ];
      
      // Duplikate entfernen (basierend auf E-Mail/ID)
      this.contacts = this.deduplicateContacts(this.contacts);
      
      return this.contacts;
    } catch (err) {
      console.error('Kontakte laden Fehler:', err);
      return [];
    }
  }

  // Lokale Kontakte aus LocalStorage
  loadLocalContacts() {
    try {
      const raw = localStorage.getItem('contacts_db');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Netzwerk-Verbindungen laden (aus API)
  async loadNetworkConnections() {
    try {
      const response = await fetch(`${this.apiBase}/network/connections`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data?.connections?.map(conn => ({
        id: conn.user_b_id || conn.user_a_id,
        name: conn.name || 'Unbekannt',
        email: conn.email || null,
        type: 'network',
        connectionType: conn.connection_type,
        networkId: conn.network_id,
      })) || [];
    } catch {
      return [];
    }
  }

  // Browser Contacts API nutzen (falls verfügbar)
  async loadBrowserContacts() {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      return [];
    }

    try {
      const contactsManager = navigator.contacts;
      const properties = ['name', 'email', 'tel'];
      const contacts = await contactsManager.select(properties, { multiple: true });
      
      return contacts.map(contact => ({
        id: contact.email?.[0] || `contact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: contact.name?.[0] || 'Unbekannt',
        email: contact.email?.[0] || null,
        phone: contact.tel?.[0] || null,
        type: 'browser',
      }));
    } catch (err) {
      console.warn('Browser Contacts API nicht verfügbar:', err);
      return [];
    }
  }

  // Kontakte deduplizieren
  deduplicateContacts(contacts) {
    const seen = new Map();
    return contacts.filter(contact => {
      const key = contact.email || contact.id;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
  }

  // Event erstellen
  async createEvent(eventData) {
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: eventData.title,
      description: eventData.description || '',
      organizer_id: eventData.organizer_id || this.getCurrentUserId(),
      start_time: eventData.start_time,
      end_time: eventData.end_time || null,
      location: eventData.location || '',
      network_id: eventData.network_id || null,
      invitee_ids: eventData.invitee_ids || [], // Array von User-IDs
      visibility: eventData.visibility || 'network',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Event speichern (API oder LocalStorage)
      if (this.apiBase && !location.hostname.includes('github.io')) {
        const response = await fetch(`${this.apiBase}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          const data = await response.json();
          event.id = data.data?.event?.id || event.id;
        }
      }

      // Lokal speichern
      this.events.push(event);
      this.saveEventsLocally();

      // Einladungen senden (Push-Benachrichtigungen)
      await this.sendInvitations(event, eventData.invitee_ids || []);

      return event;
    } catch (err) {
      console.error('Event erstellen Fehler:', err);
      // Fallback: nur lokal speichern
      this.events.push(event);
      this.saveEventsLocally();
      return event;
    }
  }

  // Einladungen senden (mit Push-Benachrichtigungen)
  async sendInvitations(event, inviteeIds) {
    if (!inviteeIds || inviteeIds.length === 0) return;

    for (const inviteeId of inviteeIds) {
      try {
        // Push-Benachrichtigung senden
        if (window.pushManager && window.pushManager.isSubscribed()) {
          await this.sendPushNotification(inviteeId, {
            title: '📅 Neue Event-Einladung',
            body: `${event.title} - ${new Date(event.start_time).toLocaleString()}`,
            tag: `event-${event.id}`,
            data: {
              type: 'event_invitation',
              event_id: event.id,
              url: `./manifest-portal.html#event=${event.id}`,
            },
          });
        }

        // Direkte Nachricht über Messaging-System
        if (window.sendMessageOffline || window.sendMessage) {
          const messageFn = window.sendMessageOffline || window.sendMessage;
          await messageFn(inviteeId, `Event-Einladung: ${event.title}`, 
            `Du wurdest zu "${event.title}" eingeladen.\n\n` +
            `Datum: ${new Date(event.start_time).toLocaleString()}\n` +
            (event.location ? `Ort: ${event.location}\n` : '') +
            (event.description ? `\n${event.description}` : '') +
            `\n\nEvent-ID: ${event.id}`
          );
        }
      } catch (err) {
        console.error(`Einladung an ${inviteeId} Fehler:`, err);
      }
    }
  }

  // Push-Benachrichtigung senden (über API)
  async sendPushNotification(userId, notification) {
    try {
      const response = await fetch(`${this.apiBase}/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          notification: {
            title: notification.title,
            body: notification.body,
            tag: notification.tag,
            data: notification.data,
          },
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('Push-Notification senden Fehler:', err);
      return false;
    }
  }

  // Kontakte-Auswahl-UI öffnen (Multi-Select)
  async openContactSelector(currentSelection = []) {
    return new Promise((resolve) => {
      // Erstelle Modal für Kontaktauswahl
      const modal = document.createElement('dialog');
      modal.id = 'contact-selector-modal';
      modal.innerHTML = `
        <div style="padding:20px;max-width:600px;">
          <h2>Kontakte auswählen</h2>
          <div style="margin:16px 0;">
            <input type="text" id="contactSearch" placeholder="Kontakte suchen..." 
                   style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;">
          </div>
          <div id="contactList" style="max-height:400px;overflow-y:auto;margin:16px 0;">
            ${this.renderContactList(this.contacts, currentSelection)}
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
            <button class="btn ghost" onclick="this.closest('dialog').close()">Abbrechen</button>
            <button class="btn" id="confirmContacts">Auswählen</button>
          </div>
        </div>
      `;

      const selectedContacts = new Set(currentSelection);

      // Search-Funktion
      const searchInput = modal.querySelector('#contactSearch');
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = this.contacts.filter(c => 
          c.name.toLowerCase().includes(query) || 
          (c.email && c.email.toLowerCase().includes(query))
        );
        modal.querySelector('#contactList').innerHTML = this.renderContactList(filtered, Array.from(selectedContacts));
        attachCheckboxHandlers();
      });

      // Checkbox-Handler
      const attachCheckboxHandlers = () => {
        modal.querySelectorAll('.contact-checkbox').forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
            const contactId = e.target.dataset.contactId;
            if (e.target.checked) {
              selectedContacts.add(contactId);
            } else {
              selectedContacts.delete(contactId);
            }
          });
        });
      };

      attachCheckboxHandlers();

      // Bestätigen
      modal.querySelector('#confirmContacts').addEventListener('click', () => {
        modal.close();
        resolve(Array.from(selectedContacts));
        modal.remove();
      });

      document.body.appendChild(modal);
      modal.showModal();
    });
  }

  // Kontakt-Liste rendern
  renderContactList(contacts, selectedIds = []) {
    if (contacts.length === 0) {
      return '<div class="muted">Keine Kontakte verfügbar.</div>';
    }

    return contacts.map(contact => {
      const isSelected = selectedIds.includes(contact.id);
      return `
        <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--border);border-radius:8px;margin:4px 0;cursor:pointer;">
          <input type="checkbox" class="contact-checkbox" data-contact-id="${contact.id}" ${isSelected ? 'checked' : ''}>
          <div style="flex:1;">
            <div style="font-weight:500;">${escapeHtml(contact.name)}</div>
            ${contact.email ? `<div style="font-size:12px;color:var(--muted);">${escapeHtml(contact.email)}</div>` : ''}
            ${contact.type ? `<span style="font-size:11px;color:var(--accent);">${escapeHtml(contact.type)}</span>` : ''}
          </div>
        </label>
      `;
    }).join('');
  }

  // Events laden
  async loadEvents() {
    try {
      // API laden
      if (this.apiBase && !location.hostname.includes('github.io')) {
        const response = await fetch(`${this.apiBase}/events`);
        if (response.ok) {
          const data = await response.json();
          this.events = data.data?.events || [];
          return this.events;
        }
      }

      // Lokal laden
      const localEvents = this.loadEventsLocally();
      this.events = localEvents;
      return this.events;
    } catch (err) {
      console.error('Events laden Fehler:', err);
      return this.loadEventsLocally();
    }
  }

  // Events lokal speichern
  saveEventsLocally() {
    try {
      localStorage.setItem('events_db', JSON.stringify(this.events));
    } catch (err) {
      console.error('Events speichern Fehler:', err);
    }
  }

  // Events lokal laden
  loadEventsLocally() {
    try {
      const raw = localStorage.getItem('events_db');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Calendar-Integration initialisieren
  async initCalendarIntegration() {
    // Wird in calendar-integration.js implementiert
  }

  // Helper-Funktionen
  getCurrentUserId() {
    try {
      return localStorage.getItem('mot_user_id_v1') || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

function escapeHtml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Globale Instanz
const eventCalendar = new EventCalendarManager();

// Export
if (typeof window !== 'undefined') {
  window.EventCalendarManager = EventCalendarManager;
  window.eventCalendar = eventCalendar;
}









