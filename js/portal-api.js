/**
 * portal-api.js
 * 
 * Robuste Fetch-Abstraktion für alle Datenquellen
 * Fallback auf statische JSON-Dateien für GitHub Pages
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

/**
 * Safe Fetch JSON - Fehlerbehandlung für alle Fetch-Calls
 */
export async function safeFetchJson(url, { signal } = {}) {
  try {
    const res = await fetch(url, { signal });

    if (!res.ok) {
      return {
        ok: false,
        error: `HTTP ${res.status} beim Laden von ${url}`,
        data: null,
      };
    }

    const data = await res.json();
    return { ok: true, error: null, data };
  } catch (err) {
    return {
      ok: false,
      error: `Fetch-Fehler für ${url}: ${err.message}`,
      data: null,
    };
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

