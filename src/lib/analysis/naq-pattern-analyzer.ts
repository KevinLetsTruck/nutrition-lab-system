// NAQ Pattern Recognition System for Functional Medicine Analysis
// Detects complex health patterns from symptom burden data

export interface SymptomBurdenData {
  upperGI: number
  smallIntestine: number
  largeIntestine: number
  liverGB: number
  kidneys: number
  cardiovascular: number
  immuneSystem: number
  energyProduction: number
  thyroid: number
  adrenal: number
  femaleReprod?: number
  maleReprod?: number
  sugarHandling: number
  joints: number
  skin: number
  brain: number
  totalBurden: number
}

export interface NAQPattern {
  name: string
  confidence: number
  affectedSystems: string[]
  keyIndicators: string[]
  functionalMedicineInterpretation: string
  truckDriverRelevance: string
  rootCauseHierarchy: string[]
  interventionPriority: 'immediate' | 'high' | 'moderate' | 'low'
}

export class NAQPatternAnalyzer {
  
  analyzePatterns(symptomBurden: SymptomBurdenData): NAQPattern[] {
    const patterns: NAQPattern[] = []
    
    // PATTERN 1: Hormone Dysfunction Pattern
    if ((symptomBurden.femaleReprod && symptomBurden.femaleReprod >= 8) || 
        (symptomBurden.maleReprod && symptomBurden.maleReprod >= 8)) {
      patterns.push(this.detectHormonePattern(symptomBurden))
    }
    
    // PATTERN 2: HPA Axis Dysfunction
    if (symptomBurden.adrenal >= 4 && (symptomBurden.thyroid >= 3 || symptomBurden.energyProduction >= 4)) {
      patterns.push(this.detectHPAPattern(symptomBurden))
    }
    
    // PATTERN 3: Gut-Brain Axis Disruption
    const gutTotal = symptomBurden.upperGI + symptomBurden.smallIntestine + symptomBurden.largeIntestine
    if (gutTotal >= 8 && symptomBurden.brain >= 3) {
      patterns.push(this.detectGutBrainPattern(symptomBurden))
    }
    
    // PATTERN 4: Metabolic Dysfunction
    if (symptomBurden.sugarHandling >= 3 || 
        (symptomBurden.cardiovascular >= 3 && symptomBurden.energyProduction >= 4)) {
      patterns.push(this.detectMetabolicPattern(symptomBurden))
    }
    
    // PATTERN 5: Systemic Inflammation
    if (symptomBurden.joints >= 4 || 
        (symptomBurden.skin >= 3 && symptomBurden.immuneSystem >= 3)) {
      patterns.push(this.detectInflammationPattern(symptomBurden))
    }
    
    // PATTERN 6: Detoxification Impairment
    if (symptomBurden.liverGB >= 4 && 
        (symptomBurden.skin >= 3 || symptomBurden.brain >= 4)) {
      patterns.push(this.detectDetoxPattern(symptomBurden))
    }
    
    // PATTERN 7: Mitochondrial Dysfunction
    if (symptomBurden.energyProduction >= 5 && 
        (symptomBurden.brain >= 3 || symptomBurden.cardiovascular >= 3)) {
      patterns.push(this.detectMitochondrialPattern(symptomBurden))
    }
    
    return this.prioritizePatterns(patterns)
  }
  
