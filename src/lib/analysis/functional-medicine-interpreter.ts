// Functional Medicine Interpreter for NAQ Analysis
// Converts patterns into clinical insights and actionable protocols

import { NAQPattern, SymptomBurdenData } from './naq-pattern-analyzer'

export interface NAQAnswers {
  [key: string]: number | string | boolean
}

export interface RootCause {
  cause: string
  confidence: 'HIGH' | 'MODERATE' | 'LOW'
  evidence: string
  systems: string[]
  timelinePosition: 'initiating' | 'perpetuating' | 'triggering'
}

export interface ClinicalInsight {
  insight: string
  supportingEvidence: string[]
  clinicalPearl: string
  references?: string[]
}

export interface InterventionPhase {
  phase: string
  duration: string
  goals: string[]
  interventions: Intervention[]
  successMetrics: string[]
}

export interface Intervention {
  type: 'supplement' | 'dietary' | 'lifestyle' | 'testing' | 'referral'
  name: string
  details: string
  rationale: string
  truckDriverAdaptation?: string
}

export interface FunctionalMedicineReport {
  executiveSummary: string
  rootCauseAnalysis: RootCause[]
  systemsAnalysis: SystemAnalysis[]
  clinicalPearls: ClinicalInsight[]
  interventionStrategy: InterventionPhase[]
  truckDriverConsiderations: TruckDriverInsights
  followUpRecommendations: FollowUpPlan
}

export interface SystemAnalysis {
  system: string
  score: number
  interpretation: string
  connections: string[]
  priorityLevel: 'critical' | 'high' | 'moderate' | 'low'
}

export interface TruckDriverInsights {
  dotMedicalRisks: DOTRisk[]
  occupationalFactors: string[]
  roadCompatibleInterventions: Intervention[]
  careerLongevityAssessment: CareerAssessment
}

export interface DOTRisk {
  condition: string
  dotImpact: 'HIGH' | 'MODERATE' | 'LOW'
  recommendation: string
  timeline: string
}

export interface CareerAssessment {
  currentViability: number // 0-100
  projectedViability: number // 0-100 with intervention
  criticalFactors: string[]
  recommendations: string[]
}

export interface FollowUpPlan {
  immediateActions: string[]
  labTests: LabTest[]
  timeline: TimelineItem[]
  reassessmentSchedule: string
}

export interface LabTest {
  test: string
  rationale: string
  markers: string[]
  timing: string
}

export interface TimelineItem {
  week: number
  actions: string[]
  expectedOutcomes: string[]
}

export class FunctionalMedicineInterpreter {
  
  generateInterpretation(
    symptomBurden: SymptomBurdenData, 
    patterns: NAQPattern[],
    clientAnswers: NAQAnswers = {}
  ): FunctionalMedicineReport {
    
    return {
      executiveSummary: this.createExecutiveSummary(symptomBurden, patterns),
      rootCauseAnalysis: this.identifyRootCauses(patterns, clientAnswers, symptomBurden),
      systemsAnalysis: this.analyzeBodySystems(symptomBurden, patterns),
      clinicalPearls: this.generateClinicalInsights(patterns, symptomBurden),
      interventionStrategy: this.createInterventionPlan(patterns, symptomBurden),
      truckDriverConsiderations: this.generateDriverSpecificInsights(patterns, symptomBurden),
      followUpRecommendations: this.createFollowUpPlan(patterns, symptomBurden)
    }
  }
  
  private createExecutiveSummary(data: SymptomBurdenData, patterns: NAQPattern[]): string {
    const topPattern = patterns[0]
    const totalBurden = data.totalBurden
    const healthStatus = this.getHealthStatus(totalBurden)
    const trajectory = this.assessHealthTrajectory(patterns, data)
    
    return `
## Executive Summary

**Overall Health Status:** ${healthStatus}
**Total Symptom Burden:** ${totalBurden}/321 (${Math.round(totalBurden/321 * 100)}%)
**Primary Pattern:** ${topPattern.name} (${Math.round(topPattern.confidence * 100)}% confidence)
**Health Trajectory:** ${trajectory}

### Key Findings
This assessment reveals **${patterns.length} significant functional medicine patterns** requiring attention. The primary concern is **${topPattern.name.toLowerCase()}**, which is affecting ${topPattern.affectedSystems.length} body systems and likely driving many of the presenting symptoms.

### Critical Systems Affected
${this.getTopAffectedSystems(data).map(s => `- **${s.system}:** ${s.score}/${s.max} (${s.severity})`).join('\n')}

### Immediate Concerns
${patterns
  .filter(p => p.interventionPriority === 'immediate')
  .map(p => `- ${p.name}: ${p.keyIndicators[0]}`)
  .join('\n') || '- No patterns requiring immediate intervention'}

### Clinical Impression
${this.generateClinicalImpression(patterns, data)}
    `.trim()
  }
  
