require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAnalysisData() {
  console.log('🔍 Debugging Analysis Data...\n');

  try {
    // Get a client to test with
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (clientsError || !clients || clients.length === 0) {
      console.log('❌ No clients found');
      return;
    }

    const clientId = clients[0].id;
    console.log(`📋 Testing with client: ${clients[0].first_name} ${clients[0].last_name} (${clientId})\n`);

    // Check what assessments exist
    console.log('🔍 Checking Assessment Data:');
    
    // Check NutriQ assessments
    const { data: nutriqResults, error: nutriqError } = await supabase
      .from('nutriq_results')
      .select(`
        *,
        lab_reports!inner(
          client_id,
          report_date,
          analysis_results
        )
      `)
      .eq('lab_reports.client_id', clientId);

    console.log(`📊 NutriQ Assessments: ${nutriqResults?.length || 0}`);
    if (nutriqResults && nutriqResults.length > 0) {
      console.log('   Sample NutriQ data:', JSON.stringify(nutriqResults[0], null, 2));
    }

    // Check structured assessments
    const { data: structuredAssessments, error: structuredError } = await supabase
      .from('ai_conversations')
      .select(`
        *,
        conversation_messages!inner(
          id,
          content,
          structured_response,
          question_id,
          section
        )
      `)
      .eq('client_id', clientId)
      .eq('assessment_type', 'structured');

    console.log(`📋 Structured Assessments: ${structuredAssessments?.length || 0}`);
    if (structuredAssessments && structuredAssessments.length > 0) {
      console.log('   Sample structured assessment:', {
        id: structuredAssessments[0].id,
        status: structuredAssessments[0].status,
        questionsAnswered: structuredAssessments[0].questions_answered,
        messagesCount: structuredAssessments[0].conversation_messages?.length || 0
      });
      
      if (structuredAssessments[0].conversation_messages) {
        console.log('   Sample responses:');
        structuredAssessments[0].conversation_messages.slice(0, 3).forEach(msg => {
          console.log(`     - ${msg.question_id}: ${msg.structured_response?.value || msg.content}`);
        });
      }
    }

    // Check quick analyses
    const { data: quickAnalyses, error: quickError } = await supabase
      .from('quick_analyses')
      .select('*')
      .eq('client_id', clientId);

    console.log(`⚡ Quick Analyses: ${quickAnalyses?.length || 0}`);
    if (quickAnalyses && quickAnalyses.length > 0) {
      console.log('   Sample quick analysis:', {
        id: quickAnalyses[0].id,
        reportType: quickAnalyses[0].report_type,
        hasResults: !!quickAnalyses[0].analysis_results
      });
    }

    // Check session notes
    const { data: sessionNotes, error: notesError } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(5);

    console.log(`📝 Session Notes: ${sessionNotes?.length || 0}`);
    if (sessionNotes && sessionNotes.length > 0) {
      console.log('   Recent notes:');
      sessionNotes.forEach(note => {
        console.log(`     - ${note.type}: ${note.content.substring(0, 100)}...`);
      });
    }

    // Check uploaded documents
    const { data: documents, error: docsError } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId);

    console.log(`📄 Uploaded Documents: ${documents?.length || 0}`);
    if (documents && documents.length > 0) {
      console.log('   Documents:');
      documents.forEach(doc => {
        console.log(`     - ${doc.document_name} (${doc.document_type})`);
      });
    }

    // Now test the actual analysis API
    console.log('\n🧪 Testing Analysis API...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/clients/${clientId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`❌ Analysis API failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Analysis API succeeded');
    
    if (result.analysis) {
      console.log('\n📊 Analysis Results:');
      console.log('- Executive Summary:', result.analysis.executiveSummary?.primaryFocus || 'None');
      console.log('- Root Causes:', result.analysis.rootCauseAnalysis?.length || 0);
      
      if (result.analysis.rootCauseAnalysis && result.analysis.rootCauseAnalysis.length > 0) {
        console.log('   Root Causes:');
        result.analysis.rootCauseAnalysis.forEach((cause, index) => {
          console.log(`     ${index + 1}. ${cause.name} (${cause.confidence}% confidence)`);
          console.log(`        Explanation: ${cause.explanation.substring(0, 100)}...`);
        });
      }
    }

    console.log('\n🎯 Analysis completed successfully!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAnalysisData(); 