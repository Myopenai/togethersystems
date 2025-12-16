const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const http = require('http');

const TEST_DIR = 'test-recovery-dir';
const API_BASE = 'http://localhost:3000/api';

async function runTest() {
  console.log('🚀 Starting self-healing system tests...\n');
  
  try {
    // Test 1: Verify directory is created if it doesn't exist
    await testDirectoryCreation();
    
    // Test 2: Verify health endpoint
    await testHealthEndpoint();
    
    // Test 3: Test monitoring endpoint
    await testMonitoringEndpoint();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function testDirectoryCreation() {
  console.log('🧪 Testing directory auto-creation...');
  
  // Delete test directory if it exists
  try {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    console.log(`  - Removed existing ${TEST_DIR} directory`);
  } catch (error) {
    // Ignore if directory doesn't exist
  }
  
  // Make an API request that should trigger directory creation
  await httpGet(`${API_BASE}/health`);
  
  // Verify directory was created
  try {
    const stats = await fs.stat(TEST_DIR);
    if (!stats.isDirectory()) {
      throw new Error(`${TEST_DIR} exists but is not a directory`);
    }
    console.log(`  ✓ Directory ${TEST_DIR} was automatically created`);
  } catch (error) {
    throw new Error(`Directory ${TEST_DIR} was not created: ${error.message}`);
  }
}

async function testHealthEndpoint() {
  console.log('\n🧪 Testing health endpoint...');
  
  const data = await httpGet(`${API_BASE}/health`);
  
  if (data.status !== 'healthy') {
    throw new Error(`Expected status 'healthy', got '${data.status}'`);
  }
  
  console.log('  ✓ Health endpoint returned healthy status');
  
  // Check if filesystem service is being monitored
  if (!data.services || !data.services.filesystem) {
    throw new Error('Filesystem service not found in health check');
  }
  
  console.log('  ✓ Filesystem service is being monitored');
}

async function testMonitoringEndpoint() {
  console.log('\n🧪 Testing monitoring endpoint...');
  
  const data = await httpGet(`${API_BASE}/monitor`);
  
  if (data.status !== 'ok') {
    throw new Error(`Expected status 'ok', got '${data.status}'`);
  }
  
  console.log('  ✓ Monitoring endpoint is working');
  
  // Simulate an error and check monitoring
  console.log('  - Simulating a filesystem error...');
  await httpGet(`${API_BASE}/health?simulateError=filesystem`);
  
  // Check that the error was recorded
  const monitorData = await httpGet(`${API_BASE}/monitor`);
  if (monitorData.services.filesystem.status === 'healthy') {
    throw new Error('Filesystem error was not recorded');
  }
  
  console.log('  ✓ Filesystem error was detected');
  
  // Wait for recovery
  console.log('  - Waiting for auto-recovery...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Verify recovery
  const recoveredData = await httpGet(`${API_BASE}/monitor`);
  if (recoveredData.services.filesystem.status !== 'healthy') {
    throw new Error('Filesystem did not recover automatically');
  }
  
  console.log('  ✓ Filesystem recovered successfully');
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
      
    }).on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
  });
}

// Start the tests
runTest().catch(console.error);
