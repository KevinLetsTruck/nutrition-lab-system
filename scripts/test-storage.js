#!/usr/bin/env node

/**
 * Test Supabase Storage Integration
 * 
 * This script tests the complete file upload, storage, and retrieval flow
 * to ensure the Supabase Storage integration is working correctly.
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

// Test file content
const TEST_FILES = {
  'test-lab-report.pdf': Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Lab Report) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n364\n%%EOF'),
  'test-food-photo.jpg': Buffer.from('\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9')
}

async function testStorageIntegration() {
  console.log('🧪 Testing Supabase Storage Integration...\n')

  const results = {
    bucketCreation: false,
    fileUpload: false,
    fileRetrieval: false,
    fileDeletion: false,
    urlGeneration: false
  }

  try {
    // Test 1: Check/Create bucket
    console.log('📦 Test 1: Checking storage bucket...')
    const bucketName = 'test-bucket'
    
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName)
    
    if (bucketError && bucketError.message.includes('not found')) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        fileSizeLimit: 10485760
      })
      
      if (createError) {
        console.error('   ❌ Failed to create test bucket:', createError.message)
      } else {
        console.log('   ✅ Created test bucket')
        results.bucketCreation = true
      }
    } else if (bucketError) {
      console.error('   ❌ Error checking bucket:', bucketError.message)
    } else {
      console.log('   ✅ Test bucket exists')
      results.bucketCreation = true
    }

    // Test 2: Upload files
    console.log('\n📤 Test 2: Uploading test files...')
    const uploadedFiles = []
    
    for (const [filename, content] of Object.entries(TEST_FILES)) {
      const filePath = `test/${Date.now()}_${filename}`
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, content, {
          contentType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          upsert: false
        })
      
      if (error) {
        console.error(`   ❌ Failed to upload ${filename}:`, error.message)
      } else {
        console.log(`   ✅ Uploaded ${filename} to ${filePath}`)
        uploadedFiles.push({ filename, path: filePath })
        results.fileUpload = true
      }
    }

    // Test 3: Generate URLs
    console.log('\n🔗 Test 3: Generating file URLs...')
    for (const file of uploadedFiles) {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.path)
      
      if (data.publicUrl) {
        console.log(`   ✅ Generated URL for ${file.filename}: ${data.publicUrl.substring(0, 50)}...`)
        results.urlGeneration = true
      } else {
        console.error(`   ❌ Failed to generate URL for ${file.filename}`)
      }
    }

    // Test 4: Download files
    console.log('\n📥 Test 4: Downloading test files...')
    for (const file of uploadedFiles) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(file.path)
      
      if (error) {
        console.error(`   ❌ Failed to download ${file.filename}:`, error.message)
      } else {
        const downloadedContent = await data.arrayBuffer()
        const originalContent = TEST_FILES[file.filename]
        
        if (downloadedContent.byteLength === originalContent.length) {
          console.log(`   ✅ Downloaded ${file.filename} (${downloadedContent.byteLength} bytes)`)
          results.fileRetrieval = true
        } else {
          console.error(`   ❌ Content mismatch for ${file.filename}`)
        }
      }
    }

    // Test 5: Delete files
    console.log('\n🗑️  Test 5: Cleaning up test files...')
    for (const file of uploadedFiles) {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([file.path])
      
      if (error) {
        console.error(`   ❌ Failed to delete ${file.filename}:`, error.message)
      } else {
        console.log(`   ✅ Deleted ${file.filename}`)
        results.fileDeletion = true
      }
    }

    // Test 6: Test bucket listing
    console.log('\n📋 Test 6: Listing bucket contents...')
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('test')
    
    if (listError) {
      console.error('   ❌ Failed to list bucket contents:', listError.message)
    } else {
      console.log(`   ✅ Listed ${files.length} files in test directory`)
    }

  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error.message)
  }

  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
  })

  const allPassed = Object.values(results).every(result => result)
  
  if (allPassed) {
    console.log('\n🎉 All storage tests passed! Supabase Storage integration is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }

  return allPassed
}

// Run the tests
testStorageIntegration()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }) 