import ClaudeClient from '@/lib/claude-client'
import { 
  LabValue, 
  LabPattern, 
  AIAnalysis, 
  FunctionalAssessment,
  HealthScore,
  PatternAnalysis,
  TruckDriverAnalysis,
  DOTCompliance,
  LabTestCatalog,
  SupportingMarker
} from '@/types/lab-analysis'

export class LabAIAnalyzer {
  private claudeClient: ClaudeClient

  constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }

  async analyzeLabResults(
    labValues: LabValue[], 
    testCatalog: LabTestCatalog[],
    clientContext?: {
      age?: number
      gender?: string
      isCommercialDriver?: boolean
      symptoms?: string[]
      medications?: string[]
    }
  ): Promise<AIAnalysis> {
    console.log('[AI-ANALYZER] Starting lab analysis with', labValues.length, 'values')

    try {
      // Prepare the analysis prompt
      const prompt = this.buildAnalysisPrompt(labValues, testCatalog, clientContext)
      
      const systemPrompt = `You are Kevin Rutherford, FNTP (Functional Nutritional Therapy Practitioner) with deep expertise in functional medicine lab interpretation. You specialize in analyzing lab results for truck drivers and understanding how their unique lifestyle impacts their health markers.

Your approach:
1. Use functional/optimal ranges from Kresser Institute and IFM, not just standard ranges
2. Look for patterns and root causes, not just individual markers
3. Consider the truck driver lifestyle: irregular sleep, limited food options, sedentary work, stress
4. Connect lab findings to real-world symptoms and health outcomes
5. Prioritize interventions that are practical for over-the-road implementation

Always analyze labs through a functional medicine lens, identifying:
- Subclinical patterns before they become disease
- Root cause connections between different systems
- How lifestyle factors specific to trucking impact the results
- Which patterns pose the greatest risk to DOT certification

Format your response as a detailed JSON analysis following the specified structure.`

      // Get Claude's analysis
      const response = await this.claudeClient.analyzeWithClaude(prompt, systemPrompt)
      
      // Parse the response
      const analysis = this.parseAIResponse(response)
      
      // Enhance with pattern detection
      const patterns = await this.detectPatterns(labValues, testCatalog)
      analysis.pattern_analysis = {
        primary_patterns: patterns.filter(p => p.confidence_score > 0.8),
        secondary_patterns: patterns.filter(p => p.confidence_score > 0.6 && p.confidence_score <= 0.8),
        emerging_patterns: patterns.filter(p => p.confidence_score > 0.4 && p.confidence_score <= 0.6)
      }

      return analysis
    } catch (error) {
      console.error('[AI-ANALYZER] Analysis error:', error)
      throw new Error('Failed to analyze lab results')
    }
  }

  private buildAnalysisPrompt(
    labValues: LabValue[], 
    testCatalog: LabTestCatalog[],
    context?: any
  ): string {
    // Create a map of test codes to catalog entries
    const catalogMap = new Map(testCatalog.map(t => [t.test_code, t]))

    // Format lab values with ranges
    const formattedValues = labValues.map(value => {
      const catalog = testCatalog.find(t => 
        t.test_name.toLowerCase() === value.test_name.toLowerCase() ||
        t.test_code === value.test_name
      )

      return {
        test: value.test_name,
        value: value.value || value.value_text,
        unit: value.unit,
        reference_range: value.reference_range,
        flag: value.flag,
        optimal_range: catalog ? `${catalog.optimal_range_low}-${catalog.optimal_range_high}` : 'Unknown',
        truck_driver_range: catalog ? `${catalog.truck_driver_range_low}-${catalog.truck_driver_range_high}` : 'Unknown',
        clinical_significance: catalog?.clinical_significance,
        truck_driver_considerations: catalog?.truck_driver_considerations
      }
    })

    const contextInfo = context ? `
Client Context:
- Age: ${context.age || 'Unknown'}
- Gender: ${context.gender || 'Unknown'}
- Commercial Driver: ${context.isCommercialDriver ? 'Yes' : 'No'}
- Current Symptoms: ${context.symptoms?.join(', ') || 'None reported'}
- Current Medications: ${context.medications?.join(', ') || 'None reported'}
` : ''

    return `Analyze these lab results using functional medicine principles:

${contextInfo}

Lab Results:
${JSON.stringify(formattedValues, null, 2)}

Provide a comprehensive functional medicine analysis in this exact JSON format:
{
  "summary": "Brief overview of overall health status and key findings",
  "key_findings": ["List of most important findings"],
  "functional_assessment": {
    "metabolic_health": {
      "score": 0-100,
      "status": "optimal|good|suboptimal|poor|critical",
      "key_markers": ["list of relevant markers"],
      "interpretation": "Detailed interpretation"
    },
    "hormonal_balance": { ... same structure ... },
    "inflammatory_status": { ... same structure ... },
    "nutritional_status": { ... same structure ... },
    "detoxification": { ... same structure ... },
    "overall_vitality": { ... same structure ... }
  },
  "root_causes": ["List of identified root causes"],
  "clinical_pearls": ["Functional medicine insights specific to these results"],
  "truck_driver_specific": {
    "dot_compliance": {
      "status": "compliant|at_risk|non_compliant",
      "concerning_markers": ["List markers affecting DOT"],
      "certification_impact": "How this affects DOT certification",
      "action_required": "What needs to be done"
    },
    "occupational_risks": ["Health risks specific to trucking"],
    "lifestyle_factors": ["Lifestyle factors affecting results"],
    "priority_interventions": ["Most important changes needed"],
    "road_compatible_solutions": ["Practical solutions for OTR lifestyle"]
  }
}`
  }

  private parseAIResponse(response: string): AIAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and transform the response
      return {
        summary: parsed.summary || 'Analysis completed',
        key_findings: parsed.key_findings || [],
        functional_assessment: this.validateFunctionalAssessment(parsed.functional_assessment),
        pattern_analysis: parsed.pattern_analysis || { primary_patterns: [], secondary_patterns: [], emerging_patterns: [] },
        root_causes: parsed.root_causes || [],
        clinical_pearls: parsed.clinical_pearls || [],
        truck_driver_specific: this.validateTruckDriverAnalysis(parsed.truck_driver_specific)
      }
    } catch (error) {
      console.error('[AI-ANALYZER] Failed to parse AI response:', error)
      
      // Return a default analysis
      return {
        summary: 'Analysis completed but response parsing failed',
        key_findings: ['Unable to parse detailed findings'],
        functional_assessment: this.getDefaultFunctionalAssessment(),
        pattern_analysis: { primary_patterns: [], secondary_patterns: [], emerging_patterns: [] },
        root_causes: [],
        clinical_pearls: [],
        truck_driver_specific: this.getDefaultTruckDriverAnalysis()
      }
    }
  }

  private validateFunctionalAssessment(assessment: any): FunctionalAssessment {
    const categories = ['metabolic_health', 'hormonal_balance', 'inflammatory_status', 'nutritional_status', 'detoxification', 'overall_vitality']
    const validated: any = {}

    for (const category of categories) {
      if (assessment && assessment[category]) {
        validated[category] = this.validateHealthScore(assessment[category])
      } else {
        validated[category] = this.getDefaultHealthScore()
      }
    }

    return validated as FunctionalAssessment
  }

  private validateHealthScore(score: any): HealthScore {
    return {
      score: typeof score.score === 'number' ? score.score : 50,
      status: ['optimal', 'good', 'suboptimal', 'poor', 'critical'].includes(score.status) ? score.status : 'suboptimal',
      key_markers: Array.isArray(score.key_markers) ? score.key_markers : [],
      interpretation: score.interpretation || 'No interpretation available'
    }
  }

  private validateTruckDriverAnalysis(analysis: any): TruckDriverAnalysis {
    if (!analysis) {
      return this.getDefaultTruckDriverAnalysis()
    }

    return {
      dot_compliance: this.validateDOTCompliance(analysis.dot_compliance),
      occupational_risks: Array.isArray(analysis.occupational_risks) ? analysis.occupational_risks : [],
      lifestyle_factors: Array.isArray(analysis.lifestyle_factors) ? analysis.lifestyle_factors : [],
      priority_interventions: Array.isArray(analysis.priority_interventions) ? analysis.priority_interventions : [],
      road_compatible_solutions: Array.isArray(analysis.road_compatible_solutions) ? analysis.road_compatible_solutions : []
    }
  }

  private validateDOTCompliance(compliance: any): DOTCompliance {
    if (!compliance) {
      return {
        status: 'compliant',
        concerning_markers: [],
        certification_impact: 'No immediate concerns',
        action_required: 'Continue monitoring'
      }
    }

    return {
      status: ['compliant', 'at_risk', 'non_compliant'].includes(compliance.status) ? compliance.status : 'compliant',
      concerning_markers: Array.isArray(compliance.concerning_markers) ? compliance.concerning_markers : [],
      certification_impact: compliance.certification_impact || 'No immediate concerns',
      action_required: compliance.action_required || 'Continue monitoring'
    }
  }

  private getDefaultFunctionalAssessment(): FunctionalAssessment {
    const defaultScore = this.getDefaultHealthScore()
    return {
      metabolic_health: defaultScore,
      hormonal_balance: defaultScore,
      inflammatory_status: defaultScore,
      nutritional_status: defaultScore,
      detoxification: defaultScore,
      overall_vitality: defaultScore
    }
  }

  private getDefaultHealthScore(): HealthScore {
    return {
      score: 50,
      status: 'suboptimal',
      key_markers: [],
      interpretation: 'Requires further analysis'
    }
  }

  private getDefaultTruckDriverAnalysis(): TruckDriverAnalysis {
    return {
      dot_compliance: {
        status: 'compliant',
        concerning_markers: [],
        certification_impact: 'No immediate concerns',
        action_required: 'Continue monitoring'
      },
      occupational_risks: [],
      lifestyle_factors: [],
      priority_interventions: [],
      road_compatible_solutions: []
    }
  }

  async detectPatterns(labValues: LabValue[], testCatalog: LabTestCatalog[]): Promise<LabPattern[]> {
    const patterns: LabPattern[] = []

    // Metabolic patterns
    const insulinResistance = this.detectInsulinResistance(labValues, testCatalog)
    if (insulinResistance) patterns.push(insulinResistance)

    const metabolicSyndrome = this.detectMetabolicSyndrome(labValues, testCatalog)
    if (metabolicSyndrome) patterns.push(metabolicSyndrome)

    // Thyroid patterns
    const thyroidDysfunction = this.detectThyroidDysfunction(labValues, testCatalog)
    if (thyroidDysfunction) patterns.push(thyroidDysfunction)

    // Inflammatory patterns
    const inflammation = this.detectInflammation(labValues, testCatalog)
    if (inflammation) patterns.push(inflammation)

    // Nutritional patterns
    const nutritionalDeficiencies = this.detectNutritionalDeficiencies(labValues, testCatalog)
    patterns.push(...nutritionalDeficiencies)

    // Hormonal patterns
    const hormonalImbalances = this.detectHormonalImbalances(labValues, testCatalog)
    patterns.push(...hormonalImbalances)

    return patterns
  }

  private detectInsulinResistance(labValues: LabValue[], testCatalog: LabTestCatalog[]): LabPattern | null {
    const markers: SupportingMarker[] = []
    let confidence = 0

    // Check glucose
    const glucose = this.findLabValue(labValues, ['Glucose', 'Glucose, Fasting', 'FBG'])
    if (glucose && glucose.value) {
      const glucoseValue = Number(glucose.value)
      if (glucoseValue > 90) {
        confidence += 0.2
        markers.push({
          test_name: glucose.test_name,
          value: glucoseValue,
          unit: glucose.unit || 'mg/dL',
          contribution: 'primary',
          interpretation: glucoseValue > 100 ? 'Elevated fasting glucose' : 'Suboptimal glucose'
        })
      }
    }

    // Check insulin
    const insulin = this.findLabValue(labValues, ['Insulin', 'Insulin, Fasting'])
    if (insulin && insulin.value) {
      const insulinValue = Number(insulin.value)
      if (insulinValue > 5) {
        confidence += 0.3
        markers.push({
          test_name: insulin.test_name,
          value: insulinValue,
          unit: insulin.unit || 'μIU/mL',
          contribution: 'primary',
          interpretation: insulinValue > 10 ? 'Significantly elevated insulin' : 'Elevated fasting insulin'
        })
      }
    }

    // Check HbA1c
    const hba1c = this.findLabValue(labValues, ['HbA1c', 'Hemoglobin A1c', 'A1C'])
    if (hba1c && hba1c.value) {
      const hba1cValue = Number(hba1c.value)
      if (hba1cValue > 5.3) {
        confidence += 0.2
        markers.push({
          test_name: hba1c.test_name,
          value: hba1cValue,
          unit: hba1c.unit || '%',
          contribution: 'supporting',
          interpretation: hba1cValue > 5.7 ? 'Prediabetic range' : 'Suboptimal glycemic control'
        })
      }
    }

    // Check triglycerides
    const triglycerides = this.findLabValue(labValues, ['Triglycerides', 'TRIG'])
    if (triglycerides && triglycerides.value) {
      const trigValue = Number(triglycerides.value)
      if (trigValue > 100) {
        confidence += 0.15
        markers.push({
          test_name: triglycerides.test_name,
          value: trigValue,
          unit: triglycerides.unit || 'mg/dL',
          contribution: 'supporting',
          interpretation: 'Elevated triglycerides suggesting insulin resistance'
        })
      }
    }

    // Check HDL
    const hdl = this.findLabValue(labValues, ['HDL', 'HDL Cholesterol'])
    if (hdl && hdl.value) {
      const hdlValue = Number(hdl.value)
      if (hdlValue < 50) {
        confidence += 0.15
        markers.push({
          test_name: hdl.test_name,
          value: hdlValue,
          unit: hdl.unit || 'mg/dL',
          contribution: 'supporting',
          interpretation: 'Low HDL associated with insulin resistance'
        })
      }
    }

    if (confidence > 0.3 && markers.length > 0) {
      return {
        pattern_name: 'Insulin Resistance',
        pattern_category: 'metabolic',
        confidence_score: Math.min(confidence, 1),
        supporting_markers: markers,
        clinical_significance: 'Early metabolic dysfunction that precedes type 2 diabetes. Associated with increased cardiovascular risk, weight gain, and fatigue.',
        truck_driver_impact: 'Common in truckers due to sedentary work, irregular meals, and limited healthy food options. Can affect DOT certification if progresses to diabetes.',
        priority_level: confidence > 0.6 ? 'high' : 'moderate'
      }
    }

    return null
  }

  private detectMetabolicSyndrome(labValues: LabValue[], testCatalog: LabTestCatalog[]): LabPattern | null {
    const criteria: SupportingMarker[] = []
    let metSynCriteria = 0

    // Waist circumference would need to come from physical exam
    // We'll focus on lab markers

    // Elevated triglycerides (≥150 mg/dL)
    const trig = this.findLabValue(labValues, ['Triglycerides', 'TRIG'])
    if (trig && trig.value && Number(trig.value) >= 150) {
      metSynCriteria++
      criteria.push({
        test_name: trig.test_name,
        value: Number(trig.value),
        unit: trig.unit || 'mg/dL',
        contribution: 'primary',
        interpretation: 'Meets metabolic syndrome criteria for triglycerides'
      })
    }

    // Low HDL (<40 men, <50 women)
    const hdl = this.findLabValue(labValues, ['HDL', 'HDL Cholesterol'])
    if (hdl && hdl.value && Number(hdl.value) < 50) {
      metSynCriteria++
      criteria.push({
        test_name: hdl.test_name,
        value: Number(hdl.value),
        unit: hdl.unit || 'mg/dL',
        contribution: 'primary',
        interpretation: 'Meets metabolic syndrome criteria for low HDL'
      })
    }

    // Elevated glucose (≥100 mg/dL)
    const glucose = this.findLabValue(labValues, ['Glucose', 'Glucose, Fasting'])
    if (glucose && glucose.value && Number(glucose.value) >= 100) {
      metSynCriteria++
      criteria.push({
        test_name: glucose.test_name,
        value: Number(glucose.value),
        unit: glucose.unit || 'mg/dL',
        contribution: 'primary',
        interpretation: 'Meets metabolic syndrome criteria for glucose'
      })
    }

    // Blood pressure would need to come from vitals
    // We could check for medications suggesting hypertension

    if (metSynCriteria >= 2) {
      return {
        pattern_name: 'Metabolic Syndrome',
        pattern_category: 'metabolic',
        confidence_score: metSynCriteria >= 3 ? 0.9 : 0.7,
        supporting_markers: criteria,
        clinical_significance: 'Cluster of conditions increasing risk of heart disease, stroke, and type 2 diabetes.',
        truck_driver_impact: 'High prevalence in truckers. Significantly impacts DOT certification and increases risk of medical disqualification.',
        priority_level: 'high'
      }
    }

    return null
  }

  private detectThyroidDysfunction(labValues: LabValue[], testCatalog: LabTestCatalog[]): LabPattern | null {
    const markers: SupportingMarker[] = []
    let confidence = 0
    let pattern = ''

    // Check TSH
    const tsh = this.findLabValue(labValues, ['TSH', 'Thyroid Stimulating Hormone'])
    if (tsh && tsh.value) {
      const tshValue = Number(tsh.value)
      if (tshValue > 2.5) {
        confidence += 0.4
        pattern = 'Hypothyroid'
        markers.push({
          test_name: tsh.test_name,
          value: tshValue,
          unit: tsh.unit || 'mIU/L',
          contribution: 'primary',
          interpretation: tshValue > 4.5 ? 'Clinically elevated TSH' : 'Suboptimal TSH suggesting early thyroid dysfunction'
        })
      } else if (tshValue < 0.5) {
        confidence += 0.4
        pattern = 'Hyperthyroid'
        markers.push({
          test_name: tsh.test_name,
          value: tshValue,
          unit: tsh.unit || 'mIU/L',
          contribution: 'primary',
          interpretation: 'Low TSH suggesting hyperthyroid state'
        })
      }
    }

    // Check Free T4
    const ft4 = this.findLabValue(labValues, ['Free T4', 'FT4', 'Free Thyroxine'])
    if (ft4 && ft4.value) {
      const ft4Value = Number(ft4.value)
      if (pattern === 'Hypothyroid' && ft4Value < 1.2) {
        confidence += 0.2
        markers.push({
          test_name: ft4.test_name,
          value: ft4Value,
          unit: ft4.unit || 'ng/dL',
          contribution: 'supporting',
          interpretation: 'Low-normal Free T4 supporting hypothyroid pattern'
        })
      }
    }

    // Check Free T3
    const ft3 = this.findLabValue(labValues, ['Free T3', 'FT3'])
    if (ft3 && ft3.value) {
      const ft3Value = Number(ft3.value)
      if (ft3Value < 3.0) {
        confidence += 0.2
        markers.push({
          test_name: ft3.test_name,
          value: ft3Value,
          unit: ft3.unit || 'pg/mL',
          contribution: 'supporting',
          interpretation: 'Suboptimal Free T3 affecting cellular metabolism'
        })
      }
    }

    // Check Reverse T3 if available
    const rt3 = this.findLabValue(labValues, ['Reverse T3', 'RT3'])
    if (rt3 && rt3.value) {
      const rt3Value = Number(rt3.value)
      if (rt3Value > 20) {
        confidence += 0.2
        pattern = pattern || 'Thyroid Conversion Issue'
        markers.push({
          test_name: rt3.test_name,
          value: rt3Value,
          unit: rt3.unit || 'ng/dL',
          contribution: 'supporting',
          interpretation: 'Elevated Reverse T3 blocking thyroid hormone action'
        })
      }
    }

    if (confidence > 0.3 && markers.length > 0) {
      return {
        pattern_name: pattern || 'Thyroid Dysfunction',
        pattern_category: 'hormonal',
        confidence_score: Math.min(confidence, 1),
        supporting_markers: markers,
        clinical_significance: 'Thyroid dysfunction affects metabolism, energy, weight, and cognitive function.',
        truck_driver_impact: 'Can cause fatigue, brain fog, and slow reaction times affecting driving safety. Weight gain can complicate DOT physical.',
        priority_level: confidence > 0.6 ? 'high' : 'moderate'
      }
    }

    return null
  }

  private detectInflammation(labValues: LabValue[], testCatalog: LabTestCatalog[]): LabPattern | null {
    const markers: SupportingMarker[] = []
    let confidence = 0

    // Check hs-CRP
    const crp = this.findLabValue(labValues, ['hs-CRP', 'CRP', 'C-Reactive Protein'])
    if (crp && crp.value) {
      const crpValue = Number(crp.value)
      if (crpValue > 1.0) {
        confidence += 0.4
        markers.push({
          test_name: crp.test_name,
          value: crpValue,
          unit: crp.unit || 'mg/L',
          contribution: 'primary',
          interpretation: crpValue > 3.0 ? 'High cardiovascular risk' : 'Moderate inflammation'
        })
      }
    }

    // Check Ferritin
    const ferritin = this.findLabValue(labValues, ['Ferritin'])
    if (ferritin && ferritin.value) {
      const ferritinValue = Number(ferritin.value)
      if (ferritinValue > 200) {
        confidence += 0.2
        markers.push({
          test_name: ferritin.test_name,
          value: ferritinValue,
          unit: ferritin.unit || 'ng/mL',
          contribution: 'supporting',
          interpretation: 'Elevated ferritin can indicate inflammation'
        })
      }
    }

    // Check Homocysteine
    const homocysteine = this.findLabValue(labValues, ['Homocysteine'])
    if (homocysteine && homocysteine.value) {
      const hcyValue = Number(homocysteine.value)
      if (hcyValue > 9) {
        confidence += 0.2
        markers.push({
          test_name: homocysteine.test_name,
          value: hcyValue,
          unit: homocysteine.unit || 'μmol/L',
          contribution: 'supporting',
          interpretation: 'Elevated homocysteine indicating inflammation and methylation issues'
        })
      }
    }

    // Check ESR if available
    const esr = this.findLabValue(labValues, ['ESR', 'Sed Rate'])
    if (esr && esr.value) {
      const esrValue = Number(esr.value)
      if (esrValue > 15) {
        confidence += 0.2
        markers.push({
          test_name: esr.test_name,
          value: esrValue,
          unit: esr.unit || 'mm/hr',
          contribution: 'supporting',
          interpretation: 'Elevated ESR confirming inflammatory state'
        })
      }
    }

    if (confidence > 0.3 && markers.length > 0) {
      return {
        pattern_name: 'Chronic Inflammation',
        pattern_category: 'inflammatory',
        confidence_score: Math.min(confidence, 1),
        supporting_markers: markers,
        clinical_significance: 'Systemic inflammation is the root of most chronic diseases including cardiovascular disease, diabetes, and cancer.',
        truck_driver_impact: 'Often caused by poor diet, stress, lack of exercise, and poor sleep - all common in trucking. Major risk factor for heart disease.',
        priority_level: confidence > 0.6 ? 'high' : 'moderate'
      }
    }

    return null
  }

  private detectNutritionalDeficiencies(labValues: LabValue[], testCatalog: LabTestCatalog[]): LabPattern[] {
    const patterns: LabPattern[] = []

    // Vitamin D deficiency
    const vitD = this.findLabValue(labValues, ['Vitamin D', '25-OH Vitamin D', 'Vitamin D, 25-OH'])
    if (vitD && vitD.value) {
      const vitDValue = Number(vitD.value)
      if (vitDValue < 50) {
        patterns.push({
          pattern_name: 'Vitamin D Deficiency',
          pattern_category: 'nutritional',
          confidence_score: vitDValue < 30 ? 0.9 : 0.7,
          supporting_markers: [{
            test_name: vitD.test_name,
            value: vitDValue,
            unit: vitD.unit || 'ng/mL',
            contribution: 'primary',
            interpretation: vitDValue < 30 ? 'Clinical deficiency' : 'Suboptimal vitamin D'
          }],
          clinical_significance: 'Vitamin D deficiency affects immune function, mood, bone health, and increases risk of chronic diseases.',
          truck_driver_impact: 'Very common due to limited sun exposure in truck cab. Contributes to fatigue, depression, and poor immune function.',
          priority_level: vitDValue < 30 ? 'high' : 'moderate'
        })
      }
    }

    // B12 deficiency
    const b12 = this.findLabValue(labValues, ['B12', 'Vitamin B12', 'Cobalamin'])
    if (b12 && b12.value) {
      const b12Value = Number(b12.value)
      if (b12Value < 500) {
        patterns.push({
          pattern_name: 'B12 Insufficiency',
          pattern_category: 'nutritional',
          confidence_score: b12Value < 300 ? 0.9 : 0.7,
          supporting_markers: [{
            test_name: b12.test_name,
            value: b12Value,
            unit: b12.unit || 'pg/mL',
            contribution: 'primary',
            interpretation: b12Value < 300 ? 'Clinical deficiency' : 'Suboptimal B12'
          }],
          clinical_significance: 'B12 deficiency causes fatigue, neuropathy, cognitive decline, and anemia.',
          truck_driver_impact: 'Can cause severe fatigue and cognitive issues affecting driving safety. Often missed with standard ranges.',
          priority_level: b12Value < 300 ? 'high' : 'moderate'
        })
      }
    }

    // Iron status
    const ferritin = this.findLabValue(labValues, ['Ferritin'])
    const iron = this.findLabValue(labValues, ['Iron', 'Serum Iron'])
    if (ferritin && ferritin.value) {
      const ferritinValue = Number(ferritin.value)
      if (ferritinValue < 50) {
        const markers: SupportingMarker[] = [{
          test_name: ferritin.test_name,
          value: ferritinValue,
          unit: ferritin.unit || 'ng/mL',
          contribution: 'primary',
          interpretation: 'Low ferritin indicating depleted iron stores'
        }]

        if (iron && iron.value) {
          markers.push({
            test_name: iron.test_name,
            value: Number(iron.value),
            unit: iron.unit || 'μg/dL',
            contribution: 'supporting',
            interpretation: 'Serum iron level'
          })
        }

        patterns.push({
          pattern_name: 'Iron Deficiency',
          pattern_category: 'nutritional',
          confidence_score: ferritinValue < 30 ? 0.9 : 0.7,
          supporting_markers: markers,
          clinical_significance: 'Iron deficiency causes fatigue, weakness, poor concentration, and decreased immune function.',
          truck_driver_impact: 'Major cause of fatigue affecting alertness and driving safety. Common with poor diet quality.',
          priority_level: ferritinValue < 30 ? 'high' : 'moderate'
        })
      }
    }

    return patterns
  }

  private detectHormonalImbalances(labValues: LabValue[], testCatalog: LabTestCatalog[]): LabPattern[] {
    const patterns: LabPattern[] = []

    // Testosterone deficiency (male)
    const testTotal = this.findLabValue(labValues, ['Testosterone', 'Testosterone, Total'])
    const testFree = this.findLabValue(labValues, ['Free Testosterone', 'Testosterone, Free'])
    
    if (testTotal && testTotal.value) {
      const totalT = Number(testTotal.value)
      if (totalT < 500) {
        const markers: SupportingMarker[] = [{
          test_name: testTotal.test_name,
          value: totalT,
          unit: testTotal.unit || 'ng/dL',
          contribution: 'primary',
          interpretation: totalT < 300 ? 'Clinical hypogonadism' : 'Suboptimal testosterone'
        }]

        if (testFree && testFree.value) {
          markers.push({
            test_name: testFree.test_name,
            value: Number(testFree.value),
            unit: testFree.unit || 'pg/mL',
            contribution: 'supporting',
            interpretation: 'Free testosterone level'
          })
        }

        patterns.push({
          pattern_name: 'Testosterone Deficiency',
          pattern_category: 'hormonal',
          confidence_score: totalT < 300 ? 0.9 : 0.7,
          supporting_markers: markers,
          clinical_significance: 'Low testosterone causes fatigue, depression, weight gain, decreased libido, and metabolic dysfunction.',
          truck_driver_impact: 'Extremely common in truckers due to obesity, poor sleep, and stress. Major contributor to fatigue and metabolic issues.',
          priority_level: totalT < 300 ? 'high' : 'moderate'
        })
      }
    }

    // Cortisol dysfunction
    const cortisol = this.findLabValue(labValues, ['Cortisol', 'Cortisol, AM'])
    if (cortisol && cortisol.value) {
      const cortisolValue = Number(cortisol.value)
      if (cortisolValue < 10 || cortisolValue > 20) {
        patterns.push({
          pattern_name: cortisolValue < 10 ? 'Adrenal Insufficiency' : 'Elevated Cortisol',
          pattern_category: 'hormonal',
          confidence_score: 0.7,
          supporting_markers: [{
            test_name: cortisol.test_name,
            value: cortisolValue,
            unit: cortisol.unit || 'μg/dL',
            contribution: 'primary',
            interpretation: cortisolValue < 10 ? 'Low morning cortisol' : 'Elevated cortisol suggesting chronic stress'
          }],
          clinical_significance: 'Cortisol dysfunction affects energy, stress response, blood sugar, and immune function.',
          truck_driver_impact: 'Shift work and chronic stress dysregulate cortisol. Affects energy levels and stress resilience.',
          priority_level: 'moderate'
        })
      }
    }

    return patterns
  }

  private findLabValue(labValues: LabValue[], possibleNames: string[]): LabValue | undefined {
    return labValues.find(value => 
      possibleNames.some(name => 
        value.test_name.toLowerCase().includes(name.toLowerCase())
      )
    )
  }
}

export default LabAIAnalyzer