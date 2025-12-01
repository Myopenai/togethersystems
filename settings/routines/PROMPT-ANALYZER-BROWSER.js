/**
 * AUTO-PROMPT-TO-ROUTINE-SYSTEM (Browser-Version)
 * Für direkte Integration in HTML-Portale
 * 
 * BRANDING: T,.&T,,.&T,,,.(C)TEL1.NL
 * VERSION: 1.0.0
 */

class PromptToRoutineSystemBrowser {
  constructor() {
    this.config = {
      routines_storage_key: 'TOGETHERSYSTEMS_ROUTINES',
      prompts_archive_key: 'TOGETHERSYSTEMS_PROMPTS_ARCHIVE',
      execution_logs_key: 'TOGETHERSYSTEMS_EXECUTION_LOGS'
    };
    
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.config.routines_storage_key)) {
      localStorage.setItem(this.config.routines_storage_key, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.config.prompts_archive_key)) {
      localStorage.setItem(this.config.prompts_archive_key, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.config.execution_logs_key)) {
      localStorage.setItem(this.config.execution_logs_key, JSON.stringify([]));
    }
  }

  /**
   * Analysiert Prompt und erstellt Routine
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
    this.saveRoutine(analysis);
    
    // Prompt archivieren
    this.archivePrompt(promptText, analysis.routine_id);
    
    // Event emittieren
    this.emitRoutineCreated(analysis);

    return {
      success: true,
      routine_id: analysis.routine_id,
      analysis: analysis
    };
  }

  extractIntent(promptText) {
    const keywords = [
      'erstellen', 'bauen', 'implementieren', 'konfigurieren',
      'erweitern', 'hinzufügen', 'archivieren', 'konsolidieren',
      'fixen', 'beheben', 'testen', 'deployen',
      'analysieren', 'prüfen', 'verifizieren', 'validieren'
    ];
    
    const lowerPrompt = promptText.toLowerCase();
    
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        return keyword.toUpperCase();
      }
    }
    
    return promptText.substring(0, 50).replace(/\n/g, ' ').trim();
  }

  extractParameters(promptText) {
    const params = {};
    
    // Dateinamen
    const fileMatches = promptText.match(/(\w+\.(md|html|js|json|sql|yaml|css))/gi);
    if (fileMatches) params.files = [...new Set(fileMatches)];
    
    // URLs
    const urlMatches = promptText.match(/(https?:\/\/[^\s]+)/gi);
    if (urlMatches) params.urls = [...new Set(urlMatches)];
    
    // Versionsnummern
    const versionMatches = promptText.match(/(\d+\.\d+\.\d+)/gi);
    if (versionMatches) params.versions = [...new Set(versionMatches)];
    
    // Geldbeträge
    const moneyMatches = promptText.match(/(€|\$|EUR|USD)\s*(\d+[.,]\d+|\d+)/gi);
    if (moneyMatches) params.money_values = moneyMatches;
    
    return params;
  }

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
      if (pattern.test(promptText)) actions.push(action);
    });

    return [...new Set(actions)];
  }

  extractDependencies(promptText) {
    const dependencies = [];
    const components = [
      'TELBANK', 'TELADIA', 'TOGETHERSYSTEMS', 'TPGA',
      'Voucher', 'Börse', 'Banking', 'Verschlüsselung',
      'Localhost', 'CEOC', 'JJC', 'MetaMask'
    ];
    
    components.forEach(component => {
      if (promptText.includes(component)) dependencies.push(component);
    });

    return dependencies;
  }

  extractExpectedOutputs(promptText) {
    const outputs = [];
    if (promptText.includes('.md')) outputs.push('MARKDOWN_DOCUMENT');
    if (promptText.includes('.html')) outputs.push('HTML_PAGE');
    if (promptText.includes('.js')) outputs.push('JAVASCRIPT_FILE');
    if (promptText.includes('.json')) outputs.push('JSON_CONFIG');
    if (promptText.includes('PDF')) outputs.push('PDF_DOCUMENT');
    if (promptText.includes('CSV')) outputs.push('CSV_DATA');
    return outputs;
  }

  extractQualityCriteria(promptText) {
    const criteria = [];
    const qualityTerms = [
      'pixel-perfekt', 'wasserdicht', 'zero-defect', 'industriell',
      'IBM-Standard', 'Hollywood-Qualität', 'Studio-Max', 'DaVinci'
    ];
    
    qualityTerms.forEach(term => {
      if (promptText.toLowerCase().includes(term.toLowerCase())) {
        criteria.push(term.toUpperCase());
      }
    });

    return criteria;
  }

  extractFileTargets(promptText) {
    const files = [];
    const filePattern = /([\w\-]+\.(md|html|js|json|sql|yaml|css|txt))/gi;
    const matches = promptText.match(filePattern);
    if (matches) files.push(...new Set(matches));
    return files;
  }

  extractSystemComponents(promptText) {
    const components = [];
    const systemComponents = [
      'TELBANK', 'TELADIA', 'TOGETHERSYSTEMS', 'TPGA',
      'Voucher', 'Börse', 'Banking', 'Verschlüsselung',
      'Localhost', 'CEOC', 'JJC', 'MetaMask', 'Deutsche Bank'
    ];
    
    systemComponents.forEach(component => {
      if (promptText.includes(component)) components.push(component);
    });

    return [...new Set(components)];
  }

  saveRoutine(analysis) {
    const routines = JSON.parse(localStorage.getItem(this.config.routines_storage_key));
    routines.push(analysis);
    localStorage.setItem(this.config.routines_storage_key, JSON.stringify(routines));
    return analysis.routine_id;
  }

  archivePrompt(promptText, routineId) {
    const archive = JSON.parse(localStorage.getItem(this.config.prompts_archive_key));
    archive.push({
      prompt: promptText,
      routine_id: routineId,
      archived_at: new Date().toISOString()
    });
    localStorage.setItem(this.config.prompts_archive_key, JSON.stringify(archive));
  }

  generateRoutineId() {
    return `ROUTINE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  emitRoutineCreated(analysis) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('routineCreated', {
        detail: analysis
      }));
    }
  }

  getAllRoutines() {
    return JSON.parse(localStorage.getItem(this.config.routines_storage_key));
  }

  getRoutine(routineId) {
    const routines = this.getAllRoutines();
    return routines.find(r => r.routine_id === routineId);
  }
}

// Global verfügbar
if (typeof window !== 'undefined') {
  window.PromptToRoutineSystem = PromptToRoutineSystemBrowser;
  
  // Auto-Analyse bei jedem User-Input (wenn gewünscht)
  document.addEventListener('DOMContentLoaded', () => {
    const system = new PromptToRoutineSystemBrowser();
    window.promptAnalyzer = system;
    console.log('✅ Prompt-to-Routine-System aktiviert');
  });
}

