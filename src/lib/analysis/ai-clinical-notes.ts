// AI Clinical Notes Generator
// Uses Claude to generate practitioner-style clinical insights

import ClaudeClient from '../claude-client'
import { NAQPattern, SymptomBurdenData } from './naq-pattern-analyzer'
import { FunctionalMedicineReport } from './functional-medicine-interpreter'

export interface ClinicalNotesInput {
  patterns: NAQPattern[]
  interpretation: FunctionalMedicineReport
  burden: SymptomBurdenData
  clientData: {
    firstName: string
    lastName: string
    age?: number
    occupation?: string
  }
}

export class ClinicalNotesGenerator {
  private claudeClient: ClaudeClient
  
  constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }
  
  async generateClinicalNotes(
    input: ClinicalNotesInput,
    practitionerStyle: string = "Kevin Rutherford FNTP"
  ): Promise<string> {
    
    const prompt = this.createClinicalNotesPrompt(input, practitionerStyle)
    
    try {
      console.log('[CLINICAL-NOTES] Generating AI clinical insights...')
      
      const systemPrompt = `You are ${practitionerStyle}, an experienced Functional Nutrition Therapy Practitioner 
specializing in truck driver health. You're reviewing a comprehensive NAQ assessment and providing clinical notes 
as if discussing with a colleague. Focus on patterns that might be missed, clinical pearls, and practical insights 
specific to the trucking lifestyle. Write in first person with the wisdom of 20+ years of functional medicine experience.`
      
      const result = await this.claudeClient.analyzeWithClaude(prompt, systemPrompt)
      
      // Clean and format the response
      const formattedNotes = this.formatClinicalNotes(result, input)
      
      console.log('[CLINICAL-NOTES] Clinical notes generated successfully')
      return formattedNotes
      
    } catch (error) {
      console.error('[CLINICAL-NOTES] Error generating AI notes:', error)
      // Fallback to template-based notes
      return this.generateFallbackNotes(input)
    }
  }
  
  private createClinicalNotesPrompt(input: ClinicalNotesInput, practitionerName: string): string {
    const { patterns, interpretation, burden, clientData } = input
    
    return `
As ${practitionerName}, please analyze this NAQ assessment for ${clientData.firstName} ${clientData.lastName} 
and provide clinical notes including:

PATIENT OVERVIEW:
- Total Symptom Burden: ${burden.totalBurden}/321
- Primary Patterns: ${patterns.map(p => `${p.name} (${Math.round(p.confidence * 100)}%)`).join(', ')}
- Top 3 Systems: ${this.getTopSystems(burden).join(', ')}

DETAILED FINDINGS:
${this.summarizeFindings(patterns, burden)}

Please provide clinical notes that include:

1. IMMEDIATE CLINICAL IMPRESSION
What patterns jump out that might be missed by standard analysis? What's your gut feeling about this case?

2. TIMELINE ANALYSIS
Based on the patterns, what likely started first? What's the probable sequence of dysfunction?

3. HIDDEN CONNECTIONS
What connections between symptoms might not be obvious? Any "aha" moments from the pattern analysis?

4. PRACTICAL INTERVENTION PRIORITIES
As an FNTP working with truck drivers, what are the top 3-5 most practical interventions?

5. RED FLAGS & URGENT CONCERNS
What needs immediate attention? Any safety concerns for a commercial driver?

6. SUCCESS PREDICTORS
Based on the patterns and your experience, what predicts success for this client?

7. CLINICAL PEARLS
What wisdom from your experience applies to this case? Any tricks that work especially well?

8. FOLLOW-UP STRATEGY
What's your recommended follow-up schedule and what to monitor?

Write as if you're discussing the case with a colleague, sharing insights only experience would reveal.
Include specific observations about how the trucking lifestyle impacts each pattern.
    `
  }
  
  private formatClinicalNotes(aiResponse: string, input: ClinicalNotesInput): string {
    // Ensure proper formatting
    const sections = [
      '## Practitioner Clinical Notes',
      `**Patient:** ${input.clientData.firstName} ${input.clientData.lastName}`,
      `**Date:** ${new Date().toLocaleDateString()}`,
      `**Practitioner:** Kevin Rutherford, FNTP`,
      '',
      aiResponse.trim()
    ]
    
    // Add additional context if missing from AI response
    if (!aiResponse.includes('Prognosis')) {
      sections.push(this.generatePrognosisSection(input))
    }
    
    if (!aiResponse.includes('Supplement')) {
      sections.push(this.generateSupplementNotes(input))
    }
    
    return sections.join('\n')
  }
  
  private generateFallbackNotes(input: ClinicalNotesInput): string {
    const { patterns, burden, clientData } = input
    const topPattern = patterns[0]
    
    return `
## Practitioner Clinical Notes

**Patient:** ${clientData.firstName} ${clientData.lastName}
**Date:** ${new Date().toLocaleDateString()}
**Practitioner:** Kevin Rutherford, FNTP

### Clinical Impression

This case presents a ${this.getComplexityLevel(patterns)} pattern of dysfunction with 
${topPattern.name} as the primary driver. The symptom constellation suggests 
${this.estimateChronicity(patterns, burden)} of progressive dysfunction.

${this.generatePatternInsights(patterns, burden)}

### Hidden Patterns & Connections

${this.identifyHiddenPatterns(patterns, burden)}

### Intervention Strategy

Based on my experience with truck drivers, the intervention priority should be:

${this.generateInterventionPriorities(patterns, burden)}

### Success Predictors

${this.assessSuccessLikelihood(patterns, burden)}

### Clinical Pearls

${this.generateClinicalPearls(patterns, burden)}

### Red Flags to Monitor

${this.identifyRedFlags(burden)}

### Follow-Up Plan

- **2 weeks:** Initial response check, adjust supplements if needed
- **4 weeks:** Comprehensive review, expect 20-30% improvement
- **8 weeks:** Mid-point assessment, consider additional testing
- **12 weeks:** Full NAQ retest, expect 50-70% improvement

### Notes for Next Visit

- Assess compliance with protocols
- Review any adverse reactions
- Check DOT medical concerns
- Evaluate need for specialist referrals
- Consider advanced testing based on response
    `.trim()
  }
  
  private getTopSystems(burden: SymptomBurdenData): string[] {
    const systems = [
      { name: 'Digestive', score: burden.upperGI + burden.smallIntestine + burden.largeIntestine },
      { name: 'Energy/Mito', score: burden.energyProduction },
      { name: 'Hormonal', score: Math.max(burden.femaleReprod || 0, burden.maleReprod || 0) },
      { name: 'Adrenal', score: burden.adrenal },
      { name: 'Liver/Detox', score: burden.liverGB },
      { name: 'Cardiovascular', score: burden.cardiovascular },
      { name: 'Brain/Neuro', score: burden.brain }
    ]
    
    return systems
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => `${s.name} (${s.score})`)
  }
  
  private summarizeFindings(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const summaries = patterns.slice(0, 3).map(pattern => `
${pattern.name}:
- Confidence: ${Math.round(pattern.confidence * 100)}%
- Affected Systems: ${pattern.affectedSystems.join(', ')}
- Key Indicators: ${pattern.keyIndicators.slice(0, 2).join('; ')}
    `).join('\n')
    
    return summaries
  }
  
  private getComplexityLevel(patterns: NAQPattern[]): string {
    if (patterns.length >= 5) return "highly complex"
    if (patterns.length >= 3) return "moderately complex"
    return "straightforward"
  }
  
  private estimateChronicity(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const hasAdvancedPatterns = patterns.some(p => 
      p.name.includes('Mitochondrial') || 
      (p.name.includes('HPA') && p.confidence > 0.8)
    )
    
    if (hasAdvancedPatterns || burden.totalBurden > 150) return "3-5 years"
    if (patterns.length >= 3 || burden.totalBurden > 100) return "1-3 years"
    return "6-12 months"
  }
  
  private generatePatternInsights(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const insights: string[] = []
    
    // Look for specific pattern combinations
    const hasHormoneMax = (burden.femaleReprod === 12 || burden.maleReprod === 12)
    if (hasHormoneMax) {
      insights.push(`
The maximal reproductive score (12/12) with suppression of all other systems is pathognomonic 
for severe hormone dominance. This pattern indicates the endocrine system is monopolizing 
resources, creating a "hormonal hijacking" of normal physiology.
      `.trim())
    }
    
    const hasGutBrainPattern = patterns.some(p => p.name.includes('Gut-Brain'))
    if (hasGutBrainPattern) {
      insights.push(`
The gut-brain axis disruption here is classic for truck drivers - irregular eating, poor food 
quality, and chronic stress create perfect conditions for SIBO and dysbiosis. The neurological 
symptoms are likely driven by gut-derived inflammation and neurotoxins.
      `.trim())
    }
    
    const hasMetabolicPattern = patterns.some(p => p.name.includes('Metabolic'))
    if (hasMetabolicPattern && burden.cardiovascular >= 3) {
      insights.push(`
The combination of metabolic dysfunction and cardiovascular involvement is concerning for 
DOT certification. This pattern typically progresses to diabetes within 2-3 years without 
intervention. The sedentary nature of trucking accelerates this timeline.
      `.trim())
    }
    
    return insights.join('\n\n')
  }
  
  private identifyHiddenPatterns(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const hidden: string[] = []
    
    // Methylation issues
    if (burden.brain >= 4 && burden.energyProduction >= 4) {
      hidden.push("Likely methylation dysfunction - consider MTHFR and methylation panel")
    }
    
    // Hidden infections
    if (burden.immuneSystem >= 5 && burden.energyProduction >= 5) {
      hidden.push("Pattern suggests chronic infection or viral reactivation (EBV, CMV common in stressed drivers)")
    }
    
    // Mold/biotoxin illness
    if (burden.brain >= 5 && burden.energyProduction >= 5 && burden.joints >= 4) {
      hidden.push("Consider biotoxin illness - many trucks have hidden mold in sleeper cabs")
    }
    
    // Heavy metal toxicity
    if (burden.brain >= 4 && burden.liverGB >= 4 && burden.kidneys >= 3) {
      hidden.push("Heavy metal burden possible from diesel exhaust exposure")
    }
    
    return hidden.length > 0 ? 
      hidden.join('\n') : 
      "No additional hidden patterns identified beyond primary analysis"
  }
  
  private generateInterventionPriorities(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const priorities: string[] = []
    
    // Always start with foundations
    priorities.push("1. **Stabilize blood sugar** - Critical for energy and all other systems")
    
    // Pattern-specific priorities
    const topPattern = patterns[0]
    switch (true) {
      case topPattern.name.includes('Hormone'):
        priorities.push("2. **Support liver detox** - Essential for hormone clearance")
        priorities.push("3. **Balance hormones** - DIM + progesterone support")
        break
      case topPattern.name.includes('HPA'):
        priorities.push("2. **Restore adrenal function** - Adaptogenic support + stress management")
        priorities.push("3. **Fix sleep** - Without sleep, nothing else works")
        break
      case topPattern.name.includes('Gut'):
        priorities.push("2. **Heal the gut** - 4R protocol is non-negotiable")
        priorities.push("3. **Address dysbiosis** - Specific antimicrobials based on symptoms")
        break
      default:
        priorities.push("2. **Reduce inflammation** - Diet + targeted supplements")
        priorities.push("3. **Support mitochondria** - CoQ10, B vitamins, magnesium")
    }
    
    priorities.push("4. **Optimize lifestyle** - Sleep, movement, stress within trucking constraints")
    priorities.push("5. **Monitor progress** - Weekly check-ins critical for compliance")
    
    return priorities.join('\n')
  }
  
  private assessSuccessLikelihood(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    let likelihood = "High"
    const factors: string[] = []
    
    // Positive predictors
    if (burden.totalBurden < 100) {
      factors.push("+ Moderate symptom burden = faster response")
    }
    if (patterns.length <= 3) {
      factors.push("+ Limited pattern complexity = straightforward protocol")
    }
    if (!patterns.some(p => p.name.includes('Mitochondrial'))) {
      factors.push("+ No deep mitochondrial dysfunction = better energy for healing")
    }
    
    // Negative predictors
    if (burden.totalBurden > 150) {
      likelihood = "Moderate"
      factors.push("- High symptom burden = longer healing time")
    }
    if (patterns.some(p => p.interventionPriority === 'immediate')) {
      likelihood = "Moderate"
      factors.push("- Critical patterns require intensive intervention")
    }
    if (patterns.length >= 5) {
      likelihood = "Moderate-Low"
      factors.push("- Complex multi-system involvement")
    }
    
    return `
**Success Likelihood:** ${likelihood}

Factors:
${factors.join('\n')}

**Keys to Success:**
- Compliance with supplement protocol (use pill organizers)
- Dietary adherence (meal prep is crucial)
- Regular follow-ups (accountability matters)
- Stress management (non-negotiable for truck drivers)
    `.trim()
  }
  
  private generateClinicalPearls(patterns: NAQPattern[], burden: SymptomBurdenData): string {
    const pearls: string[] = []
    
    // Universal pearls for truck drivers
    pearls.push("For truck drivers, timing is everything - sync supplements with driving schedule")
    pearls.push("Never underestimate the power of consistent sleep - even 1 hour more makes a difference")
    
    // Pattern-specific pearls
    patterns.slice(0, 3).forEach(pattern => {
      const pearlMap: { [key: string]: string } = {
        'Sex Hormone Imbalance': "Cruciferous vegetables are medicine - broccoli sprouts in the truck",
        'HPA Axis Dysfunction': "Ashwagandha at night often works better than morning for drivers",
        'Gut-Brain Axis Disruption': "Bone broth in a thermos - sip throughout the day for gut healing",
        'Metabolic Dysfunction': "Protein + fat before carbs - always, even at truck stops",
        'Chronic Systemic Inflammation': "Turmeric + black pepper + fat = powerful anti-inflammatory",
        'Impaired Detoxification': "Lemon water first thing - simple but effective liver support",
        'Mitochondrial Dysfunction': "CoQ10 ubiquinol form - worth the extra cost for energy"
      }
      
      if (pearlMap[pattern.name]) {
        pearls.push(pearlMap[pattern.name])
      }
    })
    
    // Burden-specific pearls
    if (burden.energyProduction >= 6) {
      pearls.push("Start with energy support - without ATP, nothing else heals")
    }
    
    return pearls.join('\n- ')
  }
  
  private identifyRedFlags(burden: SymptomBurdenData): string {
    const redFlags: string[] = []
    
    if (burden.cardiovascular >= 6) {
      redFlags.push("**Cardiovascular:** Score of " + burden.cardiovascular + " requires immediate medical evaluation")
    }
    
    if (burden.sugarHandling >= 4) {
      redFlags.push("**Blood Sugar:** Approaching diabetic range - test A1C immediately")
    }
    
    if (burden.brain >= 7) {
      redFlags.push("**Neurological:** Severe cognitive symptoms - rule out serious pathology")
    }
    
    if (burden.kidneys >= 6) {
      redFlags.push("**Kidney Function:** High score warrants comprehensive renal panel")
    }
    
    const sleepApneaRisk = (burden.energyProduction >= 6 && burden.cardiovascular >= 4)
    if (sleepApneaRisk) {
      redFlags.push("**Sleep Apnea:** High probability - sleep study urgent for DOT compliance")
    }
    
    return redFlags.length > 0 ? 
      redFlags.join('\n') : 
      "No immediate red flags requiring urgent medical referral"
  }
  
  private generatePrognosisSection(input: ClinicalNotesInput): string {
    const { patterns, burden } = input
    
    return `
### Prognosis

With proper protocol adherence, I expect:
- **Week 2-4:** 20-30% symptom reduction, improved energy stability
- **Week 4-8:** 40-50% improvement, significant pattern resolution  
- **Week 8-12:** 60-70% improvement, systems coming back online
- **Month 3-6:** 80%+ improvement possible with continued support

**Factors supporting good prognosis:**
- Identified clear patterns with targeted interventions
- Truck driver willing to make lifestyle adjustments
- No irreversible pathology identified

**Potential obstacles:**
- Trucking lifestyle challenges (addressed in protocol)
- Compliance with multiple supplements
- Dietary changes at truck stops
    `.trim()
  }
  
  private generateSupplementNotes(input: ClinicalNotesInput): string {
    const { patterns } = input
    
    return `
### Supplement Strategy Notes

**Core Support (everyone gets):**
- Multivitamin with methylated Bs - foundation for all protocols
- Magnesium glycinate - helps everything work better
- Omega-3s - anti-inflammatory, brain support

**Pattern-Specific Additions:**
${patterns.slice(0, 3).map(pattern => {
  const suppMap: { [key: string]: string } = {
    'Sex Hormone Imbalance': "- DIM + Calcium D-Glucarate for estrogen metabolism",
    'HPA Axis Dysfunction': "- Adaptogenic blend + Phosphatidylserine for cortisol",
    'Gut-Brain Axis Disruption': "- Broad spectrum probiotic + L-glutamine for gut repair",
    'Metabolic Dysfunction': "- Berberine + Chromium for blood sugar control",
    'Chronic Systemic Inflammation': "- Curcumin + Boswellia for inflammation",
    'Impaired Detoxification': "- NAC + Milk Thistle for liver support",
    'Mitochondrial Dysfunction': "- CoQ10 + PQQ + Alpha-lipoic acid for energy"
  }
  
  return suppMap[pattern.name] || ""
}).filter(s => s).join('\n')}

**Timing Strategy:**
- Morning: Energy/adrenal support
- With meals: Digestive support, fat-soluble vitamins
- Evening: Calming supplements, magnesium
- Empty stomach: Amino acids, some probiotics
    `.trim()
  }
}

export default ClinicalNotesGenerator