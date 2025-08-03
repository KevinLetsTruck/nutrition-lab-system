import ClaudeClient from '../claude-client'
import { 
  ClientDataAggregate, 
  ComprehensiveAnalysis, 
  RootCause, 
  SupplementProtocol, 
  TreatmentPhases,
  ProgressComparison 
} from './client-data-aggregator'
import { SupplementRecommender } from './supplement-recommender'

export class ComprehensiveAnalyzer {
  
  async analyzeClient(clientData: ClientDataAggregate): Promise<ComprehensiveAnalysis> {
    
    // Prepare all data for Claude analysis
    const analysisPrompt = this.buildComprehensivePrompt(clientData);
    
    // Send to Claude for analysis
    const claudeResponse = await this.callClaude(analysisPrompt);
    
    // Parse and structure the response
    const analysis = await this.parseAnalysisResponse(claudeResponse);
    
    // Generate supplement recommendations
    const supplementRecommender = new SupplementRecommender();
    const supplements = await supplementRecommender.generateSupplementRecommendations(analysis);
    
    // Create protocol phases
    const protocols = await this.createProtocolPhases(analysis, supplements);
    
    // Generate progress comparison if previous analysis exists
    const progressComparison = clientData.lastAnalysis 
      ? await this.compareToLastAnalysis(analysis, clientData.lastAnalysis)
      : undefined;
    
    return {
      id: crypto.randomUUID(),
      clientId: clientData.clientId,
      analysisDate: new Date().toISOString(),
      rootCauseAnalysis: analysis.rootCauses,
      systemsPriority: analysis.systemsPriority,
      progressComparison: progressComparison,
      supplementProtocol: supplements,
      treatmentPhases: protocols,
      urgentConcerns: analysis.urgentConcerns,
      timeline: analysis.timeline,
      successMetrics: analysis.successMetrics,
      practitionerNotes: analysis.practitionerNotes
    };
  }

