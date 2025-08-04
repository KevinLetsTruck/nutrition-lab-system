require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const fs = require('fs').promises;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTextractDirect() {
  console.log('🧪 Testing AWS Textract directly...\n');

  try {
    // Download the test file
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
    
    // Save to temp file
    const tempPath = './temp-test-file.pdf';
    const buffer = Buffer.from(await fileData.arrayBuffer());
    await fs.writeFile(tempPath, buffer);
    console.log(`💾 Saved to: ${tempPath}`);
    
    // Initialize Textract client
    const textractClient = new TextractClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log('🔧 Textract client initialized');
    console.log('🔑 AWS Region:', process.env.AWS_REGION || 'us-east-1');
    console.log('🔑 Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
    
    // Prepare the document
    const document = {
      Bytes: new Uint8Array(buffer)
    };
    
    console.log('📄 Document prepared, size:', document.Bytes.length, 'bytes');
    
    // Configure what to extract
    const featureTypes = ['TABLES', 'FORMS'];
    
    // Send to Textract
    const command = new AnalyzeDocumentCommand({
      Document: document,
      FeatureTypes: featureTypes
    });
    
    console.log('🚀 Sending to AWS Textract...');
    
    const response = await textractClient.send(command);
    
    console.log('✅ Textract response received');
    console.log('📊 Blocks extracted:', response.Blocks?.length || 0);
    
    if (response.Blocks && response.Blocks.length > 0) {
      // Extract text from blocks
      const textBlocks = response.Blocks.filter(block => block.BlockType === 'LINE');
      console.log('📝 Text lines found:', textBlocks.length);
      
      // Show first few lines
      const firstLines = textBlocks.slice(0, 5).map(block => block.Text).filter(Boolean);
      console.log('📝 First few lines:');
      firstLines.forEach((line, index) => {
        console.log(`  ${index + 1}. ${line}`);
      });
    }
    
    // Clean up
    await fs.unlink(tempPath);
    console.log(`🗑️ Cleaned up: ${tempPath}`);
    
  } catch (error) {
    console.error('❌ Textract test failed:', error);
    console.error('❌ Error details:', error.message);
    
    if (error.name === 'UnsupportedDocumentException') {
      console.log('🔍 This PDF format is not supported by Textract');
      console.log('💡 Possible solutions:');
      console.log('   - Convert PDF to a supported format');
      console.log('   - Use a different OCR service');
      console.log('   - Check if PDF is password-protected or encrypted');
    }
  }
}

testTextractDirect(); 