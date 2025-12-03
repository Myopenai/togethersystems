/**
 * T,. OSTOSOS Lightweight Client SDK
 * Vollständiges Client SDK für OSTOSOS API
 * 
 * Features:
 * - API Client
 * - Window Management Client
 * - Survey Client
 * - Donation Client
 * - Type Definitions
 */

class OSTOSOSClientSDK {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '/api';
    this.timeout = options.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    console.log('T,. OSTOSOS Client SDK initialisiert');
  }
  
  /**
   * Basis Request-Methode
   */
  async request(method, path, data = null) {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    
    const options = {
      method: method,
      headers: this.headers
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${method} ${path}`, error);
      throw error;
    }
  }
  
  // System API
  async getSystemStatus() {
    return this.request('GET', '/system/status');
  }
  
  // Window Management API
  async getWindows() {
    return this.request('GET', '/windows');
  }
  
  async createWindow(options) {
    return this.request('POST', '/windows', options);
  }
  
  async getWindow(windowId) {
    return this.request('GET', `/windows/${windowId}`);
  }
  
  async updateWindow(windowId, options) {
    return this.request('PUT', `/windows/${windowId}`, options);
  }
  
  async closeWindow(windowId) {
    return this.request('DELETE', `/windows/${windowId}`);
  }
  
  async minimizeWindow(windowId) {
    return this.request('POST', `/windows/${windowId}/minimize`);
  }
  
  async maximizeWindow(windowId) {
    return this.request('POST', `/windows/${windowId}/maximize`);
  }
  
  async snapWindow(windowId, position) {
    return this.request('POST', `/windows/${windowId}/snap`, { position });
  }
  
  // Survey API
  async getSurveys() {
    return this.request('GET', '/surveys');
  }
  
  async createSurvey(title, description = '') {
    return this.request('POST', '/surveys', { title, description });
  }
  
  async getSurvey(surveyId) {
    return this.request('GET', `/surveys/${surveyId}`);
  }
  
  async submitSurveyResponse(surveyId, answers) {
    return this.request('POST', `/surveys/${surveyId}/responses`, { answers });
  }
  
  async getSurveyAnalytics(surveyId) {
    return this.request('GET', `/surveys/${surveyId}/analytics`);
  }
  
  // Donation API
  async getDonationInfo() {
    return this.request('GET', '/donations');
  }
  
  async getDonationGoals() {
    return this.request('GET', '/donations/goals');
  }
  
  // Sync API
  async getDevices() {
    return this.request('GET', '/sync/devices');
  }
  
  // Update API
  async checkForUpdates() {
    return this.request('GET', '/updates/check');
  }
  
  // Convenience Methods
  get windows() {
    return {
      list: () => this.getWindows(),
      create: (options) => this.createWindow(options),
      get: (id) => this.getWindow(id),
      update: (id, options) => this.updateWindow(id, options),
      close: (id) => this.closeWindow(id),
      minimize: (id) => this.minimizeWindow(id),
      maximize: (id) => this.maximizeWindow(id),
      snap: (id, position) => this.snapWindow(id, position)
    };
  }
  
  get surveys() {
    return {
      list: () => this.getSurveys(),
      create: (title, description) => this.createSurvey(title, description),
      get: (id) => this.getSurvey(id),
      submit: (id, answers) => this.submitSurveyResponse(id, answers),
      analytics: (id) => this.getSurveyAnalytics(id)
    };
  }
  
  get donations() {
    return {
      info: () => this.getDonationInfo(),
      goals: () => this.getDonationGoals()
    };
  }
  
  get system() {
    return {
      status: () => this.getSystemStatus()
    };
  }
  
  get sync() {
    return {
      devices: () => this.getDevices()
    };
  }
  
  get updates() {
    return {
      check: () => this.checkForUpdates()
    };
  }
}

// Global verfügbar machen
window.OSTOSOSClientSDK = OSTOSOSClientSDK;

// Default Instance
window.OSTOSOSSDK = window.OSTOSOSSDK || new OSTOSOSClientSDK();

// Convenience Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OSTOSOSClientSDK;
}

console.log('T,. OSTOSOS Client SDK geladen');

/**
 * Usage Examples:
 * 
 * // Create SDK instance
 * const sdk = new OSTOSOSClientSDK({ baseURL: '/api' });
 * 
 * // System Status
 * const status = await sdk.system.status();
 * 
 * // Create Window
 * const window = await sdk.windows.create({
 *   title: 'Neues Fenster',
 *   url: './index.html',
 *   width: 800,
 *   height: 600
 * });
 * 
 * // Create Survey
 * const survey = await sdk.surveys.create('Meine Umfrage', 'Beschreibung');
 * 
 * // Submit Survey Response
 * await sdk.surveys.submit(survey.id, {
 *   'q-1': 'Meine Antwort'
 * });
 */

