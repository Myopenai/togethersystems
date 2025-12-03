/**
 * System Status Check - All Servers
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * Branding: T,.&T,,.&T,,,.(C)TEL1.NL
 * 
 * Prüft Status aller Server, Services, Databases
 */

class SystemStatusCheck {
  constructor() {
    this.status = {
      timestamp: new Date().toISOString(),
      servers: {},
      databases: {},
      storage: {},
      endpoints: {},
      overall: 'unknown'
    };
  }

  /**
   * Vollständiger System-Check
   */
  async checkAll() {
    console.log('🔍 SYSTEM STATUS CHECK - Checking All Servers...\n');

    try {
      // 1. Cloudflare Workers Status
      await this.checkCloudflareWorkers();

      // 2. D1 Database Status
      await this.checkD1Database();

      // 3. R2 Storage Status
      await this.checkR2Storage();

      // 4. GitHub Pages Status
      await this.checkGitHubPages();

      // 5. Frontend Assets Status
      await this.checkFrontendAssets();

      // 6. API Endpoints Status
      await this.checkAPIEndpoints();

      // 7. Overall Status berechnen
      this.calculateOverallStatus();

      // 8. Report generieren
      return this.generateReport();

    } catch (error) {
      console.error('❌ System Check Error:', error);
      this.status.overall = 'error';
      return this.generateReport();
    }
  }

  /**
   * Cloudflare Workers Status
   */
  async checkCloudflareWorkers() {
    console.log('☁️ Checking Cloudflare Workers...');

    const workers = [
      { name: 'TELBANK Transfers', path: 'functions/api/telbank/transfers.js' },
      { name: 'Presence Verify', path: 'functions/api/presence/verify.js' },
      { name: 'Presence Heartbeat', path: 'functions/api/presence/heartbeat.js' },
      { name: 'Presence Match', path: 'functions/api/presence/match.js' },
      { name: 'WebSocket Signaling', path: 'functions/ws.js' }
    ];

    this.status.servers.workers = [];

    for (const worker of workers) {
      try {
        // Prüfe ob Datei existiert
        const fs = await import('fs');
        const path = await import('path');
        const workerPath = path.join(process.cwd(), '..', worker.path);
        const exists = fs.existsSync(workerPath);

        if (exists) {
          // Prüfe ob deployed (via wrangler)
          const { execSync } = await import('child_process');
          try {
            execSync(`wrangler deployments list --name together-systems 2>&1`, { encoding: 'utf-8' });
            this.status.servers.workers.push({
              name: worker.name,
              path: worker.path,
              status: 'deployed',
              fileExists: true
            });
            console.log(`  ✅ ${worker.name}: Deployed`);
          } catch (e) {
            this.status.servers.workers.push({
              name: worker.name,
              path: worker.path,
              status: 'file_exists_not_deployed',
              fileExists: true
            });
            console.log(`  ⚠️ ${worker.name}: File exists but not deployed`);
          }
        } else {
          this.status.servers.workers.push({
            name: worker.name,
            path: worker.path,
            status: 'missing',
            fileExists: false
          });
          console.log(`  ❌ ${worker.name}: File missing`);
        }
      } catch (error) {
        this.status.servers.workers.push({
          name: worker.name,
          path: worker.path,
          status: 'error',
          error: error.message
        });
        console.log(`  ❌ ${worker.name}: Error - ${error.message}`);
      }
    }
  }

  /**
   * D1 Database Status
   */
  async checkD1Database() {
    console.log('\n💾 Checking D1 Database...');

    try {
      const { execSync } = await import('child_process');
      const { existsSync } = await import('fs');
      
      const schemaFiles = [
        'TELBANK/d1-schema-telbank-negative-assets.sql',
        'd1-schema.sql'
      ];

      this.status.databases.d1 = [];

      for (const schemaFile of schemaFiles) {
        const schemaPath = require('path').join(process.cwd(), '..', schemaFile);
        const exists = existsSync(schemaPath);

        this.status.databases.d1.push({
          schema: schemaFile,
          fileExists: exists,
          status: exists ? 'schema_ready' : 'missing'
        });

        if (exists) {
          console.log(`  ✅ Schema: ${schemaFile} - Ready`);
        } else {
          console.log(`  ❌ Schema: ${schemaFile} - Missing`);
        }
      }

      // Prüfe ob Database existiert
      try {
        execSync('wrangler d1 list 2>&1', { encoding: 'utf-8' });
        console.log('  ✅ D1 Database: Accessible');
        this.status.databases.d1Status = 'accessible';
      } catch (e) {
        console.log('  ⚠️ D1 Database: Cannot verify (login required?)');
        this.status.databases.d1Status = 'unknown';
      }

    } catch (error) {
      console.log(`  ❌ D1 Database Check Error: ${error.message}`);
      this.status.databases.d1Status = 'error';
    }
  }

