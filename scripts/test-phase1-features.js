require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_CLIENT_ID = process.env.TEST_CLIENT_ID || '0a8b5c4f-b1e3-4db3-9a2f-c8e9a1b2c3d4';

// Test files - we'll use existing PDFs or create test data
const TEST_FILES = [
  'temp_pdf_examination.pdf',
  'temp-test-file.pdf'
];

console.log('🧪 Testing Phase 1 Features');
console.log('==========================\n');

// Test 1: Medical Terminology Processor
async function testMedicalTerminologyProcessor() {
  console.log('📝 Test 1: Medical Terminology Processor');
  console.log('----------------------------------------');
  
  try {
    // Create test medical text with common OCR errors
    const testText = `
      Patient Lab Results:
      
      hem0globin: 14.5 g/dl
      gluc0se: 95 mg/d1
      cholester0l: 185 mg/dL
      creat1nine: 0.9 mg/dl
      p0tassium: 4.2 mEq/l
      
      Abbreviations found:
      hgb: 14.5
      glu: 95
      chol: 185
      cr: 0.9
      k: 4.2
      
      Thyroid Panel:
      tsh: 2.5 mIU/L
      ft4: 1.2 ng/dl
      ft3: 3.1 pg/ml
    `;
    
    // Call the API to test medical terminology enhancement
    const response = await fetch(`${BASE_URL}/api/test-medical-terms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testText })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Medical terminology processing successful!');
      console.log('- Original text length:', testText.length);
      console.log('- Enhanced text length:', result.enhancedText?.length || 0);
      console.log('- Medical terms found:', result.medicalTerms?.length || 0);
      console.log('- OCR confidence:', result.overallConfidence || 0);
      console.log('- Corrections made:', result.corrections?.length || 0);
    } else {
      console.log('❌ Medical terminology test failed:', response.statusText);
    }
  } catch (error) {
    console.log('❌ Medical terminology test error:', error.message);
  }
  
  console.log('\n');
}

// Test 2: Batch Document Processing
async function testBatchProcessing() {
  console.log('📦 Test 2: Batch Document Processing');
  console.log('------------------------------------');
  
  try {
    // Check if test files exist
    const existingFiles = TEST_FILES.filter(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (existingFiles.length === 0) {
      console.log('⚠️  No test PDF files found. Creating test files...');
      // Create a simple test PDF if none exist
      fs.writeFileSync('test-batch-1.pdf', 'Test PDF content 1');
      fs.writeFileSync('test-batch-2.pdf', 'Test PDF content 2');
      existingFiles.push('test-batch-1.pdf', 'test-batch-2.pdf');
    }
    
    console.log(`Found ${existingFiles.length} test files:`, existingFiles);
    
    // Create form data for batch upload
    const formData = new FormData();
    formData.append('clientId', TEST_CLIENT_ID);
    formData.append('processType', 'comprehensive');
    
    existingFiles.forEach((file, index) => {
      const filePath = path.join(process.cwd(), file);
      formData.append(`document_${index}`, fs.createReadStream(filePath));
      formData.append(`document_${index}_type`, 'nutriq');
      formData.append(`document_${index}_metadata`, JSON.stringify({
        originalName: file,
        uploadedAt: new Date().toISOString()
      }));
    });
    
    // Submit batch job
    console.log('Submitting batch job...');
    const response = await fetch(`${BASE_URL}/api/batch-process`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Batch job created successfully!');
      console.log('- Job ID:', result.jobId);
      console.log('- Status URL:', result.statusUrl);
      
      // Poll for job completion
      console.log('\nChecking job status...');
      let jobComplete = false;
      let attempts = 0;
      
      while (!jobComplete && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const statusResponse = await fetch(`${BASE_URL}${result.statusUrl}`);
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          console.log(`Progress: ${status.progress.percentage}% (${status.progress.processed}/${status.progress.total})`);
          
          if (status.status === 'completed' || status.status === 'failed') {
            jobComplete = true;
            console.log(`\nJob ${status.status}!`);
            if (status.errors.length > 0) {
              console.log('Errors:', status.errors);
            }
            if (status.results.length > 0) {
              console.log('Results:', status.results.length, 'documents processed');
            }
          }
        }
        attempts++;
      }
      
      if (!jobComplete) {
        console.log('⚠️  Job did not complete within timeout');
      }
    } else {
      console.log('❌ Batch processing test failed:', response.statusText);
    }
    
    // Clean up test files if we created them
    if (fs.existsSync('test-batch-1.pdf')) fs.unlinkSync('test-batch-1.pdf');
    if (fs.existsSync('test-batch-2.pdf')) fs.unlinkSync('test-batch-2.pdf');
    
  } catch (error) {
    console.log('❌ Batch processing test error:', error.message);
  }
  
  console.log('\n');
}

// Test 3: Document Versioning
async function testDocumentVersioning() {
  console.log('📚 Test 3: Document Versioning');
  console.log('------------------------------');
  
  try {
    // Get a test client
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .limit(1)
      .single();
    
    if (clientError || !clients) {
      console.log('⚠️  No clients found for testing. Using default client ID.');
    }
    
    const clientId = clients?.id || TEST_CLIENT_ID;
    console.log('Using client:', clients?.name || clientId);
    
    // Test document versioning by simulating document updates
    const testDocument = {
      clientId,
      fileName: 'test-versioning.pdf',
      documentType: 'nutriq',
      extractedData: {
        rawText: 'Initial document content',
        totalScore: 45,
        bodySystems: {
          digestive: 8,
          immune: 6,
          energy: 7
        }
      }
    };
    
    // Version 1
    console.log('\nCreating document version 1...');
    let response = await fetch(`${BASE_URL}/api/document-versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testDocument)
    });
    
    if (response.ok) {
      const v1Result = await response.json();
      console.log('✅ Version 1 created:', v1Result.version?.versionNumber);
      
      // Version 2 with changes
      console.log('\nCreating document version 2 with changes...');
      testDocument.extractedData.totalScore = 52;
      testDocument.extractedData.bodySystems.digestive = 9;
      testDocument.extractedData.enhancedText = 'Enhanced with medical terminology';
      
      response = await fetch(`${BASE_URL}/api/document-versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testDocument,
          documentId: v1Result.document.id
        })
      });
      
      if (response.ok) {
        const v2Result = await response.json();
        console.log('✅ Version 2 created:', v2Result.version?.versionNumber);
        
        // Compare versions
        console.log('\nComparing versions...');
        response = await fetch(`${BASE_URL}/api/document-versions/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: v1Result.document.id,
            fromVersion: 1,
            toVersion: 2
          })
        });
        
        if (response.ok) {
          const comparison = await response.json();
          console.log('✅ Version comparison complete!');
          console.log('- Clinical significance:', comparison.clinicalSignificance);
          console.log('- Change summary:', comparison.changeSummary);
        }
        
        // Get version history
        console.log('\nRetrieving version history...');
        response = await fetch(`${BASE_URL}/api/document-versions/${v1Result.document.id}`);
        
        if (response.ok) {
          const history = await response.json();
          console.log('✅ Version history retrieved!');
          console.log('- Total versions:', history.versions?.length || 0);
          console.log('- Comparisons:', history.comparisons?.length || 0);
          console.log('- Audit entries:', history.auditLog?.length || 0);
        }
      }
    } else {
      console.log('❌ Document versioning test failed:', response.statusText);
    }
    
  } catch (error) {
    console.log('❌ Document versioning test error:', error.message);
  }
  
  console.log('\n');
}