  private detectHormonePattern(data: SymptomBurdenData): NAQPattern {
    const reproScore = data.femaleReprod || data.maleReprod || 0
    const confidence = this.calculateConfidence(reproScore, 12)
    
    return {
      name: "Sex Hormone Imbalance",
      confidence,
      affectedSystems: ["Reproductive", "Thyroid", "Adrenal", "Liver", "Brain"],
      keyIndicators: [
        `Severe reproductive symptom burden (${reproScore}/12)`,
        data.liverGB >= 3 ? "Compromised liver detoxification" : "Liver involvement suspected",
        data.adrenal >= 3 ? "Adrenal-hormone interaction" : "Potential stress impact",
        data.thyroid >= 2 ? "Thyroid-hormone crosstalk" : "Thyroid potentially affected"
      ],
      functionalMedicineInterpretation: `
        The significantly elevated reproductive score of ${reproScore}/12 indicates severe hormone imbalance. 
        ${data.femaleReprod ? 'In females, this pattern suggests estrogen dominance or progesterone deficiency.' : 
          'In males, this pattern may indicate testosterone imbalance or estrogen excess.'}
        
        The liver score of ${data.liverGB}/9 ${data.liverGB >= 4 ? 'confirms' : 'suggests'} impaired hormone 
        detoxification through Phase I and II pathways. This creates a vicious cycle where hormones aren't 
        properly metabolized and cleared.
        
        ${data.adrenal >= 4 ? `The elevated adrenal score (${data.adrenal}/9) indicates that chronic stress 
        is likely stealing pregnenolone from sex hormone production (pregnenolone steal), further 
        exacerbating the imbalance.` : ''}
        
        This pattern requires immediate attention as it affects multiple body systems and quality of life.
      `.trim(),
      truckDriverRelevance: `
        Long-haul driving creates a perfect storm for hormone imbalance:
        • Chronic sleep disruption from irregular schedules disrupts circadian hormone production
        • Prolonged sitting reduces testosterone and increases estrogen activity
        • Xenoestrogen exposure from diesel fumes, plastic water bottles, and processed foods
        • Limited access to hormone-balancing foods (cruciferous vegetables, quality proteins)
        • Stress from traffic, deadlines, and isolation impacts cortisol-sex hormone balance
        
        This directly affects driving performance through mood instability, fatigue, and cognitive function.
      `.trim(),
      rootCauseHierarchy: [
        "Impaired liver detoxification of hormones",
        "Chronic stress disrupting hormone production",
        "Environmental xenoestrogen exposure",
        "Nutrient deficiencies (B vitamins, magnesium, zinc)",
        "Poor sleep quality affecting hormone synthesis"
      ],
      interventionPriority: reproScore >= 10 ? 'immediate' : 'high'
    }
  }
  
  private detectHPAPattern(data: SymptomBurdenData): NAQPattern {
    const confidence = this.calculateConfidence(
      (data.adrenal + data.thyroid + data.energyProduction) / 3, 
      9
    )
    
    return {
      name: "HPA Axis Dysfunction (Adrenal Fatigue Pattern)",
      confidence,
      affectedSystems: ["Adrenal", "Thyroid", "Energy Production", "Brain", "Immune"],
      keyIndicators: [
        `Adrenal dysfunction (${data.adrenal}/9)`,
        `Thyroid involvement (${data.thyroid}/7)`,
        `Energy production compromise (${data.energyProduction}/9)`,
        "Classic 'wired but tired' pattern"
      ],
      functionalMedicineInterpretation: `
        This pattern reveals dysfunction in the Hypothalamic-Pituitary-Adrenal (HPA) axis, 
        the body's primary stress response system. The adrenal score of ${data.adrenal}/9 
        combined with thyroid involvement (${data.thyroid}/7) indicates the stress response 
        has moved from acute adaptation to exhaustion phase.
        
        The energy production score of ${data.energyProduction}/9 confirms mitochondrial 
        impact - chronic stress depletes ATP production and creates a cellular energy crisis.
        
        ${data.sugarHandling >= 3 ? `Blood sugar dysregulation (${data.sugarHandling}/5) is both 
        a cause and effect of HPA dysfunction, creating unstable energy throughout the day.` : ''}
        
        This pattern typically develops over months to years of unmanaged stress and requires 
        a comprehensive restoration approach.
      `.trim(),
      truckDriverRelevance: `
        Truck drivers face unique HPA axis challenges:
        • Shift work and night driving disrupt cortisol rhythm
        • Constant vigilance while driving maintains high stress state
        • Limited recovery time between runs prevents adrenal restoration
        • Caffeine and energy drink reliance masks symptoms while worsening the problem
        • DOT pressure and delivery deadlines create chronic stress
        
        This pattern significantly impacts DOT medical certification through blood pressure, 
        glucose regulation, and alertness issues.
      `.trim(),
      rootCauseHierarchy: [
        "Chronic unmanaged stress",
        "Disrupted circadian rhythm",
        "Nutrient depletion (B5, B6, C, magnesium)",
        "Blood sugar instability",
        "Inflammatory diet and lifestyle"
      ],
      interventionPriority: data.adrenal >= 6 ? 'immediate' : 'high'
    }
  }
  
