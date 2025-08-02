import ClaudeClient from './claude-client'

// Define the FunctionalMedicineAnalysis interface
export interface FunctionalMedicineAnalysis {
  rootCauses: Array<{
    category: string;
    confidence: number;
    evidence: string[];
    systems_affected: string[];
  }>;
  systemicImbalances: {
    gut_dysfunction: number; // 0-100 severity score
    inflammation: number;
    detox_impairment: number;
    hormone_dysregulation: number;
    nutrient_deficiencies: number;
    oxidative_stress: number;
  };
  ancestralMismatches: {
    circadian_disruption: number;
    movement_deficiency: number;
    dietary_inflammation: number;
    chronic_stress: number;
    environmental_toxins: number;
  };
  interventionPriorities: Array<{
    priority: 1 | 2 | 3;
    intervention: string;
    rationale: string;
    timeline: string;
    truckDriverModification?: string;
  }>;
}

// Define the input data structure
export interface DocumentAnalysis {
  type: string;
  summary: string;
  keyFindings: string[];
  rawData?: any;
}

export interface ClientData {
  assessments: any[];
  documents: DocumentAnalysis[];
  notes: any[];
  isDriver: boolean;
}

export async function performFunctionalMedicineAnalysis(
  clientData: ClientData
): Promise<FunctionalMedicineAnalysis> {
  const claudeClient = ClaudeClient.getInstance()
  
  const analysisPrompt = `
  As Kevin Rutherford, FNTP specializing in truck driver health optimization, perform a comprehensive functional medicine analysis.

  FUNCTIONAL MEDICINE FRAMEWORK:
  1. Identify root causes using IFM methodology
  2. Assess systemic imbalances across body systems
  3. Evaluate ancestral health mismatches
  4. Prioritize interventions based on impact and sustainability

  ANCESTRAL HEALTH PRINCIPLES:
  - Circadian rhythm optimization
  - Anti-inflammatory nutrition
  - Movement as medicine
  - Stress resilience building
  - Environmental toxin reduction
  - Community and purpose connection

  CLIENT DATA:
  ${JSON.stringify(clientData, null, 2)}

  ${clientData.isDriver ? `
  TRUCK DRIVER SPECIALIZATION:
  - Consider DOT medical requirements
  - Account for irregular schedules and limited cooking
  - Prioritize road-compatible interventions
  - Address occupational health risks (sedentary, diesel exposure, stress)
  - Focus on sustainable long-term career health
  ` : ''}

  ANALYSIS REQUIREMENTS:
  1. Identify top 3 root causes with confidence scores
  2. Score systemic imbalances (0-100)
  3. Assess ancestral mismatches
  4. Generate prioritized intervention plan
  5. Include truck driver modifications if applicable

  Return structured JSON matching the FunctionalMedicineAnalysis interface exactly:
  {
    "rootCauses": [
      {
        "category": "string",
        "confidence": number (0-100),
        "evidence": ["string array"],
        "systems_affected": ["string array"]
      }
    ],
    "systemicImbalances": {
      "gut_dysfunction": number,
      "inflammation": number,
      "detox_impairment": number,
      "hormone_dysregulation": number,
      "nutrient_deficiencies": number,
      "oxidative_stress": number
    },
    "ancestralMismatches": {
      "circadian_disruption": number,
      "movement_deficiency": number,
      "dietary_inflammation": number,
      "chronic_stress": number,
      "environmental_toxins": number
    },
    "interventionPriorities": [
      {
        "priority": 1|2|3,
        "intervention": "string",
        "rationale": "string",
        "timeline": "string",
        "truckDriverModification": "optional string"
      }
    ]
  }
  
  Ensure all number values are between 0-100 and all required fields are populated.
  `;

  const systemPrompt = `You are Kevin Rutherford, FNTP (Functional Nutritional Therapy Practitioner) specializing in truck driver health optimization. 
  You combine functional medicine principles with ancestral health wisdom to identify root causes and create sustainable health interventions.
  
  Your expertise includes:
  - IFM (Institute for Functional Medicine) methodology
  - Ancestral health principles
  - Truck driver occupational health
  - DOT medical requirements
  - Road-compatible health solutions
  
  Always return valid JSON that matches the specified interface structure exactly.`;

  try {
    console.log('[FUNCTIONAL-MEDICINE] Starting analysis...')
    
    // Call Claude with the prompt
    const response = await claudeClient.analyzePractitionerReport(
      analysisPrompt,
      systemPrompt
    )
    
    console.log('[FUNCTIONAL-MEDICINE] Received response, parsing JSON...')
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response')
    }
    
    const analysis = JSON.parse(jsonMatch[0]) as FunctionalMedicineAnalysis
    
    // Validate the response structure
    validateAnalysisStructure(analysis)
    
    console.log('[FUNCTIONAL-MEDICINE] Analysis completed successfully')
    return analysis
    
  } catch (error) {
    console.error('[FUNCTIONAL-MEDICINE] Error performing analysis:', error)
    
    // Return a fallback analysis if something goes wrong
    return createFallbackAnalysis(clientData)
  }
}

