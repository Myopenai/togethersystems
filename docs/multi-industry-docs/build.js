// build.js - Complete build system
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const chokidar = require('chokidar');

// Configuration
const config = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  port: 3000,
  watch: process.argv.includes('--watch')
};

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy files recursively
function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

// Process SCSS to CSS
async function processStyles() {
  try {
    const sass = require('sass');
    const postcss = require('postcss');
    const autoprefixer = require('autoprefixer');
    const srcFile = path.join(config.src, 'scss', 'main.scss');
    const destFile = path.join(config.dist, 'css', 'styles.min.css');
    const result = sass.renderSync({ file: srcFile, outputStyle: 'compressed' });
    const processed = await postcss([autoprefixer()])
      .process(result.css, { from: srcFile, to: destFile });
    ensureDir(path.dirname(destFile));
    fs.writeFileSync(destFile, processed.css);
    console.log(`âœ… Built ${path.relative(process.cwd(), destFile)}`);
  } catch (error) {
    console.error('Error processing styles:', error.message);
  }
}

// Minify JavaScript
async function processScripts() {
  try {
    const { minify } = require('terser');
    const jsDir = path.join(config.src, 'js');
    if (!fs.existsSync(jsDir)) return;
    
    const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const srcPath = path.join(jsDir, file);
      const destPath = path.join(config.dist, 'js', file.replace(/\.js$/, '.min.js'));
      const code = fs.readFileSync(srcPath, 'utf8');
      
      // Skip minification for files that contain HTML/JSX to prevent errors
      if (code.includes('</') || code.includes('/>') || code.includes('<!')) {
        console.log(`⚠️  Skipping minification of ${file} (contains HTML/JSX)`);
        ensureDir(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath);
        console.log(`âœ… Copied ${file} (not minified)`);
      } else {
        try {
          const result = await minify(code, { 
            compress: true, 
            mangle: true, 
            format: { 
              comments: false 
            } 
          });
          ensureDir(path.dirname(destPath));
          fs.writeFileSync(destPath, result.code);
          console.log(`âœ… Minified ${file}`);
        } catch (minifyError) {
          console.warn(`⚠️  Could not minify ${file}, copying as-is:`, minifyError.message);
          ensureDir(path.dirname(destPath));
          fs.copyFileSync(srcPath, destPath);
          console.log(`âœ… Copied ${file} (not minified)`);
        }
      }
    }
  } catch (error) {
    console.error('Error processing scripts:', error.message);
  }
}

