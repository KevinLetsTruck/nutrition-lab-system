// ASSIMILATION Module Questions - Chunk 2
// Questions 16-35 of 65 total

import { AssessmentQuestion } from '../types';

export const assimilationQuestionsChunk2: AssessmentQuestion[] = [
  // ========== FOOD SENSITIVITIES & REACTIONS (5 questions) ==========
  {
    id: "ASM016",
    module: "ASSIMILATION",
    category: "DIGESTIVE",
    text: "How many foods do you suspect you're sensitive or intolerant to?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "1_2", label: "1-2 foods", score: 1 },
      { value: "3_5", label: "3-5 foods", score: 2 },
      { value: "6_10", label: "6-10 foods", score: 3 },
      { value: "over_10", label: "More than 10 foods", score: 5 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["intestinal_permeability", "immune_activation"],
    labCorrelations: ["zonulin", "food_sensitivity_panel"],
    triggerConditions: [
      {
        threshold: 3,
        operator: "gte",
        triggersModule: "DEFENSE_REPAIR",
        priority: "high"
      }
    ]
  },
  {
    id: "ASM017",
    module: "ASSIMILATION",
    text: "Do you react to gluten-containing foods (wheat, barley, rye)?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_reaction", label: "No reaction", score: 0 },
      { value: "mild", label: "Mild symptoms", score: 2 },
      { value: "moderate", label: "Moderate symptoms", score: 3 },
      { value: "severe", label: "Severe symptoms", score: 4 },
      { value: "avoid", label: "I avoid them", score: 2 }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["celiac", "NCGS", "intestinal_permeability"],
    labCorrelations: ["celiac_panel", "gliadin_antibodies"]
  },
  {
    id: "ASM018",
    module: "ASSIMILATION",
    text: "Do you react to dairy products?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_reaction", label: "No reaction", score: 0 },
      { value: "lactose_only", label: "Only milk (lactose)", score: 2 },
      { value: "all_dairy", label: "All dairy products", score: 3 },
      { value: "avoid", label: "I avoid them", score: 2 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["lactose_intolerance", "casein_sensitivity"]
  },
  
  // ========== SEED OIL QUESTIONS (2 more) ==========
  {
    id: "ASM_SO03",
    module: "ASSIMILATION",
    category: "SEED_OIL",
    text: "Do you notice changes in stool quality after eating foods high in vegetable oils?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_change", label: "No change", score: 0 },
      { value: "looser", label: "Looser stools", score: 3 },
      { value: "oily", label: "Oily/greasy stools", score: 4 },
      { value: "urgent", label: "Urgent bowel movements", score: 3 },
      { value: "constipated", label: "More constipated", score: 2 }
    ],
    scoringWeight: 1.7,
    clinicalRelevance: ["fat_malabsorption", "gallbladder_dysfunction"],
    labCorrelations: ["elastase", "fecal_fat", "GGT"]
  },
  {
    id: "ASM_SO04",
    module: "ASSIMILATION",
    category: "SEED_OIL",
    text: "How do you feel after eating at restaurants that use fryer oils?",
    type: "LIKERT_SCALE",
    scoringWeight: 1.6,
    scaleMin: "Feel fine",
    scaleMax: "Feel terrible",
    scale: { min: 0, max: 10 },
    clinicalRelevance: ["oxidative_stress", "inflammatory_response"],
    helpText: "Restaurant fryer oils are often reused and highly oxidized"
  },

  {
    id: "ASM019",
    module: "ASSIMILATION",
    text: "Do you experience symptoms with high FODMAP foods (garlic, onions, beans)?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["SIBO", "carbohydrate_malabsorption"]
  },
  {
    id: "ASM020",
    module: "ASSIMILATION",
    text: "Do you crave specific foods?",
    type: "MULTI_SELECT",
    options: [
      { value: "sugar", label: "Sugar/sweets", score: 2 },
      { value: "salt", label: "Salt/salty foods", score: 1 },
      { value: "bread", label: "Bread/pasta", score: 2 },
      { value: "cheese", label: "Cheese/dairy", score: 1 },
      { value: "chocolate", label: "Chocolate", score: 1 },
      { value: "fried", label: "Fried foods", score: 2 },
      { value: "none", label: "No specific cravings", score: 0 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["dysbiosis", "nutrient_deficiency", "blood_sugar"]
  },

  // ========== NUTRIENT ABSORPTION (5 questions) ==========
  {
    id: "ASM021",
    module: "ASSIMILATION",
    text: "Have you been diagnosed with any nutrient deficiencies?",
    type: "MULTI_SELECT",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "iron", label: "Iron", score: 3 },
      { value: "b12", label: "B12", score: 3 },
      { value: "vitamin_d", label: "Vitamin D", score: 2 },
      { value: "folate", label: "Folate", score: 2 },
      { value: "magnesium", label: "Magnesium", score: 2 },
      { value: "zinc", label: "Zinc", score: 2 },
      { value: "multiple", label: "Multiple deficiencies", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["malabsorption", "intestinal_damage"],
    labCorrelations: ["ferritin", "B12", "folate", "vitamin_D"]
  },
  {
    id: "ASM022",
    module: "ASSIMILATION",
    text: "Do your fingernails have white spots or ridges?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 }
    ,
      { value: "unsure", label: "Unsure", score: 1 }],
    scoringWeight: 1.0,
    clinicalRelevance: ["zinc_deficiency", "protein_malabsorption"]
  },
  {
    id: "ASM023",
    module: "ASSIMILATION",
    text: "Do you bruise easily?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "very_easily", label: "Very easily", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["vitamin_C_deficiency", "vitamin_K_deficiency"]
  },
  {
    id: "ASM024",
    module: "ASSIMILATION",
    text: "Do you have dry, flaky skin?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "always", label: "Always", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["essential_fatty_acids", "vitamin_A"]
  },
  {
    id: "ASM025",
    module: "ASSIMILATION",
    text: "Are your stools pale, clay-colored, or float?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["fat_malabsorption", "bile_insufficiency"],
    labCorrelations: ["GGT", "alkaline_phosphatase"]
  },

  // ========== ABDOMINAL PAIN & DISCOMFORT (5 questions) ==========
  {
    id: "ASM026",
    module: "ASSIMILATION",
    text: "Where do you typically experience abdominal pain?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_pain", label: "No pain", score: 0 },
      { value: "upper_center", label: "Upper center (stomach)", score: 2 },
      { value: "upper_right", label: "Upper right (liver/GB)", score: 2 },
      { value: "lower_left", label: "Lower left", score: 2 },
      { value: "lower_right", label: "Lower right", score: 2 },
      { value: "all_over", label: "All over/varies", score: 3 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["organ_specific", "referred_pain"]
  },
  {
    id: "ASM027",
    module: "ASSIMILATION",
    text: "How would you describe your abdominal pain?",
    type: "MULTI_SELECT",
    options: [
      { value: "none", label: "No pain", score: 0 },
      { value: "cramping", label: "Cramping", score: 2 },
      { value: "burning", label: "Burning", score: 2 },
      { value: "sharp", label: "Sharp/stabbing", score: 3 },
      { value: "dull", label: "Dull ache", score: 1 },
      { value: "pressure", label: "Pressure/fullness", score: 2 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["pain_patterns", "differential_diagnosis"]
  },
  {
    id: "ASM028",
    module: "ASSIMILATION",
    text: "Does eating relieve or worsen your abdominal pain?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_pain", label: "I don't have pain", score: 0 },
      { value: "relieves", label: "Eating relieves it", score: 2 },
      { value: "worsens", label: "Eating worsens it", score: 3 },
      { value: "no_change", label: "No change", score: 1 },
      { value: "depends", label: "Depends on food", score: 2 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["ulcer_patterns", "functional_dyspepsia"]
  },
  {
    id: "ASM029",
    module: "ASSIMILATION",
    text: "Do you have pain 2-3 hours after eating?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["duodenal_ulcer", "H_pylori"],
    labCorrelations: ["H_pylori"]
  },
  {
    id: "ASM030",
    module: "ASSIMILATION",
    text: "Does your abdomen feel tender when pressed?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No tenderness", score: 0 },
      { value: "mild", label: "Mild tenderness", score: 1 },
      { value: "moderate", label: "Moderate tenderness", score: 2 },
      { value: "severe", label: "Severe tenderness", score: 3 },
      { value: "cant_touch", label: "Can't tolerate touch", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["inflammation", "visceral_hypersensitivity"]
  },

  // ========== APPETITE & SATIETY (5 questions) ==========
  {
    id: "ASM031",
    module: "ASSIMILATION",
    text: "How would you describe your appetite?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "poor", label: "Poor/no appetite", score: 3 },
      { value: "low", label: "Low appetite", score: 2 },
      { value: "normal", label: "Normal appetite", score: 0 },
      { value: "high", label: "High appetite", score: 1 },
      { value: "excessive", label: "Excessive/always hungry", score: 2 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["digestive_capacity", "metabolic_state"]
  },
  {
    id: "ASM032",
    module: "ASSIMILATION",
    text: "How long do you feel satisfied after a meal?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "less_1hr", label: "Less than 1 hour", score: 3 },
      { value: "1_2hrs", label: "1-2 hours", score: 2 },
      { value: "2_3hrs", label: "2-3 hours", score: 1 },
      { value: "3_4hrs", label: "3-4 hours", score: 0 },
      { value: "over_4hrs", label: "Over 4 hours", score: 1 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["gastric_emptying", "blood_sugar_regulation"]
  },
  {
    id: "ASM033",
    module: "ASSIMILATION",
    text: "Do you experience nausea?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["gastroparesis", "H_pylori", "gallbladder"]
  },
  {
    id: "ASM034",
    module: "ASSIMILATION",
    text: "Have you had unexplained weight loss?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No weight loss", score: 0 },
      { value: "5_10lbs", label: "5-10 lbs", score: 2 },
      { value: "10_20lbs", label: "10-20 lbs", score: 3 },
      { value: "over_20lbs", label: "Over 20 lbs", score: 4 }
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["malabsorption", "serious_pathology"],
    triggerConditions: [
      {
        threshold: 3,
        operator: "gte",
        alertLevel: "high",
        requiresFollowup: true
      }
    ]
  },
  {
    id: "ASM035",
    module: "ASSIMILATION",
    text: "Do you skip meals due to digestive symptoms?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["symptom_severity", "nutritional_impact"]
  }
];
