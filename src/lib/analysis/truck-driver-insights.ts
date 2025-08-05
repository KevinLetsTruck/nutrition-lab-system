// Truck Driver Health Analyzer
// Provides occupation-specific health insights and DOT medical considerations

import { NAQPattern, SymptomBurdenData } from './naq-pattern-analyzer'
import { DOTRisk, TruckDriverInsights, CareerAssessment, Intervention } from './functional-medicine-interpreter'

export class TruckDriverHealthAnalyzer {
  
  generateDriverSpecificInsights(
    patterns: NAQPattern[], 
    symptomBurden: SymptomBurdenData
  ): TruckDriverInsights {
    
    return {
      dotMedicalRisks: this.assessDOTRisks(symptomBurden, patterns),
      occupationalFactors: this.identifyOccupationalFactors(patterns, symptomBurden),
      roadCompatibleInterventions: this.createRoadFriendlyProtocol(patterns, symptomBurden),
      careerLongevityAssessment: this.assessCareerSustainability(symptomBurden, patterns)
    }
  }
  
  private assessDOTRisks(burden: SymptomBurdenData, patterns: NAQPattern[]): DOTRisk[] {
    const risks: DOTRisk[] = []
    
    // Cardiovascular risk - Primary DOT concern
    if (burden.cardiovascular >= 3) {
      const severity = burden.cardiovascular >= 5 ? "HIGH" : "MODERATE"
      risks.push({
        condition: "Cardiovascular Risk",
        dotImpact: severity,
        recommendation: severity === "HIGH" ? 
          "Immediate cardio workup required: EKG, stress test, lipid panel, BP monitoring" :
          "Schedule cardiovascular assessment within 30 days",
        timeline: severity === "HIGH" ? "Within 1 week - may affect current certification" : "Within 2-4 weeks"
      })
    }
    
    // Diabetes risk - Major DOT disqualifier
    if (burden.sugarHandling >= 3) {
      const severity = burden.sugarHandling >= 4 ? "HIGH" : "MODERATE"
      risks.push({
        condition: "Blood Sugar Dysregulation / Pre-Diabetes",
        dotImpact: severity,
        recommendation: `Urgent testing needed: A1C, fasting glucose, insulin levels. ${
          severity === "HIGH" ? "Consider continuous glucose monitoring (CGM)" : "Implement dietary changes immediately"
        }`,
        timeline: "Test within 1-2 weeks, dietary changes start immediately"
      })
    }
    
    // Sleep apnea risk - Common DOT issue
    const sleepApneaRisk = this.calculateSleepApneaRisk(burden, patterns)
    if (sleepApneaRisk > 0.5) {
      risks.push({
        condition: "Probable Sleep Apnea",
        dotImpact: "HIGH",
        recommendation: "Sleep study urgently needed. High correlation with symptoms: fatigue, brain fog, cardiovascular strain",
        timeline: "Schedule within 2 weeks - untreated sleep apnea is DOT disqualifying"
      })
    }
    
    // Neurological concerns
    if (burden.brain >= 5) {
      risks.push({
        condition: "Cognitive/Neurological Impairment",
        dotImpact: burden.brain >= 7 ? "HIGH" : "MODERATE",
        recommendation: "Comprehensive neurological assessment, B12/folate testing, consider brain MRI if severe",
        timeline: "Address within 2-4 weeks for driving safety"
      })
    }
    
    // Vision-related (often overlooked)
    if (patterns.some(p => p.name.includes('Metabolic')) && burden.sugarHandling >= 3) {
      risks.push({
        condition: "Diabetic Retinopathy Risk",
        dotImpact: "MODERATE",
        recommendation: "Comprehensive eye exam with dilation",
        timeline: "Within 60 days - early detection critical"
      })
    }
    
    // Kidney function (affects DOT if severe)
    if (burden.kidneys >= 5) {
      risks.push({
        condition: "Kidney Function Compromise",
        dotImpact: "MODERATE",
        recommendation: "Renal panel including eGFR, urinalysis",
        timeline: "Within 30 days"
      })
    }
    
    // Mental health (new DOT considerations)
    if (patterns.some(p => p.name.includes('HPA')) && burden.adrenal >= 6) {
      risks.push({
        condition: "Severe Stress/Mental Health Impact",
        dotImpact: "MODERATE",
        recommendation: "Mental health screening, stress management program",
        timeline: "Begin stress management immediately"
      })
    }
    
    return risks.sort((a, b) => {
      const impactOrder = { HIGH: 0, MODERATE: 1, LOW: 2 }
      return impactOrder[a.dotImpact] - impactOrder[b.dotImpact]
    })
  }
  
