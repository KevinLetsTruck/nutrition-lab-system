import { AssessmentQuestion } from '../types';

export const assimilationQuestions: AssessmentQuestion[] = [
  {
    "id": "ASM001",
    "text": "How often do you experience heartburn or acid reflux?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "scoringWeight": 1.5,
    "labCorrelations": [
      "H. Pylori",
      "Pepsinogen",
      "Gastrin"
    ],
    "clinicalRelevance": [
      "stomach_acid",
      "GERD",
      "gastritis"
    ]
  },
  {
    "id": "ASM002",
    "text": "Do you notice undigested food particles in your stool?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.8,
    "labCorrelations": [
      "Elastase",
      "Fat absorption",
      "Calprotectin"
    ],
    "clinicalRelevance": [
      "enzyme_insufficiency",
      "malabsorption"
    ]
  },
  {
    "id": "ASM003",
    "text": "How long after eating do you typically feel full?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "2-3 hours (normal)",
        "score": 0,
        "value": 0
      },
      {
        "label": "Less than 1 hour",
        "score": 3,
        "value": 1
      },
      {
        "label": "4-5 hours",
        "score": 2,
        "value": 2
      },
      {
        "label": "More than 5 hours",
        "score": 3,
        "value": 3
      },
      {
        "label": "Varies significantly",
        "score": 2,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Gastroparesis markers",
      "Gastric emptying"
    ],
    "clinicalRelevance": [
      "gastric_motility",
      "stomach_emptying"
    ]
  },
  {
    "id": "ASM004",
    "text": "Do you experience nausea unrelated to pregnancy or medication?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "H. Pylori",
      "Liver enzymes",
      "Electrolytes"
    ],
    "clinicalRelevance": [
      "gastroparesis",
      "liver_dysfunction",
      "dysbiosis"
    ]
  },
  {
    "id": "ASM005",
    "text": "How would you describe your typical bowel movements?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "Well-formed, easy to pass",
        "score": 0,
        "value": 0
      },
      {
        "label": "Hard, difficult to pass",
        "score": 3,
        "value": 1
      },
      {
        "label": "Loose or watery",
        "score": 3,
        "value": 2
      },
      {
        "label": "Alternating between hard and loose",
        "score": 4,
        "value": 3
      },
      {
        "label": "Pencil-thin",
        "score": 3,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "GI-MAP",
      "Calprotectin",
      "Lactoferrin"
    ],
    "clinicalRelevance": [
      "IBS",
      "IBD",
      "dysbiosis"
    ]
  },
  {
    "id": "ASM006",
    "text": "Do you experience excessive gas or bloating within 30 minutes of eating?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Elastase",
      "SIBO breath test"
    ],
    "clinicalRelevance": [
      "enzyme_deficiency",
      "SIBO",
      "carbohydrate_malabsorption"
    ]
  },
  {
    "id": "ASM007",
    "text": "Do you need to use digestive enzymes or HCl to feel comfortable after meals?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Pepsinogen",
      "Gastrin"
    ],
    "clinicalRelevance": [
      "hypochlorhydria",
      "enzyme_insufficiency"
    ]
  },
  {
    "id": "ASM008",
    "text": "Have you been diagnosed with any nutrient deficiencies despite adequate dietary intake?",
    "type": "MULTI_SELECT",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No deficiencies",
        "score": 0,
        "value": "none"
      },
      {
        "label": "Iron",
        "score": 2,
        "value": "iron"
      },
      {
        "label": "Vitamin B12",
        "score": 2,
        "value": "b12"
      },
      {
        "label": "Vitamin D",
        "score": 1,
        "value": "vitd"
      },
      {
        "label": "Magnesium",
        "score": 2,
        "value": "magnesium"
      },
      {
        "label": "Zinc",
        "score": 2,
        "value": "zinc"
      },
      {
        "label": "Folate",
        "score": 2,
        "value": "folate"
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.8,
    "labCorrelations": [
      "Micronutrient panel",
      "Methylation markers"
    ],
    "clinicalRelevance": [
      "malabsorption",
      "intestinal_permeability",
      "celiac"
    ]
  },
  {
    "id": "ASM009",
    "text": "Do you notice floating or greasy stools?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Elastase",
      "Fecal fat",
      "Bile acids"
    ],
    "clinicalRelevance": [
      "fat_malabsorption",
      "pancreatic_insufficiency",
      "bile_insufficiency"
    ]
  },
  {
    "id": "ASM010",
    "text": "How many courses of antibiotics have you taken in the past 2 years?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "None",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-2 courses",
        "score": 1,
        "value": 1
      },
      {
        "label": "3-4 courses",
        "score": 2,
        "value": 2
      },
      {
        "label": "5-6 courses",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 6 courses",
        "score": 4,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "GI-MAP",
      "Comprehensive stool analysis"
    ],
    "clinicalRelevance": [
      "dysbiosis",
      "antibiotic_resistance",
      "candida_overgrowth"
    ]
  },
  {
    "id": "ASM011",
    "text": "Do you experience symptoms that worsen after taking probiotics?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "SIBO breath test",
      "GI-MAP"
    ],
    "clinicalRelevance": [
      "SIBO",
      "histamine_intolerance",
      "dysbiosis"
    ]
  },
  {
    "id": "ASM012",
    "text": "How many foods do you actively avoid due to digestive symptoms?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "None",
        "score": 0,
        "value": 0
      },
      {
        "label": "1-3 foods",
        "score": 1,
        "value": 1
      },
      {
        "label": "4-7 foods",
        "score": 2,
        "value": 2
      },
      {
        "label": "8-12 foods",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 12 foods",
        "score": 4,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Food sensitivity panel",
      "Zonulin",
      "DAO"
    ],
    "clinicalRelevance": [
      "food_sensitivities",
      "leaky_gut",
      "histamine_intolerance"
    ]
  },
  {
    "id": "ASM013",
    "text": "Do you experience immediate bloating or discomfort after consuming dairy products?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Lactose intolerance test",
      "IgG dairy"
    ],
    "clinicalRelevance": [
      "lactose_intolerance",
      "dairy_sensitivity"
    ]
  },
  {
    "id": "ASM_SO01",
    "text": "Do you notice digestive discomfort after eating at restaurants compared to home-cooked meals?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
      "Oxidative stress markers",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "oil_intolerance",
      "oxidative_stress"
    ]
  },
  {
    "id": "ASM_SO02",
    "text": "How do you feel after eating foods cooked at high temperatures (fried, grilled, roasted)?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "Fine, no issues",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slightly heavy",
        "score": 1,
        "value": 1
      },
      {
        "label": "Bloated or uncomfortable",
        "score": 2,
        "value": 2
      },
      {
        "label": "Nauseous",
        "score": 3,
        "value": 3
      },
      {
        "label": "Inflammatory symptoms (joint pain, headache)",
        "score": 4,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "AGEs",
      "Oxidized LDL"
    ],
    "clinicalRelevance": [
      "oxidative_damage",
      "inflammation"
    ]
  },
  {
    "id": "ASM014",
    "text": "Do you notice changes in mood or energy that correlate with digestive symptoms?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Serotonin metabolites",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "gut_brain_axis",
      "neurotransmitter_production"
    ]
  },
  {
    "id": "ASM015",
    "text": "Does stress significantly impact your digestive function?",
    "type": "LIKERT_SCALE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No impact",
        "value": 0
      },
      {
        "label": "Severe impact",
        "value": 10
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Cortisol",
      "sIgA"
    ],
    "clinicalRelevance": [
      "stress_digestion",
      "vagus_nerve"
    ]
  },
  {
    "id": "ASM016",
    "text": "Do you feel excessively full after eating a normal-sized meal?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Pepsinogen",
      "Gastrin"
    ],
    "clinicalRelevance": [
      "hypochlorhydria",
      "slow_digestion"
    ]
  },
  {
    "id": "ASM017",
    "text": "Do you have vertical ridges on your fingernails?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Micronutrients",
      "Protein markers"
    ],
    "clinicalRelevance": [
      "protein_malabsorption",
      "mineral_deficiency"
    ]
  },
  {
    "id": "ASM018",
    "text": "Have you developed new food sensitivities or allergies as an adult?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Zonulin",
      "LPS antibodies",
      "Food antibodies"
    ],
    "clinicalRelevance": [
      "leaky_gut",
      "immune_activation"
    ]
  },
  {
    "id": "ASM019",
    "text": "Do you experience brain fog or fatigue after meals?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Zonulin",
      "Cytokines",
      "Blood sugar"
    ],
    "clinicalRelevance": [
      "leaky_gut",
      "food_reactions",
      "blood_sugar_dysregulation"
    ]
  },
  {
    "id": "ASM020",
    "text": "Do you experience bloating that worsens throughout the day?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "SIBO breath test",
      "Organic acids"
    ],
    "clinicalRelevance": [
      "SIBO",
      "fermentation_excess"
    ]
  },
  {
    "id": "ASM021",
    "text": "Do you have difficulty tolerating fermented foods (yogurt, sauerkraut, kombucha)?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Histamine",
      "DAO",
      "SIBO markers"
    ],
    "clinicalRelevance": [
      "histamine_intolerance",
      "SIBO",
      "dysbiosis"
    ]
  },
  {
    "id": "ASM022",
    "text": "Do you experience pain or discomfort in your right upper abdomen after fatty meals?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Bile acids",
      "Liver enzymes",
      "Bilirubin"
    ],
    "clinicalRelevance": [
      "gallbladder_dysfunction",
      "bile_insufficiency"
    ]
  },
  {
    "id": "ASM023",
    "text": "Have you had your gallbladder removed?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.8,
    "labCorrelations": [
      "Bile acids",
      "Fat-soluble vitamins"
    ],
    "clinicalRelevance": [
      "bile_insufficiency",
      "fat_malabsorption"
    ]
  },
  {
    "id": "ASM024",
    "text": "Do you have bleeding gums or chronic dental issues despite good oral hygiene?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "CRP",
      "Microbiome analysis"
    ],
    "clinicalRelevance": [
      "oral_dysbiosis",
      "systemic_inflammation"
    ]
  },
  {
    "id": "ASM025",
    "text": "Do you have a white coating on your tongue?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Candida antibodies",
      "Organic acids"
    ],
    "clinicalRelevance": [
      "candida_overgrowth",
      "oral_dysbiosis"
    ]
  },
  {
    "id": "ASM026",
    "text": "How would you describe your appetite?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "Normal and regular",
        "score": 0,
        "value": 0
      },
      {
        "label": "Low or absent",
        "score": 2,
        "value": 1
      },
      {
        "label": "Excessive or constant",
        "score": 2,
        "value": 2
      },
      {
        "label": "Varies dramatically",
        "score": 2,
        "value": 3
      },
      {
        "label": "Only hungry at unusual times",
        "score": 1,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Leptin",
      "Ghrelin",
      "Thyroid hormones"
    ],
    "clinicalRelevance": [
      "appetite_regulation",
      "metabolic_dysfunction"
    ]
  },
  {
    "id": "ASM027",
    "text": "Do you experience intense cravings for specific foods?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Blood sugar",
      "Candida markers",
      "Neurotransmitters"
    ],
    "clinicalRelevance": [
      "blood_sugar_imbalance",
      "candida",
      "neurotransmitter_imbalance"
    ]
  },
  {
    "id": "ASM028",
    "text": "How often do you have bowel movements?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
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
        "label": "2-3 times per week",
        "score": 3,
        "value": 3
      },
      {
        "label": "Less than twice per week",
        "score": 4,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Transit time test",
      "Thyroid hormones"
    ],
    "clinicalRelevance": [
      "constipation",
      "diarrhea",
      "motility_issues"
    ]
  },
  {
    "id": "ASM029",
    "text": "Do you need to strain to have a bowel movement?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Magnesium",
      "Thyroid",
      "Fiber markers"
    ],
    "clinicalRelevance": [
      "constipation",
      "pelvic_floor_dysfunction"
    ]
  },
  {
    "id": "ASM030",
    "text": "Are you currently taking or have you regularly taken acid-blocking medications (PPIs, H2 blockers)?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "Never",
        "score": 0,
        "value": 0
      },
      {
        "label": "In the past",
        "score": 2,
        "value": 1
      },
      {
        "label": "Occasionally now",
        "score": 3,
        "value": 2
      },
      {
        "label": "Regularly for less than 1 year",
        "score": 3,
        "value": 3
      },
      {
        "label": "Regularly for more than 1 year",
        "score": 4,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "B12",
      "Magnesium",
      "Iron",
      "Pepsinogen"
    ],
    "clinicalRelevance": [
      "hypochlorhydria",
      "nutrient_depletion",
      "dysbiosis"
    ]
  },
  {
    "id": "ASM031",
    "text": "Do you take NSAIDs (ibuprofen, aspirin) regularly?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
        "label": "Monthly",
        "value": 2
      },
      {
        "label": "Weekly",
        "value": 3
      },
      {
        "label": "Daily",
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Calprotectin",
      "Zonulin",
      "Lactoferrin"
    ],
    "clinicalRelevance": [
      "intestinal_permeability",
      "gut_inflammation"
    ]
  },
  {
    "id": "ASM_SO03",
    "text": "How do you typically feel after eating packaged snack foods?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "Fine",
        "score": 0,
        "value": 0
      },
      {
        "label": "Slightly sluggish",
        "score": 1,
        "value": 1
      },
      {
        "label": "Bloated",
        "score": 2,
        "value": 2
      },
      {
        "label": "Inflammatory symptoms",
        "score": 3,
        "value": 3
      },
      {
        "label": "Digestive distress",
        "score": 3,
        "value": 4
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "Inflammatory markers",
      "Oxidative stress"
    ],
    "clinicalRelevance": [
      "processed_food_intolerance",
      "inflammation"
    ]
  },
  {
    "id": "ASM_SO04",
    "text": "Do you notice differences in how you feel when eating food prepared with different cooking methods?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "SEED_OIL",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "AGEs",
      "Oxidative markers"
    ],
    "clinicalRelevance": [
      "cooking_oil_sensitivity",
      "oxidative_stress"
    ]
  },
  {
    "id": "ASM032",
    "text": "When do you typically experience the most digestive discomfort?",
    "type": "MULTIPLE_CHOICE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No regular discomfort",
        "score": 0,
        "value": 0
      },
      {
        "label": "Immediately after eating",
        "score": 2,
        "value": 1
      },
      {
        "label": "30-60 minutes after eating",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-3 hours after eating",
        "score": 2,
        "value": 3
      },
      {
        "label": "Between meals/empty stomach",
        "score": 2,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "H. Pylori",
      "SIBO",
      "Gastritis markers"
    ],
    "clinicalRelevance": [
      "timing_diagnosis",
      "stomach_vs_intestinal"
    ]
  },
  {
    "id": "ASM033",
    "text": "Do certain food combinations cause more problems than individual foods?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Enzyme markers",
      "pH testing"
    ],
    "clinicalRelevance": [
      "food_combining",
      "enzyme_insufficiency"
    ]
  },
  {
    "id": "ASM034",
    "text": "Do you drink large amounts of fluid with your meals?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Pepsinogen",
      "Digestive enzymes"
    ],
    "clinicalRelevance": [
      "diluted_stomach_acid",
      "impaired_digestion"
    ]
  },
  {
    "id": "ASM035",
    "text": "Do you experience excessive thirst unrelated to exercise or heat?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Blood sugar",
      "Electrolytes",
      "ADH"
    ],
    "clinicalRelevance": [
      "diabetes",
      "electrolyte_imbalance",
      "kidney_function"
    ]
  },
  {
    "id": "ASM036",
    "text": "Do you experience urgency to have a bowel movement after eating?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Calprotectin",
      "Lactoferrin",
      "Food antibodies"
    ],
    "clinicalRelevance": [
      "gastrocolic_reflex",
      "IBS",
      "inflammation"
    ]
  },
  {
    "id": "ASM037",
    "text": "Do you see mucus in your stool?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Calprotectin",
      "Lactoferrin",
      "Parasites"
    ],
    "clinicalRelevance": [
      "IBS",
      "IBD",
      "infection"
    ]
  },
  {
    "id": "ASM038",
    "text": "Have you noticed changes in stool color (pale, clay-colored, or very dark)?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Bilirubin",
      "Liver enzymes",
      "Occult blood"
    ],
    "clinicalRelevance": [
      "liver_function",
      "bile_flow",
      "bleeding"
    ]
  },
  {
    "id": "ASM039",
    "text": "Do you tolerate raw vegetables and salads well?",
    "type": "LIKERT_SCALE",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Digestive enzymes",
      "Stomach acid"
    ],
    "clinicalRelevance": [
      "enzyme_function",
      "digestive_capacity"
    ]
  },
  {
    "id": "ASM040",
    "text": "Do you need to eat very slowly and chew extensively to avoid discomfort?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.3,
    "labCorrelations": [
      "Pepsinogen",
      "Digestive enzymes"
    ],
    "clinicalRelevance": [
      "poor_digestion",
      "low_stomach_acid"
    ]
  },
  {
    "id": "ASM041",
    "text": "Do you get sick more often when experiencing digestive issues?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.4,
    "labCorrelations": [
      "sIgA",
      "Immune markers"
    ],
    "clinicalRelevance": [
      "gut_immune_connection",
      "mucosal_immunity"
    ]
  },
  {
    "id": "ASM042",
    "text": "Have you been diagnosed with any autoimmune conditions?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
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
    "category": "DIGESTIVE",
    "scoringWeight": 1.7,
    "labCorrelations": [
      "Autoimmune panels",
      "Zonulin"
    ],
    "clinicalRelevance": [
      "autoimmunity",
      "intestinal_permeability"
    ]
  },
  {
    "id": "ASM_SO05",
    "text": "How often do you experience digestive symptoms when traveling or eating away from home?",
    "type": "FREQUENCY",
    "module": "ASSIMILATION",
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
      "Inflammatory markers",
      "Food sensitivities"
    ],
    "clinicalRelevance": [
      "restaurant_food_reactions",
      "oil_sensitivity"
    ]
  },
  {
    "id": "ASM_SO06",
    "text": "Do you feel better when eating simple, whole foods versus processed or prepared foods?",
    "type": "LIKERT_SCALE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No difference",
        "value": 0
      },
      {
        "label": "Significant improvement",
        "value": 10
      }
    ],
    "category": "SEED_OIL",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Oxidative stress",
      "Inflammatory markers"
    ],
    "clinicalRelevance": [
      "food_quality_impact",
      "processing_sensitivity"
    ]
  },
  {
    "id": "ASM043",
    "text": "How long have you been experiencing digestive issues?",
    "type": "DURATION",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No issues",
        "score": 0,
        "value": 0
      },
      {
        "label": "Less than 6 months",
        "score": 1,
        "value": 1
      },
      {
        "label": "6 months to 2 years",
        "score": 2,
        "value": 2
      },
      {
        "label": "2-5 years",
        "score": 3,
        "value": 3
      },
      {
        "label": "More than 5 years",
        "score": 4,
        "value": 4
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.5,
    "labCorrelations": [
      "Comprehensive markers"
    ],
    "clinicalRelevance": [
      "chronicity",
      "treatment_planning"
    ]
  },
  {
    "id": "ASM044",
    "text": "Have digestive issues significantly impacted your quality of life?",
    "type": "LIKERT_SCALE",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No impact",
        "value": 0
      },
      {
        "label": "Severe impact",
        "value": 10
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.6,
    "labCorrelations": [
      "Quality of life markers"
    ],
    "clinicalRelevance": [
      "functional_impact",
      "treatment_urgency"
    ]
  },
  {
    "id": "ASM045",
    "text": "Have you noticed patterns or triggers for your digestive symptoms?",
    "type": "YES_NO",
    "module": "ASSIMILATION",
    "options": [
      {
        "label": "No clear patterns",
        "score": 1,
        "value": "no"
      },
      {
        "label": "Yes, identifiable triggers",
        "score": 0,
        "value": "yes"
      }
    ],
    "category": "DIGESTIVE",
    "scoringWeight": 1.2,
    "labCorrelations": [
      "Pattern analysis"
    ],
    "clinicalRelevance": [
      "trigger_identification",
      "treatment_targeting"
    ]
  }
];
