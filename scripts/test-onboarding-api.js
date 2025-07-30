#!/usr/bin/env node

/**
 * Test script to verify onboarding API endpoints
 * This script tests the session creation and other API endpoints
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000' // Adjust if using different port

async function testOnboardingAPI() {
  console.log('🧪 Testing Onboarding API Endpoints')
  console.log('='.repeat(50))

  let allTestsPassed = true

  // Test 1: Session Creation
  console.log('\n📄 Test 1: Session Creation')
  try {
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId: 'test-client-123' }),
    })

    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Session created successfully')
      console.log('Session data:', {
        id: data.id,
        session_token: data.session_token,
        current_step: data.current_step,
        progress_percentage: data.progress_percentage
      })
      
      // Store session token for other tests
      global.testSessionToken = data.session_token
    } else {
      console.log(`❌ Session creation failed: ${response.status} ${response.statusText}`)
      const errorData = await response.text()
      console.log('Error response:', errorData)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Session creation error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 2: Get Session (if session was created)
  if (global.testSessionToken) {
    console.log('\n📄 Test 2: Get Session')
    try {
      const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${global.testSessionToken}`)
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Session retrieved successfully')
        console.log('Session data:', {
          id: data.id,
          session_token: data.session_token,
          current_step: data.current_step
        })
      } else {
        console.log(`❌ Session retrieval failed: ${response.status} ${response.statusText}`)
        allTestsPassed = false
      }
    } catch (error) {
      console.log(`❌ Session retrieval error: ${error.message}`)
      allTestsPassed = false
    }
  }

  // Test 3: Save Step Data (if session was created)
  if (global.testSessionToken) {
    console.log('\n📄 Test 3: Save Step Data')
    try {
      const testData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      }
      
      const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${global.testSessionToken}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          step: 'demographics', 
          data: testData 
        }),
      })
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        console.log('✅ Step data saved successfully')
      } else {
        console.log(`❌ Step data save failed: ${response.status} ${response.statusText}`)
        allTestsPassed = false
      }
    } catch (error) {
      console.log(`❌ Step data save error: ${error.message}`)
      allTestsPassed = false
    }
  }

  // Test 4: Get Onboarding Data (if session was created)
  if (global.testSessionToken) {
    console.log('\n📄 Test 4: Get Onboarding Data')
    try {
      const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${global.testSessionToken}/data`)
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Onboarding data retrieved successfully')
        console.log('Data:', data)
      } else {
        console.log(`❌ Onboarding data retrieval failed: ${response.status} ${response.statusText}`)
        allTestsPassed = false
      }
    } catch (error) {
      console.log(`❌ Onboarding data retrieval error: ${error.message}`)
      allTestsPassed = false
    }
  }

  // Test 5: Update Session Activity (if session was created)
  if (global.testSessionToken) {
    console.log('\n📄 Test 5: Update Session Activity')
    try {
      const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${global.testSessionToken}/activity`, {
        method: 'POST',
      })
      
      console.log(`Status: ${response.status}`)
      
      if (response.ok) {
        console.log('✅ Session activity updated successfully')
      } else {
        console.log(`❌ Session activity update failed: ${response.status} ${response.statusText}`)
        allTestsPassed = false
      }
    } catch (error) {
      console.log(`❌ Session activity update error: ${error.message}`)
      allTestsPassed = false
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (allTestsPassed) {
    console.log('🎉 All API tests passed! Onboarding API is working correctly.')
    console.log('\n✅ API endpoints verified:')
    console.log('  • POST /api/streamlined-onboarding/session - Session creation')
    console.log('  • GET /api/streamlined-onboarding/session/[token] - Session retrieval')
    console.log('  • POST /api/streamlined-onboarding/session/[token]/step - Step data save')
    console.log('  • GET /api/streamlined-onboarding/session/[token]/data - Data retrieval')
    console.log('  • POST /api/streamlined-onboarding/session/[token]/activity - Activity update')
  } else {
    console.log('❌ Some API tests failed. Please review the issues above.')
  }

  console.log('\n📋 Next steps:')
  console.log('  1. Test the onboarding form in the browser')
  console.log('  2. Verify session creation works from the UI')
  console.log('  3. Test form progression through all steps')
  console.log('  4. Verify data persistence between steps')
}

// Run the tests
testOnboardingAPI().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
}) 