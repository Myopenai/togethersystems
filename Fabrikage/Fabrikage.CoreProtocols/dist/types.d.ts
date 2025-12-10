import { JSONSchema7 } from 'json-schema';
/**
 * Represents a build artifact in the system
 */
export interface Artifact {
    id: string;
    name: string;
    version: string;
    type: 'docker' | 'npm' | 'binary' | 'library' | 'executable' | 'documentation' | 'other';
    checksum: string;
    algorithm: 'sha256' | 'sha512' | 'md5';
    location: string;
    metadata?: {
        buildId?: string;
        pipelineId?: string;
        dependencies?: Array<{
            name: string;
            version: string;
            type: 'runtime' | 'dev' | 'peer' | 'optional';
        }>;
        [key: string]: unknown;
    };
    createdAt: string;
    updatedAt?: string;
}
/**
 * Software Bill of Materials (SBOM)
 */
export interface SBOM {
    spdxVersion: string;
    spdxID: string;
    name: string;
    documentNamespace: string;
    creationInfo: {
        created: string;
        creators: string[];
        licenseListVersion?: string;
    };
    packages: Array<{
        name: string;
        version: string;
        supplier: string;
        downloadLocation: string;
        filesAnalyzed: boolean;
        licenseConcluded?: string;
        licenseDeclared?: string;
        copyrightText?: string;
        hashes?: Record<string, string>;
        externalRefs?: Array<{
            type: string;
            locator: string;
            comment?: string;
        }>;
    }>;
    relationships: Array<{
        spdxElementId: string;
        relatedSpdxElement: string;
        relationshipType: string;
        comment?: string;
    }>;
}
/**
 * Policy definition for governance and compliance
 */
export interface Policy {
    id: string;
    name: string;
    description?: string;
    version: string;
    rules: PolicyRule[];
    metadata?: {
        severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
        tags?: string[];
        [key: string]: unknown;
    };
    createdAt: string;
    updatedAt?: string;
}
/**
 * A rule within a policy
 */
export type PolicyRule = {
    id: string;
    type: 'allow' | 'deny' | 'require' | 'validate' | 'notify';
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'contains' | 'matches';
    value: unknown;
    message: string;
    conditions?: PolicyRuleCondition[];
    onFailure?: 'warn' | 'error' | 'reject';
};
/**
 * Condition for policy rule evaluation
 */
export interface PolicyRuleCondition {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'contains' | 'exists';
    value: unknown;
}
/**
 * JSON Schema definition with Fabrikage extensions
 */
export interface SchemaDefinition extends JSONSchema7 {
    $id: string;
    $schema?: string;
    title: string;
    description?: string;
    type: string | string[];
    definitions?: Record<string, JSONSchema7>;
    [key: string]: any;
}
/**
 * Result of schema validation
 */
export interface ValidationResult {
    valid: boolean;
    errors?: Array<{
        field: string;
        message: string;
        value?: unknown;
        schemaPath?: string;
        dataPath?: string;
    }>;
    warnings?: Array<{
        field: string;
        message: string;
        value?: unknown;
    }>;
}
/**
 * Result of policy evaluation
 */
export interface PolicyEvaluationResult {
    passed: boolean;
    violations?: Array<{
        ruleId: string;
        message: string;
        field?: string;
        value?: unknown;
        details?: Record<string, unknown>;
    }>;
    warnings?: Array<{
        ruleId: string;
        message: string;
        field?: string;
        value?: unknown;
    }>;
}
/**
 * Schema Registry interface for managing JSON Schemas
 */
export interface SchemaRegistry {
    /**
     * Register a new schema or update an existing one
     */
    register(schema: SchemaDefinition): void;
    /**
     * Get a schema by its ID
     */
    get(schemaId: string): SchemaDefinition | undefined;
    /**
     * Validate data against a schema by ID
     */
    validate<T = unknown>(schemaId: string, data: unknown): ValidationResult;
    /**
     * Validate data against a schema object
     */
    validateAgainstSchema<T = unknown>(schema: SchemaDefinition, data: unknown): ValidationResult;
    /**
     * Remove a schema from the registry
     */
    unregister(schemaId: string): boolean;
    /**
     * List all registered schema IDs
     */
    listSchemas(): string[];
}
/**
 * Policy Engine interface for evaluating policies
 */
export interface PolicyEngine {
    /**
     * Register a new policy or update an existing one
     */
    registerPolicy(policy: Policy): void;
    /**
     * Get a policy by ID
     */
    getPolicy(policyId: string): Policy | undefined;
    /**
     * Remove a policy
     */
    unregisterPolicy(policyId: string): boolean;
    /**
     * Evaluate data against a specific policy
     */
    evaluate(policyId: string, context: Record<string, unknown>): PolicyEvaluationResult;
    /**
     * Evaluate data against a set of rules
     */
    evaluateRules(rules: PolicyRule[], context: Record<string, unknown>): PolicyEvaluationResult;
    /**
     * Evaluate a single rule
     */
    evaluateRule(rule: PolicyRule, context: Record<string, unknown>): {
        passed: boolean;
        message?: string;
        details?: Record<string, unknown>;
    };
    /**
     * List all registered policy IDs
     */
    listPolicies(): string[];
}
/**
 * Event emitted by the system
 */
export interface Event {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    data: Record<string, unknown>;
    metadata?: {
        correlationId?: string;
        userId?: string;
        [key: string]: unknown;
    };
}
/**
 * Configuration for the CoreProtocols module
 */
export interface CoreProtocolsConfig {
    /**
     * Whether to enable strict schema validation
     * @default true
     */
    strictValidation?: boolean;
    /**
     * Default schema to use when none is specified
     */
    defaultSchemaId?: string;
    /**
     * Whether to automatically register built-in schemas
     * @default true
     */
    registerBuiltInSchemas?: boolean;
    /**
     * Whether to enable schema caching
     * @default true
     */
    enableCaching?: boolean;
    /**
     * Cache TTL in milliseconds
     * @default 300000 (5 minutes)
     */
    cacheTtl?: number;
    /**
     * Logging configuration
     */
    logging?: {
        /**
         * Log level
         * @default 'warn'
         */
        level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
        /**
         * Whether to log validation errors
         * @default true
         */
        logValidationErrors?: boolean;
        /**
         * Whether to log policy evaluation results
         * @default false
         */
        logPolicyEvaluations?: boolean;
    };
}