  private calculateSleepApneaRisk(burden: SymptomBurdenData, patterns: NAQPattern[]): number {
    let risk = 0
    
    // High energy dysfunction often indicates sleep issues
    if (burden.energyProduction >= 6) risk += 0.3
    
    // Cardiovascular involvement
    if (burden.cardiovascular >= 4) risk += 0.2
    
    // Brain fog and fatigue
    if (burden.brain >= 4) risk += 0.2
    
    // Metabolic dysfunction correlation
    if (burden.sugarHandling >= 3) risk += 0.2
    
    // Pattern indicators
    if (patterns.some(p => p.name.includes('Metabolic'))) risk += 0.1
    
    return Math.min(risk, 1.0)
  }
  
  private identifyOccupationalFactors(patterns: NAQPattern[], burden: SymptomBurdenData): string[] {
    const factors = new Set<string>()
    
    // Universal truck driver factors
    const universalFactors = [
      'Prolonged sitting (8-11 hours daily)',
      'Irregular sleep schedule affecting circadian rhythm',
      'Limited healthy food access on the road',
      'Chronic dehydration from limited bathroom access'
    ]
    
    universalFactors.forEach(f => factors.add(f))
    
    // Pattern-specific factors
    if (patterns.some(p => p.name.includes('Inflammation'))) {
      factors.add('Diesel exhaust exposure causing respiratory inflammation')
      factors.add('Vibration-induced joint and muscle stress')
    }
    
    if (patterns.some(p => p.name.includes('Metabolic'))) {
      factors.add('Sedentary profession accelerating insulin resistance')
      factors.add('Night driving disrupting metabolic hormones')
    }
    
    if (patterns.some(p => p.name.includes('HPA'))) {
      factors.add('Traffic stress and deadline pressure')
      factors.add('Social isolation affecting mental health')
      factors.add('Hypervigilance while driving maintaining stress response')
    }
    
    if (patterns.some(p => p.name.includes('Gut'))) {
      factors.add('Irregular eating schedule disrupting digestive rhythm')
      factors.add('Limited bathroom access affecting elimination')
      factors.add('Truck stop food promoting dysbiosis')
    }
    
    if (patterns.some(p => p.name.includes('Detox'))) {
      factors.add('Constant chemical exposure (diesel, cleaners, plastics)')
      factors.add('Limited water intake impairing kidney detox')
    }
    
    // Burden-specific factors
    if (burden.joints >= 4) {
      factors.add('Repetitive motion injuries from driving position')
      factors.add('Loading/unloading strain without proper warm-up')
    }
    
    if (burden.cardiovascular >= 3) {
      factors.add('Prolonged sitting reducing circulation')
      factors.add('High sodium truck stop meals affecting blood pressure')
    }
    
    return Array.from(factors)
  }
  
