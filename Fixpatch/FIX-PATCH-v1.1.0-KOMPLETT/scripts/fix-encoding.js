/**
 * TOGETHERSYSTEMS - Encoding-Fixer
 * 
 * Behebt UTF-8 Encoding-Probleme in allen HTML-Dateien
 * Run with: node scripts/fix-encoding.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PARENT_DIR = path.join(ROOT_DIR, '..');

// Finde alle HTML-Dateien
function findHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findHtmlFiles(fullPath, files);
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Prüfe und fixe Encoding
function fixEncoding(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Prüfe ob charset vorhanden
  if (!content.includes('charset="UTF-8"') && !content.includes('charset=UTF-8')) {
    console.log(`  ⚠️ Kein charset: ${path.basename(filePath)}`);
    
    // Füge charset hinzu
    if (content.includes('<head>')) {
      content = content.replace('<head>', '<head>\n  <meta charset="UTF-8">');
      modified = true;
    } else if (content.includes('<HEAD>')) {
      content = content.replace('<HEAD>', '<HEAD>\n  <meta charset="UTF-8">');
      modified = true;
    }
  }
  
  // Prüfe auf kaputte Zeichen und versuche zu reparieren
  const replacements = {
    'ä': 'ä',
    'ö': 'ö',
    'ü': 'ü',
    'ß': 'ß',
    'Ä': 'Ä',
    'Ö': 'Ö',
    'Ü': 'Ü',
    'â€"': '–',
    ''': ''',
    ''': ''',
    '"': '"',
    'â€': '"',
  };
  
  for (const [broken, fixed] of Object.entries(replacements)) {
    if (content.includes(broken)) {
      content = content.split(broken).join(fixed);
      modified = true;
      console.log(`  ✓ Ersetzt: ${broken} → ${fixed}`);
    }
  }
  
  if (modified) {
    // Backup erstellen
    fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));
    
    // Neue Version speichern
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  📝 Gespeichert: ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

// Hauptprogramm
console.log('═'.repeat(60));
console.log('  TOGETHERSYSTEMS - Encoding-Fixer');
console.log('═'.repeat(60));
console.log('');

// Suche in Parent-Verzeichnis (das Repository)
console.log('📁 Suche HTML-Dateien...\n');

const htmlFiles = findHtmlFiles(PARENT_DIR);
console.log(`Gefunden: ${htmlFiles.length} HTML-Dateien\n`);

let fixedCount = 0;

for (const file of htmlFiles) {
  const relativePath = path.relative(PARENT_DIR, file);
  console.log(`📄 Prüfe: ${relativePath}`);
  
  if (fixEncoding(file)) {
    fixedCount++;
  }
}

console.log('\n' + '═'.repeat(60));
console.log(`  ✅ Fertig: ${fixedCount} Dateien repariert`);
console.log('═'.repeat(60));

if (fixedCount > 0) {
  console.log('\n⚠️ Backups wurden erstellt (.backup-Dateien)');
  console.log('   Prüfe die Änderungen und lösche Backups wenn OK.');
}

