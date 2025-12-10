/**
 * Detect All MCPs - Complete System Scan
 * 
 * Scans the entire system for available MCP servers and registers them
 */

const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..');
const registryPath = path.join(__dirname, 'mcp-registry.json');
const configPath = path.join(settingsPath, 'config', 'mcp-config.json');
const extendedConfigPath = path.join(settingsPath, 'config', 'mcp-config-extended.json');

function loadRegistry() {
  if (!fs.existsSync(registryPath)) {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      headingAnchorProject: {
        name: "MCP Heading Anchor Project",
        status: "active",
        purpose: "Total MCP Management & Recovery System"
      },
      mcpTotal: 0,
      mcpConnected: 0,
      mcpAvailable: 0,
      mcpXXXXL: [],
      mcpRegistry: [],
      successfulOutputs: [],
      verifiedBackups: { local: [], online: [] },
      networkDistribution: {
        localhost: [],
        networks: [],
        global: [],
        bluetooth: [],
        wifi: [],
        external: []
      },
      deviceRegistry: [],
      connectionTypes: [],
      licenses: [],
      modifications: [],
      useCases: [],
      missingFunctions: [],
      recoveryPoints: []
    };
  }
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

function saveRegistry(registry) {
  registry.lastUpdated = new Date().toISOString();
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

function detectMCPsFromConfig() {
  const detected = [];
  
  // Load basic config
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.servers) {
      config.servers.forEach(server => {
        detected.push({
          source: 'mcp-config.json',
          name: server.name,
          type: server.type || 'mcp',
          enabled: server.enabled !== false,
          endpoint: server.endpoint,
          path: server.path,
          capabilities: server.capabilities || [],
          config: server.config || {}
        });
      });
    }
  }
  
  // Load extended config
  if (fs.existsSync(extendedConfigPath)) {
    const extended = JSON.parse(fs.readFileSync(extendedConfigPath, 'utf-8'));
    if (extended.tools) {
      extended.tools.forEach(tool => {
        detected.push({
          source: 'mcp-config-extended.json',
          name: tool.service || tool.id,
          type: 'mcp.tool',
          enabled: true,
          endpoint: tool.endpoint,
          path: tool.path,
          capabilities: tool.capabilities || [],
          dimensions: tool.dimensions,
          reliability: tool.reliability,
          version: tool.version
        });
      });
    }
  }
  
  return detected;
}

function detectAPIMCPs(functionsPath) {
  const detected = [];
  
  if (!fs.existsSync(functionsPath)) {
    return detected;
  }
  
  const apiDirs = ['presence', 'telbank', 'voucher', 'mortgage', 'contracts', 'mcp'];
  
  apiDirs.forEach(dir => {
    const dirPath = path.join(functionsPath, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        if (file.endsWith('.js') && !file.endsWith('.backup.js')) {
          detected.push({
            source: 'functions/api',
            name: `${dir}/${file.replace('.js', '')}`,
            type: 'cloudflare-function',
            enabled: true,
            endpoint: `/api/${dir}/${file.replace('.js', '')}`,
            capabilities: ['api', 'http', 'cloudflare'],
            networkType: 'network'
          });
        }
      });
    }
  });
  
  return detected;
}

function detectLocalServers() {
  const detected = [];
  const rootPath = path.join(settingsPath, '..');
  
  // Check for local Node.js servers
  const serverFiles = [
    'presence-api-server.js',
    'voucher-api-server.js',
    'mortgage-api-server.js',
    'signal-server.js',
    'telbank-transfer-server.js'
  ];
  
  serverFiles.forEach(file => {
    const filePath = path.join(rootPath, file);
    if (fs.existsSync(filePath)) {
      const name = file.replace('-server.js', '').replace('.js', '');
      detected.push({
        source: 'local-servers',
        name: name,
        type: 'node-server',
        enabled: true,
        file: file,
        capabilities: ['api', 'http', 'express'],
        networkType: 'localhost'
      });
    }
  });
  
  return detected;
}