  /**
   * R2 Storage Status
   */
  async checkR2Storage() {
    console.log('\n🗄️ Checking R2 Storage...');

    const buckets = [
      'together-systems-assets',
      'together-systems-uploads',
      'together-systems-backups'
    ];

    this.status.storage.r2 = [];

    for (const bucket of buckets) {
      try {
        const { execSync } = await import('child_process');
        // Prüfe ob Bucket existiert
        execSync(`wrangler r2 bucket list 2>&1 | grep ${bucket}`, { encoding: 'utf-8' });
        this.status.storage.r2.push({
          name: bucket,
          status: 'exists'
        });
        console.log(`  ✅ Bucket: ${bucket} - Exists`);
      } catch (e) {
        this.status.storage.r2.push({
          name: bucket,
          status: 'unknown_or_missing'
        });
        console.log(`  ⚠️ Bucket: ${bucket} - Cannot verify`);
      }
    }
  }

  /**
   * GitHub Pages Status
   */
  async checkGitHubPages() {
    console.log('\n📄 Checking GitHub Pages...');

    const pagesFiles = [
      'index.html',
      'manifest-forum.html',
      'manifest-portal.html',
      'honeycomb.html',
      'legal-hub.html',
      'TELBANK/index.html',
      'TELADIA/teladia-portal-redesign.html'
    ];

    this.status.servers.githubPages = {
      files: [],
      url: 'https://myopenai.github.io/togethersystems/',
      status: 'unknown'
    };

    const { existsSync } = await import('fs');
    const path = await import('path');

    for (const file of pagesFiles) {
      const filePath = path.join(process.cwd(), '..', file);
      const exists = existsSync(filePath);

      this.status.servers.githubPages.files.push({
        file,
        exists,
        status: exists ? 'ready' : 'missing'
      });

      if (exists) {
        console.log(`  ✅ ${file} - Ready`);
      } else {
        console.log(`  ❌ ${file} - Missing`);
      }
    }

    // Prüfe GitHub Pages URL (simple check)
    try {
      const response = await fetch(this.status.servers.githubPages.url);
      if (response.ok) {
        this.status.servers.githubPages.status = 'online';
        console.log(`  ✅ GitHub Pages: Online at ${this.status.servers.githubPages.url}`);
      } else {
        this.status.servers.githubPages.status = 'error';
        console.log(`  ⚠️ GitHub Pages: Error (${response.status})`);
      }
    } catch (e) {
      this.status.servers.githubPages.status = 'unknown';
      console.log(`  ⚠️ GitHub Pages: Cannot verify (${e.message})`);
    }
  }

  /**
   * Frontend Assets Status
   */
  async checkFrontendAssets() {
    console.log('\n🎨 Checking Frontend Assets...');

    const assetDirs = ['assets', 'css', 'js', 'images'];
    const { existsSync } = await import('fs');
    const path = await import('path');

    this.status.servers.frontendAssets = [];

    for (const dir of assetDirs) {
      const dirPath = path.join(process.cwd(), '..', dir);
      const exists = existsSync(dirPath);

      this.status.servers.frontendAssets.push({
        directory: dir,
        exists,
        status: exists ? 'ready' : 'missing'
      });

      if (exists) {
        console.log(`  ✅ ${dir}/ - Ready`);
      } else {
        console.log(`  ⚠️ ${dir}/ - Missing`);
      }
    }
  }

