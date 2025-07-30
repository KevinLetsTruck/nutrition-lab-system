// Test script to simulate frontend session creation
const fetch = require('node-fetch')

async function testFrontendSessionCreation() {
  console.log('=== TESTING FRONTEND SESSION CREATION ===\n')
  
  try {
    // Test 1: Create session without clientId (new user)
    console.log('1. Testing session creation without clientId...')
    const response1 = await fetch('http://localhost:3000/api/streamlined-onboarding/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    
    if (!response1.ok) {
      console.log('❌ Session creation failed:', response1.status, response1.statusText)
      const errorText = await response1.text()
      console.log('Error response:', errorText)
      return
    }
    
    const session1 = await response1.json()
    console.log('✅ Session created successfully:', {
      id: session1.id,
      session_token: session1.session_token,
      current_step: session1.current_step,
      progress_percentage: session1.progress_percentage
    })
    
    // Test 2: Create session with valid UUID clientId
    console.log('\n2. Testing session creation with valid clientId...')
    const validClientId = '123e4567-e89b-12d3-a456-426614174000'
    const response2 = await fetch('http://localhost:3000/api/streamlined-onboarding/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId: validClientId }),
    })
    
    if (!response2.ok) {
      console.log('❌ Session creation with clientId failed:', response2.status, response2.statusText)
      const errorText = await response2.text()
      console.log('Error response:', errorText)
      return
    }
    
    const session2 = await response2.json()
    console.log('✅ Session with clientId created successfully:', {
      id: session2.id,
      client_id: session2.client_id,
      session_token: session2.session_token,
      current_step: session2.current_step
    })
    
    // Test 3: Test invalid clientId (should still work but warn)
    console.log('\n3. Testing session creation with invalid clientId...')
    const invalidClientId = 'invalid-uuid'
    const response3 = await fetch('http://localhost:3000/api/streamlined-onboarding/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId: invalidClientId }),
    })
    
    if (!response3.ok) {
      console.log('❌ Session creation with invalid clientId failed:', response3.status, response3.statusText)
      const errorText = await response3.text()
      console.log('Error response:', errorText)
      return
    }
    
    const session3 = await response3.json()
    console.log('✅ Session with invalid clientId created successfully (client_id should be null):', {
      id: session3.id,
      client_id: session3.client_id,
      session_token: session3.session_token
    })
    
    console.log('\n=== ALL FRONTEND TESTS PASSED ===')
    console.log('✅ The Next button should now work correctly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFrontendSessionCreation() 