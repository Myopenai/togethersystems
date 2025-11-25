// Gleichgewichts-Börse Frontend-Integration für manifest-portal.html

let BALANCED_EXCHANGE_API_BASE = null;

// API-Base automatisch erkennen
(function detectBalancedExchangeApiBase() {
  if (location.hostname.includes('github.io') || location.hostname.includes('github.com')) {
    BALANCED_EXCHANGE_API_BASE = null;
    return;
  }
  if (location.hostname.includes('pages.dev') || location.hostname.includes('workers.dev') || location.hostname.includes('cloudflare')) {
    BALANCED_EXCHANGE_API_BASE = '/api';
    return;
  }
  // Test ob API verfügbar
  fetch('/api/instruments?status=active')
    .then(res => {
      if (res.ok || res.status === 400) {
        BALANCED_EXCHANGE_API_BASE = '/api';
      }
    })
    .catch(() => {
      BALANCED_EXCHANGE_API_BASE = null;
    })
    .catch(() => {
      BALANCED_EXCHANGE_API_BASE = null;
    });
})();

// Lade aktive Instrumente
async function loadInstruments() {
  const container = document.getElementById('instrumentsList');
  if (!container) return;
  
  if (!BALANCED_EXCHANGE_API_BASE) {
    container.innerHTML = '<div class="muted">API nicht verfügbar. Bitte deploye auf Cloudflare Pages.</div>';
    return;
  }
  
  container.innerHTML = '<div class="muted">Lade Instrumente …</div>';
  
  try {
    const res = await fetch(`${BALANCED_EXCHANGE_API_BASE}/instruments?status=active`);
    if (!res.ok) {
      container.innerHTML = `<div class="muted">Fehler: ${res.status}</div>`;
      return;
    }
    const data = res.ok ? await res.json().catch(e => { console.error('JSON parse error:', e); return { data: { instruments: [] } }; }) : null;
    if (!data) {
      container.innerHTML = `<div class="muted">Fehler beim Laden der Daten.</div>`;
      return;
    }
    const instruments = data.data?.instruments || [];
    
    if (!instruments.length) {
      container.innerHTML = '<div class="muted">Noch keine aktiven Instrumente verfügbar.</div>';
      return;
    }
    
    container.innerHTML = '';
    instruments.forEach(inst => {
      const card = document.createElement('div');
      card.className = 'voucher-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="voucher-card-header">
          <div>
            <div style="font-size:13px;font-weight:600;">${escapeHtml(inst.symbol)}</div>
            <div class="voucher-meta">${escapeHtml(inst.name || '')}</div>
          </div>
          <span class="voucher-badge" style="background:rgba(34,197,94,0.2);color:#22c55e;">Netto: ${formatCurrency(inst.net_value)}</span>
        </div>
        <div class="voucher-meta">${escapeHtml(inst.description || '')}</div>
      `;
      card.addEventListener('click', () => showInstrumentDetails(inst.id));
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div class="muted">Fehler: ${escapeHtml(err.message)}</div>`;
  }
}

// Zeige Instrument-Details mit vollständiger Waage
async function showInstrumentDetails(instrumentId) {
  const container = document.getElementById('balanceWaage');
  if (!container || !BALANCED_EXCHANGE_API_BASE) return;
  
  container.innerHTML = '<div class="muted">Lade Details …</div>';
  
  try {
    const res = await fetch(`${BALANCED_EXCHANGE_API_BASE}/instruments/${instrumentId}`);
    if (!res.ok) {
      container.innerHTML = `<div class="muted">Fehler: ${res.status}</div>`;
      return;
    }
    const data = res.ok ? await res.json().catch(e => { console.error('JSON parse error:', e); return null; }) : null;
    if (!data) {
      container.innerHTML = `<div class="muted">Fehler beim Laden der Details.</div>`;
      return;
    }
    const instrument = data.data?.instrument;
    const balance = data.data?.balance;
    
    if (!instrument || !balance) {
      container.innerHTML = '<div class="muted">Details nicht gefunden.</div>';
      return;
    }
    
    // Waage visualisieren
    const netValue = balance.net_value;
    const totalPositive = balance.total_benefit + balance.total_income;
    const totalNegative = balance.total_expense + balance.total_damage + balance.total_risk;
    
    container.innerHTML = `
      <div style="margin-bottom:12px;">
        <strong>${escapeHtml(instrument.symbol)}</strong>
        <div class="muted" style="font-size:11px;margin-top:2px;">${escapeHtml(instrument.name || '')}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:12px;background:rgba(34,197,94,0.1);border-radius:8px;">
        <div>
          <div class="muted" style="font-size:11px;">Netto-Wert</div>
          <div style="font-size:24px;font-weight:700;color:${netValue > 0 ? '#22c55e' : '#ef4444'};">${formatCurrency(netValue)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="padding:8px;background:rgba(34,197,94,0.1);border-radius:8px;border-left:3px solid #22c55e;">
          <div class="muted" style="font-size:10px;">NUTZEN</div>
          <div style="font-size:16px;font-weight:600;color:#22c55e;">${formatCurrency(totalPositive)}</div>
          <div class="muted" style="font-size:10px;margin-top:4px;">
            Einnahmen: ${formatCurrency(balance.total_income)}<br>
            Nutzen: ${formatCurrency(balance.total_benefit)}
          </div>
        </div>
        <div style="padding:8px;background:rgba(239,68,68,0.1);border-radius:8px;border-left:3px solid #ef4444;">
          <div class="muted" style="font-size:10px;">KOSTEN</div>
          <div style="font-size:16px;font-weight:600;color:#ef4444;">${formatCurrency(totalNegative)}</div>
          <div class="muted" style="font-size:10px;margin-top:4px;">
            Ausgaben: ${formatCurrency(balance.total_expense)}<br>
            Schäden: ${formatCurrency(balance.total_damage)}<br>
            Risiken: ${formatCurrency(balance.total_risk)}
          </div>
        </div>
      </div>
      <div style="margin-top:12px;padding:8px;background:#0b0f14;border-radius:8px;font-size:11px;" class="muted">
        <strong>Transparenz-Prinzip:</strong> Alle Kosten und Nutzen sind sichtbar. 
        Nur positive Netto-Werte werden zu handelbaren Instrumenten.
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="muted">Fehler: ${escapeHtml(err.message)}</div>`;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value || 0);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export für globale Nutzung
window.loadInstruments = loadInstruments;
window.showInstrumentDetails = showInstrumentDetails;

