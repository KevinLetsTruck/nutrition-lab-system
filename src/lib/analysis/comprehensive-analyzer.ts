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
      executiveSummary: analysis.executiveSummary,
      rootCauseAnalysis: analysis.rootCauses,
      systemsPriority: analysis.systemsPriority,
      progressComparison: progressComparison,
      supplementProtocol: supplements,
      treatmentPhases: protocols,
      lifestyleIntegration: analysis.lifestyleIntegration,
      monitoringPlan: analysis.monitoringPlan,
      urgentConcerns: analysis.urgentConcerns,
      expectedTimeline: analysis.expectedTimeline,
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
${assessment.responses ? `
Structured Responses:
${assessment.responses.map((response: any) => `
  Question ID: ${response.questionId}
  Section: ${response.section}
  Response: ${JSON.stringify(response.response)}
  Content: ${response.content}
`).join('\n')}
` : ''}
${assessment.results ? `Assessment Results: ${JSON.stringify(assessment.results, null, 2)}` : ''}
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

IMPORTANT: Base your analysis ONLY on the actual data provided above. Do NOT generate fake or hypothetical information. If specific data is missing (like blood pressure, lab values, etc.), acknowledge this in your analysis and recommend what additional testing would be helpful. Focus on what the assessments and notes actually reveal about the client's health status.

Please provide a comprehensive functional medicine analysis following the exact format and detail level of a professional practitioner report. This should be a complete clinical assessment that could be given directly to a client.

## ANALYSIS REQUIREMENTS:

1. **EXECUTIVE SUMMARY**
- Primary root causes with confidence scores (0-100%)
- Critical vs moderate vs mild dysfunction levels
- Overall protocol timeline and focus areas

2. **ROOT CAUSE ANALYSIS**
- Identify 3-5 primary dysfunctions with detailed explanations
- Explain interconnections between symptoms and systems
- Consider lifestyle factors (truck driver, stress, sleep, diet)
- Rate confidence level for each root cause (0-100%)
- Include clinical reasoning and evidence from assessments

3. **SYSTEMS PRIORITY ASSESSMENT**
- Rank body systems by dysfunction severity (0-10 scale)
- Identify which systems to address first and why
- Explain the functional medicine approach to prioritization
- Consider the gut-brain-hormone axis connections

4. **PHASED PROTOCOL DESIGN**
- **Phase 1 (Weeks 1-4):** Immediate stabilization and foundational work
- **Phase 2 (Weeks 5-8):** System rebuilding and optimization
- **Phase 3 (Weeks 9-12):** Advanced protocols and maintenance
- Include specific goals, dietary changes, and lifestyle modifications for each phase

5. **DETAILED SUPPLEMENT PROTOCOL**
- List specific supplements with exact dosing and timing
- Explain clinical rationale for each recommendation
- Note food requirements and interactions
- Include truck-compatible instructions if applicable
- Follow hierarchy: LetsTrack → Biotics → Fullscript
- Include monthly cost estimates

6. **LIFESTYLE INTEGRATION**
- Sleep optimization recommendations
- Stress management strategies
- Movement and exercise guidelines
- Dietary modifications and food elimination protocols
- Environmental factors to address

7. **MONITORING & SUCCESS METRICS**
- Weekly and monthly check-in points
- Specific measurable outcomes for each phase
- Red flags requiring immediate medical referral
- Expected timeline for improvements
- Long-term maintenance strategies

8. **PRACTITIONER NOTES**
- Clinical reasoning and protocol rationale
- Potential challenges and modifications
- Success factors and compliance strategies
- Follow-up recommendations

Format as structured JSON for parsing with the following structure:

