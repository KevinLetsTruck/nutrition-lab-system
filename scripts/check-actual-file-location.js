import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkActualFileLocation() {
  console.log('🔍 Checking where files are actually stored...\n')
  
  const buckets = ['general', 'lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements']
  
  // Test file path from the debug output
  const testPath = '2025/08/01/NAQ-Questions-Answers-4_1754082527379_owajb3o49l.pdf'
  
  console.log(`Looking for file: ${testPath}\n`)
  
  for (const bucket of buckets) {
    console.log(`\nChecking bucket: ${bucket}`)
    
    try {
      // Try downloading the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(testPath)
      
      if (error) {
        console.log(`  ❌ Not found: ${error.message}`)
      } else {
        console.log(`  ✅ FOUND! File exists in bucket: ${bucket}`)
        console.log(`  File size: ${data.size} bytes`)
        
        // Also check if we can list files in this bucket
        const { data: listData, error: listError } = await supabase.storage
          .from(bucket)
          .list('2025/08/01', { limit: 5 })
        
        if (!listError && listData) {
          console.log(`  Files in ${bucket}/2025/08/01:`)
          listData.forEach(file => {
            console.log(`    - ${file.name}`)
          })
        }
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`)
    }
  }
  
  console.log('\n\n📊 Conclusion:')
  console.log('The files are being stored with date-based paths (2025/08/01/filename.pdf)')
  console.log('But the analyze route is incorrectly parsing "2025" as a bucket name.')
  console.log('We need to fix the path parsing logic in the analyze route.')
}

checkActualFileLocation().catch(console.error)