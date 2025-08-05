import { NextRequest, NextResponse } from 'next/server'
import { ClientDataAggregator } from '@/lib/analysis/client-data-aggregator'
import { ComprehensiveAnalyzer } from '@/lib/analysis/comprehensive-analyzer'
import { supabase } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const resolvedParams = await params;
    const clientId = resolvedParams.id;
    
    // Validate client ID
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Aggregate all client data
    const aggregator = new ClientDataAggregator();
    const clientData = await aggregator.aggregateAllClientData(clientId);
    
    // Perform comprehensive analysis
    const analyzer = new ComprehensiveAnalyzer();
    const analysis = await analyzer.analyzeClient(clientData);
    
    // Save analysis to database
    await saveAnalysis(analysis);
    
    // Generate artifacts
    const artifacts = await generateAllArtifacts(analysis, clientData);
    
    return NextResponse.json({
      success: true,
      analysis,
      artifacts,
      supplementRecommendations: analysis.supplementProtocol,
      progressComparison: analysis.progressComparison,
      message: 'Comprehensive analysis completed successfully'
    });
    
  } catch (error) {
    console.error('Comprehensive analysis failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

async function saveAnalysis(analysis: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('comprehensive_analyses')
      .insert({
        id: analysis.id,
        client_id: analysis.clientId,
        analysis_date: analysis.analysisDate,
        root_causes: analysis.rootCauseAnalysis,
        systems_priority: analysis.systemsPriority,
        progress_comparison: analysis.progressComparison,
        executive_summary: analysis.executiveSummary,
        supplement_protocol: analysis.supplementProtocol,
        treatment_phases: analysis.treatmentPhases,
        lifestyle_integration: analysis.lifestyleIntegration,
        monitoring_plan: analysis.monitoringPlan,
        urgent_concerns: analysis.urgentConcerns,
        expected_timeline: analysis.expectedTimeline,
        practitioner_notes: analysis.practitionerNotes
      });

    if (error) {
      console.warn(`Warning: Could not save analysis to database: ${error.message}`);
      // Don't throw error, just log warning - analysis can still be returned
    } else {
      console.log('✅ Analysis saved to database successfully');
    }
  } catch (error) {
    console.warn(`Warning: Comprehensive analyses table may not exist: ${error}`);
    // Don't throw error, just log warning - analysis can still be returned
  }
}

async function generateAllArtifacts(analysis: any, clientData: any): Promise<any> {
  const artifacts = {
    practitionerReport: generatePractitionerReport(analysis, clientData),
    clientSummary: generateClientSummary(analysis, clientData),
    protocolDocument: generateProtocolDocument(analysis, clientData),
    progressReport: analysis.progressComparison ? generateProgressReport(analysis) : null
  };
  
  return artifacts;
}

function generatePractitionerReport(analysis: any, clientData: any): string {
  // Calculate data completeness
  const dataCompleteness = {
    assessments: clientData.assessmentHistory?.length > 0,
    sessionNotes: clientData.sessionNotes?.length > 0,
    labResults: clientData.labResults?.length > 0,
    uploadedDocs: clientData.uploadedDocuments?.length > 0
  };
  const completenessScore = Object.values(dataCompleteness).filter(v => v).length;

  return `
# COMPREHENSIVE FUNCTIONAL MEDICINE ANALYSIS
**Client:** ${clientData.personalInfo.name}
**Date:** ${new Date().toLocaleDateString()}
**Practitioner:** Kevin Rutherford, FNTP

## EXECUTIVE SUMMARY
This comprehensive analysis integrates all available client data to provide a complete functional medicine perspective.

### Data Completeness Score: ${completenessScore}/4
- ✓ Health Assessments: ${dataCompleteness.assessments ? `${clientData.assessmentHistory.length} available` : 'None'}
- ✓ Session Notes: ${dataCompleteness.sessionNotes ? `${clientData.sessionNotes.length} available` : 'None'}
- ✓ Lab Results: ${dataCompleteness.labResults ? `${clientData.labResults.length} available` : 'None'}
- ✓ Uploaded Documents: ${dataCompleteness.uploadedDocs ? `${clientData.uploadedDocuments.length} available` : 'None'}

## DATA ANALYSIS HIERARCHY

### TIER 1: Laboratory & Assessment Data (Primary Evidence)
*Objective measurements that drive clinical decisions:*

#### Laboratory Results
${clientData.labResults?.length > 0 ? clientData.labResults.map((lab: any) => {
  const dateStr = lab.reportDate || lab.testDate;
  const validDate = dateStr && !isNaN(new Date(dateStr).getTime());
  const results = lab.results || {};
  
  // Special handling for NutriQ reports
  if (lab.reportType.toLowerCase() === 'nutriq') {
    let nutriqAnalysis = `**NUTRIQ ASSESSMENT - ${validDate ? new Date(dateStr).toLocaleDateString() : 'Assessment Date Not Recorded'}**\n\n`;
    
    // Get NutriQ-specific data from assessments
    const nutriqAssessment = clientData.assessmentHistory?.find((a: any) => 
      a.type === 'nutriq' && a.id === lab.id
    );
    
    if (nutriqAssessment || results.bodySystems || results.totalScore) {
      // Total Symptom Score
      const totalScore = nutriqAssessment?.totalScore || results.totalScore;
      if (totalScore) {
        nutriqAnalysis += `📊 **TOTAL SYMPTOM BURDEN SCORE: ${totalScore}**\n`;
        nutriqAnalysis += `${totalScore > 100 ? '⚠️ SEVERE' : totalScore > 75 ? '⚠️ HIGH' : totalScore > 50 ? '⚡ MODERATE' : '✓ LOW'} symptom burden\n\n`;
      }
      
      // Body Systems Analysis from NAQ
      nutriqAnalysis += `**NAQ BODY SYSTEM ANALYSIS:**\n`;
      const bodySystems = nutriqAssessment?.bodySystems || results.bodySystems;
      if (bodySystems) {
        Object.entries(bodySystems)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .forEach(([system, score]) => {
            const scoreNum = typeof score === 'number' ? score : 0;
            nutriqAnalysis += `• ${system}: ${score}/30 `;
            nutriqAnalysis += `${scoreNum > 20 ? '⚠️ SEVERE DYSFUNCTION' : scoreNum > 15 ? '⚠️ HIGH' : scoreNum > 10 ? '⚡ MODERATE' : '✓ MILD'}\n`;
          });
      } else {
        nutriqAnalysis += `• Body system scores not available - check PDF analysis\n`;
      }
      nutriqAnalysis += `\n`;
      
      // Priority Actions
      const priorityActions = nutriqAssessment?.priorityActions || results.priorityActions;
      if (priorityActions && priorityActions.length > 0) {
        nutriqAnalysis += `**PRIORITY INTERVENTIONS:**\n`;
        priorityActions.forEach((action: string) => {
          nutriqAnalysis += `🎯 ${action}\n`;
        });
        nutriqAnalysis += `\n`;
      }
      
      // Clinical Recommendations
      const recommendations = nutriqAssessment?.recommendations || results.overallRecommendations;
      if (recommendations && recommendations.length > 0) {
        nutriqAnalysis += `**CLINICAL RECOMMENDATIONS:**\n`;
        recommendations.slice(0, 4).forEach((rec: string) => {
          nutriqAnalysis += `• ${rec}\n`;
        });
        nutriqAnalysis += `\n`;
      }
      
      // Additional NutriQ insights
      if (results.nutriqAnalysis) {
        nutriqAnalysis += `**ADDITIONAL CLINICAL INSIGHTS:**\n`;
        nutriqAnalysis += `${JSON.stringify(results.nutriqAnalysis, null, 2).substring(0, 500)}...\n`;
      }
    } else {
      nutriqAnalysis += `⚠️ NutriQ data extraction in progress. If this persists, please re-upload the PDF.\n`;
    }
    
    return nutriqAnalysis;
  }
  
  // Standard handling for other lab types
  let detailedAnalysis = `**${lab.reportType.toUpperCase()} - ${validDate ? new Date(dateStr).toLocaleDateString() : 'Date not recorded'}**\n`;
  
  if (results.bodySystems) {
    detailedAnalysis += `Body System Analysis:\n`;
    Object.entries(results.bodySystems)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .forEach(([system, score]) => {
        const scoreNum = typeof score === 'number' ? score : 0;
        detailedAnalysis += `  • ${system}: ${score} ${scoreNum > 20 ? '⚠️ HIGH' : scoreNum > 10 ? '⚡ MODERATE' : '✓ LOW'}\n`;
      });
  }
  
  if (results.totalScore) {
    detailedAnalysis += `Total Score: ${results.totalScore}\n`;
  }
  
  if (results.priorityActions && results.priorityActions.length > 0) {
    detailedAnalysis += `Priority Actions:\n`;
    results.priorityActions.forEach((action: string) => {
      detailedAnalysis += `  • ${action}\n`;
    });
  }
  
  if (results.overallRecommendations && results.overallRecommendations.length > 0) {
    detailedAnalysis += `Recommendations:\n`;
    results.overallRecommendations.slice(0, 3).forEach((rec: string) => {
      detailedAnalysis += `  • ${rec}\n`;
    });
  }
  
  return detailedAnalysis;
}).join('\n\n') : 'No laboratory results available'}

#### Clinical Assessments
${clientData.assessmentHistory?.map((assessment: any) => {
  // Skip if this is a nutriq assessment that was already shown in lab results
  if (assessment.type === 'nutriq' && clientData.labResults?.some((lab: any) => lab.id === assessment.id)) {
    return '';
  }
  
  return `
**${assessment.type.toUpperCase()} Assessment - ${new Date(assessment.date).toLocaleDateString()}**
- Total Score: ${assessment.totalScore || 'N/A'}
- Body Systems: ${assessment.bodySystems ? Object.entries(assessment.bodySystems).slice(0, 5).map(([s, v]) => `${s} (${v})`).join(', ') : 'N/A'}
- Priority Focus: ${assessment.priorityActions ? assessment.priorityActions[0] : 'General optimization'}
`;
}).filter(Boolean).join('\n') || 'No additional assessments completed'}

### TIER 2: Clinical Observations (Supporting Evidence)
*Practitioner notes that contextualize and verify lab findings:*

${clientData.sessionNotes?.filter((n: any) => n.type === 'interview' || n.type === 'coaching_call').map((note: any) => `
**${note.type === 'interview' ? 'Initial Interview' : 'Coaching Call'} - ${new Date(note.createdAt).toLocaleDateString()}**
Relevant Observations: ${note.content.substring(0, 300)}...
`).join('\n') || 'No clinical notes recorded'}

### UPLOADED DOCUMENTS
*Additional documents analyzed for this report:*

${clientData.uploadedDocuments?.length > 0 ? clientData.uploadedDocuments.map((doc: any) => `
**${doc.name}**
- Type: ${doc.type}
- Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}
- Status: ${doc.extractedText ? 'Content extracted and analyzed' : 'Document uploaded, pending extraction'}
`).join('\n') : 'No additional documents uploaded'}

## ROOT CAUSE ANALYSIS
${analysis.rootCauseAnalysis.map((cause: any) => `
### ${cause.name} (${cause.confidence}% confidence)
${cause.explanation}
**Systems Affected:** ${cause.affectedSystems.join(', ')}
${cause.driverFactors ? `**Driver-Specific Factors:** ${cause.driverFactors.join(', ')}` : ''}
**Data Sources Supporting This:** ${
  (cause.confidence > 80 ? 'Multiple assessments + lab data' : 
   cause.confidence > 60 ? 'Assessment data + clinical notes' : 
   'Limited data - recommend additional testing')
}
`).join('\n')}

## SYSTEMS PRIORITY ASSESSMENT

### AI-Generated Priority Scores (0-10 scale)
*These scores are generated by AI analysis of all available data:*

${Object.entries(analysis.systemsPriority).map(([system, score]) => {
  const rationale = analysis.systemsPriorityRationale?.[system];
  return `- **${system}:** ${score}/10${rationale ? `\n  *Rationale: ${rationale}*` : ''}`;
}).join('\n')}

### How These Scores Were Determined:
${
clientData.assessmentHistory?.some((a: any) => a.bodySystems) ? `

**NAQ/NutriQ Body System Scores (from assessments):**
${clientData.assessmentHistory.filter((a: any) => a.bodySystems).map((assessment: any) => `
*${assessment.type.toUpperCase()} - ${new Date(assessment.date).toLocaleDateString()}:*
${Object.entries(assessment.bodySystems || {}).slice(0, 8).map(([system, score]) => 
  `- ${system}: ${score}`
).join('\n')}
`).join('\n')}

**AI Analysis Process:**
The AI converts NAQ body system scores and integrates them with:
- Clinical notes and observations
- Lab result patterns
- Symptom clustering analysis
- Functional medicine system interconnections
- Severity and urgency indicators

The 0-10 scale represents overall dysfunction severity where:
- 8-10: Critical dysfunction requiring immediate attention
- 5-7: Moderate dysfunction affecting quality of life  
- 2-4: Mild dysfunction or early-stage imbalance
- 0-1: Minimal or no dysfunction detected
` : `

**Note:** These scores are based on AI interpretation of:
- Session notes and clinical observations
- Symptom patterns reported
- Available lab data
- Functional medicine system analysis

No NAQ assessment data was available for direct body system scoring.
`
}

## SUPPLEMENT PROTOCOL
### Phase 1 (Weeks 1-4)
${analysis.supplementProtocol.phase1.map((supp: any) => `
**${supp.name}**
- Dosage: ${supp.dosage}
- Timing: ${supp.timing}
- Source: ${supp.source}
- Cost: $${supp.price || 'TBD'}/month
- Instructions: ${supp.instructions}
- Rationale: ${supp.rationale}
`).join('\n')}

### Phase 2 (Weeks 5-12)
${analysis.supplementProtocol.phase2.map((supp: any) => `
**${supp.name}**
- Dosage: ${supp.dosage}
- Timing: ${supp.timing}
- Source: ${supp.source}
- Cost: $${supp.price || 'TBD'}/month
- Instructions: ${supp.instructions}
- Rationale: ${supp.rationale}
`).join('\n')}

### Phase 3 (Weeks 13-24)
${analysis.supplementProtocol.phase3.map((supp: any) => `
**${supp.name}**
- Dosage: ${supp.dosage}
- Timing: ${supp.timing}
- Source: ${supp.source}
- Cost: $${supp.price || 'TBD'}/month
- Instructions: ${supp.instructions}
- Rationale: ${supp.rationale}
`).join('\n')}

**Total Monthly Cost:** $${analysis.supplementProtocol.totalMonthlyCost}

## TREATMENT PHASES
### Phase 1: ${analysis.treatmentPhases.phase1.goal}
**Duration:** ${analysis.treatmentPhases.phase1.duration}
**Focus Areas:** ${analysis.treatmentPhases.phase1.focusAreas.join(', ')}

**Dietary Changes:**
${analysis.treatmentPhases.phase1.dietaryChanges.map((item: string) => `- ${item}`).join('\n')}

**Lifestyle Modifications:**
${analysis.treatmentPhases.phase1.lifestyleModifications.map((item: string) => `- ${item}`).join('\n')}

### Phase 2: ${analysis.treatmentPhases.phase2.goal}
**Duration:** ${analysis.treatmentPhases.phase2.duration}
**Focus Areas:** ${analysis.treatmentPhases.phase2.focusAreas.join(', ')}

### Phase 3: ${analysis.treatmentPhases.phase3.goal}
**Duration:** ${analysis.treatmentPhases.phase3.duration}
**Focus Areas:** ${analysis.treatmentPhases.phase3.focusAreas.join(', ')}

## LIFESTYLE INTEGRATION
### Sleep Optimization
${analysis.lifestyleIntegration.sleepOptimization.map((item: string) => `- ${item}`).join('\n')}

### Stress Management
${analysis.lifestyleIntegration.stressManagement.map((item: string) => `- ${item}`).join('\n')}

### Movement & Exercise
${analysis.lifestyleIntegration.movement.map((item: string) => `- ${item}`).join('\n')}

## MONITORING PLAN
### Weekly Checkpoints
${analysis.monitoringPlan.weeklyCheckpoints.map((metric: any) => `
- **${metric.metric}:** ${metric.measurement} - Target: ${metric.target}
`).join('\n')}

### Red Flags
${analysis.monitoringPlan.redFlags.map((flag: any) => `
- **${flag.category}:** ${flag.symptoms.join(', ')} - ${flag.action}
`).join('\n')}

## URGENT CONCERNS
${analysis.urgentConcerns.map((concern: string) => `- ${concern}`).join('\n')}

## EXPECTED TIMELINE
### Week 2-4 Improvements
${analysis.expectedTimeline.week2to4.map((item: string) => `- ${item}`).join('\n')}

### Month 2-3 Improvements
${analysis.expectedTimeline.month2to3.map((item: string) => `- ${item}`).join('\n')}

## PRACTITIONER NOTES
**Protocol Rationale:** ${analysis.practitionerNotes.protocolRationale}

**Key Success Factors:**
${analysis.practitionerNotes.keySuccessFactors.map((factor: string) => `- ${factor}`).join('\n')}

**Potential Challenges:**
${analysis.practitionerNotes.potentialChallenges.map((challenge: string) => `- ${challenge}`).join('\n')}

---
*This analysis is based on comprehensive data integration and AI-powered functional medicine assessment.*
  `;
}

