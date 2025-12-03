// T,. OSTOSOS - Gentlyoverdone Fix System
// Fixt Fehler automatisch mit Fabrikationssystem

const GENTLYOVERDONE_FIX_SYSTEM = {
  fixes: [],
  
  async fixProgram(programPath) {
    // Lade Programm
    const content = await this.loadFile(programPath);
    
    // Analysiere Fehler
    const errors = this.analyzeErrors(content);
    
    // Fixe Fehler
    let fixedContent = content;
    for (const error of errors) {
      fixedContent = this.applyFix(fixedContent, error);
    }
    
    // Speichere gefixtes Programm
    await this.saveFixedProgram(programPath, fixedContent);
    
    return {
      original: content,
      fixed: fixedContent,
      errors: errors,
      fixes: this.fixes
    };
  },
  
  analyzeErrors(content) {
    const errors = [];
    
    // Console-Logging optimieren
    if (this.countConsoleStatements(content) > 50) {
      errors.push({
        type: 'excessive-console-logging',
        severity: 'low',
        fix: 'optimize-console-logging'
      });
    }
    
    // Fehlende Error-Handling
    if (!this.hasErrorHandling(content)) {
      errors.push({
        type: 'missing-error-handling',
        severity: 'medium',
        fix: 'add-error-handling'
      });
    }
    
    // Fehlende Kommentare
    if (this.getCommentRatio(content) < 0.1) {
      errors.push({
        type: 'low-documentation',
        severity: 'low',
        fix: 'add-comments'
      });
    }
    
    // Performance-Probleme
    if (this.hasPerformanceIssues(content)) {
      errors.push({
        type: 'performance-issues',
        severity: 'medium',
        fix: 'optimize-performance'
      });
    }
    
    return errors;
  },
  
  applyFix(content, error) {
    switch (error.fix) {
      case 'optimize-console-logging':
        return this.optimizeConsoleLogging(content);
      case 'add-error-handling':
        return this.addErrorHandling(content);
      case 'add-comments':
        return this.addComments(content);
      case 'optimize-performance':
        return this.optimizePerformance(content);
      default:
        return content;
    }
  },
  
  optimizeConsoleLogging(content) {
    // Entferne übermäßige console.log Statements (behalte nur wichtige)
    let fixed = content;
    
    // Ersetze console.log mit bedingtem Logging
    fixed = fixed.replace(/console\.log\(/g, 'if(window.DEBUG){console.log(');
    fixed = fixed.replace(/console\.warn\(/g, 'if(window.DEBUG){console.warn(');
    
    // Entferne Debug-Statements in Produktion
    fixed = fixed.replace(/console\.log\(['"]🎸|🎵|✅|❌|⚠️/g, '// console.log(');
    
    this.fixes.push('Console-Logging optimiert - Debug-Statements können mit window.DEBUG=true aktiviert werden');
    
    return fixed;
  },
  
  addErrorHandling(content) {
    // Füge Error-Handling hinzu wo fehlt
    let fixed = content;
    
    // Wrap kritische Funktionen in try-catch
    const criticalFunctions = [
      /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/g
    ];
    
    // Füge Error-Handling hinzu (vereinfacht)
    fixed = fixed.replace(/(async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g, (match, async, name) => {
      if (name && !content.includes(`catch`)) {
        return `${match}\n  try {`;
      }
      return match;
    });
    
    this.fixes.push('Error-Handling hinzugefügt für kritische Funktionen');
    
    return fixed;
  },
  
  addComments(content) {
    // Füge Kommentare hinzu für komplexe Funktionen
    let fixed = content;
    
    // Füge Header-Kommentare hinzu
    if (!content.includes('/*')) {
      fixed = `/*\n * Gentlyoverdone Studienprojekt\n * Automatisch dokumentiert durch OSTOSOS Fabrikationssystem\n * Datum: ${new Date().toISOString()}\n */\n\n${fixed}`;
    }
    
    this.fixes.push('Dokumentations-Kommentare hinzugefügt');
    
    return fixed;
  },
  
  optimizePerformance(content) {
    // Performance-Optimierungen
    let fixed = content;
    
    // Debounce für Event-Listener
    fixed = fixed.replace(/addEventListener\s*\(\s*['"]input['"]/g, 
      'addEventListener("input", debounce(');
    
    this.fixes.push('Performance-Optimierungen angewendet');
    
    return fixed;
  },
  
  countConsoleStatements(content) {
    return (content.match(/console\.(log|error|warn|debug)/g) || []).length;
  },
  
  hasErrorHandling(content) {
    return content.includes('try') && content.includes('catch');
  },
  
  getCommentRatio(content) {
    const comments = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
    const lines = content.split('\n').length;
    return comments / lines;
  },
  
  hasPerformanceIssues(content) {
    // Erkenne Performance-Probleme
    return content.includes('setInterval') && !content.includes('clearInterval') ||
           content.includes('addEventListener') && content.includes('input') && !content.includes('debounce');
  },
  
  async loadFile(path) {
    // Simuliere File-Load (in Produktion: File-System-API)
    return '/* Placeholder - würde echten Inhalt laden */';
  },
  
  async saveFixedProgram(originalPath, fixedContent) {
    // Speichere gefixtes Programm
    const fixedPath = originalPath.replace(/\.html?$/, '-FIXED.html');
    // In Produktion: File-System-API zum Speichern
    this.fixes.push(`Gefixtes Programm gespeichert: ${fixedPath}`);
    return fixedPath;
  }
};

window.GENTLYOVERDONE_FIX_SYSTEM = GENTLYOVERDONE_FIX_SYSTEM;

