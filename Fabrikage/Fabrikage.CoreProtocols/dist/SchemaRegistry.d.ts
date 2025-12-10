import { SchemaDefinition, SchemaRegistry as ISchemaRegistry, ValidationResult } from './types';
export declare class SchemaRegistry implements ISchemaRegistry {
    private schemas;
    private ajv;
    constructor();
    register(schema: SchemaDefinition): void;
    get(schemaId: string): SchemaDefinition | undefined;
    validate<T = unknown>(schemaId: string, data: unknown): ValidationResult;
    validateAgainstSchema(schema: SchemaDefinition, data: unknown): ValidationResult;
    validateAndCast<T>(schemaId: string, data: unknown): {
        data: T;
    } & ValidationResult;
}
export declare const schemaRegistry: SchemaRegistry;
export * from './types';
