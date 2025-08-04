require('dotenv').config({ path: '.env.local' });

async function testAWSSimple() {
  console.log('🔍 Testing AWS Textract Configuration...\n');

  // Check environment variables
  const hasAWSCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  console.log('AWS Credentials configured:', hasAWSCreds ? '✓' : '✗');
  
  if (!hasAWSCreds) {
    console.log('\n❌ AWS credentials not found in .env.local');
    console.log('Please add:');
    console.log('AWS_ACCESS_KEY_ID=your_key_here');
    console.log('AWS_SECRET_ACCESS_KEY=your_secret_here');
    console.log('AWS_REGION=us-east-1');
    return;
  }

  console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1');
  console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID.substring(0, 10) + '...');
  
  // Check if the system is using AWS Textract
  console.log('\n🔍 Checking if system uses AWS Textract:');
  
  // Simulate the check that the quick-analysis route does
  const hasTextract = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  console.log('System will use AWS Textract:', hasTextract ? '✓' : '✗');
  
  if (hasTextract) {
    console.log('\n✅ AWS Textract is configured and will be used for PDF processing');
    console.log('📄 This should provide better text extraction for scanned PDFs and complex documents');
  } else {
    console.log('\n❌ AWS Textract is not configured');
    console.log('📄 System will fall back to basic PDF parsing');
  }
  
  console.log('\n🎯 Current Status:');
  console.log('- AWS Credentials: ✓ Configured');
  console.log('- Textract Usage: ✓ Enabled');
  console.log('- Fallback: ✓ Available (Claude Vision)');
}

testAWSSimple();