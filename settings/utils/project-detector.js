/**
 * Project Detector - Automatische Projekt-Erkennung
 * 
 * Erkennt Projekt-Typ und Konfiguration automatisch
 */

import fs from 'fs';
import path from 'path';

/**
 * Erkennt alle Projekteigenschaften
 */
export async function detectProject(projectPath = process.cwd()) {
  const detection = {
    path: projectPath,
    type: null,
    framework: null,
    buildTool: null,
    testFramework: null,
    deployment: null,
    features: [],
    dependencies: {},
    timestamp: new Date().toISOString()
  };

  // Erkenne Framework
  detection.framework = await detectFramework(projectPath);
  
  // Erkenne Build-Tool
  detection.buildTool = await detectBuildTool(projectPath);
  
  // Erkenne Test-Framework
  detection.testFramework = await detectTestFramework(projectPath);
  
  // Erkenne Deployment
  detection.deployment = await detectDeployment(projectPath);
  
  // Erkenne Features
  detection.features = await detectFeatures(projectPath);
  
  // Erkenne Dependencies
  detection.dependencies = await detectDependencies(projectPath);

  return detection;
}

/**
 * Erkennt Framework
 */
async function detectFramework(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return 'vanilla';
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (deps.react) return 'react';
  if (deps.vue) return 'vue';
  if (deps.angular) return 'angular';
  if (deps.svelte) return 'svelte';
  if (deps.next) return 'next';
  if (deps.nuxt) return 'nuxt';
  if (deps['@angular/core']) return 'angular';
  
  return 'vanilla';
}

/**
 * Erkennt Build-Tool
 */
async function detectBuildTool(projectPath) {
  if (fs.existsSync(path.join(projectPath, 'vite.config.js')) ||
      fs.existsSync(path.join(projectPath, 'vite.config.ts'))) {
    return 'vite';
  }
  
  if (fs.existsSync(path.join(projectPath, 'webpack.config.js'))) {
    return 'webpack';
  }
  
  if (fs.existsSync(path.join(projectPath, 'rollup.config.js'))) {
    return 'rollup';
  }
  
  if (fs.existsSync(path.join(projectPath, 'esbuild.config.js'))) {
    return 'esbuild';
  }
  
  return 'none';
}

/**
 * Erkennt Test-Framework
 */
async function detectTestFramework(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (deps['@playwright/test']) return 'playwright';
  if (deps.jest) return 'jest';
  if (deps.mocha) return 'mocha';
  if (deps.vitest) return 'vitest';
  if (deps.cypress) return 'cypress';
  
  return null;
}

/**
 * Erkennt Deployment-Methode
 */
async function detectDeployment(projectPath) {
  const deployments = [];

  if (fs.existsSync(path.join(projectPath, 'wrangler.toml'))) {
    deployments.push('cloudflare-pages');
  }
  
  if (fs.existsSync(path.join(projectPath, '.github', 'workflows'))) {
    deployments.push('github-actions');
  }
  
  if (fs.existsSync(path.join(projectPath, 'netlify.toml'))) {
    deployments.push('netlify');
  }
  
  if (fs.existsSync(path.join(projectPath, 'vercel.json'))) {
    deployments.push('vercel');
  }
  
  if (fs.existsSync(path.join(projectPath, '.gitlab-ci.yml'))) {
    deployments.push('gitlab-ci');
  }

  return deployments.length > 0 ? deployments : ['manual'];
}

/**
 * Erkennt Features
 */
async function detectFeatures(projectPath) {
  const features = [];

  // Prüfe auf verschiedene Features
  if (fs.existsSync(path.join(projectPath, 'functions'))) {
    features.push('serverless-functions');
  }
  
  if (fs.existsSync(path.join(projectPath, 'sw.js')) ||
      fs.existsSync(path.join(projectPath, 'service-worker.js'))) {
    features.push('pwa');
  }
  
  if (fs.existsSync(path.join(projectPath, 'playwright.config.ts')) ||
      fs.existsSync(path.join(projectPath, 'playwright.config.js'))) {
    features.push('e2e-tests');
  }
  
  if (fs.existsSync(path.join(projectPath, '.github', 'workflows'))) {
    features.push('ci-cd');
  }
  
  if (fs.existsSync(path.join(projectPath, 'autofix-client.js'))) {
    features.push('auto-fix');
  }
  
  if (fs.existsSync(path.join(projectPath, 'neural-network-console.html'))) {
    features.push('neural-network');
  }

  return features;
}

/**
 * Erkennt Dependencies
 */
async function detectDependencies(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return {};
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  return {
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
    peerDependencies: packageJson.peerDependencies || {}
  };
}

