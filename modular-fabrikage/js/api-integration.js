// API Integration - Modular Fabrikage
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class FabrikageAPIIntegration {
  constructor() {
    // Verwende apiConfigLoader für Base-URL (kein hardcoded localhost)
    if (window.apiConfigLoader) {
      this.baseUrl = window.apiConfigLoader.getBaseUrl();
    } else {
      // Fallback nur wenn apiConfigLoader nicht verfügbar
      this.baseUrl = 'http://localhost:5173';
    }
    this.connected = false;
  }

  async connect() {
    try {
      // Verwende apiErrorHandler für sichere API-Calls
      if (window.apiErrorHandler) {
        const result = await window.apiErrorHandler.fetchWithErrorHandling(`${this.baseUrl}/api/health`);
        if (result.success) {
          this.connected = true;
          return { success: true, message: 'Connected to XXXXXXLS API' };
        } else {
          return { success: false, error: result.error };
        }
      } else {
        // Fallback zu fetch() wenn apiErrorHandler nicht verfügbar
        const response = await fetch(`${this.baseUrl}/api/health`);
        if (response.ok) {
          this.connected = true;
          return { success: true, message: 'Connected to XXXXXXLS API' };
        }
      }
    } catch (error) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(error, { context: 'API-Connect' });
      }
      return { success: false, error: error.message };
    }
  }

  async syncNodes() {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/nodes`, {
        headers: { 'Accept': 'application/json' }
      });
      
      // Prüfe Content-Type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim().startsWith('<')) {
          throw new Error('Response is HTML, not JSON. Check if API endpoint is correct or D1 schema is deployed.');
        }
      }
      
      if (response.ok) {
        const nodes = await response.json();
        // Sync nodes with factory engine
        return { success: true, nodes };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(error, { context: 'syncNodes' });
      }
      return { success: false, error: error.message };
    }
  }

  async syncLinks() {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      // Verwende apiErrorHandler für sichere API-Calls
      if (window.apiErrorHandler) {
        const result = await window.apiErrorHandler.fetchWithErrorHandling(`${this.baseUrl}/api/links`);
        if (result.success) {
          return { success: true, links: result.data };
        } else {
          return { success: false, error: result.error };
        }
      } else {
        // Fallback zu fetch() wenn apiErrorHandler nicht verfügbar
        const response = await fetch(`${this.baseUrl}/api/links`);
        if (response.ok) {
          const links = await response.json();
          return { success: true, links };
        }
      }
    } catch (error) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(error, { context: 'syncLinks' });
      }
      return { success: false, error: error.message };
    }
  }

  async morphModule(moduleId, action, morphType) {
    if (!this.connected) {
      await this.connect();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/api/morph`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action,
          target: moduleId,
          morphType
        })
      });
      
      // Prüfe Content-Type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim().startsWith('<')) {
          throw new Error('Response is HTML, not JSON. Check if API endpoint is correct or D1 schema is deployed.');
        }
      }
      
      if (response.ok) {
        const result = await response.json();
        return { success: true, result };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(error, { context: 'morphModule', moduleId });
      }
      return { success: false, error: error.message };
    }
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.fabrikageAPI = new FabrikageAPIIntegration();
}



