const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkFilePaths() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('=== FILE PATH CONSISTENCY CHECK ===\n')

  try {
    // Get all lab reports with file paths
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('id, file_path, report_type, status, created_at')
      .not('file_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return
    }

    console.log(`Found ${reports.length} lab reports with file paths\n`)

    // Check each report
    for (const report of reports) {
      console.log(`Report ID: ${report.id}`)
      console.log(`Type: ${report.report_type}`)
      console.log(`Status: ${report.status}`)
      console.log(`File path: ${report.file_path}`)
      
      // Determine bucket
      let bucket = 'lab-files' // default
      
      // Check if path starts with bucket name
      if (report.file_path.includes('/')) {
        const pathParts = report.file_path.split('/')
        const possibleBucket = pathParts[0]
        const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
        
        if (buckets.includes(possibleBucket)) {
          bucket = possibleBucket
          console.log(`Bucket in path: ${bucket}`)
        } else {
          console.log(`No bucket in path, using default: ${bucket}`)
        }
      }

      // Try to check if file exists
      const filePath = report.file_path.startsWith(bucket + '/') 
        ? report.file_path.substring(bucket.length + 1)
        : report.file_path

      const { data: downloadData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(filePath)

      if (downloadError) {
        console.log(`❌ File NOT found: ${downloadError.message}`)
      } else {
        const size = (await downloadData.arrayBuffer()).byteLength
        console.log(`✅ File exists (${size} bytes)`)
      }

      console.log('---\n')
    }

    // Check storage structure
    console.log('=== STORAGE STRUCTURE CHECK ===\n')
    
    const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
    
    for (const bucket of buckets) {
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list('', {
          limit: 10,
          offset: 0
        })

      if (listError) {
        console.log(`❌ Error listing ${bucket}: ${listError.message}`)
      } else {
        console.log(`${bucket}: ${files.length} items`)
        if (files.length > 0) {
          console.log('  Sample paths:')
          files.slice(0, 3).forEach(file => {
            console.log(`    - ${file.name}`)
          })
        }
      }
    }

  } catch (error) {
    console.error('Fatal error:', error)
  }
}

checkFilePaths().catch(console.error) 