  private detectGutBrainPattern(data: SymptomBurdenData): NAQPattern {
    const gutTotal = data.upperGI + data.smallIntestine + data.largeIntestine
    const confidence = this.calculateConfidence(gutTotal / 3, 9)
    
    return {
      name: "Gut-Brain Axis Disruption",
      confidence,
      affectedSystems: ["Digestive", "Nervous", "Immune", "Mood", "Energy"],
      keyIndicators: [
        `Significant GI dysfunction (total: ${gutTotal}/27)`,
        `Brain symptoms present (${data.brain}/9)`,
        "Likely SIBO/dysbiosis pattern",
        "Neurotransmitter production affected"
      ],
      functionalMedicineInterpretation: `
        The gut-brain axis disruption pattern shows significant digestive dysfunction 
        (Upper GI: ${data.upperGI}/9, Small Intestine: ${data.smallIntestine}/9, 
        Large Intestine: ${data.largeIntestine}/9) directly impacting brain function 
        (${data.brain}/9).
        
        This bidirectional communication breakdown affects:
        • Neurotransmitter production (90% of serotonin made in gut)
        • Vagal nerve tone and stress response
        • Intestinal permeability ('leaky gut') driving neuroinflammation
        • Microbiome diversity affecting mood and cognition
        
        ${data.immuneSystem >= 3 ? `The immune involvement (${data.immuneSystem}/9) suggests 
        active inflammation and possible autoimmune activation.` : ''}
        
        This pattern requires addressing both gut healing and neurological support simultaneously.
      `.trim(),
      truckDriverRelevance: `
        Truck driving lifestyle severely impacts gut-brain health:
        • Truck stop food lacks fiber and promotes dysbiosis
        • Irregular eating schedule disrupts digestive rhythm
        • Limited bathroom access affects elimination and toxin clearance
        • Chronic sitting slows gut motility and promotes SIBO
        • Stress eating and processed foods feed pathogenic bacteria
        
        Cognitive symptoms (brain fog, mood changes) directly impact driving safety and 
        reaction times. This pattern often underlies the "trucker's fatigue" beyond simple tiredness.
      `.trim(),
      rootCauseHierarchy: [
        "Intestinal dysbiosis/SIBO",
        "Increased intestinal permeability",
        "Chronic inflammation",
        "Poor diet quality",
        "Chronic stress affecting gut motility"
      ],
      interventionPriority: gutTotal >= 15 ? 'immediate' : 'high'
    }
  }
  
  private detectMetabolicPattern(data: SymptomBurdenData): NAQPattern {
    const metabolicScore = (data.sugarHandling + data.cardiovascular + data.energyProduction) / 3
    const confidence = this.calculateConfidence(metabolicScore, 7)
    
    return {
      name: "Metabolic Dysfunction & Insulin Resistance",
      confidence,
      affectedSystems: ["Blood Sugar", "Cardiovascular", "Energy", "Liver", "Brain"],
      keyIndicators: [
        `Blood sugar dysregulation (${data.sugarHandling}/5)`,
        `Cardiovascular stress (${data.cardiovascular}/9)`,
        `Energy production issues (${data.energyProduction}/9)`,
        "Pre-diabetic pattern emerging"
      ],
      functionalMedicineInterpretation: `
        This metabolic dysfunction pattern indicates progression toward insulin resistance 
        and metabolic syndrome. The sugar handling score of ${data.sugarHandling}/5 combined 
        with cardiovascular involvement (${data.cardiovascular}/9) suggests cells are becoming 
        resistant to insulin signaling.
        
        The energy production compromise (${data.energyProduction}/9) reflects mitochondrial 
        dysfunction - cells can't efficiently produce ATP from glucose, creating a cellular 
        energy crisis despite adequate or excess blood sugar.
        
        ${data.liverGB >= 3 ? `Liver involvement (${data.liverGB}/9) indicates developing 
        fatty liver (NAFLD), further compromising metabolic function.` : ''}
        
        This pattern is a critical predictor of future diabetes, cardiovascular disease, 
        and cognitive decline if not addressed.
      `.trim(),
      truckDriverRelevance: `
        Truck drivers face extreme metabolic challenges:
        • Sedentary profession promotes insulin resistance
        • Irregular meal timing disrupts metabolic rhythm
        • High-carb convenience foods spike blood sugar
        • Energy drinks and sodas worsen glucose control
        • Limited exercise opportunities reduce insulin sensitivity
        
        DOT MEDICAL IMPACT: This pattern directly threatens medical certification through:
        • Rising A1C levels approaching diabetic range
        • Blood pressure elevation from metabolic syndrome
        • Increased risk of sudden cardiac events
        • Sleep apnea correlation with metabolic dysfunction
      `.trim(),
      rootCauseHierarchy: [
        "Chronic high carbohydrate intake",
        "Sedentary lifestyle",
        "Central adiposity from prolonged sitting",
        "Chronic inflammation",
        "Micronutrient deficiencies (chromium, magnesium, alpha-lipoic acid)"
      ],
      interventionPriority: data.sugarHandling >= 4 || data.cardiovascular >= 5 ? 'immediate' : 'high'
    }
  }
  