  private createRoadFriendlyProtocol(patterns: NAQPattern[], burden: SymptomBurdenData): Intervention[] {
    const interventions: Intervention[] = []
    
    // Core interventions adapted for trucking lifestyle
    
    // 1. Portable Supplement System
    interventions.push({
      type: 'supplement',
      name: 'Truck Cab Supplement System',
      details: `
Complete portable supplement organization:
- Weekly pill organizer with AM/LUNCH/PM/BED compartments
- Small cooler for probiotics and omega-3s
- Shaker bottle for powdered supplements
- Phone app reminders synced to driving schedule
      `.trim(),
      rationale: 'Ensures 90%+ compliance despite irregular schedule',
      truckDriverAdaptation: 'Pre-sort during home time, refill weekly. Keep backup supplies in truck.'
    })
    
    // 2. Highway Nutrition Protocol
    interventions.push({
      type: 'dietary',
      name: 'Strategic Road Nutrition',
      details: `
Cooler Essentials (restock 2x/week):
- Hard-boiled eggs (dozen)
- Greek yogurt (plain, full-fat)
- Pre-cut vegetables with hummus
- Rotisserie chicken (pre-portioned)
- Berries and apple slices

Truck Stop Strategy:
- Subway: Double meat salads, no bread
- Pilot/Flying J: Grilled chicken, salad bar
- Love's: Fresh fruit, protein boxes
- TA: Hot bar vegetables and grilled proteins

Emergency Shelf-Stable:
- Epic/RX/Chomps meat bars
- Macadamia nuts and walnuts
- Protein powder (grass-fed)
- Coconut oil packets
      `.trim(),
      rationale: 'Maintains blood sugar, reduces inflammation, supports all healing protocols',
      truckDriverAdaptation: 'Map healthy options on regular routes. Join trucker health groups for location tips.'
    })
    
    // 3. In-Cab Exercise Program
    interventions.push({
      type: 'lifestyle',
      name: 'Driver Fitness Protocol',
      details: `
DOT Break Routine (every 2-3 hours):
- 5 min walk around truck/rest area
- 20 truck step-ups (use bottom step)
- Resistance band pulls (anchor to truck)
- Neck and shoulder rolls

Daily In-Cab Routine (15 min):
Morning: Stretching sequence for back/hips
Afternoon: Resistance band strength circuit
Evening: Yoga for drivers (YouTube)

Weekly Goals:
- 10,000 steps (use rest areas aggressively)
- 3x resistance training
- Daily stretching
- Weekend longer walks/hikes
      `.trim(),
      rationale: 'Combats sitting damage, improves circulation, maintains muscle mass, reduces pain',
      truckDriverAdaptation: 'Equipment fits in small bag behind seat. No gym needed.'
    })
    
    // 4. Sleep Optimization for Irregular Schedules
    interventions.push({
      type: 'lifestyle',
      name: 'Sleeper Cab Sleep Protocol',
      details: `
Cab Setup:
- Blackout curtains (magnetic attachment)
- Memory foam mattress topper
- White noise machine (or app)
- Temperature control (68°F ideal)
- Blue light blocking glasses

Pre-Sleep Routine (30 min):
- No screens/paperwork
- Magnesium glycinate 400mg
- Chamomile tea or golden milk
- 4-7-8 breathing exercise
- Gentle stretching

Sleep Aids (natural only):
- Melatonin 1-3mg (30 min before)
- L-theanine 200mg
- Valerian root (if needed)

Day/Night Shift Adaptation:
- Consistent sleep duration (7-8 hours)
- Same routine regardless of time
- Dark period before sleep
- Light exposure upon waking
      `.trim(),
      rationale: 'Quality sleep is foundation for hormone balance, recovery, and DOT safety',
      truckDriverAdaptation: 'Park strategically away from noise. Idle reduction = better sleep + save fuel.'
    })
    
    // 5. Stress Management on the Road
    interventions.push({
      type: 'lifestyle',
      name: 'Highway Stress Reduction',
      details: `
Traffic Stress Management:
- 4-7-8 breathing at red lights
- Audiobooks/podcasts (educational)
- Call family/friends (hands-free)
- Stress-reducing music playlists

Daily Practice:
- Morning gratitude (3 things)
- Midday check-in meditation (5 min)
- Evening journaling (voice recorder)

Weekly:
- Virtual therapy session (if needed)
- Online trucker support group
- Nature exposure when possible
      `.trim(),
      rationale: 'Manages HPA axis dysfunction, improves mental health, enhances job satisfaction',
      truckDriverAdaptation: 'Use drive time productively for mental health. Traffic becomes meditation time.'
    })
    
    // Pattern-specific road interventions
    if (patterns.some(p => p.name.includes('Hormone'))) {
      interventions.push({
        type: 'supplement',
        name: 'Hormone Balance Travel Kit',
        details: 'DIM 200mg, Calcium D-Glucarate 500mg, Progesterone cream (if appropriate)',
        rationale: 'Portable hormone support that doesn\'t require refrigeration',
        truckDriverAdaptation: 'Keep in temperature-stable compartment, away from heat'
      })
    }
    
    if (patterns.some(p => p.name.includes('Gut'))) {
      interventions.push({
        type: 'dietary',
        name: 'Gut Healing Road Protocol',
        details: `
- Bone broth in thermos (sip throughout day)
- Digestive enzymes with meals
- Probiotic foods when available (kefir, sauerkraut)
- L-glutamine powder in water bottle
        `.trim(),
        rationale: 'Heals gut lining while managing road diet challenges',
        truckDriverAdaptation: 'Pre-make bone broth at home, freeze in portions'
      })
    }
    
    // 6. Environmental Protection
    if (burden.liverGB >= 4 || patterns.some(p => p.name.includes('Detox'))) {
      interventions.push({
        type: 'lifestyle',
        name: 'Toxin Reduction Protocol',
        details: `
- Cab air purifier (12V plugin)
- Natural hand wipes (no triclosan)
- Stainless steel water bottles only
- Organic bedding in sleeper
- Park upwind from other trucks
- Windows up in high-traffic areas
        `.trim(),
        rationale: 'Reduces toxic burden from diesel exhaust and chemicals',
        truckDriverAdaptation: 'Small investments with big health returns'
      })
    }
    
    return interventions
  }
  
