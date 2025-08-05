// NAQ Report Generator - Comprehensive Functional Medicine Reports
// Orchestrates pattern analysis, interpretation, and report generation

import NAQPatternAnalyzer, { SymptomBurdenData, NAQPattern } from './naq-pattern-analyzer'
import FunctionalMedicineInterpreter, { 
  NAQAnswers, 
  FunctionalMedicineReport,
  InterventionPhase 
} from './functional-medicine-interpreter'
import TruckDriverHealthAnalyzer from './truck-driver-insights'
import ClinicalNotesGenerator from './ai-clinical-notes'

export interface ClientData {
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  occupation?: string
  assessmentDate?: Date
  clientId?: string
}

export interface NAQResponses {
  answers: NAQAnswers
  symptomBurden: SymptomBurdenData
  completedSections: string[]
  assessmentDate: Date
}

export interface ComprehensiveNAQReport {
  header: ReportHeader
  executiveSummary: string
  symptomBurdenAnalysis: string
  rootCauseAnalysis: string
  functionalMedicinePatterns: NAQPattern[]
  systemBySystemBreakdown: string
  interventionProtocol: InterventionProtocol
  supplementRecommendations: SupplementProtocol
  dietaryGuidelines: DietaryProtocol
  lifestyleModifications: LifestyleProtocol
  truckDriverSpecificAdvice: string
  followUpRecommendations: string
  visualizations: ReportVisualizations
  practitionerNotes: string
  metadata: ReportMetadata
}

export interface ReportHeader {
  title: string
  clientName: string
  assessmentDate: string
  practitioner: string
  reportId: string
}

export interface InterventionProtocol {
  phases: InterventionPhase[]
  priorityInterventions: string[]
  expectedTimeline: string
}

export interface SupplementProtocol {
  immediate: SupplementRecommendation[]
  shortTerm: SupplementRecommendation[]
  longTerm: SupplementRecommendation[]
  notes: string
}

export interface SupplementRecommendation {
  name: string
  dosage: string
  timing: string
  duration: string
  rationale: string
  precautions?: string
  truckDriverTip?: string
}

export interface DietaryProtocol {
  eliminationPhase: string[]
  reintroductionPhase: string[]
  maintenancePhase: string[]
  truckStopGuidelines: string[]
  mealPlanExample: MealPlan
}

export interface MealPlan {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
  snacks: string[]
}

export interface LifestyleProtocol {
  sleep: string[]
  exercise: string[]
  stressManagement: string[]
  environmental: string[]
}

export interface ReportVisualizations {
  symptomBurdenChart: ChartData
  patternConnectionsMap: ConnectionData
  interventionTimeline: TimelineData
  systemScoreRadar: RadarData
}

export interface ChartData {
  type: string
  data: any
  options: any
}

export interface ConnectionData {
  nodes: any[]
  edges: any[]
}

export interface TimelineData {
  phases: any[]
  milestones: any[]
}

export interface RadarData {
  categories: string[]
  values: number[]
  maxValues: number[]
}

export interface ReportMetadata {
  generatedAt: Date
  reportVersion: string
  confidence: number
  dataCompleteness: number
}

export class NAQReportGenerator {
  private patternAnalyzer: NAQPatternAnalyzer
  private interpreter: FunctionalMedicineInterpreter
  private driverAnalyzer: TruckDriverHealthAnalyzer
  private clinicalNotesGenerator: ClinicalNotesGenerator
  
  constructor() {
    this.patternAnalyzer = new NAQPatternAnalyzer()
    this.interpreter = new FunctionalMedicineInterpreter()
    this.driverAnalyzer = new TruckDriverHealthAnalyzer()
    this.clinicalNotesGenerator = new ClinicalNotesGenerator()
  }
  
  async generateReport(
    clientData: ClientData,
    naqResponses: NAQResponses,
    practitionerName: string = "Kevin Rutherford, FNTP"
  ): Promise<ComprehensiveNAQReport> {
    
    console.log('[NAQ-REPORT-GENERATOR] Starting comprehensive report generation...')
    
    // Step 1: Pattern Analysis
    const patterns = this.patternAnalyzer.analyzePatterns(naqResponses.symptomBurden)
    console.log(`[NAQ-REPORT-GENERATOR] Identified ${patterns.length} patterns`)
    
    // Step 2: Functional Medicine Interpretation
    const interpretation = this.interpreter.generateInterpretation(
      naqResponses.symptomBurden, 
      patterns, 
      naqResponses.answers
    )
    
    // Step 3: Generate Personalized Recommendations
    const recommendations = this.createRecommendations(patterns, interpretation, naqResponses.symptomBurden)
    
    // Step 4: Create Visual Elements
    const visualizations = this.generateVisualizations(naqResponses.symptomBurden, patterns)
    
    // Step 5: Generate AI Clinical Notes
    const practitionerNotes = await this.generatePractitionerNotes(
      patterns, 
      interpretation, 
      naqResponses.symptomBurden,
      clientData
    )
    
    // Step 6: Compile Full Report
    const report: ComprehensiveNAQReport = {
      header: this.createReportHeader(clientData, practitionerName),
      executiveSummary: interpretation.executiveSummary,
      symptomBurdenAnalysis: this.createDetailedSymptomAnalysis(naqResponses.symptomBurden, naqResponses),
      rootCauseAnalysis: this.formatRootCauseAnalysis(interpretation.rootCauseAnalysis),
      functionalMedicinePatterns: patterns,
      systemBySystemBreakdown: this.createSystemBreakdown(interpretation.systemsAnalysis, naqResponses),
      interventionProtocol: this.formatInterventionProtocol(interpretation.interventionStrategy),
      supplementRecommendations: recommendations.supplements,
      dietaryGuidelines: recommendations.dietary,
      lifestyleModifications: recommendations.lifestyle,
      truckDriverSpecificAdvice: this.formatDriverAdvice(interpretation.truckDriverConsiderations),
      followUpRecommendations: this.formatFollowUpPlan(interpretation.followUpRecommendations),
      visualizations: visualizations,
      practitionerNotes: practitionerNotes,
      metadata: this.createMetadata(patterns, naqResponses)
    }
    
    console.log('[NAQ-REPORT-GENERATOR] Report generation complete')
    return report
  }
  