// Test 4: Integration Test - Full Pipeline
async function testFullPipeline() {
  console.log('🔄 Test 4: Full Integration Pipeline');
  console.log('------------------------------------');
  
  try {
    // Use an existing PDF file
    const testFile = TEST_FILES.find(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (!testFile) {
      console.log('⚠️  No test PDF file found for integration test');
      return;
    }
    
    console.log('Using test file:', testFile);
    
    // Upload and process with all Phase 1 features
    const formData = new FormData();
    formData.append('file', fs.createReadStream(path.join(process.cwd(), testFile)));
    formData.append('clientId', TEST_CLIENT_ID);
    formData.append('enableMedicalEnhancement', 'true');
    formData.append('enableVersioning', 'true');
    
    console.log('Processing document with full pipeline...');
    const response = await fetch(`${BASE_URL}/api/analyze-enhanced`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Full pipeline processing successful!');
      console.log('- Document type detected:', result.reportType);
      console.log('- Medical terms enhanced:', result.medicalTermsEnhanced || false);
      console.log('- OCR confidence:', result.ocrConfidence);
      console.log('- Version created:', result.versionNumber);
      console.log('- Processing time:', result.processingTime || 'N/A');
    } else {
      console.log('❌ Full pipeline test failed:', response.statusText);
    }
    
  } catch (error) {
    console.log('❌ Full pipeline test error:', error.message);
  }
  
  console.log('\n');
}

// Main test runner
async function runAllTests() {
  console.log('Starting Phase 1 Feature Tests...\n');
  
  // Note: Some tests require API endpoints that may not exist yet
  // We'll create simple test endpoints if needed
  
  await testMedicalTerminologyProcessor();
  await testBatchProcessing();
  await testDocumentVersioning();
  await testFullPipeline();
  
  console.log('====================================');
  console.log('✅ Phase 1 Testing Complete!');
  console.log('====================================\n');
  
  console.log('Next steps:');
  console.log('1. Review any failed tests above');
  console.log('2. Create the missing API endpoints if needed');
  console.log('3. Test with real medical documents');
  console.log('4. Monitor performance and accuracy metrics');
}

// Run tests
runAllTests().catch(console.error);