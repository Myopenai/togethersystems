/**
 * ============================================================================
 * PORT REGISTRY
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Port Registry - Verwaltet Ports, vermeidet Konflikte
# ============================================================================
 */

export interface PortAllocation {
  port: number;
  host: string;
  service: string;
  status: 'active' | 'conflict' | 'free';
  allocated_at: string;
  expires_at?: string;
}

export class PortRegistry {
  private allocations: Map<number, PortAllocation> = new Map();
  private ranges: {
    app: [number, number];
    services: [number, number];
    tests: [number, number];
  };

  constructor(ranges: {
    app: [number, number];
    services: [number, number];
    tests: [number, number];
  }) {
    this.ranges = ranges;
  }

  /**
   * Allokiert einen freien Port
   */
  allocate(host: string, service: string, type: 'app' | 'services' | 'tests' = 'app'): number {
    const range = this.ranges[type];
    let port = range[0];

    while (port <= range[1]) {
      if (!this.allocations.has(port) || this.allocations.get(port)!.status === 'free') {
        const allocation: PortAllocation = {
          port,
          host,
          service,
          status: 'active',
          allocated_at: new Date().toISOString(),
        };

        this.allocations.set(port, allocation);
        console.log(`T,. Port Registry: Port ${port} allokiert für ${service} auf ${host}`);
        return port;
      }
      port++;
    }

    throw new Error(`T,. Port Registry: Kein freier Port im Bereich ${range[0]}-${range[1]}`);
  }

  /**
   * Gibt Port frei
   */
  release(port: number): void {
    const allocation = this.allocations.get(port);
    if (allocation) {
      allocation.status = 'free';
      console.log(`T,. Port Registry: Port ${port} freigegeben`);
    }
  }

  /**
   * Prüft Port-Konflikt
   */
  checkConflict(port: number): boolean {
    const allocation = this.allocations.get(port);
    return allocation !== undefined && allocation.status === 'active';
  }

  /**
   * Löst Port-Konflikt automatisch
   */
  resolveConflict(port: number, host: string, service: string): number {
    console.log(`T,. Port Registry: Löse Konflikt für Port ${port}...`);
    
    // Versuche Port freizugeben
    this.release(port);
    
    // Allokiere neuen Port
    return this.allocate(host, service);
  }
}