  private assessCareerSustainability(burden: SymptomBurdenData, patterns: NAQPattern[]): CareerAssessment {
    // Calculate current viability score (0-100)
    let viabilityScore = 100
    
    // Critical systems for DOT certification
    const assessments = [
      { system: 'cardiovascular', weight: 25, threshold: 0.5 },
      { system: 'sugarHandling', weight: 20, threshold: 0.6 },
      { system: 'brain', weight: 15, threshold: 0.5 },
      { system: 'energyProduction', weight: 15, threshold: 0.6 },
      { system: 'kidneys', weight: 10, threshold: 0.6 },
      { system: 'immuneSystem', weight: 10, threshold: 0.6 },
      { system: 'joints', weight: 5, threshold: 0.7 }
    ]
    
    assessments.forEach(({ system, weight, threshold }) => {
      const score = burden[system as keyof SymptomBurdenData] as number || 0
      const maxScore = system === 'sugarHandling' ? 5 : 
                       system === 'thyroid' ? 7 : 
                       system === 'skin' ? 7 : 9
      const percentage = score / maxScore
      
      if (percentage >= threshold) {
        viabilityScore -= weight * (percentage / threshold)
      } else if (percentage >= threshold * 0.6) {
        viabilityScore -= weight * 0.5 * (percentage / threshold)
      }
    })
    
    // Factor in pattern severity
    patterns.forEach(pattern => {
      if (pattern.interventionPriority === 'immediate') {
        viabilityScore -= 10
      } else if (pattern.interventionPriority === 'high') {
        viabilityScore -= 5
      }
    })
    
    // Age and experience factors (would need client data)
    // Assume middle-aged driver for now
    viabilityScore -= 5 // Natural age-related decline
    
    const currentViability = Math.max(0, Math.round(viabilityScore))
    
    // Project improvement with intervention
    let improvementPotential = 30
    
    // Adjust based on pattern responsiveness
    if (patterns.some(p => p.name.includes('Gut'))) improvementPotential += 10
    if (patterns.some(p => p.name.includes('HPA'))) improvementPotential += 5
    if (patterns.some(p => p.name.includes('Metabolic'))) improvementPotential += 5
    
    // Limit improvement for severe cases
    if (currentViability < 30) improvementPotential = Math.min(improvementPotential, 40)
    
    const projectedViability = Math.min(95, currentViability + improvementPotential)
    
    // Identify critical factors
    const criticalFactors: string[] = []
    
    if (burden.cardiovascular >= 5) {
      criticalFactors.push("Cardiovascular health at critical level - immediate threat to DOT certification")
    }
    
    if (burden.sugarHandling >= 4) {
      criticalFactors.push("Blood sugar approaching diabetic range - 6-12 months to insulin dependence without intervention")
    }
    
    if (burden.brain >= 5) {
      criticalFactors.push("Cognitive function affecting reaction time and decision-making")
    }
    
    if (burden.energyProduction >= 6) {
      criticalFactors.push("Severe fatigue compromising driving safety and alertness")
    }
    
    if (patterns.some(p => p.name.includes('Sleep') || this.calculateSleepApneaRisk(burden, patterns) > 0.7)) {
      criticalFactors.push("High probability of sleep apnea - major DOT certification risk")
    }
    
    const totalBurden = burden.totalBurden
    if (totalBurden > 160) {
      criticalFactors.push("Overall symptom burden indicates systemic health crisis")
    }
    
    // Generate recommendations
    const recommendations: string[] = []
    
    if (currentViability < 50) {
      recommendations.push("Consider medical leave for intensive health restoration (2-4 weeks)")
      recommendations.push("Immediate medical evaluation required before next DOT physical")
    } else if (currentViability < 70) {
      recommendations.push("Implement Phase 1 interventions immediately while continuing to work")
      recommendations.push("Schedule comprehensive health assessment within 2 weeks")
    } else {
      recommendations.push("Proactive intervention recommended to prevent decline")
      recommendations.push("Focus on optimization and prevention strategies")
    }
    
    recommendations.push(
      "Join trucker health support group for accountability",
      "Consider team driving to reduce individual stress during recovery",
      "Evaluate routes for health-friendliness (rest areas, food options)",
      currentViability < 50 ? 
        "Prepare alternative career options if health doesn't improve" :
        "With proper intervention, 20+ year career sustainability achievable"
    )
    
    return {
      currentViability,
      projectedViability,
      criticalFactors,
      recommendations
    }
  }
  
