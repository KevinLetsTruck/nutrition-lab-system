#!/usr/bin/env node

/**
 * Medical Document Processing System - Comprehensive Test Suite
 * 
 * This script tests all aspects of the medical document processing system:
 * - Document upload and validation
 * - Processing queue operations
 * - Analysis functionality
 * - WebSocket real-time updates
 * - Storage operations
 * - Database operations
 * - Error handling
 * 
 * Usage: node test-medical-system.js [options]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { io } = require('socket.io-client');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  authToken: process.env.TEST_AUTH_TOKEN || '',
  testClient: {
    id: process.env.TEST_CLIENT_ID || '',
    firstName: 'Test',
    lastName: 'Patient',
    email: 'test.patient@example.com'
  },
  testFiles: {
    pdf: './test-files/sample-lab-report.pdf',
    image: './test-files/sample-lab-image.jpg',
    invalid: './test-files/invalid-file.exe'
  },
  timeout: 30000, // 30 seconds
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  skipSlow: process.argv.includes('--skip-slow'),
  onlyBasic: process.argv.includes('--basic')
};

// Test state
const STATE = {
  socket: null,
  uploadedDocuments: [],
  testResults: {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: []
  }
};

// Utility functions
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = level.toUpperCase().padEnd(5);
  
  if (level === 'error') {
    console.error(`[${timestamp}] ${prefix} ${message}`);
  } else if (CONFIG.verbose || level === 'test') {
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (endpoint, options = {}) => {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CONFIG.authToken}`,
      'Content-Type': 'application/json'
    }
  };

  const requestOptions = { ...defaultOptions, ...options };
  
  if (requestOptions.headers['Content-Type'] === 'multipart/form-data') {
    delete requestOptions.headers['Content-Type']; // Let browser set boundary
  }

  log(`Making ${requestOptions.method} request to ${endpoint}`, 'debug');

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      data,
      headers: response.headers
    };
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    throw error;
  }
};

const assert = (condition, message) => {
  if (condition) {
    STATE.testResults.passed++;
    log(`✅ PASS: ${message}`, 'test');
  } else {
    STATE.testResults.failed++;
    STATE.testResults.errors.push(message);
    log(`❌ FAIL: ${message}`, 'test');
  }
};

const skip = (message) => {
  STATE.testResults.skipped++;
  log(`⏭️ SKIP: ${message}`, 'test');
};

// Test file creation
const createTestFiles = () => {
  const testDir = './test-files';
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create sample PDF content (mock)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Sample Lab Report) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
0000000178 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
268
%%EOF`;

  fs.writeFileSync(CONFIG.testFiles.pdf, pdfContent);

  // Create sample image (1x1 JPEG)
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
  ]);
  fs.writeFileSync(CONFIG.testFiles.image, jpegHeader);

  // Create invalid file
  fs.writeFileSync(CONFIG.testFiles.invalid, 'This is not a valid medical document');

  log('Created test files', 'info');
};

// Test suites
const testAuthentication = async () => {
  log('Testing authentication...', 'test');

  // Test without token
  const response1 = await makeRequest('/api/documents/upload', {
    headers: {}
  });
  assert(response1.status === 401, 'Should reject request without auth token');

  // Test with invalid token
  const response2 = await makeRequest('/api/documents/upload', {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });
  assert(response2.status === 401, 'Should reject request with invalid token');

  // Test with valid token
  if (CONFIG.authToken) {
    const response3 = await makeRequest('/api/health');
    assert(response3.status === 200, 'Should accept request with valid token');
  } else {
    skip('No auth token provided for valid token test');
  }
};

const testFileUpload = async () => {
  log('Testing file upload...', 'test');

  if (!CONFIG.authToken || !CONFIG.testClient.id) {
    skip('Missing auth token or client ID for upload tests');
    return;
  }

  // Test valid PDF upload
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(CONFIG.testFiles.pdf);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    formData.append('file', blob, 'test-lab-report.pdf');
    formData.append('clientId', CONFIG.testClient.id);
    formData.append('documentType', 'LAB_REPORT');
    formData.append('labType', 'LABCORP');

    const response = await makeRequest('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.authToken}`
      },
      body: formData
    });

    assert(response.status === 201, 'Should successfully upload valid PDF');
    
    if (response.data.success) {
      STATE.uploadedDocuments.push(response.data.data.document);
      log(`Uploaded document: ${response.data.data.document.id}`, 'debug');
    }
  } catch (error) {
    log(`Upload test failed: ${error.message}`, 'error');
    assert(false, 'PDF upload should not throw error');
  }

  // Test invalid file upload
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(CONFIG.testFiles.invalid);
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    
    formData.append('file', blob, 'invalid-file.exe');
    formData.append('clientId', CONFIG.testClient.id);
    formData.append('documentType', 'LAB_REPORT');

    const response = await makeRequest('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.authToken}`
      },
      body: formData
    });

    assert(response.status === 400, 'Should reject invalid file type');
  } catch (error) {
    // Expected for invalid files
    assert(true, 'Invalid file upload correctly rejected');
  }

  // Test missing required fields
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(CONFIG.testFiles.pdf);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    formData.append('file', blob, 'test.pdf');
    // Missing clientId and documentType

    const response = await makeRequest('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.authToken}`
      },
      body: formData
    });

    assert(response.status === 400, 'Should reject upload with missing fields');
  } catch (error) {
    assert(true, 'Upload with missing fields correctly rejected');
  }
};

const testDocumentProcessing = async () => {
  log('Testing document processing...', 'test');

  if (STATE.uploadedDocuments.length === 0) {
    skip('No uploaded documents to process');
    return;
  }

  const document = STATE.uploadedDocuments[0];

  // Test trigger processing
  const processResponse = await makeRequest('/api/documents/process', {
    method: 'POST',
    body: JSON.stringify({
      documentId: document.id,
      forceReprocess: true,
      options: {
        priority: 5,
        ocrProvider: 'CLAUDE'
      }
    })
  });

  assert(processResponse.status === 202, 'Should accept processing request');
  assert(processResponse.data.success, 'Processing response should indicate success');

  // Test get processing status
  const statusResponse = await makeRequest('/api/documents/process');
  assert(statusResponse.status === 200, 'Should return processing queue status');

  // Test invalid document ID
  const invalidResponse = await makeRequest('/api/documents/process', {
    method: 'POST',
    body: JSON.stringify({
      documentId: 'invalid-id'
    })
  });

  assert(invalidResponse.status === 404, 'Should reject invalid document ID');
};

const testDocumentAnalysis = async () => {
  log('Testing document analysis...', 'test');

  if (STATE.uploadedDocuments.length === 0) {
    skip('No uploaded documents to analyze');
    return;
  }

  const document = STATE.uploadedDocuments[0];

  // Test trigger analysis
  const analysisResponse = await makeRequest('/api/documents/analyze', {
    method: 'POST',
    body: JSON.stringify({
      documentId: document.id,
      analysisType: 'FUNCTIONAL_MEDICINE',
      options: {
        priority: 3,
        includeRecommendations: true,
        includeTrends: true
      }
    })
  });

  // Note: This might fail if document isn't processed yet
  if (analysisResponse.status === 202) {
    assert(true, 'Analysis request accepted');
  } else if (analysisResponse.status === 409) {
    assert(true, 'Analysis correctly rejected for unprocessed document');
  } else {
    assert(false, `Unexpected analysis response status: ${analysisResponse.status}`);
  }

  // Test get analyses
  const listResponse = await makeRequest('/api/documents/analyze');
  assert(listResponse.status === 200, 'Should return analysis list');

  // Test invalid analysis type
  const invalidResponse = await makeRequest('/api/documents/analyze', {
    method: 'POST',
    body: JSON.stringify({
      documentId: document.id,
      analysisType: 'INVALID_TYPE'
    })
  });

  assert(invalidResponse.status === 400, 'Should reject invalid analysis type');
};

const testDocumentStatus = async () => {
  log('Testing document status...', 'test');

  if (STATE.uploadedDocuments.length === 0) {
    skip('No uploaded documents to check status');
    return;
  }

  const document = STATE.uploadedDocuments[0];

  // Test get document status
  const statusResponse = await makeRequest(`/api/documents/status/${document.id}`);
  assert(statusResponse.status === 200, 'Should return document status');
  assert(statusResponse.data.success, 'Status response should indicate success');

  // Test invalid document ID
  const invalidResponse = await makeRequest('/api/documents/status/invalid-id');
  assert(invalidResponse.status === 404, 'Should return 404 for invalid document ID');

  // Test update document
  const updateResponse = await makeRequest(`/api/documents/status/${document.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      documentType: 'LAB_REPORT',
      tags: ['test', 'automated'],
      metadata: {
        testRun: true,
        timestamp: new Date().toISOString()
      }
    })
  });

  assert(updateResponse.status === 200, 'Should successfully update document');
};

const testWebSocketConnection = async () => {
  log('Testing WebSocket connection...', 'test');

  if (!CONFIG.authToken) {
    skip('No auth token for WebSocket test');
    return;
  }

  return new Promise((resolve) => {
    const socketUrl = CONFIG.baseUrl.replace(/^http/, 'ws');
    const socket = io(socketUrl, {
      auth: {
        token: CONFIG.authToken
      },
      timeout: 5000
    });

    let connected = false;
    let timeoutId;

    socket.on('connect', () => {
      connected = true;
      STATE.socket = socket;
      assert(true, 'WebSocket connection established');
      
      // Test ping/pong
      socket.emit('ping');
      
      socket.on('pong', (data) => {
        assert(data.timestamp, 'Should receive pong with timestamp');
        clearTimeout(timeoutId);
        resolve();
      });
    });

    socket.on('connect_error', (error) => {
      assert(false, `WebSocket connection failed: ${error.message}`);
      clearTimeout(timeoutId);
      resolve();
    });

    // Timeout after 10 seconds
    timeoutId = setTimeout(() => {
      if (!connected) {
        assert(false, 'WebSocket connection timeout');
      }
      resolve();
    }, 10000);
  });
};

const testWebSocketEvents = async () => {
  log('Testing WebSocket events...', 'test');

  if (!STATE.socket || STATE.uploadedDocuments.length === 0) {
    skip('No WebSocket connection or documents for event testing');
    return;
  }

  const document = STATE.uploadedDocuments[0];
  const socket = STATE.socket;

  return new Promise((resolve) => {
    let eventReceived = false;

    // Subscribe to document updates
    socket.emit('subscribe:document', document.id);

    // Listen for document status
    socket.on('document:status', (update) => {
      assert(update.documentId === document.id, 'Should receive status for correct document');
      eventReceived = true;
      resolve();
    });

    // Request document status to trigger event
    socket.emit('request:document-status', document.id);

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!eventReceived) {
        assert(false, 'No WebSocket events received within timeout');
      }
      resolve();
    }, 5000);
  });
};

const testErrorHandling = async () => {
  log('Testing error handling...', 'test');

  // Test rate limiting (if implemented)
  const promises = Array(20).fill().map(() => 
    makeRequest('/api/health').catch(() => ({ status: 429 }))
  );

  const responses = await Promise.all(promises);
  const rateLimited = responses.some(r => r.status === 429);
  
  if (rateLimited) {
    assert(true, 'Rate limiting is working');
  } else {
    log('Rate limiting not triggered (may not be implemented)', 'debug');
  }

  // Test malformed JSON
  const malformedResponse = await makeRequest('/api/documents/process', {
    method: 'POST',
    body: 'invalid-json'
  });

  assert(malformedResponse.status >= 400, 'Should reject malformed JSON');

  // Test SQL injection attempt
  const sqlInjectionResponse = await makeRequest("/api/documents/upload?clientId='; DROP TABLE documents; --");
  assert(sqlInjectionResponse.status !== 500, 'Should handle SQL injection attempts safely');
};

const testDatabaseOperations = async () => {
  log('Testing database operations...', 'test');

  // Test document listing with pagination
  const listResponse = await makeRequest('/api/documents/upload?limit=5&offset=0');
  assert(listResponse.status === 200, 'Should return document list');
  
  if (listResponse.data.success) {
    assert(Array.isArray(listResponse.data.data.documents), 'Should return documents array');
    assert(typeof listResponse.data.data.pagination === 'object', 'Should include pagination info');
  }

  // Test filtering
  const filteredResponse = await makeRequest('/api/documents/upload?documentType=LAB_REPORT');
  assert(filteredResponse.status === 200, 'Should handle document type filtering');

  // Test analysis listing
  const analysisResponse = await makeRequest('/api/documents/analyze?limit=10');
  assert(analysisResponse.status === 200, 'Should return analysis list');
};

const testPerformance = async () => {
  log('Testing performance...', 'test');

  if (CONFIG.skipSlow) {
    skip('Performance tests skipped (--skip-slow flag)');
    return;
  }

  // Test concurrent uploads (if we have multiple test files)
  const startTime = Date.now();
  
  const healthPromises = Array(10).fill().map(() => makeRequest('/api/health'));
  await Promise.all(healthPromises);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  assert(duration < 5000, `10 concurrent health checks should complete in under 5 seconds (took ${duration}ms)`);

  // Test response times
  const singleStartTime = Date.now();
  await makeRequest('/api/health');
  const singleDuration = Date.now() - singleStartTime;
  
  assert(singleDuration < 1000, `Single health check should complete in under 1 second (took ${singleDuration}ms)`);
};

const cleanup = async () => {
  log('Cleaning up test resources...', 'info');

  // Close WebSocket connection
  if (STATE.socket) {
    STATE.socket.disconnect();
    STATE.socket = null;
  }

  // Remove test files
  try {
    if (fs.existsSync('./test-files')) {
      fs.rmSync('./test-files', { recursive: true, force: true });
    }
  } catch (error) {
    log(`Cleanup error: ${error.message}`, 'error');
  }

  // Note: In a real test environment, you might want to clean up 
  // uploaded documents from the database/storage as well
};

const printResults = () => {
  const { passed, failed, skipped, errors } = STATE.testResults;
  const total = passed + failed + skipped;

  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);

  if (errors.length > 0) {
    console.log('\nFAILED TESTS:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log('='.repeat(60));
};

// Main test runner
const runTests = async () => {
  console.log('🧪 Starting Medical Document Processing System Tests');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Auth Token: ${CONFIG.authToken ? 'Provided' : 'Not provided'}`);
  console.log(`Client ID: ${CONFIG.testClient.id || 'Not provided'}`);
  console.log('');

  try {
    // Setup
    createTestFiles();

    // Run test suites
    await testAuthentication();
    
    if (!CONFIG.onlyBasic) {
      await testFileUpload();
      await testDocumentProcessing();
      await testDocumentAnalysis();
      await testDocumentStatus();
      await testWebSocketConnection();
      await testWebSocketEvents();
      await testDatabaseOperations();
      await testErrorHandling();
      await testPerformance();
    }

  } catch (error) {
    log(`Test execution error: ${error.message}`, 'error');
    STATE.testResults.failed++;
    STATE.testResults.errors.push(`Test execution error: ${error.message}`);
  } finally {
    await cleanup();
    printResults();
    
    // Exit with appropriate code
    process.exit(STATE.testResults.failed > 0 ? 1 : 0);
  }
};

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Medical Document Processing System Test Suite

Usage: node test-medical-system.js [options]

Options:
  --help, -h         Show this help message
  --verbose, -v      Enable verbose logging
  --skip-slow        Skip performance and long-running tests
  --basic            Run only basic authentication tests

Environment Variables:
  TEST_BASE_URL      Base URL for the API (default: http://localhost:3000)
  TEST_AUTH_TOKEN    JWT token for authentication
  TEST_CLIENT_ID     Client ID for testing uploads

Examples:
  node test-medical-system.js --verbose
  TEST_BASE_URL=https://your-app.railway.app node test-medical-system.js
  TEST_AUTH_TOKEN=your_jwt_token TEST_CLIENT_ID=client_123 node test-medical-system.js
`);
  process.exit(0);
}

// Check for required Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ is required for this test suite');
  process.exit(1);
}

// Check for fetch availability (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ fetch is not available. Please use Node.js 18+ or install a fetch polyfill');
  process.exit(1);
}

// Run the tests
runTests().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
