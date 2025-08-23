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
        "value": 1
      },
      {
        "label": "Abundant energy all day",
        "value": 5
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
        "value": 1
      },
      {
        "label": "Excellent - wake up refreshed",
        "value": 5
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
    "id": "SCR011",
    "text": "How often do you eat meals from restaurants or takeout?",
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
        "score": 1,
        "value": 1
      },
      {
        "label": "Weekly",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-3 times/week",
        "score": 3,
        "value": 3
      },
      {
        "label": "Daily",
        "score": 4,
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "CRP"
    ],
    "clinicalRelevance": [
      "dietary_quality",
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
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
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
    "id": "SCR012",
    "text": "Do you experience brain fog or mental fatigue after meals?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": "never"
      },
      {
        "label": "Occasionally",
        "score": 1,
        "value": "occasionally"
      },
      {
        "label": "Sometimes",
        "score": 2,
        "value": "sometimes"
      },
      {
        "label": "Often",
        "score": 3,
        "value": "often"
      },
      {
        "label": "Always",
        "score": 4,
        "value": "always"
      }
    ],
    "category": "ENERGY",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Blood sugar",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "postprandial_response",
      "blood_sugar_regulation"
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
    "id": "SCR013",
    "text": "How often do you consume packaged snack foods (chips, crackers, cookies, etc.)?",
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
        "score": 1,
        "value": 1
      },
      {
        "label": "Weekly",
        "score": 2,
        "value": 2
      },
      {
        "label": "Several times/week",
        "score": 3,
        "value": 3
      },
      {
        "label": "Daily",
        "score": 4,
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.3,
    "clinicalRelevance": [
      "dietary_quality",
      "blood_sugar_control"
    ]
  },
{
    "id": "SCR014",
    "text": "Do you experience skin issues such as acne, eczema, or rashes?",
    "type": "FREQUENCY",
    "module": "SCREENING",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": "never"
      },
      {
        "label": "Rarely",
        "score": 1,
        "value": "rarely"
      },
      {
        "label": "Sometimes",
        "score": 2,
        "value": "sometimes"
      },
      {
        "label": "Often",
        "score": 3,
        "value": "often"
      },
      {
        "label": "Always",
        "score": 4,
        "value": "always"
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Food sensitivity panel",
      "Histamine"
    ],
    "clinicalRelevance": [
      "inflammation",
      "gut_skin_axis"
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
  // Include all additional screening questions (SCR033-SCR075)
  ...additionalScreeningQuestionsPart2
];
