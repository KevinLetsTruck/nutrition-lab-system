import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkLabReportsSchema() {
  console.log('🔍 Checking lab_reports table schema...\n')
  
  try {
    // Get a sample record to see the columns
    const { data: sampleRecord, error } = await supabase
      .from('lab_reports')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching sample record:', error)
      return
    }
    
    if (sampleRecord) {
      console.log('Sample record columns:')
      Object.keys(sampleRecord).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleRecord[key]}`)
      })
      
      console.log('\nChecking for bucket column:', 'bucket' in sampleRecord ? '✅ Present' : '❌ Missing')
    } else {
      console.log('No records found in lab_reports table')
    }
    
    // Try to query with bucket column
    console.log('\nTesting bucket column query...')
    const { data: bucketTest, error: bucketError } = await supabase
      .from('lab_reports')
      .select('id, file_path, bucket')
      .limit(5)
    
    if (bucketError) {
      console.log('❌ Bucket column does not exist:', bucketError.message)
    } else {
      console.log('✅ Bucket column exists')
      if (bucketTest && bucketTest.length > 0) {
        console.log('\nSample records with bucket:')
        bucketTest.forEach(record => {
          console.log(`  ID: ${record.id}`)
          console.log(`  Path: ${record.file_path}`)
          console.log(`  Bucket: ${record.bucket || 'NULL'}`)
          console.log()
        })
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkLabReportsSchema().catch(console.error)