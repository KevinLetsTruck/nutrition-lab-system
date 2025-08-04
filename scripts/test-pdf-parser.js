require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPDFParser() {
  console.log('🧪 Testing PDF Parser directly...\n');

  try {
    // Download a test file
    const fileName = 'corkadel_carole_fit176_report_07jul25_1754270359932_i8jv5erhctc.pdf';
    const filePath = '2025/08/04/corkadel_carole_fit176_report_07jul25_1754270359932_i8jv5erhctc.pdf';
    
    console.log(`📄 Downloading: ${fileName}`);
    
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('lab-files')
      .download(filePath);
    
    if (downloadError) {
      console.error('❌ Download failed:', downloadError);
      return;
    }
    
    console.log(`✅ File downloaded, size: ${fileData.size} bytes`);
    
    // Save to temp file for inspection
    const tempPath = './temp-test-file.pdf';
    const buffer = Buffer.from(await fileData.arrayBuffer());
    await fs.writeFile(tempPath, buffer);
    console.log(`💾 Saved to: ${tempPath}`);
    
    // Test basic buffer operations
    console.log(`📊 Buffer size: ${buffer.length} bytes`);
    
    // Test basic text extraction
    const bufferString = buffer.toString('latin1');
    console.log(`📝 Buffer as string length: ${bufferString.length}`);
    
    // Look for PDF indicators
    const hasPDFHeader = bufferString.includes('%PDF');
    const hasEndOfFile = bufferString.includes('%%EOF');
    console.log(`📄 PDF Header found: ${hasPDFHeader}`);
    console.log(`📄 PDF EOF found: ${hasEndOfFile}`);
    
    // Look for text content indicators
    const hasTextOperators = bufferString.includes('BT') && bufferString.includes('ET');
    const hasTextStrings = bufferString.includes('(') && bufferString.includes(')');
    console.log(`📝 Text operators (BT/ET): ${hasTextOperators}`);
    console.log(`📝 Text strings (parentheses): ${hasTextStrings}`);
    
    // Look for assessment content
    const hasNAQ = bufferString.includes('NAQ');
    const hasSymptom = bufferString.includes('Symptom');
    const hasAssessment = bufferString.includes('Assessment');
    console.log(`📋 Contains NAQ: ${hasNAQ}`);
    console.log(`📋 Contains Symptom: ${hasSymptom}`);
    console.log(`📋 Contains Assessment: ${hasAssessment}`);
    
    // Test the parsePDFServerless function
    console.log('\n🔍 Testing parsePDFServerless function...');
    
    // Import the function
    const { parsePDFServerless } = require('../src/lib/pdf-parser-serverless');
    
    try {
      const result = await parsePDFServerless(buffer);
      console.log(`✅ parsePDFServerless succeeded`);
      console.log(`📝 Extracted text length: ${result.text.length}`);
      console.log(`📄 Page count: ${result.pageCount}`);
      console.log(`📝 First 200 chars: ${result.text.substring(0, 200)}`);
    } catch (parseError) {
      console.error('❌ parsePDFServerless failed:', parseError.message);
    }
    
    // Clean up
    await fs.unlink(tempPath);
    console.log(`🗑️ Cleaned up: ${tempPath}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPDFParser(); 