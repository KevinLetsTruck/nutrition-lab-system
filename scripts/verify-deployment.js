const https = require('https')
const { execSync } = require('child_process')

async function verifyDeployment() {
  console.log('=== VERCEL DEPLOYMENT VERIFICATION ===\n')

  // Get the production URL from environment or use default
  const productionUrl = process.env.PRODUCTION_URL || 'https://nutrition-lab-system.vercel.app'
  
  console.log(`Production URL: ${productionUrl}\n`)

  // 1. Check current git status
  console.log('1. LOCAL GIT STATUS:')
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim()
    const unpushedCommits = execSync('git log origin/main..HEAD --oneline', { encoding: 'utf8' }).trim()
    
    console.log(`   Current branch: ${branch}`)
    console.log(`   Last commit: ${lastCommit}`)
    
    if (unpushedCommits) {
      console.log(`   ⚠️  Unpushed commits:`)
      console.log(`   ${unpushedCommits}`)
    } else {
      console.log(`   ✅ All commits pushed to origin`)
    }
  } catch (err) {
    console.error('   ❌ Error checking git status:', err.message)
  }

  // 2. Test production health endpoint
  console.log('\n2. PRODUCTION HEALTH CHECK:')
  await testEndpoint(`${productionUrl}/api/health`, 'GET')

  // 3. Test storage endpoint
  console.log('\n3. STORAGE ENDPOINT TEST:')
  await testEndpoint(`${productionUrl}/api/test-storage`, 'GET')

  // 4. Test analyze endpoint status
  console.log('\n4. ANALYZE ENDPOINT STATUS:')
  await testEndpoint(`${productionUrl}/api/analyze`, 'GET')

  // 5. Check for specific deployment features
  console.log('\n5. DEPLOYMENT FEATURE CHECK:')
  const features = [
    { path: '/api/test-storage', name: 'Storage test endpoint' },
    { path: '/api/health', name: 'Health check endpoint' },
    { path: '/api/analyze', name: 'Analyze endpoint' }
  ]

  for (const feature of features) {
    const exists = await checkEndpointExists(`${productionUrl}${feature.path}`)
    console.log(`   ${feature.name}: ${exists ? '✅ Available' : '❌ Not found'}`)
  }

  console.log('\n6. DEPLOYMENT RECOMMENDATIONS:')
  console.log('   - If endpoints are missing, redeploy from Vercel dashboard')
  console.log('   - Check Vercel function logs for detailed errors')
  console.log('   - Verify all environment variables are set in Vercel')
  console.log('   - Run production-check.js after deployment')
}

async function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Deployment-Verifier/1.0'
      },
      timeout: 10000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode === 200) {
            console.log(`   ✅ ${method} ${url} - Status: ${res.statusCode}`)
            console.log(`   Response: ${JSON.stringify(parsed).substring(0, 100)}...`)
          } else {
            console.log(`   ⚠️  ${method} ${url} - Status: ${res.statusCode}`)
            console.log(`   Error: ${parsed.error || 'Unknown error'}`)
          }
        } catch (err) {
          console.log(`   ❌ ${method} ${url} - Status: ${res.statusCode}`)
          console.log(`   Response: ${data.substring(0, 100)}...`)
        }
        resolve()
      })
    })

    req.on('error', (err) => {
      console.log(`   ❌ ${method} ${url} - Connection failed`)
      console.log(`   Error: ${err.message}`)
      resolve()
    })

    req.on('timeout', () => {
      console.log(`   ❌ ${method} ${url} - Request timeout`)
      req.destroy()
      resolve()
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function checkEndpointExists(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 5000
    }

    const req = https.request(options, (res) => {
      resolve(res.statusCode < 500)
    })

    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

// Run verification
verifyDeployment().catch(console.error) 