import { AssessmentQuestion } from '../types';

export const biotransformationQuestions: AssessmentQuestion[] = [
  {
    "id": "BIO001",
    "text": "How sensitive are you to chemicals, perfumes, or cleaning products?",
    "type": "LIKERT_SCALE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Not sensitive",
        "value": 0
      },
      {
        "label": "Extremely sensitive",
        "value": 10
      }
    ],
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Phase I/II detox",
      "Glutathione",
      "Genetics"
    ],
    "clinicalRelevance": [
      "chemical_sensitivity",
      "detox_impairment"
    ]
  },
  {
    "id": "BIO002",
    "text": "Do you have adverse reactions to medications at normal doses?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Always need lower doses",
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "CYP450",
      "Phase I detox",
      "Liver enzymes"
    ],
    "clinicalRelevance": [
      "slow_metabolizer",
      "liver_function"
    ]
  },
  {
    "id": "BIO003",
    "text": "How well do you tolerate alcohol?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Well - no issues",
        "score": 0,
        "value": 0
      },
      {
        "label": "Get drunk easily",
        "score": 2,
        "value": 1
      },
      {
        "label": "Severe hangovers",
        "score": 3,
        "value": 2
      },
      {
        "label": "Feel sick immediately",
        "score": 3,
        "value": 3
      },
      {
        "label": "Don't drink/can't tolerate",
        "score": 2,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "ADH",
      "ALDH",
      "Glutathione"
    ],
    "clinicalRelevance": [
      "alcohol_metabolism",
      "detox_capacity"
    ]
  },
  {
    "id": "BIO004",
    "text": "Have you been exposed to mold or water-damaged buildings?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 3,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Mycotoxins",
      "TGF-beta1",
      "C4a",
      "MMP-9"
    ],
    "clinicalRelevance": [
      "mold_exposure",
      "biotoxin_illness"
    ]
  },
  {
    "id": "BIO005",
    "text": "Do you work with or have regular exposure to chemicals?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 3,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Heavy metals",
      "Organic acids",
      "Liver enzymes"
    ],
    "clinicalRelevance": [
      "occupational_exposure",
      "toxic_burden"
    ]
  },
  {
    "id": "BIO_SO01",
    "text": "Do you feel \"cleaner\" or lighter when avoiding fried and processed foods?",
    "type": "LIKERT_SCALE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No difference",
        "value": 0
      },
      {
        "label": "Much cleaner feeling",
        "value": 10
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Oxidative stress",
      "Liver enzymes"
    ],
    "clinicalRelevance": [
      "dietary_detox",
      "processing_burden"
    ]
  },
  {
    "id": "BIO_SO02",
    "text": "How does your body handle greasy or oily foods?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Fine",
        "score": 0,
        "value": 0
      },
      {
        "label": "Mild discomfort",
        "score": 1,
        "value": 1
      },
      {
        "label": "Nausea",
        "score": 2,
        "value": 2
      },
      {
        "label": "Headache",
        "score": 3,
        "value": 3
      },
      {
        "label": "Multiple symptoms",
        "score": 4,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Bile acids",
      "Liver function"
    ],
    "clinicalRelevance": [
      "fat_metabolism",
      "liver_congestion"
    ]
  },
  {
    "id": "BIO006",
    "text": "Do you have or have you had silver (amalgam) dental fillings?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": 0
      },
      {
        "label": "Had them removed",
        "score": 2,
        "value": 1
      },
      {
        "label": "Currently 1-3",
        "score": 2,
        "value": 2
      },
      {
        "label": "Currently 4-7",
        "score": 3,
        "value": 3
      },
      {
        "label": "Currently 8+",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Mercury",
      "Heavy metals panel"
    ],
    "clinicalRelevance": [
      "mercury_exposure",
      "heavy_metal_burden"
    ]
  },
  {
    "id": "BIO007",
    "text": "Do you eat large fish (tuna, swordfish, shark) regularly?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Monthly",
        "value": 1
      },
      {
        "label": "Weekly",
        "value": 2
      },
      {
        "label": "2-3 times/week",
        "value": 3
      },
      {
        "label": "Daily",
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Mercury",
      "Heavy metals"
    ],
    "clinicalRelevance": [
      "mercury_exposure",
      "bioaccumulation"
    ]
  },
  {
    "id": "BIO008",
    "text": "Do you experience right upper quadrant pain or discomfort?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Daily",
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "ALT",
      "AST",
      "GGT",
      "Bilirubin"
    ],
    "clinicalRelevance": [
      "liver_congestion",
      "gallbladder_issues"
    ]
  },
  {
    "id": "BIO009",
    "text": "Do you have a history of elevated liver enzymes?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 3,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Liver panel",
      "Hepatitis markers"
    ],
    "clinicalRelevance": [
      "liver_dysfunction",
      "fatty_liver"
    ]
  },
  {
    "id": "BIO010",
    "text": "How often do you urinate during the day?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "4-7 times",
        "score": 0,
        "value": 0
      },
      {
        "label": "Less than 4 times",
        "score": 2,
        "value": 1
      },
      {
        "label": "8-10 times",
        "score": 1,
        "value": 2
      },
      {
        "label": "More than 10 times",
        "score": 2,
        "value": 3
      },
      {
        "label": "Constantly",
        "score": 3,
        "value": 4
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Creatinine",
      "BUN",
      "Electrolytes"
    ],
    "clinicalRelevance": [
      "kidney_function",
      "hydration_status"
    ]
  },
  {
    "id": "BIO011",
    "text": "What color is your urine typically?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Pale yellow",
        "score": 0,
        "value": 0
      },
      {
        "label": "Clear",
        "score": 1,
        "value": 1
      },
      {
        "label": "Dark yellow",
        "score": 2,
        "value": 2
      },
      {
        "label": "Orange/brown",
        "score": 3,
        "value": 3
      },
      {
        "label": "Cloudy",
        "score": 2,
        "value": 4
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Urinalysis",
      "Liver function",
      "Hydration"
    ],
    "clinicalRelevance": [
      "detox_efficiency",
      "hydration"
    ]
  },
  {
    "id": "BIO012",
    "text": "Do you sweat easily with exercise or heat?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Yes",
        "score": 0,
        "value": "yes"
      },
      {
        "label": "No - rarely sweat",
        "score": 2,
        "value": "no"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Autonomic function",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "elimination_pathway",
      "detox_capacity"
    ]
  },
  {
    "id": "BIO013",
    "text": "Do you have body odor that is difficult to control?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Always",
        "value": 4
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Ammonia",
      "Gut bacteria",
      "Detox markers"
    ],
    "clinicalRelevance": [
      "detox_overload",
      "microbiome_imbalance"
    ]
  },
  {
    "id": "BIO_SO03",
    "text": "Do you feel like your body processes restaurant food differently than home-cooked meals?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No difference",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes, noticeable difference",
        "score": 2,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Liver enzymes",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "processing_burden",
      "oil_metabolism"
    ]
  },
  {
    "id": "BIO_SO04",
    "text": "How long does it take to feel \"normal\" after eating heavily processed foods?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No recovery needed",
        "score": 0,
        "value": 0
      },
      {
        "label": "Few hours",
        "score": 1,
        "value": 1
      },
      {
        "label": "Rest of the day",
        "score": 2,
        "value": 2
      },
      {
        "label": "Next day",
        "score": 3,
        "value": 3
      },
      {
        "label": "Several days",
        "score": 4,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Detox markers",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "detox_recovery",
      "processing_burden"
    ]
  },
  {
    "id": "BIO014",
    "text": "Do you have a strong reaction to caffeine?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Normal response",
        "score": 0,
        "value": 0
      },
      {
        "label": "Very sensitive - jittery",
        "score": 2,
        "value": 1
      },
      {
        "label": "No effect at all",
        "score": 2,
        "value": 2
      },
      {
        "label": "Causes anxiety",
        "score": 3,
        "value": 3
      },
      {
        "label": "Can't tolerate",
        "score": 3,
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "CYP1A2",
      "Genetics"
    ],
    "clinicalRelevance": [
      "phase_I_detox",
      "caffeine_metabolism"
    ]
  },
  {
    "id": "BIO015",
    "text": "Do you have trouble with sulfur-containing foods (garlic, onions, eggs)?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No issues",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes, causes problems",
        "score": 2,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "CBS genetics",
      "Sulfur metabolism"
    ],
    "clinicalRelevance": [
      "sulfur_metabolism",
      "methylation"
    ]
  },
  {
    "id": "BIO016",
    "text": "Do you have symptoms of estrogen dominance (PMS, heavy periods, breast tenderness)?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Always",
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Estrogen metabolites",
      "DUTCH test"
    ],
    "clinicalRelevance": [
      "estrogen_metabolism",
      "hormone_detox"
    ]
  },
  {
    "id": "BIO017",
    "text": "Have you had issues with hormonal birth control?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No issues/Not applicable",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes, side effects",
        "score": 2,
        "value": "yes"
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
      "Hormone metabolism",
      "Liver function"
    ],
    "clinicalRelevance": [
      "hormone_clearance",
      "liver_function"
    ]
  },
  {
    "id": "BIO018",
    "text": "Are you sensitive to electromagnetic fields (WiFi, cell phones)?",
    "type": "LIKERT_SCALE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Not sensitive",
        "value": 0
      },
      {
        "label": "Extremely sensitive",
        "value": 10
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Oxidative stress",
      "Inflammation"
    ],
    "clinicalRelevance": [
      "EMF_sensitivity",
      "environmental_illness"
    ]
  },
  {
    "id": "BIO019",
    "text": "Do new buildings or renovations make you feel sick?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 3,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "VOCs",
      "Formaldehyde"
    ],
    "clinicalRelevance": [
      "sick_building_syndrome",
      "chemical_sensitivity"
    ]
  },
  {
    "id": "BIO_SO05",
    "text": "Do you notice less bloating and water retention when avoiding processed foods?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No difference",
        "score": 1,
        "value": "no"
      },
      {
        "label": "Yes, less bloating",
        "score": 0,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Inflammation",
      "Liver function"
    ],
    "clinicalRelevance": [
      "inflammatory_edema",
      "processing_impact"
    ]
  },
  {
    "id": "BIO020",
    "text": "How often do you have bowel movements?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "1-2 times daily",
        "score": 0,
        "value": 0
      },
      {
        "label": "3+ times daily",
        "score": 2,
        "value": 1
      },
      {
        "label": "Every other day",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-3 times/week",
        "score": 3,
        "value": 3
      },
      {
        "label": "Less than 2 times/week",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Transit time",
      "Gut motility"
    ],
    "clinicalRelevance": [
      "elimination",
      "toxin_retention"
    ]
  },
  {
    "id": "BIO021",
    "text": "Do you have hemorrhoids or anal fissures?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 2,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "constipation",
      "straining"
    ]
  },
  {
    "id": "BIO022",
    "text": "Do you have known genetic mutations affecting detoxification (MTHFR, COMT, etc.)?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No/Unknown",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 2,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Genetic testing",
      "Methylation panel"
    ],
    "clinicalRelevance": [
      "genetic_detox",
      "methylation"
    ]
  },
  {
    "id": "BIO023",
    "text": "Does your family have a history of chemical sensitivity or environmental illness?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 2,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Genetic markers"
    ],
    "clinicalRelevance": [
      "genetic_predisposition",
      "family_history"
    ]
  },
  {
    "id": "BIO024",
    "text": "Do you regularly use plastic containers for food storage or heating?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Daily",
        "value": 4
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "BPA",
      "Phthalates"
    ],
    "clinicalRelevance": [
      "plastic_exposure",
      "endocrine_disruption"
    ]
  },
  {
    "id": "BIO025",
    "text": "Do you use conventional personal care products (non-organic)?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Never - all organic",
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
        "label": "Always",
        "value": 4
      }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Parabens",
      "Phthalates"
    ],
    "clinicalRelevance": [
      "cosmetic_toxins",
      "daily_exposure"
    ]
  },
  {
    "id": "BIO026",
    "text": "Do you bruise easily or heal slowly?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Always",
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Vitamin C",
      "Glutathione",
      "CoQ10"
    ],
    "clinicalRelevance": [
      "antioxidant_status",
      "healing_capacity"
    ]
  },
  {
    "id": "BIO027",
    "text": "Do you have premature graying or thinning hair?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 2,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": [
      "B vitamins",
      "Minerals",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "oxidative_damage",
      "nutrient_depletion"
    ]
  },
  {
    "id": "BIO028",
    "text": "Do you wake between 1-3 AM regularly?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Every night",
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Liver enzymes",
      "Cortisol",
      "Blood sugar"
    ],
    "clinicalRelevance": [
      "liver_detox_time",
      "Chinese_medicine"
    ]
  },
  {
    "id": "BIO029",
    "text": "Do you have night sweats?",
    "type": "FREQUENCY",
    "module": "BIOTRANSFORMATION",
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
        "label": "Every night",
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Hormones",
      "Infection markers",
      "Toxins"
    ],
    "clinicalRelevance": [
      "detox_symptoms",
      "hormone_imbalance"
    ]
  },
  {
    "id": "BIO030",
    "text": "Have you done any detox or cleanse programs?",
    "type": "MULTIPLE_CHOICE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Never",
        "score": 1,
        "value": 0
      },
      {
        "label": "Once",
        "score": 0,
        "value": 1
      },
      {
        "label": "Occasionally",
        "score": 0,
        "value": 2
      },
      {
        "label": "Regularly",
        "score": 0,
        "value": 3
      },
      {
        "label": "Currently doing one",
        "score": 0,
        "value": 4
      }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Detox markers"
    ],
    "clinicalRelevance": [
      "detox_history",
      "support_status"
    ]
  },
  {
    "id": "BIO031",
    "text": "How would you rate your overall toxic burden?",
    "type": "LIKERT_SCALE",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Very low",
        "value": 0
      },
      {
        "label": "Extremely high",
        "value": 10
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Comprehensive toxin panel"
    ],
    "clinicalRelevance": [
      "subjective_burden",
      "awareness"
    ]
  },
  {
    "id": "BIO032",
    "text": "Do you feel better after saunas or sweating?",
    "type": "YES_NO",
    "module": "BIOTRANSFORMATION",
    "options": [
      {
        "label": "Yes",
        "score": 0,
        "value": "yes"
      },
      {
        "label": "No/Never tried",
        "score": 1,
        "value": "no"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Detox capacity"
    ],
    "clinicalRelevance": [
      "sweat_elimination",
      "detox_response"
    ]
  }
];
