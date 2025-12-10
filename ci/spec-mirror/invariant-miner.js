// INVARIANT MINER
// Automatically mines likely invariants from code history and runtime traces
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

const fs = require('fs');
const path = require('path');

class InvariantMiner {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.invariants = [];
    this.runtimeTraces = [];
  }

  // Mine invariants from code history
  mineFromCodeHistory(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const invariants = [];

    // Pattern 1: Function preconditions/postconditions
    const prePostMatches = content.matchAll(/\/\*\s*(?:pre|post|invariant):\s*(.+?)\s*\*\//gi);
    for (const match of prePostMatches) {
      invariants.push({
        type: 'precondition',
        source: 'code-comment',
        invariant: match[1].trim(),
        file: filePath
      });
    }

    // Pattern 2: Assert statements
    const assertMatches = content.matchAll(/assert\s*\((.+?)\)/gi);
    for (const match of assertMatches) {
      invariants.push({
        type: 'assertion',
        source: 'code-assert',
        invariant: match[1].trim(),
        file: filePath
      });
    }

    // Pattern 3: Type constraints (TypeScript/JavaScript)
    const typeMatches = content.matchAll(/(?:const|let|var)\s+(\w+)\s*:\s*([^=]+?)\s*=/gi);
    for (const match of typeMatches) {
      invariants.push({
        type: 'type-constraint',
        source: 'type-system',
        variable: match[1],
        type: match[2].trim(),
        file: filePath
      });
    }

    // Pattern 4: Validation patterns
    const validationMatches = content.matchAll(/(?:if|assert|throw)\s*\([^)]*?(?:null|undefined|empty|invalid|error)/gi);
    for (const match of validationMatches) {
      invariants.push({
        type: 'validation',
        source: 'code-pattern',
        pattern: match[0],
        file: filePath
      });
    }

    return invariants;
  }

  // Mine invariants from runtime traces
  mineFromRuntimeTraces(traceData) {
    const invariants = [];

    // Analyze value ranges
    if (traceData.values && traceData.values.length > 0) {
      const numbers = traceData.values.filter(v => typeof v === 'number');
      if (numbers.length > 0) {
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        invariants.push({
          type: 'value-range',
          source: 'runtime-trace',
          variable: traceData.variable,
          min,
          max,
          stable: max - min < 100 // Consider stable if range is small
        });
      }
    }

    // Analyze null/undefined patterns
    if (traceData.nullCount !== undefined) {
      invariants.push({
        type: 'null-safety',
        source: 'runtime-trace',
        variable: traceData.variable,
        nullCount: traceData.nullCount,
        totalCount: traceData.totalCount,
        nullRate: traceData.nullCount / traceData.totalCount
      });
    }

    return invariants;
  }

  // Promote stable invariants to property tests
  promoteToPropertyTests(invariants) {
    const stableInvariants = invariants.filter(inv => 
      inv.stable !== false && 
      (inv.type === 'value-range' || inv.type === 'null-safety' || inv.type === 'type-constraint')
    );

    const propertyTests = stableInvariants.map(inv => {
      if (inv.type === 'value-range') {
        return {
          test: `property('${inv.variable} should be in range [${inv.min}, ${inv.max}]', () => {
  fc.assert(fc.property(fc.integer({ min: ${inv.min}, max: ${inv.max} }), (value) => {
    // Test invariant
    return value >= ${inv.min} && value <= ${inv.max};
  }));
});`,
          invariant: inv
        };
      } else if (inv.type === 'null-safety') {
        return {
          test: `property('${inv.variable} should not be null', () => {
  fc.assert(fc.property(fc.anything(), (value) => {
    return value !== null && value !== undefined;
  }));
});`,
          invariant: inv
        };
      }
      return null;
    }).filter(Boolean);

    return propertyTests;
  }

  // Scan all files and mine invariants
  scanProject() {
    const files = this.getAllCodeFiles(this.rootDir);
    const allInvariants = [];

    for (const file of files) {
      try {
        const invariants = this.mineFromCodeHistory(file);
        allInvariants.push(...invariants);
      } catch (error) {
        console.warn(`Error mining invariants from ${file}:`, error.message);
      }
    }

    this.invariants = allInvariants;
    return allInvariants;
  }

  // Get all code files recursively
  getAllCodeFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'reports') {
          this.getAllCodeFiles(filePath, fileList);
        }
      } else if (/\.(js|ts|jsx|tsx)$/.test(file)) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  // Generate invariant report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalInvariants: this.invariants.length,
      byType: {},
      bySource: {},
      stableInvariants: this.invariants.filter(inv => inv.stable !== false).length,
      propertyTests: this.promoteToPropertyTests(this.invariants).length
    };

    this.invariants.forEach(inv => {
      report.byType[inv.type] = (report.byType[inv.type] || 0) + 1;
      report.bySource[inv.source] = (report.bySource[inv.source] || 0) + 1;
    });

    return report;
  }

  // Save invariants to file
  saveInvariants(outputPath) {
    const data = {
      timestamp: new Date().toISOString(),
      invariants: this.invariants,
      report: this.generateReport()
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Invariants saved to ${outputPath}`);
  }
}

// CLI
if (require.main === module) {
  const rootDir = process.argv[2] || process.cwd();
  const outputPath = process.argv[3] || path.join(rootDir, 'ci', 'spec-mirror', 'invariants.json');

  const miner = new InvariantMiner(rootDir);
  console.log('🔍 Mining invariants...');
  miner.scanProject();
  console.log(`✅ Found ${miner.invariants.length} invariants`);
  miner.saveInvariants(outputPath);
  console.log('📊 Report:', JSON.stringify(miner.generateReport(), null, 2));
}

module.exports = InvariantMiner;