  private detectInflammationPattern(data: SymptomBurdenData): NAQPattern {
    const inflammationScore = (data.joints + data.skin + data.immuneSystem) / 3
    const confidence = this.calculateConfidence(inflammationScore, 8)
    
    return {
      name: "Chronic Systemic Inflammation",
      confidence,
      affectedSystems: ["Immune", "Joints", "Skin", "Cardiovascular", "Brain"],
      keyIndicators: [
        `Joint inflammation (${data.joints}/9)`,
        `Skin manifestations (${data.skin}/7)`,
        `Immune dysregulation (${data.immuneSystem}/9)`,
        "Silent inflammation driving multiple symptoms"
      ],
      functionalMedicineInterpretation: `
        Chronic inflammation is the root driver of most modern diseases. This pattern shows 
        inflammation manifesting through joints (${data.joints}/9), skin (${data.skin}/7), 
        and immune dysfunction (${data.immuneSystem}/9).
        
        This indicates:
        • Elevated inflammatory cytokines (IL-6, TNF-alpha, CRP)
        • Potential autoimmune activation
        • Compromised gut barrier driving systemic inflammation
        • Cellular damage accumulation
        
        ${data.brain >= 3 ? `Neuroinflammation (brain score: ${data.brain}/9) suggests the 
        inflammation has crossed the blood-brain barrier, affecting cognition and mood.` : ''}
        
        This "fire" throughout the body accelerates aging and disease progression.
      `.trim(),
      truckDriverRelevance: `
        Trucking lifestyle is inherently pro-inflammatory:
        • Diesel exhaust exposure triggers respiratory inflammation
        • Prolonged sitting promotes inflammatory cytokines
        • Poor sleep quality increases inflammation
        • Processed food diet high in omega-6 oils
        • Limited access to anti-inflammatory foods
        • Chronic stress maintains inflammatory state
        
        Joint pain and stiffness directly impact driving comfort and safety, while 
        brain inflammation affects reaction time and decision-making.
      `.trim(),
      rootCauseHierarchy: [
        "Pro-inflammatory diet",
        "Intestinal permeability",
        "Environmental toxin exposure",
        "Chronic infections or dysbiosis",
        "Omega-3 deficiency"
      ],
      interventionPriority: 'high'
    }
  }
  
  private detectDetoxPattern(data: SymptomBurdenData): NAQPattern {
    const confidence = this.calculateConfidence(data.liverGB, 9)
    
    return {
      name: "Impaired Detoxification",
      confidence,
      affectedSystems: ["Liver", "Gallbladder", "Skin", "Brain", "Kidneys"],
      keyIndicators: [
        `Liver/gallbladder dysfunction (${data.liverGB}/9)`,
        `Skin as secondary detox route (${data.skin}/7)`,
        `Brain fog from toxin accumulation (${data.brain}/9)`,
        "Phase I/II detox imbalance"
      ],
      functionalMedicineInterpretation: `
        The liver/gallbladder score of ${data.liverGB}/9 indicates significant compromise 
        in the body's primary detoxification system. This affects:
        
        • Phase I detox: Converting fat-soluble toxins (may be overactive)
        • Phase II detox: Conjugation pathways likely sluggish
        • Bile flow: Critical for toxin elimination
        
        ${data.skin >= 3 ? `The skin involvement (${data.skin}/7) shows the body is using 
        secondary detox routes - a sign of primary pathway overload.` : ''}
        
        ${data.brain >= 4 ? `High brain symptoms (${data.brain}/9) indicate neurotoxin 
        accumulation affecting cognitive function.` : ''}
        
        This pattern suggests toxic burden exceeds elimination capacity.
      `.trim(),
      truckDriverRelevance: `
        Truckers face exceptional toxic exposure:
        • Constant diesel exhaust inhalation
        • Chemical exposure at loading docks
        • Plastic food/drink containers (BPA, phthalates)
        • Limited water intake impairs kidney detox
        • Alcohol or medication use taxes liver further
        
        Impaired detox manifests as:
        • Chemical sensitivity to diesel/cleaners
        • Alcohol intolerance
        • Medication side effects
        • Chronic fatigue despite rest
        • "Trucker's brain fog"
      `.trim(),
      rootCauseHierarchy: [
        "Toxic exposure exceeding capacity",
        "Nutrient deficiencies for detox pathways",
        "Sluggish bile flow",
        "Genetic SNPs affecting detox",
        "Constipation preventing elimination"
      ],
      interventionPriority: data.liverGB >= 6 ? 'high' : 'moderate'
    }
  }
  
