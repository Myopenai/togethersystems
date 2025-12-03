/**
 * ============================================================================
 * FEATURE FLAGS
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Feature-Flags für kontrollierte Feature-Freischaltung
 * ============================================================================
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number; // 0-100
  target_users: string[]; // User-IDs oder 'all'
  conditions: FeatureFlagCondition[];
}

export interface FeatureFlagCondition {
  property: string; // 'user_id', 'environment', 'region'
  operator: '==' | '!=' | 'in' | 'not_in';
  value: any;
}

export class FeatureFlagManager {
  private featureFlags: Map<string, FeatureFlag> = new Map();

  /**
   * Registriert einen Feature-Flag
   */
  register(featureFlag: FeatureFlag): void {
    this.featureFlags.set(featureFlag.id, featureFlag);
  }

  /**
   * Prüft ob ein Feature-Flag aktiv ist
   */
  isEnabled(flagId: string, context: any = {}): boolean {
    const flag = this.featureFlags.get(flagId);
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Prüfe Rollout-Percentage
    if (flag.rollout_percentage < 100) {
      const hash = this.hashContext(context);
      const percentage = (hash % 100) + 1;
      if (percentage > flag.rollout_percentage) {
        return false;
      }
    }

    // Prüfe Target-Users
    if (flag.target_users.length > 0 && !flag.target_users.includes('all')) {
      if (!context.user_id || !flag.target_users.includes(context.user_id)) {
        return false;
      }
    }

    // Prüfe Conditions
    for (const condition of flag.conditions) {
      if (!this.evaluateCondition(context, condition)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluiert eine Bedingung
   */
  private evaluateCondition(context: any, condition: FeatureFlagCondition): boolean {
    const value = context[condition.property];

    switch (condition.operator) {
      case '==':
        return value === condition.value;
      case '!=':
        return value !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  /**
   * Hasht Context für Rollout-Percentage
   */
  private hashContext(context: any): number {
    const str = JSON.stringify(context);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