  // Additional helper methods
  
  generateDOTPreparationPlan(burden: SymptomBurdenData, patterns: NAQPattern[]): string {
    const risks = this.assessDOTRisks(burden, patterns)
    const highRisks = risks.filter(r => r.dotImpact === 'HIGH')
    
    if (highRisks.length === 0) {
      return `
## DOT Medical Preparation Plan

Your current health status should allow DOT certification with proper preparation:

1. **Two Weeks Before DOT Physical:**
   - Ensure blood pressure is controlled (< 140/90)
   - Fast for 12 hours before if blood work expected
   - Bring all medication lists
   - Document any treatments for existing conditions

2. **Day of Physical:**
   - Well-rested (minimum 8 hours sleep)
   - Hydrated but empty bladder for urine test
   - Bring glasses/contacts if needed
   - Avoid caffeine 2 hours prior (affects BP)

3. **Documents to Bring:**
   - Previous DOT medical cards
   - Specialist clearances if applicable
   - Sleep study results if completed
   - Blood sugar logs if diabetic/pre-diabetic
      `.trim()
    }
    
    return `
## URGENT: DOT Medical Risk Mitigation Plan

**⚠️ HIGH RISK CONDITIONS IDENTIFIED - Immediate Action Required**

${highRisks.map(risk => `
### ${risk.condition}
- **Action Required:** ${risk.recommendation}
- **Timeline:** ${risk.timeline}
- **DOT Impact:** Potential disqualification if not addressed
`).join('\n')}

## Pre-Certification Checklist:
${this.generatePreCertificationChecklist(risks)}

## Backup Plan:
- Consider short-term medical leave if needed
- Explore DOT exemption programs if applicable
- Document all treatment efforts for medical examiner
- Have specialist reports ready

**Remember:** Hiding conditions from DOT examiner is illegal and dangerous. 
Address issues properly for long-term career sustainability.
    `.trim()
  }
  
