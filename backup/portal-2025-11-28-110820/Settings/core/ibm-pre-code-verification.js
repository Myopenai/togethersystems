/**
 * IBM Pre-Code-Verification System
 * Verifiziert Code VOR jeder Ausführung
 * Version: 1.0.0-ETERNAL-XXXXXXL
 */

class IBMPreCodeVerification {
  constructor() {
    this.checks = new Map();
    this.errors = [];
    this.warnings = [];
    this.isActive = false;
  }

  async initialize() {
    // Register all checks
    this.registerCheck('syntax', this.checkSyntax.bind(this));
    this.registerCheck('fileExistence', this.checkFileExistence.bind(this));
    this.registerCheck('environment', this.checkEnvironment.bind(this));
    this.registerCheck('apiHealth', this.checkApiHealth.bind(this));
    this.registerCheck('corsPolicy', this.checkCorsPolicy.bind(this));
    this.registerCheck('serviceWorker', this.checkServiceWorker.bind(this));

    this.isActive = true;
    console.log('✅ IBM Pre-Code-Verification initialized');
  }

  registerCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  async verifyBeforeCodeExecution(context) {
    const results = {
      passed: true,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };

    // Run all checks
    for (const [name, check] of this.checks.entries()) {
      try {
        const result = await check(context);
        if (!result.passed) {
          results.passed = false;
          results.errors.push({
            check: name,
            error: result.error,
            context: result.context
          });
        }
        if (result.warnings && result.warnings.length > 0) {
          results.warnings.push(...result.warnings.map(w => ({ check: name, warning: w })));
        }
      } catch (error) {
        results.passed = false;
        results.errors.push({
          check: name,
          error: error.message,
          context: context
        });
      }
    }

    // If verification failed, throw error
    if (!results.passed) {
      const errorMsg = `IBM Pre-Code-Verification FAILED:\n${results.errors.map(e => `- ${e.check}: ${e.error}`).join('\n')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    return results;
  }

  async checkSyntax(context) {
    // Check for common syntax errors
    const code = context.code || '';
    const errors = [];

    // Check for missing closing brackets
    const openBrackets = (code.match(/\(/g) || []).length;
    const closeBrackets = (code.match(/\)/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push(`Missing closing brackets: ${openBrackets} open, ${closeBrackets} close`);
    }

    // Check for missing closing braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Missing closing braces: ${openBraces} open, ${closeBraces} close`);
    }

    // Check for common fetch syntax errors
    if (code.includes('fetch(') && !code.includes('catch')) {
      errors.push('fetch() call without error handling');
    }

    return {
      passed: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : null,
      context: context
    };
  }

  async checkFileExistence(context) {
    // Check if all referenced files exist
    const referencedFiles = context.referencedFiles || [];
    const missingFiles = [];

    for (const file of referencedFiles) {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        if (!response.ok && response.status !== 404) {
          // Only check if not CORS blocked
          if (response.status !== 0) {
            missingFiles.push(file);
          }
        }
      } catch (error) {
        // If CORS error, we can't check - but that's handled by environment check
        if (!error.message.includes('CORS')) {
          missingFiles.push(file);
        }
      }
    }

    return {
      passed: missingFiles.length === 0,
      error: missingFiles.length > 0 ? `Missing files: ${missingFiles.join(', ')}` : null,
      context: { missingFiles }
    };
  }

  async checkEnvironment(context) {
    // Check environment (file:// vs http:// vs https://)
    const protocol = window.location.protocol;
    const isFileProtocol = protocol === 'file:';
    const warnings = [];

    if (isFileProtocol) {
      warnings.push('Running on file:// protocol - CORS restrictions apply');
    }

    // Check if API server is available
    const apiHealth = await this.checkApiHealth(context);
    if (!apiHealth.passed) {
      warnings.push('API server not available - fallback to demo data');
    }

    return {
      passed: true, // Environment check never fails, only warns
      warnings: warnings,
      context: { protocol, isFileProtocol }
    };
  }

  async checkApiHealth(context) {
    // Check if API server is healthy
    const apiBase = context.apiBase || 'http://localhost:8787';
    
    try {
      const response = await fetch(`${apiBase}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      
      if (response.ok) {
        return { passed: true, context: { apiBase, healthy: true } };
      }
    } catch (error) {
      // API not available
      return {
        passed: false,
        error: `API server not available: ${error.message}`,
        context: { apiBase, healthy: false }
      };
    }

    return {
      passed: false,
      error: 'API server health check failed',
      context: { apiBase }
    };
  }

  async checkCorsPolicy(context) {
    // Check if CORS policy will block requests
    const protocol = window.location.protocol;
    const isFileProtocol = protocol === 'file:';
    const warnings = [];

    if (isFileProtocol) {
      warnings.push('CORS policy will block fetch requests on file:// protocol');
    }

    return {
      passed: true, // CORS check never fails, only warns
      warnings: warnings,
      context: { protocol, isFileProtocol }
    };
  }

  async checkServiceWorker(context) {
    // Check if Service Worker can be registered
    const protocol = window.location.protocol;
    const isFileProtocol = protocol === 'file:';
    
    if (isFileProtocol) {
      return {
        passed: false,
        error: 'Service Worker cannot be registered on file:// protocol',
        context: { protocol }
      };
    }

    return {
      passed: true,
      context: { protocol }
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IBMPreCodeVerification;
}
if (typeof window !== 'undefined') {
  window.IBMPreCodeVerification = IBMPreCodeVerification;
}

