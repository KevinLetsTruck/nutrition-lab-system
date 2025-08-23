import { AssessmentQuestion } from '../types';
import { additionalScreeningQuestionsPart2 } from './screening-questions-additional';

export const screeningQuestions: AssessmentQuestion[] = [
  {
    "id": "SCR001",
    "text": "How would you rate your overall energy level throughout the day?",
    "type": "LIKERT_SCALE",
    "module": "SCREENING",
    "options": [
      {
        "label": "No energy - exhausted all day",
        "value": 0
      },
      {
        "label": "Abundant energy all day",
        "value": 10
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "TSH",
      "Free T3",
      "Cortisol",
      "Ferritin"
    ],
    "clinicalRelevance": [
      "mitochondrial_function",
      "adrenal_health",
      "thyroid_function"
    ],
    "triggerConditions": [
      {
        "operator": "lte",
        "priority": "high",
        "threshold": 4,
        "triggersModule": "ENERGY"
      }
    ]
  },
  {
    "id": "SCR_SO01",
    "text": "How often do you eat fried foods from restaurants or fast food establishments?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-2 times/month",
        "score": 2,
        "value": 1
      },
      {
        "label": "Weekly",
        "score": 4,
        "value": 2
      },
      {
        "label": "2-3 times/week",
        "score": 7,
        "value": 3
      },
      {
        "label": "Daily",
        "score": 10,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.8,
    "labCorrelations": [
      "F2-isoprostanes",
      "4-HNE",
      "CRP",
      "Omega-6:3 ratio"
    ],
    "clinicalRelevance": [
      "oxidative_stress",
      "inflammation",
      "mitochondrial_function"
    ],
    "triggerConditions": [
      {
        "operator": "gte",
        "priority": "high",
        "threshold": 3,
        "triggersQuestions": [
          "DIG_SO01",
          "ENE_SO01",
          "IMM_SO01"
        ]
      }
    ]
  },
  {
    "id": "SCR_SO02",
    "text": "Which cooking oils do you primarily use at home? (select all that apply)",
    "type": "MULTI_SELECT",
    "module": "SCREENING",
    "options": [
      {
        "label": "Olive oil",
        "score": 0,
        "value": "olive"
      },
      {
        "label": "Coconut oil",
        "score": 0,
        "value": "coconut"
      },
      {
        "label": "Butter/Ghee",
        "score": 0,
        "value": "butter"
      },
      {
        "label": "Avocado oil",
        "score": 0,
        "value": "avocado"
      },
      {
        "label": "Canola oil",
        "score": 3,
        "value": "canola"
      },
      {
        "label": "Vegetable oil",
        "score": 3,
        "value": "vegetable"
      },
      {
        "label": "Sunflower oil",
        "score": 3,
        "value": "sunflower"
      },
      {
        "label": "Corn oil",
        "score": 3,
        "value": "corn"
      },
      {
        "label": "Soybean oil",
        "score": 3,
        "value": "soybean"
      },
      {
        "label": "Safflower oil",
        "score": 3,
        "value": "safflower"
      },
      {
        "label": "Grapeseed oil",
        "score": 3,
        "value": "grapeseed"
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 2,
    "clinicalRelevance": [
      "lipid_peroxidation",
      "cell_membrane_health"
    ]
  },
  {
    "id": "SCR_SO03",
    "text": "Do you experience brain fog or mental fatigue after eating fried or processed foods?",
    "type": "LIKERT_SCALE",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Always, severely",
        "value": 10
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "4-HNE",
      "MDA",
      "Oxidized LDL"
    ],
    "clinicalRelevance": [
      "neuroinflammation",
      "oxidative_stress"
    ]
  },
  {
    "id": "SCR002",
    "text": "How often do you experience bloating or abdominal discomfort?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Rarely (1-2 times/month)",
        "value": 1
      },
      {
        "label": "Sometimes (weekly)",
        "value": 2
      },
      {
        "label": "Often (3-4 times/week)",
        "value": 3
      },
      {
        "label": "Daily",
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "GI-MAP",
      "SIBO breath test",
      "Zonulin"
    ],
    "clinicalRelevance": [
      "dysbiosis",
      "SIBO",
      "food_sensitivities"
    ],
    "triggerConditions": [
      {
        "operator": "gte",
        "threshold": 3,
        "triggersModule": "ASSIMILATION"
      }
    ]
  },
  {
    "id": "SCR003",
    "text": "How would you rate your sleep quality?",
    "type": "LIKERT_SCALE",
    "module": "SCREENING",
    "options": [
      {
        "label": "Very poor - wake up exhausted",
        "value": 0
      },
      {
        "label": "Excellent - wake up refreshed",
        "value": 10
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Cortisol rhythm",
      "Melatonin",
      "DHEA"
    ],
    "clinicalRelevance": [
      "circadian_rhythm",
      "HPA_axis",
      "melatonin_production"
    ]
  },
  {
    "id": "SCR_SO04",
    "text": "How often do you consume packaged/processed foods (chips, crackers, cookies, etc.)?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": 0
      },
      {
        "label": "Rarely",
        "score": 2,
        "value": 1
      },
      {
        "label": "Weekly",
        "score": 4,
        "value": 2
      },
      {
        "label": "Several times/week",
        "score": 6,
        "value": 3
      },
      {
        "label": "Daily",
        "score": 9,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "helpText": "Most processed foods contain industrial seed oils",
    "scoringWeight": 1.7,
    "clinicalRelevance": [
      "oxidative_stress",
      "AGE_formation",
      "inflammation"
    ]
  },
  {
    "id": "SCR004",
    "text": "Do you experience joint pain or stiffness?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Occasionally",
        "value": 1
      },
      {
        "label": "Frequently",
        "value": 2
      },
      {
        "label": "Most days",
        "value": 3
      },
      {
        "label": "Constantly",
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "CRP",
      "ESR",
      "Anti-CCP",
      "RF"
    ],
    "clinicalRelevance": [
      "inflammation",
      "autoimmunity",
      "oxidative_stress"
    ]
  },
  {
    "id": "SCR005",
    "text": "Have you noticed changes in your weight without changes in diet or exercise?",
    "type": "YES_NO",
    "module": "SCREENING",
    "options": [
      {
        "label": "Yes",
        "score": 5,
        "value": "yes"
      },
      {
        "label": "No",
        "score": 0,
        "value": "no"
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "TSH",
      "Free T4",
      "Fasting insulin",
      "HbA1c"
    ],
    "clinicalRelevance": [
      "thyroid_function",
      "insulin_resistance",
      "cortisol_dysregulation"
    ]
  },
  {
    "id": "SCR_SO05",
    "text": "Do you experience skin issues (acne, eczema, rashes) that worsen with fried/processed foods?",
    "type": "LIKERT_SCALE",
    "module": "SCREENING",
    "options": [
      {
        "label": "No skin issues",
        "value": 0
      },
      {
        "label": "Severe skin reactions",
        "value": 10
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Food sensitivity panel",
      "Zonulin",
      "Histamine"
    ],
    "clinicalRelevance": [
      "inflammation",
      "gut_skin_axis",
      "oxidative_stress"
    ]
  },
  {
    "id": "SCR_SO06",
    "text": "Have you been on a low-fat diet using vegetable oils instead of saturated fats?",
    "type": "DURATION",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": 0
      },
      {
        "label": "Less than 1 year",
        "score": 3,
        "value": 1
      },
      {
        "label": "1-5 years",
        "score": 6,
        "value": 2
      },
      {
        "label": "5-10 years",
        "score": 8,
        "value": 3
      },
      {
        "label": "More than 10 years",
        "score": 10,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 2,
    "clinicalRelevance": [
      "cell_membrane_integrity",
      "hormone_production",
      "vitamin_absorption"
    ]
  },
  {
    "id": "SCR006",
    "text": "How often do you experience anxiety or feelings of overwhelm?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Rarely",
        "value": 1
      },
      {
        "label": "Sometimes",
        "value": 2
      },
      {
        "label": "Often",
        "value": 3
      },
      {
        "label": "Constantly",
        "value": 4
      }
    ],
    "category": "STRESS",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Cortisol",
      "GABA",
      "Serotonin metabolites"
    ],
    "clinicalRelevance": [
      "neurotransmitter_balance",
      "HPA_axis",
      "inflammation"
    ]
  },
  {
    "id": "SCR_SO07",
    "text": "Do you check ingredient labels to avoid seed oils when shopping?",
    "type": "MULTIPLE_CHOICE",
    "module": "SCREENING",
    "options": [
      {
        "label": "Always",
        "score": 0,
        "value": "always"
      },
      {
        "label": "Sometimes",
        "score": 3,
        "value": "sometimes"
      },
      {
        "label": "Rarely",
        "score": 6,
        "value": "rarely"
      },
      {
        "label": "Never",
        "score": 8,
        "value": "never"
      },
      {
        "label": "I don't know which oils to avoid",
        "score": 7,
        "value": "dont_know"
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.4,
    "clinicalRelevance": [
      "dietary_awareness",
      "inflammation_prevention"
    ]
  },
  {
    "id": "SCR_SO08",
    "text": "Have you noticed improved energy or reduced inflammation when avoiding seed oils?",
    "type": "MULTIPLE_CHOICE",
    "module": "SCREENING",
    "options": [
      {
        "label": "Yes, significant improvement",
        "score": 0,
        "value": "yes_significant"
      },
      {
        "label": "Yes, some improvement",
        "score": 2,
        "value": "yes_some"
      },
      {
        "label": "No change noticed",
        "score": 5,
        "value": "no_change"
      },
      {
        "label": "Never tried avoiding them",
        "score": 7,
        "value": "never_tried"
      },
      {
        "label": "Feel worse when I avoid them",
        "score": 3,
        "value": "worse"
      }
    ],
    "category": "SEED_OIL",
    "helpText": "Your body's response to seed oil elimination can indicate metabolic health",
    "scoringWeight": 1.6,
    "clinicalRelevance": [
      "metabolic_flexibility",
      "inflammation_response"
    ]
  },
  // ============= ADDITIONAL SCREENING QUESTIONS (61 new) =============
  // Chief Complaints (10 questions)
  {
    id: "SCR015",
    module: "SCREENING",
    category: "LIFESTYLE",
    text: "What is your PRIMARY health concern that brought you here today?",
    type: "TEXT",
    scoringWeight: 2.0,
    clinicalRelevance: ["chief_complaint", "treatment_priority"],
    required: true,
    maxLength: 500,
    placeholder: "Describe your main health concern..."
  },
  {
    id: "SCR016",
    module: "SCREENING",
    text: "How long have you been experiencing your primary health concern?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "less_than_month", label: "Less than 1 month", score: 1 },
      { value: "1_3_months", label: "1-3 months", score: 2 },
      { value: "3_6_months", label: "3-6 months", score: 3 },
      { value: "6_12_months", label: "6-12 months", score: 4 },
      { value: "1_2_years", label: "1-2 years", score: 5 },
      { value: "over_2_years", label: "Over 2 years", score: 6 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["chronicity", "treatment_approach"]
  },
  {
    id: "SCR017",
    module: "SCREENING",
    text: "How much does your primary concern impact your daily activities?",
    type: "LIKERT_SCALE",
    scoringWeight: 2.0,
    scaleMin: "No impact",
    scaleMax: "Completely disabling",
    scale: { min: 0, max: 10 },
    clinicalRelevance: ["functional_impact", "quality_of_life"],
    triggerConditions: [
      {
        threshold: 7,
        operator: "gte",
        triggersModule: "STRUCTURAL",
        priority: "high"
      }
    ]
  },
  {
    id: "SCR018",
    module: "SCREENING",
    text: "What makes your symptoms BETTER? (Select all that apply)",
    type: "MULTI_SELECT",
    options: [
      { value: "rest", label: "Rest/Sleep", score: 1 },
      { value: "exercise", label: "Exercise/Movement", score: 1 },
      { value: "eating", label: "Eating", score: 2 },
      { value: "fasting", label: "Not eating/Fasting", score: 2 },
      { value: "heat", label: "Heat application", score: 1 },
      { value: "cold", label: "Cold application", score: 1 },
      { value: "stress_reduction", label: "Stress reduction", score: 2 },
      { value: "medications", label: "Medications", score: 1 },
      { value: "supplements", label: "Supplements", score: 1 },
      { value: "nothing", label: "Nothing helps", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["alleviating_factors", "treatment_clues"]
  },
  {
    id: "SCR019",
    module: "SCREENING",
    text: "What makes your symptoms WORSE? (Select all that apply)",
    type: "MULTI_SELECT",
    options: [
      { value: "stress", label: "Stress", score: 2 },
      { value: "poor_sleep", label: "Poor sleep", score: 2 },
      { value: "certain_foods", label: "Certain foods", score: 3 },
      { value: "exercise", label: "Exercise", score: 1 },
      { value: "sitting", label: "Prolonged sitting", score: 2 },
      { value: "standing", label: "Prolonged standing", score: 1 },
      { value: "weather", label: "Weather changes", score: 1 },
      { value: "chemicals", label: "Chemical exposures", score: 3 },
      { value: "emotions", label: "Emotional upset", score: 2 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["triggering_factors", "pattern_recognition"]
  },
  {
    id: "SCR020",
    module: "SCREENING",
    text: "Have you tried any treatments for your health concerns?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "No treatments yet", score: 0 },
      { value: "conventional", label: "Conventional medicine only", score: 1 },
      { value: "alternative", label: "Alternative/Natural only", score: 1 },
      { value: "both", label: "Both conventional and alternative", score: 2 },
      { value: "many_unsuccessful", label: "Many treatments, limited success", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["treatment_history", "resistance_patterns"]
  },
  {
    id: "SCR021",
    module: "SCREENING",
    text: "Rate your overall health compared to 1 year ago",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "much_better", label: "Much better", score: -2 },
      { value: "somewhat_better", label: "Somewhat better", score: -1 },
      { value: "same", label: "About the same", score: 0 },
      { value: "somewhat_worse", label: "Somewhat worse", score: 2 },
      { value: "much_worse", label: "Much worse", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["health_trajectory", "prognosis"]
  },
  {
    id: "SCR022",
    module: "SCREENING",
    text: "Do your symptoms follow any pattern throughout the day?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "worse_morning", label: "Worse in morning", score: 2 },
      { value: "worse_afternoon", label: "Worse in afternoon", score: 1 },
      { value: "worse_evening", label: "Worse in evening", score: 1 },
      { value: "worse_night", label: "Worse at night", score: 2 },
      { value: "no_pattern", label: "No clear pattern", score: 0 },
      { value: "constant", label: "Constant throughout day", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["circadian_patterns", "hormone_rhythms"]
  },
  {
    id: "SCR023",
    module: "SCREENING",
    text: "How many different health practitioners have you seen for your concerns?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "1_2", label: "1-2", score: 1 },
      { value: "3_5", label: "3-5", score: 2 },
      { value: "6_10", label: "6-10", score: 3 },
      { value: "over_10", label: "More than 10", score: 4 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["care_seeking", "complexity_indicator"]
  },
  {
    id: "SCR024",
    module: "SCREENING",
    text: "What is your health goal priority?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "symptom_relief", label: "Symptom relief", score: 1 },
      { value: "root_cause", label: "Find root cause", score: 2 },
      { value: "prevention", label: "Prevention", score: 0 },
      { value: "optimization", label: "Optimize performance", score: 0 },
      { value: "weight_loss", label: "Weight management", score: 1 }
    ],
    scoringWeight: 0.5,
    clinicalRelevance: ["treatment_goals", "expectations"]
  },
  // Energy & Fatigue Patterns (8 questions)
  {
    id: "SCR025",
    module: "SCREENING",
    category: "METABOLIC",
    text: "Rate your energy level when you wake up",
    type: "LIKERT_SCALE",
    scoringWeight: 2.0,
    scaleMin: "Exhausted",
    scaleMax: "Fully energized",
    scale: { min: 0, max: 10 },
    clinicalRelevance: ["adrenal_function", "sleep_quality"],
    labCorrelations: ["cortisol_am"],
    triggerConditions: [
      {
        threshold: 4,
        operator: "lte",
        triggersModule: "ENERGY",
        priority: "high"
      }
    ]
  },
  {
    id: "SCR026",
    module: "SCREENING",
    text: "Do you experience energy crashes during the day?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely (1-2 times/week)", score: 1 },
      { value: "sometimes", label: "Sometimes (3-4 times/week)", score: 2 },
      { value: "often", label: "Often (5-6 times/week)", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["blood_sugar", "adrenal_dysfunction"],
    labCorrelations: ["glucose", "insulin", "cortisol"]
  },
  {
    id: "SCR027",
    module: "SCREENING",
    text: "When do you typically experience the lowest energy?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "morning", label: "Morning (6am-10am)", score: 3 },
      { value: "midday", label: "Midday (10am-2pm)", score: 2 },
      { value: "afternoon", label: "Afternoon (2pm-6pm)", score: 2 },
      { value: "evening", label: "Evening (6pm-10pm)", score: 1 },
      { value: "all_day", label: "Low all day", score: 4 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["cortisol_rhythm", "thyroid_function"]
  },
  {
    id: "SCR028",
    module: "SCREENING",
    text: "How long can you go between meals without feeling weak or irritable?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "less_2hrs", label: "Less than 2 hours", score: 4 },
      { value: "2_3hrs", label: "2-3 hours", score: 3 },
      { value: "3_4hrs", label: "3-4 hours", score: 2 },
      { value: "4_5hrs", label: "4-5 hours", score: 1 },
      { value: "over_5hrs", label: "Over 5 hours", score: 0 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["metabolic_flexibility", "insulin_resistance"],
    seedOilRelevant: true
  },
  {
    id: "SCR029",
    module: "SCREENING",
    text: "Do you need caffeine to function during the day?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["adrenal_dependence", "energy_production"]
  },
  {
    id: "SCR030",
    module: "SCREENING",
    text: "How many hours of sleep do you typically get?",
    type: "NUMBER",
    scoringWeight: 1.5,
    clinicalRelevance: ["sleep_adequacy", "recovery"],
    validationRules: [
      { type: "min", value: 0, message: "Sleep hours cannot be negative" },
      { type: "max", value: 24, message: "Sleep hours cannot exceed 24" }
    ]
  },
  {
    id: "SCR031",
    module: "SCREENING",
    text: "Do you feel refreshed after sleep?",
    type: "FREQUENCY",
    options: [
      { value: "always", label: "Always", score: 0 },
      { value: "usually", label: "Usually", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "rarely", label: "Rarely", score: 3 },
      { value: "never", label: "Never", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["sleep_quality", "recovery_capacity"]
  },
  {
    id: "SCR032",
    module: "SCREENING",
    text: "How long does it take you to feel fully awake after getting up?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "immediate", label: "Immediately", score: 0 },
      { value: "15min", label: "15 minutes", score: 1 },
      { value: "30min", label: "30 minutes", score: 2 },
      { value: "1hr", label: "1 hour", score: 3 },
      { value: "over_1hr", label: "Over 1 hour", score: 4 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["cortisol_awakening", "thyroid_function"]
  },
  // Include all additional screening questions (SCR033-SCR075)
  ...additionalScreeningQuestionsPart2
];
