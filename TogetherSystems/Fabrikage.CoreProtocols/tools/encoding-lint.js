/**
 * ============================================================================
 * ENCODING LINT
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Encoding-Lint - Prüft UTF-8 Compliance
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const ALLOWED_ENCODINGS = ['UTF-8', 'UTF-8-BOM'];
const FORBIDDEN_ENCODINGS = ['ISO-8859-1', 'Windows-1252', 'Latin1', 'ANSI'];

class EncodingLint {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Prüft alle Dateien auf UTF-8 Compliance
   */
  async lint() {
    console.log('T,. Encoding-Lint: Prüfe UTF-8 Compliance...');
    
    const files = this.getAllFiles(this.rootDir);
    
    for (const file of files) {
      await this.checkFile(file);
    }
    
    if (this.errors.length > 0) {
      console.error('T,. Encoding-Lint: FEHLER gefunden:');
      this.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }
    
    if (this.warnings.length > 0) {
      console.warn('T,. Encoding-Lint: Warnungen:');
      this.warnings.forEach(warn => console.warn(`  - ${warn}`));
    }
    
    console.log('T,. Encoding-Lint: Alle Dateien sind UTF-8 compliant ✓');
    return { errors: this.errors, warnings: this.warnings };
  }

  /**
   * Prüft eine einzelne Datei
   */
  async checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Prüfe auf UTF-8 BOM
      if (content.charCodeAt(0) === 0xFEFF) {
        // UTF-8 BOM ist erlaubt
        return;
      }
      
      // Prüfe auf verbotene Zeichen (typisch für Latin-1)
      const latin1Pattern = /[Ã€ÃÃ‚ÃƒÃ„Ã…Ã†Ã‡ÃˆÃ‰ÃŠÃ‹ÃŒÃÃŽÃÃÃ'Ã"Ã•Ã–Ã—Ã˜Ã™ÃšÃ›ÃœÃžÃŸ]/;
      if (latin1Pattern.test(content)) {
        this.errors.push(`${filePath}: Enthält Latin-1 kodierte Zeichen (z.B. "fÃ¼r" statt "für")`);
      }
      
      // Prüfe HTML auf charset meta tag
      if (filePath.endsWith('.html')) {
        if (!content.includes('<meta charset="utf-8">') && !content.includes("<meta charset='utf-8'>")) {
          this.warnings.push(`${filePath}: Fehlt <meta charset="utf-8"> im <head>`);
        }
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.warnings.push(`${filePath}: Datei nicht gefunden`);
      } else {
        this.errors.push(`${filePath}: ${error.message}`);
      }
    }
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
      if (file.startsWith('.') || file === 'node_modules' || file === 'builds' || file === 'dist') {
        return;
      }
      
      if (stat.isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else {
        // Prüfe nur Text-Dateien
        const ext = path.extname(file);
        if (['.html', '.md', '.yaml', '.yml', '.json', '.js', '.ts', '.css', '.txt'].includes(ext)) {
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
  const lint = new EncodingLint();
  lint.lint().catch(error => {
    console.error('T,. Encoding-Lint: Fehler:', error);
    process.exit(1);
  });
}

module.exports = EncodingLint;

