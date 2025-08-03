import { NextRequest, NextResponse } from 'next/server'
import { ClientDataAggregator } from '@/lib/analysis/client-data-aggregator'
import { ComprehensiveAnalyzer } from '@/lib/analysis/comprehensive-analyzer'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
  return `
# COMPREHENSIVE FUNCTIONAL MEDICINE ANALYSIS
**Client:** ${clientData.personalInfo.name}
**Date:** ${new Date().toLocaleDateString()}
**Practitioner:** Kevin Rutherford, FNTP

## EXECUTIVE SUMMARY
This comprehensive analysis integrates all available client data including assessments, lab results, session notes, and protocol history to provide a complete functional medicine perspective.

## ROOT CAUSE ANALYSIS
${analysis.rootCauseAnalysis.map((cause: any) => `
### ${cause.name} (${cause.confidence}% confidence)
${cause.explanation}
**Systems Affected:** ${cause.affectedSystems.join(', ')}
${cause.driverFactors ? `**Driver-Specific Factors:** ${cause.driverFactors.join(', ')}` : ''}
`).join('\n')}

## SYSTEMS PRIORITY ASSESSMENT
${Object.entries(analysis.systemsPriority).map(([system, score]) => 
  `- **${system}:** ${score}/10`
).join('\n')}

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
  return `
# YOUR PERSONALIZED HEALTH PROTOCOL
**Name:** ${clientData.personalInfo.name}
**Date:** ${new Date().toLocaleDateString()}

## WHAT WE FOUND
Based on your comprehensive health assessment, we've identified the key areas to focus on for optimal health:

${analysis.rootCauseAnalysis.slice(0, 2).map((cause: any) => `
**${cause.name}**
${cause.explanation}
`).join('\n')}

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
*Your health journey is unique. This protocol is personalized specifically for you.*
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