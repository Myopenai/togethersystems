"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaRegistry = exports.SchemaRegistry = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
class SchemaRegistry {
    constructor() {
        this.schemas = new Map();
        this.ajv = new ajv_1.default({
            allErrors: true,
            strict: true,
            useDefaults: true,
            coerceTypes: true,
        });
        // Add common string formats
        (0, ajv_formats_1.default)(this.ajv);
    }
    register(schema) {
        // Ensure schema has an ID
        if (!schema.$id) {
            throw new Error('Schema must have an $id property');
        }
        const schemaId = schema.$id;
        if (this.schemas.has(schemaId)) {
            throw new Error(`Schema with ID '${schemaId}' is already registered`);
        }
        // Compile the schema to validate it
        this.ajv.compile(schema);
        // Store the schema with a non-null ID
        this.schemas.set(schemaId, schema);
    }
    get(schemaId) {
        return this.schemas.get(schemaId);
    }
    validate(schemaId, data) {
        const schema = this.get(schemaId);
        if (!schema) {
            return {
                valid: false,
                errors: [{
                        field: '$schema',
                        message: `Schema with ID '${schemaId}' not found`,
                    }],
            };
        }
        return this.validateAgainstSchema(schema, data);
    }
    validateAgainstSchema(schema, data) {
        try {
            const validate = this.ajv.compile(schema);
            const valid = validate(data);
            if (valid) {
                return { valid: true };
            }
            return {
                valid: false,
                errors: (validate.errors || []).map((error) => ({
                    field: error.instancePath || '$',
                    message: error.message || 'Validation error',
                    value: error.data,
                })),
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: '$schema',
                        message: error instanceof Error ? error.message : 'Unknown validation error',
                    }],
            };
        }
    }
    // Helper method to validate and cast data to a specific type
    validateAndCast(schemaId, data) {
        const result = this.validate(schemaId, data);
        return {
            ...result,
            data: data,
        };
    }
}
exports.SchemaRegistry = SchemaRegistry;
// Export a singleton instance
exports.schemaRegistry = new SchemaRegistry();
// Export types for convenience
__exportStar(require("./types"), exports);
