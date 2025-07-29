const https = require('https')

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://nutrition-lab-system.vercel.app'
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'your-secret-key'

async function checkProductionFiles() {
  console.log('=== PRODUCTION FILE PATH CHECK ===\n')
  
  try {
    // Call the production migration endpoint
    const response = await fetchJson(
      `${PRODUCTION_URL}/api/production-migrate`,
      'GET',
      null,
      { 'Authorization': `Bearer ${MIGRATION_SECRET}` }
    )
    
    if (!response.success) {
      console.error('❌ Failed to check production files:', response.error)
      return
    }
    
    const { results } = response
    
    console.log(`Total reports checked: ${results.total}`)
    console.log(`✅ Valid files: ${results.valid}`)
    console.log(`❌ Invalid files: ${results.invalid}`)
    console.log(`⚠️  Failed checks: ${results.failed}`)
    
    if (results.details && results.details.length > 0) {
      console.log('\n=== DETAILED RESULTS ===\n')
      
      // Group by action needed
      const byAction = {}
      results.details.forEach(detail => {
        const action = detail.action || 'unknown'
        if (!byAction[action]) byAction[action] = []
        byAction[action].push(detail)
      })
      
      // Show files that need migration
      if (byAction.needs_migration) {
        console.log(`\n❌ LOCAL FILES NEEDING MIGRATION (${byAction.needs_migration.length}):`)
        byAction.needs_migration.forEach(item => {
          console.log(`   - ID: ${item.id}`)
          console.log(`     Path: ${item.originalPath}`)
          console.log(`     Status: ${item.status}`)
        })
      }
      
      // Show missing files
      if (byAction.missing_file) {
        console.log(`\n❌ MISSING FILES IN STORAGE (${byAction.missing_file.length}):`)
        byAction.missing_file.forEach(item => {
          console.log(`   - ID: ${item.id}`)
          console.log(`     Path: ${item.originalPath}`)
          console.log(`     Status: ${item.status}`)
        })
      }
      
      // Show valid files
      if (byAction.file_exists) {
        console.log(`\n✅ VALID FILES (${byAction.file_exists.length}):`)
        byAction.file_exists.slice(0, 5).forEach(item => {
          console.log(`   - ID: ${item.id} - ${item.originalPath}`)
        })
        if (byAction.file_exists.length > 5) {
          console.log(`   ... and ${byAction.file_exists.length - 5} more`)
        }
      }
      
      // Show failed checks
      if (byAction.check_failed) {
        console.log(`\n⚠️  FAILED CHECKS (${byAction.check_failed.length}):`)
        byAction.check_failed.forEach(item => {
          console.log(`   - ID: ${item.id}`)
          console.log(`     Error: ${item.error}`)
        })
      }
    }
    
    console.log('\n=== RECOMMENDATIONS ===')
    console.log('1. Invalid files have been automatically marked as "failed" in the database')
    console.log('2. To fix 400 errors, you need to:')
    console.log('   - Re-upload files with local paths through the web interface')
    console.log('   - Or mark them as permanently failed if files are lost')
    console.log('3. Valid files should analyze successfully')
    console.log('4. Check Vercel logs for any remaining issues')
    
    // Test if we can fix a specific report
    if (results.invalid > 0) {
      console.log('\n=== FIXING INVALID FILES ===')
      console.log('Invalid files have been automatically marked as failed.')
      console.log('They will no longer cause 400 errors.')
    }
    
  } catch (error) {
    console.error('Error checking production files:', error)
  }
}

async function fetchJson(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      timeout: 30000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject(new Error(`${res.statusCode}: ${parsed.error || data}`))
          }
        } catch (err) {
          if (res.statusCode === 401) {
            console.error('\n❌ Unauthorized: Set MIGRATION_SECRET environment variable')
            console.error('   Example: MIGRATION_SECRET=your-secret-key node scripts/check-production-files.js')
            console.error('   Also add MIGRATION_SECRET to Vercel environment variables')
          }
          reject(new Error(`${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

// Run the check
checkProductionFiles().catch(console.error) 