// Process HTML files
function processHTML() {
  const pagesDir = path.join(config.src, 'pages');
  if (!fs.existsSync(pagesDir)) return;
  
  fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.html'))
    .forEach(file => {
      try {
        const srcPath = path.join(pagesDir, file);
        const destPath = path.join(config.dist, file);
        let content = fs.readFileSync(srcPath, 'utf8');
        
        content = content.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
          const [token, ...rest] = key.trim().split('|').map(t => t.trim());
          switch(token) {
            case 'title': return rest[0] || 'Documentation';
            case 'year': return new Date().getFullYear();
            default: return `{{${key}}}`;
          }
        });
        
        ensureDir(path.dirname(destPath));
        fs.writeFileSync(destPath, content);
        console.log(`âœ… Processed ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
      }
    });
}

// Copy static assets
function copyAssets() {
  ['images', 'fonts', 'content'].forEach(dir => {
    const src = path.join(config.src, dir);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(config.dist, dir));
      console.log(`ðŸ“ Copied ${dir}/`);
    }
  });
}

// Find an available port
function getAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const server = require('http').createServer();
    server.on('error', () => {
      // If port is in use, try the next one
      getAvailablePort(startPort + 1).then(resolve).catch(reject);
    });
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

// IBM Web Standards compliant server configuration
async function startServer() {
  const port = await getAvailablePort(config.port);
  config.port = port; // Update the config with the actual port being used
  
  const mimeTypes = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.map': 'application/octet-stream'
  };

  const server = http.createServer((req, res) => {
    // IBM Standard: Normalize URL
    let urlPath = new URL(req.url, 'http://localhost:').pathname;
    
    // IBM Standard: Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    // IBM Standard: Handle root and default documents
    if (urlPath.endsWith('/')) {
      urlPath = urlPath + 'index.html';
    } else if (!path.extname(urlPath)) {
      urlPath = urlPath + '.html';
    }
    
    // IBM Standard: Security - Prevent directory traversal
    const absolutePath = path.join(config.dist, path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, ''));
    
    // Check if file exists
    fs.access(absolutePath, fs.constants.F_OK, (err) => {
      if (err) {
        // IBM Standard: Custom 404 page
        const notFoundPath = path.join(config.dist, '404.html');
        if (fs.existsSync(notFoundPath)) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          fs.createReadStream(notFoundPath).pipe(res);
        } else {
          // Fallback 404 response
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
          res.end('404 Not Found - The requested resource was not found.');
        }
        return;
      }

      // IBM Standard: Set proper content type
      const ext = path.extname(absolutePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // IBM Standard: Set cache control
      const isStatic = /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(ext);
      const cacheControl = isStatic 
        ? 'public, max-age=31536000, immutable' 
        : 'no-cache, no-store, must-revalidate';
      
      res.setHeader('Cache-Control', cacheControl);
      
      // IBM Standard: Set last modified header
      const stats = fs.statSync(absolutePath);
      const lastModified = stats.mtime.toUTCString();
      res.setHeader('Last-Modified', lastModified);
      
      // IBM Standard: Handle If-Modified-Since
      const ifModifiedSince = req.headers['if-modified-since'];
      if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
        res.writeHead(304);
        res.end();
        return;
      }
      
      // Stream the file
      const stream = fs.createReadStream(absolutePath);
      
      // Handle errors
      stream.on('error', (error) => {
        console.error('Error serving file:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
          res.end('500 Internal Server Error');
        }
      });
      
      // Set headers and pipe the file
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Last-Modified': lastModified
      });
      
      stream.pipe(res);
    });
  });
  
  // IBM Standard: Error handling
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  // Start the server
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('\nAvailable routes:');
    console.log('  - /');
    console.log('  - /industries/');
    console.log('  - /industries/ecommerce/');
    console.log('  - /404 (Error page)');
  });
  
  return server;
}

// Watch for changes
function watchFiles() {
  console.log('ðŸ‘€ Watching for changes...');
  const watcher = chokidar.watch([
    path.join(config.src, '**/*'),
    '!' + path.join(config.src, '**/*.swp'),
    '!' + path.join(config.src, '**/*.swo'),
    '!' + path.join(config.src, '**/.*')
  ], { ignored: /(^|[/\\])\../, ignoreInitial: true });

  const rebuild = (path) => {
    console.log(`\nðŸ”„ Detected changes in ${path}`);
    build();
  };

  watcher.on('change', rebuild).on('add', rebuild).on('unlink', rebuild);
}

// Main build function
async function build() {
  console.log('ðŸš€ Starting build...');
  
  // Clear dist directory
  if (fs.existsSync(config.dist)) {
    fs.rmSync(config.dist, { recursive: true, force: true });
  }
  ensureDir(config.dist);
  
  // Run build steps
  await Promise.all([
    copyAssets(),
    processStyles(),
    processScripts(),
    processHTML()
  ]);
  
  console.log('âœ¨ Build completed!');
}

// Run the build
async function main() {
  try {
    // Check and install dependencies if needed
    const requiredDeps = {
      'sass': '^1.67.0',
      'terser': '^5.19.2',
      'chokidar': '^3.5.3',
      'postcss': '^8.4.31',
      'autoprefixer': '^10.4.16'
    };

    const pkgPath = path.join(__dirname, 'package.json');
    let pkg = { devDependencies: {} };
    
    if (fs.existsSync(pkgPath)) {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.devDependencies = pkg.devDependencies || {};
    }

    let needInstall = false;
    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!pkg.devDependencies[dep]) {
        console.log(`âž¡ï¸ Adding ${dep}@${version}...`);
        pkg.devDependencies[dep] = version;
        needInstall = true;
      }
    }

    if (needInstall) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('ðŸ“¦ Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Initial build
    await build();
    
    // Start server and watch if needed
    if (config.watch) {
      await startServer();
      watchFiles();
      
      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\nðŸ‘‹ Shutting down...');
        process.exit();
      });
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Start the build process
main();