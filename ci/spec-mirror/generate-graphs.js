// Spec Mirror - Generate Dependency and AST Graphs
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const graphsDir = path.join(__dirname, 'graphs');
if (!fs.existsSync(graphsDir)) {
  fs.mkdirSync(graphsDir, { recursive: true });
}

function generateDependencyGraph() {
  console.log('Generating dependency graph...');
  
  const graph = {
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    modules: {},
    dependencies: []
  };
  
  // Scan for JavaScript/TypeScript files
  const srcDirs = [
    'modular-fabrikage/js',
    'xxxxxxls-fabrikage',
    'js',
    'ci'
  ];
  
  for (const dir of srcDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      scanDirectory(fullPath, graph);
    }
  }
  
  // Save graph
  const graphFile = path.join(graphsDir, 'dependency-graph.json');
  fs.writeFileSync(graphFile, JSON.stringify(graph, null, 2));
  
  console.log(`Dependency graph generated: ${graphFile}`);
  return graph;
}

function scanDirectory(dir, graph) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(fullPath, graph);
    } else if (file.isFile() && /\.(js|ts)$/.test(file.name)) {
      const relativePath = path.relative(process.cwd(), fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract module info
      const moduleInfo = {
        path: relativePath,
        size: content.length,
        lines: content.split('\n').length,
        imports: extractImports(content),
        exports: extractExports(content)
      };
      
      graph.modules[relativePath] = moduleInfo;
      
      // Extract dependencies
      for (const imp of moduleInfo.imports) {
        graph.dependencies.push({
          from: relativePath,
          to: resolveImport(imp, relativePath),
          type: 'import'
        });
      }
    }
  }
}

function extractImports(content) {
  const imports = [];
  
  // ES6 imports
  const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.push(match[1] || match[0]);
  }
  
  // CommonJS requires
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function extractExports(content) {
  const exports = [];
  
  // ES6 exports
  const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  // CommonJS exports
  const moduleExportRegex = /module\.exports\s*=\s*(\w+)/g;
  while ((match = moduleExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  return exports;
}

function resolveImport(importPath, fromFile) {
  // Simple resolution - in production, use proper module resolution
  if (importPath.startsWith('.')) {
    const dir = path.dirname(fromFile);
    return path.join(dir, importPath).replace(/\\/g, '/');
  }
  return importPath;
}

function generateASTGraph() {
  console.log('Generating AST graph...');
  
  // This would use a proper AST parser in production
  // For now, we'll create a simplified version
  const astGraph = {
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    files: {}
  };
  
  // Scan for source files
  const srcDirs = [
    'modular-fabrikage/js',
    'xxxxxxls-fabrikage',
    'js'
  ];
  
  for (const dir of srcDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      scanForAST(fullPath, astGraph);
    }
  }
  
  const astFile = path.join(graphsDir, 'ast-graph.json');
  fs.writeFileSync(astFile, JSON.stringify(astGraph, null, 2));
  
  console.log(`AST graph generated: ${astFile}`);
  return astGraph;
}

function scanForAST(dir, graph) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      scanForAST(fullPath, graph);
    } else if (file.isFile() && /\.(js|ts)$/.test(file.name)) {
      const relativePath = path.relative(process.cwd(), fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Extract basic structure
      graph.files[relativePath] = {
        functions: extractFunctions(content),
        classes: extractClasses(content),
        variables: extractVariables(content)
      };
    }
  }
}

function extractFunctions(content) {
  const functions = [];
  const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>|(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{)/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    functions.push(match[1] || match[2] || match[3]);
  }
  return functions;
}

function extractClasses(content) {
  const classes = [];
  const classRegex = /class\s+(\w+)/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }
  return classes;
}

function extractVariables(content) {
  const variables = [];
  const varRegex = /(?:const|let|var)\s+(\w+)\s*=/g;
  let match;
  while ((match = varRegex.exec(content)) !== null) {
    variables.push(match[1]);
  }
  return variables;
}

// Generate both graphs
console.log('═══════════════════════════════════════════════════════════');
console.log('  SPEC MIRROR - GRAPH GENERATION');
console.log('═══════════════════════════════════════════════════════════\n');

generateDependencyGraph();
generateASTGraph();

console.log('\n✅ Graph generation complete');