  private createReportHeader(clientData: ClientData, practitioner: string): ReportHeader {
    return {
      title: "FNTP Functional Medicine Assessment Report",
      clientName: `${clientData.firstName} ${clientData.lastName}`,
      assessmentDate: clientData.assessmentDate?.toLocaleDateString() || new Date().toLocaleDateString(),
      practitioner: practitioner,
      reportId: `NAQ-${Date.now()}-${clientData.clientId || 'TEMP'}`
    }
  }
  
  private createDetailedSymptomAnalysis(burden: SymptomBurdenData, responses: NAQResponses): string {
    const totalPossible = 321 // Update based on actual NAQ
    const percentage = Math.round((burden.totalBurden / totalPossible) * 100)
    
    // Count symptoms by severity
    let mild = 0, moderate = 0, severe = 0
    Object.entries(responses.answers).forEach(([key, value]) => {
      if (typeof value === 'number') {
        if (value === 1) mild++
        else if (value === 2) moderate++
        else if (value >= 3) severe++
      }
    })
    
    // Identify critical symptoms
    const criticalSymptoms = this.identifyCriticalSymptoms(responses.answers)
    
    // Identify protective factors
    const protectiveFactors = this.identifyProtectiveFactors(burden, responses)
    
    return `
## Symptom Burden Analysis

### Overview
- **Total Symptom Burden:** ${burden.totalBurden} out of ${totalPossible} possible (${percentage}%)
- **Symptom Distribution:**
  - Mild symptoms (score 1): ${mild}
  - Moderate symptoms (score 2): ${moderate}  
  - Severe symptoms (score 3+): ${severe}
- **Primary System Involvement:** ${this.identifyPrimarySystems(burden).join(', ')}

### System-by-System Burden
${this.generateSystemBurdenTable(burden)}

### Critical Findings
${criticalSymptoms.length > 0 ? 
  `The following symptoms require immediate attention:
${criticalSymptoms.map(s => `- ${s}`).join('\n')}` : 
  'No individual symptoms at critical levels'}

### Symptom Patterns
${this.identifySymptomPatterns(burden)}

### Protective Factors
${protectiveFactors.length > 0 ?
  `Positive findings that support recovery:
${protectiveFactors.map(f => `- ${f}`).join('\n')}` :
  'Limited protective factors identified - focus on building resilience'}

### Clinical Significance
${this.assessClinicalSignificance(burden, percentage)}
    `.trim()
  }
  
  private generateSystemBurdenTable(burden: SymptomBurdenData): string {
    const systems = [
      { name: 'Upper GI', score: burden.upperGI, max: 9 },
      { name: 'Small Intestine', score: burden.smallIntestine, max: 9 },
      { name: 'Large Intestine', score: burden.largeIntestine, max: 9 },
      { name: 'Liver/Gallbladder', score: burden.liverGB, max: 9 },
      { name: 'Kidneys', score: burden.kidneys, max: 9 },
      { name: 'Cardiovascular', score: burden.cardiovascular, max: 9 },
      { name: 'Immune System', score: burden.immuneSystem, max: 9 },
      { name: 'Energy Production', score: burden.energyProduction, max: 9 },
      { name: 'Thyroid', score: burden.thyroid, max: 7 },
      { name: 'Adrenal', score: burden.adrenal, max: 9 },
      { name: 'Reproductive', score: burden.femaleReprod || burden.maleReprod || 0, max: 12 },
      { name: 'Sugar Handling', score: burden.sugarHandling, max: 5 },
      { name: 'Joints/Muscles', score: burden.joints, max: 9 },
      { name: 'Skin', score: burden.skin, max: 7 },
      { name: 'Brain/Nervous', score: burden.brain, max: 9 }
    ]
    
    return systems
      .sort((a, b) => (b.score / b.max) - (a.score / a.max))
      .map(s => {
        const percentage = Math.round((s.score / s.max) * 100)
        const bar = this.createProgressBar(percentage)
        return `**${s.name}:** ${s.score}/${s.max} (${percentage}%) ${bar}`
      })
      .join('\n')
  }
  
