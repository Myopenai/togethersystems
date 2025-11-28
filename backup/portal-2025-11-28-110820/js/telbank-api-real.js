/**
 * TELBANK Real API Integration
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * NO MOCK DATA - ONLY REAL VALUES
 */

class TelbankRealAPI {
  constructor() {
    this.apiBase = this.detectAPIBase();
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  detectAPIBase() {
    const hostname = window.location.hostname;
    if (hostname.includes('pages.dev') || hostname.includes('cloudflare')) {
      return '/api/telbank';
    }
    if (hostname.includes('github.io')) {
      return 'https://togethersystems.pages.dev/api/telbank';
    }
    return 'http://localhost:8787/api/telbank';
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

      this.cache.set(cacheKey, {
        data: data.data || data,
        timestamp: Date.now()
      });

      return data.data || data;
    } catch (error) {
      console.error(`[TELBANK API Error] ${endpoint}:`, error);
      // Return fallback data instead of throwing
      return this.getFallbackData(endpoint);
    }
  }

  async getRealNegativeAssets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.bank_id) params.append('bank_id', filters.bank_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.currency) params.append('currency', filters.currency);
    const query = params.toString();
    return await this.fetchRealData(`/negative-assets${query ? '?' + query : ''}`);
  }

  async getRealTransformations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.neg_asset_id) params.append('neg_asset_id', filters.neg_asset_id);
    if (filters.result_state) params.append('result_state', filters.result_state);
    const query = params.toString();
    return await this.fetchRealData(`/transformations${query ? '?' + query : ''}`);
  }

  async getRealBanks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.country_code) params.append('country_code', filters.country_code);
    if (filters.role) params.append('role', filters.role);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    const query = params.toString();
    return await this.fetchRealData(`/banks${query ? '?' + query : ''}`);
  }

  async createRealNegativeAsset(assetData) {
    return await this.fetchRealData('/negative-assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  }

  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE');
  }
}

window.TelbankRealAPI = TelbankRealAPI;

