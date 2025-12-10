// SEMANTIC DIFF
// AST-based diffing to detect meaningful changes (API signatures, public contracts, exception handling)
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

const fs = require('fs');
const path = require('path');

class SemanticDiff {
  constructor() {
    this.changes = [];
  }

  // Extract API signatures from code
  extractAPISignatures(content, filePath) {
    const signatures = [];

    // Function exports
    const exportMatches = content.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g);
    for (const match of exportMatches) {
      signatures.push({
        type: 'function',
        name: match[1],
        params: match[2].split(',').map(p => p.trim()).filter(Boolean),
        file: filePath
      });
    }

    // Class methods
    const methodMatches = content.matchAll(/(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g);
    for (const match of methodMatches) {
      signatures.push({
        type: 'method',
        name: match[1],
        params: match[2].split(',').map(p => p.trim()).filter(Boolean),
        file: filePath
      });
    }

    // API routes (Express, etc.)
    const routeMatches = content.matchAll(/(?:app|router)\.(get|post|put|delete|patch)\s*\(['"]([^'"]+)['"]/g);
    for (const match of routeMatches) {
      signatures.push({
        type: 'api-route',
        method: match[1].toUpperCase(),
        path: match[2],
        file: filePath
      });
    }

    return signatures;
  }

  // Extract exception handling patterns
  extractExceptionHandling(content, filePath) {
    const patterns = [];

    // Try-catch blocks
    const tryCatchMatches = content.matchAll(/try\s*\{[\s\S]*?\}\s*catch\s*\([^)]+\)\s*\{[\s\S]*?\}/g);
    for (const match of tryCatchMatches) {
      patterns.push({
        type: 'try-catch',
        file: filePath,
        hasFinally: match[0].includes('finally')
      });
    }

    // Throw statements
    const throwMatches = content.matchAll(/throw\s+(?:new\s+)?(\w+Error|Error|Exception)/g);
    for (const match of throwMatches) {
      patterns.push({
        type: 'throw',
        errorType: match[1],
        file: filePath
      });
    }

    return patterns;
  }

  // Compare two file versions
  compareFiles(oldContent, newContent, filePath) {
    const changes = {
      file: filePath,
      apiChanges: [],
      exceptionChanges: [],
      breakingChanges: []
    };

    const oldSignatures = this.extractAPISignatures(oldContent, filePath);
    const newSignatures = this.extractAPISignatures(newContent, filePath);

    // Find removed signatures (breaking changes)
    oldSignatures.forEach(oldSig => {
      const exists = newSignatures.some(newSig => 
        newSig.name === oldSig.name && 
        newSig.type === oldSig.type &&
        JSON.stringify(newSig.params) === JSON.stringify(oldSig.params)
      );
      if (!exists) {
        changes.breakingChanges.push({
          type: 'removed',
          signature: oldSig
        });
      }
    });

    // Find added signatures
    newSignatures.forEach(newSig => {
      const exists = oldSignatures.some(oldSig => 
        oldSig.name === newSig.name && 
        oldSig.type === newSig.type &&
        JSON.stringify(oldSig.params) === JSON.stringify(newSig.params)
      );
      if (!exists) {
        changes.apiChanges.push({
          type: 'added',
          signature: newSig
        });
      }
    });

    // Find modified signatures (parameter changes)
    newSignatures.forEach(newSig => {
      const oldSig = oldSignatures.find(s => s.name === newSig.name && s.type === newSig.type);
      if (oldSig && JSON.stringify(oldSig.params) !== JSON.stringify(newSig.params)) {
        changes.breakingChanges.push({
          type: 'modified',
          oldSignature: oldSig,
          newSignature: newSig
        });
      }
    });

    // Exception handling changes
    const oldExceptions = this.extractExceptionHandling(oldContent, filePath);
    const newExceptions = this.extractExceptionHandling(newContent, filePath);

    if (oldExceptions.length !== newExceptions.length) {
      changes.exceptionChanges.push({
        type: 'count-change',
        oldCount: oldExceptions.length,
        newCount: newExceptions.length
      });
    }

    return changes;
  }

  // Analyze git diff semantically
  analyzeGitDiff(diffContent) {
    const changes = {
      files: [],
      breakingChanges: [],
      apiChanges: [],
      totalChanges: 0
    };

    // Parse diff to extract file changes
    const fileMatches = diffContent.matchAll(/diff --git a\/(.+?) b\/(.+?)\n([\s\S]*?)(?=diff --git|$)/g);
    for (const match of fileMatches) {
      const filePath = match[2];
      const diffBody = match[3];

      // Extract added/removed lines
      const addedLines = (diffBody.match(/^\+[^+].*$/gm) || []).join('\n');
      const removedLines = (diffBody.match(/^-[^-].*$/gm) || []).join('\n');

      if (addedLines || removedLines) {
        const fileChanges = this.compareFiles(removedLines, addedLines, filePath);
        changes.files.push(fileChanges);
        changes.breakingChanges.push(...fileChanges.breakingChanges);
        changes.apiChanges.push(...fileChanges.apiChanges);
        changes.totalChanges++;
      }
    }

    return changes;
  }

  // Generate targeted test recommendations
  generateTestRecommendations(changes) {
    const recommendations = [];

    changes.breakingChanges.forEach(change => {
      if (change.type === 'removed') {
        recommendations.push({
          type: 'regression-test',
          message: `API removed: ${change.signature.name} - Add regression test`,
          file: change.signature.file,
          priority: 'high'
        });
      } else if (change.type === 'modified') {
        recommendations.push({
          type: 'compatibility-test',
          message: `API signature changed: ${change.oldSignature.name} - Add compatibility test`,
          file: change.oldSignature.file,
          priority: 'high'
        });
      }
    });

    changes.apiChanges.forEach(change => {
      if (change.type === 'added') {
        recommendations.push({
          type: 'unit-test',
          message: `New API added: ${change.signature.name} - Add unit test`,
          file: change.signature.file,
          priority: 'medium'
        });
      }
    });

    return recommendations;
  }
}

// CLI
if (require.main === module) {
  const oldFile = process.argv[2];
  const newFile = process.argv[3];

  if (!oldFile || !newFile) {
    console.error('Usage: node semantic-diff.js <old-file> <new-file>');
    process.exit(1);
  }

  const oldContent = fs.readFileSync(oldFile, 'utf8');
  const newContent = fs.readFileSync(newFile, 'utf8');

  const diff = new SemanticDiff();
  const changes = diff.compareFiles(oldContent, newContent, newFile);
  const recommendations = diff.generateTestRecommendations({ breakingChanges: changes.breakingChanges, apiChanges: changes.apiChanges });

  console.log('📊 Semantic Diff Analysis:');
  console.log(JSON.stringify(changes, null, 2));
  console.log('\n🎯 Test Recommendations:');
  console.log(JSON.stringify(recommendations, null, 2));
}

module.exports = SemanticDiff;



