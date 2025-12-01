/**
 * Policy Engine
 * Steuerung von Funktionsbeschränkung, Verzögerung und späterer Freischaltung
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

import { IndustrialDesignEngine, SlotType } from './industrial-design-engine';
import { VoucherLicenseGateway } from './voucher-license-gateway';

export interface FunctionPolicy {
  functionName: string;
  restrictions: {
    timeBased?: {
      allowedHours: number[];
      blockedHours: number[];
    };
    featureBased?: {
      requiredFeature: string;
      alternativeFeature?: string;
    };
    usageBased?: {
      maxCallsPerDay: number;
      maxCallsPerHour: number;
    };
  };
  delayProfile?: 'soft' | 'medium' | 'hard';
}

export interface PolicyResult {
  allowed: boolean;
  delay?: number;
  dampingLevel?: number;
  reason?: string;
  alternative?: string;
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private designEngine: IndustrialDesignEngine;
  private licenseGateway: VoucherLicenseGateway;
  private policies: Map<string, FunctionPolicy> = new Map();

  private constructor() {
    this.designEngine = IndustrialDesignEngine.getInstance();
    this.licenseGateway = VoucherLicenseGateway.getInstance();
    this.loadDefaultPolicies();
  }

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  /**
   * Lädt Standard-Policies
   */
  private loadDefaultPolicies(): void {
    // Beispiel-Policies
    this.policies.set('export_data', {
      functionName: 'export_data',
      restrictions: {
        featureBased: {
          requiredFeature: 'data_export'
        },
        usageBased: {
          maxCallsPerDay: 10,
          maxCallsPerHour: 3
        }
      },
      delayProfile: 'soft'
    });

    this.policies.set('premium_feature', {
      functionName: 'premium_feature',
      restrictions: {
        featureBased: {
          requiredFeature: 'premium_access'
        }
      },
      delayProfile: 'hard'
    });
  }

  /**
   * Prüft ob Funktion erlaubt ist
   */
  public async checkPolicy(
    functionName: string,
    userId: string,
    productId: string
  ): Promise<PolicyResult> {
    const policy = this.policies.get(functionName);
    
    if (!policy) {
      // Keine Policy = erlaubt
      return { allowed: true };
    }

    // Verifiziere License
    const verification = await this.licenseGateway.verifyLicense(userId, productId, false);
    
    if (!verification.valid || !verification.license) {
      return {
        allowed: false,
        reason: 'Keine gültige License',
        alternative: 'Bitte kaufe eine License'
      };
    }

    const license = verification.license;
    const slotType = verification.slotType;

    // Prüfe Feature-basierte Beschränkung
    if (policy.restrictions.featureBased) {
      const requiredFeature = policy.restrictions.featureBased.requiredFeature;
      if (!license.features.toggles[requiredFeature]) {
        return {
          allowed: false,
          reason: `Feature '${requiredFeature}' nicht verfügbar`,
          alternative: policy.restrictions.featureBased.alternativeFeature
        };
      }
    }

    // Prüfe Nutzungs-basierte Beschränkung
    if (policy.restrictions.usageBased) {
      const usage = this.getFunctionUsage(functionName, userId);
      if (usage.daily >= policy.restrictions.usageBased.maxCallsPerDay) {
        return {
          allowed: false,
          reason: 'Tägliches Limit erreicht',
          alternative: 'Bitte versuche es morgen erneut oder upgrade'
        };
      }
      if (usage.hourly >= policy.restrictions.usageBased.maxCallsPerHour) {
        return {
          allowed: false,
          delay: 3600000, // 1 Stunde warten
          reason: 'Stündliches Limit erreicht',
          alternative: 'Bitte warte eine Stunde oder upgrade'
        };
      }
    }

    // Prüfe Zeit-basierte Beschränkung
    if (policy.restrictions.timeBased) {
      const now = new Date();
      const currentHour = now.getHours();
      
      if (policy.restrictions.timeBased.blockedHours?.includes(currentHour)) {
        return {
          allowed: false,
          reason: `Funktion in Stunde ${currentHour} blockiert`,
          alternative: 'Bitte versuche es zu einer anderen Zeit'
        };
      }
    }

    // Berechne Verzögerung basierend auf Delay-Profile
    let delay = 0;
    let dampingLevel = 0;

    if (policy.delayProfile) {
      const slotConfig = this.designEngine.getSlotConfiguration(slotType);
      if (slotConfig) {
        delay = slotConfig.maxDelaySeconds * 1000;
        
        // Damping-Level basierend auf Profile
        switch (policy.delayProfile) {
          case 'soft':
            dampingLevel = 1;
            delay *= 0.5;
            break;
          case 'medium':
            dampingLevel = 2;
            delay *= 1.0;
            break;
          case 'hard':
            dampingLevel = 3;
            delay *= 2.0;
            break;
        }
      }
    }

    return {
      allowed: true,
      delay: delay > 0 ? delay : undefined,
      dampingLevel
    };
  }

  /**
   * Hole Funktion-Nutzung
   */
  private getFunctionUsage(functionName: string, userId: string): {
    daily: number;
    hourly: number;
  } {
    // In Produktion: Aus Telemetry-System laden
    if (typeof localStorage !== 'undefined') {
      const key = `policy_usage_${functionName}_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
          
          // Filtere alte Einträge
          const daily = data.filter((entry: any) => new Date(entry.timestamp) >= today).length;
          const hourly = data.filter((entry: any) => new Date(entry.timestamp) >= hour).length;
          
          return { daily, hourly };
        } catch (e) {
          console.error('Fehler beim Laden der Nutzung:', e);
        }
      }
    }

    return { daily: 0, hourly: 0 };
  }

  /**
   * Registriert Funktion-Nutzung
   */
  public registerFunctionUsage(functionName: string, userId: string): void {
    if (typeof localStorage !== 'undefined') {
      const key = `policy_usage_${functionName}_${userId}`;
      const stored = localStorage.getItem(key);
      const data = stored ? JSON.parse(stored) : [];
      
      data.push({
        timestamp: new Date().toISOString()
      });

      // Behalte nur letzten 24 Stunden
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filtered = data.filter((entry: any) => new Date(entry.timestamp) >= dayAgo);

      localStorage.setItem(key, JSON.stringify(filtered));
    }
  }

  /**
   * Fügt Policy hinzu
   */
  public addPolicy(policy: FunctionPolicy): void {
    this.policies.set(policy.functionName, policy);
  }

  /**
   * Entfernt Policy
   */
  public removePolicy(functionName: string): void {
    this.policies.delete(functionName);
  }
}

// Export Singleton
export default PolicyEngine;




