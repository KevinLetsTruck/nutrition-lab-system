require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAnalysisResponse() {
  console.log('🧪 Testing Analysis Response...\n');

  try {
    // Get a client
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, first_name, last_name')
      .limit(1);
    
    if (error || !clients || clients.length === 0) {
      console.error('❌ No clients found');
      return;
    }

    const testClient = clients[0];
    console.log(`📋 Testing with client: ${testClient.first_name} ${testClient.last_name}`);

    // Call the analysis API
    const response = await fetch(`http://localhost:3000/api/clients/${testClient.id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testMode: true })
    });

    if (!response.ok) {
      console.error('❌ Analysis API failed:', response.status, response.statusText);
      return;
    }

    const result = await response.json();
    console.log('✅ Analysis completed successfully');
    
    // Check the structure
    console.log('\n📊 Analysis Structure:');
    console.log('- Success:', result.success);
    console.log('- Has analysis:', !!result.analysis);
    console.log('- Has artifacts:', !!result.artifacts);
    console.log('- Has supplement recommendations:', !!result.supplementRecommendations);
    
    if (result.analysis) {
      console.log('\n🔍 Analysis Details:');
      console.log('- Executive Summary:', !!result.analysis.executiveSummary);
      console.log('- Root Causes:', result.analysis.rootCauseAnalysis?.length || 0);
      console.log('- Systems Priority:', Object.keys(result.analysis.systemsPriority || {}).length);
      console.log('- Treatment Phases:', !!result.analysis.treatmentPhases);
      console.log('- Lifestyle Integration:', !!result.analysis.lifestyleIntegration);
      console.log('- Monitoring Plan:', !!result.analysis.monitoringPlan);
      
      if (result.analysis.executiveSummary) {
        console.log('\n📋 Executive Summary:');
        console.log('- Primary Focus:', result.analysis.executiveSummary.primaryFocus);
        console.log('- Critical Root Causes:', result.analysis.executiveSummary.criticalRootCauses?.length || 0);
      }
      
      if (result.analysis.rootCauseAnalysis && result.analysis.rootCauseAnalysis.length > 0) {
        console.log('\n🎯 Root Causes:');
        result.analysis.rootCauseAnalysis.forEach((cause, index) => {
          console.log(`${index + 1}. ${cause.name} (${cause.confidence}% confidence)`);
        });
      }
    }
    
    if (result.artifacts) {
      console.log('\n📄 Generated Artifacts:');
      console.log('- Practitioner Report:', !!result.artifacts.practitionerReport);
      console.log('- Client Summary:', !!result.artifacts.clientSummary);
      console.log('- Protocol Document:', !!result.artifacts.protocolDocument);
      console.log('- Progress Report:', !!result.artifacts.progressReport);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAnalysisResponse(); 