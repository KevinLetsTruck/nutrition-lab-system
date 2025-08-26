#!/usr/bin/env node

/**
 * Quick test script for medical document upload endpoints
 */

const fs = require('fs');
const path = require('path');

async function testEndpoints() {
  console.log('🧪 Testing Medical Document Upload Endpoints');
  console.log('='.repeat(50));

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const response = await fetch(`${baseUrl}/api/medical/upload`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log(`   ✅ Server responding (${response.status})`);
    } catch (error) {
      console.log('   ❌ Server not responding. Make sure npm run dev is running.');
      console.log('   To start server: npm run dev');
      return;
    }

    // Test 2: Check clients endpoint
    console.log('\n2. Testing clients endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/clients`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Clients endpoint working (${data.clients?.length || 0} clients)`);
      } else {
        console.log(`   ⚠️ Clients endpoint returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Clients endpoint error: ${error.message}`);
    }

    // Test 3: Check medical upload endpoint structure
    console.log('\n3. Testing medical upload endpoint...');
    try {
      const response = await fetch(`${baseUrl}/api/medical/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      // We expect this to fail due to missing form data, but it should respond
      console.log(`   ✅ Medical upload endpoint responding (${response.status})`);
      
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('Missing required fields')) {
          console.log('   ✅ Endpoint correctly validates required fields');
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Medical upload endpoint error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 Next Steps:');
    console.log('1. Visit http://localhost:3000/test-medical');
    console.log('2. Select a client and upload a test file');
    console.log('3. Monitor the response and console for debugging');
    console.log('\n📋 Test Files to Try:');
    console.log('• PDF lab reports');
    console.log('• JPEG/PNG images of lab results');
    console.log('• Try different file sizes');
    console.log('• Test validation errors (wrong file types)');
    
  } catch (error) {
    console.error('\n❌ Test script failed:', error);
  }
}

// Run tests
testEndpoints().catch(console.error);
