// Model Router - Routes code generation to specialized models
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class ModelRouter {
  constructor() {
    this.routes = {
      // Frontend
      'frontend': {
        patterns: [
          /\.(html|css|js|tsx?|vue|svelte)$/,
          /^(modular-fabrikage|apps|public)\//,
          /^(js|css|assets)\//
        ],
        model: 'frontend-specialist',
        constraints: [
          'Preserve TogetherSystems branding',
          'Use error-fix-system for all errors',
          'Follow IBM STANDARD',
          'Ensure XSS protection'
        ]
      },
      
      // Backend
      'backend': {
        patterns: [
          /\.(js|ts)$/,
          /^(server|api|functions|services)\//,
          /server\.js$/,
          /api.*\.js$/
        ],
        model: 'backend-specialist',
        constraints: [
          'Use Express error middleware',
          'Validate all inputs',
          'Return structured error responses',
          'Log all errors with context'
        ]
      },
      
      // Infrastructure
      'infra': {
        patterns: [
          /\.(yml|yaml)$/,
          /^(\.github|ci|docker|k8s)\//,
          /Dockerfile/,
          /docker-compose/
        ],
        model: 'infra-specialist',
        constraints: [
          'Use deterministic builds',
          'Include health checks',
          'Set resource limits',
          'Enable observability'
        ]
      },
      
      // Tests
      'tests': {
        patterns: [
          /\.(spec|test)\.(js|ts)$/,
          /^(tests|__tests__|specs)\//,
          /test.*\.js$/
        ],
        model: 'test-specialist',
        constraints: [
          'Coverage >= 80%',
          'Include property tests for invariants',
          'Test error cases',
          'Use mutation testing'
        ]
      },
      
      // Specs
      'specs': {
        patterns: [
          /^(specs|docs)\//,
          /\.(md|yaml|json)$/,
          /openapi|schema|contract/
        ],
        model: 'spec-specialist',
        constraints: [
          'Version all specs',
          'Maintain backward compatibility',
          'Document breaking changes',
          'Include examples'
        ]
      },
      
      // PowerShell Scripts
      'scripts': {
        patterns: [
          /\.ps1$/,
          /FABRIKAGE.*\.ps1$/
        ],
        model: 'powershell-specialist',
        constraints: [
          'Use ErrorActionPreference',
          'Include comprehensive error handling',
          'Add Write-Host for status',
          'Follow Fabrikage standards'
        ]
      }
    };
  }

  route(filePath, errorType = null) {
    for (const [category, config] of Object.entries(this.routes)) {
      for (const pattern of config.patterns) {
        if (pattern.test(filePath)) {
          return {
            category,
            model: config.model,
            constraints: config.constraints,
            context: this.getContext(filePath, errorType)
          };
        }
      }
    }
    
    // Default to general model
    return {
      category: 'general',
      model: 'general-specialist',
      constraints: [
        'Follow Fabrikage standards',
        'Maintain version 3.0.0',
        'Include branding',
        'Error handling required'
      ],
      context: this.getContext(filePath, errorType)
    };
  }

  getContext(filePath, errorType) {
    const context = {
      file: filePath,
      stack: this.detectStack(filePath),
      errorType: errorType || 'unknown'
    };
    
    // Add relevant spec references
    if (filePath.includes('api') || filePath.includes('server')) {
      context.specs = ['specs/api/openapi.yaml'];
    }
    
    if (filePath.includes('factory') || filePath.includes('module')) {
      context.specs = [
        'specs/module-contracts/fabrikage-modules.md',
        'specs/invariants/properties/node-invariants.js'
      ];
    }
    
    return context;
  }

  detectStack(filePath) {
    if (filePath.match(/\.(html|css|js|tsx?)$/)) return 'frontend';
    if (filePath.match(/server\.js|api.*\.js/)) return 'backend';
    if (filePath.match(/\.ps1$/)) return 'powershell';
    if (filePath.match(/\.(yml|yaml)$/)) return 'infra';
    return 'unknown';
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelRouter;
}

// Global instance
if (typeof window !== 'undefined') {
  window.modelRouter = new ModelRouter();
}



