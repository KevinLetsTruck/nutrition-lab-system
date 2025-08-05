import ClaudeClient from '@/lib/claude-client'
import {
  LabPattern,
  LabProtocol,
  SupplementProtocol,
  SupplementRecommendation,
  DietaryModification,
  LifestyleIntervention,
  RetestSchedule,
  AIAnalysis,
  ClientPreferences
} from '@/types/lab-analysis'

export class ProtocolGenerator {
  private claudeClient: ClaudeClient

  constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }

  async generateProtocols(
    patterns: LabPattern[],
    aiAnalysis: AIAnalysis,
    clientPreferences?: ClientPreferences
  ): Promise<LabProtocol[]> {
    console.log('[PROTOCOL-GEN] Generating protocols for', patterns.length, 'patterns')

    const protocols: LabProtocol[] = []

    try {
      // Generate supplement protocol
      const supplementProtocol = await this.generateSupplementProtocol(
        patterns,
        aiAnalysis,
        clientPreferences
      )
      if (supplementProtocol) {
        protocols.push(supplementProtocol)
      }

      // Generate dietary protocol
      const dietaryProtocol = await this.generateDietaryProtocol(
        patterns,
        aiAnalysis,
        clientPreferences
      )
      if (dietaryProtocol) {
        protocols.push(dietaryProtocol)
      }

      // Generate lifestyle protocol
      const lifestyleProtocol = await this.generateLifestyleProtocol(
        patterns,
        aiAnalysis,
        clientPreferences
      )
      if (lifestyleProtocol) {
        protocols.push(lifestyleProtocol)
      }

      // Generate retest protocol
      const retestProtocol = await this.generateRetestProtocol(
        patterns,
        aiAnalysis
      )
      if (retestProtocol) {
        protocols.push(retestProtocol)
      }

      return protocols
    } catch (error) {
      console.error('[PROTOCOL-GEN] Error generating protocols:', error)
      return []
    }
  }

  private async generateSupplementProtocol(
    patterns: LabPattern[],
    aiAnalysis: AIAnalysis,
    preferences?: ClientPreferences
  ): Promise<LabProtocol | null> {
    // Build supplement recommendations based on patterns
    const supplements: SupplementRecommendation[] = []

    // Pattern-specific supplements
    for (const pattern of patterns) {
      const patternSupplements = this.getSupplementsForPattern(pattern, preferences)
      supplements.push(...patternSupplements)
    }

    // Remove duplicates and prioritize
    const uniqueSupplements = this.deduplicateSupplements(supplements)
    const prioritizedSupplements = this.prioritizeSupplements(uniqueSupplements, patterns)

    if (prioritizedSupplements.length === 0) {
      return null
    }

    // Calculate total cost
    const totalMonthlyCost = prioritizedSupplements.reduce((sum, supp) => {
      return sum + this.estimateSupplementCost(supp)
    }, 0)

    const supplementProtocol: SupplementProtocol = {
      supplements: prioritizedSupplements,
      total_monthly_cost: totalMonthlyCost,
      sourcing_priority: ['letsTruck', 'biotics', 'fullscript']
    }

    return {
      id: '', // Will be assigned by database
      lab_result_id: '', // Will be assigned when saving
      client_id: '', // Will be assigned when saving
      protocol_type: 'supplement',
      priority: this.determineProtocolPriority(patterns),
      title: 'Targeted Supplement Protocol',
      description: 'Evidence-based supplement recommendations based on your lab findings and functional medicine patterns.',
      supplement_protocol: supplementProtocol,
      truck_driver_adaptations: 'All supplements selected for easy compliance while on the road. Single daily dosing when possible.',
      created_at: new Date()
    }
  }

  private getSupplementsForPattern(
    pattern: LabPattern,
    preferences?: ClientPreferences
  ): SupplementRecommendation[] {
    const supplements: SupplementRecommendation[] = []

    switch (pattern.pattern_name) {
      case 'Insulin Resistance':
        supplements.push(
          {
            name: 'Berberine',
            dosage: '500mg',
            frequency: 'twice daily',
            timing: 'with meals',
            duration: '3 months',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck Berberine Plus',
            rationale: 'Improves insulin sensitivity and glucose metabolism',
            precautions: 'May lower blood sugar; monitor if on diabetes medications'
          },
          {
            name: 'Chromium Picolinate',
            dosage: '200mcg',
            frequency: 'once daily',
            timing: 'with breakfast',
            duration: '3 months',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck Blood Sugar Support',
            rationale: 'Enhances insulin receptor function',
            precautions: 'Safe for most people'
          },
          {
            name: 'Alpha Lipoic Acid',
            dosage: '300mg',
            frequency: 'once daily',
            timing: 'morning',
            duration: '3 months',
            source: 'biotics',
            product_recommendation: 'Bio-ALA',
            rationale: 'Powerful antioxidant that improves glucose uptake',
            precautions: 'Take on empty stomach for best absorption'
          }
        )
        break

      case 'Thyroid Dysfunction':
      case 'Hypothyroid':
        supplements.push(
          {
            name: 'Selenium',
            dosage: '200mcg',
            frequency: 'once daily',
            timing: 'with food',
            duration: '6 months',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck Thyroid Support',
            rationale: 'Essential for thyroid hormone conversion (T4 to T3)',
            precautions: 'Do not exceed 400mcg daily'
          },
          {
            name: 'Iodine/Iodide',
            dosage: '150mcg',
            frequency: 'once daily',
            timing: 'morning',
            duration: '3 months',
            source: 'biotics',
            product_recommendation: 'Iodizyme-HP',
            rationale: 'Required for thyroid hormone production',
            precautions: 'Start low if Hashimoto\'s present'
          },
          {
            name: 'Tyrosine',
            dosage: '500mg',
            frequency: 'once daily',
            timing: 'morning, empty stomach',
            duration: '3 months',
            source: 'fullscript',
            product_recommendation: 'L-Tyrosine',
            rationale: 'Amino acid precursor to thyroid hormones',
            precautions: 'Avoid if hyperthyroid'
          }
        )
        break

      case 'Chronic Inflammation':
        supplements.push(
          {
            name: 'Omega-3 (EPA/DHA)',
            dosage: '2000mg',
            frequency: 'once daily',
            timing: 'with dinner',
            duration: 'ongoing',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck Ultra Omega',
            rationale: 'Reduces inflammatory markers and supports cardiovascular health',
            precautions: 'May thin blood; caution with blood thinners'
          },
          {
            name: 'Curcumin',
            dosage: '500mg',
            frequency: 'twice daily',
            timing: 'with meals',
            duration: '6 months',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck Curcumin Complex',
            rationale: 'Powerful anti-inflammatory, reduces CRP',
            precautions: 'Take with black pepper for absorption'
          },
          {
            name: 'Resveratrol',
            dosage: '200mg',
            frequency: 'once daily',
            timing: 'morning',
            duration: '3 months',
            source: 'biotics',
            product_recommendation: 'ResveraSirt-HP',
            rationale: 'Activates anti-inflammatory pathways',
            precautions: 'May interact with blood thinners'
          }
        )
        break

      case 'Vitamin D Deficiency':
        supplements.push({
          name: 'Vitamin D3',
          dosage: pattern.supporting_markers[0].value < 30 ? '5000IU' : '2000IU',
          frequency: 'once daily',
          timing: 'with fatty meal',
          duration: '3 months then retest',
          source: 'letsTruck',
          product_recommendation: 'LetsTruck D3-K2',
          rationale: 'Corrects deficiency, supports immune function and mood',
          precautions: 'Includes K2 for proper calcium metabolism'
        })
        break

      case 'B12 Insufficiency':
        supplements.push({
          name: 'Methylcobalamin B12',
          dosage: '1000mcg',
          frequency: 'once daily',
          timing: 'morning',
          duration: '3 months',
          source: 'letsTruck',
          product_recommendation: 'LetsTruck Active B12',
          rationale: 'Active form of B12 for better absorption',
          precautions: 'Sublingual for best absorption'
        })
        break

      case 'Iron Deficiency':
        supplements.push({
          name: 'Iron Bisglycinate',
          dosage: '25mg',
          frequency: 'once daily',
          timing: 'empty stomach or with vitamin C',
          duration: '3 months',
          source: 'fullscript',
          product_recommendation: 'Ferrochel Iron Chelate',
          rationale: 'Gentle, well-absorbed form of iron',
          precautions: 'Take away from coffee, tea, and calcium'
        })
        break

      case 'Testosterone Deficiency':
        supplements.push(
          {
            name: 'DHEA',
            dosage: '25mg',
            frequency: 'once daily',
            timing: 'morning',
            duration: '3 months',
            source: 'biotics',
            product_recommendation: 'DHEA 25mg',
            rationale: 'Precursor to testosterone, supports hormone production',
            precautions: 'Monitor levels; not for women'
          },
          {
            name: 'Zinc',
            dosage: '30mg',
            frequency: 'once daily',
            timing: 'bedtime',
            duration: '3 months',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck Zinc Balance',
            rationale: 'Essential for testosterone production',
            precautions: 'Take away from iron and calcium'
          },
          {
            name: 'Vitamin D3',
            dosage: '5000IU',
            frequency: 'once daily',
            timing: 'with meal',
            duration: 'ongoing',
            source: 'letsTruck',
            product_recommendation: 'LetsTruck D3-K2',
            rationale: 'Low vitamin D correlates with low testosterone',
            precautions: 'Monitor levels every 3 months'
          }
        )
        break
    }

    // Filter based on budget if preferences provided
    if (preferences?.supplement_budget === 'low') {
      return supplements.slice(0, 2) // Return only top 2 most important
    } else if (preferences?.supplement_budget === 'medium') {
      return supplements.slice(0, 3) // Return top 3
    }

    return supplements
  }

  private deduplicateSupplements(supplements: SupplementRecommendation[]): SupplementRecommendation[] {
    const unique = new Map<string, SupplementRecommendation>()
    
    for (const supplement of supplements) {
      const existing = unique.get(supplement.name)
      if (!existing || this.isHigherPriority(supplement, existing)) {
        unique.set(supplement.name, supplement)
      }
    }

    return Array.from(unique.values())
  }

  private isHigherPriority(a: SupplementRecommendation, b: SupplementRecommendation): boolean {
    // Prefer letsTruck > biotics > fullscript
    const sourceOrder = { letsTruck: 0, biotics: 1, fullscript: 2 }
    return sourceOrder[a.source] < sourceOrder[b.source]
  }

  private prioritizeSupplements(
    supplements: SupplementRecommendation[],
    patterns: LabPattern[]
  ): SupplementRecommendation[] {
    // Sort by pattern priority
    const highPriorityPatterns = patterns
      .filter(p => p.priority_level === 'immediate' || p.priority_level === 'high')
      .map(p => p.pattern_name)

    return supplements.sort((a, b) => {
      // Check if supplements are for high priority patterns
      const aHighPriority = highPriorityPatterns.some(pattern => 
        a.rationale.toLowerCase().includes(pattern.toLowerCase())
      )
      const bHighPriority = highPriorityPatterns.some(pattern => 
        b.rationale.toLowerCase().includes(pattern.toLowerCase())
      )

      if (aHighPriority && !bHighPriority) return -1
      if (!aHighPriority && bHighPriority) return 1
      
      return 0
    })
  }

  private estimateSupplementCost(supplement: SupplementRecommendation): number {
    // Rough estimates for monthly costs
    const costEstimates: Record<string, number> = {
      'Berberine': 30,
      'Chromium Picolinate': 10,
      'Alpha Lipoic Acid': 25,
      'Selenium': 15,
      'Iodine/Iodide': 20,
      'Tyrosine': 20,
      'Omega-3 (EPA/DHA)': 35,
      'Curcumin': 30,
      'Resveratrol': 40,
      'Vitamin D3': 15,
      'Methylcobalamin B12': 15,
      'Iron Bisglycinate': 15,
      'DHEA': 20,
      'Zinc': 10
    }

    return costEstimates[supplement.name] || 25
  }

  private determineProtocolPriority(patterns: LabPattern[]): 'immediate' | 'short_term' | 'long_term' {
    const hasImmediate = patterns.some(p => p.priority_level === 'immediate')
    const hasHigh = patterns.some(p => p.priority_level === 'high')

    if (hasImmediate) return 'immediate'
    if (hasHigh) return 'short_term'
    return 'long_term'
  }

  private async generateDietaryProtocol(
    patterns: LabPattern[],
    aiAnalysis: AIAnalysis,
    preferences?: ClientPreferences
  ): Promise<LabProtocol | null> {
    const modifications: DietaryModification[] = []

    // Pattern-specific dietary recommendations
    for (const pattern of patterns) {
      const dietMods = this.getDietaryModsForPattern(pattern, preferences)
      modifications.push(...dietMods)
    }

    if (modifications.length === 0) {
      return null
    }

    return {
      id: '',
      lab_result_id: '',
      client_id: '',
      protocol_type: 'dietary',
      priority: this.determineProtocolPriority(patterns),
      title: 'Therapeutic Dietary Protocol',
      description: 'Dietary modifications to address your specific lab patterns and optimize health.',
      dietary_modifications: modifications,
      truck_driver_adaptations: 'All recommendations include truck-stop friendly alternatives and meal prep strategies for life on the road.',
      created_at: new Date()
    }
  }

  private getDietaryModsForPattern(
    pattern: LabPattern,
    preferences?: ClientPreferences
  ): DietaryModification[] {
    const modifications: DietaryModification[] = []

    switch (pattern.pattern_name) {
      case 'Insulin Resistance':
      case 'Metabolic Syndrome':
        modifications.push(
          {
            category: 'Carbohydrate Management',
            recommendation: 'Limit carbs to 100-150g/day, focus on low glycemic options',
            truck_driver_friendly: true,
            alternatives: [
              'Replace sandwiches with lettuce wraps',
              'Choose nuts over chips',
              'Protein bars instead of candy bars',
              'Hard-boiled eggs instead of muffins'
            ],
            meal_timing: 'Eat carbs only with protein/fat, never alone'
          },
          {
            category: 'Intermittent Fasting',
            recommendation: '16:8 fasting window - skip breakfast, eat lunch and dinner',
            truck_driver_friendly: true,
            alternatives: [
              'Black coffee in morning',
              'First meal at noon',
              'Last meal by 8pm',
              'Fits well with driving schedule'
            ],
            meal_timing: '12pm-8pm eating window'
          },
          {
            category: 'Protein Increase',
            recommendation: 'Aim for 30g protein per meal minimum',
            truck_driver_friendly: true,
            alternatives: [
              'Rotisserie chicken from grocery stores',
              'Protein shakes in truck',
              'Beef jerky (low sugar varieties)',
              'Canned fish with crackers'
            ]
          }
        )
        break

      case 'Chronic Inflammation':
        modifications.push(
          {
            category: 'Anti-Inflammatory Foods',
            recommendation: 'Increase omega-3 rich foods and colorful vegetables',
            truck_driver_friendly: true,
            alternatives: [
              'Canned wild salmon',
              'Walnuts and almonds',
              'Pre-cut veggies with hummus',
              'Green tea instead of soda'
            ]
          },
          {
            category: 'Eliminate Inflammatory Foods',
            recommendation: 'Remove processed foods, sugar, and trans fats',
            truck_driver_friendly: true,
            alternatives: [
              'Skip fried foods at truck stops',
              'Choose grilled over breaded',
              'Water instead of soda',
              'Fresh fruit instead of pastries'
            ]
          }
        )
        break

      case 'Thyroid Dysfunction':
        modifications.push(
          {
            category: 'Thyroid Support',
            recommendation: 'Include selenium and iodine rich foods',
            truck_driver_friendly: true,
            alternatives: [
              'Brazil nuts (2-3 daily for selenium)',
              'Seaweed snacks',
              'Canned fish',
              'Eggs for tyrosine'
            ]
          },
          {
            category: 'Avoid Goitrogens',
            recommendation: 'Limit raw cruciferous vegetables',
            truck_driver_friendly: true,
            alternatives: [
              'Cook broccoli and cabbage',
              'Limit soy products',
              'Choose cooked over raw veggies'
            ]
          }
        )
        break
    }

    // Filter out any foods on restriction list
    if (preferences?.dietary_restrictions) {
      return modifications.map(mod => ({
        ...mod,
        alternatives: mod.alternatives.filter(alt => 
          !preferences.dietary_restrictions?.some(restriction => 
            alt.toLowerCase().includes(restriction.toLowerCase())
          )
        )
      }))
    }

    return modifications
  }

  private async generateLifestyleProtocol(
    patterns: LabPattern[],
    aiAnalysis: AIAnalysis,
    preferences?: ClientPreferences
  ): Promise<LabProtocol | null> {
    const interventions: LifestyleIntervention[] = []

    // Universal recommendations for truckers
    interventions.push(
      {
        area: 'sleep',
        recommendation: 'Aim for 7-8 hours of quality sleep',
        truck_cab_adaptation: 'Blackout curtains for cab, white noise machine, cooling mattress pad, consistent sleep schedule even on different routes',
        priority: 'high'
      },
      {
        area: 'exercise',
        recommendation: 'Minimum 150 minutes moderate exercise weekly',
        truck_cab_adaptation: 'Resistance bands in truck, bodyweight exercises during fuel stops, walking during mandatory breaks, yoga stretches for back health',
        priority: 'high'
      }
    )

    // Pattern-specific lifestyle recommendations
    for (const pattern of patterns) {
      const lifestyleMods = this.getLifestyleModsForPattern(pattern)
      interventions.push(...lifestyleMods)
    }

    return {
      id: '',
      lab_result_id: '',
      client_id: '',
      protocol_type: 'lifestyle',
      priority: 'short_term',
      title: 'Lifestyle Optimization Protocol',
      description: 'Evidence-based lifestyle changes to improve your lab markers and overall health.',
      lifestyle_interventions: interventions,
      truck_driver_adaptations: 'All recommendations adapted for over-the-road implementation with specific truck cab modifications.',
      created_at: new Date()
    }
  }

  private getLifestyleModsForPattern(pattern: LabPattern): LifestyleIntervention[] {
    const interventions: LifestyleIntervention[] = []

    switch (pattern.pattern_name) {
      case 'Insulin Resistance':
      case 'Metabolic Syndrome':
        interventions.push({
          area: 'exercise',
          recommendation: 'Add resistance training 3x/week',
          truck_cab_adaptation: 'TRX straps anchor to truck, resistance bands with door anchor, push-ups and squats during pre-trip inspection',
          priority: 'high'
        })
        break

      case 'Chronic Inflammation':
        interventions.push({
          area: 'stress',
          recommendation: 'Daily stress reduction practice',
          truck_cab_adaptation: 'Breathing exercises while driving (4-7-8 breath), meditation apps during breaks, calming music playlist',
          priority: 'high'
        })
        break

      case 'Testosterone Deficiency':
        interventions.push(
          {
            area: 'exercise',
            recommendation: 'Heavy resistance training to boost testosterone',
            truck_cab_adaptation: 'Adjustable dumbbells in truck, focus on compound movements, morning workouts to boost T levels',
            priority: 'high'
          },
          {
            area: 'sleep',
            recommendation: 'Prioritize deep sleep for hormone production',
            truck_cab_adaptation: 'Sleep by 10pm when possible, complete darkness in cab, keep cab cool (65-68°F)',
            priority: 'high'
          }
        )
        break

      case 'Thyroid Dysfunction':
        interventions.push({
          area: 'environment',
          recommendation: 'Reduce toxin exposure',
          truck_cab_adaptation: 'Air purifier for cab, avoid idling when possible, organic foods when available, filtered water',
          priority: 'medium'
        })
        break
    }

    return interventions
  }

  private async generateRetestProtocol(
    patterns: LabPattern[],
    aiAnalysis: AIAnalysis
  ): Promise<LabProtocol | null> {
    const retestSchedule: RetestSchedule = {
      urgent_retest: [],
      three_month_retest: [],
      six_month_retest: [],
      annual_retest: []
    }

    // Determine retest schedule based on patterns
    for (const pattern of patterns) {
      const markers = this.getRetestMarkersForPattern(pattern)
      
      if (pattern.priority_level === 'immediate') {
        retestSchedule.urgent_retest?.push(...markers)
      } else if (pattern.priority_level === 'high') {
        retestSchedule.three_month_retest?.push(...markers)
      } else if (pattern.priority_level === 'moderate') {
        retestSchedule.six_month_retest?.push(...markers)
      } else {
        retestSchedule.annual_retest?.push(...markers)
      }
    }

    // Remove duplicates
    retestSchedule.urgent_retest = [...new Set(retestSchedule.urgent_retest)]
    retestSchedule.three_month_retest = [...new Set(retestSchedule.three_month_retest)]
    retestSchedule.six_month_retest = [...new Set(retestSchedule.six_month_retest)]
    retestSchedule.annual_retest = [...new Set(retestSchedule.annual_retest)]

    return {
      id: '',
      lab_result_id: '',
      client_id: '',
      protocol_type: 'retest',
      priority: 'long_term',
      title: 'Lab Retesting Schedule',
      description: 'Strategic retesting schedule to monitor progress and adjust protocols.',
      retest_schedule: retestSchedule,
      truck_driver_adaptations: 'Schedule tests during home time or at truck stop clinics. LabCorp and Quest have locations near major truck stops.',
      created_at: new Date()
    }
  }

  private getRetestMarkersForPattern(pattern: LabPattern): string[] {
    const markerMap: Record<string, string[]> = {
      'Insulin Resistance': ['Fasting Glucose', 'Fasting Insulin', 'HbA1c', 'Triglycerides'],
      'Metabolic Syndrome': ['Lipid Panel', 'HbA1c', 'Fasting Glucose', 'Insulin'],
      'Thyroid Dysfunction': ['TSH', 'Free T4', 'Free T3', 'Reverse T3'],
      'Chronic Inflammation': ['hs-CRP', 'ESR', 'Homocysteine'],
      'Vitamin D Deficiency': ['Vitamin D, 25-OH'],
      'B12 Insufficiency': ['Vitamin B12', 'Homocysteine', 'MMA'],
      'Iron Deficiency': ['Ferritin', 'Iron', 'TIBC', 'Iron Saturation'],
      'Testosterone Deficiency': ['Testosterone Total', 'Testosterone Free', 'SHBG', 'LH', 'FSH'],
      'Adrenal Dysfunction': ['Cortisol AM', 'DHEA-S']
    }

    return markerMap[pattern.pattern_name] || []
  }
}

export default ProtocolGenerator