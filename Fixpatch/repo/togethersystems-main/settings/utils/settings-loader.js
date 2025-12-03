/**
 * Settings Loader - Projektunabhängiger Settings-Loader
 * 
 * Lädt Settings automatisch basierend auf Projekt-Typ
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_ROOT = path.join(__dirname, '..');

/**
 * Projekt-Typen
 */
export const PROJECT_TYPES = {
  STATIC: 'static',
  SERVERLESS: 'serverless',
  FULLSTACK: 'fullstack',
  MONOREPO: 'monorepo',
  MICROSERVICES: 'microservices'
};

/**
 * Lädt Settings für ein Projekt
 */
export async function loadSettings(projectPath = process.cwd()) {
  const projectType = await detectProjectType(projectPath);
  const settings = {
    projectType,
    projectPath,
    config: {},
    timestamp: new Date().toISOString()
  };

  // Lade Basis-Config
  settings.config = await loadBaseConfig();

  // Lade projekt-spezifische Config
  const projectConfig = await loadProjectConfig(projectPath, projectType);
  settings.config = { ...settings.config, ...projectConfig };

  // Validiere Settings
  await validateSettings(settings);

  return settings;
}

/**
 * Erkennt Projekt-Typ automatisch
 */
export async function detectProjectType(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const wranglerPath = path.join(projectPath, 'wrangler.toml');
  const functionsPath = path.join(projectPath, 'functions');

  // Prüfe auf Serverless (Cloudflare Workers/Pages)
  if (fs.existsSync(wranglerPath) || fs.existsSync(functionsPath)) {
    return PROJECT_TYPES.SERVERLESS;
  }

  // Prüfe package.json
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (packageJson.workspaces) {
      return PROJECT_TYPES.MONOREPO;
    }
    
    if (packageJson.dependencies?.express || packageJson.dependencies?.fastify) {
      return PROJECT_TYPES.FULLSTACK;
    }
  }

  // Default: Static
  return PROJECT_TYPES.STATIC;
}

/**
 * Lädt Basis-Config
 */
async function loadBaseConfig() {
  const configPath = path.join(SETTINGS_ROOT, 'config');
  const config = {};

  // Lade alle Config-Dateien
  const configFiles = [
    'mcp-config.json',
    'playwright-config.json',
    'autofix-config.json',
    'deployment-config.json',
    'neural-network-config.json',
    'encryption-config.json'
  ];

  for (const file of configFiles) {
    const filePath = path.join(configPath, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const key = file.replace('.json', '').replace('-config', '');
        config[key] = content;
      } catch (error) {
        console.warn(`Could not load ${file}:`, error.message);
      }
    }
  }

  return config;
}

/**
 * Lädt projekt-spezifische Config
 */
async function loadProjectConfig(projectPath, projectType) {
  const config = {
    projectType,
    autoDetected: true
  };

  // Lade projekt-spezifische Settings
  const projectSettingsPath = path.join(projectPath, '.settings');
  if (fs.existsSync(projectSettingsPath)) {
    try {
      const projectSettings = JSON.parse(
        fs.readFileSync(path.join(projectSettingsPath, 'config.json'), 'utf-8')
      );
      return { ...config, ...projectSettings };
    } catch (error) {
      console.warn('Could not load project-specific settings:', error.message);
    }
  }

  return config;
}

/**
 * Validiert Settings
 */
async function validateSettings(settings) {
  // Basis-Validierung
  if (!settings.projectType) {
    throw new Error('Project type is required');
  }

  if (!settings.config) {
    throw new Error('Config is required');
  }

  // Weitere Validierungen...
  return true;
}

/**
 * Speichert Settings
 */
export async function saveSettings(settings, projectPath = process.cwd()) {
  const settingsPath = path.join(projectPath, '.settings');
  
  if (!fs.existsSync(settingsPath)) {
    fs.mkdirSync(settingsPath, { recursive: true });
  }

  const configPath = path.join(settingsPath, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(settings, null, 2), 'utf-8');

  return configPath;
}

/**
 * Exportiert Settings als Template
 */
export async function exportAsTemplate(settings, templateName) {
  const templatePath = path.join(SETTINGS_ROOT, 'templates', templateName);
  
  if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
  }

  const templateConfig = {
    ...settings,
    isTemplate: true,
    templateName,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(templatePath, 'template.json'),
    JSON.stringify(templateConfig, null, 2),
    'utf-8'
  );

  return templatePath;
}








