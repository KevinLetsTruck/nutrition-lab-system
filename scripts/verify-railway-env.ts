#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import https from 'https'
import http from 'http'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

interface VerificationResult {
  timestamp: string
  railwayVariables: string[]
  localVariables: string[]
  requiredVariables: string[]
  presentVariables: string[]
  missingVariables: string[]
  extraVariables: string[]
  healthCheckResult: {
    success: boolean
    status?: number
    envCheck?: string
    error?: string
  }
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function error(message: string) {
  log(`❌ ${message}`, colors.red)
}

function success(message: string) {
  log(`✅ ${message}`, colors.green)
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

// Parse .env.local file to get variable names
function parseLocalEnv(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const variables: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/)
      if (match) {
        variables.push(match[1])
      }
    }

    return variables
  } catch (err) {
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`)
  }
}

// Get Railway variables
function getRailwayVariables(): string[] {
  try {
    // Run railway variables command and capture output
    const output = execSync('railway variables --kv', { encoding: 'utf8' })
    const lines = output.split('\n').filter(line => line.trim())
    
    const variables: string[] = []
    for (const line of lines) {
      // Railway outputs in KEY=value format with --kv flag
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*?)=/)
      if (match) {
        variables.push(match[1])
      }
    }

    return variables
  } catch (err) {
    throw new Error(`Failed to get Railway variables: ${(err as Error).message}`)
  }
}

// Get Railway deployment URL
function getRailwayUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Try to get the Railway domain
      const output = execSync('railway status', { encoding: 'utf8' })
      
      // Look for deployment URL in output
      // Railway might show the URL in status output
      const urlMatch = output.match(/https?:\/\/[^\s]+\.up\.railway\.app/i)
      
      if (urlMatch) {
        resolve(urlMatch[0])
      } else {
        // Try to get from railway domain command
        try {
          const domainOutput = execSync('railway domain', { encoding: 'utf8' })
          const domainMatch = domainOutput.match(/https?:\/\/[^\s]+/i)
          if (domainMatch) {
            resolve(domainMatch[0])
          } else {
            reject(new Error('No Railway deployment URL found'))
          }
        } catch {
          reject(new Error('No Railway deployment URL found'))
        }
      }
    } catch (err) {
      reject(new Error(`Failed to get Railway URL: ${(err as Error).message}`))
    }
  })
}

// Test health endpoint
function testHealthEndpoint(url: string): Promise<{ success: boolean; status?: number; envCheck?: string; error?: string }> {
  return new Promise((resolve) => {
    const healthUrl = new URL('/api/health', url)
    
    const client = healthUrl.protocol === 'https:' ? https : http
    
    const options = {
      hostname: healthUrl.hostname,
      port: healthUrl.port,
      path: healthUrl.pathname,
      method: 'GET',
      timeout: 30000, // 30 second timeout
      headers: {
        'Accept': 'application/json'
      }
    }

    const req = client.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          const envCheck = response.checks?.environment?.status ? 'pass' : 'fail'
          
          resolve({
            success: res.statusCode === 200,
            status: res.statusCode,
            envCheck
          })
        } catch (err) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON response'
          })
        }
      })
    })

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({
        success: false,
        error: 'Request timeout'
      })
    })

    req.end()
  })
}

// Write verification log
function writeVerificationLog(result: VerificationResult) {
  const logPath = path.join(process.cwd(), 'railway-verification.log')
  const logContent = `Railway Environment Verification Report
Generated: ${result.timestamp}
=====================================

Railway Variables Found: ${result.railwayVariables.length}
Local Variables Found: ${result.localVariables.length}

REQUIRED VARIABLES CHECK:
${result.requiredVariables.map(v => 
  result.presentVariables.includes(v) ? `✅ ${v}` : `❌ ${v}`
).join('\n')}

MISSING VARIABLES (${result.missingVariables.length}):
${result.missingVariables.length > 0 ? result.missingVariables.map(v => `- ${v}`).join('\n') : 'None'}

EXTRA VARIABLES IN RAILWAY (${result.extraVariables.length}):
${result.extraVariables.length > 0 ? result.extraVariables.map(v => `- ${v}`).join('\n') : 'None'}

HEALTH CHECK RESULT:
Success: ${result.healthCheckResult.success}
Status Code: ${result.healthCheckResult.status || 'N/A'}
Environment Check: ${result.healthCheckResult.envCheck || 'N/A'}
Error: ${result.healthCheckResult.error || 'None'}

ALL RAILWAY VARIABLES:
${result.railwayVariables.sort().join('\n')}

ALL LOCAL VARIABLES:
${result.localVariables.sort().join('\n')}
`

  fs.writeFileSync(logPath, logContent)
  return logPath
}

// Main verification function
async function main() {
  log('🚂 Railway Environment Verification Tool', colors.bright)
  log('======================================\n')

  const result: VerificationResult = {
    timestamp: new Date().toISOString(),
    railwayVariables: [],
    localVariables: [],
    requiredVariables: [
      'ANTHROPIC_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ],
    presentVariables: [],
    missingVariables: [],
    extraVariables: [],
    healthCheckResult: { success: false }
  }

  try {
    // Step 1: Check Railway CLI
    info('Checking Railway CLI...')
    try {
      execSync('railway --version', { stdio: 'ignore' })
      success('Railway CLI is installed')
    } catch {
      error('Railway CLI is not installed')
      process.exit(1)
    }

    // Step 2: Check Railway login
    info('\nChecking Railway authentication...')
    try {
      execSync('railway whoami', { stdio: 'ignore' })
      success('Logged in to Railway')
    } catch {
      error('Not logged in to Railway. Run: railway login')
      process.exit(1)
    }

    // Step 3: Get Railway variables
    info('\nFetching Railway variables...')
    try {
      result.railwayVariables = getRailwayVariables()
      success(`Found ${result.railwayVariables.length} variables in Railway`)
    } catch (err) {
      error(`Failed to get Railway variables: ${(err as Error).message}`)
      process.exit(1)
    }

    // Step 4: Parse local environment
    info('\nParsing local environment...')
    const envPath = path.join(process.cwd(), '.env.local')
    try {
      result.localVariables = parseLocalEnv(envPath)
      success(`Found ${result.localVariables.length} variables in .env.local`)
    } catch (err) {
      error(`Failed to parse .env.local: ${(err as Error).message}`)
      process.exit(1)
    }

    // Step 5: Compare variables
    info('\nComparing variables...')
    
    // Check required variables
    result.presentVariables = result.requiredVariables.filter(v => 
      result.railwayVariables.includes(v)
    )
    
    // Find missing variables (in local but not in Railway)
    result.missingVariables = result.localVariables.filter(v => 
      !result.railwayVariables.includes(v)
    )
    
    // Find extra variables (in Railway but not in local)
    result.extraVariables = result.railwayVariables.filter(v => 
      !result.localVariables.includes(v) && 
      !['RAILWAY_', 'NIXPACKS_'].some(prefix => v.startsWith(prefix))
    )

    // Step 6: Display results
    console.log()
    log('📋 VERIFICATION RESULTS', colors.bright)
    log('=====================', colors.bright)
    
    console.log()
    log('Required Variables:', colors.cyan)
    for (const varName of result.requiredVariables) {
      if (result.railwayVariables.includes(varName)) {
        success(varName)
      } else {
        error(varName)
      }
    }

    if (result.missingVariables.length > 0) {
      console.log()
      log(`Missing Variables (${result.missingVariables.length}):`, colors.red)
      result.missingVariables.forEach(v => console.log(`  ❌ ${v}`))
    }

    if (result.extraVariables.length > 0) {
      console.log()
      log(`Extra Variables in Railway (${result.extraVariables.length}):`, colors.yellow)
      result.extraVariables.forEach(v => console.log(`  ⚠️  ${v}`))
    }

    // Step 7: Test deployment health (optional)
    console.log()
    info('Testing deployment health endpoint...')
    try {
      const railwayUrl = await getRailwayUrl()
      info(`Found deployment URL: ${railwayUrl}`)
      
      const healthResult = await testHealthEndpoint(railwayUrl)
      result.healthCheckResult = healthResult
      
      if (healthResult.success && healthResult.envCheck === 'pass') {
        success('Health check passed - environment variables are accessible')
      } else if (healthResult.success) {
        warning(`Health check returned ${healthResult.status} but env_check: ${healthResult.envCheck}`)
      } else {
        error(`Health check failed: ${healthResult.error || `Status ${healthResult.status}`}`)
      }
    } catch (err) {
      warning(`Could not test deployment: ${(err as Error).message}`)
      info('Deploy your app first with: railway up')
    }

    // Step 8: Write log file
    console.log()
    info('Writing verification log...')
    const logPath = writeVerificationLog(result)
    success(`Log written to: ${logPath}`)

    // Final summary
    console.log()
    log('📊 SUMMARY', colors.bright)
    log('=========', colors.bright)
    
    const requiredOk = result.requiredVariables.every(v => result.railwayVariables.includes(v))
    if (requiredOk) {
      success('All required variables are set')
    } else {
      error('Some required variables are missing')
    }

    if (result.missingVariables.length === 0) {
      success('All local variables are present in Railway')
    } else {
      warning(`${result.missingVariables.length} local variables are missing from Railway`)
    }

    if (result.healthCheckResult.success && result.healthCheckResult.envCheck === 'pass') {
      success('Deployment can access environment variables')
    }

    console.log()
    if (!requiredOk || result.missingVariables.length > 0) {
      info('To fix missing variables, run:')
      console.log('  npm run railway:prepare')
      console.log('  npm run railway:push')
    }

  } catch (err) {
    error(`Unexpected error: ${(err as Error).message}`)
    console.error(err)
    process.exit(1)
  }
}

// Run the verification
main().catch(err => {
  error(`Fatal error: ${err.message}`)
  process.exit(1)
})