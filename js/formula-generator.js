// Formula Generator - Altwissenschaftliche Formelzeichnung
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class FormulaGenerator {
  constructor() {
    this.formulas = new Map();
    this.functionRegistry = new Map();
    this.loadExistingFormulas();
  }

  loadExistingFormulas() {
    // Lade vorhandene Formeln aus localStorage oder Datei
    try {
      const saved = localStorage.getItem('fabrikage-formulas');
      if (saved) {
        const data = JSON.parse(saved);
        data.forEach(formula => {
          this.formulas.set(formula.id, formula);
        });
      }
    } catch (e) {
      console.warn('Keine vorhandenen Formeln geladen:', e);
    }
  }

  analyzeFunction(func, context = {}) {
    try {
      const funcString = func.toString();
      const funcName = func.name || 'anonymous';
      
      // Analysiere Funktion
      const analysis = {
        name: funcName,
        parameters: this.extractParameters(funcString),
        returnType: this.inferReturnType(funcString),
        complexity: this.calculateComplexity(funcString),
        dependencies: this.extractDependencies(funcString),
        operations: this.extractOperations(funcString),
        context: context
      };

      // Generiere Formel
      const formula = this.generateFormula(analysis);
      
      // Speichere Formel
      const formulaId = `FORMULA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.formulas.set(formulaId, {
        id: formulaId,
        function: funcName,
        analysis: analysis,
        formula: formula,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      });

      return { success: true, formulaId, formula, analysis };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  extractParameters(funcString) {
    const match = funcString.match(/\(([^)]*)\)/);
    if (match) {
      return match[1].split(',').map(p => p.trim()).filter(p => p);
    }
    return [];
  }

  inferReturnType(funcString) {
    if (funcString.includes('return true') || funcString.includes('return false')) {
      return 'boolean';
    }
    if (funcString.includes('return {}') || funcString.includes('return []')) {
      return 'object';
    }
    if (funcString.match(/return \d+/)) {
      return 'number';
    }
    if (funcString.match(/return ['"]/)) {
      return 'string';
    }
    return 'unknown';
  }

  calculateComplexity(funcString) {
    let complexity = 1;
    
    // Zähle Kontrollstrukturen
    complexity += (funcString.match(/if\s*\(/g) || []).length;
    complexity += (funcString.match(/for\s*\(/g) || []).length;
    complexity += (funcString.match(/while\s*\(/g) || []).length;
    complexity += (funcString.match(/switch\s*\(/g) || []).length;
    complexity += (funcString.match(/catch\s*\(/g) || []).length;
    
    // Zähle Operationen
    complexity += (funcString.match(/\+|\-|\*|\//g) || []).length * 0.5;
    complexity += (funcString.match(/&&|\|\|/g) || []).length * 0.5;
    
    return Math.round(complexity * 10) / 10;
  }

  extractDependencies(funcString) {
    const dependencies = [];
    
    // Window-Objekte
    const windowMatches = funcString.match(/window\.(\w+)/g);
    if (windowMatches) {
      windowMatches.forEach(m => {
        const name = m.replace('window.', '');
        if (!dependencies.includes(name)) {
          dependencies.push(name);
        }
      });
    }
    
    // DOM-Operationen
    if (funcString.includes('document.')) {
      dependencies.push('DOM');
    }
    
    // API-Calls
    if (funcString.includes('fetch(')) {
      dependencies.push('API');
    }
    
    // LocalStorage
    if (funcString.includes('localStorage')) {
      dependencies.push('Storage');
    }
    
    return dependencies;
  }

  extractOperations(funcString) {
    const operations = [];
    
    if (funcString.includes('createModule')) operations.push('CREATE_MODULE');
    if (funcString.includes('deleteModule')) operations.push('DELETE_MODULE');
    if (funcString.includes('createLink')) operations.push('CREATE_LINK');
    if (funcString.includes('deleteLink')) operations.push('DELETE_LINK');
    if (funcString.includes('save')) operations.push('SAVE');
    if (funcString.includes('load')) operations.push('LOAD');
    if (funcString.includes('render')) operations.push('RENDER');
    if (funcString.includes('generateCode')) operations.push('GENERATE_CODE');
    if (funcString.includes('connectAPI')) operations.push('CONNECT_API');
    
    return operations;
  }

  generateFormula(analysis) {
    // Altwissenschaftliche Formelzeichnung
    const formula = {
      notation: 'altwissenschaftlich',
      symbols: {},
      equation: '',
      description: ''
    };

    // Generiere Symbole
    analysis.parameters.forEach((param, index) => {
      formula.symbols[`α${index + 1}`] = {
        name: param,
        type: 'input',
        description: `Eingabeparameter: ${param}`
      };
    });

    // Generiere Formelgleichung
    const funcSymbol = `F_${analysis.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    const inputSymbols = Object.keys(formula.symbols).join(', ');
    
    // Basis-Formel
    formula.equation = `${funcSymbol}(${inputSymbols}) = `;
    
    // Abhängig von Komplexität und Operationen
    if (analysis.operations.includes('CREATE_MODULE')) {
      formula.equation += `CREATE(α₁, α₂) → MODULE_ID`;
      formula.description = `Erstellt ein Modul mit Position (α₁, α₂) und gibt MODULE_ID zurück`;
    } else if (analysis.operations.includes('CREATE_LINK')) {
      formula.equation += `CONNECT(α₁, α₂, α₃, α₄) → LINK_ID`;
      formula.description = `Verbindet Modul α₁ mit Modul α₂ über Ports α₃ und α₄`;
    } else if (analysis.operations.includes('GENERATE_CODE')) {
      formula.equation += `GENERATE(α₁, α₂) → CODE_STRING`;
      formula.description = `Generiert Code vom Typ α₁ mit Konfiguration α₂`;
    } else if (analysis.operations.includes('RENDER')) {
      formula.equation += `RENDER(α₁) → VISUAL_OUTPUT`;
      formula.description = `Rendert α₁ als visuelle Ausgabe`;
    } else {
      // Generische Formel
      formula.equation += `PROCESS(${inputSymbols}) → ${analysis.returnType.toUpperCase()}`;
      formula.description = `Verarbeitet Eingaben und gibt ${analysis.returnType} zurück`;
    }

    // Komplexitäts-Indikator
    formula.complexity = analysis.complexity;
    formula.complexitySymbol = analysis.complexity > 10 ? 'Ω' : analysis.complexity > 5 ? 'Θ' : 'Ο';

    // Abhängigkeiten
    formula.dependencies = analysis.dependencies.map(dep => {
      return {
        symbol: `D_${dep.toUpperCase()}`,
        name: dep,
        description: `Abhängigkeit von ${dep}`
      };
    });

    return formula;
  }

  analyzeAllFunctions() {
    const results = [];
    
    // Auto-Update: Erstelle Formel für jede neue Funktion
    this.setupAutoUpdate();
    
    // Analysiere FactoryEngine
    if (window.factoryEngine) {
      const methods = [
        'createModule',
        'deleteModule',
        'createLink',
        'deleteLink',
        'updateModulePosition',
        'selectModule',
        'save',
        'load',
        'updateCounts',
        'render'
      ];
      
      methods.forEach(methodName => {
        if (typeof window.factoryEngine[methodName] === 'function') {
          const result = this.analyzeFunction(
            window.factoryEngine[methodName],
            { class: 'FactoryEngine', method: methodName }
          );
          if (result.success) {
            results.push(result);
          }
        }
      });
    }

    // Analysiere SoftwareGenerator
    if (window.softwareGenerator) {
      const methods = [
        'generateCode',
        'connectAPI',
        'callAPI',
        'combineModules',
        'exportCode'
      ];
      
      methods.forEach(methodName => {
        if (typeof window.softwareGenerator[methodName] === 'function') {
          const result = this.analyzeFunction(
            window.softwareGenerator[methodName],
            { class: 'SoftwareGenerator', method: methodName }
          );
          if (result.success) {
            results.push(result);
          }
        }
      });
    }

    // Analysiere globale Funktionen
    const globalFunctions = [
      'handleDragStart',
      'handleDragOver',
      'handleDrop',
      'renderModules',
      'renderLinks',
      'saveConfiguration',
      'loadConfiguration',
      'resetFactory'
    ];

    globalFunctions.forEach(funcName => {
      if (typeof window[funcName] === 'function') {
        const result = this.analyzeFunction(
          window[funcName],
          { scope: 'global', function: funcName }
        );
        if (result.success) {
          results.push(result);
        }
      }
    });

    return results;
  }

  exportFormulas(format = 'json') {
    const formulasArray = Array.from(this.formulas.values());
    
    if (format === 'json') {
      return JSON.stringify(formulasArray, null, 2);
    } else if (format === 'latex') {
      return this.exportToLaTeX(formulasArray);
    } else if (format === 'mathml') {
      return this.exportToMathML(formulasArray);
    }
    
    return formulasArray;
  }

  exportToLaTeX(formulas) {
    let latex = '\\documentclass{article}\n\\usepackage{amsmath}\n\\begin{document}\n\n';
    
    formulas.forEach(formula => {
      latex += `\\section{${formula.function}}\n\n`;
      latex += `\\begin{equation}\n${formula.formula.equation}\n\\end{equation}\n\n`;
      latex += `${formula.formula.description}\n\n`;
      latex += `\\textbf{Komplexität:} ${formula.formula.complexitySymbol}(${formula.formula.complexity})\n\n`;
    });
    
    latex += '\\end{document}';
    return latex;
  }

  exportToMathML(formulas) {
    let mathml = '<mathml>\n';
    
    formulas.forEach(formula => {
      mathml += `  <formula id="${formula.id}">\n`;
      mathml += `    <function>${formula.function}</function>\n`;
      mathml += `    <equation>${formula.formula.equation}</equation>\n`;
      mathml += `    <description>${formula.formula.description}</description>\n`;
      mathml += `  </formula>\n`;
    });
    
    mathml += '</mathml>';
    return mathml;
  }

  saveFormulas() {
    try {
      const formulasArray = Array.from(this.formulas.values());
      localStorage.setItem('fabrikage-formulas', JSON.stringify(formulasArray));
      return { success: true, count: formulasArray.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getFormulaReport() {
    const formulas = Array.from(this.formulas.values());
    
    return {
      total: formulas.length,
      byComplexity: {
        low: formulas.filter(f => f.formula.complexity < 5).length,
        medium: formulas.filter(f => f.formula.complexity >= 5 && f.formula.complexity < 10).length,
        high: formulas.filter(f => f.formula.complexity >= 10).length
      },
      byClass: this.groupByClass(formulas),
      formulas: formulas
    };
  }

  groupByClass(formulas) {
    const groups = {};
    formulas.forEach(formula => {
      const className = formula.analysis.context.class || 'global';
      if (!groups[className]) {
        groups[className] = [];
      }
      groups[className].push(formula);
    });
    return groups;
  }

  setupAutoUpdate() {
    // Überwache neue Funktionen und erstelle automatisch Formeln
    if (this.autoUpdateEnabled) return;
    this.autoUpdateEnabled = true;

    // Überwache window-Objekte
    const checkInterval = setInterval(() => {
      this.watchForNewFunctions();
    }, 2000);

    // Stoppe nach 30 Sekunden (Initialisierung abgeschlossen)
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 30000);
  }

  watchForNewFunctions() {
    const watchedObjects = ['factoryEngine', 'softwareGenerator', 'consoleErrorController', 'formulaToProgramGenerator'];
    
    watchedObjects.forEach(objName => {
      if (window[objName] && typeof window[objName] === 'object') {
        Object.getOwnPropertyNames(window[objName]).forEach(prop => {
          if (typeof window[objName][prop] === 'function' && prop !== 'constructor') {
            const funcId = `${objName}.${prop}`;
            if (!this.analyzedFunctions.has(funcId)) {
              this.analyzedFunctions.add(funcId);
              const result = this.analyzeFunction(window[objName][prop], {
                class: objName,
                method: prop
              });
              if (result.success) {
                this.saveFormulas();
                console.log(`✅ Auto-Formel erstellt für: ${objName}.${prop}`);
              }
            }
          }
        });
      }
    });
  }

  get autoUpdateEnabled() {
    return this._autoUpdateEnabled || false;
  }

  set autoUpdateEnabled(value) {
    this._autoUpdateEnabled = value;
  }

  get analyzedFunctions() {
    if (!this._analyzedFunctions) {
      this._analyzedFunctions = new Set();
    }
    return this._analyzedFunctions;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.formulaGenerator = new FormulaGenerator();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormulaGenerator;
}



