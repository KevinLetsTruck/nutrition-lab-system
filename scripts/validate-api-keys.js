#!/usr/bin/env node

/**
 * Validates API key formats for the Nutrition Lab System
 * Ensures all required API keys are present and properly formatted
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env.production' })

const chalk = require('chalk') || { 
  green: (s) => `✅ ${s}`,
  red: (s) => `❌ ${s}`,
  yellow: (s) => `⚠️  ${s}`,
  blue: (s) => `ℹ️  ${s}`
}

// API Key validation patterns
const API_KEY_PATTERNS = {
  ANTHROPIC_API_KEY: {
    pattern: /^sk-ant-api03-[\w\-]{40,}$/,
    description: 'Anthropic (Claude) API key',
    format: 'sk-ant-api03-[40+ characters]',
    example: 'sk-ant-api03-aBcDeFgHiJkLmNoPqRsTuVwXyZ...'
  },
  OPENAI_API_KEY: {
    pattern: /^sk-[a-zA-Z0-9]{40,}$/,
    description: 'OpenAI API key',
    format: 'sk-[40+ characters]',
    example: 'sk-aBcDeFgHiJkLmNoPqRsTuVwXyZ...'
  },
  NEXT_PUBLIC_SUPABASE_URL: {
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
    description: 'Supabase project URL',
    format: 'https://[project-id].supabase.co',
    example: 'https://abcdefghijklmnop.supabase.co'
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    pattern: /^eyJ[a-zA-Z0-9\-_]+\.eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
    description: 'Supabase anonymous key (JWT)',
    format: 'JWT token (3 parts separated by dots)',
    example: 'eyJhbGc...eyJpc3M...signature'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    pattern: /^eyJ[a-zA-Z0-9\-_]+\.eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/,
    description: 'Supabase service role key (JWT)',
    format: 'JWT token (3 parts separated by dots)',
    example: 'eyJhbGc...eyJpc3M...signature'
  }
}

// Common API key format mistakes
const COMMON_MISTAKES = {
  ANTHROPIC_API_KEY: [
    {
      pattern: /^skantapi03[_\-]/,
      message: 'Missing dashes in prefix! Should be "sk-ant-api03-" not "skantapi03_"'
    },
    {
      pattern: /^sk_ant_api03/,
      message: 'Using underscores instead of dashes! Should be "sk-ant-api03-"'
    },
    {
      pattern: /^[a-zA-Z0-9\-_]+$/,
      message: 'Missing the required prefix "sk-ant-api03-"'
    }
  ]
}

function validateApiKey(keyName, keyValue) {
  const validation = API_KEY_PATTERNS[keyName]
  
  if (!validation) {
    return { valid: true, message: 'No validation pattern defined' }
  }
  
  if (!keyValue) {
    return { 
      valid: false, 
      message: `Missing ${validation.description}`,
      format: validation.format,
      example: validation.example
    }
  }
  
  // Check for common mistakes first
  const mistakes = COMMON_MISTAKES[keyName]
  if (mistakes) {
    for (const mistake of mistakes) {
      if (mistake.pattern.test(keyValue)) {
        return {
          valid: false,
          message: mistake.message,
          format: validation.format,
          example: validation.example
        }
      }
    }
  }
  
  // Validate against correct pattern
  if (!validation.pattern.test(keyValue)) {
    // Mask the key for security
    const maskedKey = keyValue.length > 10 
      ? keyValue.substring(0, 10) + '...' 
      : keyValue
    
    return {
      valid: false,
      message: `Invalid format for ${validation.description}`,
      actual: maskedKey,
      format: validation.format,
      example: validation.example
    }
  }
  
  return { valid: true }
}

function checkEnvironment() {
  console.log('🔍 Validating API Keys and Environment Variables\n')
  
  const requiredKeys = Object.keys(API_KEY_PATTERNS)
  let hasErrors = false
  let hasWarnings = false
  
  // Check each required key
  for (const keyName of requiredKeys) {
    const keyValue = process.env[keyName]
    const result = validateApiKey(keyName, keyValue)
    
    if (result.valid) {
      console.log(chalk.green(`✅ ${keyName}: Valid`))
    } else {
      hasErrors = true
      console.log(chalk.red(`❌ ${keyName}: ${result.message}`))
      if (result.format) {
        console.log(chalk.yellow(`   Expected format: ${result.format}`))
      }
      if (result.example) {
        console.log(chalk.blue(`   Example: ${result.example}`))
      }
      if (result.actual) {
        console.log(chalk.red(`   Your value: ${result.actual}`))
      }
      console.log()
    }
  }
  
  // Check for development vs production
  const nodeEnv = process.env.NODE_ENV || 'development'
  console.log(`\n📍 Environment: ${nodeEnv}`)
  
  // Additional checks
  if (process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY) {
    console.log(chalk.yellow('\n⚠️  Both Anthropic and OpenAI keys are set. Make sure you\'re using the right one!'))
    hasWarnings = true
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  if (hasErrors) {
    console.log(chalk.red('❌ Validation failed! Please fix the errors above.'))
    console.log(chalk.yellow('\n💡 Tip: Copy API keys directly from the provider\'s console without modification.'))
    process.exit(1)
  } else if (hasWarnings) {
    console.log(chalk.yellow('⚠️  Validation passed with warnings.'))
  } else {
    console.log(chalk.green('✅ All API keys are valid!'))
  }
}

// Run validation
checkEnvironment()