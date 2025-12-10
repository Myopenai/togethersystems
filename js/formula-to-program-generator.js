// Formula to Program Generator - Raumloses Mikrokosmos-Ökosystem
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

class FormulaToProgramGenerator {
  constructor() {
    this.formulas = new Map();
    this.generatedPrograms = new Map();
    this.formulaMixer = new FormulaMixer();
    this.autoUpdate = true;
    this.init();
  }

  init() {
    // Lade vorhandene Formeln
    this.loadFormulas();
    
    // Auto-Update bei neuen Funktionen
    if (this.autoUpdate) {
      this.setupAutoUpdate();
    }
  }

  loadFormulas() {
    try {
      if (window.formulaGenerator) {
        const formulas = Array.from(window.formulaGenerator.formulas.values());
        formulas.forEach(formula => {
          this.formulas.set(formula.id, formula);
        });
      }
    } catch (e) {
      console.warn('Formeln nicht geladen:', e);
    }
  }

  setupAutoUpdate() {
    // Überwache neue Funktionen
    const originalFactoryEngine = window.factoryEngine;
    if (originalFactoryEngine) {
      // Proxy für createModule
      const originalCreateModule = originalFactoryEngine.createModule;
      originalFactoryEngine.createModule = (...args) => {
        const result = originalCreateModule.apply(originalFactoryEngine, args);
        if (result && window.formulaGenerator) {
          // Erstelle automatisch Formel für neue Module
          setTimeout(() => {
            this.createFormulaForFunction(originalCreateModule, {
              class: 'FactoryEngine',
              method: 'createModule',
              module: result
            });
          }, 100);
        }
        return result;
      };
    }

    // Überwache window-Objekte
    this.watchWindowObjects();
  }

  watchWindowObjects() {
    const watchedObjects = ['factoryEngine', 'softwareGenerator', 'consoleErrorController'];
    
    watchedObjects.forEach(objName => {
      if (window[objName]) {
        this.analyzeObject(window[objName], objName);
      }
    });
  }

  analyzeObject(obj, className) {
    if (!obj || typeof obj !== 'object') return;
    
    Object.getOwnPropertyNames(obj).forEach(prop => {
      if (typeof obj[prop] === 'function' && prop !== 'constructor') {
        this.createFormulaForFunction(obj[prop], {
          class: className,
          method: prop
        });
      }
    });
  }

  createFormulaForFunction(func, context) {
    try {
      if (!window.formulaGenerator) return;
      
      const result = window.formulaGenerator.analyzeFunction(func, context);
      if (result.success) {
        this.formulas.set(result.formulaId, result.formula);
        window.formulaGenerator.saveFormulas();
        console.log(`✅ Formel erstellt für: ${context.class}.${context.method}`);
      }
    } catch (e) {
      console.warn('Fehler beim Erstellen der Formel:', e);
    }
  }

