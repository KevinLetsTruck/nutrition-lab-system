const https = require('https')

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://nutrition-lab-system.vercel.app'

async function productionCheck() {
  console.log('=== PRODUCTION ENVIRONMENT CHECK ===\n')
  console.log(`URL: ${PRODUCTION_URL}\n`)

  const results = {
    health: false,
    storage: false,
    database: false,
    analyze: false,
    fileAccess: false,
    errors: []
  }

  // 1. Health Check
  console.log('1. HEALTH CHECK:')
  try {
    const health = await fetchJson(`${PRODUCTION_URL}/api/health`)
    results.health = health.status === 'healthy'
    console.log(`   ✅ API is healthy - Version: ${health.version}`)
  } catch (err) {
    results.errors.push({ test: 'health', error: err.message })
    console.log(`   ❌ Health check failed: ${err.message}`)
  }

  // 2. Storage Access
  console.log('\n2. STORAGE ACCESS:')
  try {
    const storage = await fetchJson(`${PRODUCTION_URL}/api/test-storage`)
    results.storage = storage.success && storage.results.uploadTest?.success && storage.results.downloadTest?.success
    console.log(`   ✅ Storage working - Upload: ${storage.results.uploadTest?.success}, Download: ${storage.results.downloadTest?.success}`)
    
    // Check buckets
    console.log('   Buckets:')
    for (const [bucket, info] of Object.entries(storage.results.buckets)) {
      console.log(`     - ${bucket}: ${info.exists ? '✅' : '❌'} (${info.fileCount || 0} files)`)
    }
  } catch (err) {
    results.errors.push({ test: 'storage', error: err.message })
    console.log(`   ❌ Storage test failed: ${err.message}`)
  }

  // 3. Database Connection
  console.log('\n3. DATABASE CONNECTION:')
  try {
    const analyze = await fetchJson(`${PRODUCTION_URL}/api/analyze`)
    results.database = analyze.success
    console.log(`   ✅ Database connected - ${analyze.pendingAnalyses?.length || 0} pending analyses`)
  } catch (err) {
    results.errors.push({ test: 'database', error: err.message })
    console.log(`   ❌ Database test failed: ${err.message}`)
  }

  // 4. Test File Upload
  console.log('\n4. FILE UPLOAD TEST:')
  try {
    const uploadTest = await testFileUpload()
    results.fileAccess = uploadTest.success
    if (uploadTest.success) {
      console.log(`   ✅ File upload successful - ID: ${uploadTest.labReportId}`)
    } else {
      console.log(`   ❌ File upload failed: ${uploadTest.error}`)
    }
  } catch (err) {
    results.errors.push({ test: 'upload', error: err.message })
    console.log(`   ❌ Upload test failed: ${err.message}`)
  }

  // 5. Test Analysis
  console.log('\n5. ANALYSIS TEST:')
  try {
    // Get a report ID to test
    const reports = await fetchJson(`${PRODUCTION_URL}/api/analyze`)
    if (reports.pendingAnalyses && reports.pendingAnalyses.length > 0) {
      const testReportId = reports.pendingAnalyses[0].id
      console.log(`   Testing with report ID: ${testReportId}`)
      
      const analysis = await fetchJson(`${PRODUCTION_URL}/api/analyze`, 'POST', {
        labReportId: testReportId
      })
      
      if (analysis.success) {
        console.log(`   ✅ Analysis successful`)
        results.analyze = true
      } else {
        console.log(`   ❌ Analysis failed: ${analysis.error}`)
        results.errors.push({ test: 'analyze', error: analysis.error })
      }
    } else {
      console.log(`   ⚠️  No pending analyses to test`)
    }
  } catch (err) {
    results.errors.push({ test: 'analyze', error: err.message })
    console.log(`   ❌ Analysis test failed: ${err.message}`)
  }

  // 6. Check Common 400 Error Scenarios
  console.log('\n6. COMMON 400 ERROR SCENARIOS:')
  
  // Test missing parameters
  console.log('   Testing missing parameters:')
  try {
    const badRequest = await fetchJson(`${PRODUCTION_URL}/api/analyze`, 'POST', {})
    console.log(`   ⚠️  Empty request should fail but got: ${badRequest.success}`)
  } catch (err) {
    if (err.message.includes('400')) {
      console.log(`   ✅ Correctly returns 400 for missing parameters`)
    } else {
      console.log(`   ❌ Unexpected error: ${err.message}`)
    }
  }

  // Test invalid report ID
  console.log('   Testing invalid report ID:')
  try {
    const badId = await fetchJson(`${PRODUCTION_URL}/api/analyze`, 'POST', {
      labReportId: 'invalid-id-12345'
    })
    if (!badId.success) {
      console.log(`   ✅ Correctly handles invalid ID: ${badId.error}`)
    }
  } catch (err) {
    console.log(`   Error response: ${err.message}`)
  }

  // Summary
  console.log('\n=== SUMMARY ===')
  console.log(`Health Check: ${results.health ? '✅' : '❌'}`)
  console.log(`Storage Access: ${results.storage ? '✅' : '❌'}`)
  console.log(`Database Connection: ${results.database ? '✅' : '❌'}`)
  console.log(`File Upload: ${results.fileAccess ? '✅' : '❌'}`)
  console.log(`Analysis: ${results.analyze ? '✅' : '❌'}`)
  
  if (results.errors.length > 0) {
    console.log('\nERRORS FOUND:')
    results.errors.forEach(err => {
      console.log(`- ${err.test}: ${err.error}`)
    })
  }

  console.log('\n=== TROUBLESHOOTING 400 ERRORS ===')
  console.log('1. Check Vercel Function logs for detailed error messages')
  console.log('2. Verify all environment variables are set in Vercel dashboard')
  console.log('3. Check if file paths in database match storage structure')
  console.log('4. Ensure rate limiting is not blocking requests')
  console.log('5. Verify CORS settings if calling from browser')
}

async function fetchJson(url, method = 'GET', data = null) {
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
        'User-Agent': 'Production-Checker/1.0'
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

async function testFileUpload() {
  // Create a simple test file
  const boundary = '----FormBoundary' + Math.random().toString(36)
  const testContent = 'Test file content for production check'
  const fileName = 'test-production.txt'
  
  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
    'Content-Type: text/plain',
    '',
    testContent,
    `--${boundary}`,
    'Content-Disposition: form-data; name="clientEmail"',
    '',
    'test@example.com',
    `--${boundary}`,
    'Content-Disposition: form-data; name="reportType"',
    '',
    'nutriq',
    `--${boundary}--`
  ].join('\r\n')

  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${PRODUCTION_URL}/api/upload`)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      },
      timeout: 30000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed)
        } catch (err) {
          resolve({ success: false, error: data })
        }
      })
    })

    req.on('error', (err) => resolve({ success: false, error: err.message }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ success: false, error: 'Upload timeout' })
    })

    req.write(formData)
    req.end()
  })
}

// Run checks
productionCheck().catch(console.error) 