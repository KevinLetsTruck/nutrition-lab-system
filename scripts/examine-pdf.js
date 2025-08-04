require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function examinePDF() {
  console.log('🔍 Examining PDF Content...\n');

  try {
    // Download the PDF file
    const filePath = '2025/08/04/NAQ-Questions-Answers-4_1754310630966_9bjo6nhj8la.pdf';
    
    console.log(`📥 Downloading: ${filePath}`);
    
    const { data: fileBuffer, error: downloadError } = await supabase
      .storage
      .from('lab-files')
      .download(filePath);

    if (downloadError || !fileBuffer) {
      console.log('❌ Failed to download file:', downloadError);
      return;
    }

    console.log(`✅ Downloaded successfully: ${fileBuffer.size} bytes`);

    // Convert to Buffer
    const buffer = Buffer.from(await fileBuffer.arrayBuffer());
    
    // Save to local file for inspection
    const localFile = 'temp_pdf_examination.pdf';
    fs.writeFileSync(localFile, buffer);
    console.log(`💾 Saved to: ${localFile}`);

    // Examine the PDF content
    console.log('\n🔍 Examining PDF content:');
    
    // Check file header
    const header = buffer.slice(0, 20);
    console.log('📄 File header (hex):', header.toString('hex'));
    console.log('📄 File header (ascii):', header.toString('ascii'));
    console.log('📄 Is PDF:', header.toString('ascii').startsWith('%PDF'));

    // Try different text extraction methods
    console.log('\n🔍 Text extraction attempts:');
    
    // Method 1: Direct UTF-8
    const utf8Text = buffer.toString('utf8');
    console.log('1. UTF-8 length:', utf8Text.length);
    console.log('   Contains NAQ:', utf8Text.includes('NAQ'));
    console.log('   Contains Assessment:', utf8Text.includes('Assessment'));
    console.log('   First 200 chars:', utf8Text.substring(0, 200).replace(/\n/g, ' '));

    // Method 2: Latin1
    const latin1Text = buffer.toString('latin1');
    console.log('\n2. Latin1 length:', latin1Text.length);
    console.log('   Contains NAQ:', latin1Text.includes('NAQ'));
    console.log('   Contains Assessment:', latin1Text.includes('Assessment'));
    console.log('   First 200 chars:', latin1Text.substring(0, 200).replace(/\n/g, ' '));

    // Method 3: Look for readable chunks
    const readableChunks = latin1Text.match(/[\x20-\x7E\s]{30,}/g) || [];
    console.log('\n3. Readable chunks found:', readableChunks.length);
    if (readableChunks.length > 0) {
      console.log('   First chunk:', readableChunks[0]);
      console.log('   Second chunk:', readableChunks[1]);
    }

    // Method 4: Look for PDF text operators
    const btMatches = latin1Text.match(/BT[\s\S]*?ET/g) || [];
    console.log('\n4. BT/ET text blocks found:', btMatches.length);
    if (btMatches.length > 0) {
      console.log('   First BT/ET block:', btMatches[0].substring(0, 200));
    }

    // Method 5: Look for text strings in parentheses
    const textStrings = latin1Text.match(/\(([^)]+)\)/g) || [];
    console.log('\n5. Text strings in parentheses:', textStrings.length);
    if (textStrings.length > 0) {
      console.log('   First 5 strings:');
      textStrings.slice(0, 5).forEach((str, i) => {
        console.log(`     ${i + 1}. ${str}`);
      });
    }

    // Check if it's image-based
    const imageIndicators = ['/XObject', '/Image', '/Subtype /Image'];
    const isImageBased = imageIndicators.some(indicator => latin1Text.includes(indicator));
    console.log('\n6. Image-based indicators:', isImageBased ? 'Found' : 'Not found');

    console.log('\n🎯 PDF examination completed!');

  } catch (error) {
    console.error('❌ Examination failed:', error);
  }
}

examinePDF(); 