/**
 * Industrial Design Engine
 * Zeitverzögerungs-Mechanismus für globale Software-Fertigung
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

import { UserFriendlinessMoralEngine } from './user-friendliness-moral-engine';

export type SlotType = 'demo' | 'free' | 'prickle_user' | 'purchased' | 'premium';

export interface SlotConfiguration {
  delayMultiplier: number;
  featureAccess: 'limited' | 'basic' | 'standard' | 'full' | 'full_plus';
  maxDelaySeconds: number;
  progressiveDelay: boolean;
  purpose: string;
}

export interface DelayProfile {
  level: number;
  delaySeconds: number;
  description: string;
}

export interface FunctionInertiaConfig {
  enabled: boolean;
  progressiveDamping: DelayProfile[];
  gracePeriod: {
    enabled: boolean;
    durationHours: number;
  };
}

export class IndustrialDesignEngine {
  private static instance: IndustrialDesignEngine;
  private moralEngine: UserFriendlinessMoralEngine;
  private slots: Map<SlotType, SlotConfiguration>;
  private functionInertia: FunctionInertiaConfig;

  private constructor() {
    this.moralEngine = UserFriendlinessMoralEngine.getInstance();
    this.loadConfiguration();
  }

  public static getInstance(): IndustrialDesignEngine {
    if (!IndustrialDesignEngine.instance) {
      IndustrialDesignEngine.instance = new IndustrialDesignEngine();
    }
    return IndustrialDesignEngine.instance;
  }

  private loadConfiguration(): void {
    // Slots-Konfiguration
    this.slots = new Map<SlotType, SlotConfiguration>([
      ['demo', {
        delayMultiplier: 1.0,
        featureAccess: 'limited',
        maxDelaySeconds: 5,
        progressiveDelay: false,
        purpose: 'Demo-Version für nicht-anreizbare User'
      }],
      ['free', {
        delayMultiplier: 1.5,
        featureAccess: 'basic',
        maxDelaySeconds: 10,
        progressiveDelay: false,
        purpose: 'Kostenlose Version'
      }],
      ['prickle_user', {
        delayMultiplier: 2.0,
        featureAccess: 'standard',
        maxDelaySeconds: 15,
        progressiveDelay: true,
        purpose: 'User die zum Kauf angeregt werden sollen'
      }],
      ['purchased', {
        delayMultiplier: 0.1,
        featureAccess: 'full',
        maxDelaySeconds: 0,
        progressiveDelay: false,
        purpose: 'Kauf-Software - minimale Verzögerung'
      }],
      ['premium', {
        delayMultiplier: 0.0,
        featureAccess: 'full_plus',
        maxDelaySeconds: 0,
        progressiveDelay: false,
        purpose: 'Premium-Version - keine Verzögerung'
      }]
    ]);

    // Funktions-Trägheit
    this.functionInertia = {
      enabled: true,
      progressiveDamping: [
        { level: 1, delaySeconds: 2, description: 'Erste Verzögerungsstufe' },
        { level: 2, delaySeconds: 5, description: 'Zweite Verzögerungsstufe' },
        { level: 3, delaySeconds: 10, description: 'Dritte Verzögerungsstufe' },
        { level: 4, delaySeconds: 20, description: 'Vierte Verzögerungsstufe - kurz vor Blockade' }
      ],
      gracePeriod: {
        enabled: true,
        durationHours: 168 // 7 Tage
      }
    };
  }

  /**
   * Berechnet Verzögerung für Funktion basierend auf Slot
   */
  public async applyDelay(slotType: SlotType, functionName: string, baseDelayMs: number = 0): Promise<void> {
    const slot = this.slots.get(slotType);
    if (!slot) {
      throw new Error(`Unbekannter Slot-Typ: ${slotType}`);
    }

    // Premium hat keine Verzögerung
    if (slotType === 'premium') {
      return;
    }

    // Berechne tatsächliche Verzögerung
    const actualDelay = Math.min(
      baseDelayMs * slot.delayMultiplier,
      slot.maxDelaySeconds * 1000
    );

    // Progressive Delay für prickle_user
    if (slot.progressiveDelay && slotType === 'prickle_user') {
      const progressiveDelay = this.calculateProgressiveDelay(functionName);
      await this.delay(actualDelay + progressiveDelay);
    } else {
      await this.delay(actualDelay);
    }
  }

  /**
   * Berechnet progressive Verzögerung basierend auf Funktion
   */
  private calculateProgressiveDelay(functionName: string): number {
    // Zähle Nutzung der Funktion (vereinfacht - in Produktion aus Telemetry)
    const usageCount = this.getFunctionUsageCount(functionName);
    const level = Math.min(Math.floor(usageCount / 10) + 1, 4);
    
    const damping = this.functionInertia.progressiveDamping[level - 1];
    return damping ? damping.delaySeconds * 1000 : 0;
  }

  /**
   * Hole Nutzungsanzahl einer Funktion (vereinfacht)
   */
  private getFunctionUsageCount(functionName: string): number {
    // In Produktion: Aus Telemetry-System laden
    const storageKey = `function_usage_${functionName}`;
    const stored = localStorage?.getItem(storageKey);
    return stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Erhöht Nutzungszähler
   */
  public incrementFunctionUsage(functionName: string): void {
    const storageKey = `function_usage_${functionName}`;
    const current = this.getFunctionUsageCount(functionName);
    if (localStorage) {
      localStorage.setItem(storageKey, (current + 1).toString());
    }
  }

  /**
   * Prüft ob Funktion im Grace-Period ist
   */
  public isInGracePeriod(lastActivation: Date): boolean {
    if (!this.functionInertia.gracePeriod.enabled) {
      return false;
    }

    const now = new Date();
    const hoursSinceActivation = (now.getTime() - lastActivation.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivation < this.functionInertia.gracePeriod.durationHours;
  }

  /**
   * Prüft ob Funktion vor Blockade ist (Zeitbegrenzung mit Neu-Beschaffung)
   */
  public isBeforeFullBlockade(lastRenewal: Date, renewalWindowHours: number = 24): {
    beforeBlockade: boolean;
    hoursUntilRenewal: number;
  } {
    const now = new Date();
    const hoursSinceRenewal = (now.getTime() - lastRenewal.getTime()) / (1000 * 60 * 60);
    
    return {
      beforeBlockade: hoursSinceRenewal < renewalWindowHours,
      hoursUntilRenewal: Math.max(0, renewalWindowHours - hoursSinceRenewal)
    };
  }

  /**
   * Wrapper für Funktionen mit automatischer Verzögerung
   */
  public async wrapFunction<T>(
    slotType: SlotType,
    functionName: string,
    fn: () => Promise<T>,
    baseDelayMs: number = 100
  ): Promise<T> {
    // Validiere Moral-Compliance
    const component = {
      functionName,
      slotType,
      requiresAction: true,
      exitOption: true
    };

    if (!this.moralEngine.checkMoralCompliance(component)) {
      throw new Error('Function failed moral compliance check');
    }

    // Erhöhe Nutzungszähler
    this.incrementFunctionUsage(functionName);

    // Wende Verzögerung an
    await this.applyDelay(slotType, functionName, baseDelayMs);

    // Führe Funktion aus
    try {
      const result = await fn();
      return result;
    } catch (error) {
      // User-freundliche Fehlermeldung
      const userFriendlyError = this.moralEngine.createUserFriendlyError(
        error instanceof Error ? error.message : String(error),
        functionName
      );
      throw new Error(userFriendlyError);
    }
  }

  /**
   * Helper: Delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hole Slot-Konfiguration
   */
  public getSlotConfiguration(slotType: SlotType): SlotConfiguration | undefined {
    return this.slots.get(slotType);
  }

  /**
   * Prüft Feature-Zugriff
   */
  public hasFeatureAccess(slotType: SlotType, requiredFeature: 'limited' | 'basic' | 'standard' | 'full' | 'full_plus'): boolean {
    const slot = this.slots.get(slotType);
    if (!slot) {
      return false;
    }

    const featureLevels: Record<string, number> = {
      'limited': 1,
      'basic': 2,
      'standard': 3,
      'full': 4,
      'full_plus': 5
    };

    const slotLevel = featureLevels[slot.featureAccess] || 0;
    const requiredLevel = featureLevels[requiredFeature] || 0;

    return slotLevel >= requiredLevel;
  }
}

// Export Singleton
export default IndustrialDesignEngine;




