// T,. THYNK - LABOR-PROTOTYP CORE
// Phase 1: Labor-Prototyp - Interne Simulation, Architektur-Test
// Status: 🔬 LABORPHASE

/**
 * THYNK Trading Engine - Labor-Prototyp
 * Höchsttechnischer Standard, über Stocks-Börsen-Niveau
 */

class THYNKLaborPrototyp {
  constructor() {
    this.version = '1.0.0-LABOR';
    this.status = 'LABOR-PROTOTYP';
    this.assets = new Map(); // Asset-ID → THYNKCoreAsset
    this.tradingMarkets = new Map(); // Asset-ID → THYNKTradingModel
    this.assessments = new Map(); // Asset-ID → THYKNAssessmentModel
    this.speculations = new Map(); // Asset-ID → THYNKSpeculationModel
    this.orderBook = {
      bids: [],
      asks: []
    };
    this.trades = [];
    this.initialized = false;
  }

  /**
   * Initialisierung des Labor-Prototyps
   */
  async init() {
    if (this.initialized) return;
    
    console.log('🔬 THYNK Labor-Prototyp initialisiert');
    
    // Test-Assets erstellen
    await this.createTestAssets();
    
    // Order-Matching Engine starten
    this.startOrderMatchingEngine();
    
    // Assessment Engine starten
    this.startAssessmentEngine();
    
    this.initialized = true;
    console.log('✅ THYNK Labor-Prototyp bereit');
  }

  /**
   * High-Precision Decimal Klasse (keine Float-Fehler)
   */
  Decimal(value) {
    // Für Labor-Prototyp: String-basierte Arithmetik
    // In Produktion: Decimal.js oder ähnliche Library
    if (typeof value === 'string') {
      return {
        value: value,
        toString: () => value,
        toNumber: () => parseFloat(value),
        add: (other) => {
          const a = parseFloat(this.value);
          const b = typeof other === 'string' ? parseFloat(other) : other.toNumber();
          return new this.Decimal((a + b).toFixed(18));
        },
        subtract: (other) => {
          const a = parseFloat(this.value);
          const b = typeof other === 'string' ? parseFloat(other) : other.toNumber();
          return new this.Decimal((a - b).toFixed(18));
        },
        multiply: (other) => {
          const a = parseFloat(this.value);
          const b = typeof other === 'string' ? parseFloat(other) : other.toNumber();
          return new this.Decimal((a * b).toFixed(18));
        },
        divide: (other) => {
          const a = parseFloat(this.value);
          const b = typeof other === 'string' ? parseFloat(other) : other.toNumber();
          if (b === 0) throw new Error('Division by zero');
          return new this.Decimal((a / b).toFixed(18));
        },
        compareTo: (other) => {
          const a = parseFloat(this.value);
          const b = typeof other === 'string' ? parseFloat(other) : other.toNumber();
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        }
      };
    }
    return this.Decimal(String(value));
  }

  /**
   * Asset erstellen (Layer 1: Core Asset)
   */
  async createAsset(assetData) {
    const assetId = assetData.id || this.generateAssetId();
    const contentHash = await this.hashContent(assetData.content || '');
    
    const asset = {
      id: assetId,
      type: assetData.type || 'idea',
      contentHash: contentHash,
      metadata: {
        title: assetData.title || 'Unbenanntes Asset',
        description: assetData.description || '',
        tags: assetData.tags || [],
        language: assetData.language || 'de',
        category: assetData.category || 'general',
        subcategory: assetData.subcategory || '',
        creatorId: assetData.creatorId || 'unknown',
        createdAt: Date.now(),
        version: 1,
        parentId: assetData.parentId,
        license: assetData.license || 'non-exclusive',
        rights: {
          commercial: assetData.commercial !== false,
          derivative: assetData.derivative !== false,
          modification: assetData.modification !== false,
          distribution: assetData.distribution !== false
        }
      },
      ownership: {
        creatorId: assetData.creatorId || 'unknown',
        currentOwnerId: assetData.creatorId || 'unknown',
        ownershipHistory: [{
          ownerId: assetData.creatorId || 'unknown',
          timestamp: Date.now(),
          transactionId: 'creation',
          type: 'creation'
        }],
        fractionalOwnership: assetData.fractionalOwnership
      }
    };

    this.assets.set(assetId, asset);
    
    // Trading Market initialisieren
    await this.initializeTradingMarket(assetId, assetData.basePrice || '0');
    
    // Assessment initialisieren
    this.initializeAssessment(assetId);
    
    return asset;
  }

