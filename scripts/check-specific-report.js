import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSpecificReport() {
  const reportId = 'd2776167-2d23-41b6-bf33-e6ae2ed16dbb'
  
  console.log(`🔍 Checking report: ${reportId}\n`)
  
  // Get report details
  const { data: report, error } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('id', reportId)
    .single()
  
  if (error) {
    console.error('Error fetching report:', error)
    return
  }
  
  console.log('Report details:')
  console.log('  File Path:', report.file_path)
  console.log('  Report Type:', report.report_type)
  console.log('  Status:', report.status)
  console.log('  Created:', new Date(report.created_at).toLocaleString())
  
  if (report.file_path) {
    // Check if it's a local path
    if (report.file_path.startsWith('/tmp/') || report.file_path.startsWith('/Users/')) {
      console.log('\n⚠️  This is a LOCAL file path - it won\'t work in production!')
      console.log('The file needs to be re-uploaded through the web interface.')
    } else {
      // Try to find the file
      const buckets = ['general', 'lab-files']
      
      for (const bucket of buckets) {
        console.log(`\nChecking bucket: ${bucket}`)
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .download(report.file_path)
          
          if (error) {
            console.log(`  ❌ Not found: ${error.message}`)
          } else {
            console.log(`  ✅ FOUND in bucket: ${bucket}`)
            console.log(`  File size: ${data.size} bytes`)
          }
        } catch (e) {
          console.log(`  ❌ Error: ${e.message}`)
        }
      }
    }
  }
}

checkSpecificReport().catch(console.error)