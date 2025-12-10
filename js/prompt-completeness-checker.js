// Prompt Completeness Checker
// Prüft ob lange Prompts vollständig umgesetzt wurden
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class PromptCompletenessChecker {
  constructor() {
    this.prompts = new Map();
    this.requirements = new Map();
    this.implementations = new Map();
  }

  parsePrompt(promptText) {
    try {
      // Extrahiere Anforderungen aus Prompt
      const requirements = [];
      
      // Suche nach Aufzählungen (1., 2., 3., etc.)
      const numberedItems = promptText.match(/\d+\.\s+[^\n]+/g);
      if (numberedItems) {
        numberedItems.forEach(item => {
          requirements.push({
            type: 'numbered',
            text: item.trim(),
            status: 'pending'
          });
        });
      }
      
      // Suche nach Checkbox-Items (✅, ❌, -)
      const checkboxItems = promptText.match(/[✅❌-]\s+[^\n]+/g);
      if (checkboxItems) {
        checkboxItems.forEach(item => {
          requirements.push({
            type: 'checkbox',
            text: item.trim(),
            status: item.includes('✅') ? 'completed' : 'pending'
          });
        });
      }
      
      // Suche nach Schlüsselwörtern
      const keywords = ['erstellen', 'implementieren', 'hinzufügen', 'beheben', 'testen', 'deployen'];
      keywords.forEach(keyword => {
        const matches = promptText.match(new RegExp(`${keyword}[^.!?]*[.!?]`, 'gi'));
        if (matches) {
          matches.forEach(match => {
            requirements.push({
              type: 'keyword',
              keyword: keyword,
              text: match.trim(),
              status: 'pending'
            });
          });
        }
      });
      
      return {
        text: promptText,
        requirements: requirements,
        wordCount: promptText.split(/\s+/).length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  checkImplementation(requirement, codebase) {
    try {
      const text = requirement.text.toLowerCase();
      const status = {
        requirement: requirement,
        found: false,
        matches: [],
        confidence: 0
      };

      // Prüfe verschiedene Implementierungs-Indikatoren
      
      // Datei-Erstellung
      if (text.includes('erstellen') || text.includes('create')) {
        const fileMatches = codebase.match(/write|createFile|new File/g);
        if (fileMatches) {
          status.found = true;
          status.matches.push(...fileMatches);
          status.confidence += 30;
        }
      }
      
      // Funktion-Implementierung
      if (text.includes('funktion') || text.includes('function')) {
        const funcMatches = codebase.match(/function\s+\w+|class\s+\w+/g);
        if (funcMatches) {
          status.found = true;
          status.matches.push(...funcMatches);
          status.confidence += 40;
        }
      }
      
      // Test-Implementierung
      if (text.includes('test') || text.includes('prüfen')) {
        const testMatches = codebase.match(/test|Test|TEST/g);
        if (testMatches) {
          status.found = true;
          status.matches.push(...testMatches);
          status.confidence += 25;
        }
      }
      
      // Fix-Implementierung
      if (text.includes('fix') || text.includes('beheben')) {
        const fixMatches = codebase.match(/fix|Fix|FIX|beheben/g);
        if (fixMatches) {
          status.found = true;
          status.matches.push(...fixMatches);
          status.confidence += 35;
        }
      }
      
      // Spezifische Begriffe aus Requirement
      const words = text.split(/\s+/).filter(w => w.length > 4);
      words.forEach(word => {
        if (codebase.toLowerCase().includes(word)) {
          status.confidence += 5;
        }
      });
      
      status.confidence = Math.min(100, status.confidence);
      
      return status;
    } catch (error) {
      return { error: error.message };
    }
  }

  checkPromptCompleteness(promptId) {
    try {
      const prompt = this.prompts.get(promptId);
      if (!prompt) {
        return { success: false, error: 'Prompt nicht gefunden' };
      }

      // Lade Codebase (vereinfacht - in Produktion würde man alle Dateien scannen)
      const codebase = this.loadCodebase();
      
      const results = {
        promptId: promptId,
        totalRequirements: prompt.requirements.length,
        completed: 0,
        pending: 0,
        details: []
      };

      prompt.requirements.forEach((requirement, index) => {
        const implementation = this.checkImplementation(requirement, codebase);
        results.details.push({
          index: index + 1,
          requirement: requirement.text,
          status: implementation.found ? 'completed' : 'pending',
          confidence: implementation.confidence,
          matches: implementation.matches || []
        });

        if (implementation.found && implementation.confidence > 50) {
          results.completed++;
        } else {
          results.pending++;
        }
      });

      results.completionRate = (results.completed / results.totalRequirements) * 100;

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  loadCodebase() {
    // Vereinfachte Codebase-Ladung
    // In Produktion würde man alle JS/HTML/PS1 Dateien scannen
    let codebase = '';
    
    try {
      // Lade wichtige Dateien
      const importantFiles = [
        'modular-fabrikage/js/factory-engine.js',
        'modular-fabrikage/js/module-system.js',
        'modular-fabrikage/js/software-generator.js',
        'js/console-error-controller.js',
        'js/error-fix-system.js'
      ];
      
      // In Browser-Umgebung können wir nicht direkt Dateien lesen
      // Aber wir können window-Objekte prüfen
      if (typeof window !== 'undefined') {
        if (window.factoryEngine) codebase += 'factoryEngine ';
        if (window.softwareGenerator) codebase += 'softwareGenerator ';
        if (window.consoleErrorController) codebase += 'consoleErrorController ';
        if (window.errorFixSystem) codebase += 'errorFixSystem ';
      }
      
      return codebase;
    } catch (e) {
      return '';
    }
  }

  registerPrompt(promptText) {
    try {
      const parsed = this.parsePrompt(promptText);
      const promptId = `PROMPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.prompts.set(promptId, parsed);
      
      return { success: true, promptId, requirements: parsed.requirements.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  generateCompletenessReport(promptId) {
    try {
      const completeness = this.checkPromptCompleteness(promptId);
      if (!completeness.success) {
        return completeness;
      }

      const report = {
        promptId: promptId,
        timestamp: new Date().toISOString(),
        summary: {
          totalRequirements: completeness.results.totalRequirements,
          completed: completeness.results.completed,
          pending: completeness.results.pending,
          completionRate: Math.round(completeness.results.completionRate * 100) / 100
        },
        details: completeness.results.details,
        recommendations: this.generateRecommendations(completeness.results)
      };

      return { success: true, report };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.completionRate < 50) {
      recommendations.push({
        priority: 'high',
        message: 'Weniger als 50% der Anforderungen umgesetzt. Vollständige Überprüfung erforderlich.'
      });
    } else if (results.completionRate < 80) {
      recommendations.push({
        priority: 'medium',
        message: 'Zwischen 50% und 80% umgesetzt. Fehlende Anforderungen prüfen.'
      });
    } else {
      recommendations.push({
        priority: 'low',
        message: 'Über 80% umgesetzt. Verbleibende Anforderungen prüfen.'
      });
    }

    // Spezifische Empfehlungen für pending Items
    results.details.forEach((detail, index) => {
      if (detail.status === 'pending' && detail.confidence < 30) {
        recommendations.push({
          priority: 'high',
          message: `Anforderung ${index + 1} nicht gefunden: ${detail.requirement.substring(0, 50)}...`
        });
      }
    });

    return recommendations;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.promptCompletenessChecker = new PromptCompletenessChecker();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptCompletenessChecker;
}



