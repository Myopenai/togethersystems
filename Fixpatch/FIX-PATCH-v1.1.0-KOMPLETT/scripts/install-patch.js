/**
 * TOGETHERSYSTEMS - Patch Installation Script
 * 
 * Automatically applies all fixes to the togethersystems repository
 * Run with: node scripts/install-patch.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PARENT_DIR = path.join(ROOT_DIR, '..');

console.log('═'.repeat(60));
console.log('  TOGETHERSYSTEMS - Fix Patch Installer v1.0.0');
console.log('═'.repeat(60));
console.log('');

const tasks = [];
let completed = 0;
let failed = 0;

function copyFile(src, dest, description) {
  tasks.push({ src, dest, description });
}

function runTasks() {
  console.log(`📦 Installing ${tasks.length} patch files...\n`);
  
  for (const task of tasks) {
    try {
      const srcPath = path.join(ROOT_DIR, task.src);
      const destPath = path.join(PARENT_DIR, task.dest);
      
      // Create directory if needed
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Backup existing file if it exists
      if (fs.existsSync(destPath)) {
        const backupPath = destPath + '.backup-' + Date.now();
        fs.copyFileSync(destPath, backupPath);
        console.log(`  📁 Backed up: ${task.dest}`);
      }
      
      // Copy new file
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Installed: ${task.dest}`);
      completed++;
      
    } catch (error) {
      console.log(`  ❌ Failed: ${task.dest} - ${error.message}`);
      failed++;
    }
  }
}

// Define files to install
copyFile('sw-fixed.js', 'sw.js', 'Enhanced Service Worker');
copyFile('offline.html', 'offline.html', 'Offline fallback page');
copyFile('tests/link-checker.spec.ts', 'businessconnecthub-playwright-tests-full/tests/link-checker.spec.ts', 'Link checker test');
copyFile('tests/pool-entry-fixed.spec.ts', 'businessconnecthub-playwright-tests-full/tests/pool-entry-fixed.spec.ts', 'Fixed pool entry test');

// Run installation
runTasks();

// Run auto-fix script
console.log('\n🔧 Running automatic link fixer...\n');
try {
  require('./auto-fix-links.js');
} catch (error) {
  console.log('⚠️  Could not run auto-fix:', error.message);
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log(`  Installation Complete!`);
console.log(`  ✅ Installed: ${completed} files`);
if (failed > 0) {
  console.log(`  ❌ Failed: ${failed} files`);
}
console.log('═'.repeat(60));

console.log('\n📋 Next Steps:');
console.log('1. Review the changes');
console.log('2. Run: npm install');
console.log('3. Run: npm run test');
console.log('4. If tests pass, commit and push');
console.log('');
console.log('🔗 Manual steps (add to HTML files):');
console.log('   In <head>: <link rel="stylesheet" href="assets/css/navigation.css">');
console.log('   Before </body>: <script src="assets/js/navigation.js"></script>');
console.log('');

