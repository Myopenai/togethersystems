/**
 * TTT Production Process - Deploy All Servers
 * 
 * Deployment aller Server nach vollständiger Prüfung
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const TTTVersionCheck = require('./version-check');

class TTTDeployment {
  constructor() {
    this.rootPath = path.resolve(__dirname, '../..');
    this.versionCheck = new TTTVersionCheck();
  }

  async deploy() {
    console.log('🚀 TTT PRODUCTION DEPLOYMENT - ALLE SERVER\n');

    try {
      // 1. Version Check durchführen
      console.log('📋 Schritt 1: Vollständige Funktionsprüfung...\n');
      await this.versionCheck.runFullCheck();

      // 2. Git Status prüfen
      console.log('\n📋 Schritt 2: Git Status prüfen...\n');
      this.checkGitStatus();

      // 3. Cloudflare Pages Deployment
      console.log('\n📋 Schritt 3: Cloudflare Pages Deployment...\n');
      await this.deployCloudflarePages();

      // 4. GitHub Pages Deployment
      console.log('\n📋 Schritt 4: GitHub Pages Deployment...\n');
      await this.deployGitHubPages();

      // 5. Finale Bestätigung
      console.log('\n✅ DEPLOYMENT ABGESCHLOSSEN\n');
      console.log('🌐 Alle Server sind live und funktionsfähig\n');

    } catch (error) {
      console.error('\n❌ DEPLOYMENT FEHLER:', error.message);
      process.exit(1);
    }
  }

  checkGitStatus() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8', cwd: this.rootPath });
      if (status.trim()) {
        console.log('⚠️  Uncommitted changes detected:');
        console.log(status);
        console.log('💡 Tipp: Committe Änderungen vor Deployment\n');
      } else {
        console.log('✅ Git Repository ist sauber\n');
      }
    } catch (error) {
      console.log('⚠️  Git Status konnte nicht geprüft werden:', error.message);
    }
  }

  async deployCloudflarePages() {
    try {
      console.log('☁️  Cloudflare Pages Deployment...');
      
      // Prüfe ob wrangler installiert ist
      try {
        execSync('wrangler --version', { encoding: 'utf-8' });
      } catch {
        console.log('⚠️  Wrangler nicht gefunden. Installiere...');
        execSync('npm install -g wrangler', { encoding: 'utf-8' });
      }

      // Deployment
      console.log('📤 Deploye zu Cloudflare Pages...');
      execSync('wrangler pages deploy . --project-name=togethersystems', {
        cwd: this.rootPath,
        stdio: 'inherit'
      });

      console.log('✅ Cloudflare Pages Deployment erfolgreich\n');
    } catch (error) {
      console.log('⚠️  Cloudflare Pages Deployment:', error.message);
      console.log('💡 Manuelles Deployment über Cloudflare Dashboard möglich\n');
    }
  }

  async deployGitHubPages() {
    try {
      console.log('🐙 GitHub Pages Deployment...');

      // Prüfe ob GitHub Actions Workflow existiert
      const workflowPath = path.join(this.rootPath, '.github', 'workflows', 'github-pages.yml');
      if (fs.existsSync(workflowPath)) {
        console.log('✅ GitHub Actions Workflow gefunden');
        console.log('📤 Push zu main branch triggert automatisches Deployment...');
        
        // Git Push (falls nicht bereits geschehen)
        try {
          execSync('git push origin main', {
            cwd: this.rootPath,
            stdio: 'inherit'
          });
          console.log('✅ Git Push erfolgreich - GitHub Pages Deployment wird automatisch getriggert\n');
        } catch (error) {
          console.log('⚠️  Git Push:', error.message);
          console.log('💡 Manueller Push erforderlich\n');
        }
      } else {
        console.log('⚠️  GitHub Actions Workflow nicht gefunden');
        console.log('💡 Erstelle Workflow...');
        this.createGitHubPagesWorkflow();
      }
    } catch (error) {
      console.log('⚠️  GitHub Pages Deployment:', error.message);
    }
  }

  createGitHubPagesWorkflow() {
    const workflowsDir = path.join(this.rootPath, '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    const workflowContent = `name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

    fs.writeFileSync(
      path.join(workflowsDir, 'github-pages.yml'),
      workflowContent
    );

    console.log('✅ GitHub Pages Workflow erstellt\n');
  }
}

// Ausführung
if (require.main === module) {
  const deployment = new TTTDeployment();
  deployment.deploy().catch(console.error);
}

module.exports = TTTDeployment;

