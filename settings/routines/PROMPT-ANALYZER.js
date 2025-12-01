/**
 * AUTO-PROMPT-TO-ROUTINE-SYSTEM
 * Automatische Prompt-Analyse und Routine-Generierung
 * 
 * BRANDING: T,.&T,,.&T,,,.(C)TEL1.NL
 * VERSION: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PromptToRoutineSystem {
  constructor() {
    this.configPath = path.join(__dirname, '../AUTO-PROMPT-TO-ROUTINE-SYSTEM.json');
    this.routinesDir = path.join(__dirname, './');
    this.promptsArchiveDir = path.join(__dirname, './prompts-archive/');
    this.executionLogsDir = path.join(__dirname, './execution-logs/');
    
    this.ensureDirectories();
    this.loadConfig();
  }

  ensureDirectories() {
    [this.routinesDir, this.promptsArchiveDir, this.executionLogsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (e) {
      console.error('Config load error:', e);
      this.config = require('../AUTO-PROMPT-TO-ROUTINE-SYSTEM.json');
    }
  }

  /**
   * Hauptfunktion: Analysiert Prompt und erstellt Routine
   */
  analyzePrompt(promptText, context = {}) {
    const analysis = {
      routine_id: this.generateRoutineId(),
      created_at: new Date().toISOString(),
      prompt_source: promptText,
      extracted_intent: this.extractIntent(promptText),
      parameters: this.extractParameters(promptText),
      actions: this.extractActions(promptText),
      dependencies: this.extractDependencies(promptText),
      expected_outputs: this.extractExpectedOutputs(promptText),
      quality_criteria: this.extractQualityCriteria(promptText),
      file_targets: this.extractFileTargets(promptText),
      system_components: this.extractSystemComponents(promptText),
      execution_history: []
    };

    // Routine speichern
    const routinePath = this.saveRoutine(analysis);
    
    // Prompt archivieren
    this.archivePrompt(promptText, analysis.routine_id);
    
    // Settings-Manifest aktualisieren
    this.updateSettingsManifest(analysis);
    
    // Statistiken aktualisieren
    this.updateStatistics();

    return {
      success: true,
      routine_id: analysis.routine_id,
      routine_path: routinePath,
      analysis: analysis
    };
  }

  /**
   * Extrahiert Hauptintention aus Prompt
   */
  extractIntent(promptText) {
    const keywords = this.config.prompt_analysis_rules.detect_keywords;
    const lowerPrompt = promptText.toLowerCase();
    
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return keyword.toUpperCase();
      }
    }
    
    // Fallback: Erste 50 Zeichen als Intent
    return promptText.substring(0, 50).replace(/\n/g, ' ').trim();
  }

  /**
   * Extrahiert Parameter aus Prompt
   */
  extractParameters(promptText) {
    const params = {};
    
    // Dateinamen extrahieren
    const fileMatches = promptText.match(/(\w+\.(md|html|js|json|sql|yaml|css))/gi);
    if (fileMatches) {
      params.files = [...new Set(fileMatches)];
    }
    
    // URLs extrahieren
    const urlMatches = promptText.match(/(https?:\/\/[^\s]+)/gi);
    if (urlMatches) {
      params.urls = [...new Set(urlMatches)];
    }
    
    // Versionsnummern extrahieren
    const versionMatches = promptText.match(/(\d+\.\d+\.\d+)/gi);
    if (versionMatches) {
      params.versions = [...new Set(versionMatches)];
    }
    
    // Zahlen extrahieren (€, $, etc.)
    const moneyMatches = promptText.match(/(€|\$|EUR|USD)\s*(\d+[.,]\d+|\d+)/gi);
    if (moneyMatches) {
      params.money_values = moneyMatches;
    }
    
    return params;
  }

  /**
   * Extrahiert Aktionen aus Prompt
   */
  extractActions(promptText) {
    const actions = [];
    const actionPatterns = [
      { pattern: /erstellen|create|write/gi, action: 'CREATE' },
      { pattern: /erweitern|expand|extend/gi, action: 'EXTEND' },
      { pattern: /archivieren|archive|move/gi, action: 'ARCHIVE' },
      { pattern: /konsolidieren|consolidate|merge/gi, action: 'CONSOLIDATE' },
      { pattern: /analysieren|analyze|check/gi, action: 'ANALYZE' },
      { pattern: /prüfen|verify|validate/gi, action: 'VERIFY' },
      { pattern: /fixen|beheben|repair/gi, action: 'FIX' },
      { pattern: /testen|test/gi, action: 'TEST' },
      { pattern: /deployen|deploy/gi, action: 'DEPLOY' }
    ];

    actionPatterns.forEach(({ pattern, action }) => {
      if (pattern.test(promptText)) {
        actions.push(action);
      }
    });

    return [...new Set(actions)];
  }

  /**
   * Extrahiert Abhängigkeiten
   */
  extractDependencies(promptText) {
    const dependencies = [];
    const systemComponents = this.config.prompt_analysis_rules.detect_system_components;
    
    systemComponents.forEach(component => {
      if (promptText.includes(component)) {
        dependencies.push(component);
      }
    });

    return dependencies;
  }

  /**
   * Extrahiert erwartete Outputs
   */
  extractExpectedOutputs(promptText) {
    const outputs = [];
    
    // Dateitypen im Output
    if (promptText.includes('.md')) outputs.push('MARKDOWN_DOCUMENT');
    if (promptText.includes('.html')) outputs.push('HTML_PAGE');
    if (promptText.includes('.js')) outputs.push('JAVASCRIPT_FILE');
    if (promptText.includes('.json')) outputs.push('JSON_CONFIG');
    if (promptText.includes('PDF')) outputs.push('PDF_DOCUMENT');
    if (promptText.includes('CSV')) outputs.push('CSV_DATA');
    
    return outputs;
  }

  /**
   * Extrahiert Qualitätskriterien
   */
  extractQualityCriteria(promptText) {
    const criteria = [];
    const qualityTerms = this.config.prompt_analysis_rules.detect_quality_requirements;
    
    qualityTerms.forEach(term => {
      if (promptText.toLowerCase().includes(term.toLowerCase())) {
        criteria.push(term.toUpperCase());
      }
    });

    return criteria;
  }

  /**
   * Extrahiert Zieldateien
   */
  extractFileTargets(promptText) {
    const files = [];
    const filePattern = /([\w\-]+\.(md|html|js|json|sql|yaml|css|txt))/gi;
    const matches = promptText.match(filePattern);
    
    if (matches) {
      files.push(...new Set(matches));
    }
    
    return files;
  }

  /**
   * Extrahiert System-Komponenten
   */
  extractSystemComponents(promptText) {
    const components = [];
    const systemComponents = this.config.prompt_analysis_rules.detect_system_components;
    
    systemComponents.forEach(component => {
      if (promptText.includes(component)) {
        components.push(component);
      }
    });

    return [...new Set(components)];
  }

  /**
   * Speichert Routine als JSON
   */
  saveRoutine(analysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const actionType = analysis.extracted_intent || 'UNKNOWN';
    const filename = `ROUTINE-${timestamp}-${actionType}.json`;
    const filepath = path.join(this.routinesDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2), 'utf8');
    
    return filepath;
  }

  /**
   * Archiviert Original-Prompt
   */
  archivePrompt(promptText, routineId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `PROMPT-${timestamp}-${routineId.substring(0, 8)}.txt`;
    const filepath = path.join(this.promptsArchiveDir, filename);

    fs.writeFileSync(filepath, promptText, 'utf8');
  }

  /**
   * Aktualisiert Settings-Manifest
   */
  updateSettingsManifest(analysis) {
    const manifestPath = path.join(__dirname, '../settings-manifest.json');
    
    try {
      let manifest = {};
      if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      }

      if (!manifest.routines) {
        manifest.routines = [];
      }

      manifest.routines.push({
        routine_id: analysis.routine_id,
        created_at: analysis.created_at,
        intent: analysis.extracted_intent,
        actions: analysis.actions,
        file: path.basename(this.saveRoutine(analysis))
      });

      manifest.last_updated = new Date().toISOString();
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    } catch (e) {
      console.error('Manifest update error:', e);
    }
  }

  /**
   * Aktualisiert Statistiken
   */
  updateStatistics() {
    this.config.statistics.total_prompts_analyzed++;
    this.config.statistics.total_routines_created++;
    
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf8');
  }

  /**
   * Generiert Routine-ID
   */
  generateRoutineId() {
    return `ROUTINE-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  /**
   * Führt Routine aus
   */
  executeRoutine(routineId) {
    const routine = this.loadRoutine(routineId);
    if (!routine) {
      return { success: false, error: 'Routine not found' };
    }

    const executionLog = {
      routine_id: routineId,
      executed_at: new Date().toISOString(),
      actions: routine.actions,
      status: 'PENDING'
    };

    // TODO: Hier würde die eigentliche Ausführung stattfinden
    // Für jetzt nur Logging
    
    this.logExecution(executionLog);
    
    return {
      success: true,
      routine_id: routineId,
      execution_log: executionLog
    };
  }

  /**
   * Lädt Routine
   */
  loadRoutine(routineId) {
    const files = fs.readdirSync(this.routinesDir);
    const routineFile = files.find(f => f.includes(routineId.substring(0, 8)));
    
    if (routineFile) {
      const filepath = path.join(this.routinesDir, routineFile);
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    
    return null;
  }

  /**
   * Protokolliert Ausführung
   */
  logExecution(executionLog) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `EXEC-${timestamp}-${executionLog.routine_id.substring(0, 8)}.json`;
    const filepath = path.join(this.executionLogsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(executionLog, null, 2), 'utf8');
  }
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptToRoutineSystem;
}

// Global verfügbar für Browser
if (typeof window !== 'undefined') {
  window.PromptToRoutineSystem = PromptToRoutineSystem;
}

