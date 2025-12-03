/**
 * Dimensional Engine
 * 
 * Unit Conversion, Validation, Derived Metrics
 */

import type {
  DimensionalValue,
  Dimensions,
  Unit,
  Dimension,
  UnitRule
} from '../schemas/settings.schema';
import fs from 'fs';
import path from 'path';

/**
 * Dimensional Engine
 */
export class DimensionalEngine {
  private unitsRegistry: Map<Unit, UnitRule> = new Map();
  private canonicalUnits: Map<Dimension, Unit> = new Map();

  constructor(settingsPath: string) {
    this.loadUnitsRegistry(settingsPath);
  }

  /**
   * Lädt Units Registry
   */
  private loadUnitsRegistry(settingsPath: string): void {
    const registryPath = path.join(settingsPath, 'schemas', 'units.registry.json');
    
    if (!fs.existsSync(registryPath)) {
      throw new Error('Units registry not found');
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

    // Lade Rules
    for (const rule of registry.rules) {
      this.unitsRegistry.set(rule.unit, rule);
    }

    // Lade Canonical Units
    for (const [dimension, unit] of Object.entries(registry.canonical)) {
      this.canonicalUnits.set(dimension as Dimension, unit as Unit);
    }
  }

  /**
   * Konvertiert Unit zu Canonical
   */
  convertToCanonical(value: DimensionalValue): DimensionalValue {
    const rule = this.unitsRegistry.get(value.unit);
    if (!rule) {
      throw new Error(`Unknown unit: ${value.unit}`);
    }

    const canonicalUnit = this.canonicalUnits.get(rule.dimension);
    if (!canonicalUnit) {
      throw new Error(`No canonical unit for dimension: ${rule.dimension}`);
    }

    // Bereits canonical?
    if (value.unit === canonicalUnit) {
      return value;
    }

    // Konvertiere
    const convertedValue = value.value * (rule.factor || 1);

    return {
      value: convertedValue,
      unit: canonicalUnit,
      constraints: value.constraints
    };
  }

  /**
   * Konvertiert zwischen Units
   */
  convert(value: DimensionalValue, targetUnit: Unit): DimensionalValue {
    const sourceRule = this.unitsRegistry.get(value.unit);
    const targetRule = this.unitsRegistry.get(targetUnit);

    if (!sourceRule || !targetRule) {
      throw new Error(`Unknown unit: ${value.unit} or ${targetUnit}`);
    }

    // Gleiche Dimension?
    if (sourceRule.dimension !== targetRule.dimension) {
      throw new Error(`Cannot convert ${sourceRule.dimension} to ${targetRule.dimension}`);
    }

    // Konvertiere über Canonical
    const canonical = this.convertToCanonical(value);
    const targetFactor = targetRule.factor || 1;
    const sourceFactor = sourceRule.factor || 1;

    const convertedValue = (canonical.value * sourceFactor) / targetFactor;

    return {
      value: convertedValue,
      unit: targetUnit,
      constraints: value.constraints
    };
  }

  /**
   * Validiert Dimensions-Kompatibilität
   */
  validateDimensions(dim1: DimensionalValue, dim2: DimensionalValue): boolean {
    const rule1 = this.unitsRegistry.get(dim1.unit);
    const rule2 = this.unitsRegistry.get(dim2.unit);

    if (!rule1 || !rule2) {
      return false;
    }

    return rule1.dimension === rule2.dimension;
  }

  /**
   * Berechnet abgeleitete Metriken
   */
  calculateDerivedMetrics(dimensions: Dimensions): {
    latencyBudget?: number; // Summe aller Component Latencies
    costPerThroughput?: number; // EUR / (req/s)
    energyEfficiency?: number; // W / (req/s)
  } {
    const metrics: any = {};

    // Latency Budget (wenn mehrere Latency-Werte vorhanden)
    if (dimensions.latency) {
      // In Produktion: Summe aller Component Latencies
      metrics.latencyBudget = dimensions.latency.value;
    }

    // Cost per Throughput
    if (dimensions.cost && dimensions.throughput) {
      const cost = this.convertToCanonical(dimensions.cost);
      const throughput = this.convertToCanonical(dimensions.throughput);
      
      // EUR / (req/s)
      if (cost.value > 0 && throughput.value > 0) {
        metrics.costPerThroughput = cost.value / throughput.value;
      }
    }

    // Energy Efficiency
    if (dimensions.energy && dimensions.throughput) {
      const energy = this.convertToCanonical(dimensions.energy);
      const throughput = this.convertToCanonical(dimensions.throughput);
      
      // W / (req/s)
      if (energy.value > 0 && throughput.value > 0) {
        metrics.energyEfficiency = energy.value / throughput.value;
      }
    }

    return metrics;
  }

  /**
   * Prüft Constraints
   */
  validateConstraints(value: DimensionalValue): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (value.constraints) {
      if (value.constraints.min !== undefined && value.value < value.constraints.min) {
        errors.push(`Value ${value.value} is below minimum ${value.constraints.min}`);
      }

      if (value.constraints.max !== undefined && value.value > value.constraints.max) {
        errors.push(`Value ${value.value} is above maximum ${value.constraints.max}`);
      }

      if (value.constraints.target !== undefined) {
        const tolerance = Math.abs(value.value - value.constraints.target);
        if (tolerance > value.constraints.target * 0.1) {
          errors.push(`Value ${value.value} is far from target ${value.constraints.target}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prüft ob Dimensions konsistent sind
   */
  validateDimensionsConsistency(dimensions: Dimensions): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Prüfe alle Dimensional Values
    const values: DimensionalValue[] = [];
    if (dimensions.latency) values.push(dimensions.latency);
    if (dimensions.cost) values.push(dimensions.cost);
    if (dimensions.energy) values.push(dimensions.energy);
    if (dimensions.throughput) values.push(dimensions.throughput);
    if (dimensions.memory) values.push(dimensions.memory);
    if (dimensions.storage) values.push(dimensions.storage);
    if (dimensions.bandwidth) values.push(dimensions.bandwidth);
    if (dimensions.temperature) values.push(dimensions.temperature);

    for (const value of values) {
      const validation = this.validateConstraints(value);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    // Prüfe semantische Regeln
    // z.B. latency <= constraints.max
    if (dimensions.latency && dimensions.latency.constraints?.max) {
      if (dimensions.latency.value > dimensions.latency.constraints.max) {
        errors.push(`Latency ${dimensions.latency.value} exceeds max ${dimensions.latency.constraints.max}`);
      }
    }

    // throughput * latency <= 1e6 ms/s ceiling
    if (dimensions.throughput && dimensions.latency) {
      const throughput = this.convertToCanonical(dimensions.throughput);
      const latency = this.convertToCanonical(dimensions.latency);
      
      const product = throughput.value * latency.value;
      if (product > 1e6) {
        errors.push(`Throughput * Latency product ${product} exceeds ceiling 1e6`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Normalisiert Dimensions zu Canonical Units
   */
  normalizeDimensions(dimensions: Dimensions): Dimensions {
    const normalized: Dimensions = {};

    if (dimensions.latency) {
      normalized.latency = this.convertToCanonical(dimensions.latency);
    }
    if (dimensions.cost) {
      normalized.cost = this.convertToCanonical(dimensions.cost);
    }
    if (dimensions.energy) {
      normalized.energy = this.convertToCanonical(dimensions.energy);
    }
    if (dimensions.throughput) {
      normalized.throughput = this.convertToCanonical(dimensions.throughput);
    }
    if (dimensions.memory) {
      normalized.memory = this.convertToCanonical(dimensions.memory);
    }
    if (dimensions.storage) {
      normalized.storage = this.convertToCanonical(dimensions.storage);
    }
    if (dimensions.bandwidth) {
      normalized.bandwidth = this.convertToCanonical(dimensions.bandwidth);
    }
    if (dimensions.temperature) {
      normalized.temperature = this.convertToCanonical(dimensions.temperature);
    }

    return normalized;
  }
}