  private createProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 5)
    const empty = 20 - filled
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`
  }
  
  private identifyCriticalSymptoms(answers: NAQAnswers): string[] {
    const critical: string[] = []
    
    // Define critical symptoms that need immediate attention
    const criticalMap: { [key: string]: string } = {
      'chest_pain': 'Chest pain or pressure',
      'heart_palpitations': 'Heart palpitations',
      'blood_sugar_crashes': 'Severe blood sugar crashes',
      'fainting': 'Fainting or near-fainting episodes',
      'severe_headaches': 'Severe recurring headaches',
      'vision_changes': 'Sudden vision changes',
      'numbness_tingling': 'Numbness or tingling in extremities'
    }
    
    Object.entries(answers).forEach(([key, value]) => {
      if (criticalMap[key] && typeof value === 'number' && value >= 3) {
        critical.push(criticalMap[key])
      }
    })
    
    return critical
  }
  
  private identifyProtectiveFactors(burden: SymptomBurdenData, responses: NAQResponses): string[] {
    const protective: string[] = []
    
    // Low scores in certain areas are protective
    if (burden.cardiovascular <= 2) protective.push("Low cardiovascular symptom burden")
    if (burden.sugarHandling <= 1) protective.push("Good blood sugar regulation")
    if (burden.immuneSystem <= 2) protective.push("Robust immune function")
    if (burden.brain <= 2) protective.push("Clear cognitive function")
    
    // Check for positive lifestyle factors in answers
    if (responses.answers.regular_exercise === true) protective.push("Regular exercise routine")
    if (responses.answers.good_sleep === true) protective.push("Good sleep quality")
    if (responses.answers.stress_management === true) protective.push("Active stress management")
    
    return protective
  }
  
  private identifyPrimarySystems(burden: SymptomBurdenData): string[] {
    const systems = [
      { name: 'Digestive', score: burden.upperGI + burden.smallIntestine + burden.largeIntestine },
      { name: 'Hormonal', score: (burden.femaleReprod || 0) + (burden.maleReprod || 0) + burden.thyroid + burden.adrenal },
      { name: 'Metabolic', score: burden.energyProduction + burden.sugarHandling },
      { name: 'Detoxification', score: burden.liverGB + burden.kidneys },
      { name: 'Inflammatory', score: burden.joints + burden.skin + burden.immuneSystem },
      { name: 'Neurological', score: burden.brain }
    ]
    
    return systems
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.name)
  }
  
  private identifySymptomPatterns(burden: SymptomBurdenData): string {
    const patterns: string[] = []
    
    // Check for specific patterns
    if (burden.upperGI >= 4 && burden.brain >= 3) {
      patterns.push("**Gut-Brain Connection:** Upper GI symptoms correlating with cognitive issues")
    }
    
    if (burden.adrenal >= 4 && burden.thyroid >= 3) {
      patterns.push("**Endocrine Cascade:** Adrenal-thyroid axis disruption pattern")
    }
    
    if (burden.joints >= 4 && burden.skin >= 3) {
      patterns.push("**Inflammatory Pattern:** Systemic inflammation affecting multiple tissues")
    }
    
    if (burden.energyProduction >= 5 && burden.brain >= 4) {
      patterns.push("**Mitochondrial Pattern:** Cellular energy dysfunction with neurological impact")
    }
    
    return patterns.length > 0 ? patterns.join('\n') : "No clear cross-system patterns identified"
  }
  
  private assessClinicalSignificance(burden: SymptomBurdenData, percentage: number): string {
    if (percentage >= 50) {
      return `
**SEVERE DYSFUNCTION:** This level of symptom burden indicates significant multi-system 
dysfunction requiring immediate comprehensive intervention. Without proper treatment, 
progression to chronic disease is highly likely within 12-24 months.
      `.trim()
    } else if (percentage >= 35) {
      return `
**MODERATE-SEVERE DYSFUNCTION:** Multiple body systems are compromised and beginning 
to affect quality of life. Early intervention at this stage can prevent progression 
to chronic disease and restore optimal function.
      `.trim()
    } else if (percentage >= 20) {
      return `
**MODERATE DYSFUNCTION:** Early to moderate dysfunction present. This is an ideal 
stage for intervention as systems are still responsive and full recovery is expected 
with proper support.
      `.trim()
    } else {
      return `
**MILD DYSFUNCTION:** Minor imbalances present that can be addressed with targeted 
lifestyle and nutritional interventions. Focus on prevention and optimization.
      `.trim()
    }
  }
  
  private formatRootCauseAnalysis(rootCauses: any[]): string {
    return `
## Root Cause Analysis