  /**
   * API Endpoints Status
   */
  async checkAPIEndpoints() {
    console.log('\n🌐 Checking API Endpoints...');

    const endpoints = [
      { name: 'TELBANK API', url: 'https://api.togethersystems.com/api/telbank/transfers' },
      { name: 'Presence API', url: 'https://api.togethersystems.com/api/presence/verify' },
      { name: 'GitHub Pages', url: 'https://myopenai.github.io/togethersystems/' }
    ];

    this.status.endpoints = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        this.status.endpoints.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.ok ? 'online' : 'error',
          statusCode: response.status
        });
        
        if (response.ok) {
          console.log(`  ✅ ${endpoint.name}: Online (${response.status})`);
        } else {
          console.log(`  ⚠️ ${endpoint.name}: Error (${response.status})`);
        }
      } catch (e) {
        this.status.endpoints.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'offline_or_error',
          error: e.message
        });
        console.log(`  ⚠️ ${endpoint.name}: Cannot verify (${e.message})`);
      }
    }
  }

  /**
   * Overall Status berechnen
   */
  calculateOverallStatus() {
    let allGood = true;
    let warnings = 0;
    let errors = 0;

    // Workers
    if (this.status.servers.workers) {
      const deployedWorkers = this.status.servers.workers.filter(w => w.status === 'deployed').length;
      const totalWorkers = this.status.servers.workers.length;
      if (deployedWorkers < totalWorkers) {
        warnings++;
      }
    }

    // Database
    if (this.status.databases.d1Status && this.status.databases.d1Status !== 'accessible') {
      warnings++;
    }

    // Storage
    if (this.status.storage.r2) {
      const existingBuckets = this.status.storage.r2.filter(b => b.status === 'exists').length;
      if (existingBuckets < this.status.storage.r2.length) {
        warnings++;
      }
    }

    // GitHub Pages
    if (this.status.servers.githubPages && this.status.servers.githubPages.status !== 'online') {
      warnings++;
    }

    // Endpoints
    if (this.status.endpoints) {
      const onlineEndpoints = this.status.endpoints.filter(e => e.status === 'online').length;
      if (onlineEndpoints < this.status.endpoints.length) {
        warnings++;
      }
    }

    // Overall Status
    if (errors > 0) {
      this.status.overall = 'error';
    } else if (warnings > 0) {
      this.status.overall = 'warning';
    } else {
      this.status.overall = 'ok';
    }

    this.status.summary = {
      errors,
      warnings,
      overall: this.status.overall
    };
  }

  /**
   * Report generieren
   */
  generateReport() {
    const report = {
      ...this.status,
      summary: this.status.summary || {},
      recommendations: this.generateRecommendations()
    };

    // Console Output
    console.log('\n📊 SYSTEM STATUS SUMMARY:');
    console.log(`  Overall Status: ${this.getStatusIcon(this.status.overall)} ${this.status.overall.toUpperCase()}`);
    console.log(`  Warnings: ${this.status.summary?.warnings || 0}`);
    console.log(`  Errors: ${this.status.summary?.errors || 0}`);
    console.log('');

    return report;
  }

  /**
   * Status Icon
   */
  getStatusIcon(status) {
    switch (status) {
      case 'ok': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  }

  /**
   * Empfehlungen generieren
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.status.overall === 'ok') {
      recommendations.push({
        type: 'success',
        message: 'All systems operational! ✅'
      });
    } else {
      if (this.status.servers.workers) {
        const undeployed = this.status.servers.workers.filter(w => w.status !== 'deployed');
        if (undeployed.length > 0) {
          recommendations.push({
            type: 'action',
            message: `Deploy ${undeployed.length} workers: ${undeployed.map(w => w.name).join(', ')}`,
            action: 'Run: ./DEPLOYMENT/deploy-all.ps1'
          });
        }
      }

      if (this.status.databases.d1Status !== 'accessible') {
        recommendations.push({
          type: 'action',
          message: 'D1 Database not accessible - Check Cloudflare credentials',
          action: 'Run: wrangler login && wrangler d1 list'
        });
      }

      if (this.status.servers.githubPages.status !== 'online') {
        recommendations.push({
          type: 'action',
          message: 'GitHub Pages not online - Deploy to gh-pages branch',
          action: 'Run: git checkout -b gh-pages && git push origin gh-pages'
        });
      }
    }

    return recommendations;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new SystemStatusCheck();
  checker.checkAll().then(report => {
    // Save report
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'system-status-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }).catch(error => {
    console.error('System check failed:', error);
    process.exit(1);
  });
}

export default SystemStatusCheck;

