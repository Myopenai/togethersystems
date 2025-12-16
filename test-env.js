// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

// Test script to verify environment variables
console.log('Testing environment configuration...\n');
console.log('Loading .env from:', __dirname + '\\.env');

// Test Cloudflare token
const cfToken = process.env.CLOUDFLARE_API_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

console.log('Cloudflare Configuration:');
console.log(`- Account ID: ${cfAccountId ? '✅ Found' : '❌ Missing'}`);
console.log(`- API Token: ${cfToken ? '✅ Found' : '❌ Missing'}`);

// Test basic Node.js environment
console.log('\nNode.js Environment:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`- PORT: ${process.env.PORT || 'Not set'}`);

// Test token validity if token exists
if (cfToken && cfAccountId) {
  console.log('\nTesting Cloudflare API connection...');
  
  const https = require('https');
  
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/accounts/${cfAccountId}/tokens/verify`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cfToken}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Cloudflare API connection successful!');
          console.log(`   Token ID: ${result.result.id}`);
          console.log(`   Status: ${result.result.status}`);
          console.log(`   Expires: ${result.result.expires_on || 'Never'}`);
        } else {
          console.log('❌ Cloudflare API connection failed:');
          console.log(JSON.stringify(result.errors, null, 2));
        }
      } catch (e) {
        console.error('❌ Error parsing response:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error connecting to Cloudflare API:', error.message);
  });

  req.end();
} else {
  console.log('\n⚠️  Cloudflare credentials not found. Please check your .env file.');
}

console.log('\nTest completed.');
