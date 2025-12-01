// T,. THYNK - OSTOSOS SYSTEM-LEVEL INTEGRATION
// Phase 2: Integration in OSTOSOS Operating System
// Status: 🔬 LABORPHASE

/**
 * THYNK System-Level Service für OSTOSOS
 * Cross-App API, Background-Processing, Native Integration
 */

class THYNKOSIntegration {
  constructor() {
    this.thynk = null;
    this.systemService = null;
    this.crossAppAPI = null;
    this.backgroundProcessor = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // THYNK Labor-Prototyp laden
    if (typeof THYNKLaborPrototyp !== 'undefined') {
      this.thynk = new THYNKLaborPrototyp();
      await this.thynk.init();
    } else {
      console.error('THYNK Labor-Prototyp nicht gefunden');
      return;
    }

    // System-Level Service initialisieren
    this.initSystemService();
    
    // Cross-App API initialisieren
    this.initCrossAppAPI();
    
    // Background Processor starten
    this.startBackgroundProcessor();
    
    // UI in OSTOSOS integrieren
    this.integrateIntoOS();
    
    this.initialized = true;
    console.log('✅ THYNK OS Integration bereit');
  }

  initSystemService() {
    // System-Level Service für THYNK
    this.systemService = {
      getAsset: (assetId) => this.thynk.getAsset(assetId),
      getMarket: (assetId) => this.thynk.getMarket(assetId),
      getAssessment: (assetId) => this.thynk.getAssessment(assetId),
      createAsset: (data) => this.thynk.createAsset(data),
      placeOrder: (data) => this.thynk.placeOrder(data),
      addAssessment: (data) => this.thynk.addAssessment(data),
      getAllAssets: () => this.thynk.getAllAssets(),
      getRecentTrades: (assetId, limit) => this.thynk.getRecentTrades(assetId, limit)
    };

    // Global verfügbar machen
    window.THYNKSystemService = this.systemService;
  }

  initCrossAppAPI() {
    // Cross-App API für alle Apps im OS
    this.crossAppAPI = {
      // Asset-Erstellung von jeder App
      createAsset: async (appId, assetData) => {
        const asset = await this.thynk.createAsset({
          ...assetData,
          sourceApp: appId
        });
        return asset;
      },
      
      // Asset-Suche von jeder App
      searchAssets: (query) => {
        const allAssets = this.thynk.getAllAssets();
        const lowerQuery = query.toLowerCase();
        return allAssets.filter(asset => 
          asset.metadata.title.toLowerCase().includes(lowerQuery) ||
          asset.metadata.description.toLowerCase().includes(lowerQuery) ||
          asset.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },
      
      // Market-Daten von jeder App
      getMarketData: (assetId) => {
        return this.thynk.getMarket(assetId);
      },
      
      // Trading von jeder App
      trade: async (appId, orderData) => {
        return await this.thynk.placeOrder({
          ...orderData,
          sourceApp: appId
        });
      }
    };

    // Global verfügbar machen
    window.THYNKCrossAppAPI = this.crossAppAPI;
  }

  startBackgroundProcessor() {
    // Background-Processing für Trading-Engine
    this.backgroundProcessor = {
      interval: null,
      start: () => {
        if (this.backgroundProcessor.interval) return;
        
        this.backgroundProcessor.interval = setInterval(() => {
          // Order-Matching läuft bereits in THYNK
          // Hier können zusätzliche Background-Tasks laufen
          this.processBackgroundTasks();
        }, 2000); // Alle 2 Sekunden
      },
      stop: () => {
        if (this.backgroundProcessor.interval) {
          clearInterval(this.backgroundProcessor.interval);
          this.backgroundProcessor.interval = null;
        }
      }
    };

    this.backgroundProcessor.start();
  }

  processBackgroundTasks() {
    // Zusätzliche Background-Tasks
    // z.B. Assessment-Aggregation, Market-Analyse, etc.
    
    // Market-Statistiken aktualisieren
    for (const assetId of this.thynk.tradingMarkets.keys()) {
      const market = this.thynk.getMarket(assetId);
      if (market && market.trades.length > 0) {
        // Volumen-Berechnungen, etc.
        // (wird bereits in THYNK gemacht, hier für Erweiterungen)
      }
    }
  }

  integrateIntoOS() {
    // THYNK-Section in OSTOSOS hinzufügen
    if (document.getElementById('thynk-os-section')) return;

    // Warte auf OSTOSOS-Struktur
    const checkOS = setInterval(() => {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;

      clearInterval(checkOS);

      // THYNK-Section erstellen
      const thynkSection = document.createElement('div');
      thynkSection.id = 'thynk-os-section';
      thynkSection.className = 'section';
      thynkSection.style.display = 'none';
      thynkSection.innerHTML = `
        <div class="welcome-card">
          <h1>💡 THYNK - Gedankengut-Marktplatz</h1>
          <p>System-Level Integration für Trading, Assessment und Asset-Management</p>
        </div>
        
        <div class="system-grid">
          <div class="system-card" onclick="thynkOS.showAssets()">
            <h3>📦 Assets</h3>
            <p>Alle Assets verwalten und durchsuchen</p>
            <span class="status-badge status-active" id="thynk-assets-count">0 Assets</span>
          </div>
          
          <div class="system-card" onclick="thynkOS.showTrading()">
            <h3>📈 Trading</h3>
            <p>Order-Book, Trades, Market-Daten</p>
            <span class="status-badge status-active" id="thynk-trades-count">0 Trades</span>
          </div>
          
          <div class="system-card" onclick="thynkOS.showAssessment()">
            <h3>⭐ Assessment</h3>
            <p>Bewertungen und Market Confidence</p>
            <span class="status-badge status-active">Aktiv</span>
          </div>
          
          <div class="system-card" onclick="thynkOS.showAPI()">
            <h3>🔌 Cross-App API</h3>
            <p>API für alle Apps im OS</p>
            <span class="status-badge status-active">Verfügbar</span>
          </div>
        </div>
        
        <div id="thynk-os-content" style="margin-top: 30px;"></div>
      `;

      mainContent.appendChild(thynkSection);

      // Navigation-Item hinzufügen
      this.addNavigationItem();
      
      // Initiale Daten laden
      this.updateStats();
    }, 100);
  }

  addNavigationItem() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const navItem = document.createElement('div');
    navItem.className = 'nav-item';
    navItem.innerHTML = '💡 THYNK';
    navItem.onclick = () => {
      showSection('thynk-os', navItem);
      this.showAssets();
    };

    // Nach "OS-System" einfügen
    const osSystemItem = Array.from(sidebar.querySelectorAll('.nav-item')).find(item => 
      item.textContent.includes('OS-System')
    );
    
    if (osSystemItem && osSystemItem.nextSibling) {
      sidebar.insertBefore(navItem, osSystemItem.nextSibling);
    } else {
      sidebar.appendChild(navItem);
    }
  }