async function detectAllMCPs() {
  console.log('🔍 Starting Complete MCP Detection...\n');
  
  const registry = loadRegistry();
  const allDetected = [];
  
  // 1. Detect from config files
  console.log('📋 Scanning configuration files...');
  const configMCPs = detectMCPsFromConfig();
  allDetected.push(...configMCPs);
  console.log(`   Found ${configMCPs.length} MCPs in config files`);
  
  // 2. Detect API MCPs from functions
  console.log('\n🌐 Scanning Cloudflare Functions...');
  const functionsPath = path.join(settingsPath, '..', 'functions', 'api');
  const apiMCPs = detectAPIMCPs(functionsPath);
  allDetected.push(...apiMCPs);
  console.log(`   Found ${apiMCPs.length} API endpoints`);
  
  // 3. Detect local servers
  console.log('\n💻 Scanning local Node.js servers...');
  const localServers = detectLocalServers();
  allDetected.push(...localServers);
  console.log(`   Found ${localServers.length} local servers`);
  
  // 4. Register/Update all detected MCPs
  console.log('\n📝 Registering MCPs...');
  const crypto = require('crypto');
  
  allDetected.forEach((mcp, index) => {
    const mcpId = `mcp-${crypto.randomBytes(8).toString('hex')}`;
    
    // Check if already registered
    const existing = registry.mcpRegistry.find(m => 
      m.name === mcp.name && m.networkInfo?.address === mcp.endpoint
    );
    
    if (existing) {
      console.log(`   ${index + 1}. ✓ ${mcp.name} (already registered)`);
      existing.lastVerified = new Date().toISOString();
      existing.status = mcp.enabled ? 'available' : 'offline';
    } else {
      const mcpInfo = {
        id: mcpId,
        name: mcp.name,
        type: mcp.type === 'xxxxl' ? 'xxxxl' : 'standard',
        status: mcp.enabled ? 'available' : 'offline',
        capabilities: mcp.capabilities || [],
        lastVerified: new Date().toISOString(),
        backupStatus: 'pending',
        networkInfo: {
          type: mcp.networkType || 'localhost',
          address: mcp.endpoint || mcp.file || 'unknown',
          port: mcp.port,
          connectionId: mcpId
        },
        deviceInfo: {
          deviceId: mcpId,
          deviceType: mcp.type || 'mcp',
          connectionType: mcp.networkType || 'http'
        },
        timestamp: new Date().toISOString(),
        version: mcp.version || '1.0.0',
        source: mcp.source
      };
      
      if (mcp.path) mcpInfo.factoryPath = path.resolve(settingsPath, mcp.path);
      if (mcp.dimensions) mcpInfo.dimensions = mcp.dimensions;
      if (mcp.reliability) mcpInfo.reliability = mcp.reliability;
      
      registry.mcpRegistry.push(mcpInfo);
      
      if (mcpInfo.type === 'xxxxl') {
        registry.mcpXXXXL.push(mcpId);
      }
      
      console.log(`   ${index + 1}. ✓ ${mcp.name} (${mcp.type})`);
    }
  });
  
  // Update counts
  registry.mcpTotal = registry.mcpRegistry.length;
  registry.mcpConnected = registry.mcpRegistry.filter(m => m.status === 'connected').length;
  registry.mcpAvailable = registry.mcpRegistry.filter(m => 
    m.status === 'available' || m.status === 'connected'
  ).length;
  
  // Save registry
  saveRegistry(registry);
  
  console.log('\n✅ Detection Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total MCPs detected: ${allDetected.length}`);
  console.log(`   Total registered: ${registry.mcpTotal}`);
  console.log(`   Connected: ${registry.mcpConnected}`);
  console.log(`   Available: ${registry.mcpAvailable}`);
  console.log(`   XXXXL MCPs: ${registry.mcpXXXXL.length}`);
  
  // Save detection results
  const resultsPath = path.join(__dirname, 'detection-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    detected: allDetected,
    registry: {
      total: registry.mcpTotal,
      connected: registry.mcpConnected,
      available: registry.mcpAvailable,
      xxxxl: registry.mcpXXXXL.length
    }
  }, null, 2));
  
  console.log(`\n💾 Results saved to: ${resultsPath}`);
  console.log(`💾 Registry updated: ${registryPath}`);
  
  return { detected: allDetected, registry };
}

// Run if called directly
if (require.main === module) {
  detectAllMCPs().catch(error => {
    console.error('❌ Error during detection:', error);
    process.exit(1);
  });
}

module.exports = { detectAllMCPs };