${rootCauses.map((cause, index) => `
### ${index + 1}. ${cause.cause} (${cause.confidence} Confidence)

**Evidence:** ${cause.evidence}

**Affected Systems:** ${cause.systems.join(', ')}

**Timeline Position:** ${cause.timelinePosition.charAt(0).toUpperCase() + cause.timelinePosition.slice(1)} factor

**Clinical Significance:** ${this.getRootCauseSignificance(cause)}
`).join('\n')}

### Root Cause Hierarchy
${this.createRootCauseHierarchy(rootCauses)}

### Intervention Priority
Based on the root cause analysis, intervention should prioritize:
${this.prioritizeRootCauseInterventions(rootCauses)}
    `.trim()
  }
  
  private getRootCauseSignificance(cause: any): string {
    const significanceMap: { [key: string]: string } = {
      'Chronic Stress & HPA Axis Dysfunction': 'Primary driver affecting all other systems. Must be addressed for any lasting improvement.',
      'Impaired liver detoxification': 'Critical for hormone balance and toxin clearance. Affects multiple downstream processes.',
      'Chronic Inflammatory State': 'Accelerates aging and disease progression. Silent driver of most symptoms.',
      'Multiple Nutrient Deficiencies': 'Foundation for all cellular processes. Limits healing capacity.',
      'Intestinal dysbiosis/SIBO': 'Affects nutrient absorption, immune function, and neurotransmitter production.'
    }
    
    return significanceMap[cause.cause] || 'Contributing factor to overall dysfunction pattern.'
  }
  
  private createRootCauseHierarchy(causes: any[]): string {
    const initiating = causes.filter(c => c.timelinePosition === 'initiating')
    const triggering = causes.filter(c => c.timelinePosition === 'triggering')
    const perpetuating = causes.filter(c => c.timelinePosition === 'perpetuating')
    
    return `
**Initiating Factors** (started the process):
${initiating.map(c => `- ${c.cause}`).join('\n') || '- None identified'}

**Triggering Factors** (accelerated dysfunction):
${triggering.map(c => `- ${c.cause}`).join('\n') || '- None identified'}

**Perpetuating Factors** (maintaining the problem):
${perpetuating.map(c => `- ${c.cause}`).join('\n') || '- None identified'}
    `.trim()
  }
  
  private prioritizeRootCauseInterventions(causes: any[]): string {
    const priorities = causes
      .filter(c => c.confidence === 'HIGH')
      .slice(0, 3)
      .map((c, i) => `${i + 1}. ${c.cause} - ${this.getRootCauseIntervention(c.cause)}`)
    
    return priorities.join('\n')
  }
  
  private getRootCauseIntervention(cause: string): string {
    const interventionMap: { [key: string]: string } = {
      'Chronic Stress & HPA Axis Dysfunction': 'Adaptogenic support + stress management techniques',
      'Impaired liver detoxification': 'Liver support nutrients + reduce toxic burden',
      'Chronic Inflammatory State': 'Anti-inflammatory diet + targeted supplements',
      'Multiple Nutrient Deficiencies': 'Comprehensive supplementation + diet optimization',
      'Intestinal dysbiosis/SIBO': '4R gut healing protocol + specific antimicrobials'
    }
    
    return interventionMap[cause] || 'Targeted intervention based on testing'
  }
  
  private createSystemBreakdown(systemsAnalysis: any[], responses: NAQResponses): string {
    return `
## System-by-System Breakdown

