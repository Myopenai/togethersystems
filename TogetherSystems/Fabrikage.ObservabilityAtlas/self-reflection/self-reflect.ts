/**
 * ============================================================================
 * SELF REFLECTION
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Self Reflection: Erkennt Loops und Stalls
 * ============================================================================
 */

export interface ReflectionResult {
  isLooping: boolean;
  isStalled: boolean;
  loopDetected: boolean;
  stallDetected: boolean;
  awareness: 'aware' | 'unaware' | 'partial';
  issues: string[];
  timestamp: number;
}

/**
 * T,. Self Reflection: Erkennt eigene Probleme
 */
export class SelfReflect {
  private eventHistory: Array<{ event: string; timestamp: number }> = [];
  private maxHistorySize: number = 100;
  private loopThreshold: number = 5; // Gleiche Events in kurzer Zeit
  private stallThreshold: number = 30000; // 30 Sekunden ohne neue Events

  /**
   * T,. Prüft auf Loops und Stalls
   */
  async reflect(): Promise<ReflectionResult> {
    const now = Date.now();
    const recentEvents = this.eventHistory.filter(
      e => now - e.timestamp < 10000 // Letzte 10 Sekunden
    );

    // Prüfe auf Loops
    const eventCounts = new Map<string, number>();
    for (const event of recentEvents) {
      eventCounts.set(event.event, (eventCounts.get(event.event) || 0) + 1);
    }

    const isLooping = Array.from(eventCounts.values()).some(count => count >= this.loopThreshold);
    const loopDetected = isLooping;

    // Prüfe auf Stalls
    const lastEventTime = this.eventHistory.length > 0 
      ? this.eventHistory[this.eventHistory.length - 1].timestamp 
      : now;
    const timeSinceLastEvent = now - lastEventTime;
    const isStalled = timeSinceLastEvent > this.stallThreshold;
    const stallDetected = isStalled;

    // Bestimme Awareness
    let awareness: 'aware' | 'unaware' | 'partial' = 'unaware';
    if (isLooping && isStalled) {
      awareness = 'aware'; // Erkennt beide Probleme
    } else if (isLooping || isStalled) {
      awareness = 'partial'; // Erkennt nur eines
    }

    const issues: string[] = [];
    if (isLooping) {
      issues.push(`Loop erkannt: ${Array.from(eventCounts.entries())
        .filter(([_, count]) => count >= this.loopThreshold)
        .map(([event, count]) => `${event} (${count}x)`)
        .join(', ')}`);
    }
    if (isStalled) {
      issues.push(`Stall erkannt: ${Math.round(timeSinceLastEvent / 1000)}s ohne Events`);
    }

    return {
      isLooping,
      isStalled,
      loopDetected,
      stallDetected,
      awareness,
      issues,
      timestamp: now
    };
  }

  /**
   * T,. Registriert ein Event
   */
  recordEvent(event: string): void {
    this.eventHistory.push({
      event,
      timestamp: Date.now()
    });

    // Halte History-Größe begrenzt
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * T,. Gibt Event-Historie zurück
   */
  getEventHistory(): Array<{ event: string; timestamp: number }> {
    return [...this.eventHistory];
  }

  /**
   * T,. Löscht Historie
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}

