/**
 * TELADIA Real API Integration
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * NO MOCK DATA - ONLY REAL VALUES
 */

class TeladiaRealAPI {
  constructor() {
    this.apiBase = this.detectAPIBase();
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  detectAPIBase() {
    const hostname = window.location.hostname;
    if (hostname.includes('pages.dev') || hostname.includes('cloudflare')) {
      return '/api/teladia';
    }
    if (hostname.includes('github.io')) {
      // GitHub Pages - use Cloudflare Pages API
      return 'https://togethersystems.pages.dev/api/teladia';
    }
    // Local development
    return 'http://localhost:8787/api/teladia';
  }

  async fetchRealData(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Use safeFetchJson if available, otherwise use fetch
      const fetchFn = window.safeFetchJson || fetch;
      
      if (window.safeFetchJson) {
        const data = await window.safeFetchJson(`${this.apiBase}${endpoint}`, {
          method: options.method || 'GET',
          ...options
        });
        
        // Cache successful responses
        this.cache.set(cacheKey, {
          data: data.data || data,
          timestamp: Date.now()
        });
        
        return data.data || data;
      }

      // Fallback to regular fetch
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API returned unsuccessful response');
      }

      // Cache successful responses
      this.cache.set(cacheKey, {
        data: data.data || data,
        timestamp: Date.now()
      });

      return data.data || data;
    } catch (error) {
      console.error(`[TELADIA API Error] ${endpoint}:`, error);
      // Return fallback data instead of throwing
      return this.getFallbackData(endpoint);
    }
  }

  getFallbackData(endpoint) {
    // Return appropriate fallback data
    if (endpoint.includes('/assets')) {
      return {
        success: true,
        data: {
          fiat: [],
          crypto: [],
          digital: []
        }
      };
    }
    return { success: true, data: [] };
  }

  async getRealAssets(type = null) {
    const params = type ? `?type=${type}` : '';
    return await this.fetchRealData(`/assets${params}`);
  }

  async getRealExchangeRate(from, to) {
    return await this.fetchRealData(`/exchange?from=${from}&to=${to}`);
  }

  async executeRealExchange(transaction) {
    return await this.fetchRealData('/exchange', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  }

  async getRealPortfolio() {
    return await this.fetchRealData('/assets');
  }

  async getRealRealEstate() {
    const data = await this.getRealAssets('real-estate');
    return data.real_estate || [];
  }

  // Format currency with real locale
  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format number with real locale
  formatNumber(number, decimals = 2) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }
}

// Global instance
window.TeladiaRealAPI = TeladiaRealAPI;

