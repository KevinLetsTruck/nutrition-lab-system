require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugQuickAnalysisStorage() {
  console.log('🔍 Debugging Quick Analysis Storage...\n')
  
  const buckets = ['lab-files', 'general']
  
  for (const bucket of buckets) {
    console.log(`\n📦 Checking bucket: ${bucket}`)
    console.log('=' .repeat(50))
    
    try {
      // Get today's date for the path
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const todayPath = `${year}/${month}/${day}`
      
      console.log(`📅 Looking in today's folder: ${todayPath}`)
      
      // List files in today's directory
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list(todayPath, {
          limit: 100,
          offset: 0
        })
      
      if (error) {
        console.error(`❌ Error listing files:`, error)
        continue
      }
      
      if (files && files.length > 0) {
        console.log(`\n✅ Found ${files.length} files in ${bucket}/${todayPath}:`)
        files.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file.name} (${(file.metadata?.size || 0) / 1024} KB)`)
          console.log(`      Created: ${file.created_at}`)
          console.log(`      Full path: ${bucket}/${todayPath}/${file.name}`)
        })
        
        // Check if any files match the NAQ or Symptom patterns
        const relevantFiles = files.filter(f => 
          f.name.toLowerCase().includes('naq') || 
          f.name.toLowerCase().includes('symptom') ||
          f.name.toLowerCase().includes('burden')
        )
        
        if (relevantFiles.length > 0) {
          console.log(`\n🎯 Found ${relevantFiles.length} relevant assessment files:`)
          relevantFiles.forEach(file => {
            console.log(`   - ${file.name}`)
          })
        }
      } else {
        console.log(`📭 No files found in ${bucket}/${todayPath}`)
      }
      
      // Also check yesterday in case of timezone differences
      const yesterday = new Date(date)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayYear = yesterday.getFullYear()
      const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0')
      const yesterdayDay = String(yesterday.getDate()).padStart(2, '0')
      const yesterdayPath = `${yesterdayYear}/${yesterdayMonth}/${yesterdayDay}`
      
      console.log(`\n📅 Also checking yesterday's folder: ${yesterdayPath}`)
      
      const { data: yesterdayFiles, error: yesterdayError } = await supabase.storage
        .from(bucket)
        .list(yesterdayPath, {
          limit: 100,
          offset: 0
        })
      
      if (!yesterdayError && yesterdayFiles && yesterdayFiles.length > 0) {
        console.log(`✅ Found ${yesterdayFiles.length} files in ${bucket}/${yesterdayPath}`)
        const relevantYesterdayFiles = yesterdayFiles.filter(f => 
          f.name.toLowerCase().includes('naq') || 
          f.name.toLowerCase().includes('symptom') ||
          f.name.toLowerCase().includes('burden')
        )
        
        if (relevantYesterdayFiles.length > 0) {
          console.log(`🎯 Found ${relevantYesterdayFiles.length} relevant assessment files from yesterday:`)
          relevantYesterdayFiles.forEach(file => {
            console.log(`   - ${file.name}`)
            console.log(`     Full path: ${bucket}/${yesterdayPath}/${file.name}`)
          })
        }
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error for bucket ${bucket}:`, error)
    }
  }
  
  console.log('\n\n💡 Debugging complete!')
}

debugQuickAnalysisStorage().catch(console.error)