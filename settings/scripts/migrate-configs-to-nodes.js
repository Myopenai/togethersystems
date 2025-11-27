/**
 * Migration Script: Configs → Nodes
 * 
 * Migriert bestehende Config-Dateien zu Settings Nodes
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SETTINGS_PATH = './Settings';
const CONFIG_PATH = path.join(SETTINGS_PATH, 'config');
const NODES_PATH = path.join(SETTINGS_PATH, 'nodes', 'global');

/**
 * Migriert Config zu Node
 */
async function migrateConfigToNode(configFile, nodeType) {
  const configPath = path.join(CONFIG_PATH, configFile);
  
  if (!fs.existsSync(configPath)) {
    console.warn(`Config file not found: ${configPath}`);
    return null;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  // Erstelle Node ID
  const nodeName = configFile.replace('.json', '').replace('-config', '');
  const nodeId = `settings://global/${nodeType}/${nodeName}`;

  // Erstelle Node
  const node = {
    id: nodeId,
    type: nodeType,
    version: config.version || '1.0.0',
    scope: ['global'],
    meta: {
      owner: 'system',
      createdAt: new Date().toISOString(),
      checksum: crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex'),
      description: config.description || `Migrated from ${configFile}`
    },
    data: config
  };

  // Speichere Node
  if (!fs.existsSync(NODES_PATH)) {
    fs.mkdirSync(NODES_PATH, { recursive: true });
  }

  const nodePath = path.join(NODES_PATH, `${nodeType}.${nodeName}.json`);
  fs.writeFileSync(nodePath, JSON.stringify(node, null, 2), 'utf-8');

  console.log(`✅ Migrated: ${configFile} → ${nodeId}`);
  return node;
}

/**
 * Haupt-Migration
 */
async function migrateAllConfigs() {
  console.log('🔄 Starting migration: Configs → Nodes\n');

  const migrations = [
    { file: 'mcp-config.json', type: 'mcp.tool' },
    { file: 'playwright-config.json', type: 'playwright.profile' },
    { file: 'autofix-config.json', type: 'autofix.pattern' },
    { file: 'deployment-config.json', type: 'deploy.target' },
    { file: 'neural-network-config.json', type: 'nn.model' },
    { file: 'encryption-config.json', type: 'encryption.policy' }
  ];

  const results = [];

  for (const migration of migrations) {
    try {
      const node = await migrateConfigToNode(migration.file, migration.type);
      if (node) {
        results.push(node);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${migration.file}:`, error.message);
    }
  }

  console.log(`\n✅ Migration complete: ${results.length} nodes created`);
  return results;
}

// Ausführen
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllConfigs().catch(console.error);
}

export { migrateAllConfigs, migrateConfigToNode };

