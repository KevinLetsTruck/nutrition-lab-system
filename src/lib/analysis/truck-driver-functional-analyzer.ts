import ClaudeClient from '../claude-client'

export interface TruckDriverHealthAnalysis {
  // Core functional medicine analysis
  rootCauses: RootCauseAnalysis[]
  systemImbalances: SystemImbalance[]
  functionalRangeAssessment: FunctionalRangeResult[]
  patternRecognition: HealthPattern[]
  riskStratification: RiskAssessment
  
  // Truck driver specific
  dotCertificationRisks: DOTRisk[]
  lifestyleImpactFactors: LifestyleImpact[]
  safetyCriticalMonitoring: SafetyMetric[]
  routeScheduleCorrelations: RouteHealthCorrelation[]
  complianceFeasibility: ComplianceAssessment
  
  // Recommendations
  immediateActions: Action[]
  protocolRecommendations: Protocol[]
  supplementStrategy: SupplementPlan
  lifestyleModifications: LifestyleChange[]
  followUpSchedule: FollowUp[]
}

export interface RootCauseAnalysis {
  issue: string
  underlyingCauses: string[]
  affectedSystems: string[]
  severity: 'critical' | 'high' | 'moderate' | 'low'
  evidenceBase: string[]
}

export interface SystemImbalance {
  system: string
  imbalanceType: string
  markers: Array<{
    name: string
    value: number
    optimalRange: string
    currentStatus: string
  }>
  interconnections: string[]
}

export interface FunctionalRangeResult {
  marker: string
  value: number
  standardRange: string
  functionalRange: string
  interpretation: string
  clinicalSignificance: string
}

export interface HealthPattern {
  patternName: string
  confidence: number
  symptoms: string[]
  suggestedConditions: string[]
  differentialDiagnosis: string[]
}

export interface RiskAssessment {
  immediateRisks: Risk[]
  shortTermRisks: Risk[]
  longTermRisks: Risk[]
  overallRiskScore: number
}

export interface Risk {
  description: string
  severity: number // 1-10
  timeframe: string
  mitigationStrategies: string[]
}

export interface DOTRisk {
  condition: string
  currentStatus: string
  certificationImpact: 'disqualifying' | 'restricted' | 'monitoring' | 'none'
  requiresWaiver: boolean
  actionRequired: string
}

export interface LifestyleImpact {
  factor: string
  healthImpact: string
  severity: number // 1-10
  modifiability: 'high' | 'moderate' | 'low'
  interventions: string[]
}

export interface SafetyMetric {
  metric: string
  currentValue: any
  safeRange: string
  riskLevel: 'critical' | 'high' | 'moderate' | 'low'
  monitoringFrequency: string
}

export interface RouteHealthCorrelation {
  routeCharacteristic: string
  healthImpact: string
  correlation: number // -1 to 1
  recommendations: string[]
}

export interface ComplianceAssessment {
  overallFeasibility: number // 0-100%
  barriers: string[]
  facilitators: string[]
  roadCompatibleStrategies: string[]
}

export interface Action {
  action: string
  priority: 'immediate' | 'urgent' | 'important'
  reason: string
  expectedOutcome: string
}

export interface Protocol {
  name: string
  duration: string
  components: string[]
  expectedResults: string[]
  monitoring: string[]
}

export interface SupplementPlan {
  coreSupplements: Supplement[]
  conditionalSupplements: Supplement[]
  timing: string
  specialConsiderations: string[]
}

export interface Supplement {
  name: string
  dosage: string
  form: string
  timing: string
  reason: string
  brandRecommendation?: string
}

export interface LifestyleChange {
  area: string
  currentState: string
  targetState: string
  actionSteps: string[]
  timeline: string
  roadCompatibility: string
}

export interface FollowUp {
  timeframe: string
  assessments: string[]
  expectedProgress: string[]
  adjustmentCriteria: string[]
}

export class TruckDriverFunctionalAnalyzer {
  private claudeClient: ClaudeClient

  constructor() {
    this.claudeClient = new ClaudeClient()
  }