  private identifyRootCauses(patterns: NAQPattern[], answers: NAQAnswers, burden: SymptomBurdenData): RootCause[] {
    const rootCauses: RootCause[] = []
    
    // Analyze patterns for common root causes
    const rootCauseMap = new Map<string, { count: number, patterns: string[], systems: Set<string> }>()
    
    patterns.forEach(pattern => {
      pattern.rootCauseHierarchy.forEach(cause => {
        if (!rootCauseMap.has(cause)) {
          rootCauseMap.set(cause, { count: 0, patterns: [], systems: new Set() })
        }
        const entry = rootCauseMap.get(cause)!
        entry.count++
        entry.patterns.push(pattern.name)
        pattern.affectedSystems.forEach(system => entry.systems.add(system))
      })
    })
    
    // Convert to RootCause objects
    rootCauseMap.forEach((data, cause) => {
      rootCauses.push({
        cause,
        confidence: data.count >= 3 ? 'HIGH' : data.count >= 2 ? 'MODERATE' : 'LOW',
        evidence: `Identified in ${data.count} patterns: ${data.patterns.join(', ')}`,
        systems: Array.from(data.systems),
        timelinePosition: this.determineTimelinePosition(cause, patterns)
      })
    })
    
    // Add specific root causes based on symptom analysis
    if (this.hasChronicStressPattern(burden)) {
      rootCauses.push({
        cause: "Chronic Stress & HPA Axis Dysfunction",
        confidence: "HIGH",
        evidence: "Multiple stress-related symptoms across systems",
        systems: ["Adrenal", "Thyroid", "Digestive", "Immune", "Cardiovascular"],
        timelinePosition: 'initiating'
      })
    }
    
    if (this.hasProInflammatoryPattern(burden)) {
      rootCauses.push({
        cause: "Chronic Inflammatory State",
        confidence: "HIGH",
        evidence: "Systemic inflammation markers across multiple systems",
        systems: ["Immune", "Cardiovascular", "Digestive", "Joint/Muscle", "Brain"],
        timelinePosition: 'perpetuating'
      })
    }
    
    if (this.hasNutrientDepletionPattern(burden)) {
      rootCauses.push({
        cause: "Multiple Nutrient Deficiencies",
        confidence: "HIGH",
        evidence: "Energy, mood, and cognitive symptoms suggesting nutrient depletion",
        systems: ["Energy Production", "Brain", "Immune", "Cardiovascular"],
        timelinePosition: 'perpetuating'
      })
    }
    
    // Sort by confidence and timeline position
    return rootCauses.sort((a, b) => {
      const confidenceOrder = { HIGH: 0, MODERATE: 1, LOW: 2 }
      const timelineOrder = { initiating: 0, triggering: 1, perpetuating: 2 }
      
      const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
      if (confDiff !== 0) return confDiff
      
      return timelineOrder[a.timelinePosition] - timelineOrder[b.timelinePosition]
    })
  }
  
