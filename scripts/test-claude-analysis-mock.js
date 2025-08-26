// Mock version to show expected Claude analysis output
// This doesn't require an API key

const mockAssessmentData = {
  clientInfo: {
    age: 45,
    gender: "female",
    occupation: "truck driver",
  },
  responses: {
    // Energy & Fatigue
    "essential-energy-level": 3, // Low energy
    "essential-sleep-quality": 2, // Poor sleep
    "essential-sleep-hours": 5, // Insufficient sleep

    // Digestive
    "essential-digest-meals": "yes",
    "essential-digest-meals-details": ["Bloating", "Gas", "Stomach pain"],
    "essential-digest-primary": "Bloating",
    "essential-digest-primary-severity": 4, // Severe
    "essential-bowel-regular": "no",
    "essential-bowel-issues": ["Constipation", "Straining"],

    // Chronic Conditions
    "essential-chronic-conditions": "yes",
    "essential-chronic-conditions-list": [
      "Thyroid Disorder",
      "High Blood Pressure",
    ],
    "essential-chronic-primary": "Thyroid Disorder",
    "essential-chronic-primary-impact": 4,

    // Medications
    "essential-medications": "yes",
    "essential-medications-list": "Levothyroxine 100mcg, Lisinopril 10mg",

    // Immune
    "essential-sick-frequency": "Often (5+ times/year)",
    "essential-allergies": "yes",
    "essential-allergies-list": ["Pollen/Hay fever", "Dairy"],

    // Inflammation
    "essential-inflammation": "yes",
    "essential-inflammation-details": [
      "Joint pain - knees",
      "Morning stiffness",
    ],
    "essential-inflammation-primary": "Joint pain - knees",
    "essential-inflammation-primary-severity": 3,

    // Energy Patterns
    "essential-energy-crashes": "yes",
    "essential-energy-crashes-timing": "2 hours after eating",
    "essential-energy-pattern": "Energy is consistently low",

    // Mental Health
    "essential-brain-fog": "Often",
    "essential-anxiety-mood": "yes",
    "essential-anxiety-mood-details": ["General anxiety", "Irritability"],
    "essential-stress-level": 4,

    // Timeline
    "essential-symptom-timeline": "2-5 years ago",
  },
};

