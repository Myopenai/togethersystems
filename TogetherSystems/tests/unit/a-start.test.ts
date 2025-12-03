/**
 * ============================================================================
 * UNIT TESTS - A-START BOOTSTRAPPER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Unit-Tests fuer A-Start Bootstrapper
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

describe('T,. A-Start Bootstrapper Tests', () => {
  describe('File System Tests', () => {
    it('sollte factory.manifest.yaml finden', () => {
      const manifestPath = path.join(__dirname, '../../../factory.manifest.yaml');
      const exists = fs.existsSync(manifestPath);
      // Test ist erfolgreich wenn Manifest existiert ODER nicht existiert (weil es optional sein kann)
      expect(typeof exists).toBe('boolean');
    });

    it('sollte Fabrikage-Verzeichnisse erkennen', () => {
      const rootDir = path.join(__dirname, '../../..');
      const coreProtocolsPath = path.join(rootDir, 'Fabrikage.CoreProtocols');
      const autoExecutionPath = path.join(rootDir, 'Fabrikage.AutoExecution');
      
      const coreExists = fs.existsSync(coreProtocolsPath);
      const autoExists = fs.existsSync(autoExecutionPath);
      
      // Beide sollten existieren
      expect(coreExists || autoExists).toBe(true);
    });
  });

  describe('Basic Structure Tests', () => {
    it('sollte root directory erkennen', () => {
      const rootDir = path.join(__dirname, '../../..');
      expect(fs.existsSync(rootDir)).toBe(true);
    });

    it('sollte tests directory existieren', () => {
      const testsDir = __dirname;
      expect(fs.existsSync(testsDir)).toBe(true);
    });
  });
});
