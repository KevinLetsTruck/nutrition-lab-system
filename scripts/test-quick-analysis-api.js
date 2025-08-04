require('dotenv').config({ path: '.env.local' });

async function testQuickAnalysisAPI() {
  console.log('🧪 Testing Quick Analysis API directly...\n');

  try {
    // Test with a specific file that exists in storage
    const testFile = {
      fileName: 'corkadel_carole_fit176_report_07jul25_1754270359932_i8jv5erhctc.pdf',
      filePath: '2025/08/04/corkadel_carole_fit176_report_07jul25_1754270359932_i8jv5erhctc.pdf',
      bucket: 'lab-files'
    };

    console.log(`📄 Testing with file: ${testFile.fileName}`);
    console.log(`📁 Path: ${testFile.filePath}`);
    console.log(`🪣 Bucket: ${testFile.bucket}`);

    // Make a direct API call to the quick-analysis endpoint
    const response = await fetch('http://localhost:3000/api/quick-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: testFile.fileName,
        filePath: testFile.filePath,
        bucket: testFile.bucket
      })
    });

    console.log(`\n📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log(`❌ Error JSON:`, JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log(`❌ Error is not JSON: ${errorText}`);
      }
    } else {
      const result = await response.json();
      console.log(`✅ Success Response:`, JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

testQuickAnalysisAPI(); 