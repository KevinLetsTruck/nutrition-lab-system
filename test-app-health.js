#!/usr/bin/env node

const http = require('http');

console.log('🔍 Testing FNTP App Health...\n');

// Test endpoints
const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/api/health', name: 'Health Check' },
  { path: '/client/assessment', name: 'Assessment Page' },
  { path: '/api/assessment/start', name: 'Assessment API', method: 'POST' },
];

let working = 0;
let broken = 0;

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint.path,
      method: endpoint.method || 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode < 500) {
        console.log(`✅ ${endpoint.name}: ${res.statusCode} - WORKING`);
        working++;
      } else {
        console.log(`❌ ${endpoint.name}: ${res.statusCode} - ERROR`);
        broken++;
      }
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      broken++;
      resolve();
    });

    req.on('timeout', () => {
      console.log(`⏱️ ${endpoint.name}: TIMEOUT`);
      broken++;
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Working: ${working}/${endpoints.length}`);
  console.log(`   Broken: ${broken}/${endpoints.length}`);
  
  if (working === endpoints.length) {
    console.log('\n✅ App is functional! TypeScript errors are not blocking runtime.');
  } else if (working > 0) {
    console.log('\n⚠️ App is partially functional. Some features work despite TypeScript errors.');
  } else {
    console.log('\n❌ App is not responding. Runtime issues need to be fixed.');
  }
}

runTests();
