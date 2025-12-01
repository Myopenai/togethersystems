// T,. THYNK - PORTAL INTEGRATION
// Phase 2: Integration in manifest-portal.html
// Status: 🔬 LABORPHASE

/**
 * THYNK Integration für Online-Portal
 * Asset-Liste, Trading, Assessment, Real-time Updates
 */

class THYNKPortalIntegration {
  constructor() {
    this.thynk = null;
    this.userId = null;
    this.assets = [];
    this.selectedAsset = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // THYNK Labor-Prototyp laden
    if (typeof THYNKLaborPrototyp !== 'undefined') {
      this.thynk = window.thynkLabor || new THYNKLaborPrototyp();
      await this.thynk.init();
    } else {
      console.error('THYNK Labor-Prototyp nicht gefunden');
      return;
    }

    // User-ID aus Portal-Kontext
    this.userId = this.getUserId();
    
    // UI erstellen
    this.createTHYNKSection();
    
    // Assets laden
    await this.loadAssets();
    
    // Real-time Updates
    this.startRealTimeUpdates();
    
    this.initialized = true;
    console.log('✅ THYNK Portal Integration bereit');
  }

  getUserId() {
    // Versuche User-ID aus verschiedenen Quellen zu bekommen
    if (typeof getUserContext === 'function') {
      const context = getUserContext();
      return context?.uid || context?.thinker_id || 'unknown';
    }
    return localStorage.getItem('mot_user_id_v1') || 'unknown';
  }

  createTHYNKSection() {
    // Prüfe ob THYNK-Section bereits existiert
    if (document.getElementById('thynk-section')) return;

    // Finde passenden Platz im Portal (z.B. nach Voucher-Section)
    const portalContent = document.querySelector('.wr') || document.body;
    
    const thynkSection = document.createElement('div');
    thynkSection.id = 'thynk-section';
    thynkSection.className = 'panel pad';
    thynkSection.style.marginTop = '18px';
    thynkSection.innerHTML = `
      <div class="title">💡 THYNK - Gedankengut-Marktplatz</div>
      <div class="row" style="margin-top: 12px;">
        <button id="thynk-create-asset" class="btn">Neues Asset erstellen</button>
        <button id="thynk-refresh" class="btn alt">Aktualisieren</button>
      </div>
      <div id="thynk-assets-list" style="margin-top: 16px;">
        <div class="muted">Lade Assets...</div>
      </div>
      <div id="thynk-asset-detail" style="display: none; margin-top: 16px;">
        <div class="card pad" style="margin-top: 12px;">
          <h3 id="thynk-asset-title"></h3>
          <div id="thynk-asset-info" class="muted"></div>
          <div id="thynk-asset-market" style="margin-top: 12px;"></div>
          <div id="thynk-asset-trading" style="margin-top: 12px;"></div>
        </div>
      </div>
    `;

    // Einfügen nach Voucher-Section oder am Ende
    const voucherSection = document.querySelector('[id*="voucher"]') || document.querySelector('.panel');
    if (voucherSection && voucherSection.parentNode) {
      voucherSection.parentNode.insertBefore(thynkSection, voucherSection.nextSibling);
    } else {
      portalContent.appendChild(thynkSection);
    }

    // Event Listeners
    document.getElementById('thynk-create-asset')?.addEventListener('click', () => this.showCreateAssetModal());
    document.getElementById('thynk-refresh')?.addEventListener('click', () => this.loadAssets());
  }

