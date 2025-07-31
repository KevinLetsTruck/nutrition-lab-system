#!/usr/bin/env node

/**
 * Simple login test - you'll need to provide your actual password
 */

import fetch from 'node-fetch'

async function testLogin() {
  console.log('🧪 Simple Login Test\n')
  
  // You'll need to replace this with your actual password
  const password = process.argv[2] || 'your_actual_password_here'
  
  if (password === 'your_actual_password_here') {
    console.log('❌ Please provide your actual password as an argument:')
    console.log('   node scripts/test-login-simple.js your_actual_password')
    console.log('\n💡 If you don\'t remember your password, you can reset it in the database.')
    return
  }
  
  const testData = {
    email: 'kevin@letstruck.com',
    password: password
  }
  
  try {
    console.log('📤 Testing login with:')
    console.log('   Email: kevin@letstruck.com')
    console.log('   Password: [hidden]')
    console.log('   URL: http://localhost:3000/api/auth/login')
    
    const startTime = Date.now()
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`\n📥 Response received in ${duration}ms:`)
    console.log('   Status:', response.status)
    console.log('   Status Text:', response.statusText)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('\n✅ Login successful!')
      console.log('   User ID:', data.user?.id)
      console.log('   Role:', data.user?.role)
      console.log('   Email Verified:', data.user?.emailVerified)
      console.log('   Profile:', data.profile ? 'Available' : 'Not available')
      console.log('\n🎉 The login API is working correctly!')
    } else {
      console.log('\n❌ Login failed:')
      console.log('   Error:', data.error)
      
      if (data.error?.includes('password')) {
        console.log('\n💡 The password might be incorrect.')
        console.log('   Try a different password or check your credentials.')
      }
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message)
    console.log('\n💡 Make sure:')
    console.log('   1. The development server is running (npm run dev)')
    console.log('   2. You\'re using the correct password')
    console.log('   3. The server is accessible at http://localhost:3000')
  }
}

// Run the test
testLogin().catch(console.error) 