${systemsAnalysis.map(system => `
### ${system.system} (Score: ${system.score}, Priority: ${system.priorityLevel.toUpperCase()})

**Interpretation:** ${system.interpretation}

**Connected Systems:** ${system.connections.join(', ') || 'None identified'}

**Specific Symptoms Present:**
${this.getSystemSpecificSymptoms(system.system, responses)}

**System-Specific Recommendations:**
${this.getSystemRecommendations(system)}
`).join('\n')}
    `.trim()
  }
  
  private getSystemSpecificSymptoms(systemName: string, responses: NAQResponses): string {
    // Map system names to symptom categories
    const symptomMap: { [key: string]: string[] } = {
      'Digestive': ['bloating', 'gas', 'constipation', 'diarrhea', 'heartburn'],
      'Energy Production': ['fatigue', 'afternoon_crash', 'weakness', 'poor_endurance'],
      'Hormonal': ['hot_flashes', 'night_sweats', 'mood_swings', 'irregular_periods'],
      'Brain/Nervous': ['brain_fog', 'memory_issues', 'anxiety', 'depression'],
      // Add more mappings as needed
    }
    
    const symptoms = symptomMap[systemName] || []
    const presentSymptoms = symptoms
      .filter(s => responses.answers[s] && typeof responses.answers[s] === 'number' && responses.answers[s] > 0)
      .map(s => `- ${s.replace(/_/g, ' ')}: severity ${responses.answers[s]}`)
    
    return presentSymptoms.length > 0 ? presentSymptoms.join('\n') : '- No specific symptoms tracked'
  }
  
  private getSystemRecommendations(system: any): string {
    const recommendationMap: { [key: string]: string[] } = {
      'critical': [
        '- Immediate intervention required',
        '- Consider emergency protocols if symptoms worsen',
        '- Weekly monitoring essential'
      ],
      'high': [
        '- Begin targeted interventions within 1 week',
        '- Focus significant resources on this system',
        '- Bi-weekly progress assessments'
      ],
      'moderate': [
        '- Address after stabilizing critical systems',
        '- Include in comprehensive protocol',
        '- Monthly progress review'
      ],
      'low': [
        '- Monitor for changes',
        '- Address through general health optimization',
        '- Quarterly assessment'
      ]
    }
    
    return recommendationMap[system.priorityLevel]?.join('\n') || '- Continue monitoring'
  }
  
  private formatInterventionProtocol(phases: InterventionPhase[]): InterventionProtocol {
    const priorityInterventions = phases[0]?.interventions
      .filter(i => i.type === 'supplement' || i.type === 'dietary')
      .slice(0, 5)
      .map(i => `${i.name}: ${i.details}`) || []
    
    const totalDuration = phases.reduce((acc, phase) => {
      const duration = parseInt(phase.duration) || 0
      return acc + duration
    }, 0)
    
    return {
      phases,
      priorityInterventions,
      expectedTimeline: `${totalDuration} weeks for full protocol (${Math.round(totalDuration / 4)} months)`
    }
  }
  
  private createRecommendations(
    patterns: NAQPattern[], 
    interpretation: FunctionalMedicineReport,
    burden: SymptomBurdenData
  ): {
    supplements: SupplementProtocol,
    dietary: DietaryProtocol,
    lifestyle: LifestyleProtocol,
    driverSpecific: any
  } {
    const supplements = this.createSupplementProtocol(interpretation.interventionStrategy)
    const dietary = this.createDietaryProtocol(patterns, burden)
    const lifestyle = this.createLifestyleProtocol(patterns, burden)
    const driverSpecific = interpretation.truckDriverConsiderations.roadCompatibleInterventions
    
    return { supplements, dietary, lifestyle, driverSpecific }
  }
  
  private createSupplementProtocol(phases: InterventionPhase[]): SupplementProtocol {
    const immediate: SupplementRecommendation[] = []
    const shortTerm: SupplementRecommendation[] = []
    const longTerm: SupplementRecommendation[] = []
    
    phases.forEach((phase, index) => {
      phase.interventions
        .filter(i => i.type === 'supplement')
        .forEach(intervention => {
          const supplement: SupplementRecommendation = {
            name: intervention.name,
            dosage: this.extractDosage(intervention.details),
            timing: this.extractTiming(intervention.details),
            duration: phase.duration,
            rationale: intervention.rationale,
            truckDriverTip: intervention.truckDriverAdaptation
          }
          
          if (index === 0) immediate.push(supplement)
          else if (index === 1) shortTerm.push(supplement)
          else longTerm.push(supplement)
        })
    })
    
    return {
      immediate,
      shortTerm,
      longTerm,
      notes: `
