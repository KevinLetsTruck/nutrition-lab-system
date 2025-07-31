const { createClient } = require('@supabase/supabase-js')

// This script checks and fixes Supabase storage bucket issues
// Run this with: node scripts/fix-storage-bucket.js

console.log('🔧 Checking Supabase Storage Bucket Configuration...')

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

console.log('✅ Supabase credentials found')
console.log('🔗 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndFixStorage() {
  try {
    console.log('🔍 Checking storage buckets...')
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    console.log('📦 Found buckets:', buckets.map(b => b.name))
    
    // Check if the default bucket exists
    const defaultBucket = buckets.find(b => b.name === 'default')
    
    if (!defaultBucket) {
      console.log('⚠️  Default bucket not found. Creating it...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('default', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        fileSizeLimit: 52428800 // 50MB
      })
      
      if (createError) {
        console.error('❌ Error creating default bucket:', createError.message)
        return
      }
      
      console.log('✅ Default bucket created successfully')
    } else {
      console.log('✅ Default bucket exists')
    }
    
    // Check bucket policies
    console.log('🔍 Checking bucket policies...')
    
    const { data: policies, error: policiesError } = await supabase.storage.getBucket('default')
    
    if (policiesError) {
      console.error('❌ Error getting bucket policies:', policiesError.message)
      return
    }
    
    console.log('📋 Bucket policies:', policies)
    
    // Test file access
    console.log('🧪 Testing file access...')
    
    const { data: files, error: filesError } = await supabase.storage
      .from('default')
      .list('2025/07/31', {
        limit: 10,
        offset: 0
      })
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError.message)
      console.log('💡 This might indicate a bucket access issue')
    } else {
      console.log('✅ Files found:', files.length)
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`)
      })
    }
    
    // Test specific file access
    console.log('🧪 Testing specific file access...')
    
    const testFile = '2025/07/31/Symptom-Burden-Comparision-Graph_1753925148814_9n87n5bijxr.pdf'
    
    const { data: fileUrl, error: urlError } = await supabase.storage
      .from('default')
      .createSignedUrl(testFile, 60) // 60 seconds
    
    if (urlError) {
      console.error('❌ Error creating signed URL:', urlError.message)
      console.log('💡 This indicates the file might not exist or bucket access is restricted')
    } else {
      console.log('✅ File URL created successfully')
      console.log('🔗 URL:', fileUrl.signedUrl.substring(0, 100) + '...')
    }
    
    console.log('\n🎉 Storage bucket check complete!')
    
  } catch (error) {
    console.error('❌ Error checking storage:', error.message)
    process.exit(1)
  }
}

checkAndFixStorage() 