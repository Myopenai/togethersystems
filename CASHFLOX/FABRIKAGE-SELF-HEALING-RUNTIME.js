// [.SYSTEMS.T.SYSTEMS.] FABRIKAGE SELF-HEALING RUNTIME
// Supervisor konsumiert Error Bus, steuert Re-tries, Isolierung, Rollbacks

(function() {
  'use strict';
  
  class SelfHealingRuntime {
    constructor(errorBus, policies) {
      this.errorBus = errorBus;
      this.policies = policies || {
        retries: {
          default: { attempts: 3, backoff: 'exponential', maxDelayMs: 30000 }
        },
        autofix: { enabled: true },
        slo: { successRate: 0.99 }
      };
      this.retryAttempts = new Map();
      this.fixHistory = [];
      this.setupSupervisor();
    }
    
    setupSupervisor() {
      if (!this.errorBus) {
        console.error('[FABRIKAGE] SelfHealingRuntime: ErrorBus nicht verfügbar');
        return;
      }
      
      this.errorBus.subscribe((event) => {
        if (event.level === 'error') {
          this.handleError(event);
        }
      });
      
      console.log('[FABRIKAGE] Self-Healing Runtime Supervisor aktiviert');
    }
    
    async handleError(event) {
      const module = event.module || 'unknown';
      const policy = this.policies.retries[module] || this.policies.retries.default;
      
      // Check if we should retry
      const retryKey = `${module}-${event.stage || 'unknown'}`;
      const attempts = this.retryAttempts.get(retryKey) || 0;
      
      if (attempts < policy.attempts) {
        const delay = this.calculateBackoff(attempts, policy);
        this.retryAttempts.set(retryKey, attempts + 1);
        
        this.errorBus.publish({
          module,
          stage: event.stage || 'runtime',
          level: 'info',
          class: 'retry.scheduled',
          message: `Retry ${attempts + 1}/${policy.attempts} in ${delay}ms`,
          context: { originalEvent: event.eventId, delay }
        });
        
        setTimeout(() => {
          this.attemptRetry(event, module);
        }, delay);
      } else {
        // Max retries reached, try auto-fix
        if (this.policies.autofix?.enabled) {
          await this.attemptAutoFix(event);
        } else {
          this.errorBus.publish({
            module,
            stage: event.stage || 'runtime',
            level: 'error',
            class: 'retry.exhausted',
            message: `Max retries (${policy.attempts}) reached`,
            context: { originalEvent: event.eventId }
          });
        }
      }
    }
    
    calculateBackoff(attempt, policy) {
      const baseDelay = 1000;
      let delay = baseDelay;
      
      if (policy.backoff === 'exponential') {
        delay = baseDelay * Math.pow(2, attempt);
      } else if (policy.backoff === 'linear') {
        delay = baseDelay * (attempt + 1);
      }
      
      // Add jitter
      delay += Math.random() * delay * 0.1;
      
      return Math.min(delay, policy.maxDelayMs || 30000);
    }
    
    async attemptRetry(originalEvent, module) {
      // Emit retry event
      this.errorBus.publish({
        module,
        stage: originalEvent.stage || 'runtime',
        level: 'info',
        class: 'retry.attempt',
        message: 'Retrying operation',
        context: { originalEvent: originalEvent.eventId }
      });
      
      // Trigger module-specific retry logic
      if (window[`${module}Retry`] && typeof window[`${module}Retry`] === 'function') {
        try {
          await window[`${module}Retry`](originalEvent);
        } catch(e) {
          // Retry failed, will be handled by next error event
        }
      }
    }
    
    async attemptAutoFix(event) {
      if (!window.fabrikageAutoFixer) {
        this.errorBus.publish({
          module: event.module || 'unknown',
          stage: event.stage || 'runtime',
          level: 'warning',
          class: 'autofix.unavailable',
          message: 'Auto-Fixer nicht verfügbar',
          context: { originalEvent: event.eventId }
        });
        return false;
      }
      
      const fixResult = await window.fabrikageAutoFixer.attemptFix(event);
      
      if (fixResult && fixResult.success) {
        this.fixHistory.push({
          eventId: event.eventId,
          fixId: fixResult.fixId,
          timestamp: new Date().toISOString()
        });
        
        this.errorBus.publish({
          module: event.module || 'unknown',
          stage: event.stage || 'runtime',
          level: 'info',
          class: 'autofix.applied',
          message: `Auto-Fix angewendet: ${fixResult.fixId}`,
          context: { originalEvent: event.eventId, fixResult }
        });
        
        return true;
      }
      
      return false;
    }
    
    checkSLO() {
      const recentErrors = this.errorBus.getEvents({
        level: 'error',
        stage: 'runtime'
      }).slice(-100);
      
      if (recentErrors.length === 0) return { ok: true, rate: 1.0 };
      
      const totalEvents = this.errorBus.getLatestEvents(100).length;
      const successRate = 1 - (recentErrors.length / Math.max(totalEvents, 1));
      
      const sloOk = successRate >= (this.policies.slo?.successRate || 0.99);
      
      return {
        ok: sloOk,
        rate: successRate,
        threshold: this.policies.slo?.successRate || 0.99
      };
    }
  }
  
  // Initialize when Error Bus is available
  function initSelfHealing() {
    if (window.fabrikageErrorBus) {
      window.fabrikageSelfHealing = new SelfHealingRuntime(
        window.fabrikageErrorBus,
        window.FABRIKAGE_POLICIES || {}
      );
      console.log('[FABRIKAGE] Self-Healing Runtime initialisiert');
    } else {
      setTimeout(initSelfHealing, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelfHealing);
  } else {
    initSelfHealing();
  }
})();
