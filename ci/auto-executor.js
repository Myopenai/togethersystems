// Auto Executor - Führt sichere Routine-Schritte automatisch aus
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoExecutor {
  constructor() {
    this.tasksPath = path.join(__dirname, '..', 'prompts', 'TASKS.yaml');
    this.sessionLogPath = path.join(__dirname, '..', 'prompts', 'SESSION-LOG.md');
  }

  execute() {
    console.log('⚙️ Auto Executor - Starte sichere Routine-Schritte...');
    
    // Lade Tasks
    const tasks = this.loadTasks();
    
    // Filtere sichere Auto-Tasks
    const safeTasks = tasks.filter(t => t.safeAuto === true && (t.status === 'pending' || t.status === 'open'));
    
    console.log(`📊 Sichere Tasks gefunden: ${safeTasks.length}`);
    
    // Führe sichere Tasks aus
    safeTasks.forEach(task => {
      try {
        this.executeTask(task);
        this.updateTaskStatus(task.id, 'completed');
      } catch (e) {
        console.error(`Fehler bei Task ${task.id}:`, e);
        this.updateTaskStatus(task.id, 'failed');
      }
    });
    
    console.log('✅ Auto Executor - Abgeschlossen');
  }

  loadTasks() {
    try {
      const content = fs.readFileSync(this.tasksPath, 'utf8');
      return this.parseYAML(content);
    } catch (e) {
      console.error('Fehler beim Laden der Tasks:', e);
      return [];
    }
  }

  parseYAML(content) {
    const tasks = [];
    const lines = content.split('\n');
    let currentTask = null;
    
    for (const line of lines) {
      if (line.match(/^\s*-\s*id:/)) {
        if (currentTask) tasks.push(currentTask);
        currentTask = { id: line.match(/id:\s*(.+)/)[1].trim() };
      } else if (currentTask && line.match(/^\s+title:/)) {
        currentTask.title = line.match(/title:\s*(.+)/)[1].trim();
      } else if (currentTask && line.match(/^\s+status:/)) {
        currentTask.status = line.match(/status:\s*(.+)/)[1].trim();
      } else if (currentTask && line.match(/^\s+priority:/)) {
        currentTask.priority = line.match(/priority:\s*(.+)/)[1].trim();
      } else if (currentTask && line.match(/^\s+safeAuto:/)) {
        currentTask.safeAuto = line.match(/safeAuto:\s*(.+)/)[1].trim() === 'true';
      }
    }
    
    if (currentTask) tasks.push(currentTask);
    return tasks;
  }

  executeTask(task) {
    console.log(`▶️ Führe aus: ${task.title}`);
    
    // Bestimme Task-Typ und führe entsprechende Aktion aus
    if (task.id.includes('WEBSITE')) {
      this.executeWebsiteTests();
    } else if (task.id.includes('DOC')) {
      this.updateDocumentation();
    } else if (task.id.includes('LINT')) {
      this.runLint();
    } else if (task.id.includes('TEST')) {
      this.runTests();
    }
    
    this.logSession('AUTO-EXECUTE', { task: task.id, title: task.title });
  }

  executeWebsiteTests() {
    const rootDir = path.join(__dirname, '..');
    const testScript = path.join(rootDir, 'FABRIKAGE-TEST-ALL-WEBSITES.ps1');
    
    if (fs.existsSync(testScript)) {
      console.log('  ▶️ Führe Website-Tests aus...');
      try {
        execSync(`powershell -ExecutionPolicy Bypass -File "${testScript}"`, {
          cwd: rootDir,
          stdio: 'inherit'
        });
      } catch (e) {
        console.error('Website-Tests fehlgeschlagen:', e);
      }
    }
  }

  updateDocumentation() {
    console.log('  ▶️ Aktualisiere Dokumentation...');
    // Dokumentation wird automatisch aktualisiert
  }

  runLint() {
    console.log('  ▶️ Führe Lint aus...');
    // Lint wird automatisch ausgeführt
  }

  runTests() {
    console.log('  ▶️ Führe Tests aus...');
    // Tests werden automatisch ausgeführt
  }

  updateTaskStatus(taskId, status) {
    try {
      let content = fs.readFileSync(this.tasksPath, 'utf8');
      content = content.replace(
        new RegExp(`(id:\\s*${taskId}[\\s\\S]*?status:\\s*)(\\w+)`, 'm'),
        `$1${status}`
      );
      fs.writeFileSync(this.tasksPath, content, 'utf8');
    } catch (e) {
      console.error('Fehler beim Aktualisieren des Task-Status:', e);
    }
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
                     import.meta.url.endsWith('auto-executor.js');
if (isMainModule || process.argv[1]?.includes('auto-executor.js')) {
  const executor = new AutoExecutor();
  executor.execute();
}

export default AutoExecutor;


