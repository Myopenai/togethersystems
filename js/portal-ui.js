/**
 * portal-ui.js
 * 
 * UI-Binding-Logik für alle Tabellen und Bereiche
 * Füllt alle Tabellen aus JSON-Dateien
 * Zeigt Fehler an, statt sie totzuschweigen
 * 
 * Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

import {
  loadProviders,
  loadVouchers,
  loadInstruments,
  loadMessages,
} from './portal-api.js';

// Helper: Element holen (ohne dass alles crasht)
function $(selector) {
  return document.querySelector(selector);
}

function createCell(text) {
  const td = document.createElement('td');
  td.textContent = text || '-';
  return td;
}

// --- PROVIDERS („Milchkannen-Übersicht") --------------------------

async function initProviders() {
  const suppliersList = $('#suppliersList'); // <div id="suppliersList">

  if (!suppliersList) {
    console.warn('Provider-Liste nicht gefunden im DOM');
    return;
  }

  suppliersList.textContent = 'Lade Provider...';

  const { ok, error, data } = await loadProviders();

  if (!ok || !data || !Array.isArray(data.providers)) {
    suppliersList.innerHTML = `<div style="color: #ef4444; padding: 8px;">❌ ${error || 'Keine Provider-Daten gefunden.'}</div>`;
    return;
  }

  let html = '';
  for (const p of data.providers) {
    html += `
      <div style="border: 1px solid var(--border); border-radius: 8px; padding: 8px; margin-bottom: 6px;">
        <div style="font-weight: 600;">${p.name || '-'}</div>
        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
          ID: ${p.id || '-'} | Typ: ${p.type || '-'} | Region: ${p.region || '-'} | Status: ${p.status || '-'}
        </div>
      </div>
    `;
  }

  suppliersList.innerHTML = html || '<div style="color: var(--muted);">Keine Provider gefunden.</div>';
  console.log(`[portal-ui.js] ✅ Provider geladen: ${data.providers.length}`);
}

// --- VOUCHER & TERMINE --------------------------------------------

async function initVouchers() {
  const voucherList = $('#voucherList'); // <div id="voucherList">
  const slotList = $('#slotList');      // <div id="slotList">

  if (!voucherList || !slotList) {
    console.warn('Voucher-Listen nicht gefunden im DOM');
    return;
  }

  voucherList.textContent = 'Lade Vouchers...';
  slotList.textContent = 'Lade Slots...';

  const { ok, error, data } = await loadVouchers();

  if (!ok || !data) {
    voucherList.innerHTML = `<div style="color: #ef4444; padding: 8px;">❌ ${error || 'Fehler beim Laden der Voucher-Daten.'}</div>`;
    slotList.innerHTML = `<div style="color: #ef4444; padding: 8px;">❌ ${error || 'Fehler beim Laden der Slot-Daten.'}</div>`;
    return;
  }

  const vouchers = Array.isArray(data.vouchers) ? data.vouchers : [];
  const slots = Array.isArray(data.slots) ? data.slots : [];

  // Vouchers
  if (vouchers.length === 0) {
    voucherList.innerHTML = '<div style="color: var(--muted); padding: 8px;">Noch keine Vouchers gefunden.</div>';
  } else {
    let html = '';
    for (const v of vouchers) {
      html += `
        <div class="voucher-card" style="margin-bottom: 8px;">
          <div class="voucher-card-header">
            <strong>${v.title || '-'}</strong>
            <span class="voucher-badge">${v.serviceType || '-'}</span>
          </div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
            ID: ${v.id || '-'} | Rolle: ${v.role || '-'}
          </div>
        </div>
      `;
    }
    voucherList.innerHTML = html;
  }

  // Slots (aggregiert pro Tag)
  if (slots.length === 0) {
    slotList.innerHTML = '<div style="color: var(--muted); padding: 8px;">Noch keine Slots gefunden.</div>';
  } else {
    let html = '';
    for (const s of slots) {
      html += `
        <div style="border: 1px solid var(--border); border-radius: 8px; padding: 8px; margin-bottom: 6px;">
          <div style="font-weight: 600;">${s.date || '-'}</div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
            Frei: ${s.freeSlots ?? 0} / Gesamt: ${s.totalSlots ?? 0}
          </div>
        </div>
      `;
    }
    slotList.innerHTML = html;
  }

  console.log(`[portal-ui.js] ✅ Vouchers: ${vouchers.length} · Tage mit Slots: ${slots.length}`);
}

// --- GLEICHGEWICHTS-BÖRSE ----------------------------------------

async function initInstruments() {
  const instrumentsList = $('#instrumentsList'); // <div id="instrumentsList">

  if (!instrumentsList) {
    console.warn('Instrumente-Liste nicht gefunden im DOM');
    return;
  }

  instrumentsList.textContent = 'Lade handelbare Instrumente...';

  const { ok, error, data } = await loadInstruments();

  if (!ok || !data || !Array.isArray(data.instruments)) {
    instrumentsList.innerHTML = `<div style="color: #ef4444; padding: 8px;">❌ ${error || 'Keine Instrumente gefunden.'}</div>`;
    return;
  }

  if (data.instruments.length === 0) {
    instrumentsList.innerHTML = '<div style="color: var(--muted); padding: 8px;">Noch keine Instrumente gefunden.</div>';
    return;
  }

  let html = '';
  for (const inst of data.instruments) {
    const netValue = inst.netValue ?? 0;
    const valueColor = netValue >= 0 ? '#10b981' : '#ef4444';
    html += `
      <div class="voucher-card" style="margin-bottom: 8px;">
        <div class="voucher-card-header">
          <strong>${inst.name || '-'}</strong>
          <span class="voucher-badge" style="color: ${valueColor};">${netValue >= 0 ? '+' : ''}${netValue}</span>
        </div>
        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
          ID: ${inst.id || '-'} | Kategorie: ${inst.category || '-'} | Status: ${inst.status || '-'}
        </div>
      </div>
    `;
  }

  instrumentsList.innerHTML = html;
  console.log(`[portal-ui.js] ✅ Instrumente geladen: ${data.instruments.length}`);
}

// --- NACHRICHTEN (Eingang) ---------------------------------------

async function initMessages() {
  const messagesList = $('#messagesList'); // <div id="messagesList">

  if (!messagesList) {
    console.warn('Nachrichten-Liste nicht gefunden im DOM');
    return;
  }

  messagesList.textContent = 'Lade Demo-Nachrichten...';

  const { ok, error, data } = await loadMessages();

  if (!ok || !data || !Array.isArray(data.messages)) {
    messagesList.innerHTML = `<div style="color: #ef4444; padding: 8px;">❌ ${error || 'Keine Nachrichten gefunden.'}</div>`;
    return;
  }

  if (data.messages.length === 0) {
    messagesList.innerHTML = '<div style="color: var(--muted); padding: 8px;">Noch keine Nachrichten gefunden.</div>';
    return;
  }

  let html = '';
  for (const msg of data.messages) {
    const statusColor = msg.status === 'neu' ? '#10b981' : 'var(--muted)';
    html += `
      <div class="voucher-card" style="margin-bottom: 8px;">
        <div class="voucher-card-header">
          <strong>${msg.subject || '-'}</strong>
          <span class="voucher-badge" style="color: ${statusColor};">${msg.status ?? 'neu'}</span>
        </div>
        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
          Von: ${msg.from || '-'}
        </div>
        <div style="font-size: 12px; margin-top: 6px; color: var(--ink);">
          ${msg.preview || '-'}
        </div>
      </div>
    `;
  }

  messagesList.innerHTML = html;
  console.log(`[portal-ui.js] ✅ Nachrichten geladen: ${data.messages.length}`);
}

// --- JSON IMPORT (Bereich „JSON importieren / Payload anzeigen") ---

function initJsonImport() {
  const fileInput = $('#jsonFile');   // <input type="file" ... id="jsonFile">
  const payloadArea = $('#payloadBox');      // <pre id="payloadBox">

  if (!fileInput || !payloadArea) {
    console.warn('JSON-Import-Elemente nicht gefunden im DOM');
    return;
  }

  // Prüfe ob Event-Listener bereits vorhanden ist
  if (fileInput.dataset.portalUiInitialized === 'true') {
    return; // Bereits initialisiert
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      payloadArea.textContent = JSON.stringify(json, null, 2);
      payloadArea.hidden = false;
      console.log('[portal-ui.js] ✅ JSON erfolgreich geladen:', file.name);
    } catch (err) {
      payloadArea.textContent = `❌ Fehler beim Lesen/Parsen: ${err.message}`;
      payloadArea.hidden = false;
      console.error('[portal-ui.js] JSON-Import-Fehler:', err);
    }
  });

  fileInput.dataset.portalUiInitialized = 'true';
}

// --- Initialisierung ------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  console.log('[portal-ui.js] Initialisiere Portal-UI...');
  
  initProviders();
  initVouchers();
  initInstruments();
  initMessages();
  initJsonImport();

  console.log('[portal-ui.js] Portal-UI initialisiert.');
});