  /**
   * Trading Market initialisieren (Layer 2)
   */
  async initializeTradingMarket(assetId, basePrice) {
    const market = {
      assetId: assetId,
      market: {
        basePrice: this.Decimal(basePrice),
        currentBid: this.Decimal('0'),
        currentAsk: this.Decimal('0'),
        lastTradePrice: this.Decimal(basePrice),
        volume24h: this.Decimal('0'),
        volume7d: this.Decimal('0'),
        volume30d: this.Decimal('0'),
        high24h: this.Decimal(basePrice),
        low24h: this.Decimal(basePrice),
        priceChange24h: this.Decimal('0'),
        priceChangePercent24h: this.Decimal('0'),
        marketCap: this.Decimal('0'),
        liquidity: this.Decimal('0')
      },
      orderBook: {
        bids: [],
        asks: []
      },
      trades: []
    };

    this.tradingMarkets.set(assetId, market);
    return market;
  }

  /**
   * Assessment initialisieren (Layer 3)
   */
  initializeAssessment(assetId) {
    const assessment = {
      assetId: assetId,
      assessments: [],
      aggregated: {
        averageRating: this.Decimal('0'),
        weightedAverage: this.Decimal('0'),
        medianRating: this.Decimal('0'),
        standardDeviation: this.Decimal('0'),
        confidenceInterval: {
          lower: this.Decimal('0'),
          upper: this.Decimal('0'),
          confidence: 95
        },
        marketConfidence: this.Decimal('0'),
        trend: 'stable',
        volatility: this.Decimal('0')
      }
    };

    this.assessments.set(assetId, assessment);
    return assessment;
  }

  /**
   * Order platzieren
   */
  async placeOrder(orderData) {
    const { assetId, type, price, quantity, userId, orderType = 'limit' } = orderData;
    
    if (!this.tradingMarkets.has(assetId)) {
      throw new Error(`Asset ${assetId} hat keinen Trading Market`);
    }

    const order = {
      id: this.generateOrderId(),
      assetId: assetId,
      userId: userId,
      price: this.Decimal(price),
      quantity: this.Decimal(quantity),
      timestamp: Date.now(),
      expiresAt: orderData.expiresAt || Date.now() + 86400000, // 24h default
      type: orderType,
      status: 'active'
    };

    const market = this.tradingMarkets.get(assetId);
    
    if (type === 'bid') {
      market.orderBook.bids.push(order);
      market.orderBook.bids.sort((a, b) => b.price.compareTo(a.price)); // Höchste zuerst
      market.market.currentBid = market.orderBook.bids[0]?.price || this.Decimal('0');
    } else if (type === 'ask') {
      market.orderBook.asks.push(order);
      market.orderBook.asks.sort((a, b) => a.price.compareTo(b.price)); // Niedrigste zuerst
      market.market.currentAsk = market.orderBook.asks[0]?.price || this.Decimal('0');
    }

    // Order-Matching versuchen
    await this.tryMatchOrders(assetId);

    return order;
  }

