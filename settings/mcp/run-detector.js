/**
 * MCP Detector Runner
 * Runs the MCP detector to find and register all available MCPs
 */

const { MCPDetector } = require('./mcp-detector');
const path = require('path');
const fs = require('fs');

const settingsPath = path.join(__dirname, '..');

async function main() {
  console.log('🔍 Starting MCP Detection...\n');
  
  const detector = new MCPDetector(settingsPath);
  
  try {
    // Perform full scan
    const scanResult = await detector.performFullScan();
    
    console.log('✅ MCP Detection Complete!\n');
    console.log('📊 Results:');
    console.log(`   - Total MCPs detected: ${scanResult.detected.length}`);
    console.log(`   - Connected: ${scanResult.status.connected}`);
    console.log(`   - Available: ${scanResult.status.available}`);
    console.log(`   - Missing functions: ${scanResult.missingFunctions.length}`);
    console.log('\n📋 Detected MCPs:');
    
    scanResult.detected.forEach((mcp, index) => {
      console.log(`\n   ${index + 1}. ${mcp.name} (${mcp.id})`);
      console.log(`      Type: ${mcp.type}`);
      console.log(`      Status: ${mcp.status}`);
      console.log(`      Capabilities: ${mcp.capabilities.join(', ')}`);
      console.log(`      Network: ${mcp.networkInfo.type}${mcp.networkInfo.address ? ` (${mcp.networkInfo.address})` : ''}`);
    });
    
    if (scanResult.missingFunctions.length > 0) {
      console.log('\n⚠️  Missing Functions:');
      scanResult.missingFunctions.forEach((func, index) => {
        console.log(`   ${index + 1}. ${func.functionName} (${func.context?.mcpName || 'unknown'})`);
      });
    }
    
    // Save results to file
    const resultsPath = path.join(settingsPath, 'mcp', 'detection-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(scanResult, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
  } catch (error) {
    console.error('❌ Error during MCP detection:', error);
    process.exit(1);
  }
}

main();

