import {
  AssessmentQuestion,
  FunctionalModule,
  QuestionType,
  QuestionCategory,
} from "../types";

export const screeningQuestions: AssessmentQuestion[] = [
  // Energy & Fatigue Questions
  {
    id: "SCR001",
    module: FunctionalModule.SCREENING,
    text: "How would you rate your overall energy level throughout the day?",
    type: QuestionType.LIKERT_SCALE,
    options: [
      { value: 0, label: "No energy - exhausted all day" },
      { value: 10, label: "Abundant energy all day" },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: [
      "mitochondrial_function",
      "adrenal_health",
      "thyroid_function",
    ],
    labCorrelations: ["TSH", "Free T3", "Cortisol", "Ferritin"],
    triggerConditions: [
      {
        threshold: 4,
        operator: "lte",
        triggersModule: FunctionalModule.ENERGY,
        priority: "high",
      },
    ],
  },

  // Seed Oil Screening Questions
  {
    id: "SCR_SO01",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "How often do you eat fried foods from restaurants or fast food establishments?",
    type: QuestionType.FREQUENCY,
    options: [
      { value: 0, label: "Never", score: 0 },
      { value: 1, label: "1-2 times/month", score: 2 },
      { value: 2, label: "Weekly", score: 4 },
      { value: 3, label: "2-3 times/week", score: 7 },
      { value: 4, label: "Daily", score: 10 },
    ],
    scoringWeight: 1.8,
    clinicalRelevance: [
      "oxidative_stress",
      "inflammation",
      "mitochondrial_function",
    ],
    labCorrelations: ["F2-isoprostanes", "4-HNE", "CRP", "Omega-6:3 ratio"],
    triggerConditions: [
      {
        threshold: 3,
        operator: "gte",
        triggersQuestions: ["DIG_SO01", "ENE_SO01", "IMM_SO01"],
        priority: "high",
      },
    ],
  },

  {
    id: "SCR_SO02",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Which cooking oils do you primarily use at home? (select all that apply)",
    type: QuestionType.MULTI_SELECT,
    options: [
      { value: "olive", label: "Olive oil", score: 0 },
      { value: "coconut", label: "Coconut oil", score: 0 },
      { value: "butter", label: "Butter/Ghee", score: 0 },
      { value: "avocado", label: "Avocado oil", score: 0 },
      { value: "canola", label: "Canola oil", score: 3 },
      { value: "vegetable", label: "Vegetable oil", score: 3 },
      { value: "sunflower", label: "Sunflower oil", score: 3 },
      { value: "corn", label: "Corn oil", score: 3 },
      { value: "soybean", label: "Soybean oil", score: 3 },
      { value: "safflower", label: "Safflower oil", score: 3 },
      { value: "grapeseed", label: "Grapeseed oil", score: 3 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["lipid_peroxidation", "cell_membrane_health"],
  },

  {
    id: "SCR_SO03",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Do you experience brain fog or mental fatigue after eating fried or processed foods?",
    type: QuestionType.LIKERT_SCALE,
    options: [
      { value: 0, label: "Never" },
      { value: 10, label: "Always, severely" },
    ],
    scoringWeight: 1.6,
    clinicalRelevance: ["neuroinflammation", "oxidative_stress"],
    labCorrelations: ["4-HNE", "MDA", "Oxidized LDL"],
  },

  // Digestive Screening
  {
    id: "SCR002",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.DIGESTIVE,
    text: "How often do you experience bloating or abdominal discomfort?",
    type: QuestionType.FREQUENCY,
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely (1-2 times/month)" },
      { value: 2, label: "Sometimes (weekly)" },
      { value: 3, label: "Often (3-4 times/week)" },
      { value: 4, label: "Daily" },
    ],
    scoringWeight: 1.4,
    clinicalRelevance: ["dysbiosis", "SIBO", "food_sensitivities"],
    labCorrelations: ["GI-MAP", "SIBO breath test", "Zonulin"],
    triggerConditions: [
      {
        threshold: 3,
        operator: "gte",
        triggersModule: FunctionalModule.ASSIMILATION,
      },
    ],
  },

  // Sleep & Recovery
  {
    id: "SCR003",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.LIFESTYLE,
    text: "How would you rate your sleep quality?",
    type: QuestionType.LIKERT_SCALE,
    options: [
      { value: 0, label: "Very poor - wake up exhausted" },
      { value: 10, label: "Excellent - wake up refreshed" },
    ],
    scoringWeight: 1.6,
    clinicalRelevance: ["circadian_rhythm", "HPA_axis", "melatonin_production"],
    labCorrelations: ["Cortisol rhythm", "Melatonin", "DHEA"],
  },

  // More Seed Oil Integration
  {
    id: "SCR_SO04",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "How often do you consume packaged/processed foods (chips, crackers, cookies, etc.)?",
    type: QuestionType.FREQUENCY,
    options: [
      { value: 0, label: "Never", score: 0 },
      { value: 1, label: "Rarely", score: 2 },
      { value: 2, label: "Weekly", score: 4 },
      { value: 3, label: "Several times/week", score: 6 },
      { value: 4, label: "Daily", score: 9 },
    ],
    scoringWeight: 1.7,
    clinicalRelevance: ["oxidative_stress", "AGE_formation", "inflammation"],
    helpText: "Most processed foods contain industrial seed oils",
  },

  // Joint & Inflammation
  {
    id: "SCR004",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.STRUCTURAL,
    text: "Do you experience joint pain or stiffness?",
    type: QuestionType.FREQUENCY,
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Occasionally" },
      { value: 2, label: "Frequently" },
      { value: 3, label: "Most days" },
      { value: 4, label: "Constantly" },
    ],
    scoringWeight: 1.4,
    clinicalRelevance: ["inflammation", "autoimmunity", "oxidative_stress"],
    labCorrelations: ["CRP", "ESR", "Anti-CCP", "RF"],
  },

  // Hormonal Screening
  {
    id: "SCR005",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.HORMONAL,
    text: "Have you noticed changes in your weight without changes in diet or exercise?",
    type: QuestionType.YES_NO,
    options: [
      { value: "yes", label: "Yes", score: 5 },
      { value: "no", label: "No", score: 0 },
    ],
    scoringWeight: 1.3,
    clinicalRelevance: [
      "thyroid_function",
      "insulin_resistance",
      "cortisol_dysregulation",
    ],
    labCorrelations: ["TSH", "Free T4", "Fasting insulin", "HbA1c"],
  },

  // More Seed Oil Questions
  {
    id: "SCR_SO05",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Do you experience skin issues (acne, eczema, rashes) that worsen with fried/processed foods?",
    type: QuestionType.LIKERT_SCALE,
    options: [
      { value: 0, label: "No skin issues" },
      { value: 10, label: "Severe skin reactions" },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["inflammation", "gut_skin_axis", "oxidative_stress"],
    labCorrelations: ["Food sensitivity panel", "Zonulin", "Histamine"],
  },

  {
    id: "SCR_SO06",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Have you been on a low-fat diet using vegetable oils instead of saturated fats?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { value: 0, label: "Never", score: 0 },
      { value: 1, label: "Less than 1 year", score: 3 },
      { value: 2, label: "1-5 years", score: 6 },
      { value: 3, label: "5-10 years", score: 8 },
      { value: 4, label: "More than 10 years", score: 10 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: [
      "cell_membrane_integrity",
      "hormone_production",
      "vitamin_absorption",
    ],
  },

  // Mood & Cognitive
  {
    id: "SCR006",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.STRESS,
    text: "How often do you experience anxiety or feelings of overwhelm?",
    type: QuestionType.FREQUENCY,
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Constantly" },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["neurotransmitter_balance", "HPA_axis", "inflammation"],
    labCorrelations: ["Cortisol", "GABA", "Serotonin metabolites"],
  },

  // More screening questions would continue...
  // This is a sample of the 75 screening questions
  // Including 8 seed oil questions integrated throughout

  {
    id: "SCR_SO07",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Do you check ingredient labels to avoid seed oils when shopping?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { value: "always", label: "Always", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 3 },
      { value: "rarely", label: "Rarely", score: 6 },
      { value: "never", label: "Never", score: 8 },
      {
        value: "dont_know",
        label: "I don't know which oils to avoid",
        score: 7,
      },
    ],
    scoringWeight: 1.4,
    clinicalRelevance: ["dietary_awareness", "inflammation_prevention"],
  },

  {
    id: "SCR_SO08",
    module: FunctionalModule.SCREENING,
    category: QuestionCategory.SEED_OIL,
    text: "Have you noticed improved energy or reduced inflammation when avoiding seed oils?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      {
        value: "yes_significant",
        label: "Yes, significant improvement",
        score: 0,
      },
      { value: "yes_some", label: "Yes, some improvement", score: 2 },
      { value: "no_change", label: "No change noticed", score: 5 },
      { value: "never_tried", label: "Never tried avoiding them", score: 7 },
      { value: "worse", label: "Feel worse when I avoid them", score: 3 },
    ],
    scoringWeight: 1.6,
    clinicalRelevance: ["metabolic_flexibility", "inflammation_response"],
    helpText:
      "Your body's response to seed oil elimination can indicate metabolic health",
  },

  // Add remaining screening questions following this pattern...
  // Total should be 75 screening questions including 8 seed oil questions
];
