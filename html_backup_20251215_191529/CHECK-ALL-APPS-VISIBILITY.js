#!/usr/bin/env node
/**
 * CHECK-ALL-APPS-VISIBILITY.js
 * Prüft alle HTML-Dateien auf Sichtbarkeitsprobleme
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const issues = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const fileIssues = [];

  // Prüfe auf display: none ohne media query
  const displayNoneMatches = content.match(/display\s*:\s*none[^}]*}/g);
  if (displayNoneMatches) {
    displayNoneMatches.forEach(match => {
      if (!match.includes('@media') && !match.includes('hidden') && !match.includes('file')) {
        fileIssues.push(`Potentiell verstecktes Element: ${match.substring(0, 50)}`);
      }
    });
  }

  // Prüfe auf visibility: hidden
  const visibilityHidden = content.match(/visibility\s*:\s*hidden/g);
  if (visibilityHidden && !content.includes('@media')) {
    fileIssues.push(`visibility: hidden gefunden (${visibilityHidden.length}x)`);
  }

  // Prüfe auf opacity: 0 ohne Animation
  const opacityZero = content.match(/opacity\s*:\s*0[^}]*}/g);
  if (opacityZero) {
    opacityZero.forEach(match => {
      if (!match.includes('animation') && !match.includes('transition') && !match.includes('@keyframes')) {
        fileIssues.push(`opacity: 0 ohne Animation: ${match.substring(0, 50)}`);
      }
    });
  }

  // Prüfe auf overflow: hidden auf body/html
  if (content.includes('body') && content.includes('overflow: hidden') && !content.includes('overflow-x: hidden')) {
    fileIssues.push('body hat overflow: hidden - könnte Scroll verhindern');
  }

  // Prüfe auf z-index: -1 oder niedriger
  const negativeZIndex = content.match(/z-index\s*:\s*-?\d+/g);
  if (negativeZIndex) {
    negativeZIndex.forEach(match => {
      const value = parseInt(match.match(/-?\d+/)[0]);
      if (value < 0) {
        fileIssues.push(`Negativer z-index: ${match}`);
      }
    });
  }

  // Prüfe ob body/html sichtbar ist
  if (!content.includes('<body') || content.includes('<body style="display:none')) {
    fileIssues.push('Body könnte versteckt sein');
  }

  if (fileIssues.length > 0) {
    issues.push({
      file: fileName,
      path: filePath,
      issues: fileIssues
    });
  }

  return fileIssues.length === 0;
}

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Überspringe node_modules, .git, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'TTT') {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔍 Prüfe alle HTML-Dateien auf Sichtbarkeitsprobleme...\n');

const htmlFiles = findHtmlFiles(rootDir);
let checked = 0;
let withIssues = 0;

htmlFiles.forEach(file => {
  checked++;
  const hasIssues = !checkFile(file);
  if (hasIssues) withIssues++;
});

console.log(`\n✅ Prüfung abgeschlossen:`);
console.log(`   - ${checked} Dateien geprüft`);
console.log(`   - ${withIssues} Dateien mit potentiellen Problemen`);
console.log(`   - ${issues.length} Dateien mit konkreten Issues\n`);

if (issues.length > 0) {
  console.log('⚠️  GEFUNDENE PROBLEME:\n');
  issues.forEach(({ file, path: filePath, issues: fileIssues }) => {
    console.log(`📄 ${file}`);
    console.log(`   Pfad: ${filePath.replace(rootDir, '.')}`);
    fileIssues.forEach(issue => {
      console.log(`   ⚠️  ${issue}`);
    });
    console.log('');
  });
  
  // Schreibe Report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: checked,
    filesWithIssues: withIssues,
    issues: issues.map(({ file, path: filePath, issues: fileIssues }) => ({
      file,
      path: filePath.replace(rootDir, '.'),
      issues: fileIssues
    }))
  };
  
  fs.writeFileSync(
    path.join(rootDir, 'VISIBILITY-CHECK-REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📊 Report gespeichert: VISIBILITY-CHECK-REPORT.json');
  process.exit(1);
} else {
  console.log('✅ Keine Sichtbarkeitsprobleme gefunden!');
  process.exit(0);
}








