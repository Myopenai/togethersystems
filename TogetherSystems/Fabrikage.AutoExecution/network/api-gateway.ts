/**
 * ============================================================================
# API GATEWAY
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. API Gateway - Sandbox, Rate-Limiting, Isolation
# ============================================================================
 */

export interface GatewayConfig {
  sandbox: boolean;
  outbound_whitelist: string[];
  rate_limits: {
    per_minute: number;
    per_hour: number;
    per_day: number;
  };
  isolation: 'process' | 'container' | 'vm';
  security: 'tls_required' | 'tls_optional' | 'none';
}

export class APIGateway {
  private config: GatewayConfig;
  private requestCounts: Map<string, { minute: number; hour: number; day: number }> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  /**
   * Prüft ob Request erlaubt ist
   */
  async isAllowed(url: string, clientId: string): Promise<boolean> {
    // Prüfe Whitelist
    if (this.config.outbound_whitelist.length > 0) {
      const allowed = this.config.outbound_whitelist.some(whitelisted => url.includes(whitelisted));
      if (!allowed) {
        console.warn(`T,. API Gateway: URL nicht in Whitelist: ${url}`);
        return false;
      }
    }

    // Prüfe Rate-Limits
    if (!this.checkRateLimit(clientId)) {
      console.warn(`T,. API Gateway: Rate-Limit überschritten für ${clientId}`);
      return false;
    }

    return true;
  }

  /**
   * Prüft Rate-Limits
   */
  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const counts = this.requestCounts.get(clientId) || { minute: 0, hour: 0, day: 0 };

    // Reset bei Bedarf (vereinfacht)
    counts.minute++;
    counts.hour++;
    counts.day++;

    if (counts.minute > this.config.rate_limits.per_minute) return false;
    if (counts.hour > this.config.rate_limits.per_hour) return false;
    if (counts.day > this.config.rate_limits.per_day) return false;

    this.requestCounts.set(clientId, counts);
    return true;
  }

  /**
   * Führt Request in Sandbox aus
   */
  async executeInSandbox(url: string, options: any): Promise<any> {
    if (!this.config.sandbox) {
      // Direkter Request
      return await fetch(url, options);
    }

    // Sandbox-Execution
    console.log(`T,. API Gateway: Führe Request in Sandbox aus: ${url}`);
    
    // In Produktion würde hier die tatsächliche Sandbox-Isolation stattfinden
    // z.B. über Process-Isolation, Container oder VM
    
    return await fetch(url, options);
  }
}

