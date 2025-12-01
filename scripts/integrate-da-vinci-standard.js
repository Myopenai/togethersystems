/**
 * Integrate Da Vinci XXXXXXL Enterprise Standard into all HTML files
 * Together Systems - Auto-Integration Script
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');

const CSS_LINK = '<link rel="stylesheet" href="./css/da-vinci-xxxxxl-enterprise-standard.css">';
const JS_SCRIPT = '<script src="./css/da-vinci-enterprise-standard-init.js"></script>';

function findHTMLFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findHTMLFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function integrateDaVinciStandard(htmlFile) {
  try {
    let content = fs.readFileSync(htmlFile, 'utf-8');

    // Skip if already integrated
    if (content.includes('da-vinci-xxxxxl-enterprise-standard.css')) {
      console.log(`⏭️  Skipped (already integrated): ${htmlFile}`);
      return;
    }

    let modified = false;

    // Add CSS link in <head>
    if (!content.includes('da-vinci-xxxxxl-enterprise-standard.css')) {
      // Find </head> tag and insert before it
      if (content.includes('</head>')) {
        content = content.replace('</head>', `  ${CSS_LINK}\n</head>`);
        modified = true;
      }
    }

    // Add JS script before </body>
    if (!content.includes('da-vinci-enterprise-standard-init.js')) {
      if (content.includes('</body>')) {
        content = content.replace('</body>', `  ${JS_SCRIPT}\n</body>`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(htmlFile, content, 'utf-8');
      console.log(`✅ Integrated: ${htmlFile}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${htmlFile}:`, error.message);
    return false;
  }
}

// Main execution
const rootDir = process.cwd();
console.log(`🔍 Searching for HTML files in: ${rootDir}\n`);

const htmlFiles = findHTMLFiles(rootDir);
console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

let integratedCount = 0;

htmlFiles.forEach(file => {
  if (integrateDaVinciStandard(file)) {
    integratedCount++;
  }
});

console.log(`\n✅ Integration complete!`);
console.log(`📊 Integrated: ${integratedCount} files`);
console.log(`⏭️  Skipped: ${htmlFiles.length - integratedCount} files`);

