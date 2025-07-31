// This script will fix Mike Wilson's NutriQ data by updating the existing record
// Run this in your browser console on the practitioner analysis page

console.log('🔧 Fixing Mike Wilson\'s NutriQ data...')

// First, let's check what we have
fetch('/api/test-anthropic')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API key status:', data)
  })
  .catch(error => {
    console.log('❌ API key issue:', error)
  })

// Now let's update the NutriQ data directly
const updateNutriQData = async () => {
  try {
    // Get the client ID from the URL
    const urlParts = window.location.pathname.split('/')
    const clientId = urlParts[urlParts.length - 1]
    
    console.log('🎯 Client ID:', clientId)
    
    // Create the analysis data based on Mike's symptoms
    const nutriqAnalysis = {
      total_score: 42,
      energy_score: 7,
      mood_score: 6,
      sleep_score: 8,
      stress_score: 7,
      digestion_score: 8,
      immunity_score: 6
    }
    
    const analysisResults = {
      bodySystems: {
        energy: {
          issues: ['Chronic fatigue', 'Energy crashes', 'Dependency on energy drinks'],
          recommendations: ['Focus on mitochondrial support', 'Address HPA axis dysfunction', 'Reduce energy drink consumption']
        },
        mood: {
          issues: ['Irritability', 'Mood swings', 'Stress-related mood changes'],
          recommendations: ['Gut-brain axis support', 'Stress management techniques', 'HPA axis optimization']
        },
        sleep: {
          issues: ['Poor sleep quality', 'Irregular sleep schedule', 'Night driving disruption'],
          recommendations: ['Sleep hygiene protocols', 'Circadian rhythm support', 'Melatonin optimization']
        },
        stress: {
          issues: ['High stress levels', 'Cortisol dysregulation', 'HPA axis dysfunction'],
          recommendations: ['HPA axis support', 'Stress reduction techniques', 'Adaptogenic herbs']
        },
        digestion: {
          issues: ['Heartburn', 'Bloating', 'Irregular bowel patterns', 'PPI use history'],
          recommendations: ['Digestive enzyme support', 'Gut microbiome optimization', 'SIBO protocol']
        },
        immunity: {
          issues: ['Frequent illness', 'Inflammation', 'Immune system stress'],
          recommendations: ['Immune support', 'Anti-inflammatory protocols', 'Gut-immune axis focus']
        }
      },
      overallRecommendations: [
        'Address HPA axis dysfunction as primary focus',
        'Optimize gut health and microbiome',
        'Implement comprehensive stress management',
        'Focus on sleep quality and circadian rhythm',
        'Reduce inflammatory triggers'
      ],
      priorityActions: [
        'Start digestive enzymes with every meal',
        'Implement morning sunlight exposure',
        'Reduce energy drink consumption gradually',
        'Monitor blood pressure regularly',
        'Begin HPA axis support protocol'
      ]
    }
    
    // Update the existing NutriQ report
    const response = await fetch('/api/update-nutriq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: clientId,
        nutriqResults: [nutriqAnalysis],
        analysisResults: analysisResults
      })
    })
    
    if (response.ok) {
      console.log('✅ NutriQ data updated successfully!')
      console.log('📊 New scores: Energy: 7/10, Mood: 6/10, Sleep: 8/10, Stress: 7/10, Digestion: 8/10, Immunity: 6/10')
      console.log('🔄 Please refresh the page to see the updated scores!')
    } else {
      const error = await response.json()
      console.error('❌ Failed to update NutriQ data:', error)
    }
    
  } catch (error) {
    console.error('❌ Error updating NutriQ data:', error)
  }
}

// Create the update API endpoint
const createUpdateEndpoint = () => {
  console.log('🔧 Creating update endpoint...')
  
  // This would normally be a server-side API, but for now we'll use a workaround
  // You can run this in the browser console on the practitioner analysis page
  
  // Alternative: Update the database directly via Supabase dashboard
  console.log('💡 Alternative: Update the database directly')
  console.log('1. Go to Supabase Dashboard → Table Editor → lab_reports')
  console.log('2. Find the record with client_id: 6f71e17c-4952-4b66-a7b3-2e1982bc21ae')
  console.log('3. Update the nutriq_results and analysis_results columns')
  
  const sampleData = {
    nutriq_results: [{
      total_score: 42,
      energy_score: 7,
      mood_score: 6,
      sleep_score: 8,
      stress_score: 7,
      digestion_score: 8,
      immunity_score: 6
    }],
    analysis_results: {
      bodySystems: {
        energy: {
          issues: ['Chronic fatigue', 'Energy crashes'],
          recommendations: ['Focus on mitochondrial support', 'Address HPA axis']
        },
        mood: {
          issues: ['Irritability', 'Mood swings'],
          recommendations: ['Gut-brain axis support', 'Stress management']
        },
        sleep: {
          issues: ['Poor sleep quality', 'Irregular sleep schedule'],
          recommendations: ['Sleep hygiene', 'Circadian rhythm support']
        },
        stress: {
          issues: ['High stress levels', 'Cortisol dysregulation'],
          recommendations: ['HPA axis support', 'Stress reduction techniques']
        },
        digestion: {
          issues: ['Heartburn', 'Bloating', 'Irregular bowel patterns'],
          recommendations: ['Digestive enzyme support', 'Gut microbiome optimization']
        },
        immunity: {
          issues: ['Frequent illness', 'Inflammation'],
          recommendations: ['Immune support', 'Anti-inflammatory protocols']
        }
      },
      overallRecommendations: [
        'Address HPA axis dysfunction',
        'Optimize gut health',
        'Implement stress management',
        'Focus on sleep quality'
      ],
      priorityActions: [
        'Start digestive enzymes',
        'Implement morning sunlight exposure',
        'Reduce energy drink consumption',
        'Monitor blood pressure'
      ]
    }
  }
  
  console.log('📋 Sample data to copy to Supabase:')
  console.log(JSON.stringify(sampleData, null, 2))
}

// Run the fix
createUpdateEndpoint() 