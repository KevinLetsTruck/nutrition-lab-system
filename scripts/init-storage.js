#!/usr/bin/env node

/**
 * Initialize Supabase Storage Buckets
 * 
 * This script creates the necessary storage buckets for the nutrition lab system.
 * Run this script once during initial setup.
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Storage bucket configuration
const BUCKETS = {
  'lab-files': {
    public: false,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    fileSizeLimit: 10485760 // 10MB
  },
  'cgm-images': {
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'text/csv'],
    fileSizeLimit: 10485760 // 10MB
  },
  'food-photos': {
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    fileSizeLimit: 10485760 // 10MB
  },
  'medical-records': {
    public: false,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    fileSizeLimit: 10485760 // 10MB
  },
  'supplements': {
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    fileSizeLimit: 10485760 // 10MB
  },
  'general': {
    public: false,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/csv'],
    fileSizeLimit: 10485760 // 10MB
  }
}

async function initializeStorage() {
  console.log('🚀 Initializing Supabase Storage Buckets...\n')

  for (const [bucketName, config] of Object.entries(BUCKETS)) {
    try {
      console.log(`📦 Checking bucket: ${bucketName}`)
      
      // Check if bucket exists
      const { data: existingBucket, error: getError } = await supabase.storage.getBucket(bucketName)
      
      if (getError && getError.message.includes('not found')) {
        // Create bucket if it doesn't exist
        console.log(`   Creating bucket: ${bucketName}`)
        
        const { error: createError } = await supabase.storage.createBucket(bucketName, config)
        
        if (createError) {
          console.error(`   ❌ Failed to create bucket ${bucketName}:`, createError.message)
        } else {
          console.log(`   ✅ Created bucket: ${bucketName}`)
        }
      } else if (getError) {
        console.error(`   ❌ Error checking bucket ${bucketName}:`, getError.message)
      } else {
        console.log(`   ✅ Bucket already exists: ${bucketName}`)
        
        // Update bucket configuration if needed
        console.log(`   🔄 Updating bucket configuration: ${bucketName}`)
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, config)
        
        if (updateError) {
          console.error(`   ❌ Failed to update bucket ${bucketName}:`, updateError.message)
        } else {
          console.log(`   ✅ Updated bucket configuration: ${bucketName}`)
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Unexpected error with bucket ${bucketName}:`, error.message)
    }
  }

  console.log('\n🎉 Storage bucket initialization complete!')
  
  // List all buckets
  console.log('\n📋 Current storage buckets:')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Failed to list buckets:', error.message)
    } else {
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })
    }
  } catch (error) {
    console.error('❌ Error listing buckets:', error.message)
  }
}

// Run the initialization
initializeStorage()
  .then(() => {
    console.log('\n✅ Storage initialization completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Storage initialization failed:', error)
    process.exit(1)
  }) 