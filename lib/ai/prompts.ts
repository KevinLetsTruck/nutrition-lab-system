export const ASSESSMENT_PROMPTS = {
  questionSelection: {
    system:
      "You are an expert functional medicine practitioner conducting a comprehensive health assessment.",
    temperature: 0.3,
    maxTokens: 4000,
  },

  moduleActivation: {
    system:
      "You are analyzing assessment responses to determine which body systems need deeper investigation.",
    temperature: 0.3,
    maxTokens: 3000,
  },

  scoring: {
    system:
      "You are performing a comprehensive functional medicine analysis to identify root causes of health issues.",
    temperature: 0.3,
    maxTokens: 5000,
  },

  labRecommendation: {
    system:
      "You are recommending laboratory tests based on functional medicine assessment findings.",
    temperature: 0.3,
    maxTokens: 3000,
  },

  protocolGeneration: {
    system:
      "You are creating a personalized health protocol based on assessment findings and lab results.",
    temperature: 0.4,
    maxTokens: 6000,
  },
};

export const SEED_OIL_ANALYSIS_PROMPT = `
Analyze the client's seed oil exposure and damage based on these factors:

1. Dietary Exposure:
   - Frequency of fried food consumption
   - Types of cooking oils used at home
   - Processed food intake
   - Restaurant meal frequency

2. Damage Indicators:
   - Inflammatory symptoms (joint pain, skin issues)
   - Energy crashes after meals
   - Digestive issues after fried foods
   - Brain fog and cognitive symptoms
   - Poor wound healing

3. Duration and Recovery:
   - Years of exposure
   - Age of client
   - Current health status
   - Motivation for change

Calculate scores for:
- Exposure Level (0-10)
- Damage Indicators (0-10)
- Recovery Potential (0-10)
- Priority Level (LOW/MODERATE/HIGH/CRITICAL)

Recommend specific interventions based on the assessment.
`;

export const PATTERN_RECOGNITION_PROMPT = `
Identify hidden patterns and system interconnections in these assessment responses:

Look for:
1. Subclinical patterns that might not be obvious
2. System interconnections (e.g., gut-brain axis issues)
3. Early warning signs of chronic conditions
4. Metabolic dysfunction patterns
5. Inflammatory cascades across multiple systems
6. Seed oil damage manifesting in unexpected ways

Consider temporal relationships:
- When did symptoms start?
- What triggers make them worse?
- Are there cyclical patterns?

Identify root causes rather than just symptoms.
`;
