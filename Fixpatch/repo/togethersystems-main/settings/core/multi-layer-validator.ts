/**
 * Multi-Layer Validator
 * 
 * Schema → Dimensional → Semantic → Compliance
 */

import type { SettingsNode, Dimensions } from '../schemas/settings.schema';
import { DimensionalEngine } from './dimensional-engine';
import fs from 'fs';
import path from 'path';

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation Error
 */
export interface ValidationError {
  layer: ValidationLayer;
  message: string;
  nodeId?: string;
  field?: string;
  value?: any;
}

/**
 * Validation Warning
 */
export interface ValidationWarning {
  layer: ValidationLayer;
  message: string;
  nodeId?: string;
  suggestion?: string;
}

/**
 * Validation Layer
 */
export type ValidationLayer = 'schema' | 'dimensional' | 'semantic' | 'compliance';

/**
 * Multi-Layer Validator
 */
export class MultiLayerValidator {
  private dimensionalEngine: DimensionalEngine;
  private settingsPath: string;

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    this.dimensionalEngine = new DimensionalEngine(settingsPath);
  }

  /**
   * Validiert Node (alle Layer)
   */
  async validateNode(node: SettingsNode): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Layer 1: Schema Validation
    const schemaResult = this.validateSchema(node);
    errors.push(...schemaResult.errors);
    warnings.push(...schemaResult.warnings);

    // Layer 2: Dimensional Validation
    if (node.dimensions) {
      const dimensionalResult = this.validateDimensional(node.dimensions);
      errors.push(...dimensionalResult.errors);
      warnings.push(...dimensionalResult.warnings);
    }

    // Layer 3: Semantic Validation
    const semanticResult = this.validateSemantic(node);
    errors.push(...semanticResult.errors);
    warnings.push(...semanticResult.warnings);

    // Layer 4: Compliance Validation
    const complianceResult = await this.validateCompliance(node);
    errors.push(...complianceResult.errors);
    warnings.push(...complianceResult.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Schema Layer
   */
  private validateSchema(node: SettingsNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Prüfe Required Fields
    if (!node.id) {
      errors.push({
        layer: 'schema',
        message: 'Node ID is required',
        nodeId: node.id
      });
    }

    if (!node.type) {
      errors.push({
        layer: 'schema',
        message: 'Node type is required',
        nodeId: node.id
      });
    }

    if (!node.version) {
      errors.push({
        layer: 'schema',
        message: 'Node version is required',
        nodeId: node.id
      });
    }

    if (!Array.isArray(node.scope) || node.scope.length === 0) {
      errors.push({
        layer: 'schema',
        message: 'Node scope must be a non-empty array',
        nodeId: node.id
      });
    }

    if (!node.meta) {
      errors.push({
        layer: 'schema',
        message: 'Node meta is required',
        nodeId: node.id
      });
    } else {
      if (!node.meta.owner) {
        errors.push({
          layer: 'schema',
          message: 'Node meta.owner is required',
          nodeId: node.id
        });
      }

      if (!node.meta.createdAt) {
        errors.push({
          layer: 'schema',
          message: 'Node meta.createdAt is required',
          nodeId: node.id
        });
      }

      if (!node.meta.checksum) {
        errors.push({
          layer: 'schema',
          message: 'Node meta.checksum is required',
          nodeId: node.id
        });
      }
    }

    // Prüfe ID Format
    if (node.id && !node.id.match(/^settings:\/\/[^/]+\/[^/]+\/.+$/)) {
      errors.push({
        layer: 'schema',
        message: `Invalid node ID format: ${node.id}. Expected: settings://{scope}/{type}/{name}`,
        nodeId: node.id
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Dimensional Layer
   */
  private validateDimensional(dimensions: Dimensions): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validiere Dimensions-Konsistenz
    const validation = this.dimensionalEngine.validateDimensionsConsistency(dimensions);
    
    for (const error of validation.errors) {
      errors.push({
        layer: 'dimensional',
        message: error
      });
    }

    // Prüfe auf gemischte Dimensions (z.B. Time vs. Bytes)
    const values: Array<{ name: string; value: any }> = [];
    if (dimensions.latency) values.push({ name: 'latency', value: dimensions.latency });
    if (dimensions.cost) values.push({ name: 'cost', value: dimensions.cost });
    if (dimensions.energy) values.push({ name: 'energy', value: dimensions.energy });
    if (dimensions.throughput) values.push({ name: 'throughput', value: dimensions.throughput });
    if (dimensions.memory) values.push({ name: 'memory', value: dimensions.memory });
    if (dimensions.storage) values.push({ name: 'storage', value: dimensions.storage });
    if (dimensions.bandwidth) values.push({ name: 'bandwidth', value: dimensions.bandwidth });
    if (dimensions.temperature) values.push({ name: 'temperature', value: dimensions.temperature });

    // Prüfe auf Unit-Konflikte
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const val1 = values[i].value;
        const val2 = values[j].value;

        // Prüfe ob Units kompatibel sind (sollten nicht sein, wenn verschiedene Dimensions)
        try {
          const compatible = this.dimensionalEngine.validateDimensions(val1, val2);
          if (compatible && values[i].name !== values[j].name) {
            warnings.push({
              layer: 'dimensional',
              message: `Potential unit conflict: ${values[i].name} and ${values[j].name} have compatible units`,
              suggestion: 'Verify these should be different dimensions'
            });
          }
        } catch (error) {
          // Expected: different dimensions
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Semantic Layer
   */
  private validateSemantic(node: SettingsNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validiere Semantic Rules
    if (node.semantics) {
      for (const rule of node.semantics) {
        try {
          const valid = this.evaluateSemanticRule(rule.expression, node);
          if (!valid) {
            errors.push({
              layer: 'semantic',
              message: `Semantic rule failed: ${rule.expression}`,
              nodeId: node.id
            });
          }
        } catch (error: any) {
          errors.push({
            layer: 'semantic',
            message: `Error evaluating semantic rule: ${error.message}`,
            nodeId: node.id
          });
        }
      }
    }

    // Validiere Dependencies
    if (node.dependencies) {
      for (const dep of node.dependencies) {
        // Prüfe ob Dependency Constraints erfüllt sind
        if (dep.constraints && node.dimensions) {
          for (const [key, constraint] of Object.entries(dep.constraints)) {
            const nodeValue = (node.dimensions as any)[key];
            if (nodeValue && constraint) {
              const constraintValue = (constraint as any).value;
              if (nodeValue.value < constraintValue) {
                errors.push({
                  layer: 'semantic',
                  message: `Dependency constraint not met: ${key} (${nodeValue.value}) < required (${constraintValue})`,
                  nodeId: node.id,
                  field: key
                });
              }
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Evaluiert Semantic Rule
   */
  private evaluateSemanticRule(expression: string, node: SettingsNode): boolean {
    // Einfache Expression-Evaluation
    // In Produktion: verwende einen sicheren Expression-Parser

    // Beispiel: "latency <= constraints.max"
    if (expression.includes('latency') && expression.includes('constraints.max')) {
      if (node.dimensions?.latency && node.dimensions.latency.constraints?.max) {
        return node.dimensions.latency.value <= node.dimensions.latency.constraints.max;
      }
    }

    // Beispiel: "throughput * latency <= 1e6"
    if (expression.includes('throughput') && expression.includes('latency')) {
      if (node.dimensions?.throughput && node.dimensions?.latency) {
        const product = node.dimensions.throughput.value * node.dimensions.latency.value;
        return product <= 1e6;
      }
    }

    // Default: true (wenn nicht evaluierbar)
    return true;
  }

  /**
   * Compliance Layer
   */
  private async validateCompliance(node: SettingsNode): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Lade Compliance Policies
    const policiesPath = path.join(this.settingsPath, 'policies', 'compliance.json');
    
    if (!fs.existsSync(policiesPath)) {
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    }

    const policies = JSON.parse(fs.readFileSync(policiesPath, 'utf-8'));

    // Prüfe Environment Policies
    if (policies.environment) {
      for (const scope of node.scope) {
        if (scope.startsWith('env:')) {
          const env = scope.replace('env:', '');
          const envPolicy = policies.environment[env];

          if (envPolicy) {
            // Prüfe Data Locality
            if (envPolicy.dataLocality && node.type === 'database') {
              // Prüfe ob Daten in erlaubter Region
              // In Produktion: echte Region-Prüfung
            }

            // Prüfe Encryption Mandates
            if (envPolicy.encryptionRequired) {
              if (node.type === 'encryption.policy') {
                // Prüfe ob Verschlüsselung aktiviert ist
                // In Produktion: echte Encryption-Check
              }
            }
          }
        }
      }
    }

    // Prüfe Enterprise Safety
    if (policies.enterpriseSafety) {
      // Prüfe ob kritische Settings geschützt sind
      if (node.tags?.includes('production-critical')) {
        // Prüfe ob Notary-Verifizierung vorhanden ist
        // In Produktion: echte Notary-Check
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}








