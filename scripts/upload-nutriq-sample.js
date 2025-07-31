const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('💡 This script needs to be run in production or with proper env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadSampleNutriQData() {
  console.log('🔧 Uploading sample NutriQ data for testing...')
  
  try {
    // Find Mike Wilson
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .or('first_name.ilike.%mike%,last_name.ilike.%wilson%')
    
    if (clientError) {
      throw new Error(`Failed to find Mike Wilson: ${clientError.message}`)
    }
    
    if (!clients || clients.length === 0) {
      console.log('❌ Mike Wilson not found in database')
      return
    }
    
    const client = clients[0]
    console.log(`✅ Found client: ${client.first_name} ${client.last_name} (ID: ${client.id})`)
    
    // Check if NutriQ data already exists
    const { data: existingReports, error: existingError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', client.id)
      .eq('report_type', 'nutriq')
    
    if (existingError) {
      throw new Error(`Failed to check existing reports: ${existingError.message}`)
    }
    
    if (existingReports && existingReports.length > 0) {
      console.log(`📊 Found ${existingReports.length} existing NutriQ reports`)
      
      // Update existing report with sample data
      const existingReport = existingReports[0]
      console.log('🔄 Updating existing NutriQ report with sample data...')
      
      const sampleNutriQData = {
        total_score: 42,
        energy_score: 7,
        mood_score: 6,
        sleep_score: 8,
        stress_score: 7,
        digestion_score: 8,
        immunity_score: 6
      }
      
      const { error: updateError } = await supabase
        .from('lab_reports')
        .update({
          nutriq_results: [sampleNutriQData],
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
        })
        .eq('id', existingReport.id)
      
      if (updateError) {
        throw new Error(`Failed to update NutriQ report: ${updateError.message}`)
      }
      
      console.log('✅ Successfully updated existing NutriQ report with sample data')
      
    } else {
      console.log('📝 Creating new NutriQ report with sample data...')
      
      // Create new NutriQ report
      const { error: insertError } = await supabase
        .from('lab_reports')
        .insert({
          client_id: client.id,
          report_type: 'nutriq',
          report_date: new Date().toISOString().split('T')[0],
          status: 'completed',
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
        })
      
      if (insertError) {
        throw new Error(`Failed to create NutriQ report: ${insertError.message}`)
      }
      
      console.log('✅ Successfully created new NutriQ report with sample data')
    }
    
    console.log('\n🎉 Sample NutriQ data uploaded successfully!')
    console.log('📊 Scores: Energy: 7/10, Mood: 6/10, Sleep: 8/10, Stress: 7/10, Digestion: 8/10, Immunity: 6/10')
    console.log('💡 Now refresh Mike Wilson\'s practitioner analysis report to see the scores!')
    
  } catch (error) {
    console.error('❌ Error uploading sample NutriQ data:', error.message)
    process.exit(1)
  }
}

uploadSampleNutriQData() 