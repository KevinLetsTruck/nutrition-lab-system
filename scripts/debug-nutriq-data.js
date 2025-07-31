const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with environment variables
const supabaseUrl = 'https://your-project.supabase.co' // Replace with your actual URL
const supabaseKey = 'your-service-role-key' // Replace with your actual key

console.log('🔍 Debugging NutriQ data loading...')
console.log('📋 This script will help identify why NutriQ scores are showing as 0/10')

// Check if we have the right environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  Environment variables not set locally')
  console.log('💡 The issue is likely that NutriQ data exists in production but not locally')
  console.log('🔧 Let\'s check the client data service logic instead...')
  
  // Show the logic that should be working
  console.log('\n📝 Client Data Service Logic:')
  console.log('1. Fetches lab_reports for client')
  console.log('2. Looks for nutriq_results array in each report')
  console.log('3. Extracts scores: total_score, energy_score, mood_score, etc.')
  console.log('4. Maps to NutriQData interface')
  
  console.log('\n🔍 Possible Issues:')
  console.log('1. NutriQ reports not uploaded to lab_reports table')
  console.log('2. nutriq_results array is empty or null')
  console.log('3. Score fields missing from nutriq_results')
  console.log('4. Database schema mismatch')
  
  console.log('\n💡 To fix this:')
  console.log('1. Check if NutriQ PDFs were uploaded successfully')
  console.log('2. Verify the upload process extracted scores correctly')
  console.log('3. Check lab_reports table in Supabase dashboard')
  console.log('4. Look for nutriq_results column in the reports')
  
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugNutriQData() {
  try {
    console.log('🔍 Checking lab_reports table structure...')
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('lab_reports')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error accessing lab_reports table:', tableError.message)
      return
    }
    
    if (tableInfo && tableInfo.length > 0) {
      const sampleReport = tableInfo[0]
      console.log('✅ lab_reports table accessible')
      console.log('📊 Sample report columns:', Object.keys(sampleReport))
      
      if (sampleReport.nutriq_results) {
        console.log('✅ nutriq_results column exists')
        console.log('📋 Sample nutriq_results:', JSON.stringify(sampleReport.nutriq_results, null, 2))
      } else {
        console.log('❌ nutriq_results column missing or null')
      }
    }
    
    // Find Mike Wilson's reports
    console.log('\n🔍 Looking for Mike Wilson\'s lab reports...')
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .or('first_name.ilike.%mike%,last_name.ilike.%wilson%')
    
    if (clientError) {
      console.error('❌ Error finding Mike Wilson:', clientError.message)
      return
    }
    
    if (clients && clients.length > 0) {
      const client = clients[0]
      console.log(`✅ Found client: ${client.first_name} ${client.last_name} (ID: ${client.id})`)
      
      // Get their lab reports
      const { data: reports, error: reportsError } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', client.id)
      
      if (reportsError) {
        console.error('❌ Error fetching reports:', reportsError.message)
        return
      }
      
      console.log(`📊 Found ${reports.length} lab reports for Mike Wilson`)
      
      reports.forEach((report, index) => {
        console.log(`\n📋 Report ${index + 1}:`)
        console.log(`  Type: ${report.report_type}`)
        console.log(`  Date: ${report.report_date}`)
        console.log(`  Status: ${report.status}`)
        console.log(`  Has nutriq_results: ${!!report.nutriq_results}`)
        
        if (report.nutriq_results && report.nutriq_results.length > 0) {
          const nutriq = report.nutriq_results[0]
          console.log(`  NutriQ Data:`)
          console.log(`    Total Score: ${nutriq.total_score || 'N/A'}`)
          console.log(`    Energy Score: ${nutriq.energy_score || 'N/A'}`)
          console.log(`    Mood Score: ${nutriq.mood_score || 'N/A'}`)
          console.log(`    Sleep Score: ${nutriq.sleep_score || 'N/A'}`)
          console.log(`    Stress Score: ${nutriq.stress_score || 'N/A'}`)
          console.log(`    Digestion Score: ${nutriq.digestion_score || 'N/A'}`)
          console.log(`    Immunity Score: ${nutriq.immunity_score || 'N/A'}`)
        } else {
          console.log(`  ❌ No NutriQ data found`)
        }
      })
    } else {
      console.log('❌ Mike Wilson not found in clients table')
    }
    
  } catch (error) {
    console.error('❌ Error debugging NutriQ data:', error.message)
  }
}

debugNutriQData() 