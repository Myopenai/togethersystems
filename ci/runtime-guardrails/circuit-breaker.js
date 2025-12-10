// Circuit Breaker - Runtime Guardrails
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class CircuitBreaker {
  constructor(config) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      timeout: config.timeout || 10000,
      halfOpenRequests: config.halfOpenRequests || 3,
      ...config
    };
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenRequestCount = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      // Check if we should try half-open
      if (Date.now() - this.lastFailureTime > this.config.timeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenRequestCount = 0;
        console.log('Circuit breaker: Moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      
      if (this.state === 'HALF_OPEN') {
        this.halfOpenRequestCount++;
        if (this.halfOpenRequestCount >= this.config.halfOpenRequests) {
          this.state = 'CLOSED';
          this.failureCount = 0;
          this.successCount = 0;
          console.log('Circuit breaker: Moving to CLOSED state');
        }
      } else {
        // Reset failure count on success
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
        this.halfOpenRequestCount = 0;
        console.log('Circuit breaker: Moving to OPEN state (half-open failed)');
      } else if (this.failureCount >= this.config.failureThreshold) {
        this.state = 'OPEN';
        console.log('Circuit breaker: Moving to OPEN state (threshold reached)');
      }
      
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenRequestCount = 0;
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircuitBreaker;
}

// Global instance for API calls
if (typeof window !== 'undefined') {
  window.circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    timeout: 10000,
    halfOpenRequests: 3
  });
}



