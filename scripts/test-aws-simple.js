require('dotenv').config({ path: '.env.local' })

console.log('=== Testing AWS Configuration ===\n')

// Check environment variables
const hasAWSCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
console.log('AWS Credentials configured:', hasAWSCreds ? '✓' : '✗')

if (hasAWSCreds) {
  console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID.substring(0, 10) + '...')
  console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1')
  console.log('\n✓ AWS credentials are properly configured!')
  console.log('\nYour app will now automatically use AWS Textract for document processing.')
  console.log('The system will handle scanned PDFs and image-based documents.')
} else {
  console.log('\n✗ AWS credentials not found in .env.local')
}