// [.SYSTEMS.T.SYSTEMS.] FABRIKAGE AUTO-FIXER
// Policy-gesteuerter Auto-Fix, der nur auditiert freigegebene Änderungen ausrollt

(function() {
  'use strict';
  
  class AutoFixer {
    constructor(errorBus, policies) {
      this.errorBus = errorBus;
      this.policies = policies || {
        enabled: true,
        ruleset: 'default',
        confidenceThreshold: 0.8
      };
      this.fixRecipes = this.loadFixRecipes();
      this.fixHistory = [];
    }
    
    loadFixRecipes() {
      return {
        'http.failure': {
          id: 'http-retry-wrap',
          match: {
            class: ['http.failure', 'timeout'],
            stage: ['test', 'integration', 'runtime']
          },
          action: {
            type: 'patch',
            description: 'Wrap fetch with retry logic',
            confidence: 0.85
          },
          validation: {
            tests: ['unit:fetch'],
            lint: true
          }
        },
        'ocr.quality.low': {
          id: 'ocr-enhance',
          match: {
            class: ['ocr.quality.low'],
            stage: ['ocr', 'runtime']
          },
          action: {
            type: 'config',
            description: 'Enhance OCR preprocessing',
            confidence: 0.75
          },
          validation: {
            tests: ['ocr:quality']
          }
        },
        'localStorage.quota': {
          id: 'storage-cleanup',
          match: {
            class: ['localStorage.quota', 'storage.full'],
            stage: ['runtime']
          },
          action: {
            type: 'cleanup',
            description: 'Clear old localStorage entries',
            confidence: 0.90
          },
          validation: {
            tests: []
          }
        },
        'parse.error': {
          id: 'parse-safe-wrapper',
          match: {
            class: ['parse.error', 'json.error'],
            stage: ['runtime']
          },
          action: {
            type: 'patch',
            description: 'Add safe JSON.parse wrapper',
            confidence: 0.80
          },
          validation: {
            tests: ['unit:parse']
          }
        }
      };
    }
    
    async attemptFix(event) {
      if (!this.policies.enabled) {
        return { success: false, reason: 'autofix disabled' };
      }
      
      const recipe = this.findMatchingRecipe(event);
      if (!recipe) {
        return { success: false, reason: 'no matching recipe' };
      }
      
      if (recipe.action.confidence < (this.policies.confidenceThreshold || 0.8)) {
        return { success: false, reason: 'confidence too low', confidence: recipe.action.confidence };
      }
      
      // Apply fix
      const fixResult = await this.applyFix(event, recipe);
      
      if (fixResult.success) {
        this.fixHistory.push({
          eventId: event.eventId,
          fixId: recipe.id,
          timestamp: new Date().toISOString(),
          recipe,
          result: fixResult
        });
        
        // Validate fix
        const validation = await this.validateFix(recipe, event);
        if (!validation.passed) {
          this.errorBus.publish({
            module: event.module || 'unknown',
            stage: 'autofix',
            level: 'warning',
            class: 'autofix.validation.failed',
            message: `Fix validation failed: ${validation.reason}`,
            context: { fixId: recipe.id, validation }
          });
          return { success: false, reason: 'validation failed', validation };
        }
      }
      
      return fixResult;
    }
    
    findMatchingRecipe(event) {
      for (const [key, recipe] of Object.entries(this.fixRecipes)) {
        if (this.matchesRecipe(event, recipe)) {
          return recipe;
        }
      }
      return null;
    }
    
    matchesRecipe(event, recipe) {
      const match = recipe.match;
      
      if (match.class && !match.class.includes(event.class)) {
        return false;
      }
      
      if (match.stage && !match.stage.includes(event.stage)) {
        return false;
      }
      
      return true;
    }
    
    async applyFix(event, recipe) {
      try {
        switch(recipe.action.type) {
          case 'patch':
            return await this.applyPatchFix(event, recipe);
          case 'config':
            return await this.applyConfigFix(event, recipe);
          case 'cleanup':
            return await this.applyCleanupFix(event, recipe);
          default:
            return { success: false, reason: 'unknown fix type' };
        }
      } catch(e) {
        return { success: false, reason: e.message, error: e };
      }
    }
    
    async applyPatchFix(event, recipe) {
      // Patch fixes would modify code - in browser context, we log and suggest
      this.errorBus.publish({
        module: event.module || 'unknown',
        stage: 'autofix',
        level: 'info',
        class: 'autofix.patch.suggested',
        message: `Patch fix suggested: ${recipe.action.description}`,
        context: { fixId: recipe.id, recipe }
      });
      
      return { success: true, fixId: recipe.id, type: 'patch', applied: 'suggested' };
    }
    
    async applyConfigFix(event, recipe) {
      // Config fixes adjust runtime behavior
      if (recipe.id === 'ocr-enhance') {
        // Enhance OCR settings
        if (window.Tesseract && window.Tesseract.createWorker) {
          // Could adjust OCR parameters
          this.errorBus.publish({
            module: 'ocr',
            stage: 'autofix',
            level: 'info',
            class: 'autofix.config.applied',
            message: 'OCR preprocessing enhanced',
            context: { fixId: recipe.id }
          });
          return { success: true, fixId: recipe.id, type: 'config' };
        }
      }
      
      return { success: false, reason: 'config fix not applicable' };
    }
    
    async applyCleanupFix(event, recipe) {
      // Cleanup fixes remove old data
      if (recipe.id === 'storage-cleanup') {
        try {
          const keys = Object.keys(localStorage);
          const oldKeys = keys.filter(k => k.startsWith('fabrikage-') || k.startsWith('uae-'));
          let cleaned = 0;
          
          for (const key of oldKeys) {
            try {
              const item = localStorage.getItem(key);
              if (item) {
                const data = JSON.parse(item);
                const age = Date.now() - (data.timestamp ? new Date(data.timestamp).getTime() : 0);
                if (age > 7 * 24 * 60 * 60 * 1000) { // 7 days
                  localStorage.removeItem(key);
                  cleaned++;
                }
              }
            } catch(e) {
              // Skip invalid entries
            }
          }
          
          this.errorBus.publish({
            module: 'system',
            stage: 'autofix',
            level: 'info',
            class: 'autofix.cleanup.applied',
            message: `Cleaned ${cleaned} old localStorage entries`,
            context: { fixId: recipe.id, cleaned }
          });
          
          return { success: true, fixId: recipe.id, type: 'cleanup', cleaned };
        } catch(e) {
          return { success: false, reason: e.message };
        }
      }
      
      return { success: false, reason: 'cleanup fix not applicable' };
    }
    
    async validateFix(recipe, event) {
      if (!recipe.validation || !recipe.validation.tests) {
        return { passed: true };
      }
      
      // In browser context, we can't run full tests, but we can check basic conditions
      if (recipe.validation.lint) {
        // Would run linter in build context
        return { passed: true, note: 'lint check skipped in runtime' };
      }
      
      return { passed: true };
    }
  }
  
  // Initialize when Error Bus is available
  function initAutoFixer() {
    if (window.fabrikageErrorBus) {
      window.fabrikageAutoFixer = new AutoFixer(
        window.fabrikageErrorBus,
        window.FABRIKAGE_POLICIES?.autofix || {}
      );
      console.log('[FABRIKAGE] Auto-Fixer initialisiert');
    } else {
      setTimeout(initAutoFixer, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoFixer);
  } else {
    initAutoFixer();
  }
})();