function generateClientSummary(analysis: any, clientData: any): string {
  // Generate data source summary
  const dataSources = [];
  if (clientData.assessmentHistory?.length > 0) {
    dataSources.push(`• ${clientData.assessmentHistory.length} health assessment(s)`);
  }
  if (clientData.sessionNotes?.filter((n: any) => n.type === 'interview').length > 0) {
    dataSources.push(`• ${clientData.sessionNotes.filter((n: any) => n.type === 'interview').length} interview note(s)`);
  }
  if (clientData.sessionNotes?.filter((n: any) => n.type === 'coaching_call').length > 0) {
    dataSources.push(`• ${clientData.sessionNotes.filter((n: any) => n.type === 'coaching_call').length} coaching call note(s)`);
  }
  if (clientData.uploadedDocuments?.length > 0) {
    dataSources.push(`• ${clientData.uploadedDocuments.length} uploaded document(s)`);
  }
  if (clientData.labResults?.length > 0) {
    dataSources.push(`• ${clientData.labResults.length} lab result(s)`);
  }

  return `
# YOUR PERSONALIZED HEALTH PROTOCOL
**Name:** ${clientData.personalInfo.name}
**Date:** ${new Date().toLocaleDateString()}

## DATA SOURCES ANALYZED
This report is based on analysis of:
${dataSources.join('\n')}

## DATA ANALYSIS HIERARCHY

### 1. PRIMARY DATA - Lab Results & Assessments
*These objective measurements form the foundation of your analysis:*

#### Lab Test Results
${clientData.labResults?.length > 0 ? clientData.labResults.slice(0, 3).map((lab: any) => {
  const dateStr = lab.reportDate || lab.testDate;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : 'Date not available';
  const validDate = !isNaN(new Date(dateStr).getTime());
  
  // Special simplified display for NutriQ in client summary
  if (lab.reportType.toLowerCase() === 'nutriq') {
    const nutriqAssessment = clientData.assessmentHistory?.find((a: any) => 
      a.type === 'nutriq' && a.id === lab.id
    );
    const results = lab.results || {};
    const totalScore = nutriqAssessment?.totalScore || results.totalScore;
    const bodySystems = nutriqAssessment?.bodySystems || results.bodySystems;
    
    let summary = `**NUTRIQ Assessment (${validDate ? formattedDate : 'Date not recorded'})**\n`;
    
    if (totalScore) {
      summary += `• Total Symptom Burden: ${totalScore} ${totalScore > 100 ? '⚠️' : totalScore > 75 ? '⚠️' : totalScore > 50 ? '⚡' : '✓'}\n`;
    }
    
    if (bodySystems) {
      const topSystems = Object.entries(bodySystems)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([system, score]) => `${system}: ${score}/30`);
      summary += `• Top affected systems: ${topSystems.join(', ')}\n`;
    }
    
    const priorityActions = nutriqAssessment?.priorityActions || results.priorityActions;
    if (priorityActions && priorityActions.length > 0) {
      summary += `• Priority focus: ${priorityActions[0]}\n`;
    }
    
    return summary;
  }
  
  // Standard handling for other lab types
  const results = lab.results || {};
  const keyFindings = [];
  
  if (results.bodySystems) {
    const topSystems = Object.entries(results.bodySystems)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([system, score]) => `${system}: ${score}`);
    if (topSystems.length > 0) keyFindings.push(`Top body systems: ${topSystems.join(', ')}`);
  }
  
  if (results.totalScore) {
    keyFindings.push(`Total score: ${results.totalScore}`);
  }
  
  if (results.keyMarkers) {
    keyFindings.push(`Key markers: ${results.keyMarkers.slice(0, 3).join(', ')}`);
  }
  
  if (results.priorityActions && results.priorityActions.length > 0) {
    keyFindings.push(`Priority: ${results.priorityActions[0]}`);
  }
  
  return `
**${lab.reportType.toUpperCase()} (${validDate ? formattedDate : 'Date not recorded'})**
${keyFindings.length > 0 ? keyFindings.map(f => `• ${f}`).join('\n') : '• Full analysis available in detailed report'}
${results.overallRecommendations ? `• Key recommendation: ${results.overallRecommendations[0]}` : ''}`;
}).join('\n') : 'No lab results available'}

#### Health Assessments
${clientData.assessmentHistory?.length > 0 ? 
  clientData.assessmentHistory.filter((a: any) => {
    // Don't duplicate NutriQ assessments that are already shown in lab results
    return !(a.type === 'nutriq' && clientData.labResults?.some((lab: any) => 
      lab.reportType.toLowerCase() === 'nutriq' && lab.id === a.id
    ));
  }).slice(0, 2).map((assessment: any) => `
**${assessment.type.toUpperCase()} Assessment (${new Date(assessment.date).toLocaleDateString()})**
${assessment.totalScore ? `• Symptom Burden Score: ${assessment.totalScore}` : ''}
${assessment.bodySystems ? `• Top Body Systems: ${Object.entries(assessment.bodySystems).slice(0, 3).map(([system, score]) => `${system} (${score})`).join(', ')}` : ''}
${assessment.priorityActions ? `• Priority Actions: ${assessment.priorityActions.slice(0, 2).join(', ')}` : ''}
`).join('\n') || 'No additional assessments' : 'No assessments available'}

### 2. SUPPORTING DATA - Clinical Notes
*These observations help verify and contextualize the lab findings:*

${clientData.sessionNotes?.filter((n: any) => n.type === 'interview' || n.type === 'coaching_call').slice(0, 2).map((note: any) => `
**${note.type === 'interview' ? 'Initial Interview' : 'Coaching Call'} (${new Date(note.createdAt).toLocaleDateString()})**
Context: ${note.content.substring(0, 200)}...
`).join('\n') || 'No consultation notes available'}

## INTEGRATED ANALYSIS RESULTS

### Primary Health Concerns
${analysis.rootCauseAnalysis.slice(0, 2).map((cause: any) => `
**${cause.name}**
${cause.explanation}
*Confidence: ${cause.confidence}% based on ${cause.affectedSystems.length} body systems affected*
`).join('\n')}

### Body System Priority Scores
*Our AI analyzed all your data to prioritize which body systems need the most support:*

${Object.entries(analysis.systemsPriority)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([system, score]) => {
    const scoreNum = score as number;
    return `• **${system.charAt(0).toUpperCase() + system.slice(1)}:** ${scoreNum}/10 ${
      scoreNum >= 8 ? '(High Priority)' : 
      scoreNum >= 5 ? '(Moderate Priority)' : 
      '(Low Priority)'
    }`;
  }).join('\n')}

## YOUR ACTION PLAN
We've created a 3-phase approach to help you achieve your health goals:

### Phase 1 (Next 4 weeks): Foundation
**Focus:** ${analysis.treatmentPhases.phase1.goal}

**Your Supplements:**
${analysis.supplementProtocol.phase1.map((supp: any) => `
• ${supp.name} - ${supp.dosage} ${supp.timing}
  ${supp.instructions}
`).join('\n')}

**Key Changes:**
${analysis.treatmentPhases.phase1.dietaryChanges.slice(0, 3).map((item: string) => `• ${item}`).join('\n')}

### Phase 2 (Weeks 5-8): Optimization
**Focus:** ${analysis.treatmentPhases.phase2.goal}

### Phase 3 (Weeks 9-12): Advanced
**Focus:** ${analysis.treatmentPhases.phase3.goal}

## WHAT TO EXPECT
### Week 2-4 Improvements
${analysis.expectedTimeline.week2to4.map((item: string) => `• ${item}`).join('\n')}

### Month 2-3 Improvements
${analysis.expectedTimeline.month2to3.map((item: string) => `• ${item}`).join('\n')}

## SUCCESS MARKERS
${analysis.monitoringPlan.weeklyCheckpoints.slice(0, 3).map((metric: any) => `
• ${metric.metric}: ${metric.target}
`).join('\n')}

## IMPORTANT NOTES
${analysis.urgentConcerns.length > 0 ? 
  `**Please contact us immediately if you experience:**\n${analysis.urgentConcerns.map((concern: string) => `• ${concern}`).join('\n')}` : 
  'Continue with your protocol as directed and contact us with any questions.'
}

---
*Your health journey is unique. This protocol is personalized specifically for you based on all available data sources.*
  `;
}

