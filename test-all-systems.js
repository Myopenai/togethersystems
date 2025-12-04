// FABRIK: Auto-Test All Systems
// IBM+++ MCP MCP MCP Standard
// ES Module Version

import http from 'http';

async function testSystem(url, name) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ name, status: res.statusCode, ok: res.statusCode === 200, data });
            });
        }).on('error', (err) => {
            resolve({ name, status: 0, ok: false, error: err.message });
        });
    });
}

async function runTests() {
    console.log('========================================');
    console.log('FABRIK: Testing all systems...');
    console.log('IBM+++ MCP MCP MCP STANDARD');
    console.log('========================================\n');
    
    const tests = [
        { url: 'http://127.0.0.1:9090/api/status', name: 'Go Server (CognitiveFabric)' },
        { url: 'http://127.0.0.1:8080/', name: 'Node.js Server (Development)' }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await testSystem(test.url, test.name);
        if (result.ok) {
            console.log(`✅ ${result.name}: OK (Status ${result.status})`);
            if (result.data) {
                try {
                    const json = JSON.parse(result.data);
                    console.log(`   Response: ${JSON.stringify(json, null, 2)}`);
                } catch (e) {
                    // Nicht JSON, ignorieren
                }
            }
            passed++;
        } else {
            console.log(`❌ ${result.name}: FAILED`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
            failed++;
        }
    }
    
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    console.log('========================================\n');
    
    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED!');
        process.exit(0);
    } else {
        console.log('⚠️  SOME TESTS FAILED');
        process.exit(1);
    }
}

runTests().catch((error) => {
    console.error('❌ Test execution error:', error);
    process.exit(1);
});
