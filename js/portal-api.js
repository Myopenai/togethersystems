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

// ENV_SAFE für Browser - verhindert "ENV is not defined" Fehler
if (typeof window !== 'undefined') {
  window.ENV_SAFE = {
    MODE: ENV,
    AUTO_FIX_ENABLED: ENV !== 'github-pages',
    API_BASE_URL: ENV === 'github-pages' ? null : '/api',
    IS_GITHUB_PAGES: ENV === 'github-pages',
    IS_CLOUDFLARE_PAGES: ENV === 'cloudflare-pages',
    IS_LOCAL: ENV === 'local'
  };
  
  // Legacy Support: ENV als String auch verfügbar machen
  window.ENV = ENV;
}

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
 * ECHTE API-URLs - KEINE DEMO-DATEN MEHR
 * Alle Funktionen verwenden echte Backend-APIs
 * Wenn APIs nicht verfügbar sind, wird eine klare Fehlermeldung angezeigt
 */
export function getVoucherSourceUrl() {
  return '/api/voucher/list';
}

export function getProvidersSourceUrl() {
  return '/api/providers';
}

export function getInstrumentsSourceUrl() {
  return '/api/instruments';
}

export function getMessagesSourceUrl() {
  return '/api/messages';
}

/**
 * ECHTE API-Loader - KEINE DEMO-DATEN
 */
export async function loadProviders() {
  const url = getProvidersSourceUrl();
  const result = await safeFetchJson(url);
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    // Klare Fehlermeldung statt Demo-Daten
    return { 
      ok: false, 
      error: 'Backend-API nicht verfügbar. Für volle Funktionalität deploye auf Cloudflare Pages mit aktiviertem Backend.', 
      data: null, 
      status: result.status 
    };
  }
  return result;
}

export async function loadVouchers() {
  const url = getVoucherSourceUrl();
  const result = await safeFetchJson(url);
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    return { 
      ok: false, 
      error: 'Backend-API nicht verfügbar. Für volle Funktionalität deploye auf Cloudflare Pages mit aktiviertem Backend.', 
      data: null, 
      status: result.status 
    };
  }
  return result;
}

export async function loadInstruments() {
  const url = getInstrumentsSourceUrl();
  const result = await safeFetchJson(url);
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    return { 
      ok: false, 
      error: 'Backend-API nicht verfügbar. Für volle Funktionalität deploye auf Cloudflare Pages mit aktiviertem Backend.', 
      data: null, 
      status: result.status 
    };
  }
  return result;
}

export async function loadMessages() {
  const url = getMessagesSourceUrl();
  const result = await safeFetchJson(url);
  if (!result.ok && (result.status === 404 || result.status === 405)) {
    return { 
      ok: false, 
      error: 'Backend-API nicht verfügbar. Für volle Funktionalität deploye auf Cloudflare Pages mit aktiviertem Backend.', 
      data: null, 
      status: result.status 
    };
  }
  return result;
}

/**
 * Safe API Call - Versucht API, KEIN Fallback auf Demo-Daten
 */
export async function safeApiCall(apiUrl, jsonFallback) {
  // IMMER echte API verwenden
  const apiResult = await safeFetchJson(apiUrl);
  if (apiResult.ok) {
    return apiResult;
  }
  
  // KEIN Fallback auf Demo-Daten - klare Fehlermeldung
  return { 
    ok: false, 
    error: 'Backend-API nicht verfügbar. Für volle Funktionalität deploye auf Cloudflare Pages mit aktiviertem Backend.', 
    data: null, 
    status: apiResult.status || 0 
  };
}

