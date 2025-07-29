const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function migrateFilePaths() {
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

  console.log('=== FILE PATH MIGRATION ===\n')

  try {
    // Get all lab reports with problematic file paths
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('*')
      .not('file_path', 'is', null)
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return
    }

    console.log(`Found ${reports.length} lab reports with file paths\n`)

    let migrated = 0
    let failed = 0

    for (const report of reports) {
      console.log(`\nProcessing Report ID: ${report.id}`)
      console.log(`Type: ${report.report_type}`)
      console.log(`Current path: ${report.file_path}`)
      
      // Check if it's an old local path
      if (report.file_path.startsWith('/Users/') || report.file_path.startsWith('C:\\')) {
        console.log('⚠️  Old local file path detected')
        
        // Try to find the file in uploads directory
        const fileName = path.basename(report.file_path)
        const localPath = path.join(__dirname, '..', 'uploads', 'pdfs', fileName)
        
        if (fs.existsSync(localPath)) {
          console.log(`✅ Found local file: ${fileName}`)
          
          // Read the file
          const fileBuffer = fs.readFileSync(localPath)
          
          // Upload to Supabase Storage
          const date = new Date(report.created_at)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(2, 15)
          const newFileName = `${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}_${randomString}${path.extname(fileName)}`
          const storagePath = `${year}/${month}/${day}/${newFileName}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('lab-files')
            .upload(storagePath, fileBuffer, {
              contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
              upsert: false
            })
          
          if (uploadError) {
            console.error(`❌ Upload failed: ${uploadError.message}`)
            failed++
          } else {
            console.log(`✅ Uploaded to: ${storagePath}`)
            
            // Update database with new path
            const { error: updateError } = await supabase
              .from('lab_reports')
              .update({ file_path: storagePath })
              .eq('id', report.id)
            
            if (updateError) {
              console.error(`❌ Database update failed: ${updateError.message}`)
              failed++
            } else {
              console.log('✅ Database updated with new path')
              migrated++
            }
          }
        } else {
          console.log(`❌ Local file not found: ${localPath}`)
          failed++
        }
      } else if (!report.file_path.includes('/')) {
        // Simple filename, needs proper path structure
        console.log('⚠️  Simple filename detected, needs path structure')
        failed++
      } else {
        // Check if file exists in storage
        let bucket = 'lab-files'
        let filePath = report.file_path
        
        // Extract bucket if in path
        if (report.file_path.includes('/')) {
          const parts = report.file_path.split('/')
          const buckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
          if (buckets.includes(parts[0])) {
            bucket = parts[0]
            filePath = parts.slice(1).join('/')
          }
        }
        
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from(bucket)
          .download(filePath)
        
        if (downloadError) {
          console.log(`❌ File missing from storage: ${downloadError.message}`)
          
          // Update status to indicate missing file
          await supabase
            .from('lab_reports')
            .update({ 
              status: 'failed',
              notes: 'File missing from storage'
            })
            .eq('id', report.id)
          
          failed++
        } else {
          console.log('✅ File exists in storage')
        }
      }
    }

    console.log('\n=== MIGRATION SUMMARY ===')
    console.log(`Total reports: ${reports.length}`)
    console.log(`Successfully migrated: ${migrated}`)
    console.log(`Failed: ${failed}`)
    console.log(`Already in storage: ${reports.length - migrated - failed}`)

  } catch (error) {
    console.error('Fatal error:', error)
  }
}

migrateFilePaths().catch(console.error) 