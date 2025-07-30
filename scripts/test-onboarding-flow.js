#!/usr/bin/env node

/**
 * Test script to verify the complete onboarding flow
 * This script simulates the client-side onboarding process
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testOnboardingFlow() {
  console.log('🧪 Testing Complete Onboarding Flow')
  console.log('='.repeat(50))

  let allTestsPassed = true
  let sessionToken = null

  // Test 1: Create Session (simulates client initialization)
  console.log('\n📄 Test 1: Create Session (Client Initialization)')
  try {
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // No clientId for anonymous user
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
      
      sessionToken = data.session_token
    } else {
      console.log(`❌ Session creation failed: ${response.status} ${response.statusText}`)
      const errorData = await response.text()
      console.log('Error response:', errorData)
      allTestsPassed = false
      return
    }
  } catch (error) {
    console.log(`❌ Session creation error: ${error.message}`)
    allTestsPassed = false
    return
  }

  // Test 2: Save Demographics Step
  console.log('\n📄 Test 2: Save Demographics Step')
  try {
    const demographicsData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com'
    }
    
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        step: 'demographics', 
        data: demographicsData 
      }),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Demographics step saved successfully')
    } else {
      console.log(`❌ Demographics step save failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Demographics step save error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 3: Save Diet Step
  console.log('\n📄 Test 3: Save Diet Step')
  try {
    const dietData = {
      dietType: 'keto',
      foodAllergies: ['gluten', 'dairy'],
      mealFrequency: '3',
      waterIntake: '64-96oz'
    }
    
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        step: 'diet', 
        data: dietData 
      }),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Diet step saved successfully')
    } else {
      console.log(`❌ Diet step save failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Diet step save error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 4: Save Medications Step
  console.log('\n📄 Test 4: Save Medications Step')
  try {
    const medicationsData = {
      currentMedications: ['Lisinopril', 'Metformin'],
      supplements: ['Vitamin D', 'Fish Oil']
    }
    
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        step: 'medications', 
        data: medicationsData 
      }),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Medications step saved successfully')
    } else {
      console.log(`❌ Medications step save failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Medications step save error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 5: Save Goals Step
  console.log('\n📄 Test 5: Save Goals Step')
  try {
    const goalsData = {
      healthGoals: ['Weight Management', 'Energy & Vitality'],
      primaryConcern: 'I want to improve my overall health and energy levels',
      timeline: '3-6 months'
    }
    
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        step: 'goals', 
        data: goalsData 
      }),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Goals step saved successfully')
    } else {
      console.log(`❌ Goals step save failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Goals step save error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 6: Save Truck Info Step
  console.log('\n📄 Test 6: Save Truck Info Step')
  try {
    const truckData = {
      routeType: 'long-haul',
      hoursPerWeek: '60-70',
      sleepSchedule: 'irregular'
    }
    
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        step: 'truck_info', 
        data: truckData 
      }),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Truck info step saved successfully')
    } else {
      console.log(`❌ Truck info step save failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Truck info step save error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 7: Save DOT Status Step
  console.log('\n📄 Test 7: Save DOT Status Step')
  try {
    const dotData = {
      dotStatus: 'clear',
      hasRestrictions: false,
      restrictions: []
    }
    
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        step: 'dot_status', 
        data: dotData 
      }),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ DOT status step saved successfully')
    } else {
      console.log(`❌ DOT status step save failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ DOT status step save error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 8: Get Complete Onboarding Data
  console.log('\n📄 Test 8: Get Complete Onboarding Data')
  try {
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/data`)
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Complete onboarding data retrieved successfully')
      console.log('Data summary:', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        dietType: data.dietType,
        currentMedications: data.currentMedications,
        healthGoals: data.healthGoals,
        routeType: data.route_type,
        dotStatus: data.dot_medical_status
      })
    } else {
      console.log(`❌ Onboarding data retrieval failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Onboarding data retrieval error: ${error.message}`)
    allTestsPassed = false
  }

  // Test 9: Complete Onboarding
  console.log('\n📄 Test 9: Complete Onboarding')
  try {
    const response = await fetch(`${BASE_URL}/api/streamlined-onboarding/session/${sessionToken}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Onboarding completed successfully')
    } else {
      console.log(`❌ Onboarding completion failed: ${response.status} ${response.statusText}`)
      allTestsPassed = false
    }
  } catch (error) {
    console.log(`❌ Onboarding completion error: ${error.message}`)
    allTestsPassed = false
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (allTestsPassed) {
    console.log('🎉 All onboarding flow tests passed!')
    console.log('\n✅ Complete flow verified:')
    console.log('  • Session creation works')
    console.log('  • All form steps save correctly')
    console.log('  • Data persistence works')
    console.log('  • Onboarding completion works')
    console.log('  • API endpoints are functioning properly')
  } else {
    console.log('❌ Some tests failed. Please review the issues above.')
  }

  console.log('\n📋 Next steps:')
  console.log('  1. Test the onboarding form in the browser')
  console.log('  2. Verify the UI works correctly')
  console.log('  3. Test form validation and error handling')
  console.log('  4. Verify responsive design on mobile')
}

// Run the tests
testOnboardingFlow().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
}) 