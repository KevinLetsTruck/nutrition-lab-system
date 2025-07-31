#!/usr/bin/env node

/**
 * Test the /api/auth/me endpoint
 */

import fetch from 'node-fetch'

async function testAuthMe() {
  console.log('🧪 Testing /api/auth/me endpoint...\n')
  
  try {
    // First, get a login token
    console.log('📤 Getting login token...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'kevin@letstruck.com',
        password: 'testpassword123'
      }),
    })
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed, cannot test /api/auth/me')
      return
    }
    
    console.log('✅ Login successful, got cookies')
    
    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No')
    
    // Now test /api/auth/me with the cookies
    console.log('\n📤 Testing /api/auth/me...')
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    console.log('\n📥 /api/auth/me response:')
    console.log('   Status:', meResponse.status)
    console.log('   Status Text:', meResponse.statusText)
    
    const meData = await meResponse.json()
    console.log('   Response Data:', JSON.stringify(meData, null, 2))
    
    if (meResponse.ok) {
      console.log('\n✅ /api/auth/me is working correctly!')
      console.log('   User ID:', meData.user?.id)
      console.log('   Role:', meData.user?.role)
      console.log('   Profile:', meData.profile ? 'Available' : 'Not available')
    } else {
      console.log('\n❌ /api/auth/me failed:')
      console.log('   Error:', meData.error)
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

// Run the test
testAuthMe().catch(console.error) 