  private generatePreCertificationChecklist(risks: DOTRisk[]): string {
    const checklist: string[] = []
    
    risks.forEach(risk => {
      switch (risk.condition) {
        case 'Cardiovascular Risk':
          checklist.push('☐ EKG completed and normal')
          checklist.push('☐ Blood pressure log (2 weeks, 2x daily)')
          checklist.push('☐ Cardiologist clearance letter')
          break
        case 'Blood Sugar Dysregulation / Pre-Diabetes':
          checklist.push('☐ A1C test result (< 7.0 for certification)')
          checklist.push('☐ Fasting glucose test')
          checklist.push('☐ 30-day blood sugar log if diabetic')
          checklist.push('☐ Endocrinologist letter if on insulin')
          break
        case 'Probable Sleep Apnea':
          checklist.push('☐ Sleep study scheduled or completed')
          checklist.push('☐ CPAP compliance report (if applicable)')
          checklist.push('☐ Sleep specialist clearance')
          break
        case 'Cognitive/Neurological Impairment':
          checklist.push('☐ Neurological evaluation')
          checklist.push('☐ B12 and folate levels checked')
          checklist.push('☐ Medication review for cognitive effects')
          break
      }
    })
    
    // Add universal items
    checklist.push('☐ Current medications list with dosages')
    checklist.push('☐ Previous DOT medical certificate')
    checklist.push('☐ Specialist reports from past year')
    checklist.push('☐ Completed health history form')
    
    return checklist.join('\n')
  }
  
  generateTruckerWellnessResources(): string {
    return `
## Truck Driver Health Resources

### Apps & Technology:
- **Rolling Strong:** CDL driver wellness app
- **MyFitnessPal:** Food tracking on the road
- **Headspace/Calm:** Meditation for drivers
- **Sleep Cycle:** Track sleep quality in cab
- **GasBuddy:** Find rest areas for walking

### Online Communities:
- **Truckers for Health Facebook Group**
- **r/TruckerHealth Reddit Community**
- **St. Christopher Fund:** Medical assistance
- **OOIDA Health Insurance Resources**

### Truck Stop Health Options:
- **Pilot/Flying J:** Healthier menu items marked
- **Love's:** Fresh fruit and salad options
- **TA/Petro:** Some locations have gyms
- **Walmart parking:** Walking opportunities

### Exercise Equipment for Truck:
- **Resistance bands set:** ~$30
- **Adjustable dumbbells:** ~$50
- **Yoga mat:** ~$20
- **Jump rope:** ~$15
- **Suspension trainer:** ~$40

### Meal Prep Services That Ship:
- **Factor75:** Delivers to truck stops
- **Trifecta:** Organic prepared meals
- **Green Chef:** Keto/paleo options

### Telehealth for Truckers:
- **Teladoc:** 24/7 virtual visits
- **MDLive:** Mental health support
- **BetterHelp:** Online therapy
- **PlushCare:** Prescription management

### DOT Physical Prep:
- **TeamCME:** DOT exam locations
- **Concentra:** Walk-in DOT physicals
- **National Registry of Certified Medical Examiners**

Remember: Your health is your wealth and your career. 
Small daily choices lead to long-term success on the road.
    `.trim()
  }
}

export default TruckDriverHealthAnalyzer