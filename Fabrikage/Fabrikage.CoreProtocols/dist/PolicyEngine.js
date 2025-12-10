"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyEngine = exports.PolicyEngine = void 0;
class PolicyEngine {
    constructor() {
        this.policies = new Map();
    }
    /**
     * Register a new policy or update an existing one
     */
    registerPolicy(policy) {
        this.policies.set(policy.id, policy);
    }
    /**
     * Get a policy by ID
     */
    getPolicy(policyId) {
        return this.policies.get(policyId);
    }
    /**
     * Evaluate a value against a specific policy
     */
    evaluate(policyId, context) {
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
    evaluateRules(rules, context) {
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
    evaluateRule(rule, context) {
        const value = this.resolveValue(rule.field, context);
        switch (rule.operator) {
            case 'eq':
                return { passed: value === rule.value };
            case 'neq':
                return { passed: value !== rule.value };
            case 'gt':
                return { passed: typeof value === 'number' && value > rule.value };
            case 'lt':
                return { passed: typeof value === 'number' && value < rule.value };
            case 'gte':
                return { passed: typeof value === 'number' && value >= rule.value };
            case 'lte':
                return { passed: typeof value === 'number' && value <= rule.value };
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
    resolveValue(field, context) {
        return field.split('.').reduce((obj, key) => {
            if (obj && typeof obj === 'object' && key in obj) {
                return obj[key];
            }
            return undefined;
        }, context);
    }
}
exports.PolicyEngine = PolicyEngine;
// Export a singleton instance
exports.policyEngine = new PolicyEngine();