  private analyzeBodySystems(burden: SymptomBurdenData, patterns: NAQPattern[]): SystemAnalysis[] {
    const systems: SystemAnalysis[] = []
    
    // Define system mappings with max scores
    const systemMap = [
      { name: 'Upper GI', key: 'upperGI', max: 9 },
      { name: 'Small Intestine', key: 'smallIntestine', max: 9 },
      { name: 'Large Intestine', key: 'largeIntestine', max: 9 },
      { name: 'Liver/Gallbladder', key: 'liverGB', max: 9 },
      { name: 'Kidneys', key: 'kidneys', max: 9 },
      { name: 'Cardiovascular', key: 'cardiovascular', max: 9 },
      { name: 'Immune System', key: 'immuneSystem', max: 9 },
      { name: 'Energy Production', key: 'energyProduction', max: 9 },
      { name: 'Thyroid', key: 'thyroid', max: 7 },
      { name: 'Adrenal', key: 'adrenal', max: 9 },
      { name: 'Female Reproductive', key: 'femaleReprod', max: 12 },
      { name: 'Male Reproductive', key: 'maleReprod', max: 12 },
      { name: 'Sugar Handling', key: 'sugarHandling', max: 5 },
      { name: 'Joints/Muscles', key: 'joints', max: 9 },
      { name: 'Skin', key: 'skin', max: 7 },
      { name: 'Brain/Nervous', key: 'brain', max: 9 }
    ]
    
    systemMap.forEach(({ name, key, max }) => {
      const score = burden[key as keyof SymptomBurdenData] as number || 0
      if (score > 0 || this.isSystemAffectedByPatterns(name, patterns)) {
        const analysis = this.createSystemAnalysis(name, score, max, patterns, burden)
        systems.push(analysis)
      }
    })
    
    // Sort by priority level and score
    return systems.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, moderate: 2, low: 3 }
      const priorityDiff = priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel]
      if (priorityDiff !== 0) return priorityDiff
      return b.score - a.score
    })
  }
  
  private createSystemAnalysis(
    systemName: string, 
    score: number, 
    maxScore: number,
    patterns: NAQPattern[],
    burden: SymptomBurdenData
  ): SystemAnalysis {
    const percentage = score / maxScore
    const priorityLevel = this.getSystemPriority(percentage, systemName, patterns)
    const connections = this.findSystemConnections(systemName, patterns, burden)
    
    return {
      system: systemName,
      score,
      interpretation: this.interpretSystemScore(systemName, score, maxScore, patterns),
      connections,
      priorityLevel
    }
  }
  
  private interpretSystemScore(system: string, score: number, max: number, patterns: NAQPattern[]): string {
    const percentage = score / max
    const severity = this.getSeverity(percentage)
    
    // System-specific interpretations
    const interpretations: { [key: string]: string } = {
      'Energy Production': `Score ${score}/${max} (${severity}) indicates ${
        percentage >= 0.5 ? 'significant mitochondrial dysfunction' : 
        percentage >= 0.3 ? 'moderate cellular energy compromise' : 
        'mild energy production issues'
      }. This affects ATP production, exercise tolerance, and cognitive function.`,
      
      'Adrenal': `Score ${score}/${max} (${severity}) suggests ${
        percentage >= 0.5 ? 'advanced adrenal dysfunction/exhaustion phase' :
        percentage >= 0.3 ? 'moderate HPA axis dysregulation' :
        'early stage stress response dysfunction'
      }. Impacts cortisol rhythm, stress resilience, and energy stability.`,
      
      'Liver/Gallbladder': `Score ${score}/${max} (${severity}) indicates ${
        percentage >= 0.5 ? 'significant detoxification impairment' :
        percentage >= 0.3 ? 'moderate liver/gallbladder congestion' :
        'mild detox pathway sluggishness'
      }. Affects hormone metabolism, toxin clearance, and fat digestion.`,
      
      'Sugar Handling': `Score ${score}/${max} (${severity}) reveals ${
        percentage >= 0.6 ? 'significant blood sugar dysregulation/pre-diabetes' :
        percentage >= 0.4 ? 'moderate insulin resistance' :
        'early glucose metabolism issues'
      }. Critical for DOT certification and metabolic health.`
    }
    
    // Add pattern context
    const relevantPatterns = patterns.filter(p => 
      p.affectedSystems.some(s => s.toLowerCase().includes(system.toLowerCase()))
    )
    
    let interpretation = interpretations[system] || 
      `Score ${score}/${max} (${severity}) indicates ${severity.toLowerCase()} dysfunction in this system.`
    
    if (relevantPatterns.length > 0) {
      interpretation += ` Contributing to: ${relevantPatterns.map(p => p.name).join(', ')}.`
    }
    
    return interpretation
  }
  
  private generateClinicalInsights(patterns: NAQPattern[], burden: SymptomBurdenData): ClinicalInsight[] {
    const insights: ClinicalInsight[] = []
    
    // Pattern-specific insights
    patterns.forEach(pattern => {
      insights.push(this.generatePatternInsight(pattern, burden))
    })
    
    // Cross-pattern insights
    if (patterns.length >= 2) {
      insights.push(this.generateCrossPatternInsight(patterns, burden))
    }
    
    // Hidden pattern insights
    const hiddenPatterns = this.identifyHiddenPatterns(patterns, burden)
    if (hiddenPatterns.length > 0) {
      insights.push(...hiddenPatterns)
    }
    
    return insights
  }
  
  private generatePatternInsight(pattern: NAQPattern, burden: SymptomBurdenData): ClinicalInsight {
    const insightMap: { [key: string]: () => ClinicalInsight } = {
      'Sex Hormone Imbalance': () => ({
        insight: "Hormone imbalance is likely the lynchpin driving multiple symptoms",
        supportingEvidence: [
          `Reproductive system maximally elevated (${burden.femaleReprod || burden.maleReprod}/12)`,
          `Liver involvement (${burden.liverGB}/9) compromising hormone clearance`,
          "Pattern of systemic suppression suggests hormone dominance"
        ],
        clinicalPearl: "When all systems are low except reproductive, think estrogen dominance first. The body prioritizes reproduction even at the expense of other functions.",
        references: ["Functional Medicine approach to hormone balance", "Environmental Working Group - Xenoestrogens"]
      }),
      
      'HPA Axis Dysfunction': () => ({
        insight: "Classic progression from alarm to exhaustion phase of stress response",
        supportingEvidence: [
          `Adrenal score (${burden.adrenal}/9) with thyroid involvement`,
          "Energy production compromise indicates cellular impact",
          "Pattern suggests 2+ years of chronic stress"
        ],
        clinicalPearl: "In truck drivers, check morning cortisol first - if low, they're already in exhaustion phase. Night drivers often have completely inverted cortisol rhythm.",
        references: ["Adrenal Fatigue: The 21st Century Stress Syndrome - Wilson"]
      }),
      
      'Gut-Brain Axis Disruption': () => ({
        insight: "Gut dysfunction is driving neurological symptoms through multiple pathways",
        supportingEvidence: [
          "Significant GI dysfunction across all segments",
          "Brain symptoms confirm bidirectional disruption",
          "Pattern consistent with SIBO/dysbiosis"
        ],
        clinicalPearl: "The saying 'all disease begins in the gut' is especially true here. Fix the gut first, and watch brain symptoms improve within 2-3 weeks.",
        references: ["The Gut-Brain Axis in Health and Disease - Mayer"]
      })
    }
    
    return insightMap[pattern.name]?.() || {
      insight: `${pattern.name} is significantly impacting health`,
      supportingEvidence: pattern.keyIndicators,
      clinicalPearl: "Address root causes systematically for best outcomes"
    }
  }
  
  private generateCrossPatternInsight(patterns: NAQPattern[], burden: SymptomBurdenData): ClinicalInsight {
    // Look for pattern interactions
    const hasHormoneAndStress = patterns.some(p => p.name.includes('Hormone')) && 
                                patterns.some(p => p.name.includes('HPA'))
    
    if (hasHormoneAndStress) {
      return {
        insight: "Stress-hormone interaction creating a vicious cycle",
        supportingEvidence: [
          "HPA dysfunction stealing pregnenolone from sex hormone production",
          "Chronic stress increasing aromatase activity (more estrogen)",
          "Cortisol dysregulation worsening hormone symptoms"
        ],
        clinicalPearl: "You can't balance hormones without addressing stress. Start with adaptogenic support while working on both systems.",
        references: ["The Cortisol Connection - Talbott"]
      }
    }
    
    const hasGutAndInflammation = patterns.some(p => p.name.includes('Gut')) && 
                                  patterns.some(p => p.name.includes('Inflammation'))
    
    if (hasGutAndInflammation) {
      return {
        insight: "Intestinal permeability driving systemic inflammation",
        supportingEvidence: [
          "Gut dysfunction allowing endotoxin (LPS) translocation",
          "Systemic inflammation originating from gut",
          "Classic 'leaky gut syndrome' presentation"
        ],
        clinicalPearl: "The 4R protocol (Remove, Replace, Reinoculate, Repair) is essential here. L-glutamine and zinc carnosine can accelerate gut healing.",
        references: ["Intestinal Permeability and Systemic Inflammation - Fasano"]
      }
    }
    
    return {
      insight: "Multiple patterns creating complex symptom picture",
      supportingEvidence: patterns.map(p => `${p.name}: ${p.confidence.toFixed(2)} confidence`),
      clinicalPearl: "Address patterns in order of priority while supporting all affected systems"
    }
  }
  
  private identifyHiddenPatterns(patterns: NAQPattern[], burden: SymptomBurdenData): ClinicalInsight[] {
    const hidden: ClinicalInsight[] = []
    
    // Check for methylation issues
    if (burden.brain >= 4 && burden.energyProduction >= 4 && burden.mood >= 4) {
      hidden.push({
        insight: "Hidden pattern: Likely methylation dysfunction",
        supportingEvidence: [
          "Brain fog + fatigue + mood issues classic triad",
          "May have MTHFR or other methylation SNPs",
          "B vitamin deficiencies probable"
        ],
        clinicalPearl: "Start with methylated B vitamins (methyl-B12, methylfolate) at low doses. Watch for overmethylation symptoms.",
        references: ["Genetic Bypass - Van Konynenburg"]
      })
    }
    
    // Check for hidden infections
    if (burden.immuneSystem >= 5 && burden.energyProduction >= 5 && 
        patterns.every(p => p.name !== 'Chronic Systemic Inflammation')) {
      hidden.push({
        insight: "Hidden pattern: Possible chronic infection or reactivated virus",
        supportingEvidence: [
          "High immune burden without clear inflammation pattern",
          "Severe fatigue suggests infection burden",
          "Common in stressed individuals (EBV, CMV reactivation)"
        ],
        clinicalPearl: "Consider comprehensive stool analysis and viral panels. Support immune system while investigating.",
        references: ["Chronic Fatigue and Hidden Infections - Teitelbaum"]
      })
    }
    
    return hidden
  }
  
  private createInterventionPlan(patterns: NAQPattern[], burden: SymptomBurdenData): InterventionPhase[] {
    const phases: InterventionPhase[] = []
    
    // Phase 1: Immediate Stabilization (Weeks 1-2)
    phases.push({
      phase: "Immediate Stabilization",
      duration: "2 weeks",
      goals: [
        "Reduce acute symptoms",
        "Stabilize critical systems",
        "Establish foundation for healing",
        "Ensure DOT medical compliance"
      ],
      interventions: this.getImmediateInterventions(patterns, burden),
      successMetrics: [
        "20% reduction in primary symptoms",
        "Improved energy stability",
        "Better sleep quality",
        "Reduced crisis symptoms"
      ]
    })
    
    // Phase 2: Root Cause Correction (Weeks 3-8)
    phases.push({
      phase: "Root Cause Correction",
      duration: "6 weeks",
      goals: [
        "Address primary pattern root causes",
        "Restore system function",
        "Reduce inflammation",
        "Optimize detoxification"
      ],
      interventions: this.getRootCauseInterventions(patterns, burden),
      successMetrics: [
        "40% reduction in symptom burden",
        "Normalized energy patterns",
        "Improved biomarkers",
        "Enhanced stress resilience"
      ]
    })
    
    // Phase 3: System Optimization (Weeks 9-16)
    phases.push({
      phase: "System Optimization",
      duration: "8 weeks",
      goals: [
        "Fine-tune all systems",
        "Build resilience",
        "Prevent recurrence",
        "Optimize performance"
      ],
      interventions: this.getOptimizationInterventions(patterns, burden),
      successMetrics: [
        "60%+ symptom reduction",
        "Sustained energy",
        "Optimal biomarkers",
        "Improved quality of life"
      ]
    })
    
    // Phase 4: Maintenance & Prevention (Ongoing)
    phases.push({
      phase: "Maintenance & Prevention",
      duration: "Ongoing",
      goals: [
        "Maintain improvements",
        "Prevent pattern recurrence",
        "Support long-term health",
        "Ensure career longevity"
      ],
      interventions: this.getMaintenanceInterventions(patterns),
      successMetrics: [
        "Sustained symptom relief",
        "Consistent DOT certification",
        "High energy and performance",
        "Disease prevention"
      ]
    })
    
    return phases
  }
  
  private getImmediateInterventions(patterns: NAQPattern[], burden: SymptomBurdenData): Intervention[] {
    const interventions: Intervention[] = []
    
    // Universal immediate supports
    interventions.push({
      type: 'supplement',
      name: 'Comprehensive Multivitamin',
      details: 'High-quality multi with methylated B vitamins, 1 daily with breakfast',
      rationale: 'Addresses multiple nutrient deficiencies quickly',
      truckDriverAdaptation: 'Keep in truck cab, set phone reminder for daily dose'
    })
    
    interventions.push({
      type: 'supplement',
      name: 'Magnesium Glycinate',
      details: '400mg before bed',
      rationale: 'Supports 300+ enzyme systems, improves sleep, reduces stress',
      truckDriverAdaptation: 'Helps with leg cramps from driving, improves sleep quality in sleeper cab'
    })
    
    // Pattern-specific immediate interventions
    patterns.forEach(pattern => {
      if (pattern.interventionPriority === 'immediate') {
        interventions.push(...this.getPatternSpecificImmediate(pattern))
      }
    })
    
    // Critical system support
    if (burden.adrenal >= 6) {
      interventions.push({
        type: 'supplement',
        name: 'Adaptogenic Complex',
        details: 'Ashwagandha 600mg + Rhodiola 200mg, morning and noon',
        rationale: 'Urgent adrenal support to prevent further deterioration',
        truckDriverAdaptation: 'Take with breakfast and lunch - improves stress tolerance during driving'
      })
    }
    
    if (burden.sugarHandling >= 4) {
      interventions.push({
        type: 'dietary',
        name: 'Blood Sugar Stabilization Protocol',
        details: 'Protein with every meal, eliminate sugary drinks, eat every 3-4 hours',
        rationale: 'Prevent progression to diabetes, maintain DOT certification',
        truckDriverAdaptation: 'Pack protein bars, nuts, hard-boiled eggs. Replace energy drinks with green tea'
      })
    }
    
    return interventions
  }
  
  private getRootCauseInterventions(patterns: NAQPattern[], burden: SymptomBurdenData): Intervention[] {
    const interventions: Intervention[] = []
    
    // Address top pattern root causes
    const topPattern = patterns[0]
    topPattern.rootCauseHierarchy.slice(0, 3).forEach(cause => {
      interventions.push(...this.getInterventionsForRootCause(cause, burden))
    })
    
    // System-specific healing protocols
    if (burden.upperGI + burden.smallIntestine + burden.largeIntestine >= 10) {
      interventions.push({
        type: 'supplement',
        name: '4R Gut Healing Protocol',
        details: 'Remove (elimination diet), Replace (digestive enzymes), Reinoculate (probiotics), Repair (L-glutamine 5g daily)',
        rationale: 'Comprehensive gut restoration addressing root dysfunction',
        truckDriverAdaptation: 'Portable protocol: enzymes with meals, probiotics in cooler, L-glutamine in shaker bottle'
      })
    }
    
    if (burden.liverGB >= 5) {
      interventions.push({
        type: 'supplement',
        name: 'Liver Detox Support',
        details: 'NAC 600mg 2x daily, Milk Thistle 300mg 2x daily, Cruciferous vegetable extract',
        rationale: 'Support Phase I/II detoxification pathways',
        truckDriverAdaptation: 'Critical for processing diesel fume toxins. Take with meals to prevent nausea'
      })
    }
    
    return interventions
  }
  
  private getOptimizationInterventions(patterns: NAQPattern[], burden: SymptomBurdenData): Intervention[] {
    const interventions: Intervention[] = []
    
    // Advanced protocols for sustained improvement
    interventions.push({
      type: 'testing',
      name: 'Comprehensive Functional Testing',
      details: 'Organic acids, comprehensive stool analysis, advanced hormone panels',
      rationale: 'Fine-tune protocols based on objective data',
      truckDriverAdaptation: 'Schedule during home time, use at-home collection kits'
    })
    
    interventions.push({
      type: 'lifestyle',
      name: 'Circadian Rhythm Optimization',
      details: 'Blue light blocking glasses, consistent sleep schedule, morning sunlight exposure',
      rationale: 'Restore natural hormone and energy rhythms',
      truckDriverAdaptation: 'Essential for night drivers - use amber glasses 3 hours before sleep'
    })
    
    // Pattern-specific optimization
    patterns.forEach(pattern => {
      interventions.push(...this.getPatternOptimization(pattern))
    })
    
    return interventions
  }
  
  private getMaintenanceInterventions(patterns: NAQPattern[]): Intervention[] {
    return [
      {
        type: 'supplement',
        name: 'Core Maintenance Stack',
        details: 'Multivitamin, Omega-3 (2g), Vitamin D (2000IU), Probiotic',
        rationale: 'Prevent deficiencies and maintain improvements',
        truckDriverAdaptation: 'Simplified daily packet system for consistency'
      },
      {
        type: 'dietary',
        name: 'Anti-Inflammatory Diet',
        details: '80/20 rule: 80% whole foods, limit processed foods, increase vegetables',
        rationale: 'Long-term inflammation prevention',
        truckDriverAdaptation: 'Focus on truck-stop salads, rotisserie chicken, pre-cut vegetables'
      },
      {
        type: 'lifestyle',
        name: 'Stress Management Practice',
        details: '10 minutes daily meditation or breathing exercises',
        rationale: 'Prevent HPA axis dysfunction recurrence',
        truckDriverAdaptation: 'Use driving time for breathing exercises at red lights'
      }
    ]
  }
  
  private generateDriverSpecificInsights(patterns: NAQPattern[], burden: SymptomBurdenData): TruckDriverInsights {
    return {
      dotMedicalRisks: this.assessDOTRisks(burden, patterns),
      occupationalFactors: this.identifyOccupationalFactors(patterns),
      roadCompatibleInterventions: this.createRoadFriendlyProtocol(patterns, burden),
      careerLongevityAssessment: this.assessCareerSustainability(burden, patterns)
    }
  }
  
  private assessDOTRisks(burden: SymptomBurdenData, patterns: NAQPattern[]): DOTRisk[] {
    const risks: DOTRisk[] = []
    
    // Cardiovascular risk assessment
    if (burden.cardiovascular >= 3) {
      risks.push({
        condition: "Cardiovascular Risk",
        dotImpact: burden.cardiovascular >= 5 ? "HIGH" : "MODERATE",
        recommendation: "Immediate cardio workup: EKG, lipid panel, BP monitoring",
        timeline: burden.cardiovascular >= 5 ? "Within 1 week" : "Within 2-4 weeks"
      })
    }
    
    // Diabetes risk
    if (burden.sugarHandling >= 3) {
      risks.push({
        condition: "Blood Sugar Dysregulation",
        dotImpact: burden.sugarHandling >= 4 ? "HIGH" : "MODERATE",
        recommendation: "A1C testing, fasting glucose, consider CGM monitoring",
        timeline: "Test within 2 weeks, implement dietary changes immediately"
      })
    }
    
    // Sleep apnea risk (often comorbid with other patterns)
    if (burden.energyProduction >= 5 && burden.cardiovascular >= 3) {
      risks.push({
        condition: "Probable Sleep Apnea",
        dotImpact: "HIGH",
        recommendation: "Sleep study urgently needed",
        timeline: "Schedule within 2 weeks - major DOT certification risk"
      })
    }
    
    // Neurological concerns
    if (burden.brain >= 5) {
      risks.push({
        condition: "Cognitive/Neurological Impairment",
        dotImpact: "MODERATE",
        recommendation: "Cognitive assessment, B12/folate testing",
        timeline: "Address within 30 days for safety"
      })
    }
    
    return risks.sort((a, b) => {
      const impactOrder = { HIGH: 0, MODERATE: 1, LOW: 2 }
      return impactOrder[a.dotImpact] - impactOrder[b.dotImpact]
    })
  }
  
  private identifyOccupationalFactors(patterns: NAQPattern[]): string[] {
    const factors = new Set<string>()
    
    patterns.forEach(pattern => {
      if (pattern.truckDriverRelevance) {
        // Extract key occupational factors from the relevance text
        const relevanceFactors = [
          'Prolonged sitting',
          'Irregular sleep schedule',
          'Limited food options',
          'Diesel exhaust exposure',
          'Chronic stress from driving',
          'Limited exercise opportunities',
          'Irregular bathroom access',
          'Social isolation'
        ]
        
        relevanceFactors.forEach(factor => {
          if (pattern.truckDriverRelevance.toLowerCase().includes(factor.toLowerCase())) {
            factors.add(factor)
          }
        })
      }
    })
    
    return Array.from(factors)
  }
  
  private createRoadFriendlyProtocol(patterns: NAQPattern[], burden: SymptomBurdenData): Intervention[] {
    const interventions: Intervention[] = []
    
    // Portable supplement protocol
    interventions.push({
      type: 'supplement',
      name: 'Truck Cab Supplement Kit',
      details: 'Weekly pill organizer with AM/PM compartments, kept in cooler',
      rationale: 'Ensures consistency despite irregular schedule',
      truckDriverAdaptation: 'Pre-sort supplements during home time, use phone alarms for reminders'
    })
    
    // Road-friendly nutrition
    interventions.push({
      type: 'dietary',
      name: 'Highway Nutrition Strategy',
      details: `
        - Cooler essentials: Hard-boiled eggs, Greek yogurt, pre-cut veggies
        - Truck stop choices: Grilled chicken salads, rotisserie chicken, nuts
        - Avoid: Energy drinks, fried foods, excessive coffee
      `.trim(),
      rationale: 'Maintains blood sugar, reduces inflammation, supports healing',
      truckDriverAdaptation: 'Map healthy truck stops on regular routes, keep emergency protein bars'
    })
    
    // Exercise adaptation
    interventions.push({
      type: 'lifestyle',
      name: 'Driver Fitness Protocol',
      details: `
        - 5-minute stretches every 2 hours during DOT breaks
        - Resistance bands for in-cab strength training
        - Walking during loading/unloading
      `.trim(),
      rationale: 'Combats sitting effects, improves circulation, maintains muscle mass',
      truckDriverAdaptation: 'Use truck steps for calf raises, steering wheel for stretches'
    })
    
    // Sleep optimization for irregular schedules
    interventions.push({
      type: 'lifestyle',
      name: 'Sleeper Cab Sleep Protocol',
      details: `
        - Blackout curtains for cab
        - White noise machine or app
        - Consistent pre-sleep routine regardless of time
        - Melatonin 1-3mg (with doctor approval)
      `.trim(),
      rationale: 'Critical for hormone balance and recovery',
      truckDriverAdaptation: 'Park away from idling trucks, use sleep mask and earplugs'
    })
    
    return interventions
  }
  
  private assessCareerSustainability(burden: SymptomBurdenData, patterns: NAQPattern[]): CareerAssessment {
    // Calculate current viability score (0-100)
    const criticalSystems = ['cardiovascular', 'sugarHandling', 'brain', 'energyProduction']
    let viabilityScore = 100
    
    // Deduct points for critical system involvement
    criticalSystems.forEach(system => {
      const score = burden[system as keyof SymptomBurdenData] as number || 0
      const maxScore = system === 'sugarHandling' ? 5 : 9
      const percentage = score / maxScore
      if (percentage >= 0.6) viabilityScore -= 20
      else if (percentage >= 0.4) viabilityScore -= 10
      else if (percentage >= 0.2) viabilityScore -= 5
    })
    
    // Factor in pattern severity
    patterns.forEach(pattern => {
      if (pattern.interventionPriority === 'immediate') viabilityScore -= 10
      else if (pattern.interventionPriority === 'high') viabilityScore -= 5
    })
    
    const currentViability = Math.max(0, viabilityScore)
    
    // Project improvement with intervention
    const projectedViability = Math.min(95, currentViability + 30)
    
    const criticalFactors: string[] = []
    if (burden.cardiovascular >= 5) criticalFactors.push("Cardiovascular health threatening DOT certification")
    if (burden.sugarHandling >= 4) criticalFactors.push("Blood sugar approaching diabetic range")
    if (burden.brain >= 5) criticalFactors.push("Cognitive function affecting driving safety")
    if (burden.energyProduction >= 6) criticalFactors.push("Severe fatigue compromising alertness")
    
    const recommendations: string[] = [
      currentViability < 50 ? "Immediate medical intervention required" : "Proactive intervention recommended",
      "Implement phase 1 interventions within 1 week",
      "Schedule comprehensive health assessment",
      criticalFactors.length > 0 ? "Address critical factors before next DOT physical" : "Maintain preventive approach"
    ]
    
    return {
      currentViability,
      projectedViability,
      criticalFactors,
      recommendations
    }
  }
  
  private createFollowUpPlan(patterns: NAQPattern[], burden: SymptomBurdenData): FollowUpPlan {
    const immediateActions: string[] = []
    const labTests: LabTest[] = []
    const timeline: TimelineItem[] = []
    
    // Immediate actions based on patterns
    patterns.slice(0, 3).forEach(pattern => {
      if (pattern.interventionPriority === 'immediate') {
        immediateActions.push(`Start ${pattern.name} protocol immediately`)
      }
    })
    
    // Always include these immediate actions
    immediateActions.push(
      "Begin foundational supplement protocol",
      "Implement dietary modifications",
      "Schedule follow-up consultation in 2 weeks"
    )
    
    // Lab tests based on patterns
    if (patterns.some(p => p.name.includes('Hormone'))) {
      labTests.push({
        test: "Comprehensive Hormone Panel",
        rationale: "Baseline hormone levels for targeted therapy",
        markers: ["Estradiol", "Progesterone", "Testosterone", "DHEA-S", "Cortisol x4"],
        timing: "Week 1-2, early morning"
      })
    }
    
    if (patterns.some(p => p.name.includes('Metabolic'))) {
      labTests.push({
        test: "Metabolic Panel Plus",
        rationale: "Assess glucose metabolism and cardiovascular risk",
        markers: ["A1C", "Fasting insulin", "Lipid panel", "hsCRP", "Homocysteine"],
        timing: "Week 1, fasting"
      })
    }
    
    if (patterns.some(p => p.name.includes('Gut'))) {
      labTests.push({
        test: "Comprehensive Stool Analysis",
        rationale: "Identify dysbiosis, inflammation, and malabsorption",
        markers: ["Microbiome diversity", "Calprotectin", "Elastase", "Beta-glucuronidase"],
        timing: "Week 2-3"
      })
    }
    
    // Create timeline
    timeline.push({
      week: 1,
      actions: [
        "Start supplement protocol",
        "Implement dietary changes",
        "Schedule lab tests",
        "Begin stress management practice"
      ],
      expectedOutcomes: [
        "Improved energy stability",
        "Better sleep initiation",
        "Reduced acute symptoms"
      ]
    })
    
    timeline.push({
      week: 2,
      actions: [
        "Review lab results",
        "Adjust protocols based on response",
        "Add targeted supplements",
        "Increase movement/exercise"
      ],
      expectedOutcomes: [
        "20% symptom reduction",
        "Improved mood and clarity",
        "Better stress tolerance"
      ]
    })
    
    timeline.push({
      week: 4,
      actions: [
        "Comprehensive reassessment",
        "Fine-tune all protocols",
        "Address any new concerns",
        "Plan long-term strategy"
      ],
      expectedOutcomes: [
        "40% symptom reduction",
        "Established healthy routines",
        "Clear improvement trajectory"
      ]
    })
    
    return {
      immediateActions,
      labTests,
      timeline,
      reassessmentSchedule: "Full reassessment at 4 weeks, then monthly for 3 months"
    }
  }
  
  // Helper methods
  private getHealthStatus(totalBurden: number): string {
    const percentage = totalBurden / 321
    if (percentage >= 0.5) return "Critical - Immediate intervention required"
    if (percentage >= 0.35) return "Poor - Significant dysfunction present"
    if (percentage >= 0.25) return "Fair - Moderate dysfunction"
    if (percentage >= 0.15) return "Good - Mild dysfunction"
    return "Excellent - Minimal dysfunction"
  }
  
  private assessHealthTrajectory(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const immediateCount = patterns.filter(p => p.interventionPriority === 'immediate').length
    const highCount = patterns.filter(p => p.interventionPriority === 'high').length
    
    if (immediateCount >= 2) return "Rapidly declining - Urgent intervention critical"
    if (immediateCount >= 1 || highCount >= 2) return "Concerning - Requires immediate attention"
    if (highCount >= 1) return "Declining - Intervention recommended"
    return "Stable - Preventive measures advised"
  }
  
  private getTopAffectedSystems(data: SymptomBurdenData): Array<{system: string, score: number, max: number, severity: string}> {
    const systems = [
      { system: 'Energy Production', score: data.energyProduction, max: 9 },
      { system: 'Digestive', score: data.upperGI + data.smallIntestine + data.largeIntestine, max: 27 },
      { system: 'Hormonal', score: Math.max(data.femaleReprod || 0, data.maleReprod || 0), max: 12 },
      { system: 'Adrenal', score: data.adrenal, max: 9 },
      { system: 'Liver/Detox', score: data.liverGB, max: 9 },
      { system: 'Cardiovascular', score: data.cardiovascular, max: 9 }
    ]
    
    return systems
      .map(s => ({
        ...s,
        severity: this.getSeverity(s.score / s.max)
      }))
      .sort((a, b) => (b.score / b.max) - (a.score / a.max))
      .slice(0, 3)
  }
  
  private getSeverity(percentage: number): string {
    if (percentage >= 0.75) return "SEVERE"
    if (percentage >= 0.5) return "MODERATE-SEVERE"
    if (percentage >= 0.35) return "MODERATE"
    if (percentage >= 0.2) return "MILD-MODERATE"
    return "MILD"
  }
  
  private generateClinicalImpression(patterns: NAQPattern[], data: SymptomBurdenData): string {
    const topPattern = patterns[0]
    const totalSystems = Object.values(data).filter(v => typeof v === 'number' && v > 0).length
    
    return `This individual presents with a complex pattern of ${topPattern.name.toLowerCase()} 
affecting ${totalSystems} body systems. The pattern suggests ${this.estimateConditionDuration(patterns)} 
of progressive dysfunction. Without intervention, this will likely progress to chronic disease within 
${this.estimateProgressionTimeline(patterns)}. However, the presentation indicates good potential 
for recovery with targeted functional medicine intervention. Priority must be given to 
${topPattern.rootCauseHierarchy[0].toLowerCase()} while supporting all affected systems.`
  }
  
  private estimateConditionDuration(patterns: NAQPattern[]): string {
    const hasAdvancedPatterns = patterns.some(p => 
      p.name.includes('HPA') || p.name.includes('Mitochondrial')
    )
    
    if (hasAdvancedPatterns) return "several years"
    if (patterns.length >= 3) return "1-2 years"
    return "6-12 months"
  }
  
  private estimateProgressionTimeline(patterns: NAQPattern[]): string {
    const criticalPatterns = patterns.filter(p => p.interventionPriority === 'immediate').length
    
    if (criticalPatterns >= 2) return "6-12 months"
    if (criticalPatterns >= 1) return "1-2 years"
    return "2-5 years"
  }
  
  private determineTimelinePosition(cause: string, patterns: NAQPattern[]): 'initiating' | 'perpetuating' | 'triggering' {
    const initiatingCauses = ['Chronic stress', 'Poor diet', 'Genetic predisposition']
    const triggeringCauses = ['Acute infection', 'Trauma', 'Major life event']
    
    if (initiatingCauses.some(c => cause.includes(c))) return 'initiating'
    if (triggeringCauses.some(c => cause.includes(c))) return 'triggering'
    return 'perpetuating'
  }
  
  private hasChronicStressPattern(burden: SymptomBurdenData): boolean {
    return burden.adrenal >= 4 && burden.energyProduction >= 4 && burden.brain >= 3
  }
  
  private hasProInflammatoryPattern(burden: SymptomBurdenData): boolean {
    return burden.joints >= 3 && burden.immuneSystem >= 3
  }
  
  private hasNutrientDepletionPattern(burden: SymptomBurdenData): boolean {
    return burden.energyProduction >= 4 && burden.brain >= 3
  }
  
  private isSystemAffectedByPatterns(systemName: string, patterns: NAQPattern[]): boolean {
    return patterns.some(p => 
      p.affectedSystems.some(s => s.toLowerCase().includes(systemName.toLowerCase()))
    )
  }
  
  private findSystemConnections(systemName: string, patterns: NAQPattern[], burden: SymptomBurdenData): string[] {
    const connections: string[] = []
    
    patterns.forEach(pattern => {
      if (pattern.affectedSystems.some(s => s.toLowerCase().includes(systemName.toLowerCase()))) {
        pattern.affectedSystems.forEach(affectedSystem => {
          if (!affectedSystem.toLowerCase().includes(systemName.toLowerCase()) && 
              !connections.includes(affectedSystem)) {
            connections.push(affectedSystem)
          }
        })
      }
    })
    
    return connections
  }
  
  private getSystemPriority(percentage: number, system: string, patterns: NAQPattern[]): 'critical' | 'high' | 'moderate' | 'low' {
    // Critical systems for truck drivers
    const criticalSystems = ['Cardiovascular', 'Sugar Handling', 'Brain/Nervous', 'Energy Production']
    
    if (criticalSystems.includes(system) && percentage >= 0.5) return 'critical'
    if (percentage >= 0.6) return 'critical'
    if (percentage >= 0.4) return 'high'
    if (percentage >= 0.25) return 'moderate'
    return 'low'
  }
  
  private getPatternSpecificImmediate(pattern: NAQPattern): Intervention[] {
    const interventions: Intervention[] = []
    
    const immediateMap: { [key: string]: Intervention[] } = {
      'Sex Hormone Imbalance': [
        {
          type: 'supplement',
          name: 'DIM (Diindolylmethane)',
          details: '200mg daily with food',
          rationale: 'Promotes healthy estrogen metabolism immediately',
          truckDriverAdaptation: 'Take with largest meal of the day'
        },
        {
          type: 'supplement',
          name: 'Calcium D-Glucarate',
          details: '500mg twice daily',
          rationale: 'Prevents estrogen recirculation through beta-glucuronidase inhibition',
          truckDriverAdaptation: 'Morning and evening doses with meals'
        }
      ],
      'HPA Axis Dysfunction': [
        {
          type: 'supplement',
          name: 'Phosphatidylserine',
          details: '300mg before bed',
          rationale: 'Reduces elevated evening cortisol',
          truckDriverAdaptation: 'Essential for night drivers to normalize cortisol'
        },
        {
          type: 'lifestyle',
          name: '4-7-8 Breathing Technique',
          details: 'Practice 3x daily: Inhale 4, Hold 7, Exhale 8 counts',
          rationale: 'Immediate vagal nerve activation for stress relief',
          truckDriverAdaptation: 'Perfect for traffic jams and loading dock waits'
        }
      ]
    }
    
    return immediateMap[pattern.name] || []
  }
  
  private getInterventionsForRootCause(cause: string, burden: SymptomBurdenData): Intervention[] {
    const interventions: Intervention[] = []
    
    const rootCauseMap: { [key: string]: Intervention[] } = {
      'Impaired liver detoxification': [
        {
          type: 'supplement',
          name: 'Liver Support Complex',
          details: 'NAC 600mg, Alpha-lipoic acid 300mg, Milk thistle 300mg daily',
          rationale: 'Comprehensive support for Phase I and II detoxification',
          truckDriverAdaptation: 'Single morning dose with breakfast for simplicity'
        },
        {
          type: 'dietary',
          name: 'Cruciferous Vegetable Challenge',
          details: '2 cups daily of broccoli, cauliflower, Brussels sprouts, or cabbage',
          rationale: 'Natural DIM and sulforaphane for detox support',
          truckDriverAdaptation: 'Pre-cut veggie packs, broccoli slaw, or supplement if needed'
        }
      ],
      'Chronic stress': [
        {
          type: 'supplement',
          name: 'Stress Response Formula',
          details: 'Holy basil 400mg, L-theanine 200mg, Magnesium 400mg',
          rationale: 'Multi-pathway stress modulation',
          truckDriverAdaptation: 'Take during most stressful part of route'
        },
        {
          type: 'lifestyle',
          name: 'Micro-Recovery Breaks',
          details: '2-minute stress reset every 2 hours: stretch, breathe, hydrate',
          rationale: 'Prevents stress accumulation throughout day',
          truckDriverAdaptation: 'Use DOT-mandated breaks for recovery'
        }
      ]
    }
    
    return rootCauseMap[cause] || []
  }
  
  private getPatternOptimization(pattern: NAQPattern): Intervention[] {
    // Return pattern-specific optimization protocols
    const optimizationMap: { [key: string]: Intervention[] } = {
      'Sex Hormone Imbalance': [
        {
          type: 'testing',
          name: 'DUTCH Complete Hormone Panel',
          details: 'Comprehensive hormone metabolites and patterns',
          rationale: 'Fine-tune hormone protocols with metabolite data',
          truckDriverAdaptation: 'At-home urine collection over 24 hours'
        }
      ],
      'Gut-Brain Axis Disruption': [
        {
          type: 'supplement',
          name: 'Targeted Probiotic Therapy',
          details: 'Strain-specific probiotics based on stool test results',
          rationale: 'Restore specific beneficial bacteria',
          truckDriverAdaptation: 'Shelf-stable strains that dont require refrigeration'
        }
      ]
    }
    
    return optimizationMap[pattern.name] || []
  }
}

export default FunctionalMedicineInterpreter