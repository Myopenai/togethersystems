// Log Success - Protokolliert erfolgreiche Implementierungen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogSuccess {
  constructor() {
    this.sessionLogPath = path.join(__dirname, '..', 'prompts', 'SESSION-LOG.md');
  }

  log(implementation, files, status = 'success') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      implementation,
      files,
      status
    };
    
    const entry = `\n## ${new Date().toISOString()}\n\n**Implementation:** ${implementation}\n**Status:** ${status}\n\n**Files:**\n${files.map(f => `- ${f}`).join('\n')}\n\n---\n\n`;
    
    try {
      if (fs.existsSync(this.sessionLogPath)) {
        fs.appendFileSync(this.sessionLogPath, entry, 'utf8');
      } else {
        fs.writeFileSync(this.sessionLogPath, `# SESSION LOG\n\n${entry}`, 'utf8');
      }
      
      console.log(`✅ Protokolliert: ${implementation}`);
    } catch (e) {
      console.error('Fehler beim Protokollieren:', e);
    }
  }
}

// CLI-Support
const isMainModule = import.meta.url === `file://${path.resolve(process.argv[1])}` || 
                     import.meta.url.endsWith('log-success.js');
if (isMainModule || process.argv[1]?.includes('log-success.js')) {
  const args = process.argv.slice(2);
  const logger = new LogSuccess();
  
  if (args.includes('--append')) {
    const implementation = args[args.indexOf('--implementation') + 1] || 'Unknown';
    const files = args.filter((arg, i) => args[i - 1] === '--files').slice(1) || [];
    logger.log(implementation, files);
  }
}

export default LogSuccess;