**Important Notes:**
- Start supplements gradually to assess tolerance
- Take with food unless specified otherwise
- Store in cool, dry place (truck cab storage tips provided)
- Adjust timing based on driving schedule
- Consult with healthcare provider if on medications
      `.trim()
    }
  }
  
  private extractDosage(details: string): string {
    const dosageMatch = details.match(/(\d+\s*mg|\d+\s*g|\d+\s*IU|\d+\s*mcg)/i)
    return dosageMatch ? dosageMatch[1] : 'See details'
  }
  
  private extractTiming(details: string): string {
    if (details.toLowerCase().includes('morning')) return 'Morning with breakfast'
    if (details.toLowerCase().includes('evening') || details.toLowerCase().includes('bed')) return 'Evening/bedtime'
    if (details.toLowerCase().includes('meals')) return 'With meals'
    if (details.toLowerCase().includes('twice')) return 'Twice daily'
    return 'As directed'
  }
  
  private createDietaryProtocol(patterns: NAQPattern[], burden: SymptomBurdenData): DietaryProtocol {
    const hasGutIssues = burden.upperGI + burden.smallIntestine + burden.largeIntestine >= 8
    const hasInflammation = patterns.some(p => p.name.includes('Inflammation'))
    const hasHormoneIssues = patterns.some(p => p.name.includes('Hormone'))
    
    const elimination = []
    if (hasGutIssues) elimination.push('Gluten', 'Dairy', 'Processed foods')
    if (hasInflammation) elimination.push('Sugar', 'Refined oils', 'Alcohol')
    if (hasHormoneIssues) elimination.push('Soy', 'Conventional meat', 'Plastic-packaged foods')
    
    return {
      eliminationPhase: elimination,
      reintroductionPhase: [
        'Week 5-6: Test dairy (one serving every 3 days)',
        'Week 7-8: Test gluten (one serving every 3 days)',
        'Week 9-10: Test other eliminated foods individually'
      ],
      maintenancePhase: [
        '80/20 rule - 80% compliant, 20% flexibility',
        'Focus on whole, unprocessed foods',
        'Organic when possible, especially animal products',
        'Adequate protein at every meal',
        'Colorful vegetables at every meal'
      ],
      truckStopGuidelines: [
        '**Best Options:** Grilled chicken salads, hard-boiled eggs, rotisserie chicken',
        '**Protein:** Jerky (no sugar), protein bars (< 5g sugar), Greek yogurt',
        '**Vegetables:** Pre-cut veggies, bagged salads, vegetable cups',
        '**Healthy Fats:** Nuts, seeds, avocado cups, olive oil packets',
        '**Avoid:** Fried foods, sodas, energy drinks, processed meats'
      ],
      mealPlanExample: {
        breakfast: [
          'Option 1: 3 eggs + spinach + avocado',
          'Option 2: Greek yogurt + berries + nuts',
          'Option 3: Protein smoothie with greens'
        ],
        lunch: [
          'Large salad with grilled protein',
          'Leftover dinner protein + vegetables',
          'Soup (bone broth based) + side salad'
        ],
        dinner: [
          'Grilled/baked protein (6-8 oz)',
          '2 cups non-starchy vegetables',
          'Small serving complex carbs if tolerated'
        ],
        snacks: [
          'Apple + almond butter',
          'Vegetables + hummus',
          'Hard-boiled eggs',
          'Protein bar (approved brands)'
        ]
      }
    }
  }
  
  private createLifestyleProtocol(patterns: NAQPattern[], burden: SymptomBurdenData): LifestyleProtocol {
    return {
      sleep: [
        'Consistent sleep schedule (even on different shifts)',
        'Blackout curtains for sleeper cab',
        'White noise machine or app',
        'No screens 1 hour before sleep',
        'Magnesium glycinate 400mg before bed',
        'Temperature control (cool is better)'
      ],
      exercise: [
        '10,000 steps daily (use truck stops for walking)',
        'Resistance band exercises in cab (15 min daily)',
        'Stretching routine every 2 hours while driving',
        'Bodyweight exercises during loading/unloading',
        'Weekend: 30-45 min moderate cardio'
      ],
      stressManagement: [
        '4-7-8 breathing technique (3x daily)',
        'Meditation app (10 min daily)',
        'Gratitude journal (3 items nightly)',
        'Regular phone calls with family/friends',
        'Nature exposure when possible',
        'Limit news/social media consumption'
      ],
      environmental: [
        'Air purifier for sleeper cab',
        'BPA-free water bottles only',
        'Natural cleaning products',
        'Organic bedding when possible',
        'Minimize diesel exhaust exposure',
        'Park away from other idling trucks when sleeping'
      ]
    }
  }
  
  private formatDriverAdvice(driverInsights: any): string {
    return `
## Truck Driver-Specific Recommendations

### DOT Medical Certification Risks
${driverInsights.dotMedicalRisks.map((risk: any) => `
**${risk.condition}**
- Impact Level: ${risk.dotImpact}
- Action Required: ${risk.recommendation}
- Timeline: ${risk.timeline}
`).join('\n')}

### Occupational Factors Affecting Health
${driverInsights.occupationalFactors.map((factor: string) => `- ${factor}`).join('\n')}

### Road-Compatible Health Solutions
${driverInsights.roadCompatibleInterventions.map((intervention: any) => `
**${intervention.name}**
- ${intervention.details}
- Driver Tip: ${intervention.truckDriverAdaptation || 'See main protocol'}
`).join('\n')}

### Career Longevity Assessment
- **Current Viability:** ${driverInsights.careerLongevityAssessment.currentViability}%
- **Projected Viability (with intervention):** ${driverInsights.careerLongevityAssessment.projectedViability}%

**Critical Factors:**
${driverInsights.careerLongevityAssessment.criticalFactors.map((f: string) => `- ${f}`).join('\n')}

**Recommendations for Career Sustainability:**
${driverInsights.careerLongevityAssessment.recommendations.map((r: string) => `- ${r}`).join('\n')}
    `.trim()
  }
  
  private formatFollowUpPlan(followUp: any): string {
    return `
## Follow-Up Recommendations

### Immediate Actions (Week 1)
${followUp.immediateActions.map((action: string) => `☐ ${action}`).join('\n')}

### Recommended Lab Tests
${followUp.labTests.map((test: any) => `
**${test.test}**
- Rationale: ${test.rationale}
- Key Markers: ${test.markers.join(', ')}
- Timing: ${test.timing}
`).join('\n')}

### Progress Timeline
${followUp.timeline.map((item: any) => `
**Week ${item.week}:**
Actions:
${item.actions.map((a: string) => `- ${a}`).join('\n')}

Expected Outcomes:
${item.expectedOutcomes.map((o: string) => `- ${o}`).join('\n')}
`).join('\n')}

### Reassessment Schedule
${followUp.reassessmentSchedule}

### Success Metrics
Track these indicators weekly:
- Energy levels (1-10 scale)
- Sleep quality (1-10 scale)
- Digestive comfort (1-10 scale)
- Mood stability (1-10 scale)
- Primary symptom severity

