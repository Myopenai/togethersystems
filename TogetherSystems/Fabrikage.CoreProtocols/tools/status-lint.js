/**
 * ============================================================================
 * STATUS LINT
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Status-Lint - Prüft Frontmatter-Status und Titel-Markierung
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class StatusLint {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Prüft alle Dateien auf Status-Compliance
   */
  async lint() {
    console.log('T,. Status-Lint: Prüfe Clean-Floor-Compliance...');
    
    const files = this.getAllFiles(this.rootDir);
    
    for (const file of files) {
      await this.checkFile(file);
    }
    
    if (this.errors.length > 0) {
      console.error('T,. Status-Lint: FEHLER gefunden:');
      this.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }
    
    if (this.warnings.length > 0) {
      console.warn('T,. Status-Lint: Warnungen:');
      this.warnings.forEach(warn => console.warn(`  - ${warn}`));
    }
    
    console.log('T,. Status-Lint: Alle Dateien sind Clean-Floor-compliant ✓');
    return { errors: this.errors, warnings: this.warnings };
  }

  /**
   * Prüft eine einzelne Datei
   */
  async checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Prüfe Frontmatter
      const { data: frontmatter, content: body } = matter(content);
      
      // Prüfe erforderliche Felder
      if (!frontmatter.status) {
        this.errors.push(`${filePath}: Fehlt Frontmatter 'status'`);
        return;
      }
      
      if (!frontmatter.epoch) {
        this.errors.push(`${filePath}: Fehlt Frontmatter 'epoch'`);
        return;
      }
      
      if (!frontmatter.ref) {
        this.errors.push(`${filePath}: Fehlt Frontmatter 'ref'`);
        return;
      }
      
      if (!frontmatter.hash) {
        this.errors.push(`${filePath}: Fehlt Frontmatter 'hash'`);
        return;
      }
      
      // Prüfe Status-Konsistenz
      const status = frontmatter.status;
      const title = this.extractTitle(content);
      
      if (status === 'deprecated' && !title.includes('#Vergangenheit:')) {
        this.errors.push(`${filePath}: Status 'deprecated' aber Titel hat kein '#Vergangenheit:' Symbol`);
      }
      
      if (status === 'superseded' && !title.includes('↦ Ersetzt durch:')) {
        this.errors.push(`${filePath}: Status 'superseded' aber Titel hat kein '↦ Ersetzt durch:' Symbol`);
      }
      
      if (status === 'superseded' && !frontmatter.replaced_by) {
        this.errors.push(`${filePath}: Status 'superseded' aber fehlt 'replaced_by'`);
      }
      
      if (status === 'archived' && (!title.includes('⟂') || !title.endsWith('⟂'))) {
        this.errors.push(`${filePath}: Status 'archived' aber Titel hat kein '⟂' Symbol am Anfang und Ende`);
      }
      
    } catch (error) {
      this.errors.push(`${filePath}: ${error.message}`);
    }
  }

  /**
   * Extrahiert Titel aus Markdown
   */
  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return '';
  }

  /**
   * Sammelt alle relevanten Dateien
   */
  getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Ignoriere node_modules, .git, builds, etc.
      if (file.startsWith('.') || file === 'node_modules' || file === 'builds' || file === 'dist' || file === 'Archive') {
        return;
      }
      
      if (stat.isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else {
        // Prüfe nur Markdown-Dateien
        if (file.endsWith('.md')) {
          fileList.push(filePath);
        }
      }
    });
    
    return fileList;
  }
}

// ============================================================================
// MAIN
// ============================================================================

if (require.main === module) {
  const lint = new StatusLint();
  lint.lint().catch(error => {
    console.error('T,. Status-Lint: Fehler:', error);
    process.exit(1);
  });
}

module.exports = StatusLint;

