// build.js - Simple Static Site Builder
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  src: path.resolve(__dirname, 'src'),
  dist: path.resolve(__dirname, 'dist')
};

// Helper function to create directories if they don't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Simple file copy without any processing
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`✅ Copied ${path.relative(process.cwd(), dest)}`);
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  ensureDir(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Process HTML files with simple template replacement
function processHTML() {
  const pagesDir = path.join(config.src, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  // Process root HTML files
  fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.html'))
    .forEach(file => {
      const srcPath = path.join(pagesDir, file);
      const destPath = path.join(config.dist, file);
      
      try {
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Simple template replacement
        content = content.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
          const [token, defaultValue] = key.trim().split('|').map(s => s.trim());
          switch(token) {
            case 'title': return defaultValue || 'Documentation';
            case 'year': return new Date().getFullYear();
            default: return `{{${key}}}`;
          }
        });
        
        ensureDir(path.dirname(destPath));
        fs.writeFileSync(destPath, content);
        console.log(`✅ Processed ${file}`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    });

  // Process industry pages
  const industriesDir = path.join(pagesDir, 'industries');
  if (fs.existsSync(industriesDir)) {
    fs.readdirSync(industriesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .forEach(dir => {
        const srcDir = path.join(industriesDir, dir.name);
        const destDir = path.join(config.dist, 'industries', dir.name);
        
        ensureDir(destDir);
        
        fs.readdirSync(srcDir)
          .filter(f => f.endsWith('.html'))
          .forEach(file => {
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, file);
            
            try {
              let content = fs.readFileSync(srcPath, 'utf8');
              
              // Simple template replacement
              content = content.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
                const [token, defaultValue] = key.trim().split('|').map(s => s.trim());
                switch(token) {
                  case 'title': return defaultValue || `${dir.name} Documentation`;
                  case 'year': return new Date().getFullYear();
                  default: return `{{${key}}}`;
                }
              });
              
              fs.writeFileSync(destPath, content);
              console.log(`✅ Processed industries/${dir.name}/${file}`);
            } catch (error) {
              console.error(`❌ Error processing industries/${dir.name}/${file}:`, error.message);
            }
          });
      });
  }
}

// Main build function
function build() {
  console.log('🚀 Starting build...');
  
  try {
    // Clear and recreate dist directory
    if (fs.existsSync(config.dist)) {
      fs.rmSync(config.dist, { recursive: true, force: true });
    }
    ensureDir(config.dist);
    
    // Copy all assets without processing
    const assets = ['images', 'css', 'js', 'fonts'];
    assets.forEach(asset => {
      const src = path.join(config.src, asset);
      const dest = path.join(config.dist, asset);
      if (fs.existsSync(src)) {
        copyDir(src, dest);
      }
    });
    
    // Process HTML files
    processHTML();
    
    console.log('\n✨ Build completed successfully!');
    console.log(`📁 Output directory: ${path.relative(process.cwd(), config.dist)}`);
    console.log('\nYou can now open the files directly in your browser or deploy the "dist" folder to any static hosting service.');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build();