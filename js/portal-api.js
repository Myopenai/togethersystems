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
 * Demo-Loader: Nutzt statische JSON-Dateien statt echter /api/*-Routen
 */

export async function loadProviders() {
  // Demo-Datei unter ./config/providers.json
  return safeFetchJson('./config/providers.json');
}

export async function loadVouchers() {
  // Demo-Datei unter ./demo-data/vouchers.json
  return safeFetchJson('./demo-data/vouchers.json');
}

export async function loadInstruments() {
  // Demo-Datei unter ./demo-data/instruments.json
  return safeFetchJson('./demo-data/instruments.json');
}

export async function loadMessages() {
  // Demo-Datei unter ./demo-data/messages.json
  return safeFetchJson('./demo-data/messages.json');
}

/**
 * Safe API Call - Versucht API, fällt auf JSON zurück
 */
export async function safeApiCall(apiUrl, jsonFallback) {
  // Versuche zuerst API
  const apiResult = await safeFetchJson(apiUrl);
  if (apiResult.ok) {
    return apiResult;
  }
  
  // Fallback auf JSON
  return safeFetchJson(jsonFallback);
}

