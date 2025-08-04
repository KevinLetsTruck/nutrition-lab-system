require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAnalysisResults() {
  console.log('🔍 Checking Analysis Results in Database...\n');

  try {
    // Check quick_analyses table
    console.log('📊 Checking quick_analyses table:');
    const { data: quickAnalyses, error: quickError } = await supabase
      .from('quick_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (quickError) {
      console.log('❌ Error querying quick_analyses:', quickError);
    } else {
      console.log(`📄 Quick analyses found: ${quickAnalyses?.length || 0}`);
      if (quickAnalyses && quickAnalyses.length > 0) {
        quickAnalyses.forEach((analysis, index) => {
          console.log(`  ${index + 1}. ${analysis.file_name} (${analysis.report_type})`);
          console.log(`     Created: ${analysis.created_at}`);
          console.log(`     Has results: ${!!analysis.analysis_results}`);
          console.log(`     Client ID: ${analysis.client_id || 'None'}`);
        });
      } else {
        console.log('   No quick analyses found');
      }
    }

    // Check lab_reports table
    console.log('\n📊 Checking lab_reports table:');
    const { data: labReports, error: labError } = await supabase
      .from('lab_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (labError) {
      console.log('❌ Error querying lab_reports:', labError);
    } else {
      console.log(`📄 Lab reports found: ${labReports?.length || 0}`);
      if (labReports && labReports.length > 0) {
        labReports.forEach((report, index) => {
          console.log(`  ${index + 1}. ${report.report_type} (${report.file_path})`);
          console.log(`     Client ID: ${report.client_id}`);
          console.log(`     Status: ${report.status}`);
          console.log(`     Has analysis: ${!!report.analysis_results}`);
        });
      } else {
        console.log('   No lab reports found');
      }
    }

    // Check nutriq_results table
    console.log('\n📊 Checking nutriq_results table:');
    const { data: nutriqResults, error: nutriqError } = await supabase
      .from('nutriq_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (nutriqError) {
      console.log('❌ Error querying nutriq_results:', nutriqError);
    } else {
      console.log(`📄 NutriQ results found: ${nutriqResults?.length || 0}`);
      if (nutriqResults && nutriqResults.length > 0) {
        nutriqResults.forEach((result, index) => {
          console.log(`  ${index + 1}. Total score: ${result.total_score}`);
          console.log(`     Created: ${result.created_at}`);
          console.log(`     Has body systems: ${!!result.body_systems}`);
        });
      } else {
        console.log('   No NutriQ results found');
      }
    }

    // Check if there are any orphaned analysis results
    console.log('\n🔍 Checking for orphaned analysis results...');
    
    // Look for files in storage that don't have corresponding analysis results
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('lab-files')
      .list('2025/08/04', { limit: 20 });

    if (!storageError && storageFiles) {
      console.log(`📄 Files in storage: ${storageFiles.length}`);
      
      // Check which files have analysis results
      for (const file of storageFiles) {
        const fileName = file.name;
        console.log(`\n📄 Checking: ${fileName}`);
        
        // Check if this file has a quick analysis
        const { data: quickAnalysis } = await supabase
          .from('quick_analyses')
          .select('id')
          .eq('file_name', fileName)
          .single();
        
        console.log(`   Quick analysis: ${quickAnalysis ? '✓ Found' : '❌ Not found'}`);
        
        // Check if this file has a lab report
        const { data: labReport } = await supabase
          .from('lab_reports')
          .select('id')
          .eq('file_path', `2025/08/04/${fileName}`)
          .single();
        
        console.log(`   Lab report: ${labReport ? '✓ Found' : '❌ Not found'}`);
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAnalysisResults(); 