{
  "executiveSummary": {
    "primaryFocus": "Main focus area (e.g., Hormonal Balance & Gut Restoration)",
    "criticalRootCauses": [
      {
        "name": "Root cause name",
        "severity": "Critical/Moderate/Mild",
        "score": 85,
        "explanation": "Detailed clinical explanation"
      }
    ],
    "protocolTimeline": "90-day intensive phase with ongoing maintenance",
    "expectedOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"]
  },
  "rootCauses": [
    {
      "name": "Root cause name",
      "confidence": 85,
      "severity": "Critical/Moderate/Mild",
      "explanation": "Detailed clinical explanation with evidence",
      "affectedSystems": ["system1", "system2"],
      "lifestyleFactors": ["factor1", "factor2"],
      "clinicalEvidence": "Evidence from assessments and lab results"
    }
  ],
  "systemsPriority": {
    "digestive": 8,
    "immune": 7,
    "endocrine": 6,
    "nervous": 5,
    "cardiovascular": 4,
    "detoxification": 3,
    "reproductive": 9,
    "adrenal": 7
  },
  "treatmentPhases": {
    "phase1": {
      "duration": "Weeks 1-4",
      "goal": "Immediate stabilization",
      "dietaryChanges": ["Eliminate dairy", "Remove gluten"],
      "lifestyleModifications": ["Sleep optimization", "Stress management"],
      "focusAreas": ["Gut healing", "Inflammation reduction"]
    },
    "phase2": {
      "duration": "Weeks 5-8", 
      "goal": "System rebuilding",
      "dietaryChanges": ["Reintroduce foods", "Add bone broth"],
      "lifestyleModifications": ["Exercise protocol", "Sunlight exposure"],
      "focusAreas": ["Hormone balance", "Microbiome restoration"]
    },
    "phase3": {
      "duration": "Weeks 9-12",
      "goal": "Optimization and maintenance",
      "dietaryChanges": ["Food reintroduction protocol"],
      "lifestyleModifications": ["Long-term habits"],
      "focusAreas": ["Performance optimization", "Prevention"]
    }
  },
  "lifestyleIntegration": {
    "sleepOptimization": ["7-9 hours", "Consistent schedule", "Dark room"],
    "stressManagement": ["Meditation", "Breathing exercises", "Yoga"],
    "movement": ["Gentle exercise", "Avoid overtraining"],
    "environmentalFactors": ["Sunlight exposure", "Clean air", "Water quality"]
  },
  "monitoringPlan": {
    "weeklyCheckpoints": [
      {
        "metric": "Energy levels",
        "measurement": "Daily rating 1-10",
        "target": "Improvement by 50%"
      }
    ],
    "monthlyAssessments": [
      {
        "metric": "Symptom burden",
        "measurement": "Re-evaluate NAQ scores",
        "target": "Reduction in total score"
      }
    ],
    "redFlags": [
      {
        "category": "Hormonal",
        "symptoms": ["Severe bleeding", "Complete cessation of periods"],
        "action": "Seek immediate medical care"
      }
    ]
  },
  "urgentConcerns": ["concern1", "concern2"],
  "expectedTimeline": {
    "week2to4": ["Reduced bloating", "Improved energy", "Better sleep"],
    "month2to3": ["Regular cycles", "Reduced PMS", "Better stress resilience"],
    "month3to6": ["Stable hormones", "Expanded food tolerance", "Sustainable energy"]
  },
  "practitionerNotes": {
    "protocolRationale": "Clinical reasoning for the approach",
    "keySuccessFactors": ["Factor 1", "Factor 2", "Factor 3"],
    "potentialChallenges": ["Challenge 1", "Challenge 2"],
    "modificationsForLifestyle": ["Modification 1", "Modification 2"],
    "followUpRecommendations": "Schedule and frequency of check-ins"
  }
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
      
      // Validate and transform the parsed data with enhanced structure
      return {
        executiveSummary: parsed.executiveSummary || {
          primaryFocus: 'Health optimization',
          criticalRootCauses: [],
          protocolTimeline: '90-day intensive phase',
          expectedOutcomes: []
        },
        rootCauses: Array.isArray(parsed.rootCauses) ? parsed.rootCauses : [],
        systemsPriority: parsed.systemsPriority || {},
        treatmentPhases: parsed.treatmentPhases || {},
        lifestyleIntegration: parsed.lifestyleIntegration || {
          sleepOptimization: [],
          stressManagement: [],
          movement: [],
          environmentalFactors: []
        },
        monitoringPlan: parsed.monitoringPlan || {
          weeklyCheckpoints: [],
          monthlyAssessments: [],
          redFlags: []
        },
        urgentConcerns: Array.isArray(parsed.urgentConcerns) ? parsed.urgentConcerns : [],
        expectedTimeline: parsed.expectedTimeline || {
          week2to4: [],
          month2to3: [],
          month3to6: []
        },
        practitionerNotes: parsed.practitionerNotes || {
          protocolRationale: '',
          keySuccessFactors: [],
          potentialChallenges: [],
          modificationsForLifestyle: [],
          followUpRecommendations: ''
        }
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      
      // Return fallback analysis
      return this.createFallbackAnalysis();
    }
  }

  private async createProtocolPhases(analysis: any, supplements: SupplementProtocol): Promise<TreatmentPhases> {
    // Use analysis.treatmentPhases if available, otherwise create default structure
    const treatmentPhases = analysis.treatmentPhases || {};
    
    return {
      phase1: {
        duration: treatmentPhases.phase1?.duration || "Weeks 1-4",
        goal: treatmentPhases.phase1?.goal || "Foundation and Inflammation Reduction",
        dietaryChanges: treatmentPhases.phase1?.dietaryChanges || [
          "Eliminate processed foods and added sugars",
          "Increase protein intake to 1g per pound body weight",
          "Add 2-3 servings of vegetables per meal",
          "Remove inflammatory oils (soybean, corn, canola)"
        ],
        lifestyleModifications: treatmentPhases.phase1?.lifestyleModifications || [
          "Prioritize 7-8 hours of sleep per night",
          "Implement stress management techniques",
          "Begin gentle movement/exercise routine",
          "Establish consistent meal timing"
        ],
        focusAreas: treatmentPhases.phase1?.focusAreas || [
          "Reduce inflammation markers",
          "Improve energy levels by 30%",
          "Establish consistent sleep patterns",
          "Reduce digestive symptoms"
        ],
        supplements: supplements.phase1
      },
      phase2: {
        duration: treatmentPhases.phase2?.duration || "Weeks 5-8",
        goal: treatmentPhases.phase2?.goal || "Restoration and Optimization",
        dietaryChanges: treatmentPhases.phase2?.dietaryChanges || [
          "Implement targeted elimination diet if needed",
          "Add fermented foods for gut health",
          "Optimize meal timing for circadian rhythm",
          "Increase healthy fat intake"
        ],
        lifestyleModifications: treatmentPhases.phase2?.lifestyleModifications || [
          "Increase exercise intensity gradually",
          "Implement advanced stress management",
          "Optimize sleep environment",
          "Add recovery protocols"
        ],
        focusAreas: treatmentPhases.phase2?.focusAreas || [
          "Achieve optimal lab markers",
          "Improve body composition",
          "Enhance cognitive function",
          "Establish sustainable habits"
        ],
        supplements: supplements.phase2
      },
      phase3: {
        duration: treatmentPhases.phase3?.duration || "Weeks 9-12",
        goal: treatmentPhases.phase3?.goal || "Advanced Protocols and Maintenance",
        dietaryChanges: treatmentPhases.phase3?.dietaryChanges || [
          "Fine-tune macronutrient ratios",
          "Add targeted superfoods",
          "Implement intermittent fasting if appropriate",
          "Optimize for performance"
        ],
        lifestyleModifications: treatmentPhases.phase3?.lifestyleModifications || [
          "Advanced exercise protocols",
          "Biohacking techniques",
          "Long-term stress resilience",
          "Performance optimization"
        ],
        focusAreas: treatmentPhases.phase3?.focusAreas || [
          "Achieve peak performance",
          "Maintain optimal health markers",
          "Establish long-term sustainability",
          "Prevent future health issues"
        ],
        supplements: supplements.phase3
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
    
    // Check lifestyle modifications
    if (lastAnalysis.treatmentPhases.phase1.lifestyleModifications.some(l => 
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
      executiveSummary: {
        primaryFocus: 'Health optimization',
        criticalRootCauses: [
          {
            name: "Systemic inflammation",
            severity: "Moderate",
            score: 75,
            explanation: "Based on assessment data, systemic inflammation appears to be a primary driver"
          }
        ],
        protocolTimeline: '90-day intensive phase',
        expectedOutcomes: ['Improved energy', 'Reduced inflammation', 'Better sleep']
      },
      rootCauses: [
        {
          name: "Systemic inflammation",
          confidence: 75,
          severity: "Moderate",
          explanation: "Based on assessment data, systemic inflammation appears to be a primary driver",
          affectedSystems: ["immune", "digestive", "nervous"],
          lifestyleFactors: ["diet", "stress", "sleep"],
          clinicalEvidence: "Assessment scores indicate inflammatory patterns"
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
      treatmentPhases: {
        phase1: {
          duration: "Weeks 1-4",
          goal: "Foundation and inflammation reduction",
          dietaryChanges: ["Eliminate processed foods", "Increase vegetables"],
          lifestyleModifications: ["Prioritize sleep", "Stress management"],
          focusAreas: ["Reduce inflammation", "Improve energy"]
        }
      },
      lifestyleIntegration: {
        sleepOptimization: ["7-9 hours per night", "Consistent schedule"],
        stressManagement: ["Meditation", "Breathing exercises"],
        movement: ["Gentle exercise", "Daily walks"],
        environmentalFactors: ["Sunlight exposure", "Clean air"]
      },
      monitoringPlan: {
        weeklyCheckpoints: [
          {
            metric: "Energy levels",
            measurement: "Daily rating 1-10",
            target: "Improvement by 30%"
          }
        ],
        monthlyAssessments: [],
        redFlags: []
      },
      urgentConcerns: ["Address foundational health first"],
      expectedTimeline: {
        week2to4: ["Reduced inflammation", "Improved energy"],
        month2to3: ["Better sleep", "Reduced stress"],
        month3to6: ["Sustainable improvements", "Long-term habits"]
      },
      practitionerNotes: {
        protocolRationale: "Fallback analysis generated due to parsing error",
        keySuccessFactors: ["Compliance", "Patience", "Consistency"],
        potentialChallenges: ["Initial adjustment period"],
        modificationsForLifestyle: ["Adapt to individual needs"],
        followUpRecommendations: "Reassess in 4 weeks"
      }
    };
  }
} 