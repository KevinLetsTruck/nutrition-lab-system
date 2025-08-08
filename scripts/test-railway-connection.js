#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

console.log('🚀 Testing Railway PostgreSQL Connection...\n')

// Validate environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  console.log('Please ensure DATABASE_URL is set in your environment or .env.local file')
  process.exit(1)
}

// Parse and display connection info
try {
  const url = new URL(process.env.DATABASE_URL)
  console.log('📊 Connection Details:')
  console.log(`  Host: ${url.hostname}`)
  console.log(`  Port: ${url.port || '5432'}`)
  console.log(`  Database: ${url.pathname.slice(1)}`)
  console.log(`  SSL Mode: ${url.searchParams.get('sslmode') || 'not set'}`)
  console.log(`  Connection Limit: ${url.searchParams.get('connection_limit') || 'not set'}`)
  console.log(`  Pool Timeout: ${url.searchParams.get('pool_timeout') || 'not set'}\n`)
} catch (error) {
  console.error('❌ Invalid DATABASE_URL format:', error.message)
  process.exit(1)
}

// Create Prisma client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'minimal'
})

async function testConnection() {
  const tests = []
  
  // Test 1: Basic connection
  console.log('🧪 Test 1: Basic Connection')
  try {
    const start = Date.now()
    await prisma.$connect()
    const duration = Date.now() - start
    console.log(`✅ Connected successfully (${duration}ms)`)
    tests.push({ name: 'Basic Connection', success: true, duration })
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    tests.push({ name: 'Basic Connection', success: false, error: error.message })
    return tests
  }
  
  // Test 2: Simple query
  console.log('\n🧪 Test 2: Simple Query')
  try {
    const start = Date.now()
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`
    const duration = Date.now() - start
    console.log(`✅ Query successful (${duration}ms)`)
    console.log(`  PostgreSQL Version: ${result[0].pg_version.split(',')[0]}`)
    console.log(`  Server Time: ${result[0].current_time}`)
    tests.push({ name: 'Simple Query', success: true, duration })
  } catch (error) {
    console.error('❌ Query failed:', error.message)
    tests.push({ name: 'Simple Query', success: false, error: error.message })
  }
  
  // Test 3: Table access
  console.log('\n🧪 Test 3: Table Access')
  try {
    const start = Date.now()
    const count = await prisma.user.count()
    const duration = Date.now() - start
    console.log(`✅ Table access successful (${duration}ms)`)
    console.log(`  User count: ${count}`)
    tests.push({ name: 'Table Access', success: true, duration, count })
  } catch (error) {
    console.error('❌ Table access failed:', error.message)
    tests.push({ name: 'Table Access', success: false, error: error.message })
  }
  
  // Test 4: Connection pool
  console.log('\n🧪 Test 4: Connection Pool')
  try {
    const start = Date.now()
    const promises = Array(5).fill(null).map((_, i) => 
      prisma.$queryRaw`SELECT ${i} as query_id`
    )
    await Promise.all(promises)
    const duration = Date.now() - start
    console.log(`✅ Concurrent queries successful (${duration}ms)`)
    console.log(`  5 queries executed concurrently`)
    tests.push({ name: 'Connection Pool', success: true, duration })
  } catch (error) {
    console.error('❌ Connection pool test failed:', error.message)
    tests.push({ name: 'Connection Pool', success: false, error: error.message })
  }
  
  // Test 5: SSL verification
  console.log('\n🧪 Test 5: SSL Verification')
  try {
    const start = Date.now()
    const result = await prisma.$queryRaw`SHOW ssl`
    const duration = Date.now() - start
    console.log(`✅ SSL check successful (${duration}ms)`)
    console.log(`  SSL enabled: ${result[0].ssl}`)
    tests.push({ name: 'SSL Verification', success: true, duration, ssl: result[0].ssl })
  } catch (error) {
    console.error('❌ SSL check failed:', error.message)
    tests.push({ name: 'SSL Verification', success: false, error: error.message })
  }
  
  return tests
}

// Run tests
testConnection()
  .then(tests => {
    console.log('\n📊 Test Summary:')
    const passed = tests.filter(t => t.success).length
    const failed = tests.filter(t => !t.success).length
    console.log(`  Total: ${tests.length}`)
    console.log(`  Passed: ${passed}`)
    console.log(`  Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('\n❌ Some tests failed. Please check your configuration.')
      process.exit(1)
    } else {
      console.log('\n✅ All tests passed! Your Railway database is properly configured.')
      process.exit(0)
    }
  })
  .catch(error => {
    console.error('\n❌ Test runner error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
