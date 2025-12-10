// Model Ensemble - Route Changes to Specialized Models
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const ModelRouter = require('./model-router');

const router = new ModelRouter();

// Get changed files from git
function getChangedFiles() {
  const { execSync } = require('child_process');
  
  try {
    // Get changed files in last commit or PR
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' })
      .split('\n')
      .filter(line => line.trim());
    
    return changedFiles;
  } catch (error) {
    // Fallback: get all files
    console.warn('Could not get changed files from git, scanning all files...');
    return scanAllFiles();
  }
}

function scanAllFiles() {
  const files = [];
  const srcDirs = [
    'modular-fabrikage',
    'xxxxxxls-fabrikage',
    'js',
    'ci'
  ];
  
  for (const dir of srcDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      scanDirectory(fullPath, files);
    }
  }
  
  return files;
}

function scanDirectory(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      scanDirectory(fullPath, files);
    } else if (entry.isFile() && /\.(js|ts|html|css|json|yaml|yml|ps1|md)$/.test(entry.name)) {
      files.push(path.relative(process.cwd(), fullPath));
    }
  }
}

// Route each changed file
function routeChanges() {
  const changedFiles = getChangedFiles();
  const routes = {};
  
  console.log(`Routing ${changedFiles.length} changed files...\n`);
  
  for (const file of changedFiles) {
    const route = router.route(file);
    routes[file] = route;
    
    console.log(`${file}`);
    console.log(`  → Category: ${route.category}`);
    console.log(`  → Model: ${route.model}`);
    console.log(`  → Constraints: ${route.constraints.length}`);
    console.log('');
  }
  
  // Save routes
  const routesFile = path.join(__dirname, 'routes.json');
  fs.writeFileSync(routesFile, JSON.stringify(routes, null, 2));
  
  console.log(`Routes saved to: ${routesFile}`);
  return routes;
}

routeChanges();



