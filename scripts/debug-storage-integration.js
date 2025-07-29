const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function debugStorageIntegration() {
  console.log('=== STORAGE INTEGRATION DEBUG ===\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  console.log('Environment Check:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey ? '✅ Set' : '❌ Missing')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\n❌ Missing required environment variables')
    process.exit(1)
  }

  // Create clients
  console.log('\n=== Creating Supabase Clients ===')
  
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('✅ Service client created')

  const anonClient = createClient(supabaseUrl, supabaseAnonKey || '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('✅ Anon client created')

  // Test buckets
  const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
  
  console.log('\n=== Testing Storage Buckets ===')
  
  for (const bucketName of buckets) {
    console.log(`\nTesting bucket: ${bucketName}`)
    
    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await serviceClient.storage.getBucket(bucketName)
    
    if (bucketError) {
      console.error(`❌ Bucket error: ${bucketError.message}`)
      continue
    }
    
    console.log(`✅ Bucket exists`)
    console.log(`   - Public: ${bucketData.public}`)
    console.log(`   - File size limit: ${bucketData.file_size_limit ? (bucketData.file_size_limit / 1024 / 1024) + 'MB' : 'None'}`)
    console.log(`   - Allowed MIME types: ${bucketData.allowed_mime_types?.join(', ') || 'All'}`)
    
    // Test upload with service client
    const testContent = Buffer.from(`Test content for ${bucketName} - ${new Date().toISOString()}`)
    const testFileName = `test-${Date.now()}.txt`
    
    console.log(`\n   Testing upload to ${bucketName}...`)
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false
      })
    
    if (uploadError) {
      console.error(`   ❌ Upload failed: ${uploadError.message}`)
      console.error(`      Error details:`, uploadError)
      continue
    }
    
    console.log(`   ✅ Upload successful: ${uploadData.path}`)
    
    // Test download with service client
    console.log(`   Testing download from ${bucketName}...`)
    const { data: downloadData, error: downloadError } = await serviceClient.storage
      .from(bucketName)
      .download(testFileName)
    
    if (downloadError) {
      console.error(`   ❌ Download failed: ${downloadError.message}`)
    } else {
      const content = await downloadData.text()
      console.log(`   ✅ Download successful (${content.length} bytes)`)
    }
    
    // Test public URL
    console.log(`   Testing public URL generation...`)
    const { data: urlData } = serviceClient.storage
      .from(bucketName)
      .getPublicUrl(testFileName)
    
    console.log(`   ✅ Public URL: ${urlData.publicUrl}`)
    
    // Test signed URL
    console.log(`   Testing signed URL generation...`)
    const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
      .from(bucketName)
      .createSignedUrl(testFileName, 3600)
    
    if (signedUrlError) {
      console.error(`   ❌ Signed URL failed: ${signedUrlError.message}`)
    } else {
      console.log(`   ✅ Signed URL created (1 hour expiry)`)
    }
    
    // Cleanup
    const { error: deleteError } = await serviceClient.storage
      .from(bucketName)
      .remove([testFileName])
    
    if (deleteError) {
      console.error(`   ⚠️  Cleanup failed: ${deleteError.message}`)
    } else {
      console.log(`   ✅ Test file cleaned up`)
    }
  }

  // Test actual PDF upload and analysis flow
  console.log('\n=== Testing PDF Upload Flow ===')
  
  // Check if test PDF exists
  const testPdfPath = path.join(__dirname, 'test-pdf.pdf')
  if (fs.existsSync(testPdfPath)) {
    console.log('✅ Test PDF found')
    
    const pdfBuffer = fs.readFileSync(testPdfPath)
    const pdfFileName = `test-lab-report-${Date.now()}.pdf`
    
    // Upload PDF to lab-files bucket
    console.log('\nUploading test PDF to lab-files bucket...')
    const { data: pdfUploadData, error: pdfUploadError } = await serviceClient.storage
      .from('lab-files')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
        metadata: {
          originalName: 'test-pdf.pdf',
          uploadedAt: new Date().toISOString(),
          category: 'lab_reports'
        }
      })
    
    if (pdfUploadError) {
      console.error(`❌ PDF upload failed: ${pdfUploadError.message}`)
      console.error('Error details:', pdfUploadError)
    } else {
      console.log(`✅ PDF uploaded successfully: ${pdfUploadData.path}`)
      
      // Try to download it back
      console.log('\nTesting PDF download...')
      const { data: pdfDownloadData, error: pdfDownloadError } = await serviceClient.storage
        .from('lab-files')
        .download(pdfFileName)
      
      if (pdfDownloadError) {
        console.error(`❌ PDF download failed: ${pdfDownloadError.message}`)
      } else {
        const downloadedSize = (await pdfDownloadData.arrayBuffer()).byteLength
        console.log(`✅ PDF downloaded successfully (${downloadedSize} bytes)`)
        console.log(`   Original size: ${pdfBuffer.length} bytes`)
        console.log(`   Sizes match: ${downloadedSize === pdfBuffer.length ? '✅' : '❌'}`)
      }
      
      // Cleanup PDF
      await serviceClient.storage
        .from('lab-files')
        .remove([pdfFileName])
    }
  } else {
    console.log('⚠️  No test PDF found at scripts/test-pdf.pdf')
  }

  // Check storage policies
  console.log('\n=== Checking Storage Policies ===')
  
  try {
    // This requires database access
    const { data: policies, error: policiesError } = await serviceClient
      .from('storage.policies')
      .select('*')
    
    if (policiesError) {
      console.log('⚠️  Cannot query policies table directly (expected)')
      console.log('   Policies must be checked in Supabase Dashboard')
    } else if (policies && policies.length > 0) {
      console.log(`Found ${policies.length} storage policies`)
      policies.forEach(policy => {
        console.log(`   - ${policy.name} (${policy.action}) on ${policy.bucket_id}`)
      })
    } else {
      console.log('⚠️  No storage policies found')
    }
  } catch (err) {
    console.log('⚠️  Cannot access policies (expected for non-admin access)')
  }

  console.log('\n=== Debug Summary ===')
  console.log('If you see "Unknown error" in the app:')
  console.log('1. Check if all buckets exist ✅')
  console.log('2. Check if service role key can upload/download ✅')
  console.log('3. Check storage policies in Supabase Dashboard')
  console.log('4. Check the analyze route logs for specific errors')
  console.log('5. Ensure the file path in database matches storage structure')
}

debugStorageIntegration().catch(console.error) 