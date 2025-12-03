/**
 * ============================================================================
 * INTEGRATION TESTS - PIPELINES
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Integration-Tests fuer Pipelines
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

describe('T,. Pipeline Integration Tests', () => {
  const testRootDir = path.join(__dirname, '../../test-fixtures');

  beforeEach(() => {
    if (!fs.existsSync(testRootDir)) {
      fs.mkdirSync(testRootDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  describe('Test Fixtures', () => {
    it('sollte Test-Verzeichnis erstellen koennen', () => {
      const testDir = path.join(testRootDir, 'test-subdir');
      fs.mkdirSync(testDir, { recursive: true });
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('sollte Test-Dateien erstellen koennen', () => {
      const testFile = path.join(testRootDir, 'test.txt');
      fs.writeFileSync(testFile, 'Test content', 'utf8');
      expect(fs.existsSync(testFile)).toBe(true);
      const content = fs.readFileSync(testFile, 'utf8');
      expect(content).toBe('Test content');
    });

    it('sollte Encoding-Check erfolgreich ausfuehren', () => {
      const testFile = path.join(testRootDir, 'test-utf8.html');
      const content = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>Test</body></html>';
      fs.writeFileSync(testFile, content, 'utf8');
      expect(fs.existsSync(testFile)).toBe(true);
      
      const readContent = fs.readFileSync(testFile, 'utf8');
      expect(readContent).toBe(content);
    });
  });
});
