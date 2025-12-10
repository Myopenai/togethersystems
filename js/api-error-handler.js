// API Error Handler - Fabrikage Standard
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class APIErrorHandler {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:5173',
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 10000,
      ...config
    };
    this.errorLog = [];
  }

  async fetchWithErrorHandling(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(fullUrl, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { success: true, data, response };
        
      } catch (error) {
        this.errorLog.push({
          url: fullUrl,
          attempt: attempt + 1,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        if (attempt === this.config.retryAttempts - 1) {
          return {
            success: false,
            error: error.message,
            retries: attempt + 1
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (attempt + 1)));
      }
    }
  }

  getErrorLog() {
    return this.errorLog;
  }

  clearErrorLog() {
    this.errorLog = [];
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.apiErrorHandler = new APIErrorHandler();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIErrorHandler;
}