### When to Seek Immediate Help
Contact healthcare provider if experiencing:
- Chest pain or pressure
- Severe headaches
- Fainting or dizziness
- Significant worsening of symptoms
- Adverse reactions to supplements
    `.trim()
  }
  
  private generateVisualizations(burden: SymptomBurdenData, patterns: NAQPattern[]): ReportVisualizations {
    return {
      symptomBurdenChart: this.createSymptomBurdenChart(burden),
      patternConnectionsMap: this.createPatternConnectionsMap(patterns),
      interventionTimeline: this.createInterventionTimeline(patterns),
      systemScoreRadar: this.createSystemScoreRadar(burden)
    }
  }
  
  private createSymptomBurdenChart(burden: SymptomBurdenData): ChartData {
    const systems = [
      { name: 'Upper GI', value: burden.upperGI, max: 9 },
      { name: 'Small Intestine', value: burden.smallIntestine, max: 9 },
      { name: 'Large Intestine', value: burden.largeIntestine, max: 9 },
      { name: 'Liver/GB', value: burden.liverGB, max: 9 },
      { name: 'Cardiovascular', value: burden.cardiovascular, max: 9 },
      { name: 'Energy', value: burden.energyProduction, max: 9 },
      { name: 'Adrenal', value: burden.adrenal, max: 9 },
      { name: 'Reproductive', value: burden.femaleReprod || burden.maleReprod || 0, max: 12 }
    ]
    
    return {
      type: 'bar',
      data: {
        labels: systems.map(s => s.name),
        datasets: [{
          label: 'Symptom Burden',
          data: systems.map(s => s.value),
          backgroundColor: systems.map(s => {
            const percentage = s.value / s.max
            if (percentage >= 0.7) return '#ff4444'
            if (percentage >= 0.5) return '#ff8800'
            if (percentage >= 0.3) return '#ffbb33'
            return '#00C851'
          })
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Symptom Score' }
          }
        }
      }
    }
  }
  
  private createPatternConnectionsMap(patterns: NAQPattern[]): ConnectionData {
    const nodes = patterns.map((pattern, index) => ({
      id: index,
      label: pattern.name,
      size: pattern.confidence * 30,
      color: pattern.interventionPriority === 'immediate' ? '#ff4444' : 
             pattern.interventionPriority === 'high' ? '#ff8800' : '#ffbb33'
    }))
    
    const edges: any[] = []
    const connections = this.patternAnalyzer.identifyPatternConnections(patterns)
    
    connections.forEach((connected, patternName) => {
      const sourceIndex = patterns.findIndex(p => p.name === patternName)
      connected.forEach(connectedPattern => {
        const targetIndex = patterns.findIndex(p => p.name === connectedPattern)
        if (sourceIndex !== -1 && targetIndex !== -1) {
          edges.push({
            source: sourceIndex,
            target: targetIndex,
            value: 1
          })
        }
      })
    })
    
    return { nodes, edges }
  }
  
  private createInterventionTimeline(patterns: NAQPattern[]): TimelineData {
    const phases = [
      {
        name: 'Immediate Stabilization',
        start: 0,
        duration: 2,
        color: '#ff4444',
        interventions: patterns
          .filter(p => p.interventionPriority === 'immediate')
          .map(p => p.name)
      },
      {
        name: 'Root Cause Correction',
        start: 2,
        duration: 6,
        color: '#ff8800',
        interventions: patterns
          .filter(p => p.interventionPriority === 'high')
          .map(p => p.name)
      },
      {
        name: 'System Optimization',
        start: 8,
        duration: 8,
        color: '#ffbb33',
        interventions: ['All systems']
      },
      {
        name: 'Maintenance',
        start: 16,
        duration: null,
        color: '#00C851',
        interventions: ['Ongoing support']
      }
    ]
    
    const milestones = [
      { week: 2, label: '20% symptom reduction expected' },
      { week: 8, label: '50% symptom reduction expected' },
      { week: 16, label: '70%+ symptom reduction expected' }
    ]
    
    return { phases, milestones }
  }
  
  private createSystemScoreRadar(burden: SymptomBurdenData): RadarData {
    const categories = [
      'Digestive',
      'Energy',
      'Hormonal',
      'Detox',
      'Immune',
      'Nervous',
      'Metabolic',
      'Structural'
    ]
    
    const values = [
      (burden.upperGI + burden.smallIntestine + burden.largeIntestine) / 3,
      burden.energyProduction,
      ((burden.femaleReprod || 0) + (burden.maleReprod || 0) + burden.thyroid + burden.adrenal) / 3,
      (burden.liverGB + burden.kidneys) / 2,
      burden.immuneSystem,
      burden.brain,
      (burden.sugarHandling * 1.8), // Scale to match others
      burden.joints
    ]
    
    const maxValues = [9, 9, 9, 9, 9, 9, 9, 9]
    
    return { categories, values, maxValues }
  }
  
  private async generatePractitionerNotes(
    patterns: NAQPattern[],
    interpretation: FunctionalMedicineReport,
    burden: SymptomBurdenData,
    clientData: ClientData
  ): Promise<string> {
    try {
      const clinicalNotes = await this.clinicalNotesGenerator.generateClinicalNotes(
        {
          patterns,
          interpretation,
          burden,
          clientData
        },
        "Kevin Rutherford FNTP"
      )
      
      return clinicalNotes
    } catch (error) {
      console.error('[NAQ-REPORT-GENERATOR] Error generating AI clinical notes:', error)
      
      // Fallback to manual notes
      return this.generateManualPractitionerNotes(patterns, burden)
    }
  }
  
  private generateManualPractitionerNotes(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const topPattern = patterns[0]
    const hasHormoneMax = (burden.femaleReprod === 12 || burden.maleReprod === 12)
    
    return `
