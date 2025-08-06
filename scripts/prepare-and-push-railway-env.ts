#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

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

interface EnvVariable {
  key: string
  value: string
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

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

// Parse environment file and filter out comments and empty lines
function parseEnvFile(filePath: string): EnvVariable[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const variables: EnvVariable[] = []

    for (const line of lines) {
      // Skip comments and empty lines
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      // Parse key=value pairs
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (match) {
        const [, key, value] = match
        // Remove surrounding quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')
        variables.push({ key, value: cleanValue })
      }
    }

    return variables
  } catch (err) {
    if ((err as any).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`)
    }
    throw err
  }
}

// Validate required variables
function validateRequiredVariables(variables: EnvVariable[]): { valid: boolean; missing: string[] } {
  const required = [
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const varMap = new Map(variables.map(v => [v.key, v.value]))
  const missing = required.filter(key => !varMap.has(key) || !varMap.get(key))

  return {
    valid: missing.length === 0,
    missing
  }
}

// Add Railway-specific variables
function addRailwayVariables(variables: EnvVariable[]): EnvVariable[] {
  const railwayVars: EnvVariable[] = [
    { key: 'NODE_ENV', value: 'production' },
    { key: 'RAILWAY_ENVIRONMENT', value: 'production' }
  ]

  // Create a map to avoid duplicates
  const varMap = new Map(variables.map(v => [v.key, v]))

  // Add Railway variables (overwriting if they exist)
  for (const railwayVar of railwayVars) {
    varMap.set(railwayVar.key, railwayVar)
  }

  return Array.from(varMap.values())
}

// Generate Railway CLI command with masked values for display
function generateRailwayCommandMasked(variables: EnvVariable[]): string {
  // Generate individual set commands with masked values
  const commands = variables.map(({ key }) => 
    `railway variables --set ${key}=<value>`
  )

  return commands.join(' && ')
}

// Generate actual Railway CLI command (for file output only)
function generateRailwayCommand(variables: EnvVariable[]): string {
  // Escape values for shell command
  const escapeShellValue = (value: string): string => {
    // If value contains spaces, quotes, or special characters, wrap in single quotes
    // and escape any single quotes within
    if (/[\s"'$`\\!]/.test(value)) {
      return `'${value.replace(/'/g, "'\\''")}'`
    }
    return value
  }

  // Generate individual set commands
  const commands = variables.map(({ key, value }) => 
    `railway variables --set ${key}=${escapeShellValue(value)}`
  )

  return commands.join(' && ')
}

// Write clean .env.railway file
function writeRailwayEnvFile(variables: EnvVariable[], outputPath: string) {
  const content = variables
    .map(({ key, value }) => `${key}=${value}`)
    .join('\n')

  fs.writeFileSync(outputPath, content + '\n')
}

// Main execution
async function main() {
  try {
    log('🚂 Railway Environment Variable Preparation Tool', colors.bright)
    log('================================================\n')

    // Step 1: Read .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    info(`Reading environment variables from: ${envPath}`)
    
    let variables: EnvVariable[]
    try {
      variables = parseEnvFile(envPath)
      success(`Found ${variables.length} environment variables`)
    } catch (err) {
      error(`Failed to read .env.local: ${(err as Error).message}`)
      info('Make sure .env.local exists in the project root')
      process.exit(1)
    }

    // Step 2: Validate required variables
    info('\nValidating required variables...')
    const validation = validateRequiredVariables(variables)
    
    if (!validation.valid) {
      error('Missing required environment variables:')
      validation.missing.forEach(key => {
        console.log(`  - ${colors.red}${key}${colors.reset}`)
      })
      console.log()
      info('Please add these variables to your .env.local file')
      process.exit(1)
    }
    success('All required variables are present')

    // Step 3: Add Railway-specific variables
    info('\nAdding Railway-specific variables...')
    variables = addRailwayVariables(variables)
    success('Added NODE_ENV=production and RAILWAY_ENVIRONMENT=production')

    // Step 4: Write .env.railway file
    const railwayEnvPath = path.join(process.cwd(), '.env.railway')
    info('\nWriting clean environment file...')
    writeRailwayEnvFile(variables, railwayEnvPath)
    success(`Created: ${railwayEnvPath}`)

    // Step 5: Generate Railway CLI command
    info('\nGenerating Railway CLI command...')
    const actualCommand = generateRailwayCommand(variables)
    const maskedCommand = generateRailwayCommandMasked(variables)
    
    // Write actual command to a secure file
    const commandFilePath = path.join(process.cwd(), '.railway-command.sh')
    fs.writeFileSync(commandFilePath, `#!/bin/bash\n# Railway Environment Variable Setup\n# Generated at: ${new Date().toISOString()}\n# IMPORTANT: Delete this file after running it!\n\n${actualCommand}\n`, { mode: 0o600 })
    success(`Secure command file created: ${commandFilePath}`)

    // Step 6: Show summary
    console.log()
    log('📋 SUMMARY', colors.bright)
    log('==========', colors.bright)
    console.log()
    log('Variables to be set on Railway:', colors.cyan)
    variables.forEach(({ key }) => {
      const isRequired = [
        'ANTHROPIC_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ].includes(key)
      
      const isRailway = ['NODE_ENV', 'RAILWAY_ENVIRONMENT'].includes(key)
      
      if (isRequired) {
        console.log(`  ${colors.green}✓${colors.reset} ${key} ${colors.dim}(required)${colors.reset}`)
      } else if (isRailway) {
        console.log(`  ${colors.blue}+${colors.reset} ${key} ${colors.dim}(Railway-specific)${colors.reset}`)
      } else {
        console.log(`  • ${key}`)
      }
    })

    console.log()
    log('🚀 DEPLOYMENT INSTRUCTIONS', colors.bright)
    log('=========================', colors.bright)
    console.log()
    log('1. First, make sure you are logged in to Railway:', colors.yellow)
    console.log(`   ${colors.dim}railway login${colors.reset}`)
    console.log()
    log('2. Link your project (if not already linked):', colors.yellow)
    console.log(`   ${colors.dim}railway link${colors.reset}`)
    console.log()
    log('3. Run the generated command file to set all variables:', colors.yellow)
    console.log(`   ${colors.bright}${colors.green}bash .railway-command.sh${colors.reset}`)
    console.log()
    log('   OR set variables manually with this format:', colors.yellow)
    console.log(`   ${colors.cyan}${maskedCommand}${colors.reset}`)
    console.log()
    log('4. Delete the command file (IMPORTANT!):', colors.yellow)
    console.log(`   ${colors.bright}${colors.red}rm .railway-command.sh${colors.reset}`)
    console.log()
    log('5. Verify variables were set correctly:', colors.yellow)
    console.log(`   ${colors.dim}railway variables${colors.reset}`)
    console.log()
    log('6. Deploy your application:', colors.yellow)
    console.log(`   ${colors.dim}railway up${colors.reset}`)
    console.log()
    
    warning('Security Note: Your actual API keys are stored securely in:')
    warning('  - .env.railway (clean environment file)')
    warning('  - .railway-command.sh (executable command with real values)')
    warning('\nMAKE SURE TO ADD THESE TO YOUR .gitignore:')
    warning('  - .env.railway')
    warning('  - .railway-command.sh')
    console.log()
    
    success('Preparation complete! Follow the instructions above to deploy.')

  } catch (err) {
    error(`Unexpected error: ${(err as Error).message}`)
    console.error(err)
    process.exit(1)
  }
}

// Run the script
main().catch(err => {
  error(`Fatal error: ${err.message}`)
  process.exit(1)
})