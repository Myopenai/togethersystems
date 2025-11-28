// mot-core.js
// Gemeinsames Frontend-Core-Modul für Together Systems
// - Verwaltet eine stabile userId pro Browser
// - Bietet Hash-Parsing
// - Hält einen einfachen Verified-Status (basierend auf lokal gespeicherten Daten)

export const MOT_STORAGE_KEYS = {
  USER_ID: 'mot_user_id_v1',
  VERIFIED: 'mot_verified_v1',
};

/**
 * Liefert eine stabile User-ID für diesen Browser.
 * Wenn noch keine existiert, wird eine zufällige Base62-ID erzeugt und gespeichert.
 */
export function getOrCreateUserId() {
  try {
    let uid = localStorage.getItem(MOT_STORAGE_KEYS.USER_ID);
    if (!uid) {
      uid = generateRandomId();
      localStorage.setItem(MOT_STORAGE_KEYS.USER_ID, uid);
    }
    return uid;
  } catch {
    // Fallback: einfache zufällige ID im RAM
    return generateRandomId();
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
    // Fallback falls kein crypto verfügbar
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

/**
 * Liest die Hash-Parameter der aktuellen URL in ein einfaches Objekt.
 * Beispiel: #mot=...&uid=... → { mot: '...', uid: '...' }
 */
export function parseHashParams() {
  const hash = window.location.hash && window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash || '';
  const params = new URLSearchParams(hash);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

/**
 * Markiert einen User lokal als "verified".
 * Erwartet ein Objekt mit mind. uid; zusätzliche Felder sind optional.
 */
export function markUserVerified({ uid, mot, ts, sig } = {}) {
  if (!uid) uid = getOrCreateUserId();
  try {
    localStorage.setItem(MOT_STORAGE_KEYS.USER_ID, uid);
    localStorage.setItem(
      MOT_STORAGE_KEYS.VERIFIED,
      JSON.stringify({ uid, mot: mot || null, ts: ts || null, sig: sig || null })
    );
  } catch {
    // Ignorieren, falls localStorage nicht verfügbar ist
  }
}

/**
 * Prüft, ob der User lokal als "verified" markiert ist.
 */
export function isUserVerified() {
  try {
    const raw = localStorage.getItem(MOT_STORAGE_KEYS.VERIFIED);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return !!(data && data.uid);
  } catch {
    return false;
  }
}

/**
 * Liefert den aktuellen User-Kontext:
 *  - uid: stabile User-ID
 *  - verified: bool, ob lokal als verifiziert markiert
 */
export function getUserContext() {
  const uid = getOrCreateUserId();
  const verified = isUserVerified();
  return { uid, verified };
}


