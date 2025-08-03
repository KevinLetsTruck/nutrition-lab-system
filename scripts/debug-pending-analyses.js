import { DatabaseService } from '../src/lib/database/database-service.js'
import { SupabaseStorageService } from '../src/lib/storage/supabase-storage-service.js'

async function debugPendingAnalyses() {
  console.log('🔍 Debugging Pending Analyses...\n')
  
  try {
    const databaseService = DatabaseService.getInstance()
    const storageService = SupabaseStorageService.getInstance()
    
    // Get pending analyses
    const pendingAnalyses = await databaseService.getPendingAnalyses()
    console.log(`📊 Found ${pendingAnalyses.length} pending analyses\n`)
    
    if (pendingAnalyses.length === 0) {
      console.log('No pending analyses found.')
      return
    }
    
    // Check first 3 pending analyses
    const samplesToCheck = pendingAnalyses.slice(0, 3)
    
    for (const analysis of samplesToCheck) {
      console.log(`\n📄 Checking Analysis: ${analysis.id}`)
      console.log(`   Created: ${analysis.created_at}`)
      console.log(`   Type: ${analysis.report_type}`)
      console.log(`   File Path: ${analysis.file_path}`)
      console.log(`   Status: ${analysis.status}`)
      
      if (analysis.file_path) {
        // Check which bucket the file is in
        const buckets = ['general', 'lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements']
        let foundIn = null
        
        for (const bucket of buckets) {
          try {
            const cleanPath = analysis.file_path.replace(/^\/+/, '').split('/').slice(1).join('/')
            console.log(`   Checking bucket '${bucket}' for path: ${cleanPath}`)
            
            const file = await storageService.downloadFile(bucket, cleanPath)
            if (file) {
              foundIn = bucket
              console.log(`   ✅ File found in bucket: ${bucket} (${(file.length / 1024).toFixed(2)} KB)`)
              break
            }
          } catch (error) {
            // Continue checking other buckets
          }
        }
        
        if (!foundIn) {
          console.log(`   ❌ File not found in any bucket!`)
          console.log(`   This is why analysis is failing.`)
          
          // Check if it's a local file path
          if (analysis.file_path.startsWith('/tmp/') || analysis.file_path.startsWith('uploads/')) {
            console.log(`   ⚠️  File path appears to be local: ${analysis.file_path}`)
            console.log(`   This file needs to be re-uploaded through the web interface.`)
          }
        }
      } else {
        console.log(`   ❌ No file path stored in database!`)
      }
    }
    
    console.log('\n\n📊 Summary:')
    console.log('Most pending analyses are failing because:')
    console.log('1. Files were uploaded with local paths (e.g., /tmp/xxx) which don\'t exist in Supabase Storage')
    console.log('2. Files may have been uploaded to different buckets than expected')
    console.log('3. Some records may have missing or incorrect file paths')
    console.log('\nSolution: Re-upload files through the web interface to ensure they\'re properly stored in Supabase.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
  
  process.exit(0)
}

debugPendingAnalyses().catch(console.error)