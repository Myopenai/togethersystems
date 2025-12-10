import { Policy, PolicyEvaluationResult, PolicyRule } from './types';

export class PolicyEngine {
  private policies: Map<string, Policy> = new Map();

  /**
   * Register a new policy or update an existing one
   */
  registerPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get a policy by ID
   */
  getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Evaluate a value against a specific policy
   */
  evaluate(policyId: string, context: Record<string, unknown>): PolicyEvaluationResult {
    const policy = this.getPolicy(policyId);
    if (!policy) {
      return {
        passed: false,
        violations: [{
          ruleId: 'policy-not-found',
          message: `Policy '${policyId}' not found`,
        }],
      };
    }

    return this.evaluateRules(policy.rules, context);
  }

  /**
   * Evaluate a value against a set of rules
   */
  evaluateRules(rules: PolicyRule[], context: Record<string, unknown>): PolicyEvaluationResult {
    const violations = [];

    for (const rule of rules) {
      const result = this.evaluateRule(rule, context);
      if (!result.passed) {
        violations.push({
          ruleId: rule.id,
          message: result.message || rule.message,
          details: result.details,
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Evaluate a single rule against a value
   */
  private evaluateRule(rule: PolicyRule, context: Record<string, unknown>): { passed: boolean; message?: string; details?: Record<string, unknown> } {
    const value = this.resolveValue(rule.field, context);

    switch (rule.operator) {
      case 'eq':
        return { passed: value === rule.value };
      case 'neq':
        return { passed: value !== rule.value };
      case 'gt':
        return { passed: typeof value === 'number' && value > (rule.value as number) };
      case 'lt':
        return { passed: typeof value === 'number' && value < (rule.value as number) };
      case 'gte':
        return { passed: typeof value === 'number' && value >= (rule.value as number) };
      case 'lte':
        return { passed: typeof value === 'number' && value <= (rule.value as number) };
      case 'in':
        return { 
          passed: Array.isArray(rule.value) && rule.value.includes(value),
          details: { value, allowedValues: rule.value }
        };
      case 'notIn':
        return { 
          passed: Array.isArray(rule.value) && !rule.value.includes(value),
          details: { value, disallowedValues: rule.value }
        };
      case 'contains':
        return { 
          passed: Array.isArray(value) && value.includes(rule.value),
          details: { value, expected: rule.value }
        };
      default:
        return { 
          passed: false, 
          message: `Unsupported operator: ${rule.operator}`,
          details: { operator: rule.operator }
        };
    }
  }

  /**
   * Resolve a field path in the context object
   */
  private resolveValue(field: string, context: Record<string, unknown>): unknown {
    return field.split('.').reduce((obj, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, context as unknown);
  }
}

// Export a singleton instance
export const policyEngine = new PolicyEngine();