  private buildComprehensivePrompt(clientData: ClientDataAggregate): string {
    const { personalInfo, assessmentHistory, sessionNotes, uploadedDocuments, labResults, protocolHistory, progressMetrics, lastAnalysis } = clientData;
    
    return `
I need a comprehensive functional medicine analysis for this client.

CLIENT OVERVIEW:
Name: ${personalInfo.name}
Age: ${personalInfo.dateOfBirth ? this.calculateAge(personalInfo.dateOfBirth) : 'Unknown'}
Occupation: ${personalInfo.occupation}
Truck Driver: ${personalInfo.truckDriver ? 'Yes' : 'No'}
Primary Health Concern: ${personalInfo.primaryHealthConcern}
Client Since: ${new Date(personalInfo.createdAt).toLocaleDateString()}

CURRENT ASSESSMENT DATA:
${assessmentHistory.length > 0 ? assessmentHistory.map(assessment => `
${assessment.type.toUpperCase()} Assessment (${assessment.date}):
${assessment.totalScore ? `Total Score: ${assessment.totalScore}` : ''}
${assessment.bodySystems ? `Body Systems: ${JSON.stringify(assessment.bodySystems, null, 2)}` : ''}
${assessment.recommendations ? `Recommendations: ${assessment.recommendations.join(', ')}` : ''}
${assessment.priorityActions ? `Priority Actions: ${assessment.priorityActions.join(', ')}` : ''}
`).join('\n') : 'No assessments found'}

RECENT SESSION NOTES:
${sessionNotes.slice(0, 10).map(note => `
Date: ${new Date(note.createdAt).toLocaleDateString()}
Type: ${note.type}
Author: ${note.author || 'Unknown'}
Notes: ${note.content}
`).join('\n')}

UPLOADED DOCUMENTS:
${uploadedDocuments.map(doc => `
Document: ${doc.name}
Type: ${doc.type}
Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}
${doc.extractedText ? `Content: ${doc.extractedText.substring(0, 500)}...` : 'No text extracted'}
`).join('\n')}

LAB RESULTS:
${labResults.map(lab => `
${lab.reportType.toUpperCase()} (${lab.reportDate}):
Status: ${lab.status}
Results: ${JSON.stringify(lab.results, null, 2)}
${lab.notes ? `Notes: ${lab.notes}` : ''}
`).join('\n')}

PROTOCOL HISTORY:
${protocolHistory.map(protocol => `
Phase: ${protocol.phase}
Started: ${protocol.startDate}
Status: ${protocol.status}
Compliance: ${protocol.compliance || 0}%
Content: ${protocol.content.substring(0, 200)}...
`).join('\n')}

PROGRESS METRICS:
${progressMetrics.map(metric => `
Date: ${metric.date}
Type: ${metric.type}
Value: ${metric.value}
${metric.notes ? `Notes: ${metric.notes}` : ''}
`).join('\n')}

${lastAnalysis ? `
PREVIOUS ANALYSIS COMPARISON:
Last Analysis Date: ${lastAnalysis.analysisDate}
Previous Root Causes: ${JSON.stringify(lastAnalysis.rootCauseAnalysis)}
Previous Priorities: ${JSON.stringify(lastAnalysis.systemsPriority)}
` : ''}

Please provide a comprehensive analysis following your established functional medicine protocols:

1. ROOT CAUSE ANALYSIS
- Identify top 3 primary dysfunctions with confidence levels
- Explain interconnections between symptoms and systems
- Consider truck driver lifestyle factors if applicable
- Rate confidence level for each root cause (0-100%)

2. SYSTEMS PRIORITY ASSESSMENT
- Rank body systems by dysfunction severity (0-10 scale)
- Identify which systems to address first
- Explain why this prioritization makes sense

3. PROGRESS COMPARISON (if previous data available)
- What has improved since last analysis
- What has worsened or remained static
- Effectiveness of previous interventions
- Compliance factors affecting outcomes

4. INTERVENTION STRATEGY
- Phase 1 (Weeks 1-4): Immediate priorities and foundational work
- Phase 2 (Weeks 5-12): Restoration and optimization phase  
- Phase 3 (Weeks 13-24): Advanced protocols and maintenance
- Include specific goals for each phase

5. SUPPLEMENT PROTOCOL
- List specific supplements with exact dosing
- Explain rationale for each recommendation
- Note timing and food requirements
- Include truck-compatible instructions if applicable
- Follow hierarchy: LetsTrack → Biotics → Fullscript

6. SUCCESS METRICS
- Define measurable outcomes for each phase
- Specify timeline expectations
- Include red flags requiring medical referral

7. TRUCK DRIVER CONSIDERATIONS (if applicable)
- DOT medical implications
- Road-compatible modifications
- Career sustainability factors
- Sleep schedule adaptations

Format as structured JSON for parsing with the following structure:
{
  "rootCauses": [
    {
      "name": "Root cause name",
      "confidence": 85,
      "explanation": "Detailed explanation",
      "affectedSystems": ["system1", "system2"],
      "driverFactors": ["factor1", "factor2"]
    }
  ],
  "systemsPriority": {
    "digestive": 8,
    "immune": 7,
    "endocrine": 6,
    "nervous": 5,
    "cardiovascular": 4,
    "detoxification": 3
  },
  "urgentConcerns": ["concern1", "concern2"],
  "timeline": "Expected timeline description",
  "successMetrics": [
    {
      "name": "Energy levels",
      "target": "Improved by 50%",
      "timeline": "4 weeks",
      "measurement": "Daily energy scale 1-10"
    }
  ],
  "practitionerNotes": "Additional clinical notes"
}
`;
  }

  private async callClaude(prompt: string): Promise<string> {
    const claudeClient = ClaudeClient.getInstance();
    
    const systemPrompt = `You are an expert FNTP (Functional Nutritional Therapy Practitioner) with deep knowledge of functional medicine, lab interpretation, and clinical protocols.

Your role is to analyze comprehensive client data and provide detailed, actionable insights for practitioners.

Key principles:
1. Focus on root cause analysis rather than symptom management
2. Consider system interconnections (gut-brain axis, HPA axis, etc.)
3. Prioritize evidence-based interventions
4. Consider truck driver lifestyle constraints when applicable
5. Provide specific, actionable recommendations
6. Use professional-grade supplements when possible
7. Consider compliance and practical implementation
8. Always provide confidence levels for root cause analysis
9. Consider DOT medical implications for truck drivers

When recommending supplements:
- Prioritize Letstruck.com for truck drivers (algae-based omega-3, non-refrigerated options)
- Use Biotics Research for professional-grade formulations
- Use Fullscript for broader selection and competitive pricing
- Always specify dosage, timing, and duration
- Note truck compatibility for drivers

Provide clear, structured analysis that practitioners can use immediately in coaching sessions.`;

    return await claudeClient.analyzePractitionerReport(prompt, systemPrompt);
  }

  private async parseAnalysisResponse(response: string): Promise<any> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and transform the parsed data
      return {
        rootCauses: Array.isArray(parsed.rootCauses) ? parsed.rootCauses : [],
        systemsPriority: parsed.systemsPriority || {},
        urgentConcerns: Array.isArray(parsed.urgentConcerns) ? parsed.urgentConcerns : [],
        timeline: parsed.timeline || 'Timeline not specified',
        successMetrics: Array.isArray(parsed.successMetrics) ? parsed.successMetrics : [],
        practitionerNotes: parsed.practitionerNotes || ''
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      
      // Return fallback analysis
      return this.createFallbackAnalysis();
    }
  }

  private async createProtocolPhases(analysis: any, supplements: SupplementProtocol): Promise<TreatmentPhases> {
    return {
      phase1: {
        focus: "Foundation and Inflammation Reduction",
        duration: "Weeks 1-4",
        supplements: supplements.phase1,
        dietary: [
          "Eliminate processed foods and added sugars",
          "Increase protein intake to 1g per pound body weight",
          "Add 2-3 servings of vegetables per meal",
          "Remove inflammatory oils (soybean, corn, canola)"
        ],
        lifestyle: [
          "Prioritize 7-8 hours of sleep per night",
          "Implement stress management techniques",
          "Begin gentle movement/exercise routine",
          "Establish consistent meal timing"
        ],
        goals: [
          "Reduce inflammation markers",
          "Improve energy levels by 30%",
          "Establish consistent sleep patterns",
          "Reduce digestive symptoms"
        ]
      },
      phase2: {
        focus: "Restoration and Optimization",
        duration: "Weeks 5-12",
        supplements: supplements.phase2,
        dietary: [
          "Implement targeted elimination diet if needed",
          "Add fermented foods for gut health",
          "Optimize meal timing for circadian rhythm",
          "Increase healthy fat intake"
        ],
        lifestyle: [
          "Increase exercise intensity gradually",
          "Implement advanced stress management",
          "Optimize sleep environment",
          "Add recovery protocols"
        ],
        goals: [
          "Achieve optimal lab markers",
          "Improve body composition",
          "Enhance cognitive function",
          "Establish sustainable habits"
        ]
      },
      phase3: {
        focus: "Advanced Protocols and Maintenance",
        duration: "Weeks 13-24",
        supplements: supplements.phase3,
        dietary: [
          "Fine-tune macronutrient ratios",
          "Add targeted superfoods",
          "Implement intermittent fasting if appropriate",
          "Optimize for performance"
        ],
        lifestyle: [
          "Advanced exercise protocols",
          "Biohacking techniques",
          "Long-term stress resilience",
          "Performance optimization"
        ],
        goals: [
          "Achieve peak performance",
          "Maintain optimal health markers",
          "Establish long-term sustainability",
          "Prevent future health issues"
        ]
      }
    };
  }

  private async compareToLastAnalysis(
    currentAnalysis: any,
    lastAnalysis: ComprehensiveAnalysis
  ): Promise<ProgressComparison> {
    const comparison: ProgressComparison = {
      improvementAreas: [],
      worsenedAreas: [],
      stableAreas: [],
      protocolEffectiveness: {},
      complianceCorrelation: {},
      nextRecommendations: []
    };
    
    // Compare systems priority scores
    for (const [system, currentScore] of Object.entries(currentAnalysis.systemsPriority)) {
      const lastScore = lastAnalysis.systemsPriority[system];
      const currentScoreNum = typeof currentScore === 'number' ? currentScore : 0;
      
      if (lastScore !== undefined) {
        if (currentScoreNum < lastScore - 10) {
          comparison.improvementAreas.push({
            system,
            improvement: lastScore - currentScoreNum,
            likelyFactors: this.identifyImprovementFactors(system, lastAnalysis)
          });
        } else if (currentScoreNum > lastScore + 10) {
          comparison.worsenedAreas.push({
            system,
            decline: currentScoreNum - lastScore,
            possibleCauses: this.identifyDeclineFactors(system, lastAnalysis)
          });
        } else {
          comparison.stableAreas.push(system);
        }
      }
    }
    
    // Analyze protocol effectiveness
    if (lastAnalysis.supplementProtocol) {
      comparison.protocolEffectiveness = this.analyzeProtocolEffectiveness(
        lastAnalysis.supplementProtocol,
        comparison
      );
    }
    
    // Generate next recommendations
    comparison.nextRecommendations = this.generateNextRecommendations(comparison);
    
    return comparison;
  }

  private identifyImprovementFactors(system: string, lastAnalysis: ComprehensiveAnalysis): string[] {
    const factors: string[] = [];
    
    // Check if supplements targeted this system
    const relevantSupplements = lastAnalysis.supplementProtocol.phase1.concat(
      lastAnalysis.supplementProtocol.phase2,
      lastAnalysis.supplementProtocol.phase3
    ).filter(supp => 
      supp.rationale.toLowerCase().includes(system.toLowerCase())
    );
    
    if (relevantSupplements.length > 0) {
      factors.push(`Targeted supplements: ${relevantSupplements.map(s => s.name).join(', ')}`);
    }
    
    // Check lifestyle changes
    if (lastAnalysis.treatmentPhases.phase1.lifestyle.some(l => 
      l.toLowerCase().includes(system.toLowerCase())
    )) {
      factors.push('Lifestyle modifications');
    }
    
    return factors;
  }

  private identifyDeclineFactors(system: string, lastAnalysis: ComprehensiveAnalysis): string[] {
    return [
      'Possible non-compliance with protocol',
      'New stressors or lifestyle changes',
      'Underlying condition progression',
      'Need for protocol adjustment'
    ];
  }

  private analyzeProtocolEffectiveness(
    lastProtocol: SupplementProtocol,
    comparison: ProgressComparison
  ): Record<string, number> {
    const effectiveness: Record<string, number> = {};
    
    // Calculate effectiveness based on improvement areas
    const totalSupplements = lastProtocol.phase1.length + lastProtocol.phase2.length + lastProtocol.phase3.length;
    const improvementCount = comparison.improvementAreas.length;
    
    effectiveness.overall = totalSupplements > 0 ? (improvementCount / totalSupplements) * 100 : 0;
    
    return effectiveness;
  }

  private generateNextRecommendations(comparison: ProgressComparison): string[] {
    const recommendations: string[] = [];
    
    if (comparison.worsenedAreas.length > 0) {
      recommendations.push('Adjust protocol for worsened systems');
      recommendations.push('Increase compliance monitoring');
    }
    
    if (comparison.improvementAreas.length > 0) {
      recommendations.push('Continue successful interventions');
      recommendations.push('Consider advancing to next phase');
    }
    
    if (comparison.stableAreas.length > 0) {
      recommendations.push('Reassess stable systems');
      recommendations.push('Consider alternative approaches');
    }
    
    return recommendations;
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private createFallbackAnalysis(): any {
    return {
      rootCauses: [
        {
          name: "Systemic inflammation",
          confidence: 75,
          explanation: "Based on assessment data, systemic inflammation appears to be a primary driver",
          affectedSystems: ["immune", "digestive", "nervous"],
          driverFactors: ["diet", "stress", "sleep"]
        }
      ],
      systemsPriority: {
        digestive: 7,
        immune: 6,
        nervous: 5,
        endocrine: 4,
        cardiovascular: 3,
        detoxification: 2
      },
      urgentConcerns: ["Address foundational health first"],
      timeline: "Initial improvements expected within 2-4 weeks",
      successMetrics: [
        {
          name: "Energy levels",
          target: "Improved by 30%",
          timeline: "4 weeks",
          measurement: "Daily energy scale 1-10"
        }
      ],
      practitionerNotes: "Fallback analysis generated due to parsing error"
    };
  }
} 