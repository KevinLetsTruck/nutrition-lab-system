import { AssessmentQuestion } from '../types';

export const structuralQuestions: AssessmentQuestion[] = [
  {
    "id": "STR001",
    "text": "Do you experience joint pain or stiffness?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
    "scoringWeight": 1.7,
    "labCorrelations": [
      "CRP",
      "RF",
      "Anti-CCP",
      "Uric acid"
    ],
    "clinicalRelevance": [
      "arthritis",
      "joint_degeneration"
    ]
  },
  {
    "id": "STR002",
    "text": "Which joints are most affected?",
    "type": "MULTI_SELECT",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No joint issues",
        "score": 0,
        "value": "none"
      },
      {
        "label": "Fingers/hands",
        "score": 2,
        "value": "fingers"
      },
      {
        "label": "Knees",
        "score": 2,
        "value": "knees"
      },
      {
        "label": "Hips",
        "score": 2,
        "value": "hips"
      },
      {
        "label": "Shoulders",
        "score": 2,
        "value": "shoulders"
      },
      {
        "label": "Back/spine",
        "score": 2,
        "value": "back"
      },
      {
        "label": "Ankles/feet",
        "score": 2,
        "value": "ankles"
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Joint-specific markers",
      "Imaging"
    ],
    "clinicalRelevance": [
      "joint_distribution",
      "arthritis_type"
    ]
  },
  {
    "id": "STR003",
    "text": "Do you have lower back pain?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
        "label": "Constant",
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Inflammatory markers",
      "Vitamin D"
    ],
    "clinicalRelevance": [
      "lumbar_issues",
      "disc_problems"
    ]
  },
  {
    "id": "STR004",
    "text": "Do you have neck pain or stiffness?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
        "label": "Constant",
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Inflammatory markers",
      "Posture assessment"
    ],
    "clinicalRelevance": [
      "cervical_issues",
      "tension"
    ]
  },
  {
    "id": "STR005",
    "text": "Do you experience muscle weakness?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
        "label": "Severe weakness",
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "CK",
      "Electrolytes",
      "Vitamin D",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "muscle_dysfunction",
      "myopathy"
    ]
  },
  {
    "id": "STR006",
    "text": "Do you have muscle cramps or spasms?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Magnesium",
      "Calcium",
      "Potassium",
      "B vitamins"
    ],
    "clinicalRelevance": [
      "electrolyte_imbalance",
      "mineral_deficiency"
    ]
  },
  {
    "id": "STR007",
    "text": "Have you been diagnosed with osteoporosis or osteopenia?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
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
    ],
    "scoringWeight": 1.7,
    "labCorrelations": [
      "DEXA scan",
      "Vitamin D",
      "Calcium",
      "PTH"
    ],
    "clinicalRelevance": [
      "bone_density",
      "fracture_risk"
    ]
  },
  {
    "id": "STR008",
    "text": "Have you had fractures with minimal trauma?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
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
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Bone markers",
      "Vitamin D",
      "Hormones"
    ],
    "clinicalRelevance": [
      "osteoporosis",
      "bone_fragility"
    ]
  },
  {
    "id": "STR009",
    "text": "Are you hypermobile or double-jointed?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
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
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Collagen markers",
      "Genetic testing"
    ],
    "clinicalRelevance": [
      "EDS",
      "hypermobility_syndrome"
    ]
  },
  {
    "id": "STR010",
    "text": "Do you have stretch marks or easy scarring?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 1,
        "value": "yes"
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Collagen",
      "Vitamin C",
      "Zinc"
    ],
    "clinicalRelevance": [
      "connective_tissue",
      "collagen_synthesis"
    ]
  },
  {
    "id": "STR011",
    "text": "How often do you engage in weight-bearing exercise?",
    "type": "MULTIPLE_CHOICE",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "4+ times/week",
        "score": 0,
        "value": 0
      },
      {
        "label": "2-3 times/week",
        "score": 1,
        "value": 1
      },
      {
        "label": "Once a week",
        "score": 2,
        "value": 2
      },
      {
        "label": "Rarely",
        "score": 3,
        "value": 3
      },
      {
        "label": "Never",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Bone density",
      "Muscle mass"
    ],
    "clinicalRelevance": [
      "bone_health",
      "muscle_maintenance"
    ]
  },
  {
    "id": "STR012",
    "text": "Do you have good flexibility?",
    "type": "LIKERT_SCALE",
    "module": "STRUCTURAL",
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
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Functional assessment"
    ],
    "clinicalRelevance": [
      "flexibility",
      "injury_risk"
    ]
  },
  {
    "id": "STR013",
    "text": "How would you rate your posture?",
    "type": "LIKERT_SCALE",
    "module": "STRUCTURAL",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Postural assessment",
      "Spine imaging"
    ],
    "clinicalRelevance": [
      "postural_dysfunction",
      "alignment"
    ]
  },
  {
    "id": "STR014",
    "text": "Do you have a desk job or sit for long periods?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
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
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Ergonomic assessment"
    ],
    "clinicalRelevance": [
      "postural_stress",
      "muscle_imbalance"
    ]
  },
  {
    "id": "STR015",
    "text": "Is your joint pain worse in the morning?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No/No joint pain",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 2,
        "value": "yes"
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Inflammatory markers",
      "RF",
      "Anti-CCP"
    ],
    "clinicalRelevance": [
      "inflammatory_arthritis",
      "RA"
    ]
  },
  {
    "id": "STR016",
    "text": "Does movement improve your joint pain?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No/Makes it worse",
        "score": 2,
        "value": "no"
      },
      {
        "label": "Yes, improves",
        "score": 0,
        "value": "yes"
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Joint assessment"
    ],
    "clinicalRelevance": [
      "mechanical_vs_inflammatory",
      "arthritis_type"
    ]
  },
  {
    "id": "STR017",
    "text": "Have you had significant injuries or surgeries?",
    "type": "MULTIPLE_CHOICE",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "None",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-2 minor",
        "score": 1,
        "value": 1
      },
      {
        "label": "Multiple minor",
        "score": 2,
        "value": 2
      },
      {
        "label": "1-2 major",
        "score": 3,
        "value": 3
      },
      {
        "label": "Multiple major",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Imaging",
      "Functional assessment"
    ],
    "clinicalRelevance": [
      "injury_history",
      "compensation_patterns"
    ]
  },
  {
    "id": "STR018",
    "text": "Do old injuries still bother you?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No/No injuries",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 2,
        "value": "yes"
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Imaging",
      "Inflammation"
    ],
    "clinicalRelevance": [
      "chronic_pain",
      "incomplete_healing"
    ]
  },
  {
    "id": "STR019",
    "text": "Can you stand on one foot for 30 seconds?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "Yes",
        "score": 0,
        "value": "yes"
      },
      {
        "label": "No",
        "score": 2,
        "value": "no"
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Balance assessment",
      "Neurological"
    ],
    "clinicalRelevance": [
      "balance",
      "fall_risk"
    ]
  },
  {
    "id": "STR020",
    "text": "Have you fallen in the past year?",
    "type": "MULTIPLE_CHOICE",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No falls",
        "score": 0,
        "value": 0
      },
      {
        "label": "Once",
        "score": 2,
        "value": 1
      },
      {
        "label": "Twice",
        "score": 3,
        "value": 2
      },
      {
        "label": "Three or more times",
        "score": 4,
        "value": 3
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Balance test",
      "Vitamin D",
      "Vision"
    ],
    "clinicalRelevance": [
      "fall_risk",
      "balance_issues"
    ]
  },
  {
    "id": "STR021",
    "text": "Do you have cellulite or loose skin?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 1,
        "value": "yes"
      }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Collagen",
      "Hormones"
    ],
    "clinicalRelevance": [
      "connective_tissue",
      "skin_elasticity"
    ]
  },
  {
    "id": "STR022",
    "text": "Do wounds heal slowly?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "Heal normally",
        "value": 0
      },
      {
        "label": "Slightly slow",
        "value": 1
      },
      {
        "label": "Moderately slow",
        "value": 2
      },
      {
        "label": "Very slow",
        "value": 3
      },
      {
        "label": "Extremely slow",
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Vitamin C",
      "Zinc",
      "Protein"
    ],
    "clinicalRelevance": [
      "wound_healing",
      "tissue_repair"
    ]
  },
  {
    "id": "STR023",
    "text": "Do you have widespread body pain?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Fibromyalgia markers",
      "Sleep study"
    ],
    "clinicalRelevance": [
      "fibromyalgia",
      "central_sensitization"
    ]
  },
  {
    "id": "STR024",
    "text": "Are you sensitive to pressure or touch?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
        "label": "Extremely sensitive",
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Tender point exam",
      "Inflammation"
    ],
    "clinicalRelevance": [
      "allodynia",
      "fibromyalgia"
    ]
  },
  {
    "id": "STR025",
    "text": "Do you have jaw pain or TMJ issues?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
        "label": "Constant",
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "TMJ assessment",
      "Dental exam"
    ],
    "clinicalRelevance": [
      "TMJ_dysfunction",
      "bruxism"
    ]
  },
  {
    "id": "STR026",
    "text": "Do you grind your teeth or clench your jaw?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
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
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Dental exam",
      "Stress markers"
    ],
    "clinicalRelevance": [
      "bruxism",
      "stress_manifestation"
    ]
  },
  {
    "id": "STR027",
    "text": "Do you have difficulty walking?",
    "type": "FREQUENCY",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No difficulty",
        "value": 0
      },
      {
        "label": "Slight difficulty",
        "value": 1
      },
      {
        "label": "Moderate difficulty",
        "value": 2
      },
      {
        "label": "Significant difficulty",
        "value": 3
      },
      {
        "label": "Cannot walk unassisted",
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Gait analysis",
      "Neurological exam"
    ],
    "clinicalRelevance": [
      "gait_dysfunction",
      "mobility"
    ]
  },
  {
    "id": "STR028",
    "text": "Can you climb stairs without difficulty?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
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
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Functional assessment",
      "Strength test"
    ],
    "clinicalRelevance": [
      "functional_capacity",
      "strength"
    ]
  },
  {
    "id": "STR029",
    "text": "Can you reach overhead without pain?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "Yes",
        "score": 0,
        "value": "yes"
      },
      {
        "label": "No",
        "score": 2,
        "value": "no"
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "ROM assessment",
      "Shoulder exam"
    ],
    "clinicalRelevance": [
      "shoulder_ROM",
      "impingement"
    ]
  },
  {
    "id": "STR030",
    "text": "Can you bend and touch your toes?",
    "type": "YES_NO",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "Yes",
        "score": 0,
        "value": "yes"
      },
      {
        "label": "No",
        "score": 2,
        "value": "no"
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Flexibility test",
      "Spine assessment"
    ],
    "clinicalRelevance": [
      "flexibility",
      "hamstring_tightness"
    ]
  },
  {
    "id": "STR044",
    "text": "How would you rate your overall musculoskeletal health?",
    "type": "LIKERT_SCALE",
    "module": "STRUCTURAL",
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
      "Comprehensive MSK panel"
    ],
    "clinicalRelevance": [
      "subjective_structural_health"
    ]
  },
  {
    "id": "STR045",
    "text": "Does structural pain limit your daily activities?",
    "type": "LIKERT_SCALE",
    "module": "STRUCTURAL",
    "options": [
      {
        "label": "No limitation",
        "value": 0
      },
      {
        "label": "Completely disabled",
        "value": 10
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Functional assessment"
    ],
    "clinicalRelevance": [
      "disability_level",
      "quality_of_life"
    ]
  }
];
