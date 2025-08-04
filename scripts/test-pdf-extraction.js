require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPDFExtraction() {
  console.log('🔍 Testing PDF Extraction...\n');

  try {
    // Get a recent file from storage
    const { data: files, error: filesError } = await supabase
      .storage
      .from('quick-analysis')
      .list('2025/08/04', {
        limit: 1,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (filesError || !files || files.length === 0) {
      console.log('❌ No files found in storage');
      return;
    }

    const fileName = files[0].name;
    console.log(`📄 Testing with file: ${fileName}`);

    // Download the file
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from('quick-analysis')
      .download(`2025/08/04/${fileName}`);

    if (downloadError || !fileBuffer) {
      console.log('❌ Failed to download file:', downloadError);
      return;
    }

    console.log(`📊 File size: ${fileBuffer.size} bytes`);

    // Convert to Buffer
    const buffer = Buffer.from(await fileBuffer.arrayBuffer());
    
    // Test different extraction methods
    console.log('\n🔍 Testing extraction methods:');

    // Method 1: Direct buffer to string
    console.log('\n1. Direct buffer to string:');
    const directString = buffer.toString('utf8');
    console.log('   Length:', directString.length);
    console.log('   First 200 chars:', directString.substring(0, 200));
    console.log('   Contains NAQ:', directString.includes('NAQ'));
    console.log('   Contains Symptom:', directString.includes('Symptom'));

    // Method 2: Latin1 encoding
    console.log('\n2. Latin1 encoding:');
    const latin1String = buffer.toString('latin1');
    console.log('   Length:', latin1String.length);
    console.log('   First 200 chars:', latin1String.substring(0, 200));
    console.log('   Contains NAQ:', latin1String.includes('NAQ'));
    console.log('   Contains Symptom:', latin1String.includes('Symptom'));

    // Method 3: Look for readable chunks
    console.log('\n3. Readable chunks:');
    const readableChunks = latin1String.match(/[\x20-\x7E\s]{20,}/g) || [];
    console.log('   Number of chunks:', readableChunks.length);
    if (readableChunks.length > 0) {
      console.log('   First chunk:', readableChunks[0]);
      console.log('   Second chunk:', readableChunks[1]);
    }

    // Method 4: Check file header
    console.log('\n4. File header:');
    const header = buffer.slice(0, 10);
    console.log('   Hex:', header.toString('hex'));
    console.log('   ASCII:', header.toString('ascii'));
    console.log('   Is PDF:', header.toString('ascii').startsWith('%PDF'));

    // Method 5: Look for specific assessment keywords
    console.log('\n5. Assessment keywords:');
    const keywords = ['NAQ', 'Symptom', 'Assessment', 'Questionnaire', 'Score', 'Total'];
    keywords.forEach(keyword => {
      const count = (latin1String.match(new RegExp(keyword, 'gi')) || []).length;
      console.log(`   ${keyword}: ${count} occurrences`);
    });

    // Save a sample to file for manual inspection
    const sampleFile = `temp_pdf_sample_${Date.now()}.txt`;
    fs.writeFileSync(sampleFile, latin1String.substring(0, 5000));
    console.log(`\n💾 Saved sample to: ${sampleFile}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPDFExtraction(); 