## Practitioner Notes

### Clinical Impression
${hasHormoneMax ? 
  `This is a textbook case of severe hormone imbalance with systemic suppression. The fact that 
  reproductive scores are maxed out (12/12) while all other systems show low scores (1-4) is 
  pathognomonic for estrogen dominance or severe hormone dysregulation. This pattern indicates 
  the endocrine system is hijacking resources from all other body systems.` :
  `The primary pattern of ${topPattern.name} is driving a cascade of dysfunction across multiple 
  systems. The symptom constellation suggests ${this.estimateChronicity(patterns)} of progressive 
  dysfunction that has now reached a tipping point.`}

### Hidden Patterns
${this.identifyHiddenClinicalPatterns(patterns, burden)}

### Intervention Strategy
${this.generateInterventionStrategy(patterns, burden)}

### Prognosis
With proper adherence to the protocol, I expect:
- 20-30% improvement in 2-4 weeks
- 50% improvement in 6-8 weeks  
- 70-80% improvement in 12-16 weeks
- Full resolution possible in 6-12 months

### Red Flags to Monitor
${this.identifyRedFlags(burden)}

### Follow-Up Plan
- 2-week check-in: Assess tolerance and initial response
- 4-week comprehensive review: Adjust protocols based on progress
- 8-week reassessment: Consider advanced testing if needed
- 12-week NAQ retest: Quantify improvement

### Notes for Next Visit
- Review supplement compliance
- Assess dietary adherence
- Check for any adverse reactions
- Consider additional testing based on response
- Evaluate need for referrals
    `.trim()
  }
  
  private identifyHiddenClinicalPatterns(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const hidden: string[] = []
    
    // Pattern-specific hidden insights
    if (burden.brain >= 4 && burden.energyProduction >= 4) {
      hidden.push("Likely methylation dysfunction - consider MTHFR testing")
    }
    
    if (burden.immuneSystem >= 5 && burden.energyProduction >= 5) {
      hidden.push("Possible chronic infection or viral reactivation")
    }
    
    if (burden.upperGI >= 4 && burden.skin >= 3) {
      hidden.push("Hidden food sensitivities driving systemic inflammation")
    }
    
    return hidden.length > 0 ? hidden.join('\n') : "No additional hidden patterns identified"
  }
  
  private generateInterventionStrategy(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const strategies: string[] = []
    
    if (patterns[0].interventionPriority === 'immediate') {
      strategies.push("Start with crisis stabilization - this case requires immediate intervention")
    }
    
    if (patterns.length >= 3) {
      strategies.push("Multi-system approach required - single interventions will not suffice")
    }
    
    if (burden.liverGB >= 5) {
      strategies.push("Detox support critical - liver cannot handle current toxic load")
    }
    
    return strategies.join('\n')
  }
  
  private identifyRedFlags(burden: SymptomBurdenData): string {
    const redFlags: string[] = []
    
    if (burden.cardiovascular >= 6) redFlags.push("- Cardiovascular symptoms require immediate medical evaluation")
    if (burden.sugarHandling >= 4) redFlags.push("- Blood sugar dysregulation approaching diabetic range")
    if (burden.brain >= 7) redFlags.push("- Neurological symptoms warrant comprehensive evaluation")
    
    return redFlags.length > 0 ? redFlags.join('\n') : "- No immediate red flags identified"
  }
  
  private estimateChronicity(patterns: NAQPattern[]): string {
    const hasAdvanced = patterns.some(p => 
      p.name.includes('Mitochondrial') || p.name.includes('HPA') && p.confidence > 0.8
    )
    
    if (hasAdvanced) return "3-5 years"
    if (patterns.length >= 3) return "2-3 years"
    return "1-2 years"
  }
  
  private createMetadata(patterns: NAQPattern[], responses: NAQResponses): ReportMetadata {
    const totalQuestions = Object.keys(responses.answers).length
    const answeredQuestions = Object.values(responses.answers).filter(v => v !== null && v !== undefined).length
    const dataCompleteness = (answeredQuestions / totalQuestions) * 100
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
    
    return {
      generatedAt: new Date(),
      reportVersion: '2.0',
      confidence: avgConfidence,
      dataCompleteness
    }
  }
}

export default NAQReportGenerator