import { build } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';
import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import { createRequire } from 'module';
import { WebhookClient } from 'discord-webhook-node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const cacheDir = path.join(rootDir, '.vite/cache');
const buildDir = path.join(rootDir, 'dist');
const require = createRequire(import.meta.url);

// Load environment variables
const env = process.env.NODE_ENV || 'production';

// Webhook for build notifications
const webhookUrl = process.env.BUILD_WEBHOOK_URL;
const webhook = webhookUrl ? new WebhookClient(webhookUrl) : null;

// Track build metrics
const buildStart = performance.now();
let buildStats = {
  startTime: new Date().toISOString(),
  duration: 0,
  cache: {
    hits: 0,
    misses: 0
  },
  files: {
    processed: 0,
    cached: 0,
    built: 0
  },
  errors: []
};

// Ensure cache directory exists
fs.ensureDirSync(cacheDir);

// Clean previous build
fs.emptyDirSync(buildDir);

// Git info for build metadata
let gitInfo = {
  branch: 'unknown',
  commit: 'unknown',
  author: 'unknown',
  message: 'No commit message'
};

try {
  gitInfo.branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  gitInfo.commit = execSync('git rev-parse HEAD').toString().trim();
  gitInfo.author = execSync('git log -1 --pretty=format:'%an <%ae>').toString().trim();
  gitInfo.message = execSync('git log -1 --pretty=format:%s').toString().trim();
} catch (e) {
  console.warn('Could not retrieve git info:', e.message);
}

// Send build start notification
async function notifyBuildStart() {
  if (!webhook) return;
  
  try {
    await webhook.send({
      username: 'Build Bot',
      avatar_url: 'https://i.imgur.com/4M34hi2.png',
      embeds: [{
        title: '🚀 Build Started',
        color: 0x3498db,
        fields: [
          { name: 'Branch', value: gitInfo.branch, inline: true },
          { name: 'Commit', value: `\`${gitInfo.commit.slice(0, 7)}\``, inline: true },
          { name: 'Environment', value: env, inline: true },
          { name: 'Author', value: gitInfo.author, inline: true },
          { name: 'Message', value: `\`${gitInfo.message}\``, inline: false }
        ],
        timestamp: new Date()
      }]
    });
  } catch (e) {
    console.error('Failed to send build start notification:', e);
  }
}

// Send build complete notification
async function notifyBuildComplete(success = true) {
  if (!webhook) return;
  
  const buildTime = ((performance.now() - buildStart) / 1000).toFixed(2);
  const cacheHitRate = buildStats.cache.hits / (buildStats.cache.hits + buildStats.cache.misses) * 100;
  
  try {
    await webhook.send({
      username: 'Build Bot',
      avatar_url: 'https://i.imgur.com/4M34hi2.png',
      embeds: [{
        title: success ? '✅ Build Succeeded' : '❌ Build Failed',
        color: success ? 0x2ecc71 : 0xe74c3c,
        fields: [
          { name: 'Status', value: success ? 'Success' : 'Failed', inline: true },
          { name: 'Duration', value: `${buildTime}s`, inline: true },
          { name: 'Cache Hit Rate', value: `${cacheHitRate.toFixed(1)}%`, inline: true },
          { name: 'Files Processed', value: buildStats.files.processed.toString(), inline: true },
          { name: 'Files Cached', value: buildStats.files.cached.toString(), inline: true },
          { name: 'Files Built', value: buildStats.files.built.toString(), inline: true },
          ...(buildStats.errors.length > 0 ? [
            { name: 'Errors', value: `\`\`\`\n${buildStats.errors.slice(0, 3).join('\n')}${buildStats.errors.length > 3 ? '\n...and more' : ''}\n\`\`\`` }
          ] : [])
        ],
        timestamp: new Date()
      }]
    });
  } catch (e) {
    console.error('Failed to send build complete notification:', e);
  }
}

// Main build function
async function runBuild() {
  try {
    await notifyBuildStart();
    
    console.log('🚀 Starting incremental build...');
    console.log(`📦 Environment: ${env}`);
    console.log(`🌿 Branch: ${gitInfo.branch}`);
    console.log(`🔑 Commit: ${gitInfo.commit}`);
    
    // Run Vite build
    await build({
      configFile: path.join(rootDir, 'vite.config.js'),
      logLevel: 'info',
      build: {
        // Enable incremental builds
        incremental: true,
        // Enable build caching
        cache: true,
        // Output directory
        outDir: buildDir,
        // Source maps
        sourcemap: true,
        // Minification
        minify: 'terser',
        // Enable brotli compression
        brotliSize: true,
      },
      plugins: [
        // Custom plugin to track build stats
        {
          name: 'build-stats',
          transform(code, id) {
            buildStats.files.processed++;
            
            // Check if file is from node_modules
            if (id.includes('node_modules')) {
              buildStats.files.cached++;
              buildStats.cache.hits++;
            } else {
              buildStats.files.built++;
              buildStats.cache.misses++;
            }
            
            return null; // Don't transform the code
          },
          // Handle build errors
          buildError(error) {
            buildStats.errors.push(error.message);
            console.error('Build error:', error);
          }
        }
      ]
    });
    
    // Calculate build duration
    buildStats.duration = (performance.now() - buildStart) / 1000;
    
    console.log(`\n✨ Build completed in ${buildStats.duration.toFixed(2)}s`);
    console.log(`📊 Cache hit rate: ${(buildStats.cache.hits / (buildStats.cache.hits + buildStats.cache.misses) * 100).toFixed(1)}%`);
    console.log(`📦 Files processed: ${buildStats.files.processed}`);
    console.log(`💾 Files from cache: ${buildStats.files.cached}`);
    console.log(`🔨 Files built: ${buildStats.files.built}`);
    
    // Save build stats
    fs.writeJsonSync(
      path.join(buildDir, 'build-stats.json'),
      { ...buildStats, git: gitInfo, timestamp: new Date().toISOString() },
      { spaces: 2 }
    );
    
    // Notify success
    await notifyBuildComplete(true);
    
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error);
    buildStats.errors.push(error.message);
    await notifyBuildComplete(false);
    process.exit(1);
  }
}

// Run the build
runBuild().catch(console.error);
