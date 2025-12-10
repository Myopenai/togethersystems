// [.SYSTEMS.T.SYSTEMS.] FABRIKAGE CONSOLE-BYPASS INTEGRATION
// Integriert Error Bus, Self-Healing, Auto-Fix, Audit in alle Apps
// Für maximalen Durchsatz ohne manuelle Console-Eingriffe

(function() {
  'use strict';
  
  // Load Fabrikage modules
  function loadFabrikageModules() {
    const modules = [
      'FABRIKAGE-ERROR-BUS.js',
      'FABRIKAGE-SELF-HEALING-RUNTIME.js',
      'FABRIKAGE-AUTO-FIXER.js',
      'FABRIKAGE-AUDIT-LOGGING.js'
    ];
    
    const basePath = window.location.pathname.includes('Kassenbuch') 
      ? '../' 
      : window.location.pathname.includes('CASHFLOX') 
        ? './' 
        : 'CASHFLOX/';
    
    modules.forEach(module => {
      const script = document.createElement('script');
      script.src = basePath + module;
      script.async = false;
      document.head.appendChild(script);
    });
  }
  
  // Initialize Fabrikage for current module
  function initFabrikageForModule() {
    const moduleName = detectModuleName();
    
    // Set policies
    window.FABRIKAGE_POLICIES = {
      retries: {
        default: { attempts: 3, backoff: 'exponential', maxDelayMs: 30000 },
        ocr: { attempts: 2, backoff: 'linear', maxDelayMs: 10000 }
      },
      autofix: {
        enabled: true,
        ruleset: 'default',
        confidenceThreshold: 0.8
      },
      slo: {
        successRate: 0.99
      }
    };
    
    // Enable console bypass
    window.FABRIKAGE_CONSOLE_BYPASS = true;
    
    // Wait for Error Bus and initialize
    function waitForErrorBus() {
      if (window.fabrikageErrorBus) {
        // Publish module initialization
        window.fabrikageErrorBus.publish({
          module: moduleName,
          stage: 'init',
          level: 'info',
          class: 'module.init',
          message: `Module ${moduleName} initialisiert mit Console-Bypass`,
          context: { moduleName, policies: window.FABRIKAGE_POLICIES }
        });
        
        // Log manifest if available
        if (window.FABRIKAGE_MANIFEST) {
          if (window.fabrikageAuditLogger) {
            window.fabrikageAuditLogger.logManifest(window.FABRIKAGE_MANIFEST);
          }
        }
        
        console.log(`[FABRIKAGE] Console-Bypass aktiviert für ${moduleName}`);
      } else {
        setTimeout(waitForErrorBus, 100);
      }
    }
    
    waitForErrorBus();
  }
  
  function detectModuleName() {
    const path = window.location.pathname;
    if (path.includes('kassenbuch')) return 'kassenbuch';
    if (path.includes('chflox')) return 'chflox';
    if (path.includes('budget')) return 'budget';
    if (path.includes('contract')) return 'contract';
    if (path.includes('FLOCASHX')) return 'flowcashx';
    return 'unknown';
  }
  
  // Enhanced error handling with Error Bus
  function enhanceErrorHandling() {
    // Wrap common error-prone operations
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args)
        .catch(error => {
          if (window.fabrikageErrorBus) {
            window.fabrikageErrorBus.publish({
              module: detectModuleName(),
              stage: 'runtime',
              level: 'error',
              class: 'http.failure',
              message: `Fetch failed: ${args[0]}`,
              context: { url: args[0], error: error.message }
            });
          }
          throw error;
        });
    };
    
    // Wrap localStorage operations
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      try {
        return originalSetItem.call(this, key, value);
      } catch(e) {
        if (window.fabrikageErrorBus) {
          window.fabrikageErrorBus.publish({
            module: detectModuleName(),
            stage: 'runtime',
            level: 'error',
            class: 'localStorage.quota',
            message: 'localStorage quota exceeded',
            context: { key, error: e.message }
          });
        }
        throw e;
      }
    };
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadFabrikageModules();
      setTimeout(() => {
        initFabrikageForModule();
        enhanceErrorHandling();
      }, 500);
    });
  } else {
    loadFabrikageModules();
    setTimeout(() => {
      initFabrikageForModule();
      enhanceErrorHandling();
    }, 500);
  }
})();
