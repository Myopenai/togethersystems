// Prompt Scanner - Erkennt offene Tasks automatisch
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PromptScanner {
  constructor() {
    this.masterPromptPath = path.join(__dirname, '..', 'prompts', 'MASTER-PROMPT.md');
    this.tasksPath = path.join(__dirname, '..', 'prompts', 'TASKS.yaml');
    this.sessionLogPath = path.join(__dirname, '..', 'prompts', 'SESSION-LOG.md');
  }

  scan() {
    console.log('🔍 Prompt Scanner - Starte Analyse...');
    
    // Lade Master-Prompt
    const masterPrompt = this.loadMasterPrompt();
    
    // Analysiere Repo-Zustand
    const repoState = this.analyzeRepoState();
    
    // Vergleiche und generiere Tasks
    const tasks = this.compareAndGenerateTasks(masterPrompt, repoState);
    
    // Speichere Tasks
    this.saveTasks(tasks);
    
    // Protokolliere
    this.logSession('PROMPT-SCAN', tasks);
    
    console.log('✅ Prompt Scanner - Abgeschlossen');
    console.log(`📊 Offene Tasks: ${tasks.filter(t => t.status === 'open' || t.status === 'pending').length}`);
    
    return tasks;
  }

  loadMasterPrompt() {
    try {
      const content = fs.readFileSync(this.masterPromptPath, 'utf8');
      return this.parseMasterPrompt(content);
    } catch (e) {
      console.error('Fehler beim Laden des Master-Prompts:', e);
      return {};
    }
  }

  parseMasterPrompt(content) {
    const sections = {};
    let currentSection = null;
    
    const lines = content.split('\n');
    for (const line of lines) {
      // Erkenne Abschnitte
      if (line.match(/^### \d+\./)) {
        currentSection = line.replace(/^### \d+\.\s*/, '').trim();
        sections[currentSection] = [];
      } else if (line.match(/^## /)) {
        currentSection = line.replace(/^## /, '').trim();
        sections[currentSection] = [];
      } else if (currentSection && line.trim()) {
        sections[currentSection].push(line.trim());
      }
    }
    
    return sections;
  }

  analyzeRepoState() {
    const rootDir = path.join(__dirname, '..');
    const state = {
      files: {},
      implementations: [],
      tests: [],
      docs: []
    };
    
    // Scanne wichtige Dateien
    const importantFiles = [
      'CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/notar-complete.html',
      'js/console-cache-system.js',
      'js/console-error-controller.js',
      'FABRIKAGE-TEST-ALL-WEBSITES.ps1',
      'FABRIKAGE-ADD-CONSOLE-TO-ALL-FILES.ps1'
    ];
    
    importantFiles.forEach(file => {
      const fullPath = path.join(rootDir, file);
      if (fs.existsSync(fullPath)) {
        state.files[file] = {
          exists: true,
          size: fs.statSync(fullPath).size,
          modified: fs.statSync(fullPath).mtime
        };
      } else {
        state.files[file] = { exists: false };
      }
    });
    
    // Scanne nach Implementierungen
    this.scanForImplementations(rootDir, state);
    
    return state;
  }

  scanForImplementations(rootDir, state) {
    // Scanne nach HTML-Dateien mit Digitalnotator
    const notarFiles = this.findFiles(rootDir, /notar.*\.html$/i);
    state.implementations.push(...notarFiles.map(f => ({
      type: 'digitalnotator',
      file: f,
      status: 'found'
    })));
    
    // Scanne nach Console-Systemen
    const consoleFiles = this.findFiles(rootDir, /console.*\.js$/i);
    state.implementations.push(...consoleFiles.map(f => ({
      type: 'console-system',
      file: f,
      status: 'found'
    })));
    
    // Scanne nach Test-Scripts
    const testFiles = this.findFiles(rootDir, /test.*\.ps1$/i);
    state.tests.push(...testFiles.map(f => ({
      type: 'test-script',
      file: f,
      status: 'found'
    })));
  }

  findFiles(dir, pattern) {
    const files = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.match(/node_modules|\.git|backup/)) {
          files.push(...this.findFiles(fullPath, pattern));
        } else if (entry.isFile() && entry.name.match(pattern)) {
          files.push(fullPath.replace(path.join(__dirname, '..'), '').replace(/\\/g, '/'));
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return files;
  }

  compareAndGenerateTasks(masterPrompt, repoState) {
    const tasks = [];
    
    // Digitalnotator-Tasks
    if (masterPrompt['Digitalnotator - Vollständige Umsetzung nach Dokumentation']) {
      const notarFiles = repoState.implementations.filter(i => i.type === 'digitalnotator');
      if (notarFiles.length === 0) {
        tasks.push({
          id: 'DIGITALNOTATOR-001',
          title: 'Digitalnotator - Vollständige Implementierung',
          status: 'open',
          priority: 'high',
          safeAuto: false
        });
      }
    }
    
    // Website-Test-Tasks
    const testFiles = repoState.tests.filter(t => t.type === 'test-script');
    if (testFiles.length > 0) {
      tasks.push({
        id: 'WEBSITE-001',
        title: 'Website-Tests ausführen und Fehler beheben',
        status: 'pending',
        priority: 'high',
        safeAuto: true
      });
    }
    
    // Apple-Pi Tasks
    tasks.push({
      id: 'APPLEPI-001',
      title: 'Apple-Pi System - Spec Mirror erstellen',
      status: 'pending',
      priority: 'medium',
      safeAuto: false
    });
    
    // Startup-System Tasks
    tasks.push({
      id: 'STARTUP-001',
      title: 'Startup-System - Produktübergabe implementieren',
      status: 'pending',
      priority: 'high',
      safeAuto: false
    });
    
    return tasks;
  }

  saveTasks(tasks) {
    const yaml = this.generateYAML(tasks);
    fs.writeFileSync(this.tasksPath, yaml, 'utf8');
  }

  generateYAML(tasks) {
    let yaml = `version: 1\nupdated: ${new Date().toISOString()}\n\ntasks:\n`;
    
    tasks.forEach(task => {
      yaml += `  - id: ${task.id}\n`;
      yaml += `    title: ${task.title}\n`;
      yaml += `    status: ${task.status}\n`;
      yaml += `    priority: ${task.priority}\n`;
      yaml += `    safeAuto: ${task.safeAuto}\n`;
      yaml += `\n`;
    });
    
    return yaml;
  }

  logSession(action, data) {
    const logEntry = `\n## ${new Date().toISOString()}\n\n**Action:** ${action}\n\n**Data:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n---\n\n`;
    
    try {
      if (fs.existsSync(this.sessionLogPath)) {
        fs.appendFileSync(this.sessionLogPath, logEntry, 'utf8');
      } else {
        fs.writeFileSync(this.sessionLogPath, `# SESSION LOG\n\n${logEntry}`, 'utf8');
      }
    } catch (e) {
      console.error('Fehler beim Protokollieren:', e);
    }
  }
}

// Ausführung
const isMainModule = import.meta.url === `file://${path.resolve(process.argv[1])}` || 
                     import.meta.url.endsWith('prompt-scanner.js');
if (isMainModule || process.argv[1]?.includes('prompt-scanner.js')) {
  const scanner = new PromptScanner();
  scanner.scan();
}

export default PromptScanner;


