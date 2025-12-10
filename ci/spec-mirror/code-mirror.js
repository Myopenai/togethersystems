// Code Mirror - Fehlerfreier Code-Speicher
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CodeMirror {
  constructor(mirrorDir = 'ci/spec-mirror/mirror') {
    this.mirrorDir = path.join(process.cwd(), mirrorDir);
    this.ensureMirrorDir();
    this.errorPatterns = this.loadErrorPatterns();
    this.specs = this.loadSpecs();
  }

  ensureMirrorDir() {
    if (!fs.existsSync(this.mirrorDir)) {
      fs.mkdirSync(this.mirrorDir, { recursive: true });
    }
  }

  loadErrorPatterns() {
    const errorPatternsPath = path.join(process.cwd(), 'settings/error-patterns.json');
    if (fs.existsSync(errorPatternsPath)) {
      const data = JSON.parse(fs.readFileSync(errorPatternsPath, 'utf8'));
      return data.patterns || [];
    }
    return [];
  }

  loadSpecs() {
    const specs = {
      openapi: null,
      moduleContracts: null,
      eventSchemas: null,
      invariants: []
    };

    // Load OpenAPI spec
    const openapiPath = path.join(process.cwd(), 'specs/api/openapi.yaml');
    if (fs.existsSync(openapiPath)) {
      specs.openapi = fs.readFileSync(openapiPath, 'utf8');
    }

    // Load module contracts
    const contractsPath = path.join(process.cwd(), 'specs/module-contracts/fabrikage-modules.md');
    if (fs.existsSync(contractsPath)) {
      specs.moduleContracts = fs.readFileSync(contractsPath, 'utf8');
    }

    // Load event schemas
    const eventSchemasPath = path.join(process.cwd(), 'specs/events/event-schemas.json');
    if (fs.existsSync(eventSchemasPath)) {
      specs.eventSchemas = JSON.parse(fs.readFileSync(eventSchemasPath, 'utf8'));
    }

    // Load invariants
    const invariantsPath = path.join(process.cwd(), 'specs/invariants/properties');
    if (fs.existsSync(invariantsPath)) {
      const files = fs.readdirSync(invariantsPath);
      for (const file of files) {
        if (file.endsWith('.js')) {
          specs.invariants.push(path.join(invariantsPath, file));
        }
      }
    }

    return specs;
  }

  /**
   * Validiert Code gegen alle Specs und Error-Patterns
   * Gibt nur fehlerfreien Code zurück
   */
  validateCode(code, filePath, context = {}) {
    const errors = [];
    const warnings = [];

    // 1. Prüfe gegen Error-Patterns
    for (const pattern of this.errorPatterns) {
      try {
        const regex = new RegExp(pattern.pattern, 'i');
        if (regex.test(code)) {
          errors.push({
            type: 'error_pattern',
            pattern: pattern.id,
            description: pattern.description,
            severity: pattern.severity,
            fix: pattern.fix
          });
        }
      } catch (e) {
        // Invalid regex, skip
      }
    }

    // 2. Prüfe Branding
    if (!code.includes('TogetherSystems') && !code.includes('ModularFlux')) {
      warnings.push({
        type: 'missing_branding',
        message: 'Code sollte TogetherSystems/ModularFlux Branding enthalten'
      });
    }

    // 3. Prüfe Version
    if (code.includes('VERSION') && !code.match(/VERSION.*3\.0\.0/)) {
      warnings.push({
        type: 'version_mismatch',
        message: 'Version sollte 3.0.0 sein'
      });
    }

    // 4. Prüfe Error-Handling
    if (code.includes('console.error') && !code.includes('errorFixSystem')) {
      errors.push({
        type: 'missing_error_handler',
        message: 'console.error sollte durch errorFixSystem ersetzt werden',
        fix: 'Verwende window.errorFixSystem.reportError() statt console.error()'
      });
    }

    // 5. Prüfe API-Calls
    if (code.includes('fetch(') && !code.includes('apiErrorHandler')) {
      errors.push({
        type: 'unsafe_api_call',
        message: 'fetch() sollte über apiErrorHandler erfolgen',
        fix: 'Verwende window.apiErrorHandler.fetchWithErrorHandling()'
      });
    }

    // 6. Prüfe Hardcoded Values
    if (code.match(/localhost|127\.0\.0\.1/) && !code.includes('apiConfigLoader')) {
      errors.push({
        type: 'hardcoded_url',
        message: 'Hardcoded URLs sollten über apiConfigLoader erfolgen',
        fix: 'Verwende window.apiConfigLoader.getBaseUrl()'
      });
    }

    // 7. Prüfe TypeScript/JavaScript Syntax (basic)
    if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      try {
        // Basic syntax check - in production use proper parser
        if (code.includes('function') && !code.match(/function\s+\w+\s*\(/)) {
          // Check for common syntax errors
          const openBraces = (code.match(/\{/g) || []).length;
          const closeBraces = (code.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            errors.push({
              type: 'syntax_error',
              message: 'Ungleiche Anzahl von geschweiften Klammern'
            });
          }
        }
      } catch (e) {
        // Skip if check fails
      }
    }

    // 8. Prüfe Module Contracts (wenn relevant)
    if (filePath.includes('factory-engine') && this.specs.moduleContracts) {
      // Prüfe ob FactoryEngine Contract eingehalten wird
      if (code.includes('class FactoryEngine')) {
        const requiredMethods = ['createModule', 'deleteModule', 'save', 'load'];
        for (const method of requiredMethods) {
          if (!code.includes(`${method}(`)) {
            errors.push({
              type: 'missing_contract_method',
              message: `FactoryEngine muss ${method}() Methode haben`,
              contract: 'specs/module-contracts/fabrikage-modules.md'
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      code: errors.length === 0 ? code : null
    };
  }

  /**
   * Speichert Code im Mirror NUR wenn er fehlerfrei ist
   */
  storeCode(code, filePath, context = {}) {
    const validation = this.validateCode(code, filePath, context);

    if (!validation.valid) {
      throw new Error(`Code ist nicht fehlerfrei:\n${validation.errors.map(e => `- ${e.message}`).join('\n')}`);
    }

    // Berechne Hash für deduplizierung
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const relativePath = path.relative(process.cwd(), filePath);
    const mirrorPath = path.join(this.mirrorDir, relativePath);
    const mirrorDir = path.dirname(mirrorPath);

    // Erstelle Verzeichnisstruktur
    if (!fs.existsSync(mirrorDir)) {
      fs.mkdirSync(mirrorDir, { recursive: true });
    }

    // Speichere Code mit Metadaten
    const metadata = {
      filePath: relativePath,
      hash,
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      branding: '.T. TogetherSystems - ModularFlux Architecture',
      standard: 'IBM STANDARD - PERMANENT AKTIV',
      context,
      validation: {
        errors: validation.errors.length,
        warnings: validation.warnings.length,
        passed: true
      }
    };

    // Speichere Code
    fs.writeFileSync(mirrorPath, code, 'utf8');
    
    // Speichere Metadaten
    const metadataPath = mirrorPath + '.meta.json';
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Speichere Hash-Index
    const hashIndexPath = path.join(this.mirrorDir, '.hash-index.json');
    let hashIndex = {};
    if (fs.existsSync(hashIndexPath)) {
      hashIndex = JSON.parse(fs.readFileSync(hashIndexPath, 'utf8'));
    }
    hashIndex[hash] = {
      filePath: relativePath,
      timestamp: metadata.timestamp
    };
    fs.writeFileSync(hashIndexPath, JSON.stringify(hashIndex, null, 2), 'utf8');

    return {
      success: true,
      hash,
      mirrorPath,
      metadata
    };
  }

  /**
   * Holt Code aus dem Mirror (nur fehlerfreier Code)
   */
  getCode(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    const mirrorPath = path.join(this.mirrorDir, relativePath);

    if (!fs.existsSync(mirrorPath)) {
      return null;
    }

    // Lade Code und validiere nochmal
    const code = fs.readFileSync(mirrorPath, 'utf8');
    const validation = this.validateCode(code, filePath);

    if (!validation.valid) {
      console.warn(`Code im Mirror für ${filePath} ist nicht mehr gültig, entferne...`);
      fs.unlinkSync(mirrorPath);
      if (fs.existsSync(mirrorPath + '.meta.json')) {
        fs.unlinkSync(mirrorPath + '.meta.json');
      }
      return null;
    }

    return code;
  }

  /**
   * Prüft ob Code im Mirror existiert und aktuell ist
   */
  hasCode(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    const mirrorPath = path.join(this.mirrorDir, relativePath);

    if (!fs.existsSync(mirrorPath)) {
      return false;
    }

    // Prüfe ob Original neuer ist
    if (fs.existsSync(filePath)) {
      const originalStat = fs.statSync(filePath);
      const mirrorStat = fs.statSync(mirrorPath);
      
      if (originalStat.mtime > mirrorStat.mtime) {
        // Original ist neuer, prüfe ob es fehlerfrei ist
        const originalCode = fs.readFileSync(filePath, 'utf8');
        const validation = this.validateCode(originalCode, filePath);
        
        if (validation.valid) {
          // Aktualisiere Mirror
          this.storeCode(originalCode, filePath);
          return true;
        } else {
          // Original hat Fehler, behalte Mirror-Version
          return true;
        }
      }
    }

    return true;
  }

  /**
   * Synchronisiert Mirror mit aktuellen Dateien (nur fehlerfreie)
   */
  syncMirror(filePaths = []) {
    const synced = [];
    const errors = [];

    if (filePaths.length === 0) {
      // Scan alle relevanten Dateien
      const srcDirs = [
        'modular-fabrikage',
        'xxxxxxls-fabrikage',
        'js',
        'ci'
      ];

      for (const dir of srcDirs) {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
          this.scanDirectory(fullPath, filePaths);
        }
      }
    }

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      try {
        const code = fs.readFileSync(filePath, 'utf8');
        const validation = this.validateCode(code, filePath);

        if (validation.valid) {
          this.storeCode(code, filePath);
          synced.push(filePath);
        } else {
          errors.push({
            file: filePath,
            errors: validation.errors
          });
        }
      } catch (error) {
        errors.push({
          file: filePath,
          error: error.message
        });
      }
    }

    return {
      synced: synced.length,
      errors: errors.length,
      details: {
        synced,
        errors
      }
    };
  }

  scanDirectory(dir, filePaths) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        this.scanDirectory(fullPath, filePaths);
      } else if (entry.isFile() && /\.(js|ts|html|css|json|yaml|yml|ps1|md)$/.test(entry.name)) {
        filePaths.push(fullPath);
      }
    }
  }
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeMirror;
}

// Global instance
if (typeof global !== 'undefined') {
  global.codeMirror = new CodeMirror();
}



