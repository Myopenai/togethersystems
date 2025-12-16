const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const HOST = 'localhost';
const PORT = 3000;
const API_PREFIX = '/api';

// Test scenarios
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Monitor Status',
    path: '/monitor',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Metrics',
    path: '/metrics',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Simulate High CPU',
    path: '/monitor/simulate/cpu',
    method: 'POST',
    expectedStatus: 202
  },
  {
    name: 'Simulate High Memory',
    path: '/monitor/simulate/memory',
    method: 'POST',
    expectedStatus: 202
  }
];

// Helper function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('Starting monitoring system tests...\n');
  
  let passed = 0;
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n[TEST] ${test.name} (${test.method} ${test.path})`);
      
      const options = {
        hostname: HOST,
        port: PORT,
        path: `${API_PREFIX}${test.path}`,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const startTime = Date.now();
      const response = await makeRequest(options);
      const responseTime = Date.now() - startTime;
      
      const passedTest = response.statusCode === test.expectedStatus;
      if (passedTest) {
        console.log(`✅ PASSED (${responseTime}ms)`);
        passed++;
      } else {
        console.error(`❌ FAILED: Expected ${test.expectedStatus}, got ${response.statusCode}`);
        console.error('Response:', JSON.stringify(response.body, null, 2));
      }
      
      results.push({
        name: test.name,
        path: test.path,
        method: test.method,
        status: passedTest ? 'PASSED' : 'FAILED',
        statusCode: response.statusCode,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ ERROR in ${test.name}:`, error.message);
      results.push({
        name: test.name,
        path: test.path,
        method: test.method,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: tests.length,
    passed,
    failed: tests.length - passed,
    results
  };
  
  // Save report to file
  const reportPath = path.join(__dirname, 'monitoring-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n=== Test Summary ===');
  console.log(`Total: ${tests.length}, Passed: ${passed}, Failed: ${tests.length - passed}`);
  console.log(`Report saved to: ${reportPath}`);
  
  process.exit(passed === tests.length ? 0 : 1);
}

// Start tests
runTests().catch(console.error);