// Mock Claude response - what we expect the AI to generate
const mockClaudeResponse = {
  primary_patterns: [
    {
      pattern: "HPA Axis Dysfunction",
      evidence: [
        "High stress level (4/5)",
        "Poor sleep quality",
        "Energy crashes after meals",
        "General anxiety",
        "Chronic fatigue",
      ],
    },
    {
      pattern: "Gut-Thyroid-Brain Axis Disruption",
      evidence: [
        "Thyroid disorder",
        "Severe digestive issues",
        "Brain fog",
        "Constipation",
        "Dairy allergy",
      ],
    },
    {
      pattern: "Systemic Inflammation",
      evidence: [
        "Joint pain",
        "Morning stiffness",
        "Frequent infections",
        "Multiple allergies",
      ],
    },
    {
      pattern: "Metabolic Dysfunction",
      evidence: [
        "Energy crashes 2 hours after eating",
        "Consistently low energy",
        "High blood pressure",
      ],
    },
  ],

  root_cause_analysis: {
    primary_drivers: [
      "Chronic stress from occupation (truck driver - sedentary, irregular schedule)",
      "Thyroid dysfunction affecting metabolism and digestion",
      "Gut dysbiosis contributing to inflammation and immune issues",
      "Poor sleep hygiene disrupting circadian rhythm",
    ],
    timeline_significance:
      "Symptoms started 2-5 years ago, suggesting gradual system breakdown rather than acute trigger",
  },

  system_priorities: {
    "1_digestive":
      "Severe bloating, constipation, and meal-related symptoms indicate significant GI dysfunction",
    "2_hormonal":
      "Thyroid disorder is central to multiple symptoms - energy, digestion, mood",
    "3_energy_mitochondrial":
      "Persistent fatigue and post-meal crashes suggest mitochondrial insufficiency",
    "4_neurological": "Brain fog and anxiety indicate neuroinflammation",
    "5_immune":
      "Frequent infections and multiple allergies show compromised immunity",
    "6_detoxification":
      "Constipation and inflammation suggest impaired detox pathways",
    "7_structural": "Joint pain present but less systemic impact",
  },

  key_findings: {
    most_concerning: [
      "Severe digestive dysfunction (bloating severity 4/5)",
      "Thyroid disorder with high impact (4/5)",
      "Only 5 hours sleep (significant deficit)",
      "High stress level affecting multiple systems",
    ],
    positive_findings: [
      "Already on thyroid medication (awareness of condition)",
      "Specific symptom awareness (can identify triggers)",
      "Motivated to address root causes",
    ],
    risk_factors: [
      "Sedentary occupation",
      "Chronic sleep deprivation",
      "High stress lifestyle",
      "Multiple system involvement",
    ],
  },

  laboratory_recommendations: {
    essential: [
      "Comprehensive Thyroid Panel (TSH, Free T3, Free T4, Reverse T3, TPO, TgAb)",
      "GI-MAP Stool Analysis (dysbiosis, inflammation, digestive function)",
      "Comprehensive Metabolic Panel with HbA1c",
      "Vitamin D, B12, Folate, Ferritin",
      "hs-CRP, ESR (inflammation markers)",
    ],
    additional: [
      "4-Point Cortisol with DHEA",
      "Food Sensitivity Panel (especially dairy)",
      "Organic Acids Test (mitochondrial function)",
      "Micronutrient Testing",
      "Sex Hormone Panel",
    ],
  },

  supplement_protocol: {
    foundation: [
      {
        supplement: "High-Quality Probiotic",
        dosage: "50 billion CFU daily",
        timing: "Evening with dinner",
        rationale: "Restore gut microbiome, reduce bloating",
      },
      {
        supplement: "Digestive Enzymes",
        dosage: "1-2 capsules with meals",
        timing: "Beginning of each meal",
        rationale: "Support digestion, reduce post-meal symptoms",
      },
      {
        supplement: "Magnesium Glycinate",
        dosage: "400mg",
        timing: "Evening before bed",
        rationale: "Support sleep, reduce constipation, calm nervous system",
      },
      {
        supplement: "Vitamin D3/K2",
        dosage: "5000 IU D3, 100mcg K2",
        timing: "Morning with fat",
        rationale: "Immune support, inflammation reduction",
      },
    ],
    targeted: [
      {
        supplement: "Ashwagandha",
        dosage: "600mg standardized extract",
        timing: "Morning and evening",
        rationale: "HPA axis support, stress reduction, thyroid support",
      },
      {
        supplement: "L-Glutamine",
        dosage: "5g powder",
        timing: "Empty stomach morning",
        rationale: "Gut healing, reduce inflammation",
      },
      {
        supplement: "CoQ10",
        dosage: "200mg",
        timing: "Morning with food",
        rationale: "Mitochondrial support, energy production",
      },
      {
        supplement: "Curcumin (Meriva)",
        dosage: "1000mg",
        timing: "Twice daily with meals",
        rationale: "Reduce inflammation, joint support",
      },
    ],
    timeline:
      "Start foundation supplements Week 1, add targeted supplements Week 3",
  },

  lifestyle_modifications: {
    dietary: [
      "Eliminate dairy completely for 30 days",
      "Anti-inflammatory diet: increase omega-3 foods, colorful vegetables",
      "Time-restricted eating: 12-hour overnight fast minimum",
      "Increase fiber gradually: aim for 30g daily",
      "Hydration: half body weight in ounces of water daily",
    ],
    sleep: [
      "Strict 10pm bedtime, aim for 7-8 hours",
      "Blue light blocking glasses 2 hours before bed",
      "Magnesium bath 3x weekly",
      "Keep bedroom at 65-68°F",
      "Consider sleep study for trucking schedule optimization",
    ],
    stress: [
      "Daily 10-minute meditation or breathing exercises",
      "Walking breaks every 2 hours during driving",
      "Yoga or stretching routine for truck drivers",
      "Consider adapting work schedule if possible",
    ],
    movement: [
      "Resistance bands in truck for strength training",
      "Walking 30 minutes on breaks",
      "Joint mobility exercises for knees",
      "Core strengthening for posture",
    ],
  },

  treatment_priorities: {
    phase_1: {
      weeks: "1-4",
      focus: "Foundation",
      actions: [
        "Start foundation supplements",
        "Eliminate dairy",
        "Establish sleep routine",
        "Begin digestive support",
        "Order essential labs",
      ],
    },
    phase_2: {
      weeks: "5-8",
      focus: "Targeted intervention",
      actions: [
        "Add targeted supplements based on lab results",
        "Implement anti-inflammatory diet fully",
        "Begin stress management practices",
        "Address any lab abnormalities",
        "Consider thyroid medication adjustment with doctor",
      ],
    },
    phase_3: {
      weeks: "9-12",
      focus: "Optimization",
      actions: [
        "Fine-tune supplement protocol",
        "Advance exercise program",
        "Reassess symptoms",
        "Plan long-term maintenance",
        "Consider additional testing if needed",
      ],
    },
  },
};

console.log("=== MOCK CLAUDE ANALYSIS TEST ===\n");
console.log(
  "This demonstrates what a successful Claude analysis should look like.\n"
);
console.log(
  "Client Info:",
  JSON.stringify(mockAssessmentData.clientInfo, null, 2)
);
console.log("\n=== EXPECTED CLAUDE RESPONSE ===\n");
console.log(JSON.stringify(mockClaudeResponse, null, 2));
console.log("\n=== ANALYSIS SUMMARY ===");
console.log(
  "Primary Patterns Identified:",
  mockClaudeResponse.primary_patterns.length
);
console.log(
  "Foundation Supplements:",
  mockClaudeResponse.supplement_protocol.foundation.length
);
console.log(
  "Targeted Supplements:",
  mockClaudeResponse.supplement_protocol.targeted.length
);
console.log(
  "Essential Labs:",
  mockClaudeResponse.laboratory_recommendations.essential.length
);
console.log("\n✅ This is the quality of analysis we expect from Claude.");
console.log("\nTo run the actual test with Claude:");
console.log("1. Set up your ANTHROPIC_API_KEY in .env.local");
console.log("2. Run: node scripts/test-claude-analysis.js");
