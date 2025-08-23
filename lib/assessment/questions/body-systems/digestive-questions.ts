import { AssessmentQuestion } from '../../types';
import { BodySystems } from '../../body-systems';

export const digestiveQuestions: AssessmentQuestion[] = [
  // Bloating & Gas
  {
    id: "DIG001",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "How often do you experience bloating after meals?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["digestive_dysfunction", "food_intolerance", "dysbiosis"]
  },
  {
    id: "DIG002",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you experience excessive gas or flatulence?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["dysbiosis", "malabsorption", "food_intolerance"]
  },
  
  // Bowel Movements
  {
    id: "DIG003",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "How many bowel movements do you have per day?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "less1", label: "Less than 1 (constipated)", score: 3 },
      { value: "1day", label: "1 per day", score: 0 },
      { value: "2-3day", label: "2-3 per day", score: 0 },
      { value: "4-5day", label: "4-5 per day", score: 2 },
      { value: "more5", label: "More than 5 (diarrhea)", score: 3 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["bowel_function", "constipation", "diarrhea"]
  },
  {
    id: "DIG004",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you strain during bowel movements?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["constipation", "pelvic_floor", "hemorrhoids"]
  },
  {
    id: "DIG005",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you see undigested food in your stool?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["malabsorption", "enzyme_deficiency", "rapid_transit"]
  },
  
  // Stomach Issues
  {
    id: "DIG006",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you experience heartburn or acid reflux?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "weekly", label: "Weekly", score: 2 },
      { value: "several_week", label: "Several times per week", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["GERD", "stomach_acid", "hiatal_hernia"]
  },
  {
    id: "DIG007",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you experience stomach pain or cramping?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["gastritis", "ulcers", "IBS"]
  },
  {
    id: "DIG008",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you feel nauseous after eating?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["gastroparesis", "gallbladder", "food_sensitivity"]
  },
  
  // Food Reactions
  {
    id: "DIG009",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do certain foods trigger digestive symptoms?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["food_intolerance", "food_allergy", "IBS"]
  },
  {
    id: "DIG010",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you react poorly to fatty or fried foods?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["gallbladder", "bile_production", "fat_malabsorption"],
    conditionalLogic: [{
      condition: "yes",
      action: "trigger",
      triggerQuestions: ["DIG019"] // Seed oil specific question
    }]
  },
  
  // Appetite & Satiety
  {
    id: "DIG011",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "How is your appetite?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "poor", label: "Poor/No appetite", score: 2 },
      { value: "low", label: "Low", score: 1 },
      { value: "normal", label: "Normal", score: 0 },
      { value: "high", label: "High", score: 1 },
      { value: "excessive", label: "Excessive/Always hungry", score: 2 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["metabolic_health", "hormones", "digestive_function"]
  },
  {
    id: "DIG012",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you feel full quickly when eating?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["gastroparesis", "stomach_capacity", "early_satiety"]
  },
  
  // Post-Meal Symptoms
  {
    id: "DIG013",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you feel tired or sluggish after meals?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["blood_sugar", "food_sensitivity", "digestion_energy"]
  },
  {
    id: "DIG014",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you need to loosen your belt after eating?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["bloating", "abdominal_distension", "gas"]
  },
  
  // Gut-Brain Connection
  {
    id: "DIG015",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do digestive symptoms worsen with stress?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["gut_brain_axis", "stress_response", "IBS"]
  },
  
  // Inflammatory Markers
  {
    id: "DIG016",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you have blood or mucus in your stool?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 2 }
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["IBD", "inflammation", "hemorrhoids", "infection"]
  },
  {
    id: "DIG017",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you have unexplained weight loss?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["malabsorption", "IBD", "serious_pathology"]
  },
  
  // Bad Breath/Oral Health
  {
    id: "DIG018",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you have chronic bad breath despite good oral hygiene?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["H_pylori", "SIBO", "oral_dysbiosis"]
  },
  
  // Seed Oil Specific
  {
    id: "DIG019",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you notice worse digestive symptoms after eating restaurant food or processed foods?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["seed_oil_sensitivity", "processed_food_intolerance"],
    seedOilRelevant: true
  },
  
  // Abdominal Sounds
  {
    id: "DIG020",
    module: "SCREENING",
    bodySystem: BodySystems.DIGESTIVE,
    text: "Do you have loud stomach gurgling or rumbling?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "constantly", label: "Constantly", score: 4 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["hyperactive_bowel", "IBS", "malabsorption"]
  }
];
