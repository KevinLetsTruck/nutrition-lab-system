import { AssessmentQuestion } from '../types';

export const communicationQuestions: AssessmentQuestion[] = [
  {
    "id": "COM001",
    "text": "For women: How regular are your menstrual cycles?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "Very regular (28-30 days)",
        "score": 0,
        "value": 0
      },
      {
        "label": "Mostly regular (25-35 days)",
        "score": 1,
        "value": 1
      },
      {
        "label": "Irregular (varies widely)",
        "score": 3,
        "value": 2
      },
      {
        "label": "Very long cycles (>35 days)",
        "score": 3,
        "value": 3
      },
      {
        "label": "No periods/Menopause/Not applicable",
        "score": 0,
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Female hormones",
      "DUTCH test",
      "FSH/LH"
    ],
    "clinicalRelevance": [
      "hormone_balance",
      "PCOS",
      "fertility"
    ]
  },
  {
    "id": "COM002",
    "text": "Do you experience PMS symptoms?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Mild symptoms",
        "value": 1
      },
      {
        "label": "Moderate symptoms",
        "value": 2
      },
      {
        "label": "Severe symptoms",
        "value": 3
      },
      {
        "label": "Debilitating symptoms",
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Estrogen/Progesterone",
      "DUTCH"
    ],
    "clinicalRelevance": [
      "estrogen_dominance",
      "progesterone_deficiency"
    ]
  },
  {
    "id": "COM003",
    "text": "For men: Have you noticed decreased muscle mass or strength?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
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
    "category": "HORMONAL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Testosterone",
      "Free testosterone",
      "SHBG"
    ],
    "clinicalRelevance": [
      "low_testosterone",
      "andropause"
    ]
  },
  {
    "id": "COM004",
    "text": "For men: Do you have difficulty with erections?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
      "Testosterone",
      "Vascular markers",
      "Glucose"
    ],
    "clinicalRelevance": [
      "erectile_dysfunction",
      "vascular_health"
    ]
  },
  {
    "id": "COM005",
    "text": "Have you been diagnosed with thyroid problems?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "No thyroid issues",
        "score": 0,
        "value": 0
      },
      {
        "label": "Hypothyroid",
        "score": 3,
        "value": 1
      },
      {
        "label": "Hyperthyroid",
        "score": 3,
        "value": 2
      },
      {
        "label": "Hashimoto's",
        "score": 3,
        "value": 3
      },
      {
        "label": "Other thyroid condition",
        "score": 3,
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "TSH",
      "Free T3/T4",
      "Thyroid antibodies"
    ],
    "clinicalRelevance": [
      "thyroid_dysfunction",
      "autoimmune"
    ]
  },
  {
    "id": "COM006",
    "text": "Do you have thinning hair or hair loss?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "No hair loss",
        "value": 0
      },
      {
        "label": "Minimal thinning",
        "value": 1
      },
      {
        "label": "Moderate thinning",
        "value": 2
      },
      {
        "label": "Significant hair loss",
        "value": 3
      },
      {
        "label": "Severe/patchy hair loss",
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Thyroid",
      "Iron",
      "Androgens"
    ],
    "clinicalRelevance": [
      "thyroid_symptoms",
      "nutrient_deficiency"
    ]
  },
  {
    "id": "COM007",
    "text": "Do you experience depression or low mood?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
      "Serotonin",
      "Dopamine",
      "Vitamin D"
    ],
    "clinicalRelevance": [
      "depression",
      "neurotransmitter_imbalance"
    ]
  },
  {
    "id": "COM008",
    "text": "Do you experience anxiety or panic attacks?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
      "GABA",
      "Cortisol",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "anxiety_disorder",
      "HPA_dysfunction"
    ]
  },
  {
    "id": "COM009",
    "text": "How is your memory and recall?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
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
      "B12",
      "Homocysteine",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "cognitive_decline",
      "brain_fog"
    ]
  },
  {
    "id": "COM010",
    "text": "Do you have difficulty concentrating or focusing?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Dopamine",
      "Iron",
      "Blood sugar"
    ],
    "clinicalRelevance": [
      "ADHD",
      "executive_dysfunction"
    ]
  },
  {
    "id": "COM011",
    "text": "How long does it take you to fall asleep?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "Less than 15 minutes",
        "score": 0,
        "value": 0
      },
      {
        "label": "15-30 minutes",
        "score": 1,
        "value": 1
      },
      {
        "label": "30-60 minutes",
        "score": 2,
        "value": 2
      },
      {
        "label": "1-2 hours",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 2 hours",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Melatonin",
      "Cortisol",
      "GABA"
    ],
    "clinicalRelevance": [
      "insomnia",
      "circadian_disruption"
    ]
  },
  {
    "id": "COM012",
    "text": "Do you wake up during the night?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Once per night",
        "value": 1
      },
      {
        "label": "2-3 times",
        "value": 2
      },
      {
        "label": "4-5 times",
        "value": 3
      },
      {
        "label": "More than 5 times",
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Cortisol rhythm",
      "Blood sugar",
      "Melatonin"
    ],
    "clinicalRelevance": [
      "sleep_maintenance",
      "cortisol_dysregulation"
    ]
  },
  {
    "id": "COM013",
    "text": "How well do you handle stress?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "Very poorly",
        "value": 0
      },
      {
        "label": "Very well",
        "value": 10
      }
    ],
    "category": "STRESS",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Cortisol",
      "DHEA",
      "HRV"
    ],
    "clinicalRelevance": [
      "stress_resilience",
      "adaptation"
    ]
  },
  {
    "id": "COM014",
    "text": "Do you feel overwhelmed easily?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
    "category": "STRESS",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cortisol",
      "Neurotransmitters"
    ],
    "clinicalRelevance": [
      "stress_tolerance",
      "burnout"
    ]
  },
  {
    "id": "COM015",
    "text": "Do you experience mood swings?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
        "label": "Extreme swings daily",
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Blood sugar",
      "Hormones",
      "Neurotransmitters"
    ],
    "clinicalRelevance": [
      "mood_disorder",
      "hormone_imbalance"
    ]
  },
  {
    "id": "COM016",
    "text": "Do you feel irritable or angry easily?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Testosterone",
      "Blood sugar",
      "B vitamins"
    ],
    "clinicalRelevance": [
      "irritability",
      "neurotransmitter_imbalance"
    ]
  },
  {
    "id": "COM017",
    "text": "Do you experience headaches or migraines?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
        "label": "Several per week",
        "value": 3
      },
      {
        "label": "Daily",
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Magnesium",
      "Hormones",
      "Food sensitivities"
    ],
    "clinicalRelevance": [
      "migraines",
      "tension_headaches"
    ]
  },
  {
    "id": "COM018",
    "text": "Do you have numbness, tingling, or nerve pain?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "neuropathy",
      "nerve_damage"
    ]
  },
  {
    "id": "COM019",
    "text": "Do you have problems with balance or coordination?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
      "Vestibular function",
      "Cerebellar markers"
    ],
    "clinicalRelevance": [
      "vestibular_dysfunction",
      "cerebellar_issues"
    ]
  },
  {
    "id": "COM020",
    "text": "Do you experience dizziness or vertigo?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
      "Blood pressure",
      "Inner ear",
      "B12"
    ],
    "clinicalRelevance": [
      "vertigo",
      "BPPV",
      "orthostatic"
    ]
  },
  {
    "id": "COM021",
    "text": "Have you noticed changes in your vision?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "No changes",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes, changes",
        "score": 2,
        "value": "yes"
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Blood sugar",
      "Vitamin A",
      "Macular health"
    ],
    "clinicalRelevance": [
      "vision_changes",
      "diabetic_retinopathy"
    ]
  },
  {
    "id": "COM022",
    "text": "Do you have ringing in your ears (tinnitus)?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
    "scoringWeight": 1.3,
    "labCorrelations": [
      "B12",
      "Magnesium",
      "Circulation"
    ],
    "clinicalRelevance": [
      "tinnitus",
      "hearing_issues"
    ]
  },
  {
    "id": "COM023",
    "text": "For women: Are you in perimenopause or menopause?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "No/Not applicable",
        "score": 0,
        "value": 0
      },
      {
        "label": "Possibly perimenopause",
        "score": 2,
        "value": 1
      },
      {
        "label": "In perimenopause",
        "score": 2,
        "value": 2
      },
      {
        "label": "In menopause",
        "score": 1,
        "value": 3
      },
      {
        "label": "Post-menopause",
        "score": 1,
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "FSH",
      "Estradiol",
      "Progesterone"
    ],
    "clinicalRelevance": [
      "menopause_transition",
      "hormone_replacement"
    ]
  },
  {
    "id": "COM024",
    "text": "Do you have hot flashes or night sweats?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
        "label": "Multiple times daily",
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Estrogen",
      "FSH",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "vasomotor_symptoms",
      "menopause"
    ]
  },
  {
    "id": "COM025",
    "text": "Have you had difficulty conceiving?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "No/Not applicable",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes",
        "score": 3,
        "value": "yes"
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Fertility panel",
      "Thyroid",
      "Prolactin"
    ],
    "clinicalRelevance": [
      "infertility",
      "hormone_imbalance"
    ]
  },
  {
    "id": "COM026",
    "text": "Have you had miscarriages?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "No/Not applicable",
        "score": 0,
        "value": 0
      },
      {
        "label": "One",
        "score": 2,
        "value": 1
      },
      {
        "label": "Two",
        "score": 3,
        "value": 2
      },
      {
        "label": "Three or more",
        "score": 4,
        "value": 3
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Thyroid",
      "Antiphospholipid",
      "Progesterone"
    ],
    "clinicalRelevance": [
      "recurrent_loss",
      "autoimmune"
    ]
  },
  {
    "id": "COM027",
    "text": "Do you get confused or disoriented when hungry?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
    "category": "METABOLIC",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Glucose",
      "Insulin",
      "Cortisol"
    ],
    "clinicalRelevance": [
      "hypoglycemia",
      "brain_glucose"
    ]
  },
  {
    "id": "COM028",
    "text": "Do you crave sweets or carbohydrates?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
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
    "category": "METABOLIC",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Insulin",
      "Leptin",
      "Serotonin"
    ],
    "clinicalRelevance": [
      "insulin_resistance",
      "neurotransmitter"
    ]
  },
  {
    "id": "COM075",
    "text": "Overall, how satisfied are you with your mental clarity and emotional wellbeing?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      {
        "label": "Very unsatisfied",
        "value": 0
      },
      {
        "label": "Very satisfied",
        "value": 10
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Comprehensive hormone panel",
      "Neurotransmitters"
    ],
    "clinicalRelevance": [
      "overall_neurological_health",
      "quality_of_life"
    ]
  }
];