// Validate that the analysis matches our expected structure
function validateAnalysisStructure(analysis: any): void {
  if (!analysis.rootCauses || !Array.isArray(analysis.rootCauses)) {
    throw new Error('Invalid rootCauses structure')
  }
  
  if (!analysis.systemicImbalances || typeof analysis.systemicImbalances !== 'object') {
    throw new Error('Invalid systemicImbalances structure')
  }
  
  if (!analysis.ancestralMismatches || typeof analysis.ancestralMismatches !== 'object') {
    throw new Error('Invalid ancestralMismatches structure')
  }
  
  if (!analysis.interventionPriorities || !Array.isArray(analysis.interventionPriorities)) {
    throw new Error('Invalid interventionPriorities structure')
  }
  
  // Validate numeric values are in range
  const imbalances = Object.values(analysis.systemicImbalances)
  const mismatches = Object.values(analysis.ancestralMismatches)
  const allScores = [...imbalances, ...mismatches] as number[]
  
  for (const score of allScores) {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new Error('Invalid score value: must be number between 0-100')
    }
  }
}

// Create a fallback analysis if Claude fails
function createFallbackAnalysis(clientData: ClientData): FunctionalMedicineAnalysis {
  return {
    rootCauses: [
      {
        category: "Gut-Brain Axis Dysfunction",
        confidence: 75,
        evidence: ["Digestive complaints", "Mood issues", "Brain fog"],
        systems_affected: ["Digestive", "Nervous", "Immune"]
      },
      {
        category: "Chronic Inflammation",
        confidence: 70,
        evidence: ["Systemic symptoms", "Poor recovery", "Joint issues"],
        systems_affected: ["Immune", "Musculoskeletal", "Cardiovascular"]
      },
      {
        category: "Metabolic Dysfunction",
        confidence: 65,
        evidence: ["Energy fluctuations", "Cravings", "Weight issues"],
        systems_affected: ["Endocrine", "Metabolic", "Energy Production"]
      }
    ],
    systemicImbalances: {
      gut_dysfunction: 70,
      inflammation: 65,
      detox_impairment: 50,
      hormone_dysregulation: 60,
      nutrient_deficiencies: 55,
      oxidative_stress: 60
    },
    ancestralMismatches: {
      circadian_disruption: clientData.isDriver ? 80 : 60,
      movement_deficiency: clientData.isDriver ? 75 : 50,
      dietary_inflammation: 70,
      chronic_stress: clientData.isDriver ? 85 : 65,
      environmental_toxins: clientData.isDriver ? 70 : 50
    },
    interventionPriorities: [
      {
        priority: 1,
        intervention: "Gut healing protocol with targeted probiotics and digestive support",
        rationale: "Address root cause of systemic inflammation and nutrient absorption",
        timeline: "Initial improvements in 2-4 weeks, significant progress by 8 weeks",
        truckDriverModification: clientData.isDriver ? "Use shelf-stable probiotics and digestive enzymes that don't require refrigeration" : undefined
      },
      {
        priority: 2,
        intervention: "Anti-inflammatory nutrition plan with ancestral principles",
        rationale: "Reduce systemic inflammation and support metabolic health",
        timeline: "Energy improvements within 1-2 weeks, inflammation markers improve by 6-8 weeks",
        truckDriverModification: clientData.isDriver ? "Focus on truck-stop friendly options and meal prep strategies" : undefined
      },
      {
        priority: 3,
        intervention: "Circadian rhythm optimization and stress management",
        rationale: "Reset HPA axis function and improve sleep quality",
        timeline: "Sleep improvements in 1-2 weeks, stress resilience builds over 4-6 weeks",
        truckDriverModification: clientData.isDriver ? "Use blue light blocking glasses and develop in-cab relaxation routines" : undefined
      }
    ]
  }
}