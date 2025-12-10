// Merchandise-System
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

class MerchandiseSystem {
  constructor() {
    this.products = [
      // Physische Brettspiele
      {
        id: 'physical-board-game-senet',
        name: 'Senet - Ägyptisches Brettspiel',
        type: 'PHYSICAL',
        category: 'BOARD_GAME',
        price: 59.99,
        currency: 'EUR',
        description: 'Hochwertige Reproduktion des ältesten bekannten Brettspiels (3500 v.Chr.)',
        epoch: 'ANCIENT_EGYPT',
        culture: 'EGYPTIAN'
      },
      {
        id: 'physical-board-game-chess',
        name: 'Schach - Friedensspiel Edition',
        type: 'PHYSICAL',
        category: 'BOARD_GAME',
        price: 49.99,
        currency: 'EUR',
        description: 'Schachbrett mit Waben-Design und Friedenssymbolik',
        epoch: 'CLASSICAL',
        culture: 'UNIVERSAL'
      },
      {
        id: 'physical-board-game-go',
        name: 'Go - Chinesisches Strategiespiel',
        type: 'PHYSICAL',
        category: 'BOARD_GAME',
        price: 79.99,
        currency: 'EUR',
        description: 'Go-Brett 19x19 mit hochwertigen Steinen',
        epoch: 'ANCIENT_CHINA',
        culture: 'CHINESE'
      },
      {
        id: 'physical-board-game-hive',
        name: 'Hive-Strategie Brettspiel',
        type: 'PHYSICAL',
        category: 'BOARD_GAME',
        price: 39.99,
        currency: 'EUR',
        description: 'Hexagonales Strategiespiel mit Waben-Design',
        epoch: 'FUTURE',
        culture: 'UNIVERSAL'
      },
      // Kleidung & Accessoires
      {
        id: 't-shirt',
        name: 'T-Shirt "Manifest-Hive"',
        type: 'PHYSICAL',
        category: 'CLOTHING',
        price: 24.99,
        currency: 'EUR',
        description: 'Baumwoll-T-Shirt mit Waben-Logo und Friedenssymbolik'
      },
      {
        id: 'hoodie',
        name: 'Hoodie "Spiel eröffnen"',
        type: 'PHYSICAL',
        category: 'CLOTHING',
        price: 49.99,
        currency: 'EUR',
        description: 'Kapuzenpullover mit Waben-Design'
      },
      {
        id: 'jewelry',
        name: 'Waben-Anhänger',
        type: 'PHYSICAL',
        category: 'JEWELRY',
        price: 29.99,
        currency: 'EUR',
        description: 'Silberner Anhänger in Waben-Form'
      },
      // Ritual-Objekte
      {
        id: 'peace-pipe-replica',
        name: 'Friedenspfeife (Nachbildung)',
        type: 'PHYSICAL',
        category: 'RITUAL',
        price: 89.99,
        currency: 'EUR',
        description: 'Kulturell respektvolle Nachbildung als Erinnerung an Friedensrituale'
      },
      {
        id: 'game-dice-set',
        name: 'Würfel-Set "Alle Epochen"',
        type: 'PHYSICAL',
        category: 'RITUAL',
        price: 19.99,
        currency: 'EUR',
        description: 'Würfel-Set mit verschiedenen historischen Formen'
      },
      // Digitale Produkte
      {
        id: 'digital-badge',
        name: 'Digital Badge "Friedensspieler"',
        type: 'DIGITAL',
        category: 'BADGE',
        price: 4.99,
        currency: 'EUR',
        description: 'NFT-Badge für dein Profil'
      },
      {
        id: 'digital-avatar',
        name: 'Waben-Avatar Pack',
        type: 'DIGITAL',
        category: 'AVATAR',
        price: 9.99,
        currency: 'EUR',
        description: '10 verschiedene Waben-Avatare'
      },
      {
        id: 'ar-vr-room',
        name: 'AR/VR Wabenraum-Design',
        type: 'DIGITAL',
        category: 'AR_VR',
        price: 14.99,
        currency: 'EUR',
        description: 'Virtueller Wabenraum für AR/VR'
      }
    ];
  }

  getCatalog(category = null, epoch = null, culture = null) {
    let filtered = this.products;
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (epoch) {
      filtered = filtered.filter(p => p.epoch === epoch);
    }
    
    if (culture) {
      filtered = filtered.filter(p => p.culture === culture);
    }
    
    return filtered;
  }
  
  getPhysicalProducts() {
    return this.products.filter(p => p.type === 'PHYSICAL');
  }
  
  getDigitalProducts() {
    return this.products.filter(p => p.type === 'DIGITAL');
  }
  
  getRitualObjects() {
    return this.products.filter(p => p.category === 'RITUAL');
  }

  purchaseProduct(userId, productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // In Produktion: Integration mit Payment-Provider
    console.log(`[Merchandise] User ${userId} kauft ${product.name} für ${product.price} ${product.currency}`);

    return {
      ok: true,
      product: product,
      order_id: `ORDER-${Date.now()}`,
      estimated_delivery: product.type === 'DIGITAL' ? 'sofort' : '7-14 Tage'
    };
  }
}

// Export für Browser
if (typeof window !== 'undefined') {
  window.MerchandiseSystem = MerchandiseSystem;
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MerchandiseSystem;
}


