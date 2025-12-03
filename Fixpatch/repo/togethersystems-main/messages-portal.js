// Nachrichten-System Frontend-Integration für manifest-portal.html

let MESSAGES_API_BASE = null;
let messageWs = null;
let currentMessagesView = 'inbox'; // 'inbox' | 'outbox'

// Helper: getUserContext (nutzt manifest-portal.html Funktion oder Fallback)
function getUserContext() {
  // Nutze die Funktion aus manifest-portal.html wenn verfügbar
  if (typeof window.getUserContext === 'function') {
    return window.getUserContext();
  }
  // Fallback: eigene Implementierung
  try {
    let uid = localStorage.getItem('mot_user_id_v1');
    if (!uid) {
      uid = generateRandomId();
      localStorage.setItem('mot_user_id_v1', uid);
    }
    const verified = !!localStorage.getItem('mot_verified_v1');
    return { uid, verified };
  } catch {
    return { uid: generateRandomId(), verified: false };
  }
}

function generateRandomId(length = 22) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint32Array(length);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

// API-Base automatisch erkennen
(function detectMessagesApiBase() {
  if (location.hostname.includes('github.io') || location.hostname.includes('github.com')) {
    MESSAGES_API_BASE = null;
    return;
  }
  if (location.hostname.includes('pages.dev') || location.hostname.includes('workers.dev') || location.hostname.includes('cloudflare')) {
    MESSAGES_API_BASE = '/api';
    return;
  }
  // Test ob API verfügbar
  fetch('/api/messages/pending?user_id=test')
    .then(res => {
      if (res.ok || res.status === 400) {
        MESSAGES_API_BASE = '/api';
      }
    })
    .catch(() => {
      MESSAGES_API_BASE = null;
    });
})();

// LocalStorage-Struktur für Nachrichten (Offline-First)
function loadMessagesDB() {
  try {
    const raw = localStorage.getItem('messages.db');
    return raw ? JSON.parse(raw) : { inbox: [], outbox: [] };
  } catch {
    return { inbox: [], outbox: [] };
  }
}