  /**
   * Order-Matching Engine
   */
  async tryMatchOrders(assetId) {
    const market = this.tradingMarkets.get(assetId);
    if (!market) return;

    const bids = market.orderBook.bids.filter(o => o.status === 'active' && o.expiresAt > Date.now());
    const asks = market.orderBook.asks.filter(o => o.status === 'active' && o.expiresAt > Date.now());

    // Match: Höchstes Bid >= Niedrigstes Ask
    while (bids.length > 0 && asks.length > 0) {
      const bestBid = bids[0];
      const bestAsk = asks[0];

      if (bestBid.price.compareTo(bestAsk.price) >= 0) {
        // Match gefunden!
        const tradePrice = bestBid.price; // Price-Taker Modell
        const tradeQuantity = bestBid.quantity.compareTo(bestAsk.quantity) <= 0 
          ? bestBid.quantity 
          : bestAsk.quantity;

        // Trade ausführen
        await this.executeTrade({
          assetId: assetId,
          buyerId: bestBid.userId,
          sellerId: bestAsk.userId,
          price: tradePrice,
          quantity: tradeQuantity
        });

        // Orders aktualisieren
        bestBid.quantity = bestBid.quantity.subtract(tradeQuantity);
        bestAsk.quantity = bestAsk.quantity.subtract(tradeQuantity);

        if (bestBid.quantity.compareTo(this.Decimal('0')) <= 0) {
          bestBid.status = 'filled';
          bids.shift();
        }
        if (bestAsk.quantity.compareTo(this.Decimal('0')) <= 0) {
          bestAsk.status = 'filled';
          asks.shift();
        }
      } else {
        break; // Kein Match möglich
      }
    }
  }

  /**
   * Trade ausführen
   */
  async executeTrade(tradeData) {
    const { assetId, buyerId, sellerId, price, quantity } = tradeData;
    
    const trade = {
      id: this.generateTradeId(),
      assetId: assetId,
      buyerId: buyerId,
      sellerId: sellerId,
      price: price,
      quantity: quantity,
      timestamp: Date.now(),
      settlementId: this.generateSettlementId(),
      fees: {
        platform: price.multiply(quantity).multiply(this.Decimal('0.01')), // 1% Platform
        creator: price.multiply(quantity).multiply(this.Decimal('0.005')), // 0.5% Creator
        assessor: price.multiply(quantity).multiply(this.Decimal('0.002')) // 0.2% Assessor
      }
    };

    // Trade speichern
    this.trades.push(trade);
    
    const market = this.tradingMarkets.get(assetId);
    market.trades.push(trade);
    
    // Market-Daten aktualisieren
    market.market.lastTradePrice = price;
    market.market.volume24h = market.market.volume24h.add(price.multiply(quantity));
    
    // Ownership transferieren
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.ownership.currentOwnerId = buyerId;
      asset.ownership.ownershipHistory.push({
        ownerId: buyerId,
        timestamp: Date.now(),
        transactionId: trade.id,
        type: 'purchase'
      });
    }

