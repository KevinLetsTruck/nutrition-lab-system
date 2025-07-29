const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Base URL for the local development server
const BASE_URL = 'http://localhost:3000';

// Test client information
const testClient = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
};

async function testUploadEndpoint() {
  log('\n🔍 STEP 1: TEST UPLOAD ENDPOINT', 'cyan');
  log('================================', 'cyan');
  
  try {
    // Create a test PDF content
    const testPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test Lab Report) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000299 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
391
%%EOF`;

    // Create a FormData object
    const formData = new FormData();
    const blob = new Blob([testPdfContent], { type: 'application/pdf' });
    formData.append('file', blob, 'test-lab-report.pdf');
    formData.append('clientEmail', testClient.email);
    formData.append('clientFirstName', testClient.firstName);
    formData.append('clientLastName', testClient.lastName);
    formData.append('category', 'lab_reports');
    
    log('📤 Uploading test PDF file...', 'blue');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      log(`❌ Upload failed: ${JSON.stringify(uploadResult, null, 2)}`, 'red');
      return null;
    }
    
    log('✅ Upload successful!', 'green');
    log(`   Lab Report ID: ${uploadResult.files[0].labReportId}`, 'green');
    log(`   Storage Path: ${uploadResult.files[0].storagePath}`, 'green');
    log(`   Storage URL: ${uploadResult.files[0].storageUrl}`, 'green');
    
    return uploadResult.files[0];
  } catch (err) {
    log(`❌ Upload exception: ${err.message}`, 'red');
    return null;
  }
}

async function testAnalyzeEndpoint(uploadedFile) {
  if (!uploadedFile) {
    log('\n⚠️  Skipping analysis test (no file uploaded)', 'yellow');
    return;
  }
  
  log('\n🔍 STEP 2: TEST ANALYZE ENDPOINT', 'cyan');
  log('=================================', 'cyan');
  
  try {
    log('🧪 Analyzing uploaded file...', 'blue');
    
    const analyzeResponse = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labReportId: uploadedFile.labReportId
      })
    });
    
    const analyzeResult = await analyzeResponse.json();
    
    if (!analyzeResponse.ok) {
      log(`❌ Analysis failed: ${JSON.stringify(analyzeResult, null, 2)}`, 'red');
      return false;
    }
    
    log('✅ Analysis successful!', 'green');
    log(`   Analysis Status: ${analyzeResult.success ? 'Complete' : 'Failed'}`, 'green');
    if (analyzeResult.analysis) {
      log(`   Report Type: ${analyzeResult.analysis.reportType || 'Unknown'}`, 'green');
      log(`   AI Model: ${analyzeResult.analysis.aiModel || 'Not specified'}`, 'green');
    }
    
    return true;
  } catch (err) {
    log(`❌ Analysis exception: ${err.message}`, 'red');
    return false;
  }
}

async function testStatusCheck(labReportId) {
  if (!labReportId) {
    log('\n⚠️  Skipping status check (no report ID)', 'yellow');
    return;
  }
  
  log('\n🔍 STEP 3: CHECK ANALYSIS STATUS', 'cyan');
  log('=================================', 'cyan');
  
  try {
    const statusResponse = await fetch(`${BASE_URL}/api/analyze?id=${labReportId}`);
    const statusResult = await statusResponse.json();
    
    if (!statusResponse.ok) {
      log(`❌ Status check failed: ${JSON.stringify(statusResult, null, 2)}`, 'red');
      return false;
    }
    
    log('✅ Status check successful!', 'green');
    log(`   Report Status: ${statusResult.analysis?.status || 'Unknown'}`, 'green');
    
    return true;
  } catch (err) {
    log(`❌ Status check exception: ${err.message}`, 'red');
    return false;
  }
}

async function checkServerStatus() {
  log('\n🔍 CHECKING SERVER STATUS', 'cyan');
  log('=========================', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) {
      log('❌ Server is not responding at http://localhost:3000', 'red');
      log('   Please ensure your development server is running on port 3000', 'yellow');
      return false;
    }
    log('✅ Server is running', 'green');
    return true;
  } catch (err) {
          log('❌ Cannot connect to server at http://localhost:3000', 'red');
    log('   Error: ' + err.message, 'red');
    log('   Please ensure your development server is running: npm run dev', 'yellow');
    return false;
  }
}

async function main() {
  log('🚀 NUTRITION LAB SYSTEM - FULL FLOW TEST', 'magenta');
  log('========================================', 'magenta');
  log(`Started at: ${new Date().toISOString()}`, 'blue');
  
  try {
    // Check server status first
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
      process.exit(1);
    }
    
    // Test 1: Upload a file
    const uploadedFile = await testUploadEndpoint();
    
    // Test 2: Analyze the file
    const analysisSuccess = await testAnalyzeEndpoint(uploadedFile);
    
    // Test 3: Check status
    const statusSuccess = await testStatusCheck(uploadedFile?.labReportId);
    
    // Summary
    log('\n📊 SUMMARY', 'magenta');
    log('==========', 'magenta');
    log(`${uploadedFile ? '✅' : '❌'} File upload: ${uploadedFile ? 'Success' : 'Failed'}`, uploadedFile ? 'green' : 'red');
    log(`${analysisSuccess ? '✅' : '❌'} File analysis: ${analysisSuccess ? 'Success' : 'Failed'}`, analysisSuccess ? 'green' : 'red');
    log(`${statusSuccess ? '✅' : '❌'} Status check: ${statusSuccess ? 'Success' : 'Failed'}`, statusSuccess ? 'green' : 'red');
    
    if (uploadedFile && analysisSuccess) {
      log('\n🎉 CONGRATULATIONS!', 'green');
      log('==================', 'green');
      log('✅ Supabase Storage integration is working correctly!', 'green');
      log('✅ Files are being uploaded to cloud storage', 'green');
      log('✅ Files are being retrieved for analysis', 'green');
      log('✅ The complete upload → analyze flow is functional', 'green');
      
      log('\n🚀 NEXT STEPS', 'cyan');
      log('=============', 'cyan');
      log('1. Deploy to Vercel to test in production', 'cyan');
      log('2. Verify environment variables are set in Vercel', 'cyan');
      log('3. Test the production deployment', 'cyan');
    } else {
      log('\n⚠️  ISSUES DETECTED', 'yellow');
      log('==================', 'yellow');
      if (!uploadedFile) {
        log('- File upload failed. Check:', 'yellow');
        log('  • Supabase Storage bucket policies', 'yellow');
        log('  • Environment variables', 'yellow');
        log('  • Network connectivity', 'yellow');
      }
      if (!analysisSuccess && uploadedFile) {
        log('- File analysis failed. Check:', 'yellow');
        log('  • Claude API key configuration', 'yellow');
        log('  • PDF parser functionality', 'yellow');
        log('  • Error logs in console', 'yellow');
      }
    }
    
  } catch (err) {
    log(`\n❌ FATAL ERROR: ${err.message}`, 'red');
    console.error(err);
  }
}

// Run the test
main().catch(console.error); 