/**
 * Connect to Fabrikation Centrale MCP Server
 * 
 * This script connects to the Industrial Software Factory MCP server
 * and registers it in the MCP registry.
 */

const { MCPManager } = require('./mcp-manager');
const path = require('path');
const fs = require('fs');

const settingsPath = path.join(__dirname, '..');
const manager = new MCPManager(settingsPath);

async function connectFabrikationCentrale() {
  console.log('🏭 Connecting to Fabrikation Centrale MCP Server...\n');
  
  try {
    // Load MCP config to get fabrikation centrale settings
    const configPath = path.join(settingsPath, 'config', 'mcp-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    const fabrikationServer = config.servers.find(s => s.name === 'fabrikation-centrale');
    
    if (!fabrikationServer) {
      throw new Error('Fabrikation Centrale server not found in config');
    }
    
    // Check if factory path exists
    const factoryPath = path.resolve(settingsPath, fabrikationServer.path);
    if (!fs.existsSync(factoryPath)) {
      console.warn(`⚠️  Warning: Factory path not found: ${factoryPath}`);
      console.warn('   Continuing with connection anyway...\n');
    }
    
    // Register the MCP
    const mcpInfo = await manager.registerMCP({
      name: 'Fabrikation Centrale',
      type: 'xxxxl',
      status: 'connected',
      capabilities: fabrikationServer.capabilities || [],
      networkInfo: {
        type: 'localhost',
        address: fabrikationServer.endpoint || 'http://localhost:8080',
        port: 8080
      },
      deviceInfo: {
        deviceId: 'fabrikation-centrale-001',
        deviceType: 'industrial-factory',
        connectionType: 'http',
        hapticConfig: {
          enabled: false
        }
      },
      version: '1.0.0'
    });
    
    console.log('✅ Successfully connected to Fabrikation Centrale!\n');
    console.log('📋 MCP Information:');
    console.log(`   ID: ${mcpInfo.id}`);
    console.log(`   Name: ${mcpInfo.name}`);
    console.log(`   Type: ${mcpInfo.type}`);
    console.log(`   Status: ${mcpInfo.status}`);
    console.log(`   Endpoint: ${fabrikationServer.endpoint || 'http://localhost:8080'}`);
    console.log(`   Factory Path: ${factoryPath}`);
    console.log(`   Capabilities: ${mcpInfo.capabilities.length} available`);
    console.log('\n🔧 Available Capabilities:');
    mcpInfo.capabilities.forEach((cap, index) => {
      console.log(`   ${index + 1}. ${cap}`);
    });
    
    // Get status
    const status = manager.getStatus();
    console.log('\n📊 MCP System Status:');
    console.log(`   Total MCPs: ${status.total}`);
    console.log(`   Connected: ${status.connected}`);
    console.log(`   Available: ${status.available}`);
    console.log(`   XXXXL MCPs: ${status.xxxxl}`);
    
    // Create recovery point
    console.log('\n💾 Creating recovery point...');
    const recoveryPoint = await manager.createRecoveryPoint();
    console.log(`   Recovery Point ID: ${recoveryPoint.id}`);
    console.log(`   Location: ${recoveryPoint.location.local}`);
    
    console.log('\n✨ Connection complete! Fabrikation Centrale is ready to use.');
    
    return mcpInfo;
    
  } catch (error) {
    console.error('❌ Error connecting to Fabrikation Centrale:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  connectFabrikationCentrale();
}

module.exports = { connectFabrikationCentrale };

