import { medicalDocStorage } from '../src/lib/medical/storage-service'

async function testS3Configuration() {
  console.log('🧪 Testing S3 Configuration...\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log(`   S3_REGION: ${process.env.S3_REGION || '❌ Missing'}`)
  console.log(`   S3_MEDICAL_BUCKET_NAME: ${process.env.S3_MEDICAL_BUCKET_NAME || '❌ Missing'}`)
  console.log(`   S3_ACCESS_KEY_ID: ${process.env.S3_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`)
  console.log(`   S3_SECRET_ACCESS_KEY: ${process.env.S3_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}\n`)
  
  if (!process.env.S3_REGION || !process.env.S3_MEDICAL_BUCKET_NAME || 
      !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    console.log('❌ Missing required S3 environment variables')
    console.log('📝 Please add these to your .env.local file:')
    console.log(`
S3_MEDICAL_BUCKET_NAME="destinationhealth-medical-docs"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key-here"
S3_SECRET_ACCESS_KEY="your-secret-key-here"
    `)
    return false
  }
  
  // Test S3 connection
  console.log('🔗 Testing S3 connection...')
  try {
    const connected = await medicalDocStorage.testConnection()
    if (connected) {
      console.log('✅ S3 connection successful!')
    } else {
      console.log('❌ S3 connection failed')
    }
    return connected
  } catch (error) {
    console.error('💥 S3 connection error:', error)
    return false
  }
}

// Run if called directly
if (require.main === module) {
  testS3Configuration()
    .then(success => {
      console.log(success ? '\n🎉 S3 is ready for medical documents!' : '\n🔧 Please fix S3 configuration before proceeding')
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Script error:', error)
      process.exit(1)
    })
}

export { testS3Configuration }
