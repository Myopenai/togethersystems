// router.js – einfacher Provider-Router für Together Systems
// Wird vom Portal verwendet, um Provider-/Lieferanten-Profile (Milchkannen)
// aus ./config/providers.json zu lesen und Nachrichten einheitlich zu senden.

const PROVIDERS_URL = './config/providers.json';

let providerCache = null;

/**
 * Lädt providers.json einmalig und cached sie.
 */
export async function loadProviders() {
  if (providerCache) return providerCache;
  const res = await fetch(PROVIDERS_URL, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`providers.json konnte nicht geladen werden: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  providerCache = Array.isArray(data.providers) ? data.providers : [];
  return providerCache;
}

/**
 * Sucht ein Provider-Profil nach ID.
 */
export async function getProviderById(id) {
  const providers = await loadProviders();
  return providers.find(p => p.id === id && p.enabled !== false) || null;
}

/**
 * Wählt ein Provider-Profil nach einfacher Regel:
 *   - Kategorie (optional)
 *   - höchste Priorität (kleinste Zahl)
 */
export async function pickProvider({ category } = {}) {
  const providers = await loadProviders();
  const candidates = providers.filter(p => p.enabled !== false && (!category || p.category === category));
  if (!candidates.length) return null;
  candidates.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  return candidates[0];
}

/**
 * Einfache, vereinheitlichte Sendefunktion.
 * payload = { type, text, meta, ... } – wird je nach Connector anders übersetzt.
 */
export async function sendMessage(providerId, payload) {
  const provider = await getProviderById(providerId);
  if (!provider) {
    throw new Error(`Provider "${providerId}" nicht gefunden oder deaktiviert.`);
  }

  switch (provider.connector) {
    case 'http':
      return sendHttp(provider, payload);
    case 'webrtc':
      return sendPresenceSignal(provider, payload);
    case 'matrix':
      throw new Error('Matrix-Connector ist noch nicht implementiert.');
    default:
      throw new Error(`Unbekannter Connector-Typ: ${provider.connector}`);
  }
}

/**
 * HTTP-Connector: POST JSON an endpoint.
 */
async function sendHttp(provider, payload) {
  const url = provider.endpoint;
  const body = {
    source: 'together-systems-portal',
    providerId: provider.id,
    sentAt: new Date().toISOString(),
    payload
  };

  const res = await fetch(url, {
    method: (provider.meta && provider.meta.method) || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // optional: Text statt JSON
  }

  if (!res.ok) {
    throw new Error(`HTTP-Fehler beim Senden (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Präsenz-/Auto-Connect-Signal (Heartbeat, Match).
 */
async function sendPresenceSignal(provider, payload) {
  const base = provider.endpoint || '/api/presence';
  const path = (provider.meta && provider.meta.heartbeatPath) || '/heartbeat';

  const res = await fetch(base + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    throw new Error(`Presence-Fehler (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}


