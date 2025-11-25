# Gleichgewichts-Börse – Implementierungs-Guide

> Vollständige Dokumentation für Real-Bilanz-System, Instrumente und Nachrichten-System

---

## 📋 Übersicht

Dieses Dokument beschreibt die Implementierung der **Gleichgewichts-Börse** in TogetherSystems:

1. **Real-Bilanz-System**: Erfassung aller Transaktionen (Einnahmen, Ausgaben, Schäden, Nutzen)
2. **Gleichgewichts-Instrumente**: Handelbare Titel nur auf Basis positiver Netto-Werte
3. **Nachrichten-System**: User-zu-User-Kommunikation mit Offline-Support
4. **High-End-Kommunikation**: HiFi-Audio und Full-HD-Video

---

## 🗄️ Datenbank-Schema

### Tabellen erweitern

Füge das Schema aus `d1-schema-balanced-exchange.sql` zu deiner D1-Datenbank hinzu:

```bash
wrangler d1 execute togethersystems-db --file=d1-schema-balanced-exchange.sql
```

### Wichtige Tabellen

- **entities**: Reale Einheiten (Unternehmen, Projekte)
- **real_transactions**: Einzelne Transaktionen
- **real_balances**: Aggregierte Bilanzen mit Netto-Wert
- **instruments**: Handelbare Titel
- **messages**: User-zu-User-Nachrichten
- **av_sessions**: High-End Audio/Video Sessions

---

## 🔌 API-Endpunkte

### Real-Bilanz

#### POST /api/real/transactions

Erfasst eine Real-Transaktion:

```javascript
const response = await fetch('/api/real/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-TS-APIKEY': API_KEY
  },
  body: JSON.stringify({
    entity_id: 'ent-energie-berlin',
    category: 'damage',
    label: 'CO2 Emission Q1',
    amount: 10000,
    unit: 'tCO2e',
    direction: 'negative',
    weight: 80, // 80 EUR pro Tonne CO2
    occurred_at: '2025-03-31T23:59:59Z',
    meta: { scope: 'scope2' }
  })
});
```

#### POST /api/real/balances/recompute

Berechnet eine Real-Bilanz für einen Zeitraum:

```javascript
const response = await fetch('/api/real/balances/recompute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entity_id: 'ent-energie-berlin',
    period_start: '2025-01-01T00:00:00Z',
    period_end: '2025-03-31T23:59:59Z'
  })
});
```

### Instrumente

#### POST /api/instruments

Erstellt ein Instrument auf Basis positiver Real-Bilanz:

```javascript
const response = await fetch('/api/instruments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    entity_id: 'ent-energie-berlin',
    balance_id: 'rb-2025Q1-ent-energie-berlin',
    symbol: 'GEB-25Q1',
    name: 'Gleichgewichts-Einheit Berlin Q1/2025',
    units_issued: 20000
  })
});
```

#### GET /api/instruments/:id

Holt Instrument-Details inkl. vollständiger Real-Bilanz (Waage):

```javascript
const response = await fetch('/api/instruments/inst-geb-25q1');
const data = await response.json();
// data.data.instrument: Instrument-Daten
// data.data.balance: Vollständige Real-Bilanz (Waage)
```

### Nachrichten

#### POST /api/messages/send

Sendet eine Nachricht:

```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from_user_id: 'usr-abc',
    to_user_id: 'usr-def',
    subject: 'Kurzfrage',
    body: 'Hast du 10 Minuten für einen Call?',
    meta: { importance: 'normal' }
  })
});
```

#### GET /api/messages/pending

Holt ungelesene Nachrichten (beim Online-Gehen):

```javascript
const response = await fetch(`/api/messages/pending?user_id=usr-def&since=2025-04-05T00:00:00Z`);
const data = await response.json();
// data.data.messages: Array von Nachrichten
```

---

## 💬 Nachrichten-System: Offline-First

### Frontend-Integration (manifest-forum.html)

#### LocalStorage-Struktur

```javascript
// Lokale Nachrichten-Datenbank
const messagesDB = {
  inbox: [
    {
      id: 'msg-123',
      from: 'usr-abc',
      subject: 'Hallo',
      preview: 'Wollte nur kurz...',
      body: 'Wollte nur kurz hallo sagen...',
      created_at: '2025-04-05T10:00:00Z',
      delivered_at: '2025-04-05T10:01:00Z',
      read_at: null
    }
  ],
  outbox: [
    {
      id: 'msg-temp-1',
      to: 'usr-def',
      subject: 'Terminvorschlag',
      body: 'Wie wäre es mit Freitag?',
      created_at: '2025-04-05T10:02:00Z',
      synced: false
    }
  ]
};
```

#### Online-Gehen (Portal öffnen)

