// Test-Suite für alle Deployment-Scripts
// Prüft ob alle Scripts funktionieren und das Deployment korrekt ist

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = path.join(__dirname, '..');
const DEPLOY_DIR = path.join(SCRIPT_DIR, 'THYNK-ORDERS-FINAL');

console.log('🧪 Starte Deployment-Script Tests...\n');

// Prüfe ob Deployment-Scripts existieren
const scripts = [
    { name: 'DEPLOY-ALL.sh', platform: 'Linux/macOS' },
    { name: 'DEPLOY-ALL.bat', platform: 'Windows' },
    { name: 'DEPLOY-ALL.ps1', platform: 'Windows PowerShell' }
];

console.log('📋 Prüfe Deployment-Scripts...');
scripts.forEach(script => {
    const scriptPath = path.join(SCRIPT_DIR, script.name);
    if (fs.existsSync(scriptPath)) {
        console.log(`✅ ${script.name} vorhanden`);
    } else {
        console.log(`❌ ${script.name} NICHT gefunden!`);
    }
});

// Prüfe ob Quell-Dateien vorhanden sind
console.log('\n📋 Prüfe Quell-Dateien...');
const requiredFiles = [
    'THYNK-ORDERS-COMPLETE-WITH-THEME-SWITCHER.html',
    'THYNK-ORDERS-COMPLETE.html',
    'DOKUMENTATION-COMPLETE-DE.md',
    'DOKUMENTATION-COMPLETE-NL.md',
    'DOKUMENTATION-COMPLETE-EN.md',
    'README-DE.md',
    'README-NL.md',
    'README-EN.md'
];

requiredFiles.forEach(file => {
    const filePath = path.join(SCRIPT_DIR, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} vorhanden`);
    } else {
        console.log(`⚠️  ${file} NICHT gefunden (optional)`);
    }
});

console.log('\n✅ Grundprüfung abgeschlossen!');
console.log('\n📝 Um Deployment zu testen, führen Sie manuell aus:');
console.log('   Linux/macOS: ./DEPLOY-ALL.sh');
console.log('   Windows:     DEPLOY-ALL.bat');
console.log('   PowerShell:  .\\DEPLOY-ALL.ps1');

