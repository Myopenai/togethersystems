// T,. OSTOSOS - Settings Extension Registry Core
// Dynamische Settings-Verwaltung für Erweiterungen

const SETTINGS_EXTENSION_REGISTRY = {
  registry: {},
  templates: {},
  
  init() {
    this.loadRegistry();
    this.loadTemplates();
    this.autoRegisterExtensions();
  },
  
  loadRegistry() {
    const saved = localStorage.getItem('ostosos.settings.registry');
    if (saved) {
      this.registry = JSON.parse(saved);
    }
  },
  
  saveRegistry() {
    localStorage.setItem('ostosos.settings.registry', JSON.stringify(this.registry));
  },
  
  loadTemplates() {
    // Settings-Templates für verschiedene Erweiterungs-Typen
    this.templates = {
      'extension-basic': {
        id: 'extension-basic',
        name: 'Basic Extension Settings',
        structure: {
          enabled: true,
          version: '1.0.0',
          priority: 'medium',
          autoLoad: true,
          dependencies: []
        }
      },
      'extension-api': {
        id: 'extension-api',
        name: 'API Extension Settings',
        structure: {
          enabled: true,
          version: '1.0.0',
          priority: 'medium',
          autoLoad: true,
          dependencies: [],
          api: {
            endpoints: [],
            rateLimit: 100,
            timeout: 5000
          }
        }
      },
      'extension-ui': {
        id: 'extension-ui',
        name: 'UI Extension Settings',
        structure: {
          enabled: true,
          version: '1.0.0',
          priority: 'medium',
          autoLoad: true,
          dependencies: [],
          ui: {
            theme: 'default',
            position: 'auto',
            size: 'auto'
          }
        }
      },
      'extension-backend': {
        id: 'extension-backend',
        name: 'Backend Extension Settings',
        structure: {
          enabled: true,
          version: '1.0.0',
          priority: 'high',
          autoLoad: true,
          dependencies: [],
          backend: {
            workers: 1,
            memory: '256MB',
            timeout: 30000
          }
        }
      }
    };
  },
  
  autoRegisterExtensions() {
    // Automatische Registrierung aller installierten Erweiterungen
    if (window.EXTENSIONS_REGISTRY) {
      const extensions = window.EXTENSIONS_REGISTRY.getInstalledExtensions();
      extensions.forEach(ext => {
        if (!this.registry[ext.id]) {
          this.registerExtension(ext.id, ext.category || 'basic');
        }
      });
    }
  },
  
  registerExtension(extensionId, category = 'basic') {
    const template = this.templates[`extension-${category}`] || this.templates['extension-basic'];
    
    const settings = {
      extensionId,
      category,
      ...JSON.parse(JSON.stringify(template.structure)),
      registeredAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.registry[extensionId] = settings;
    this.saveRegistry();
    
    return settings;
  },
  
  unregisterExtension(extensionId) {
    if (this.registry[extensionId]) {
      delete this.registry[extensionId];
      this.saveRegistry();
      return true;
    }
    return false;
  },
  
  getExtensionSettings(extensionId) {
    return this.registry[extensionId] || null;
  },
  
  updateExtensionSettings(extensionId, updates) {
    if (this.registry[extensionId]) {
      this.registry[extensionId] = {
        ...this.registry[extensionId],
        ...updates,
        lastModified: new Date().toISOString()
      };
      this.saveRegistry();
      return true;
    }
    return false;
  },
  
  validateSettings(extensionId) {
    const settings = this.registry[extensionId];
    if (!settings) {
      return { valid: false, message: 'Settings nicht gefunden' };
    }
    
    const checks = [];
    
    // Prüfe Abhängigkeiten
    if (settings.dependencies && settings.dependencies.length > 0) {
      const missing = settings.dependencies.filter(depId => !this.registry[depId] || !this.registry[depId].enabled);
      if (missing.length > 0) {
        checks.push({ status: 'fail', message: `Fehlende Abhängigkeiten: ${missing.join(', ')}` });
      } else {
        checks.push({ status: 'pass', message: 'Alle Abhängigkeiten erfüllt' });
      }
    }
    
    // Prüfe Priorität
    if (!['low', 'medium', 'high', 'critical'].includes(settings.priority)) {
      checks.push({ status: 'warn', message: 'Ungültige Priorität' });
    }
    
    const allPass = checks.every(c => c.status === 'pass');
    const hasFail = checks.some(c => c.status === 'fail');
    
    return {
      valid: allPass && !hasFail,
      checks: checks,
      message: hasFail ? 'Validierung fehlgeschlagen' : allPass ? 'Validierung erfolgreich' : 'Validierung mit Warnungen'
    };
  },
  
  optimizeSettings() {
    // Automatische Optimierung: Deaktiviere ungenutzte Settings
    const usage = this.getUsageStats();
    
    Object.keys(this.registry).forEach(extensionId => {
      const settings = this.registry[extensionId];
      const usageCount = usage[extensionId] || 0;
      
      // Deaktiviere wenn nicht genutzt (optional, kann konfiguriert werden)
      if (usageCount === 0 && settings.autoLoad && settings.priority !== 'critical') {
        // Optional: Auto-Disable
        // settings.enabled = false;
      }
    });
    
    this.saveRegistry();
  },
  
  getUsageStats() {
    // Tracking der Settings-Nutzung (vereinfacht)
    const saved = localStorage.getItem('ostosos.settings.usage');
    return saved ? JSON.parse(saved) : {};
  },
  
  trackUsage(extensionId) {
    const usage = this.getUsageStats();
    usage[extensionId] = (usage[extensionId] || 0) + 1;
    localStorage.setItem('ostosos.settings.usage', JSON.stringify(usage));
  },
  
  getAllSettings() {
    return this.registry;
  },
  
  exportSettings() {
    return JSON.stringify(this.registry, null, 2);
  },
  
  importSettings(json) {
    try {
      const imported = JSON.parse(json);
      this.registry = { ...this.registry, ...imported };
      this.saveRegistry();
      return true;
    } catch (error) {
      console.error('Fehler beim Importieren:', error);
      return false;
    }
  }
};

window.addEventListener('load', () => {
  SETTINGS_EXTENSION_REGISTRY.init();
});

window.SETTINGS_EXTENSION_REGISTRY = SETTINGS_EXTENSION_REGISTRY;

