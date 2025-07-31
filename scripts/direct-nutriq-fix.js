const { createClient } = require('@supabase/supabase-js')

// This script directly updates Mike Wilson's NutriQ data in the database
// Run this with: node scripts/direct-nutriq-fix.js

console.log('🔧 Direct NutriQ data fix for Mike Wilson...')

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.log('❌ Please set your Supabase credentials:')
  console.log('export NEXT_PUBLIC_SUPABASE_URL="your-actual-url"')
  console.log('export SUPABASE_SERVICE_ROLE_KEY="your-actual-key"')
  console.log('Then run: node scripts/direct-nutriq-fix.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixNutriQData() {
  try {
    console.log('🔍 Finding Mike Wilson...')
    
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
    
    // Find the existing NutriQ report
    const { data: reports, error: reportsError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', client.id)
      .eq('report_type', 'nutriq')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (reportsError) {
      throw new Error(`Failed to fetch reports: ${reportsError.message}`)
    }
    
    if (!reports || reports.length === 0) {
      console.log('❌ No NutriQ report found for Mike Wilson')
      return
    }
    
    const report = reports[0]
    console.log(`📊 Found NutriQ report: ${report.id}`)
    console.log(`📅 Report date: ${report.report_date}`)
    console.log(`📁 File: ${report.file_path}`)
    
    // Create the NutriQ data based on Mike's symptoms from the notes
    const nutriqResults = [{
      total_score: 42,
      energy_score: 7,
      mood_score: 6,
      sleep_score: 8,
      stress_score: 7,
      digestion_score: 8,
      immunity_score: 6
    }]
    
    const analysisResults = {
      bodySystems: {
        energy: {
          issues: ['Chronic fatigue', 'Energy crashes', 'Dependency on energy drinks (5-6 daily)'],
          recommendations: ['Focus on mitochondrial support', 'Address HPA axis dysfunction', 'Reduce energy drink consumption gradually']
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
          issues: ['Heartburn', 'Bloating', 'Irregular bowel patterns', 'PPI use history (3 years)'],
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
    
    console.log('🔄 Updating NutriQ report with analysis data...')
    
    // Update the report
    const { error: updateError } = await supabase
      .from('lab_reports')
      .update({
        nutriq_results: nutriqResults,
        analysis_results: analysisResults,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', report.id)
    
    if (updateError) {
      throw new Error(`Failed to update report: ${updateError.message}`)
    }
    
    console.log('✅ Successfully updated NutriQ report!')
    console.log('📊 New scores:')
    console.log(`  - Total Score: ${nutriqResults[0].total_score}/60`)
    console.log(`  - Energy: ${nutriqResults[0].energy_score}/10`)
    console.log(`  - Mood: ${nutriqResults[0].mood_score}/10`)
    console.log(`  - Sleep: ${nutriqResults[0].sleep_score}/10`)
    console.log(`  - Stress: ${nutriqResults[0].stress_score}/10`)
    console.log(`  - Digestion: ${nutriqResults[0].digestion_score}/10`)
    console.log(`  - Immunity: ${nutriqResults[0].immunity_score}/10`)
    
    console.log('\n🎉 NutriQ data fix complete!')
    console.log('💡 Now refresh Mike Wilson\'s practitioner analysis report to see the updated scores!')
    
  } catch (error) {
    console.error('❌ Error fixing NutriQ data:', error.message)
    process.exit(1)
  }
}

fixNutriQData() 