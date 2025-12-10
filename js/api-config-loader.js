// API Config Loader - Fabrikage Standard
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class APIConfigLoader {
  constructor() {
    this.config = null;
    this.environment = this.detectEnvironment();
  }

  detectEnvironment() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'local';
      } else if (hostname.includes('dev') || hostname.includes('staging')) {
        return 'development';
      } else {
        return 'production';
      }
    } else if (typeof process !== 'undefined') {
      return process.env.NODE_ENV || 'local';
    }
    return 'local';
  }

  async loadConfig() {
    try {
      const response = await fetch('/config/api-config.json');
      if (response.ok) {
        this.config = await response.json();
        return this.config;
      }
    } catch (error) {
      console.warn('API config not found, using defaults');
    }
    
    // Fallback defaults
    this.config = {
      environments: {
        local: { baseUrl: 'http://localhost:5173' },
        development: { baseUrl: 'https://dev-api.togethersystems.com' },
        production: { baseUrl: 'https://api.togethersystems.com' }
      }
    };
    
    return this.config;
  }

  getBaseUrl() {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config?.environments?.[this.environment]?.baseUrl || 'http://localhost:5173';
  }

  getEndpoint(name) {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config?.endpoints?.[name] || `/api/${name}`;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.apiConfigLoader = new APIConfigLoader();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIConfigLoader;
}



