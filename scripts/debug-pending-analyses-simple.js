import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugPendingAnalyses() {
  console.log('🔍 Debugging Pending Analyses...\n')
  
  try {
    // Get pending analyses
    const { data: pendingAnalyses, error } = await supabase
      .from('lab_reports')
      .select('*')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching pending analyses:', error)
      return
    }
    
    console.log(`📊 Found ${pendingAnalyses?.length || 0} recent pending analyses\n`)
    
    if (!pendingAnalyses || pendingAnalyses.length === 0) {
      console.log('No pending analyses found.')
      return
    }
    
    // Check each pending analysis
    for (const analysis of pendingAnalyses) {
      console.log(`\n📄 Analysis ID: ${analysis.id}`)
      console.log(`   Created: ${new Date(analysis.created_at).toLocaleString()}`)
      console.log(`   Type: ${analysis.report_type}`)
      console.log(`   File Path: ${analysis.file_path}`)
      console.log(`   Status: ${analysis.status}`)
      console.log(`   Client ID: ${analysis.client_id}`)
      
      if (analysis.file_path) {
        // Check if it's a local path
        if (analysis.file_path.startsWith('/tmp/') || 
            analysis.file_path.startsWith('uploads/') ||
            analysis.file_path.startsWith('/Users/')) {
          console.log(`   ⚠️  LOCAL PATH DETECTED - This won't work in production!`)
          console.log(`   This file needs to be re-uploaded through the web interface.`)
        } else {
          // Try to parse the path to determine bucket
          const pathParts = analysis.file_path.replace(/^\/+/, '').split('/')
          const possibleBucket = pathParts[0]
          const filePath = pathParts.slice(1).join('/')
          
          console.log(`   Parsed bucket: ${possibleBucket}`)
          console.log(`   Parsed path: ${filePath}`)
          
          // Try to check if file exists
          try {
            const { data: fileData, error: fileError } = await supabase.storage
              .from(possibleBucket)
              .download(filePath)
            
            if (fileError) {
              console.log(`   ❌ File not found in bucket '${possibleBucket}': ${fileError.message}`)
            } else {
              console.log(`   ✅ File exists in bucket '${possibleBucket}'`)
            }
          } catch (e) {
            console.log(`   ❌ Error checking file: ${e.message}`)
          }
        }
      } else {
        console.log(`   ❌ No file path stored!`)
      }
    }
    
    console.log('\n\n📊 Summary:')
    console.log('Common issues with pending analyses:')
    console.log('1. Files uploaded with local paths that don\'t exist in cloud storage')
    console.log('2. Files may be in different buckets than expected')
    console.log('3. Missing file paths in database records')
    console.log('\nRecommendation: Check each failing analysis and re-upload files as needed.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugPendingAnalyses().catch(console.error)