  showAssets() {
    const contentDiv = document.getElementById('thynk-os-content');
    if (!contentDiv) return;

    const assets = this.thynk.getAllAssets();
    
    contentDiv.innerHTML = `
      <div class="welcome-card">
        <h2>Alle Assets (${assets.length})</h2>
        <div style="margin-top: 20px;">
          ${assets.map(asset => {
            const market = this.thynk.getMarket(asset.id);
            const price = market?.market.lastTradePrice?.toString() || '0';
            return `
              <div class="system-card" style="margin-bottom: 15px;">
                <h3>${this.escapeHtml(asset.metadata.title)}</h3>
                <p>${this.escapeHtml(asset.metadata.description.substring(0, 100))}...</p>
                <div style="margin-top: 10px;">
                  <span>Typ: ${asset.type}</span> | 
                  <span>Preis: ${price}</span> | 
                  <span>Ersteller: ${asset.ownership.creatorId}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  showTrading() {
    const contentDiv = document.getElementById('thynk-os-content');
    if (!contentDiv) return;

    const allTrades = [];
    for (const market of this.thynk.tradingMarkets.values()) {
      allTrades.push(...market.trades);
    }
    allTrades.sort((a, b) => b.timestamp - a.timestamp);

    contentDiv.innerHTML = `
      <div class="welcome-card">
        <h2>Recent Trades (${allTrades.length})</h2>
        <div style="margin-top: 20px;">
          ${allTrades.slice(0, 20).map(trade => `
            <div class="system-card" style="margin-bottom: 15px;">
              <h3>Trade ${trade.id}</h3>
              <p>Asset: ${trade.assetId}</p>
              <p>Buyer: ${trade.buyerId} → Seller: ${trade.sellerId}</p>
              <p>Price: ${trade.price.toString()} | Quantity: ${trade.quantity.toString()}</p>
              <p>Time: ${new Date(trade.timestamp).toLocaleString()}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  showAssessment() {
    const contentDiv = document.getElementById('thynk-os-content');
    if (!contentDiv) return;

    const assessments = Array.from(this.thynk.assessments.values());
    
    contentDiv.innerHTML = `
      <div class="welcome-card">
        <h2>Assessments (${assessments.length})</h2>
        <div style="margin-top: 20px;">
          ${assessments.map(assessment => {
            const asset = this.thynk.getAsset(assessment.assetId);
            return `
              <div class="system-card" style="margin-bottom: 15px;">
                <h3>${asset ? this.escapeHtml(asset.metadata.title) : assessment.assetId}</h3>
                <p>Market Confidence: ${assessment.aggregated.marketConfidence.toString()}</p>
                <p>Average Rating: ${assessment.aggregated.averageRating.toString()}</p>
                <p>Assessments: ${assessment.assessments.length}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  showAPI() {
    const contentDiv = document.getElementById('thynk-os-content');
    if (!contentDiv) return;

    contentDiv.innerHTML = `
      <div class="welcome-card">
        <h2>Cross-App API</h2>
        <div class="status-info">
          <h3>Verfügbare Methoden:</h3>
          <pre style="margin-top: 10px; background: var(--davinci-bg); padding: 15px; border-radius: 8px; overflow-x: auto;">
// Asset erstellen
THYNKCrossAppAPI.createAsset(appId, assetData)

// Assets suchen
THYNKCrossAppAPI.searchAssets(query)

// Market-Daten abrufen
THYNKCrossAppAPI.getMarketData(assetId)

// Trade ausführen
THYNKCrossAppAPI.trade(appId, orderData)

// System-Level Service
THYNKSystemService.getAsset(assetId)
THYNKSystemService.getMarket(assetId)
THYNKSystemService.getAllAssets()
          </pre>
        </div>
      </div>
    `;
  }

  updateStats() {
    const assetsCount = document.getElementById('thynk-assets-count');
    const tradesCount = document.getElementById('thynk-trades-count');
    
    if (assetsCount) {
      const count = this.thynk.getAllAssets().length;
      assetsCount.textContent = `${count} Assets`;
    }
    
    if (tradesCount) {
      let totalTrades = 0;
      for (const market of this.thynk.tradingMarkets.values()) {
        totalTrades += market.trades.length;
      }
      tradesCount.textContent = `${totalTrades} Trades`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Globaler Export
window.THYNKOSIntegration = THYNKOSIntegration;

// Auto-Init wenn geladen
if (typeof window !== 'undefined') {
  window.thynkOS = new THYNKOSIntegration();
  
  // Warte auf DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.thynkOS.init();
    });
  } else {
    window.thynkOS.init();
  }
}

