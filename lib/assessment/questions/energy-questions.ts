import { AssessmentQuestion } from '../types';

export const energyQuestions: AssessmentQuestion[] = [
  {
    "id": "ENE002",
    "text": "Do you experience post-exertional malaise (feeling worse after physical or mental activity)?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
      "Lactate",
      "Pyruvate",
      "Mitochondrial antibodies"
    ],
    "clinicalRelevance": [
      "CFS/ME",
      "mitochondrial_dysfunction"
    ]
  },
  {
    "id": "ENE003",
    "text": "When do you have the most energy during the day?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Morning - feel refreshed upon waking",
        "score": 0,
        "value": 0
      },
      {
        "label": "Mid-morning after getting going",
        "score": 1,
        "value": 1
      },
      {
        "label": "Afternoon",
        "score": 2,
        "value": 2
      },
      {
        "label": "Evening - second wind",
        "score": 3,
        "value": 3
      },
      {
        "label": "No consistent energy pattern",
        "score": 3,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Cortisol rhythm",
      "Melatonin",
      "Blood sugar"
    ],
    "clinicalRelevance": [
      "circadian_disruption",
      "adrenal_dysfunction"
    ]
  },
  {
    "id": "ENE004",
    "text": "Do you experience energy crashes during the day?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
        "label": "Daily",
        "value": 3
      },
      {
        "label": "Multiple times daily",
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Glucose",
      "Insulin",
      "Cortisol"
    ],
    "clinicalRelevance": [
      "blood_sugar_dysregulation",
      "adrenal_fatigue"
    ]
  },
  {
    "id": "ENE005",
    "text": "When do you typically experience energy crashes?",
    "type": "MULTI_SELECT",
    "module": "ENERGY",
    "options": [
      {
        "label": "No crashes",
        "score": 0,
        "value": "none"
      },
      {
        "label": "Mid-morning (10-11am)",
        "score": 2,
        "value": "morning"
      },
      {
        "label": "Afternoon (2-4pm)",
        "score": 2,
        "value": "afternoon"
      },
      {
        "label": "Early evening (5-7pm)",
        "score": 2,
        "value": "evening"
      },
      {
        "label": "After meals",
        "score": 3,
        "value": "postmeal"
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Continuous glucose monitor",
      "HbA1c"
    ],
    "clinicalRelevance": [
      "reactive_hypoglycemia",
      "insulin_resistance"
    ]
  },
  {
    "id": "ENE006",
    "text": "Are you sensitive to cold temperatures?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Not sensitive",
        "value": 1
      },
      {
        "label": "Extremely sensitive",
        "value": 5
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "TSH",
      "Free T3",
      "Free T4",
      "Reverse T3"
    ],
    "clinicalRelevance": [
      "hypothyroid",
      "metabolic_rate"
    ]
  },
  {
    "id": "ENE007",
    "text": "What is your morning body temperature before getting out of bed?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Above 98°F",
        "score": 0,
        "value": 0
      },
      {
        "label": "97.5-98°F",
        "score": 1,
        "value": 1
      },
      {
        "label": "97-97.5°F",
        "score": 2,
        "value": 2
      },
      {
        "label": "Below 97°F",
        "score": 3,
        "value": 3
      },
      {
        "label": "Don't know",
        "score": 1,
        "value": 4
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Thyroid panel",
      "Metabolic markers"
    ],
    "clinicalRelevance": [
      "thyroid_function",
      "metabolic_rate"
    ]
  },
  {
    "id": "ENE008",
    "text": "Do you feel \"tired but wired\" at bedtime?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
    "category": "HORMONAL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Evening cortisol",
      "DHEA",
      "Melatonin"
    ],
    "clinicalRelevance": [
      "cortisol_dysregulation",
      "HPA_dysfunction"
    ]
  },
  {
    "id": "ENE009",
    "text": "Do you crave salt or salty foods?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
    "category": "HORMONAL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Aldosterone",
      "Sodium",
      "Potassium"
    ],
    "clinicalRelevance": [
      "adrenal_insufficiency",
      "electrolyte_imbalance"
    ]
  },
  {
    "id": "ENE_SO01",
    "text": "Do you notice energy differences when eating home-cooked versus restaurant meals?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No difference",
        "value": 1
      },
      {
        "label": "Major energy difference",
        "value": 5
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Oxidative stress",
      "Mitochondrial function"
    ],
    "clinicalRelevance": [
      "food_quality_impact",
      "mitochondrial_stress"
    ]
  },
  {
    "id": "ENE_SO02",
    "text": "How do you feel 2-3 hours after eating fried or heavily processed foods?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Fine, no issues",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slightly tired",
        "score": 1,
        "value": 1
      },
      {
        "label": "Very fatigued",
        "score": 2,
        "value": 2
      },
      {
        "label": "Brain fog",
        "score": 3,
        "value": 3
      },
      {
        "label": "Need to nap",
        "score": 3,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Blood sugar",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "metabolic_inflexibility",
      "oil_induced_fatigue"
    ]
  },
  {
    "id": "ENE010",
    "text": "How refreshed do you feel upon waking?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Exhausted",
        "value": 1
      },
      {
        "label": "Completely refreshed",
        "value": 5
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Sleep study",
      "Morning cortisol",
      "Growth hormone"
    ],
    "clinicalRelevance": [
      "sleep_quality",
      "recovery"
    ]
  },
  {
    "id": "ENE011",
    "text": "How many hours of sleep do you need to feel rested?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "6-8 hours",
        "score": 0,
        "value": 0
      },
      {
        "label": "8-9 hours",
        "score": 1,
        "value": 1
      },
      {
        "label": "9-10 hours",
        "score": 2,
        "value": 2
      },
      {
        "label": "More than 10 hours",
        "score": 3,
        "value": 3
      },
      {
        "label": "Never feel rested regardless",
        "score": 4,
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Sleep markers",
      "Thyroid",
      "Iron"
    ],
    "clinicalRelevance": [
      "sleep_debt",
      "recovery_capacity"
    ]
  },
  {
    "id": "ENE012",
    "text": "How long can you exercise before feeling exhausted?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "More than 60 minutes",
        "score": 0,
        "value": 0
      },
      {
        "label": "30-60 minutes",
        "score": 1,
        "value": 1
      },
      {
        "label": "15-30 minutes",
        "score": 2,
        "value": 2
      },
      {
        "label": "5-15 minutes",
        "score": 3,
        "value": 3
      },
      {
        "label": "Cannot exercise without exhaustion",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "VO2 max",
      "Lactate threshold",
      "Mitochondrial function"
    ],
    "clinicalRelevance": [
      "exercise_intolerance",
      "deconditioning"
    ]
  },
  {
    "id": "ENE013",
    "text": "How long does it take to recover from exercise?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Same day",
        "score": 0,
        "value": 0
      },
      {
        "label": "24 hours",
        "score": 1,
        "value": 1
      },
      {
        "label": "2-3 days",
        "score": 2,
        "value": 2
      },
      {
        "label": "4-7 days",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than a week",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "CK",
      "LDH",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "recovery_impairment",
      "mitochondrial_dysfunction"
    ]
  },
  {
    "id": "ENE014",
    "text": "Do you get shaky, anxious, or irritable when meals are delayed?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Glucose tolerance",
      "Insulin",
      "Cortisol"
    ],
    "clinicalRelevance": [
      "hypoglycemia",
      "metabolic_inflexibility"
    ]
  },
  {
    "id": "ENE015",
    "text": "Do you crave sugar or carbohydrates?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "HbA1c",
      "Fasting insulin",
      "Leptin"
    ],
    "clinicalRelevance": [
      "insulin_resistance",
      "blood_sugar_dysregulation"
    ]
  },
  {
    "id": "ENE016",
    "text": "Can you skip meals without significant discomfort?",
    "type": "YES_NO",
    "module": "ENERGY",
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
    "category": "METABOLIC",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Ketones",
      "Glucose",
      "Free fatty acids"
    ],
    "clinicalRelevance": [
      "metabolic_flexibility",
      "fat_adaptation"
    ]
  },
  {
    "id": "ENE017",
    "text": "How long can you go between meals comfortably?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "More than 5 hours",
        "score": 0,
        "value": 0
      },
      {
        "label": "4-5 hours",
        "score": 1,
        "value": 1
      },
      {
        "label": "3-4 hours",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-3 hours",
        "score": 3,
        "value": 3
      },
      {
        "label": "Need to eat constantly",
        "score": 4,
        "value": 4
      }
    ],
    "category": "METABOLIC",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Metabolic markers",
      "Insulin sensitivity"
    ],
    "clinicalRelevance": [
      "meal_frequency",
      "metabolic_health"
    ]
  },
  {
    "id": "ENE_SO03",
    "text": "Do you feel more energetic when eating simple, whole foods?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No difference",
        "value": 1
      },
      {
        "label": "Significantly more energy",
        "value": 5
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Mitochondrial markers",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "food_quality_energy",
      "processing_impact"
    ]
  },
  {
    "id": "ENE_SO04",
    "text": "How does your energy change when eating packaged/processed foods regularly?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No change",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slightly decreased",
        "score": 1,
        "value": 1
      },
      {
        "label": "Moderately decreased",
        "score": 2,
        "value": 2
      },
      {
        "label": "Significantly decreased",
        "score": 3,
        "value": 3
      },
      {
        "label": "Severe fatigue",
        "score": 4,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Inflammatory markers",
      "Mitochondrial function"
    ],
    "clinicalRelevance": [
      "processed_food_fatigue",
      "oxidative_burden"
    ]
  },
  {
    "id": "ENE018",
    "text": "Do you experience brain fog or mental fatigue?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
      "Neurotransmitters",
      "B vitamins",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "cognitive_fatigue",
      "brain_energy"
    ]
  },
  {
    "id": "ENE019",
    "text": "How is your mental clarity and focus?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Very poor",
        "value": 1
      },
      {
        "label": "Excellent",
        "value": 5
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Dopamine",
      "Norepinephrine",
      "Acetylcholine"
    ],
    "clinicalRelevance": [
      "cognitive_function",
      "neurotransmitter_balance"
    ]
  },
  {
    "id": "ENE020",
    "text": "How does stress affect your energy levels?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No effect",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slight decrease",
        "score": 1,
        "value": 1
      },
      {
        "label": "Moderate decrease",
        "score": 2,
        "value": 2
      },
      {
        "label": "Severe decrease",
        "score": 3,
        "value": 3
      },
      {
        "label": "Complete exhaustion",
        "score": 4,
        "value": 4
      }
    ],
    "category": "STRESS",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Cortisol",
      "DHEA",
      "Pregnenolone"
    ],
    "clinicalRelevance": [
      "stress_response",
      "adrenal_reserve"
    ]
  },
  {
    "id": "ENE021",
    "text": "Do you feel energized or drained by stress?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Energized initially",
        "score": 1,
        "value": 0
      },
      {
        "label": "Neither",
        "score": 0,
        "value": 1
      },
      {
        "label": "Immediately drained",
        "score": 3,
        "value": 2
      },
      {
        "label": "Energized then crash",
        "score": 2,
        "value": 3
      }
    ],
    "category": "STRESS",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "HPA axis markers",
      "Catecholamines"
    ],
    "clinicalRelevance": [
      "stress_adaptation",
      "resilience"
    ]
  },
  {
    "id": "ENE022",
    "text": "How dependent are you on caffeine for energy?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Not at all",
        "value": 1
      },
      {
        "label": "Completely dependent",
        "value": 5
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cortisol",
      "Adenosine",
      "Sleep markers"
    ],
    "clinicalRelevance": [
      "caffeine_dependence",
      "adrenal_fatigue"
    ]
  },
  {
    "id": "ENE023",
    "text": "How many caffeinated beverages do you consume daily?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "None",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-2",
        "score": 1,
        "value": 1
      },
      {
        "label": "3-4",
        "score": 2,
        "value": 2
      },
      {
        "label": "5-6",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 6",
        "score": 4,
        "value": 4
      }
    ],
    "category": "LIFESTYLE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Cortisol rhythm",
      "Sleep quality"
    ],
    "clinicalRelevance": [
      "stimulant_use",
      "energy_compensation"
    ]
  },
  {
    "id": "ENE024",
    "text": "Have you experienced unexplained weight gain?",
    "type": "YES_NO",
    "module": "ENERGY",
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
      "Thyroid",
      "Insulin",
      "Leptin",
      "Cortisol"
    ],
    "clinicalRelevance": [
      "metabolic_dysfunction",
      "hormone_imbalance"
    ]
  },
  {
    "id": "ENE025",
    "text": "Is it difficult for you to lose weight despite diet and exercise?",
    "type": "YES_NO",
    "module": "ENERGY",
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
    "category": "METABOLIC",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Metabolic panel",
      "Hormones",
      "Inflammation"
    ],
    "clinicalRelevance": [
      "weight_loss_resistance",
      "metabolic_adaptation"
    ]
  },
  {
    "id": "ENE026",
    "text": "Do you have difficulty maintaining body temperature?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Thyroid",
      "Mitochondrial function"
    ],
    "clinicalRelevance": [
      "thermoregulation",
      "metabolic_rate"
    ]
  },
  {
    "id": "ENE027",
    "text": "Do you sweat easily or have difficulty sweating?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Normal sweating",
        "score": 0,
        "value": 0
      },
      {
        "label": "Sweat very easily",
        "score": 2,
        "value": 1
      },
      {
        "label": "Rarely sweat",
        "score": 2,
        "value": 2
      },
      {
        "label": "Night sweats",
        "score": 2,
        "value": 3
      }
    ],
    "category": "METABOLIC",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Autonomic function",
      "Hormones"
    ],
    "clinicalRelevance": [
      "autonomic_dysfunction",
      "hormone_imbalance"
    ]
  },
  {
    "id": "ENE_SO05",
    "text": "Have you noticed improved energy when reducing fried and processed foods?",
    "type": "YES_NO",
    "module": "ENERGY",
    "options": [
      {
        "label": "No change",
        "score": 2,
        "value": "no"
      },
      {
        "label": "Yes, improved",
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
      "Mitochondrial markers",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "dietary_energy_impact",
      "oil_burden"
    ]
  },
  {
    "id": "ENE_SO06",
    "text": "How long after eating restaurant food do you feel sluggish?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Don't feel sluggish",
        "score": 0,
        "value": 0
      },
      {
        "label": "Within 30 minutes",
        "score": 3,
        "value": 1
      },
      {
        "label": "1-2 hours",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-4 hours",
        "score": 2,
        "value": 3
      },
      {
        "label": "Next day",
        "score": 1,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Oxidative stress",
      "Glucose response"
    ],
    "clinicalRelevance": [
      "restaurant_food_impact",
      "processing_sensitivity"
    ]
  },
  {
    "id": "ENE028",
    "text": "Have you noticed a decrease in muscle strength or mass?",
    "type": "YES_NO",
    "module": "ENERGY",
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
      "Testosterone",
      "Growth hormone",
      "Creatine kinase"
    ],
    "clinicalRelevance": [
      "sarcopenia",
      "hormone_decline"
    ]
  },
  {
    "id": "ENE029",
    "text": "Do you experience muscle cramps or twitching?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
      "Magnesium",
      "Calcium",
      "Potassium",
      "B vitamins"
    ],
    "clinicalRelevance": [
      "electrolyte_imbalance",
      "nutrient_deficiency"
    ]
  },
  {
    "id": "ENE030",
    "text": "Do you get short of breath easily?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
        "label": "With minimal exertion",
        "value": 4
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Hemoglobin",
      "Ferritin",
      "B12",
      "Cardiac markers"
    ],
    "clinicalRelevance": [
      "anemia",
      "cardiovascular_function"
    ]
  },
  {
    "id": "ENE031",
    "text": "Do you feel like you can't get enough air or need to take deep breaths?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
      "Iron studies",
      "Thyroid",
      "Anxiety markers"
    ],
    "clinicalRelevance": [
      "air_hunger",
      "autonomic_dysfunction"
    ]
  },
  {
    "id": "ENE_SO07",
    "text": "Do you have more sustained energy when avoiding packaged and processed foods?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No difference",
        "value": 1
      },
      {
        "label": "Much better energy",
        "value": 5
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Mitochondrial function",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "diet_energy_correlation",
      "processing_impact"
    ]
  },
  {
    "id": "ENE032",
    "text": "How is your motivation and drive?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No motivation",
        "value": 1
      },
      {
        "label": "Highly motivated",
        "value": 5
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Dopamine",
      "Testosterone",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "dopamine_function",
      "hormone_status"
    ]
  },
  {
    "id": "ENE033",
    "text": "Do you procrastinate or have difficulty starting tasks?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
      "Dopamine",
      "ADHD markers",
      "Executive function"
    ],
    "clinicalRelevance": [
      "executive_dysfunction",
      "dopamine_deficiency"
    ]
  },
  {
    "id": "ENE034",
    "text": "How would you rate your libido/sex drive?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Non-existent",
        "value": 1
      },
      {
        "label": "Very healthy",
        "value": 5
      }
    ],
    "category": "HORMONAL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Sex hormones",
      "Thyroid",
      "Prolactin"
    ],
    "clinicalRelevance": [
      "hormone_balance",
      "sexual_health"
    ]
  },
  {
    "id": "ENE035",
    "text": "Have you noticed a decrease in sexual function or interest?",
    "type": "YES_NO",
    "module": "ENERGY",
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
    "category": "HORMONAL",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Hormones",
      "Vascular markers"
    ],
    "clinicalRelevance": [
      "sexual_dysfunction",
      "hormone_decline"
    ]
  },
  {
    "id": "ENE036",
    "text": "Do you feel like you're aging faster than you should?",
    "type": "YES_NO",
    "module": "ENERGY",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Telomeres",
      "Oxidative stress",
      "Inflammation"
    ],
    "clinicalRelevance": [
      "accelerated_aging",
      "cellular_health"
    ]
  },
  {
    "id": "ENE037",
    "text": "How has your energy changed over the past year?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Improved",
        "score": 0,
        "value": 0
      },
      {
        "label": "Same",
        "score": 1,
        "value": 1
      },
      {
        "label": "Slightly worse",
        "score": 2,
        "value": 2
      },
      {
        "label": "Moderately worse",
        "score": 3,
        "value": 3
      },
      {
        "label": "Significantly worse",
        "score": 4,
        "value": 4
      }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Trending labs",
      "Hormone panels"
    ],
    "clinicalRelevance": [
      "energy_trajectory",
      "health_decline"
    ]
  },
  {
    "id": "ENE038",
    "text": "How is your stamina for daily activities?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "No stamina",
        "value": 1
      },
      {
        "label": "Excellent stamina",
        "value": 5
      }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Cardiopulmonary function",
      "Mitochondrial markers"
    ],
    "clinicalRelevance": [
      "functional_capacity",
      "endurance"
    ]
  },
  {
    "id": "ENE039",
    "text": "Can you climb a flight of stairs without getting winded?",
    "type": "YES_NO",
    "module": "ENERGY",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cardiovascular markers",
      "Iron",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "cardiovascular_fitness",
      "deconditioning"
    ]
  },
  {
    "id": "ENE040",
    "text": "What time of day do you feel most alert?",
    "type": "MULTIPLE_CHOICE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Early morning (5-7am)",
        "score": 0,
        "value": 0
      },
      {
        "label": "Morning (7-10am)",
        "score": 0,
        "value": 1
      },
      {
        "label": "Midday (10am-2pm)",
        "score": 1,
        "value": 2
      },
      {
        "label": "Afternoon (2-6pm)",
        "score": 2,
        "value": 3
      },
      {
        "label": "Evening/night (after 6pm)",
        "score": 3,
        "value": 4
      }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Cortisol rhythm",
      "Melatonin"
    ],
    "clinicalRelevance": [
      "circadian_rhythm",
      "chronotype"
    ]
  },
  {
    "id": "ENE041",
    "text": "Do you rely on naps to get through the day?",
    "type": "FREQUENCY",
    "module": "ENERGY",
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
      "Sleep study",
      "Thyroid",
      "Adrenals"
    ],
    "clinicalRelevance": [
      "sleep_debt",
      "daytime_fatigue"
    ]
  },
  {
    "id": "ENE042",
    "text": "Overall, how satisfied are you with your energy levels?",
    "type": "LIKERT_SCALE",
    "module": "ENERGY",
    "options": [
      {
        "label": "Completely unsatisfied",
        "value": 1
      },
      {
        "label": "Completely satisfied",
        "value": 5
      }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Comprehensive metabolic panel"
    ],
    "clinicalRelevance": [
      "subjective_energy",
      "quality_of_life"
    ]
  }
];