  async analyzeHealthData(
    extractedData: any,
    documentType: string,
    clientHistory?: any
  ): Promise<TruckDriverHealthAnalysis> {
    console.log('[TRUCK-DRIVER-ANALYZER] Starting comprehensive analysis')
    
    try {
      // Build comprehensive prompt
      const analysisPrompt = this.buildAnalysisPrompt(extractedData, documentType, clientHistory)
      
      // Get Claude's analysis
      const claudeResponse = await this.claudeClient.analyzeWithPrompt(analysisPrompt)
      
      // Parse and validate response
      const analysis = this.parseAnalysisResponse(claudeResponse)
      
      // Enhance with additional calculations
      const enhancedAnalysis = this.enhanceAnalysis(analysis, extractedData)
      
      // Add truck driver specific insights
      const finalAnalysis = this.addTruckDriverInsights(enhancedAnalysis, extractedData)
      
      return finalAnalysis
      
    } catch (error) {
      console.error('[TRUCK-DRIVER-ANALYZER] Analysis error:', error)
      throw new Error(`Truck driver health analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildAnalysisPrompt(extractedData: any, documentType: string, clientHistory?: any): string {
    return `You are Kevin Rutherford, FNTP (Functional Nutritional Therapy Practitioner) specializing in truck driver health optimization. 
    
Analyze this health data with a comprehensive functional medicine approach:

Document Type: ${documentType}
Extracted Data: ${JSON.stringify(extractedData, null, 2)}
${clientHistory ? `Client History: ${JSON.stringify(clientHistory, null, 2)}` : ''}

Provide a comprehensive analysis following this structure:

1. ROOT CAUSE ANALYSIS
- Identify underlying dysfunctions (not just symptoms)
- Consider gut health, inflammation, stress, nutrient deficiencies
- Look for interconnected issues across body systems

2. SYSTEM IMBALANCES
- Assess each major body system
- Compare values to functional (not just standard) ranges
- Identify system interconnections

3. PATTERN RECOGNITION
- Identify symptom clusters
- Recognize functional medicine patterns
- Consider differential diagnoses

4. RISK STRATIFICATION
- Immediate health risks (next 30 days)
- Short-term risks (3-6 months)
- Long-term risks (1+ years)

5. TRUCK DRIVER SPECIFIC ANALYSIS
- DOT Medical Certification risks
- Impact of sedentary driving
- Irregular schedule effects
- Limited food access considerations
- Sleep disruption impacts
- Stress from traffic/deadlines

6. SAFETY-CRITICAL MONITORING
- Hypoglycemia risk
- Medication side effects affecting alertness
- Sleep apnea indicators
- Cardiovascular events risk

7. PRACTICAL INTERVENTIONS
- Road-compatible solutions
- Truck-stop friendly options
- No-cook meal strategies
- Exercise in limited space
- Stress management while driving

8. SUPPLEMENT PROTOCOL
- Core supplements for truckers
- Timing around driving schedule
- Forms that work on the road
- LetsTruck.com specific products

9. MONITORING PLAN
- Self-monitoring strategies
- When to seek immediate help
- Follow-up schedule
- Progress markers

Format your response as a detailed JSON object matching the TruckDriverHealthAnalysis interface structure.
Focus on practical, implementable solutions that work within the constraints of truck driving.
Consider DOT regulations and safety as top priorities.`
  }

  private parseAnalysisResponse(response: string): TruckDriverHealthAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields exist
      this.validateAnalysisStructure(parsed)
      
      return parsed as TruckDriverHealthAnalysis
      
    } catch (error) {
      console.error('[TRUCK-DRIVER-ANALYZER] Parse error:', error)
      // Return a minimal valid structure
      return this.createFallbackAnalysis()
    }
  }

  private validateAnalysisStructure(analysis: any): void {
    const requiredFields = [
      'rootCauses',
      'systemImbalances',
      'functionalRangeAssessment',
      'patternRecognition',
      'riskStratification',
      'dotCertificationRisks',
      'immediateActions',
      'protocolRecommendations'
    ]
    
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
  }

  private enhanceAnalysis(
    analysis: TruckDriverHealthAnalysis,
    extractedData: any
  ): TruckDriverHealthAnalysis {
    // Add calculated risk scores
    analysis.riskStratification.overallRiskScore = this.calculateOverallRisk(analysis)
    
    // Enhance DOT certification risks
    analysis.dotCertificationRisks = this.assessDOTRisks(extractedData, analysis)
    
    // Add compliance feasibility scoring
    analysis.complianceFeasibility = this.assessComplianceFeasibility(analysis)
    
    return analysis
  }

  private calculateOverallRisk(analysis: TruckDriverHealthAnalysis): number {
    let riskScore = 0
    let weightTotal = 0
    
    // Weight immediate risks highest
    const immediateWeight = 3
    const shortTermWeight = 2
    const longTermWeight = 1
    
    // Calculate weighted average
    analysis.riskStratification.immediateRisks.forEach(risk => {
      riskScore += risk.severity * immediateWeight
      weightTotal += immediateWeight
    })
    
    analysis.riskStratification.shortTermRisks.forEach(risk => {
      riskScore += risk.severity * shortTermWeight
      weightTotal += shortTermWeight
    })
    
    analysis.riskStratification.longTermRisks.forEach(risk => {
      riskScore += risk.severity * longTermWeight
      weightTotal += longTermWeight
    })
    
    return weightTotal > 0 ? Math.round(riskScore / weightTotal) : 0
  }

  private assessDOTRisks(extractedData: any, analysis: TruckDriverHealthAnalysis): DOTRisk[] {
    const dotRisks: DOTRisk[] = []
    
    // Check common DOT disqualifying conditions
    const dotChecks = [
      {
        marker: 'glucose',
        threshold: 200,
        condition: 'Diabetes - Uncontrolled',
        impact: 'disqualifying' as const
      },
      {
        marker: 'bloodPressure',
        systolicThreshold: 180,
        diastolicThreshold: 110,
        condition: 'Hypertension - Stage 3',
        impact: 'disqualifying' as const
      },
      {
        marker: 'a1c',
        threshold: 10,
        condition: 'Diabetes - Poor Control',
        impact: 'restricted' as const
      }
    ]
    
    // Assess each condition
    // (Implementation would check actual values from extractedData)
    
    return dotRisks
  }

  private assessComplianceFeasibility(analysis: TruckDriverHealthAnalysis): ComplianceAssessment {
    const barriers: string[] = []
    const facilitators: string[] = []
    const strategies: string[] = []
    
    // Assess barriers
    if (analysis.lifestyleImpactFactors?.some(f => f.factor === 'irregular schedule')) {
      barriers.push('Irregular driving schedule')
      strategies.push('Use smartphone reminders for supplements')
    }
    
    if (analysis.lifestyleImpactFactors?.some(f => f.factor === 'limited food access')) {
      barriers.push('Limited healthy food options')
      strategies.push('Pre-pack portable healthy snacks')
    }
    
    // Calculate feasibility score
    const feasibilityScore = 100 - (barriers.length * 10)
    
    return {
      overallFeasibility: Math.max(feasibilityScore, 20), // Minimum 20%
      barriers,
      facilitators,
      roadCompatibleStrategies: strategies
    }
  }

  private addTruckDriverInsights(
    analysis: TruckDriverHealthAnalysis,
    extractedData: any
  ): TruckDriverHealthAnalysis {
    // Add specific truck driver considerations
    if (!analysis.lifestyleImpactFactors) {
      analysis.lifestyleImpactFactors = []
    }
    
    // Add common truck driver lifestyle impacts
    const commonImpacts: LifestyleImpact[] = [
      {
        factor: 'Sedentary driving',
        healthImpact: 'Reduced circulation, muscle atrophy, metabolic slowdown',
        severity: 7,
        modifiability: 'moderate',
        interventions: [
          'Isometric exercises while driving',
          'Mandatory movement breaks every 2 hours',
          'Portable resistance bands for rest stops'
        ]
      },
      {
        factor: 'Irregular meal timing',
        healthImpact: 'Disrupted metabolism, blood sugar instability',
        severity: 6,
        modifiability: 'high',
        interventions: [
          'Time-restricted eating window',
          'Portable protein shakes',
          'Strategic snack planning'
        ]
      }
    ]
    
    analysis.lifestyleImpactFactors.push(...commonImpacts)
    
    return analysis
  }

  private createFallbackAnalysis(): TruckDriverHealthAnalysis {
    return {
      rootCauses: [],
      systemImbalances: [],
      functionalRangeAssessment: [],
      patternRecognition: [],
      riskStratification: {
        immediateRisks: [],
        shortTermRisks: [],
        longTermRisks: [],
        overallRiskScore: 0
      },
      dotCertificationRisks: [],
      lifestyleImpactFactors: [],
      safetyCriticalMonitoring: [],
      routeScheduleCorrelations: [],
      complianceFeasibility: {
        overallFeasibility: 50,
        barriers: ['Unable to complete full analysis'],
        facilitators: [],
        roadCompatibleStrategies: []
      },
      immediateActions: [{
        action: 'Resubmit document for analysis',
        priority: 'immediate',
        reason: 'Initial analysis incomplete',
        expectedOutcome: 'Complete health assessment'
      }],
      protocolRecommendations: [],
      supplementStrategy: {
        coreSupplements: [],
        conditionalSupplements: [],
        timing: '',
        specialConsiderations: []
      },
      lifestyleModifications: [],
      followUpSchedule: []
    }
  }
}