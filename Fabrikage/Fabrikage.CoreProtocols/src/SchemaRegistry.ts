import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaDefinition, SchemaRegistry as ISchemaRegistry, ValidationResult } from './types';

export class SchemaRegistry implements ISchemaRegistry {
  private schemas: Map<string, SchemaDefinition> = new Map();
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      useDefaults: true,
      coerceTypes: true,
    });
    
    // Add common string formats
    addFormats(this.ajv);
  }

  register(schema: SchemaDefinition): void {
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

  get(schemaId: string): SchemaDefinition | undefined {
    return this.schemas.get(schemaId);
  }

  validate<T = unknown>(schemaId: string, data: unknown): ValidationResult {
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

  validateAgainstSchema(schema: SchemaDefinition, data: unknown): ValidationResult {
    try {
      const validate = this.ajv.compile(schema);
      const valid = validate(data);

      if (valid) {
        return { valid: true };
      }

      return {
        valid: false,
        errors: (validate.errors || []).map((error: ErrorObject) => ({
          field: error.instancePath || '$',
          message: error.message || 'Validation error',
          value: error.data,
        })),
      };
    } catch (error) {
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
  validateAndCast<T>(schemaId: string, data: unknown): { data: T } & ValidationResult {
    const result = this.validate(schemaId, data);
    return {
      ...result,
      data: data as T,
    };
  }
}

// Export a singleton instance
export const schemaRegistry = new SchemaRegistry();

// Export types for convenience
export * from './types';