  generateProgramFromFormula(formulaId, config = {}) {
    try {
      const formula = this.formulas.get(formulaId);
      if (!formula) {
        throw new Error(`Formel ${formulaId} nicht gefunden`);
      }

      // Generiere Programm aus Formel
      const program = this.buildProgramFromFormula(formula, config);
      
      const programId = `PROGRAM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.generatedPrograms.set(programId, {
        id: programId,
        formulaId: formulaId,
        formula: formula,
        program: program,
        config: config,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      });

      return { success: true, programId, program };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  buildProgramFromFormula(formula, config) {
    const analysis = formula.analysis;
    const funcName = analysis.name || 'GeneratedFunction';
    const params = analysis.parameters.join(', ');
    
    // Generiere Programm-Code
    let code = `// Generated Program from Formula
// Formula: ${formula.formula.equation}
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

function ${funcName}(${params}) {
    try {
        // Input validation
        ${analysis.parameters.map((p, i) => `if (${p} === undefined || ${p} === null) {
            throw new Error('Parameter ${p} is required');
        }`).join('\n        ')}
        
        // Process based on formula
        ${this.generateProcessCode(formula, analysis)}
        
        // Return based on formula
        ${this.generateReturnCode(formula, analysis)}
    } catch (error) {
        if (window.errorFixSystem) {
            window.errorFixSystem.reportError(error, { context: '${funcName}' });
        }
        throw error;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.${funcName} = ${funcName};
}`;

    return code;
  }

  generateProcessCode(formula, analysis) {
    const operations = analysis.operations;
    
    if (operations.includes('CREATE_MODULE')) {
      return `const module = window.factoryEngine.createModule(${analysis.parameters[0]}, ${analysis.parameters[1] || 0}, ${analysis.parameters[2] || 0});
        return module;`;
    } else if (operations.includes('CREATE_LINK')) {
      return `const link = window.factoryEngine.createLink(
            ${analysis.parameters[0]}, ${analysis.parameters[1]},
            ${analysis.parameters[2]}, ${analysis.parameters[3]}
        );
        return link;`;
    } else if (operations.includes('GENERATE_CODE')) {
      return `const codeResult = window.softwareGenerator.generateCode(
            ${analysis.parameters[0]}, ${analysis.parameters[1]}
        );
        return codeResult;`;
    } else {
      return `// Process logic based on formula
        const result = {
            input: {${analysis.parameters.map(p => `${p}`).join(', ')}},
            processed: true,
            timestamp: new Date().toISOString()
        };
        return result;`;
    }
  }

  generateReturnCode(formula, analysis) {
    const returnType = analysis.returnType;
    
    if (returnType === 'boolean') {
      return 'return true;';
    } else if (returnType === 'object') {
      return 'return result;';
    } else if (returnType === 'number') {
      return 'return 0;';
    } else if (returnType === 'string') {
      return 'return "";';
    } else {
      return 'return result;';
    }
  }

  mixFormulas(formulaIds, mixConfig = {}) {
    try {
      const formulas = formulaIds.map(id => this.formulas.get(id)).filter(f => f);
      if (formulas.length === 0) {
        throw new Error('Keine gültigen Formeln gefunden');
      }

      // Mische Formeln
      const mixedFormula = this.formulaMixer.mix(formulas, mixConfig);
      
      // Generiere Programm aus gemischter Formel
      const program = this.buildProgramFromFormula(mixedFormula, mixConfig);
      
      const programId = `PROGRAM-MIXED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.generatedPrograms.set(programId, {
        id: programId,
        formulaIds: formulaIds,
        mixedFormula: mixedFormula,
        program: program,
        config: mixConfig,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      });

      return { success: true, programId, program, mixedFormula };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  exportProgram(programId, format = 'file') {
    try {
      const programData = this.generatedPrograms.get(programId);
      if (!programData) {
        throw new Error(`Programm ${programId} nicht gefunden`);
      }

      if (format === 'file') {
        const blob = new Blob([programData.program], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-program-${Date.now()}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true };
      } else {
        return { success: true, program: programData.program };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Formula Mixer - Raumloses Mikrokosmos-Ökosystem
class FormulaMixer {
  mix(formulas, config = {}) {
    // Kombiniere Formeln zu einer neuen Formel
    const mixedFormula = {
      notation: 'altwissenschaftlich-mixed',
      symbols: {},
      equation: '',
      description: '',
      complexity: 0,
      dependencies: [],
      operations: []
    };

    // Kombiniere Symbole
    formulas.forEach((formula, index) => {
      Object.entries(formula.formula.symbols || {}).forEach(([key, value]) => {
        const newKey = `${key}_${index}`;
        mixedFormula.symbols[newKey] = value;
      });
    });

    // Kombiniere Gleichungen
    const equations = formulas.map(f => f.formula.equation);
    mixedFormula.equation = `MIX(${equations.join(', ')}) → COMPOSITE_PROGRAM`;

    // Kombiniere Beschreibungen
    mixedFormula.description = `Gemischte Formel aus ${formulas.length} Formeln: ${formulas.map(f => f.function).join(', ')}`;

    // Berechne Komplexität
    mixedFormula.complexity = formulas.reduce((sum, f) => sum + (f.formula.complexity || 0), 0);
    mixedFormula.complexitySymbol = mixedFormula.complexity > 10 ? 'Ω' : mixedFormula.complexity > 5 ? 'Θ' : 'Ο';

    // Kombiniere Abhängigkeiten
    formulas.forEach(f => {
      (f.formula.dependencies || []).forEach(dep => {
        if (!mixedFormula.dependencies.includes(dep)) {
          mixedFormula.dependencies.push(dep);
        }
      });
    });

    // Kombiniere Operationen
    formulas.forEach(f => {
      (f.analysis.operations || []).forEach(op => {
        if (!mixedFormula.operations.includes(op)) {
          mixedFormula.operations.push(op);
        }
      });
    });

    return {
      id: `MIXED-${Date.now()}`,
      function: `MIXED_${formulas.map(f => f.function).join('_')}`,
      analysis: {
        name: 'MixedFunction',
        parameters: this.combineParameters(formulas),
        returnType: 'object',
        complexity: mixedFormula.complexity,
        dependencies: mixedFormula.dependencies,
        operations: mixedFormula.operations
      },
      formula: mixedFormula,
      timestamp: new Date().toISOString(),
      version: '3.0.0'
    };
  }

  combineParameters(formulas) {
    const allParams = [];
    formulas.forEach(f => {
      (f.analysis.parameters || []).forEach(param => {
        if (!allParams.includes(param)) {
          allParams.push(param);
        }
      });
    });
    return allParams;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.formulaToProgramGenerator = new FormulaToProgramGenerator();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormulaToProgramGenerator, FormulaMixer };
}



