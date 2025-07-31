#!/usr/bin/env node

/**
 * Test the login API endpoint directly
 */

import fetch from 'node-fetch'

async function testLoginAPI() {
  console.log('🧪 Testing login API endpoint...\n')
  
  const testData = {
    email: 'kevin@letstruck.com',
    password: 'testpassword123' // You'll need to provide the actual password
  }
  
  try {
    console.log('📤 Sending login request...')
    console.log('   URL: http://localhost:3000/api/auth/login')
    console.log('   Email:', testData.email)
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })
    
    console.log('\n📥 Response received:')
    console.log('   Status:', response.status)
    console.log('   Status Text:', response.statusText)
    
    const data = await response.json()
    console.log('   Response Data:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('\n✅ Login successful!')
      console.log('   User ID:', data.user?.id)
      console.log('   Role:', data.user?.role)
      console.log('   Email Verified:', data.user?.emailVerified)
    } else {
      console.log('\n❌ Login failed:')
      console.log('   Error:', data.error)
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message)
    console.log('\n💡 Make sure the development server is running:')
    console.log('   npm run dev')
  }
}

// Run the test
testLoginAPI().catch(console.error) 