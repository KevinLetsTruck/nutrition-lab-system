require('dotenv').config({ path: '.env.local' })

async function testOnboardingFlow() {
  console.log('=== TESTING COMPLETE ONBOARDING FLOW ===\n')

  const baseUrl = 'http://localhost:3000'

  try {
    // Step 1: Create a new onboarding session
    console.log('1. Creating onboarding session...')
    const sessionResponse = await fetch(`${baseUrl}/api/streamlined-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    if (!sessionResponse.ok) {
      throw new Error(`Failed to create session: ${sessionResponse.status} ${sessionResponse.statusText}`)
    }

    const sessionData = await sessionResponse.json()
    console.log('✅ Session created:', sessionData.session_token)

    const sessionToken = sessionData.session_token

    // Step 2: Test getting session data
    console.log('\n2. Getting session data...')
    const getSessionResponse = await fetch(`${baseUrl}/api/streamlined-onboarding/session/${sessionToken}`)
    
    if (!getSessionResponse.ok) {
      throw new Error(`Failed to get session: ${getSessionResponse.status} ${getSessionResponse.statusText}`)
    }

    const sessionInfo = await getSessionResponse.json()
    console.log('✅ Session retrieved:', sessionInfo.current_step)

    // Step 3: Test updating session activity
    console.log('\n3. Updating session activity...')
    const activityResponse = await fetch(`${baseUrl}/api/streamlined-onboarding/session/${sessionToken}/activity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    if (!activityResponse.ok) {
      throw new Error(`Failed to update activity: ${activityResponse.status} ${activityResponse.statusText}`)
    }

    console.log('✅ Activity updated')

    // Step 4: Test saving step data
    console.log('\n4. Saving step data...')
    const stepData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567'
    }

    const stepResponse = await fetch(`${baseUrl}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 'demographics',
        data: stepData
      })
    })

    if (!stepResponse.ok) {
      throw new Error(`Failed to save step: ${stepResponse.status} ${stepResponse.statusText}`)
    }

    console.log('✅ Step data saved')

    // Step 5: Test getting onboarding data
    console.log('\n5. Getting onboarding data...')
    const dataResponse = await fetch(`${baseUrl}/api/streamlined-onboarding/session/${sessionToken}/data`)
    
    if (!dataResponse.ok) {
      throw new Error(`Failed to get data: ${dataResponse.status} ${dataResponse.statusText}`)
    }

    const onboardingData = await dataResponse.json()
    console.log('✅ Onboarding data retrieved:', onboardingData.first_name)

    // Step 6: Test completing onboarding
    console.log('\n6. Completing onboarding...')
    const completeResponse = await fetch(`${baseUrl}/api/streamlined-onboarding/session/${sessionToken}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    if (!completeResponse.ok) {
      throw new Error(`Failed to complete: ${completeResponse.status} ${completeResponse.statusText}`)
    }

    console.log('✅ Onboarding completed')

    console.log('\n🎉 ALL TESTS PASSED! The onboarding system is working perfectly!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testOnboardingFlow() 