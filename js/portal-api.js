/**
 * portal-api.js
 * 
 * Robuste Fetch-Abstraktion für alle Datenquellen
 * Fallback auf statische JSON-Dateien für GitHub Pages
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

/**
 * ENV-Switch: Automatische Erkennung der Umgebung
 */
export function detectEnvironment() {
  // GitHub Pages Erkennung
  if (typeof location !== 'undefined') {
    if (location.hostname.includes('github.io') || location.hostname.includes('github.com')) {
      return 'github-pages';
    }
    if (location.hostname.includes('pages.dev') || location.hostname.includes('cloudflare')) {
      return 'cloudflare-pages';
    }
    if (location.protocol === 'file:') {
      return 'local';
    }
  }
  return 'unknown';
}

// ENV sofort setzen und exportieren
export const ENV = detectEnvironment();

/**
 * Safe Fetch JSON - Fehlerbehandlung für alle Fetch-Calls
 * TODSICHER: Kein 404 / JSON-Fehler killt die App mehr
 * Unterstützt GET und POST Requests
 */
export async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      ...options,
    });

    if (!res.ok) {
      // STUMM: Keine Console-Warnungen für 404/405 auf GitHub Pages
      if (ENV === 'github-pages' && (res.status === 404 || res.status === 405)) {
        return { ok: false, error: null, data: null, status: res.status, silent: true };
      }
      return { ok: false, error: `HTTP ${res.status}`, data: null, status: res.status };
    }

    // Für leere Responses (z.B. 204 No Content)
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return { ok: true, error: null, data: null, status: res.status };
    }

    const data = await res.json().catch(async () => {
      // Fallback: Versuche Text zu lesen
      const text = await res.text();
      return { message: text };
    });
    return { ok: true, error: null, data, status: res.status };
  } catch (err) {
    // STUMM: Keine Console-Errors für GitHub Pages
    if (ENV === 'github-pages') {
      return { ok: false, error: null, data: null, status: 0, silent: true };
    }
    return { ok: false, error: err.message, data: null, status: 0 };
  }
}

/**
 * URL-Mapper: Mappt Online-APIs auf Demo-Daten für GitHub Pages
 */
export function getVoucherSourceUrl() {
  if (ENV === 'github-pages' || ENV === 'local') {
    return './demo-data/vouchers.json';
  }
  return '/api/voucher/list';
}

export function getProvidersSourceUrl() {
  if (ENV === 'github-pages' || ENV === 'local') {
    return './config/providers.json';
  }
  return '/api/providers';
}

export function getInstrumentsSourceUrl() {
  if (ENV === 'github-pages' || ENV === 'local') {
    return './demo-data/instruments.json';
  }
  return '/api/instruments';
}

export function getMessagesSourceUrl() {
  if (ENV === 'github-pages' || ENV === 'local') {
    return './demo-data/messages.json';
  }
  return '/api/messages';
}

/**
 * Demo-Loader: Nutzt statische JSON-Dateien statt echter /api/*-Routen
 */
export async function loadProviders() {
  const url = getProvidersSourceUrl();
  return safeFetchJson(url);
}

export async function loadVouchers() {
  const url = getVoucherSourceUrl();
  return safeFetchJson(url);
}

export async function loadInstruments() {
  const url = getInstrumentsSourceUrl();
  return safeFetchJson(url);
}

export async function loadMessages() {
  const url = getMessagesSourceUrl();
  return safeFetchJson(url);
}

/**
 * Safe API Call - Versucht API, fällt auf JSON zurück
 */
export async function safeApiCall(apiUrl, jsonFallback) {
  // Versuche zuerst API (nur wenn nicht GitHub Pages)
  if (ENV !== 'github-pages' && ENV !== 'local') {
    const apiResult = await safeFetchJson(apiUrl);
    if (apiResult.ok) {
      return apiResult;
    }
  }
  
  // Fallback auf JSON
  return safeFetchJson(jsonFallback);
}

