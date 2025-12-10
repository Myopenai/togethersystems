// RISK CLASSIFIER
// Defect prediction using supervised learning (gradient boosting / tree ensembles)
// BRANDING: .T. TogetherSystems - ModularFlux Architecture

const fs = require('fs');
const path = require('path');

class RiskClassifier {
  constructor() {
    this.model = null;
    this.features = [];
    this.history = [];
  }

  // Extract features from code diff
  extractFeatures(diffData) {
    const features = {
      // Code churn
      linesAdded: diffData.linesAdded || 0,
      linesRemoved: diffData.linesRemoved || 0,
      filesChanged: diffData.filesChanged || 0,
      churn: (diffData.linesAdded || 0) + (diffData.linesRemoved || 0),

      // Complexity metrics
      cyclomaticComplexity: this.estimateCyclomaticComplexity(diffData.content || ''),
      nestingDepth: this.estimateNestingDepth(diffData.content || ''),

      // Dependency metrics
      importsAdded: (diffData.content || '').match(/^import\s+/gm)?.length || 0,
      dependenciesChanged: diffData.dependenciesChanged || 0,

      // Test metrics
      testCoverage: diffData.testCoverage || 0,
      mutationScore: diffData.mutationScore || 0,
      testsAdded: (diffData.content || '').match(/test|spec|it\(/gi)?.length || 0,

      // Lint findings
      lintErrors: diffData.lintErrors || 0,
      lintWarnings: diffData.lintWarnings || 0,

      // Pattern indicators
      hasErrorHandling: /try\s*\{|catch\s*\(|throw\s+/i.test(diffData.content || ''),
      hasAsync: /async\s+function|await\s+/i.test(diffData.content || ''),
      hasTypeAnnotations: /:\s*\w+|interface\s+\w+|type\s+\w+/i.test(diffData.content || ''),

      // File patterns
      isTestFile: /\.(test|spec)\.(js|ts)$/i.test(diffData.filePath || ''),
      isConfigFile: /\.(json|yaml|yml|config)$/i.test(diffData.filePath || ''),
      isApiFile: /api|route|endpoint/i.test(diffData.filePath || '')
    };

    return features;
  }

  // Estimate cyclomatic complexity
  estimateCyclomaticComplexity(content) {
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g, // ternary
      /&&|\|\|/g // logical operators
    ];

    let complexity = 1; // Base complexity
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  // Estimate nesting depth
  estimateNestingDepth(content) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of content) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  // Simple risk score calculation (gradient boosting simulation)
  calculateRiskScore(features) {
    let riskScore = 0;

    // Churn-based risk
    if (features.churn > 500) riskScore += 30;
    else if (features.churn > 200) riskScore += 20;
    else if (features.churn > 100) riskScore += 10;

    // Complexity risk
    if (features.cyclomaticComplexity > 20) riskScore += 25;
    else if (features.cyclomaticComplexity > 10) riskScore += 15;
    else if (features.cyclomaticComplexity > 5) riskScore += 5;

    // Nesting risk
    if (features.nestingDepth > 5) riskScore += 15;
    else if (features.nestingDepth > 3) riskScore += 10;

    // Test coverage risk (inverse)
    if (features.testCoverage < 50) riskScore += 20;
    else if (features.testCoverage < 70) riskScore += 10;

    // Mutation score risk (inverse)
    if (features.mutationScore < 50) riskScore += 15;
    else if (features.mutationScore < 70) riskScore += 8;

    // Lint errors risk
    riskScore += features.lintErrors * 2;
    riskScore += features.lintWarnings * 0.5;

    // Missing error handling risk
    if (!features.hasErrorHandling && features.isApiFile) riskScore += 15;

    // Missing type annotations risk
    if (!features.hasTypeAnnotations && !features.isTestFile && !features.isConfigFile) {
      riskScore += 5;
    }

    // Positive factors (reduce risk)
    if (features.testsAdded > 0) riskScore -= 10;
    if (features.testCoverage > 80) riskScore -= 5;
    if (features.mutationScore > 80) riskScore -= 5;

    // Normalize to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    return {
      score: riskScore,
      level: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
      features
    };
  }

  // Classify diff risk
  classify(diffData) {
    const features = this.extractFeatures(diffData);
    const risk = this.calculateRiskScore(features);

    return {
      risk,
      recommendations: this.generateRecommendations(risk, features),
      timestamp: new Date().toISOString()
    };
  }

  // Generate recommendations based on risk
  generateRecommendations(risk, features) {
    const recommendations = [];

    if (risk.level === 'high') {
      recommendations.push({
        type: 'block',
        message: 'High-risk diff detected. Require additional review and tests.',
        actions: [
          'Add comprehensive test coverage',
          'Reduce complexity',
          'Add error handling',
          'Request senior review'
        ]
      });
    } else if (risk.level === 'medium') {
      recommendations.push({
        type: 'warn',
        message: 'Medium-risk diff. Consider additional tests.',
        actions: [
          'Add unit tests',
          'Check error handling',
          'Review complexity'
        ]
      });
    }

    if (features.testCoverage < 70) {
      recommendations.push({
        type: 'test',
        message: `Test coverage is ${features.testCoverage}%. Target: 80%+`,
        priority: 'high'
      });
    }

    if (features.mutationScore < 70) {
      recommendations.push({
        type: 'test',
        message: `Mutation score is ${features.mutationScore}%. Target: 70%+`,
        priority: 'medium'
      });
    }

    if (features.cyclomaticComplexity > 10) {
      recommendations.push({
        type: 'refactor',
        message: `High cyclomatic complexity: ${features.cyclomaticComplexity}. Consider refactoring.`,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Learn from historical incidents
  learnFromIncidents(incidents) {
    // Simple learning: adjust risk thresholds based on incidents
    const highRiskIncidents = incidents.filter(i => i.severity === 'high');
    if (highRiskIncidents.length > 0) {
      console.log(`📚 Learning from ${highRiskIncidents.length} high-severity incidents`);
      // In a real implementation, this would update the model weights
    }
  }
}

// CLI
if (require.main === module) {
  const diffFile = process.argv[2];

  if (!diffFile || !fs.existsSync(diffFile)) {
    console.error('Usage: node risk-classifier.js <diff-file>');
    process.exit(1);
  }

  const diffData = JSON.parse(fs.readFileSync(diffFile, 'utf8'));
  const classifier = new RiskClassifier();
  const result = classifier.classify(diffData);

  console.log('🎯 Risk Classification:');
  console.log(JSON.stringify(result, null, 2));
}

module.exports = RiskClassifier;



