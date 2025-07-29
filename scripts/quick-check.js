#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickCheck() {
  try {
    console.log('🔍 Quick Analysis Check\n');
    
    // Get the latest 3 lab reports
    const { data: labReports, error: labError } = await supabase
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (labError) {
      console.error('❌ Error fetching lab reports:', labError.message);
      return;
    }
    
    if (labReports && labReports.length > 0) {
      console.log('📊 Recent Analysis Reports:');
      console.log('─'.repeat(80));
      
      labReports.forEach((report, index) => {
        console.log(`${index + 1}. ${report.report_type.toUpperCase()} - ${report.first_name} ${report.last_name}`);
        console.log(`   Status: ${report.status} | Created: ${new Date(report.created_at).toLocaleString()}`);
        console.log(`   Notes: ${report.notes}`);
        console.log('');
      });
      
      // Show details of the latest report
      const latest = labReports[0];
      console.log('🔬 Latest Analysis Details:');
      console.log('─'.repeat(80));
      
      if (latest.analysis_results) {
        const results = latest.analysis_results;
        console.log(`Report Type: ${results.reportType || latest.report_type}`);
        
        if (results.nutriqAnalysis) {
          console.log('\n🏥 NutriQ Analysis:');
          console.log(`Total Score: ${results.nutriqAnalysis.totalScore}`);
          console.log('Body Systems:');
          Object.entries(results.nutriqAnalysis.bodySystems).forEach(([system, data]) => {
            console.log(`  ${system}: ${data.score}/100`);
          });
        }
        
        if (results.kbmoAnalysis) {
          console.log('\n🥗 KBMO Analysis:');
          console.log(`Total IgG Score: ${results.kbmoAnalysis.totalIggScore}`);
          console.log(`High Sensitivity Foods: ${results.kbmoAnalysis.highSensitivityFoods.length}`);
          console.log(`Moderate Sensitivity Foods: ${results.kbmoAnalysis.moderateSensitivityFoods.length}`);
        }
        
        if (results.dutchAnalysis) {
          console.log('\n🧬 Dutch Analysis:');
          console.log(`Cortisol Pattern: ${results.dutchAnalysis.cortisolPattern.pattern}`);
          console.log(`Organic Acids: ${results.dutchAnalysis.organicAcids.length}`);
        }
      }
      
    } else {
      console.log('📭 No lab reports found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickCheck(); 