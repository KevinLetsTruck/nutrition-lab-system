import { AssessmentQuestion } from '../types';

export const transportQuestions: AssessmentQuestion[] = [
  {
    "id": "TRA001",
    "text": "Do you experience chest pain or pressure?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
    "scoringWeight": 1.8,
    "labCorrelations": [
      "Cardiac markers",
      "EKG",
      "Stress test"
    ],
    "clinicalRelevance": [
      "cardiac_risk",
      "angina"
    ]
  },
  {
    "id": "TRA002",
    "text": "Do you get short of breath with minimal exertion?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
    "scoringWeight": 1.7,
    "labCorrelations": [
      "BNP",
      "Ejection fraction",
      "Hemoglobin"
    ],
    "clinicalRelevance": [
      "heart_failure",
      "cardiovascular_fitness"
    ]
  },
  {
    "id": "TRA003",
    "text": "What is your resting heart rate?",
    "type": "MULTIPLE_CHOICE",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "60-70 bpm",
        "score": 0,
        "value": 0
      },
      {
        "label": "50-60 bpm",
        "score": 0,
        "value": 1
      },
      {
        "label": "70-80 bpm",
        "score": 1,
        "value": 2
      },
      {
        "label": "80-90 bpm",
        "score": 2,
        "value": 3
      },
      {
        "label": "Above 90 bpm",
        "score": 3,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "EKG",
      "Thyroid",
      "Autonomic function"
    ],
    "clinicalRelevance": [
      "heart_rate_variability",
      "fitness"
    ]
  },
  {
    "id": "TRA004",
    "text": "Do you have high blood pressure?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
      "24-hour BP monitor",
      "Kidney function"
    ],
    "clinicalRelevance": [
      "hypertension",
      "cardiovascular_risk"
    ]
  },
  {
    "id": "TRA005",
    "text": "Do you experience dizziness when standing up quickly?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
      "Orthostatic vitals",
      "Adrenals",
      "Autonomic"
    ],
    "clinicalRelevance": [
      "orthostatic_hypotension",
      "POTS"
    ]
  },
  {
    "id": "TRA006",
    "text": "Do you have cold hands and feet?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
      "Thyroid",
      "Iron",
      "Circulation markers"
    ],
    "clinicalRelevance": [
      "poor_circulation",
      "Raynauds"
    ]
  },
  {
    "id": "TRA007",
    "text": "Do you experience numbness or tingling in extremities?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "B12",
      "Glucose",
      "Nerve conduction"
    ],
    "clinicalRelevance": [
      "neuropathy",
      "circulation"
    ]
  },
  {
    "id": "TRA008",
    "text": "Do you have swelling in your ankles or legs?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
    "category": "IMMUNE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "BNP",
      "Albumin",
      "Kidney function"
    ],
    "clinicalRelevance": [
      "edema",
      "lymphatic_congestion"
    ]
  },
  {
    "id": "TRA009",
    "text": "Do you have varicose veins or spider veins?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
    "category": "IMMUNE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Venous insufficiency markers"
    ],
    "clinicalRelevance": [
      "venous_insufficiency",
      "circulation"
    ]
  },
  {
    "id": "TRA011",
    "text": "Do you have a family history of heart disease?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
    "category": "METABOLIC",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Genetic markers",
      "Advanced lipids"
    ],
    "clinicalRelevance": [
      "genetic_risk",
      "family_history"
    ]
  },
  {
    "id": "TRA012",
    "text": "How often do you engage in cardiovascular exercise?",
    "type": "MULTIPLE_CHOICE",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "5+ times/week",
        "score": 0,
        "value": 0
      },
      {
        "label": "3-4 times/week",
        "score": 0,
        "value": 1
      },
      {
        "label": "1-2 times/week",
        "score": 1,
        "value": 2
      },
      {
        "label": "Rarely",
        "score": 2,
        "value": 3
      },
      {
        "label": "Never",
        "score": 3,
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Fitness markers",
      "HRV"
    ],
    "clinicalRelevance": [
      "cardiovascular_fitness",
      "exercise_habits"
    ]
  },
  {
    "id": "TRA013",
    "text": "Can you climb two flights of stairs without getting winded?",
    "type": "YES_NO",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "Yes",
        "score": 0,
        "value": "yes"
      },
      {
        "label": "No",
        "score": 3,
        "value": "no"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "category": "LIFESTYLE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Exercise stress test",
      "VO2 max"
    ],
    "clinicalRelevance": [
      "functional_capacity",
      "fitness"
    ]
  },
  {
    "id": "TRA014",
    "text": "Do you experience heart palpitations or irregular heartbeat?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
      "EKG",
      "Holter monitor",
      "Electrolytes"
    ],
    "clinicalRelevance": [
      "arrhythmia",
      "AFib"
    ]
  },
  {
    "id": "TRA015",
    "text": "Do you feel your heart racing without exertion?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Thyroid",
      "Catecholamines",
      "EKG"
    ],
    "clinicalRelevance": [
      "tachycardia",
      "anxiety"
    ]
  },
  {
    "id": "TRA016",
    "text": "Do you have a history of anemia?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "CBC",
      "Iron studies",
      "B12/Folate"
    ],
    "clinicalRelevance": [
      "anemia",
      "oxygen_transport"
    ]
  },
  {
    "id": "TRA017",
    "text": "Do you bruise or bleed easily?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
        "label": "Very easily",
        "value": 4
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Platelets",
      "Coagulation",
      "Vitamin K"
    ],
    "clinicalRelevance": [
      "clotting_disorders",
      "vascular_fragility"
    ]
  },
  {
    "id": "TRA018",
    "text": "Have you had a stroke or TIA (mini-stroke)?",
    "type": "YES_NO",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 4,
        "value": "yes"
      }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.8,
    "labCorrelations": [
      "Carotid ultrasound",
      "Brain MRI"
    ],
    "clinicalRelevance": [
      "stroke_history",
      "vascular_risk"
    ]
  },
  {
    "id": "TRA019",
    "text": "Do you have difficulty speaking or sudden weakness on one side?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Once ever",
        "value": 1
      },
      {
        "label": "Rarely",
        "value": 2
      },
      {
        "label": "Sometimes",
        "value": 3
      },
      {
        "label": "Often",
        "value": 4
      }
    ],
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Neurological exam",
      "Carotid scan"
    ],
    "clinicalRelevance": [
      "TIA_symptoms",
      "stroke_risk"
    ]
  },
  {
    "id": "TRA020",
    "text": "Do you have diabetes or prediabetes?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
      "HbA1c",
      "Glucose",
      "Insulin"
    ],
    "clinicalRelevance": [
      "vascular_damage",
      "metabolic_risk"
    ]
  },
  {
    "id": "TRA021",
    "text": "Do you smoke or have you smoked in the past?",
    "type": "MULTIPLE_CHOICE",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": 0
      },
      {
        "label": "Quit >5 years ago",
        "score": 1,
        "value": 1
      },
      {
        "label": "Quit 1-5 years ago",
        "score": 2,
        "value": 2
      },
      {
        "label": "Quit <1 year ago",
        "score": 3,
        "value": 3
      },
      {
        "label": "Currently smoke",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Inflammatory markers",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "vascular_damage",
      "atherosclerosis"
    ]
  },
  {
    "id": "TRA022",
    "text": "Do you have chronic inflammation anywhere in your body?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "CRP",
      "IL-6",
      "TNF-alpha"
    ],
    "clinicalRelevance": [
      "vascular_inflammation",
      "atherosclerosis"
    ]
  },
  {
    "id": "TRA023",
    "text": "Do you have autoimmune conditions affecting blood vessels?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Autoimmune panels",
      "ANCA"
    ],
    "clinicalRelevance": [
      "vasculitis",
      "autoimmune"
    ]
  },
  {
    "id": "TRA024",
    "text": "Do you snore or have sleep apnea?",
    "type": "YES_NO",
    "module": "TRANSPORT",
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
    "category": "LIFESTYLE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Sleep study",
      "Oxygen saturation"
    ],
    "clinicalRelevance": [
      "sleep_apnea",
      "cardiovascular_risk"
    ]
  },
  {
    "id": "TRA025",
    "text": "Do you wake up gasping for air?",
    "type": "FREQUENCY",
    "module": "TRANSPORT",
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
        "label": "Nightly",
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Sleep study",
      "Cardiac markers"
    ],
    "clinicalRelevance": [
      "sleep_apnea",
      "heart_failure"
    ]
  },
  {
    "id": "TRA026",
    "text": "How would you rate your cardiovascular health?",
    "type": "LIKERT_SCALE",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "Very poor",
        "value": 0
      },
      {
        "label": "Excellent",
        "value": 10
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Comprehensive cardiac panel"
    ],
    "clinicalRelevance": [
      "subjective_health",
      "awareness"
    ]
  },
  {
    "id": "TRA027",
    "text": "Are you concerned about your heart health?",
    "type": "LIKERT_SCALE",
    "module": "TRANSPORT",
    "options": [
      {
        "label": "Not concerned",
        "value": 0
      },
      {
        "label": "Very concerned",
        "value": 10
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Risk assessment"
    ],
    "clinicalRelevance": [
      "health_anxiety",
      "motivation"
    ]
  }
];