function generateProtocolDocument(analysis: any, clientData: any): string {
  return `
# COMPREHENSIVE HEALTH PROTOCOL
**Client:** ${clientData.personalInfo.name}
**Date:** ${new Date().toLocaleDateString()}
**Practitioner:** Kevin Rutherford, FNTP

## EXECUTIVE SUMMARY
${analysis.rootCauseAnalysis.map((cause: any) => `
### ${cause.name} (${cause.confidence}% confidence)
${cause.explanation}
**Systems Affected:** ${cause.affectedSystems.join(', ')}
${cause.driverFactors ? `**Driver-Specific Factors:** ${cause.driverFactors.join(', ')}` : ''}
`).join('\n')}

## PHASE 1 PROTOCOL (Weeks 1-4)
**Focus:** ${analysis.treatmentPhases.phase1.focus}

### Supplements
${analysis.supplementProtocol.phase1.map((supp: any) => `
**${supp.name}**
- Dosage: ${supp.dosage}
- Timing: ${supp.timing}
- Source: ${supp.source}
- Instructions: ${supp.instructions}
- Cost: $${supp.price || 'TBD'}/month
- Rationale: ${supp.rationale}
`).join('\n')}

### Dietary Changes
${analysis.treatmentPhases.phase1.dietaryChanges.map((item: string) => `- ${item}`).join('\n')}

### Lifestyle Modifications
${analysis.treatmentPhases.phase1.lifestyleModifications.map((item: string) => `- ${item}`).join('\n')}

## PHASE 2 PROTOCOL (Weeks 5-8)
**Focus:** ${analysis.treatmentPhases.phase2.goal}

### Supplements
${analysis.supplementProtocol.phase2.map((supp: any) => `
**${supp.name}**
- Dosage: ${supp.dosage}
- Timing: ${supp.timing}
- Source: ${supp.source}
- Instructions: ${supp.instructions}
- Cost: $${supp.price || 'TBD'}/month
- Rationale: ${supp.rationale}
`).join('\n')}

## PHASE 3 PROTOCOL (Weeks 9-12)
**Focus:** ${analysis.treatmentPhases.phase3.goal}

### Supplements
${analysis.supplementProtocol.phase3.map((supp: any) => `
**${supp.name}**
- Dosage: ${supp.dosage}
- Timing: ${supp.timing}
- Source: ${supp.source}
- Instructions: ${supp.instructions}
- Cost: $${supp.price || 'TBD'}/month
- Rationale: ${supp.rationale}
`).join('\n')}

## MONITORING PLAN
### Weekly Checkpoints
${analysis.monitoringPlan.weeklyCheckpoints.map((metric: any) => `
- **${metric.metric}:** ${metric.measurement} - Target: ${metric.target}
`).join('\n')}

## RED FLAGS - SEEK IMMEDIATE CARE
${analysis.urgentConcerns.map((concern: string) => `- ${concern}`).join('\n')}

## FOLLOW-UP SCHEDULE
- Week 2: Progress check-in
- Week 6: Protocol adjustment consultation
- Week 12: Comprehensive reassessment
- Week 24: Optimization planning

---
*This protocol is personalized for optimal health outcomes and long-term wellness.*
  `;
}

function generateProgressReport(analysis: any): string {
  const progress = analysis.progressComparison;
  
  return `
# PROGRESS ANALYSIS REPORT
**Date:** ${new Date().toLocaleDateString()}

## IMPROVEMENT AREAS
${progress.improvementAreas.map((area: any) => `
**${area.system}**
- Improvement: ${area.improvement} points
- Likely Factors: ${area.likelyFactors?.join(', ') || 'Protocol compliance'}
`).join('\n')}

## AREAS OF CONCERN
${progress.worsenedAreas.map((area: any) => `
**${area.system}**
- Decline: ${area.decline} points
- Possible Causes: ${area.possibleCauses?.join(', ') || 'Need for protocol adjustment'}
`).join('\n')}

## STABLE AREAS
${progress.stableAreas.map((system: string) => `- ${system}`).join('\n')}

## PROTOCOL EFFECTIVENESS
${Object.entries(progress.protocolEffectiveness).map(([key, value]) => 
  `- **${key}:** ${value}%`
).join('\n')}

## NEXT RECOMMENDATIONS
${progress.nextRecommendations.map((rec: string) => `- ${rec}`).join('\n')}

---
*Progress analysis based on comparison with previous assessment.*
  `;
} 