  async loadAssets() {
    if (!this.thynk) return;

    const assetsList = document.getElementById('thynk-assets-list');
    if (!assetsList) return;

    assetsList.innerHTML = '<div class="muted">Lade Assets...</div>';

    try {
      this.assets = this.thynk.getAllAssets();
      
      if (this.assets.length === 0) {
        assetsList.innerHTML = '<div class="muted">Noch keine Assets vorhanden. Erstelle das erste Asset!</div>';
        return;
      }

      // Asset-Liste rendern
      assetsList.innerHTML = this.assets.map(asset => {
        const market = this.thynk.getMarket(asset.id);
        const assessment = this.thynk.getAssessment(asset.id);
        const lastPrice = market?.market.lastTradePrice?.toString() || '0';
        const confidence = assessment?.aggregated.marketConfidence?.toString() || '0';

        return `
          <div class="entry" style="cursor: pointer;" onclick="thynkPortal.selectAsset('${asset.id}')">
            <h3>${this.escapeHtml(asset.metadata.title)}</h3>
            <div class="meta">
              <span>Typ: ${asset.type}</span> | 
              <span>Ersteller: ${asset.ownership.creatorId}</span> | 
              <span>Letzter Preis: ${lastPrice}</span> | 
              <span>Confidence: ${confidence}</span>
            </div>
            <div style="margin-top: 8px; color: var(--muted); font-size: 12px;">
              ${this.escapeHtml(asset.metadata.description.substring(0, 100))}...
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Fehler beim Laden der Assets:', error);
      assetsList.innerHTML = '<div class="warn">Fehler beim Laden der Assets</div>';
    }
  }

  selectAsset(assetId) {
    this.selectedAsset = assetId;
    this.showAssetDetail(assetId);
  }

  async showAssetDetail(assetId) {
    const asset = this.thynk.getAsset(assetId);
    const market = this.thynk.getMarket(assetId);
    const assessment = this.thynk.getAssessment(assetId);
    
    if (!asset) return;

    const detailDiv = document.getElementById('thynk-asset-detail');
    const titleDiv = document.getElementById('thynk-asset-title');
    const infoDiv = document.getElementById('thynk-asset-info');
    const marketDiv = document.getElementById('thynk-asset-market');
    const tradingDiv = document.getElementById('thynk-asset-trading');

    if (!detailDiv) return;

    detailDiv.style.display = 'block';

    // Titel
    if (titleDiv) {
      titleDiv.textContent = asset.metadata.title;
    }

    // Info
    if (infoDiv) {
      infoDiv.innerHTML = `
        <div><strong>Beschreibung:</strong> ${this.escapeHtml(asset.metadata.description)}</div>
        <div style="margin-top: 8px;"><strong>Tags:</strong> ${asset.metadata.tags.join(', ')}</div>
        <div style="margin-top: 8px;"><strong>Ersteller:</strong> ${asset.ownership.creatorId}</div>
        <div style="margin-top: 8px;"><strong>Besitzer:</strong> ${asset.ownership.currentOwnerId}</div>
      `;
    }

    // Market-Daten
    if (marketDiv && market) {
      marketDiv.innerHTML = `
        <div class="title">Marktdaten</div>
        <div class="row" style="gap: 16px; margin-top: 8px;">
          <div><strong>Letzter Preis:</strong> ${market.market.lastTradePrice.toString()}</div>
          <div><strong>Bid:</strong> ${market.market.currentBid.toString()}</div>
          <div><strong>Ask:</strong> ${market.market.currentAsk.toString()}</div>
          <div><strong>Volumen 24h:</strong> ${market.market.volume24h.toString()}</div>
        </div>
        ${assessment ? `
          <div style="margin-top: 12px;">
            <strong>Market Confidence:</strong> ${assessment.aggregated.marketConfidence.toString()}
          </div>
        ` : ''}
      `;
    }

    // Trading-Interface
    if (tradingDiv) {
      tradingDiv.innerHTML = `
        <div class="title">Trading</div>
        <div class="row" style="margin-top: 12px; gap: 8px;">
          <input type="number" id="thynk-order-price" placeholder="Preis" step="0.01" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border);">
          <input type="number" id="thynk-order-quantity" placeholder="Menge" step="0.01" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border);">
        </div>
        <div class="row" style="margin-top: 8px; gap: 8px;">
          <button id="thynk-place-bid" class="btn">Bid platzieren</button>
          <button id="thynk-place-ask" class="btn alt">Ask platzieren</button>
        </div>
        <div id="thynk-order-status" style="margin-top: 8px;"></div>
      `;

      // Event Listeners für Trading
      document.getElementById('thynk-place-bid')?.addEventListener('click', () => this.placeOrder('bid', assetId));
      document.getElementById('thynk-place-ask')?.addEventListener('click', () => this.placeOrder('ask', assetId));
    }

    // Scroll zu Detail
    detailDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async placeOrder(type, assetId) {
    const priceInput = document.getElementById('thynk-order-price');
    const quantityInput = document.getElementById('thynk-order-quantity');
    const statusDiv = document.getElementById('thynk-order-status');

    if (!priceInput || !quantityInput) return;

    const price = priceInput.value;
    const quantity = quantityInput.value;

    if (!price || !quantity) {
      if (statusDiv) statusDiv.innerHTML = '<div class="warn">Bitte Preis und Menge angeben</div>';
      return;
    }

    try {
      const order = await this.thynk.placeOrder({
        assetId: assetId,
        type: type,
        price: price,
        quantity: quantity,
        userId: this.userId
      });

      if (statusDiv) {
        statusDiv.innerHTML = `<div class="ok">Order ${order.id} erfolgreich platziert!</div>`;
      }

      // Market-Daten aktualisieren
      await this.loadAssets();
      this.showAssetDetail(assetId);
    } catch (error) {
      console.error('Fehler beim Platzieren der Order:', error);
      if (statusDiv) {
        statusDiv.innerHTML = `<div class="bad">Fehler: ${error.message}</div>`;
      }
    }
  }

  showCreateAssetModal() {
    // Einfaches Modal für Asset-Erstellung
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
      <div class="card pad" style="max-width: 500px; width: 90%; background: var(--card);">
        <h3>Neues Asset erstellen</h3>
        <label>Titel:</label>
        <input type="text" id="thynk-new-title" style="width: 100%; padding: 8px; margin-top: 4px; border-radius: 8px; border: 1px solid var(--border);">
        <label style="margin-top: 12px;">Beschreibung:</label>
        <textarea id="thynk-new-description" style="width: 100%; padding: 8px; margin-top: 4px; border-radius: 8px; border: 1px solid var(--border); min-height: 100px;"></textarea>
        <label style="margin-top: 12px;">Typ:</label>
        <select id="thynk-new-type" style="width: 100%; padding: 8px; margin-top: 4px; border-radius: 8px; border: 1px solid var(--border);">
          <option value="idea">Idee</option>
          <option value="text">Text</option>
          <option value="image">Bild</option>
          <option value="code">Code</option>
          <option value="design">Design</option>
        </select>
        <label style="margin-top: 12px;">Basis-Preis:</label>
        <input type="number" id="thynk-new-price" value="0" step="0.01" style="width: 100%; padding: 8px; margin-top: 4px; border-radius: 8px; border: 1px solid var(--border);">
        <div class="row" style="margin-top: 16px; gap: 8px;">
          <button id="thynk-create-submit" class="btn">Erstellen</button>
          <button id="thynk-create-cancel" class="btn alt">Abbrechen</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('thynk-create-submit')?.addEventListener('click', async () => {
      const title = document.getElementById('thynk-new-title')?.value;
      const description = document.getElementById('thynk-new-description')?.value;
      const type = document.getElementById('thynk-new-type')?.value;
      const price = document.getElementById('thynk-new-price')?.value;

      if (!title) {
        alert('Bitte Titel angeben');
        return;
      }

      try {
        await this.thynk.createAsset({
          title: title,
          description: description,
          type: type,
          creatorId: this.userId,
          basePrice: price || '0'
        });

        modal.remove();
        await this.loadAssets();
      } catch (error) {
        console.error('Fehler beim Erstellen des Assets:', error);
        alert('Fehler: ' + error.message);
      }
    });

    document.getElementById('thynk-create-cancel')?.addEventListener('click', () => {
      modal.remove();
    });
  }

  startRealTimeUpdates() {
    // Alle 5 Sekunden aktualisieren
    setInterval(() => {
      if (this.selectedAsset) {
        this.showAssetDetail(this.selectedAsset);
      }
    }, 5000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Globaler Export
window.THYNKPortalIntegration = THYNKPortalIntegration;

// Auto-Init wenn geladen
if (typeof window !== 'undefined') {
  window.thynkPortal = new THYNKPortalIntegration();
  
  // Warte auf DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.thynkPortal.init();
    });
  } else {
    window.thynkPortal.init();
  }
}