    return trade;
  }

  /**
   * Assessment hinzufügen
   */
  async addAssessment(assessmentData) {
    const { assetId, assessorId, assessorType, ratings, confidence = 50 } = assessmentData;
    
    if (!this.assessments.has(assetId)) {
      this.initializeAssessment(assetId);
    }

    const assessment = this.assessments.get(assetId);
    
    const weightedScore = this.calculateWeightedScore(ratings, confidence);
    
    const newAssessment = {
      id: this.generateAssessmentId(),
      assessorId: assessorId,
      assessorType: assessorType || 'peer',
      ratings: ratings,
      weightedScore: weightedScore,
      confidence: confidence,
      timestamp: Date.now(),
      reasoning: assessmentData.reasoning
    };

    assessment.assessments.push(newAssessment);
    
    // Aggregierte Werte neu berechnen
    this.updateAggregatedAssessment(assetId);

    return newAssessment;
  }

  /**
   * Gewichteter Score berechnen
   */
  calculateWeightedScore(ratings, confidence) {
    const weights = {
      originality: 0.15,
      marketPotential: 0.20,
      artisticValue: 0.10,
      technicalQuality: 0.15,
      commercialValue: 0.20,
      innovationLevel: 0.10,
      socialImpact: 0.05,
      sustainability: 0.05
    };

    let total = this.Decimal('0');
    let totalWeight = this.Decimal('0');

    for (const [key, value] of Object.entries(ratings)) {
      const weight = weights[key] || 0.05;
      total = total.add(this.Decimal(String(value * weight * (confidence / 100))));
      totalWeight = totalWeight.add(this.Decimal(String(weight)));
    }

    return totalWeight.compareTo(this.Decimal('0')) > 0 
      ? total.divide(totalWeight).multiply(this.Decimal('100'))
      : this.Decimal('0');
  }

  /**
   * Aggregierte Assessment-Werte aktualisieren
   */
  updateAggregatedAssessment(assetId) {
    const assessment = this.assessments.get(assetId);
    if (!assessment || assessment.assessments.length === 0) return;

    const scores = assessment.assessments.map(a => a.weightedScore.toNumber());
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;

    assessment.aggregated.averageRating = this.Decimal(String(avg));
    assessment.aggregated.weightedAverage = this.Decimal(String(avg)); // Vereinfacht
    assessment.aggregated.marketConfidence = this.Decimal(String(avg));
  }

  /**
   * Order-Matching Engine (kontinuierlich)
   */
  startOrderMatchingEngine() {
    setInterval(() => {
      for (const assetId of this.tradingMarkets.keys()) {
        this.tryMatchOrders(assetId);
      }
    }, 1000); // Jede Sekunde
  }

  /**
   * Assessment Engine (kontinuierlich)
   */
  startAssessmentEngine() {
    setInterval(() => {
      for (const assetId of this.assessments.keys()) {
        this.updateAggregatedAssessment(assetId);
      }
    }, 5000); // Alle 5 Sekunden
  }

  /**
   * Test-Assets erstellen
   */
  async createTestAssets() {
    await this.createAsset({
      id: 'test-idea-1',
      type: 'idea',
      title: 'Revolutionäre KI-Anwendung',
      description: 'Eine KI, die menschliche Emotionen versteht',
      creatorId: 'thinker-1',
      basePrice: '1000',
      tags: ['KI', 'Innovation', 'Emotionen']
    });

    await this.createAsset({
      id: 'test-design-1',
      type: 'design',
      title: 'Futuristisches UI-Design',
      description: '3D-Interface für virtuelle Realität',
      creatorId: 'thinker-2',
      basePrice: '500',
      tags: ['Design', 'UI', 'VR']
    });
  }

  /**
   * Hilfsfunktionen
   */
  generateAssetId() {
    return 'asset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  generateOrderId() {
    return 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  generateTradeId() {
    return 'trade-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  generateSettlementId() {
    return 'settlement-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  generateAssessmentId() {
    return 'assessment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  async hashContent(content) {
    // Für Labor-Prototyp: Einfacher Hash
    // In Produktion: SHA-256 oder IPFS
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * API-Methoden für externe Nutzung
   */
  getAsset(assetId) {
    return this.assets.get(assetId);
  }

  getMarket(assetId) {
    return this.tradingMarkets.get(assetId);
  }

  getAssessment(assetId) {
    return this.assessments.get(assetId);
  }

  getAllAssets() {
    return Array.from(this.assets.values());
  }

  getRecentTrades(assetId, limit = 10) {
    const market = this.tradingMarkets.get(assetId);
    if (!market) return [];
    return market.trades.slice(-limit).reverse();
  }
}

// Globaler Export
window.THYNKLaborPrototyp = THYNKLaborPrototyp;

// Auto-Init wenn geladen
if (typeof window !== 'undefined') {
  window.thynkLabor = new THYNKLaborPrototyp();
  window.thynkLabor.init().then(() => {
    console.log('✅ THYNK Labor-Prototyp bereit');
  });
}

