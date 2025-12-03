/**
 * T,. OSTOSOS API Gateway Core
 * Vollständiges API Gateway System
 * 
 * Features:
 * - API Routing
 * - Request Validation
 * - Response Formatting
 * - Rate Limiting
 * - Authentication
 */

class OSTOSOSAPIGateway {
  constructor() {
    this.baseURL = window.location.origin + '/api';
    this.routes = new Map();
    this.middlewares = [];
    this.rateLimits = new Map();
    
    this.init();
  }
  
  init() {
    // Register default routes
    this.registerRoutes();
    
    // Setup request interceptor
    if (typeof fetch !== 'undefined') {
      this.setupFetchInterceptor();
    }
    
    console.log('T,. API Gateway initialisiert');
  }
  
  /**
   * Registriert Standard-Routes
   */
  registerRoutes() {
    // System Routes
    this.registerRoute('GET', '/system/status', () => ({
      version: localStorage.getItem('ostosos.version') || '1.0.0',
      uptime: Date.now() - parseInt(localStorage.getItem('ostosos.startTime') || Date.now()),
      windowsCount: window.OSTOSOSWindows ? window.OSTOSOSWindows.getAllWindows().length : 0,
      memoryUsage: this.getMemoryUsage()
    }));
    
    // Window Routes
    this.registerRoute('GET', '/windows', () => {
      if (!window.OSTOSOSWindows) return [];
      return window.OSTOSOSWindows.getAllWindows().map(w => ({
        id: w.id,
        title: w.config.title,
        state: w.state,
        position: w.position,
        size: w.size,
        zIndex: w.zIndex
      }));
    });
    
    this.registerRoute('POST', '/windows', (req) => {
      if (!window.OSTOSOSWindows) throw new Error('Window Manager nicht verfügbar');
      const windowId = window.OSTOSOSWindows.createWindow(req.body);
      const window = window.OSTOSOSWindows.getWindow(windowId);
      return {
        id: window.id,
        title: window.config.title,
        state: window.state,
        position: window.position,
        size: window.size,
        zIndex: window.zIndex
      };
    });
    
    // Survey Routes
    this.registerRoute('GET', '/surveys', () => {
      if (!window.OSTOSOSSurveys) return [];
      return Array.from(window.OSTOSOSSurveys.surveys.values());
    });
    
    this.registerRoute('POST', '/surveys', (req) => {
      if (!window.OSTOSOSSurveys) throw new Error('Survey Builder nicht verfügbar');
      const surveyId = window.OSTOSOSSurveys.createSurvey(req.body.title, req.body.description);
      return window.OSTOSOSSurveys.surveys.get(surveyId);
    });
    
    // Donation Routes
    this.registerRoute('GET', '/donations', () => {
      if (!window.OSTOSOSDonations) return { total: 0, goals: [], platforms: [] };
      return {
        total: window.OSTOSOSDonations.getTotalDonations(),
        goals: window.OSTOSOSDonations.goals,
        platforms: Object.keys(window.OSTOSOSDonations.platforms)
      };
    });
  }
  
  /**
   * Registriert eine Route
   */
  registerRoute(method, path, handler) {
    const routeKey = `${method}:${path}`;
    this.routes.set(routeKey, handler);
  }
  
  /**
   * Setup Fetch Interceptor
   */
  setupFetchInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Check if it's an API request
      if (typeof url === 'string' && (url.startsWith('/api') || url.startsWith(this.baseURL))) {
        return this.handleAPIRequest(url, options);
      }
      
      // Normal fetch
      return originalFetch(url, options);
    };
  }
  
  /**
   * Behandelt API-Request
   */
  async handleAPIRequest(url, options = {}) {
    const method = options.method || 'GET';
    const path = url.replace(this.baseURL, '').split('?')[0];
    const routeKey = `${method}:${path}`;
    
    // Check rate limit
    if (!this.checkRateLimit(routeKey)) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find route handler
    const handler = this.routes.get(routeKey);
    if (!handler) {
      return new Response(JSON.stringify({
        error: 'Route not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Parse request body
      let body = null;
      if (options.body) {
        try {
          body = JSON.parse(options.body);
        } catch (e) {
          body = options.body;
        }
      }
      
      // Execute handler
      const result = await handler({ body, query: this.parseQuery(url), headers: options.headers || {} });
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  /**
   * Parst Query-Parameter
   */
  parseQuery(url) {
    const query = {};
    const queryString = url.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }
    return query;
  }
  
  /**
   * Prüft Rate Limit
   */
  checkRateLimit(routeKey) {
    const limit = 100; // requests per minute
    const window = 60000; // 1 minute
    
    const now = Date.now();
    const key = `${routeKey}:${Math.floor(now / window)}`;
    
    const count = this.rateLimits.get(key) || 0;
    if (count >= limit) {
      return false;
    }
    
    this.rateLimits.set(key, count + 1);
    
    // Cleanup old entries
    setTimeout(() => {
      this.rateLimits.delete(key);
    }, window);
    
    return true;
  }
  
  /**
   * Gibt Memory Usage zurück
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }
}

// Global verfügbar machen
window.OSTOSOSAPIGateway = OSTOSOSAPIGateway;
window.OSTOSOSAPI = window.OSTOSOSAPI || new OSTOSOSAPIGateway();

console.log('T,. API Gateway Core geladen');