```javascript
async function syncMessages() {
  const userId = getUserId(); // Aus MOT-Token
  
  // Outbox → Server: Alle nicht gesyncten Nachrichten senden
  const outbox = loadOutbox();
  for (const msg of outbox.filter(m => !m.synced)) {
    try {
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: userId,
          to_user_id: msg.to,
          subject: msg.subject,
          body: msg.body
        })
      });
      msg.synced = true;
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }
  saveOutbox(outbox);
  
  // Server → Inbox: Neue Nachrichten abholen
  try {
    const response = await fetch(`/api/messages/pending?user_id=${userId}`);
    const data = await response.json();
    if (data.ok && data.data.messages) {
      const inbox = loadInbox();
      data.data.messages.forEach(msg => {
        // Nur hinzufügen wenn noch nicht vorhanden
        if (!inbox.find(m => m.id === msg.id)) {
          inbox.push({
            ...msg,
            delivered_at: new Date().toISOString()
          });
          // Popup anzeigen
          showMessagePopup(msg);
        }
      });
      saveInbox(inbox);
      
      // Bestätigen
      await fetch('/api/messages/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message_ids: data.data.messages.map(m => m.id)
        })
      });
    }
  } catch (err) {
    console.error('Failed to fetch messages:', err);
  }
}
```

#### Popup anzeigen

```javascript
function showMessagePopup(message) {
  const popup = document.createElement('div');
  popup.className = 'message-popup';
  popup.innerHTML = `
    <div class="message-popup-content">
      <h3>Neue Nachricht</h3>
      <p><strong>Von:</strong> ${escapeHtml(message.from_user_id)}</p>
      <p><strong>Zeit:</strong> ${new Date(message.created_at).toLocaleString()}</p>
      <p><strong>Betreff:</strong> ${escapeHtml(message.subject || '(Kein Betreff)')}</p>
      <div class="message-preview">${escapeHtml(message.content_preview || message.body)}</div>
      <div class="message-actions">
        <button class="btn" onclick="openMessage('${message.id}')">Öffnen</button>
        <button class="btn ghost" onclick="closePopup(this)">Schließen</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  
  // Optional: Notification-Sound
  playNotificationSound();
  
  // Auto-Close nach 30 Sekunden
  setTimeout(() => popup.remove(), 30000);
}
```

---

## 🎵 High-End-Kommunikation

### Audio-Qualität (HiFi)

WebRTC mit Opus-Codec in hoher Qualität:

```javascript
// WebRTC Audio-Constraints
const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000, // HiFi: 48 kHz
  channelCount: 2, // Stereo
  sampleSize: 16,
  opusStereo: true,
  opusFec: true,
  opusDtx: true,
  opusMaxPlaybackRate: 48000,
  opusPtime: 20,
  opusComplexity: 10 // Maximum für beste Qualität
};

navigator.mediaDevices.getUserMedia({ audio: audioConstraints })
  .then(stream => {
    // Stream für WebRTC verwenden
  });
```

### Video-Qualität (Full-HD)

```javascript
// Video-Constraints für Full-HD
const videoConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  frameRate: { ideal: 30 },
  facingMode: 'user'
};

navigator.mediaDevices.getUserMedia({ 
  video: videoConstraints,
  audio: audioConstraints 
})
  .then(stream => {
    // Stream für WebRTC verwenden
  });
```

### AV-Session erfassen

```javascript
async function startAVSession(roomId, initiatorId, participantIds, audioQuality, videoQuality) {
  const response = await fetch('/api/av/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_id: roomId,
      initiator_id: initiatorId,
      participant_ids: participantIds,
      audio_quality: audioQuality, // 'hifi', 'standard'
      video_quality: videoQuality, // 'full-hd', 'hd', 'sd'
      status: 'active'
    })
  });
  return response.json();
}
```

---

## 🚀 Deployment-Checkliste

1. **Schema erweitern:**
   ```bash
   wrangler d1 execute togethersystems-db --file=d1-schema-balanced-exchange.sql
   ```

2. **Functions deployen:**
   - `functions/api/real/transactions.js`
   - `functions/api/real/balances/recompute.js`
   - `functions/api/instruments/*.js`
   - `functions/api/messages/*.js`

3. **Frontend integrieren:**
   - Neue Tabs/Buttons in `manifest-portal.html`
   - Nachrichten-UI in `manifest-forum.html`
   - Gleichgewichts-Börse-Dashboard

4. **WebSocket erweitern:**
   - `functions/ws.js` für Live-Push-Nachrichten
   - `direct_message`-Typ hinzufügen

---

## 📚 Weitere Dokumentation

- `api-balanced-exchange.yaml` - OpenAPI-Spezifikation
- `ENTWICKLER-DOKUMENTATION.md` - Vollständige Architektur
- `d1-schema-balanced-exchange.sql` - Datenbank-Schema

---

**Motto:** "Wir bewegen die Welt. Die Welt bewegt uns. Ihnen kostet das Geld. Uns ist das egal."