  private detectMitochondrialPattern(data: SymptomBurdenData): NAQPattern {
    const confidence = this.calculateConfidence(data.energyProduction, 9)
    
    return {
      name: "Mitochondrial Dysfunction",
      confidence,
      affectedSystems: ["Energy Production", "Brain", "Cardiovascular", "Muscles", "Immune"],
      keyIndicators: [
        `Severe energy production issues (${data.energyProduction}/9)`,
        `Brain fog and cognitive issues (${data.brain}/9)`,
        `Cardiovascular weakness (${data.cardiovascular}/9)`,
        "Cellular ATP crisis"
      ],
      functionalMedicineInterpretation: `
        Mitochondrial dysfunction with energy score ${data.energyProduction}/9 indicates 
        a cellular energy crisis. Mitochondria - the cellular powerhouses - are failing 
        to produce adequate ATP.
        
        This affects every system but especially:
        • Brain: High energy demand, cognitive dysfunction
        • Heart: Constant energy needs, cardiovascular symptoms
        • Muscles: Weakness, exercise intolerance
        
        Common causes include:
        • Nutrient deficiencies (CoQ10, B vitamins, magnesium)
        • Oxidative stress damaging mitochondrial DNA
        • Environmental toxins
        • Chronic infections
        
        This pattern underlies chronic fatigue and accelerated aging.
      `.trim(),
      truckDriverRelevance: `
        Trucking assault on mitochondria:
        • Diesel particles directly damage mitochondrial DNA
        • Poor sleep disrupts mitochondrial repair
        • High-carb diet impairs metabolic flexibility
        • Sedentary lifestyle reduces mitochondrial biogenesis
        • Chronic stress depletes mitochondrial nutrients
        
        Results in:
        • Extreme fatigue despite adequate sleep
        • Post-meal energy crashes
        • Exercise intolerance
        • Temperature regulation issues
        • Slow recovery from illness
        
        This directly impacts driving stamina and safety.
      `.trim(),
      rootCauseHierarchy: [
        "Mitochondrial nutrient deficiencies",
        "Oxidative stress",
        "Environmental toxin exposure",
        "Chronic inflammation",
        "Poor metabolic flexibility"
      ],
      interventionPriority: data.energyProduction >= 7 ? 'immediate' : 'high'
    }
  }
  
  private calculateConfidence(score: number, maxScore: number): number {
    // Calculate confidence based on score severity and max possible
    const percentage = score / maxScore
    if (percentage >= 0.8) return 0.95
    if (percentage >= 0.6) return 0.85
    if (percentage >= 0.4) return 0.75
    if (percentage >= 0.3) return 0.65
    return 0.5
  }
  
  private prioritizePatterns(patterns: NAQPattern[]): NAQPattern[] {
    // Sort by intervention priority and confidence
    const priorityOrder = { immediate: 0, high: 1, moderate: 2, low: 3 }
    
    return patterns.sort((a, b) => {
      const priorityDiff = priorityOrder[a.interventionPriority] - priorityOrder[b.interventionPriority]
      if (priorityDiff !== 0) return priorityDiff
      return b.confidence - a.confidence
    })
  }
  
  // Helper method to identify pattern connections
  identifyPatternConnections(patterns: NAQPattern[]): Map<string, string[]> {
    const connections = new Map<string, string[]>()
    
    patterns.forEach(pattern => {
      const related: string[] = []
      
      // Check for system overlaps with other patterns
      patterns.forEach(otherPattern => {
        if (pattern.name !== otherPattern.name) {
          const sharedSystems = pattern.affectedSystems.filter(system => 
            otherPattern.affectedSystems.includes(system)
          )
          if (sharedSystems.length >= 2) {
            related.push(otherPattern.name)
          }
        }
      })
      
      connections.set(pattern.name, related)
    })
    
    return connections
  }
}

export default NAQPatternAnalyzer