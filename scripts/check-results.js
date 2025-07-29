#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkResults() {
  try {
    console.log('🔍 Checking analysis results...\n');
    
    // Get the latest lab report
    const { data: labReports, error: labError } = await supabase
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (labError) {
      console.error('Error fetching lab reports:', labError);
      return;
    }
    
    if (labReports && labReports.length > 0) {
      const latestReport = labReports[0];
      console.log('📊 Latest Analysis Report:');
      console.log(`   ID: ${latestReport.id}`);
      console.log(`   Type: ${latestReport.report_type}`);
      console.log(`   Status: ${latestReport.status}`);
      console.log(`   Confidence: ${latestReport.notes}`);
      console.log(`   Created: ${latestReport.created_at}`);
      console.log('');
      
      // Check for specific results based on report type
      if (latestReport.report_type === 'nutriq') {
        const { data: nutriqResults, error: nutriqError } = await supabase
          .from('nutriq_results')
          .select('*')
          .eq('lab_report_id', latestReport.id);
        
        if (nutriqError) {
          console.error('Error fetching NutriQ results:', nutriqError);
        } else if (nutriqResults && nutriqResults.length > 0) {
          console.log('🏥 NutriQ Analysis Results:');
          const result = nutriqResults[0];
          console.log(`   Total Score: ${result.total_score}`);
          console.log(`   Energy Score: ${result.energy_score}`);
          console.log(`   Mood Score: ${result.mood_score}`);
          console.log(`   Sleep Score: ${result.sleep_score}`);
          console.log(`   Stress Score: ${result.stress_score}`);
          console.log(`   Digestion Score: ${result.digestion_score}`);
          console.log(`   Immunity Score: ${result.immunity_score}`);
          console.log('');
          console.log('📝 Recommendations:');
          console.log(result.recommendations);
        } else {
          console.log('⚠️  No NutriQ results found in database');
        }
      }
      
      // Show the full analysis results
      if (latestReport.analysis_results) {
        console.log('🔬 Full Analysis Results:');
        console.log(JSON.stringify(latestReport.analysis_results, null, 2));
      }
    } else {
      console.log('No lab reports found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkResults(); 