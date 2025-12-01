/**
 * Settings API Tests
 * 
 * Unit Tests für Settings-OS
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { SettingsAPI } from '../api/settings-api';
import { SettingsGraphLoader } from '../core/graph-loader';
import { DimensionalEngine } from '../core/dimensional-engine';
import { MultiLayerValidator } from '../core/multi-layer-validator';

describe('Settings-OS Tests', () => {
  const settingsPath = './Settings';

  describe('Settings Graph Loader', () => {
    it('should load graph successfully', async () => {
      const loader = new SettingsGraphLoader(settingsPath);
      const graph = await loader.loadGraph();
      
      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Map);
      expect(graph.edges).toBeInstanceOf(Map);
      expect(graph.manifest).toBeDefined();
    });

    it('should filter by scope', async () => {
      const loader = new SettingsGraphLoader(settingsPath);
      const graph = await loader.loadGraph('ai-lab', 'prod');
      
      expect(graph).toBeDefined();
    });
  });

  describe('Dimensional Engine', () => {
    it('should convert units correctly', () => {
      const engine = new DimensionalEngine(settingsPath);
      
      const value = { value: 1000, unit: 'ms' };
      const converted = engine.convertToCanonical(value);
      
      expect(converted.value).toBe(1);
      expect(converted.unit).toBe('s');
    });

    it('should validate dimensions', () => {
      const engine = new DimensionalEngine(settingsPath);
      
      const dim1 = { value: 100, unit: 'ms' };
      const dim2 = { value: 0.1, unit: 's' };
      
      const valid = engine.validateDimensions(dim1, dim2);
      expect(valid).toBe(true);
    });
  });

  describe('Multi-Layer Validator', () => {
    it('should validate node schema', async () => {
      const validator = new MultiLayerValidator(settingsPath);
      
      const node = {
        id: 'settings://test/runtime/test',
        type: 'runtime.profile',
        version: '1.0.0',
        scope: ['global'],
        meta: {
          owner: 'test',
          createdAt: new Date().toISOString(),
          checksum: 'sha256:test'
        },
        data: {
          profile: 'ai-lab'
        }
      };

      const result = await validator.validateNode(node);
      expect(result.valid).toBe(true);
    });
  });

  describe('Settings API', () => {
    it('should query settings', async () => {
      const api = new SettingsAPI(settingsPath);
      const result = await api.querySettings({ type: 'runtime.profile' });
      
      expect(result).toBeDefined();
      expect(result.nodes).toBeInstanceOf(Array);
    });

    it('should simulate change', async () => {
      const api = new SettingsAPI(settingsPath);
      
      // Lade erst Node
      const queryResult = await api.querySettings({ type: 'runtime.profile', limit: 1 });
      if (queryResult.nodes.length > 0) {
        const nodeId = queryResult.nodes[0].id;
        
        const result = await api.simulateChange({
          nodeId,
          changes: { version: '1.0.1' }
        });
        
        expect(result).toBeDefined();
        expect(result.valid).toBeDefined();
      }
    });
  });
});