function saveMessagesDB(db) {
  try {
    localStorage.setItem('messages.db', JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save messages DB:', err);
  }
}

// Synchronisiere Nachrichten (Outbox → Server, Server → Inbox)
async function syncMessages() {
  if (!MESSAGES_API_BASE) {
    console.warn('Messages API nicht verfügbar');
    return;
  }
  
  const { uid } = getUserContext();
  if (!uid) return;
  
  const db = loadMessagesDB();
  
  // Outbox → Server: Alle nicht gesyncten Nachrichten senden
  const unsynced = db.outbox.filter(m => !m.synced);
  for (const msg of unsynced) {
    try {
      const res = await fetch(`${MESSAGES_API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: uid,
          to_user_id: msg.to,
          subject: msg.subject || null,
          body: msg.body,
          meta: msg.meta || {}
        })
      });
      
      if (res.ok) {
        msg.synced = true;
        msg.sent_at = new Date().toISOString();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }
  saveMessagesDB(db);
  
  // Server → Inbox: Neue Nachrichten abholen
  try {
    const since = db.inbox.length > 0 
      ? db.inbox[db.inbox.length - 1].created_at 
      : null;
    
    const url = `${MESSAGES_API_BASE}/messages/pending?user_id=${encodeURIComponent(uid)}${since ? `&since=${encodeURIComponent(since)}` : ''}`;
    const res = await fetch(url);
    
    if (res.ok) {
      const data = await res.json();
      const newMessages = data.data?.messages || [];
      
      if (newMessages.length > 0) {
        newMessages.forEach(msg => {
          // Prüfe ob Nachricht schon vorhanden
          if (!db.inbox.find(m => m.id === msg.id)) {
            db.inbox.push({
              id: msg.id,
              from: msg.sender_id,
              subject: msg.subject,
              preview: msg.content_preview || msg.body?.substring(0, 100),
              body: msg.body,
              created_at: msg.created_at,
              delivered_at: new Date().toISOString(),
              read_at: null
            });
            
            // Popup anzeigen
            showMessagePopup({
              id: msg.id,
              from: msg.sender_id,
              subject: msg.subject,
              preview: msg.content_preview || msg.body?.substring(0, 100),
              created_at: msg.created_at
            });
          }
        });
        
        saveMessagesDB(db);
        
        // Delivery bestätigen
        await fetch(`${MESSAGES_API_BASE}/messages/ack`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: uid,
            message_ids: newMessages.map(m => m.id)
          })
        });
        
        // UI aktualisieren
        if (currentMessagesView === 'inbox') {
          loadMessagesInbox();
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch messages:', err);
  }
}

// Nachricht senden
async function sendMessage(to, subject, body) {
  const { uid } = getUserContext();
  if (!uid) {
    alert('Bitte zuerst verifizieren.');
    return;
  }
  
  const db = loadMessagesDB();
  
  // Lokal in Outbox speichern
  const tempId = `msg-temp-${Date.now()}`;
  db.outbox.push({
    id: tempId,
    to: to,
    subject: subject || null,
    body: body,
    created_at: new Date().toISOString(),
    synced: false
  });
  saveMessagesDB(db);
  
  // Falls API verfügbar, sofort senden
  if (MESSAGES_API_BASE) {
    try {
      const res = await fetch(`${MESSAGES_API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: uid,
          to_user_id: to,
          subject: subject || null,
          body: body,
          meta: {}
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const msg = db.outbox.find(m => m.id === tempId);
        if (msg) {
          msg.id = data.data?.message?.id || tempId;
          msg.synced = true;
          msg.sent_at = new Date().toISOString();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    saveMessagesDB(db);
  }
  
  // UI aktualisieren
  if (currentMessagesView === 'outbox') {
    loadMessagesOutbox();
  }
  
  // Formular leeren
  document.getElementById('messageToInput').value = '';
  document.getElementById('messageSubjectInput').value = '';
  document.getElementById('messageBodyInput').value = '';
}

// Lade Inbox
function loadMessagesInbox() {
  const container = document.getElementById('messagesList');
  const title = document.getElementById('messagesListTitle');
  if (!container) return;
  
  currentMessagesView = 'inbox';
  if (title) title.textContent = 'Eingang';
  
  const db = loadMessagesDB();
  const inbox = db.inbox || [];
  
  if (!inbox.length) {
    container.innerHTML = '<div class="muted">Keine Nachrichten im Eingang.</div>';
    return;
  }
  
  container.innerHTML = '';
  inbox.reverse().forEach(msg => {
    const card = document.createElement('div');
    card.className = 'voucher-card';
    card.style.cursor = 'pointer';
    const isRead = !!msg.read_at;
    card.innerHTML = `
      <div class="voucher-card-header">
        <div>
          <div style="font-size:13px;font-weight:${isRead ? '400' : '600'};">${escapeHtml(msg.subject || '(Kein Betreff)')}</div>
          <div class="voucher-meta">Von: ${escapeHtml(msg.from || 'Unbekannt')}</div>
        </div>
        <span class="voucher-badge" style="background:rgba(34,197,94,0.2);color:#22c55e;font-size:10px;">${formatDate(msg.created_at)}</span>
      </div>
      <div class="voucher-meta">${escapeHtml(msg.preview || msg.body?.substring(0, 100) || '')}</div>
    `;
    card.addEventListener('click', () => openMessage(msg));
    container.appendChild(card);
  });
}

// Lade Outbox
function loadMessagesOutbox() {
  const container = document.getElementById('messagesList');
  const title = document.getElementById('messagesListTitle');
  if (!container) return;
  
  currentMessagesView = 'outbox';
  if (title) title.textContent = 'Ausgang';
  
  const db = loadMessagesDB();
  const outbox = db.outbox || [];
  
  if (!outbox.length) {
    container.innerHTML = '<div class="muted">Keine Nachrichten im Ausgang.</div>';
    return;
  }
  
  container.innerHTML = '';
  outbox.reverse().forEach(msg => {
    const card = document.createElement('div');
    card.className = 'voucher-card';
    card.innerHTML = `
      <div class="voucher-card-header">
        <div>
          <div style="font-size:13px;font-weight:600;">${escapeHtml(msg.subject || '(Kein Betreff)')}</div>
          <div class="voucher-meta">An: ${escapeHtml(msg.to || 'Unbekannt')}</div>
        </div>
        <span class="voucher-badge" style="background:${msg.synced ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)'};color:${msg.synced ? '#22c55e' : '#fbbf24'};font-size:10px;">
          ${msg.synced ? '✓ Gesendet' : '⏳ Wartend'}
        </span>
      </div>
      <div class="voucher-meta">${escapeHtml(msg.body?.substring(0, 100) || '')}</div>
    `;
    container.appendChild(card);
  });
}

// Zeige Nachricht-Details
function openMessage(msg) {
  const db = loadMessagesDB();
  
  // Als gelesen markieren
  if (!msg.read_at) {
    msg.read_at = new Date().toISOString();
    const inboxMsg = db.inbox.find(m => m.id === msg.id);
    if (inboxMsg) {
      inboxMsg.read_at = msg.read_at;
    }
    saveMessagesDB(db);
  }
  
  // Zeige Details (kann als Modal erweitert werden)
  alert(`Von: ${msg.from || 'Unbekannt'}\nZeit: ${formatDate(msg.created_at)}\nBetreff: ${msg.subject || '(Kein Betreff)'}\n\n${msg.body || msg.preview || ''}`);
}

// Popup für neue Nachricht
function showMessagePopup(message) {
  const container = document.getElementById('messagePopupContainer');
  if (!container) return;
  
  const popup = document.createElement('div');
  popup.style.cssText = `
    background:var(--card, #111827);
    border:2px solid var(--accent, #10b981);
    border-radius:12px;
    padding:16px;
    margin-bottom:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.5);
    animation:slideIn 0.3s ease-out;
  `;
  
  popup.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
      <strong style="color:var(--accent);">Neue Nachricht</strong>
      <button class="btn alt" onclick="this.parentElement.parentElement.remove()" style="padding:4px 8px;font-size:12px;">×</button>
    </div>
    <div style="font-size:12px;margin-bottom:4px;"><strong>Von:</strong> ${escapeHtml(message.from || 'Unbekannt')}</div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:4px;">${formatDate(message.created_at)}</div>
    <div style="font-size:12px;margin-bottom:8px;"><strong>Betreff:</strong> ${escapeHtml(message.subject || '(Kein Betreff)')}</div>
    <div style="font-size:12px;margin-bottom:12px;padding:8px;background:#0b0f14;border-radius:8px;">${escapeHtml(message.preview || '')}</div>
    <button class="btn" onclick="window.openMessage(${JSON.stringify(message).replace(/"/g, '&quot;')});this.parentElement.remove();" style="width:100%;padding:8px;">Öffnen</button>
  `;
  
  container.appendChild(popup);
  
  // Auto-Close nach 30 Sekunden
  setTimeout(() => popup.remove(), 30000);
  
  // Optional: Notification-Sound
  playNotificationSound();
}

function playNotificationSound() {
  // Einfacher Beep (kann durch richtigen Sound ersetzt werden)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (err) {
    console.warn('Could not play notification sound:', err);
  }
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// WebSocket für Live-Push-Nachrichten
function setupMessageWebSocket() {
  if (!window.liveSocket || window.liveSocket.readyState !== WebSocket.OPEN) {
    // WebSocket wird später initialisiert, wenn Live-Chat aktiviert wird
    return;
  }
  
  const { uid } = getUserContext();
  if (!uid) return;
  
  // User-ID registrieren
  window.liveSocket.send(JSON.stringify({
    type: 'register_user',
    user_id: uid
  }));
  
  // Listener für Nachrichten-Notifications
  const originalOnMessage = window.liveSocket.onmessage;
  window.liveSocket.addEventListener('message', (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      if (originalOnMessage) originalOnMessage(event);
      return;
    }
    
    if (msg.type === 'message_notification') {
      // Neue Nachricht erhalten
      showMessagePopup({
        id: msg.message_id,
        from: msg.from_user_id,
        subject: msg.subject,
        preview: msg.preview,
        created_at: msg.created_at
      });
      
      // In LocalStorage speichern
      const db = loadMessagesDB();
      if (!db.inbox.find(m => m.id === msg.message_id)) {
        db.inbox.push({
          id: msg.message_id,
          from: msg.from_user_id,
          subject: msg.subject,
          preview: msg.preview,
          body: msg.body || '',
          created_at: msg.created_at,
          delivered_at: new Date().toISOString(),
          read_at: null
        });
        saveMessagesDB(db);
        if (currentMessagesView === 'inbox') {
          loadMessagesInbox();
        }
      }
    } else if (originalOnMessage) {
      originalOnMessage(event);
    }
  });
}

// Export für globale Nutzung
window.syncMessages = syncMessages;
window.sendMessage = sendMessage;
window.loadMessagesInbox = loadMessagesInbox;
window.loadMessagesOutbox = loadMessagesOutbox;
window.openMessage = openMessage;
window.showMessagePopup = showMessagePopup;
window.setupMessageWebSocket = setupMessageWebSocket;

