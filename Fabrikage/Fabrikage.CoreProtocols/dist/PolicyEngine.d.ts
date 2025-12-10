import { Policy, PolicyEvaluationResult, PolicyRule } from './types';
export declare class PolicyEngine {
    private policies;
    /**
     * Register a new policy or update an existing one
     */
    registerPolicy(policy: Policy): void;
    /**
     * Get a policy by ID
     */
    getPolicy(policyId: string): Policy | undefined;
    /**
     * Evaluate a value against a specific policy
     */
    evaluate(policyId: string, context: Record<string, unknown>): PolicyEvaluationResult;
    /**
     * Evaluate a value against a set of rules
     */
    evaluateRules(rules: PolicyRule[], context: Record<string, unknown>): PolicyEvaluationResult;
    /**
     * Evaluate a single rule against a value
     */
    private evaluateRule;
    /**
     * Resolve a field path in the context object
     */
    private resolveValue;
}
export declare const policyEngine: PolicyEngine;
