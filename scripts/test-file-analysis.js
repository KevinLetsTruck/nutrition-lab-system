require('dotenv').config({ path: '.env.local' });

async function testFileAnalysis() {
  console.log('🧪 Testing File Analysis...\n');

  try {
    // Test with the most recent NAQ file
    const filePath = '2025/08/04/NAQ-Questions-Answers-4_1754310630966_9bjo6nhj8la.pdf';
    const fileName = 'NAQ-Questions-Answers-4.pdf';
    const bucket = 'lab-files';

    console.log(`📄 Testing analysis of: ${fileName}`);
    console.log(`📁 Path: ${filePath}`);
    console.log(`🪣 Bucket: ${bucket}`);

    // Call the quick-analysis API
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/quick-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath,
        fileName,
        bucket
      })
    });

    if (!response.ok) {
      console.log(`❌ Analysis failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Analysis succeeded!');
    
    console.log('\n📊 Analysis Results:');
    console.log('- Success:', result.success);
    console.log('- Report Type:', result.reportType);
    console.log('- Extraction Method:', result.extractionMethod);
    console.log('- Processing Time:', result.processingTime, 'ms');
    
    if (result.analyzedReport) {
      console.log('\n📋 Analyzed Report:');
      console.log('- Type:', result.analyzedReport.reportType);
      console.log('- Confidence:', result.analyzedReport.confidence);
      
      if (result.analyzedReport.totalScore) {
        console.log('- Total Score:', result.analyzedReport.totalScore);
      }
      
      if (result.analyzedReport.bodySystems) {
        console.log('- Body Systems:', Object.keys(result.analyzedReport.bodySystems).length);
        Object.entries(result.analyzedReport.bodySystems).forEach(([system, data]) => {
          console.log(`  - ${system}: ${data.score}/100`);
        });
      }
    }

    console.log('\n🎯 Analysis completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFileAnalysis(); 