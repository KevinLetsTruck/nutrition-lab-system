import { AssessmentQuestion } from '../types';

export const defenserepairQuestions: AssessmentQuestion[] = [
  {
    "id": "DEF001",
    "text": "How often do you get colds or flu?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Rarely (less than once per year)",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-2 times per year",
        "score": 1,
        "value": 1
      },
      {
        "label": "3-4 times per year",
        "score": 2,
        "value": 2
      },
      {
        "label": "5-6 times per year",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 6 times per year",
        "score": 4,
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "WBC",
      "Lymphocyte subsets",
      "Immunoglobulins"
    ],
    "clinicalRelevance": [
      "immune_deficiency",
      "chronic_infection"
    ]
  },
  {
    "id": "DEF002",
    "text": "How long does it typically take you to recover from a cold or flu?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "3-5 days",
        "score": 0,
        "value": 0
      },
      {
        "label": "1 week",
        "score": 1,
        "value": 1
      },
      {
        "label": "10-14 days",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-3 weeks",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 3 weeks",
        "score": 4,
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "NK cell activity",
      "Vitamin D",
      "Zinc"
    ],
    "clinicalRelevance": [
      "immune_recovery",
      "nutrient_status"
    ]
  },
  {
    "id": "DEF003",
    "text": "Do you have any known allergies (environmental, food, drug)?",
    "type": "MULTI_SELECT",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "No allergies",
        "score": 0,
        "value": "none"
      },
      {
        "label": "Seasonal allergies",
        "score": 1,
        "value": "seasonal"
      },
      {
        "label": "Food allergies",
        "score": 2,
        "value": "food"
      },
      {
        "label": "Drug allergies",
        "score": 1,
        "value": "drug"
      },
      {
        "label": "Pet allergies",
        "score": 1,
        "value": "pet"
      },
      {
        "label": "Multiple severe allergies",
        "score": 3,
        "value": "multiple"
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "IgE",
      "Eosinophils",
      "Histamine"
    ],
    "clinicalRelevance": [
      "allergic_response",
      "immune_dysregulation"
    ]
  },
  {
    "id": "DEF004",
    "text": "Do you experience chronic pain or inflammation anywhere in your body?",
    "type": "LIKERT_SCALE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "No inflammation",
        "value": 1
      },
      {
        "label": "Severe chronic inflammation",
        "value": 5
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "CRP",
      "ESR",
      "Cytokines",
      "Ferritin"
    ],
    "clinicalRelevance": [
      "chronic_inflammation",
      "autoimmunity"
    ]
  },
  {
    "id": "DEF005",
    "text": "Do you have swollen lymph nodes that persist without infection?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "category": "IMMUNE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "CBC",
      "Lymphocyte markers",
      "EBV"
    ],
    "clinicalRelevance": [
      "lymphatic_congestion",
      "chronic_infection"
    ]
  },
  {
    "id": "DEF006",
    "text": "Do you have a family history of autoimmune conditions?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "ANA",
      "Anti-TPO",
      "RF"
    ],
    "clinicalRelevance": [
      "genetic_predisposition",
      "autoimmune_risk"
    ]
  },
  {
    "id": "DEF007",
    "text": "Have you been diagnosed with any autoimmune condition?",
    "type": "MULTI_SELECT",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "None",
        "score": 0,
        "value": "none"
      },
      {
        "label": "Hashimoto's",
        "score": 3,
        "value": "hashimotos"
      },
      {
        "label": "Graves' disease",
        "score": 3,
        "value": "graves"
      },
      {
        "label": "Rheumatoid arthritis",
        "score": 3,
        "value": "ra"
      },
      {
        "label": "Lupus",
        "score": 3,
        "value": "lupus"
      },
      {
        "label": "Multiple sclerosis",
        "score": 3,
        "value": "ms"
      },
      {
        "label": "Other autoimmune condition",
        "score": 3,
        "value": "other"
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.8,
    "labCorrelations": [
      "Autoimmune panels",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "autoimmune_disease",
      "immune_dysregulation"
    ]
  },
  {
    "id": "DEF008",
    "text": "How quickly do cuts and wounds typically heal?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Very quickly (3-5 days)",
        "score": 0,
        "value": 0
      },
      {
        "label": "Normal (1 week)",
        "score": 0,
        "value": 1
      },
      {
        "label": "Slowly (10-14 days)",
        "score": 2,
        "value": 2
      },
      {
        "label": "Very slowly (2-3 weeks)",
        "score": 3,
        "value": 3
      },
      {
        "label": "Extremely slowly (more than 3 weeks)",
        "score": 4,
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Zinc",
      "Vitamin C",
      "Protein markers"
    ],
    "clinicalRelevance": [
      "tissue_repair",
      "nutrient_deficiency"
    ]
  },
  {
    "id": "DEF009",
    "text": "Do you bruise easily?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "category": "IMMUNE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Platelet count",
      "Vitamin C",
      "Vitamin K"
    ],
    "clinicalRelevance": [
      "capillary_fragility",
      "clotting_issues"
    ]
  },
  {
    "id": "DEF_SO01",
    "text": "Do you notice increased joint pain or stiffness after eating certain types of food?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "CRP",
      "Omega-6:3 ratio",
      "Prostaglandins"
    ],
    "clinicalRelevance": [
      "dietary_inflammation",
      "joint_health"
    ]
  },
  {
    "id": "DEF_SO02",
    "text": "How do you feel after eating foods prepared with high heat (grilled, fried, roasted)?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "No different",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slightly inflamed",
        "score": 1,
        "value": 1
      },
      {
        "label": "Joint aches",
        "score": 2,
        "value": 2
      },
      {
        "label": "Skin reactions",
        "score": 2,
        "value": 3
      },
      {
        "label": "Multiple inflammatory symptoms",
        "score": 3,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "AGEs",
      "Oxidative stress markers"
    ],
    "clinicalRelevance": [
      "oxidative_damage",
      "inflammatory_response"
    ]
  },
  {
    "id": "DEF010",
    "text": "Have you been diagnosed with chronic viral infections (EBV, CMV, HSV)?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.7,
    "labCorrelations": [
      "EBV titers",
      "CMV",
      "HSV antibodies"
    ],
    "clinicalRelevance": [
      "chronic_viral_load",
      "immune_suppression"
    ]
  },
  {
    "id": "DEF011",
    "text": "Do you experience recurring infections (UTIs, sinus, yeast, etc.)?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Never",
        "value": 0
      },
      {
        "label": "Once per year",
        "value": 1
      },
      {
        "label": "2-3 times per year",
        "value": 2
      },
      {
        "label": "4-6 times per year",
        "value": 3
      },
      {
        "label": "Monthly or more",
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Immunoglobulins",
      "WBC",
      "Specific cultures"
    ],
    "clinicalRelevance": [
      "recurrent_infections",
      "immune_deficiency"
    ]
  },
  {
    "id": "DEF012",
    "text": "Have you experienced lingering symptoms after a viral infection?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Viral panels",
      "Inflammatory markers",
      "Mitochondrial markers"
    ],
    "clinicalRelevance": [
      "post_viral_syndrome",
      "long_covid"
    ]
  },
  {
    "id": "DEF013",
    "text": "How long does fatigue typically persist after an infection?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Returns to normal within days",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-2 weeks",
        "score": 1,
        "value": 1
      },
      {
        "label": "3-4 weeks",
        "score": 2,
        "value": 2
      },
      {
        "label": "1-3 months",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 3 months",
        "score": 4,
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Mitochondrial function",
      "Cortisol",
      "Thyroid"
    ],
    "clinicalRelevance": [
      "recovery_capacity",
      "chronic_fatigue"
    ]
  },
  {
    "id": "DEF014",
    "text": "Do you have chronic skin conditions (eczema, psoriasis, rashes)?",
    "type": "MULTI_SELECT",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "None",
        "score": 0,
        "value": "none"
      },
      {
        "label": "Eczema",
        "score": 2,
        "value": "eczema"
      },
      {
        "label": "Psoriasis",
        "score": 2,
        "value": "psoriasis"
      },
      {
        "label": "Adult acne",
        "score": 1,
        "value": "acne"
      },
      {
        "label": "Rosacea",
        "score": 2,
        "value": "rosacea"
      },
      {
        "label": "Chronic hives",
        "score": 2,
        "value": "hives"
      },
      {
        "label": "Other chronic skin condition",
        "score": 2,
        "value": "other"
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "IgE",
      "Food sensitivities",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "barrier_dysfunction",
      "immune_dysregulation"
    ]
  },
  {
    "id": "DEF015",
    "text": "How would you rate your skin healing ability?",
    "type": "LIKERT_SCALE",
    "module": "DEFENSE_REPAIR",
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
    "category": "IMMUNE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Zinc",
      "Vitamin A",
      "Collagen markers"
    ],
    "clinicalRelevance": [
      "tissue_repair",
      "skin_health"
    ]
  },
  {
    "id": "DEF016",
    "text": "Do you experience chronic sinus congestion or post-nasal drip?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "IgE",
      "Eosinophils",
      "Mold antibodies"
    ],
    "clinicalRelevance": [
      "chronic_sinusitis",
      "allergic_rhinitis"
    ]
  },
  {
    "id": "DEF017",
    "text": "Do you have asthma or chronic breathing difficulties?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.6,
    "labCorrelations": [
      "IgE",
      "Pulmonary function",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "respiratory_inflammation",
      "allergic_asthma"
    ]
  },
  {
    "id": "DEF018",
    "text": "Are you sensitive to chemicals, perfumes, or strong odors?",
    "type": "LIKERT_SCALE",
    "module": "DEFENSE_REPAIR",
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
    "category": "IMMUNE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Detox markers",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "chemical_sensitivity",
      "detox_impairment"
    ]
  },
  {
    "id": "DEF019",
    "text": "Have you lived or worked in a water-damaged building?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Mycotoxins",
      "TGF-beta1",
      "C4a"
    ],
    "clinicalRelevance": [
      "mold_exposure",
      "biotoxin_illness"
    ]
  },
  {
    "id": "DEF_SO03",
    "text": "Do you experience more inflammation when eating out frequently?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "CRP",
      "IL-6",
      "TNF-alpha"
    ],
    "clinicalRelevance": [
      "restaurant_food_inflammation",
      "oil_sensitivity"
    ]
  },
  {
    "id": "DEF_SO04",
    "text": "Have you noticed improvement in inflammatory symptoms when eating whole, unprocessed foods?",
    "type": "LIKERT_SCALE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "No improvement",
        "value": 1
      },
      {
        "label": "Significant improvement",
        "value": 5
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Inflammatory markers",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "diet_inflammation_connection",
      "processing_sensitivity"
    ]
  },
  {
    "id": "DEF020",
    "text": "Do you have unusual or severe reactions to vaccines?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cytokines",
      "Immunoglobulins"
    ],
    "clinicalRelevance": [
      "vaccine_reaction",
      "immune_hyperreactivity"
    ]
  },
  {
    "id": "DEF021",
    "text": "Do you react strongly to medications at normal doses?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "category": "IMMUNE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Detox genetics",
      "Liver enzymes"
    ],
    "clinicalRelevance": [
      "medication_sensitivity",
      "detox_impairment"
    ]
  },
  {
    "id": "DEF022",
    "text": "Do you experience swelling in your extremities?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Albumin",
      "Kidney function",
      "Cardiac markers"
    ],
    "clinicalRelevance": [
      "lymphatic_congestion",
      "fluid_retention"
    ]
  },
  {
    "id": "DEF023",
    "text": "Do you have cellulite or fibrocystic breasts?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "category": "IMMUNE",
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Estrogen",
      "Lymphatic markers"
    ],
    "clinicalRelevance": [
      "lymphatic_stagnation",
      "hormone_metabolism"
    ]
  },
  {
    "id": "DEF024",
    "text": "Do you get sick more often during stressful periods?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
      "Cortisol",
      "DHEA",
      "sIgA"
    ],
    "clinicalRelevance": [
      "stress_immune_suppression",
      "HPA_dysfunction"
    ]
  },
  {
    "id": "DEF025",
    "text": "How would you rate your overall stress level?",
    "type": "LIKERT_SCALE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "No stress",
        "value": 1
      },
      {
        "label": "Extreme stress",
        "value": 5
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cortisol rhythm",
      "HRV",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "chronic_stress",
      "immune_suppression"
    ]
  },
  {
    "id": "DEF026",
    "text": "Do you have a family history of cancer?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Tumor markers",
      "Genetic testing"
    ],
    "clinicalRelevance": [
      "cancer_risk",
      "genetic_predisposition"
    ]
  },
  {
    "id": "DEF027",
    "text": "Have you been diagnosed with any precancerous conditions?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Specific markers",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "cancer_prevention",
      "immune_surveillance"
    ]
  },
  {
    "id": "DEF028",
    "text": "Do you have chronic dental infections or gum disease?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.4,
    "labCorrelations": [
      "CRP",
      "IL-6",
      "Oral bacteria"
    ],
    "clinicalRelevance": [
      "oral_systemic_connection",
      "chronic_infection"
    ]
  },
  {
    "id": "DEF029",
    "text": "Have you had root canals or dental implants?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
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
        "label": "5 or more",
        "score": 3,
        "value": 3
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Inflammatory markers",
      "Immune markers"
    ],
    "clinicalRelevance": [
      "oral_focal_infection",
      "immune_burden"
    ]
  },
  {
    "id": "DEF030",
    "text": "How does exercise affect your immune system?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Improves immunity",
        "score": 0,
        "value": 0
      },
      {
        "label": "No effect",
        "score": 1,
        "value": 1
      },
      {
        "label": "Sometimes get sick after intense exercise",
        "score": 2,
        "value": 2
      },
      {
        "label": "Often get sick after moderate exercise",
        "score": 3,
        "value": 3
      },
      {
        "label": "Any exercise makes me sick",
        "score": 4,
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cortisol",
      "NK cells",
      "Immunoglobulins"
    ],
    "clinicalRelevance": [
      "exercise_immune_response",
      "overtraining"
    ]
  },
  {
    "id": "DEF_SO05",
    "text": "Do you heal faster when avoiding processed and fried foods?",
    "type": "YES_NO",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "No difference",
        "score": 0,
        "value": "no"
      },
      {
        "label": "Yes, noticeably faster",
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
      "Inflammatory markers",
      "Healing factors"
    ],
    "clinicalRelevance": [
      "diet_healing_connection",
      "inflammation_resolution"
    ]
  },
  {
    "id": "DEF031",
    "text": "Do you have difficulty regulating body temperature?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Thyroid",
      "Autonomic markers"
    ],
    "clinicalRelevance": [
      "autonomic_dysfunction",
      "thyroid_issues"
    ]
  },
  {
    "id": "DEF032",
    "text": "Do you frequently have cold hands and feet?",
    "type": "FREQUENCY",
    "module": "DEFENSE_REPAIR",
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
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Thyroid",
      "Iron",
      "Circulation markers"
    ],
    "clinicalRelevance": [
      "circulation",
      "thyroid_function"
    ]
  },
  {
    "id": "DEF033",
    "text": "How would you rate your overall immune function?",
    "type": "LIKERT_SCALE",
    "module": "DEFENSE_REPAIR",
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
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Comprehensive immune panel"
    ],
    "clinicalRelevance": [
      "subjective_immune_status",
      "overall_health"
    ]
  },
  {
    "id": "DEF034",
    "text": "Have you noticed changes in your immune function over the past year?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Improved significantly",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slightly improved",
        "score": 0,
        "value": 1
      },
      {
        "label": "No change",
        "score": 1,
        "value": 2
      },
      {
        "label": "Slightly worse",
        "score": 2,
        "value": 3
      },
      {
        "label": "Much worse",
        "score": 3,
        "value": 4
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Trending immune markers"
    ],
    "clinicalRelevance": [
      "immune_trajectory",
      "intervention_need"
    ]
  },
  {
    "id": "DEF035",
    "text": "Do you feel your immune system overreacts or underreacts?",
    "type": "MULTIPLE_CHOICE",
    "module": "DEFENSE_REPAIR",
    "options": [
      {
        "label": "Balanced",
        "score": 0,
        "value": 0
      },
      {
        "label": "Tends to underreact (frequent infections)",
        "score": 2,
        "value": 1
      },
      {
        "label": "Tends to overreact (allergies/autoimmune)",
        "score": 2,
        "value": 2
      },
      {
        "label": "Both - unpredictable",
        "score": 3,
        "value": 3
      }
    ],
    "category": "IMMUNE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Th1/Th2 balance",
      "Regulatory T cells"
    ],
    "clinicalRelevance": [
      "immune_balance",
      "regulation_issues"
    ]
  }
];
