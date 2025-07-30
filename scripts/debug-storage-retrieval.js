require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStorageRetrieval() {
  console.log('=== Storage Retrieval Debug ===')
  console.log('Environment:', process.env.NODE_ENV || 'development')
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
  console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')
  
  try {
    // Get recent lab reports
    console.log('\n1. Fetching recent lab reports...')
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return
    }
    
    console.log(`Found ${reports.length} recent reports`)
    
    // Check each report's file
    for (const report of reports) {
      console.log(`\n2. Checking report ID: ${report.id}`)
      console.log(`   Report type: ${report.report_type}`)
      console.log(`   File path: ${report.file_path}`)
      console.log(`   Status: ${report.status}`)
      console.log(`   Created: ${report.created_at}`)
      
      if (!report.file_path) {
        console.log('   ⚠️  No file path in database')
        continue
      }
      
      // Determine bucket
      const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
      let bucket = 'lab-files' // default
      
      // Check if path includes bucket
      for (const b of buckets) {
        if (report.file_path.startsWith(b + '/')) {
          bucket = b
          break
        }
      }
      
      // Try different path variations
      const pathVariations = [
        report.file_path,
        report.file_path.replace(bucket + '/', ''),
        report.file_path.startsWith('/') ? report.file_path.slice(1) : report.file_path
      ]
      
      console.log(`\n   Trying bucket: ${bucket}`)
      console.log('   Path variations to try:')
      pathVariations.forEach((p, i) => console.log(`   ${i + 1}. ${p}`))
      
      // Try to list files in the bucket
      console.log(`\n   Listing files in ${bucket} bucket...`)
      try {
        const { data: listData, error: listError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 10 })
        
        if (listError) {
          console.error(`   Error listing ${bucket}:`, listError)
        } else {
          console.log(`   Files in ${bucket}:`, listData?.map(f => f.name).join(', ') || 'None')
        }
      } catch (e) {
        console.error(`   Failed to list ${bucket}:`, e.message)
      }
      
      // Try each path variation
      let fileFound = false
      for (const [index, path] of pathVariations.entries()) {
        console.log(`\n   Attempt ${index + 1}: Downloading from ${bucket}/${path}`)
        
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .download(path)
          
          if (error) {
            console.log(`   ❌ Failed:`, error.message)
          } else if (data) {
            const size = await data.size
            console.log(`   ✅ SUCCESS! File found. Size: ${size} bytes`)
            fileFound = true
            
            // Update database if needed
            if (index > 0) {
              console.log(`   💡 File found with path variation ${index + 1}`)
              console.log(`   Consider updating database file_path to: ${path}`)
            }
            break
          }
        } catch (e) {
          console.log(`   ❌ Error:`, e.message)
        }
      }
      
      if (!fileFound) {
        console.log('\n   ⚠️  File not found in any location!')
        
        // Try to find the file in other buckets
        console.log('\n   Searching other buckets...')
        for (const otherBucket of buckets) {
          if (otherBucket === bucket) continue
          
          try {
            const { data, error } = await supabase.storage
              .from(otherBucket)
              .download(report.file_path)
            
            if (data) {
              console.log(`   🔍 Found file in ${otherBucket} bucket!`)
              console.log(`   Update report to use bucket: ${otherBucket}`)
              break
            }
          } catch (e) {
            // Silent fail, continue searching
          }
        }
      }
    }
    
    // Check bucket policies
    console.log('\n\n3. Checking bucket policies...')
    const bucketName = 'lab-files'
    try {
      // This is a workaround to check if we can access the bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 })
      
      if (error) {
        console.log(`❌ Cannot access ${bucketName}: ${error.message}`)
        console.log('   This might indicate permission issues')
      } else {
        console.log(`✅ ${bucketName} bucket is accessible`)
      }
    } catch (e) {
      console.log(`❌ Error checking ${bucketName}: ${e.message}`)
    }
    
  } catch (error) {
    console.error('Fatal error:', error)
  }
}

// Run the debug
debugStorageRetrieval()
  .then(() => {
    console.log('\n=== Debug Complete ===')
    process.exit(0)
  })
  .catch(err => {
    console.error('Debug failed:', err)
    process.exit(1)
  }) 