// ASSIMILATION Module Questions (Digestive System)
// Total: 66 questions including 6 seed oil questions and 1 gateway question
// This file contains questions 1-21 (including gateway)

import { AssessmentQuestion } from '../types';

export const assimilationQuestionsChunk1: AssessmentQuestion[] = [
  // ========== GATEWAY QUESTION ==========
  {
    id: "ASM000",
    module: "ASSIMILATION",
    category: "DIGESTIVE",
    text: "Do you experience any digestive issues or discomfort?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["digestive_health", "GI_symptoms"]
  },

  // ========== DIGESTIVE FUNCTION TIMELINE (5 questions) ==========
  {
    id: "ASM001",
    module: "ASSIMILATION",
    category: "DIGESTIVE",
    text: "When did your digestive symptoms first begin?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "childhood", label: "Since childhood", score: 4 },
      { value: "teens", label: "Teenage years", score: 3 },
      { value: "20s_30s", label: "20s-30s", score: 2 },
      { value: "40s_50s", label: "40s-50s", score: 1 },
      { value: "recent", label: "Recently (last 2 years)", score: 1 },
      { value: "na", label: "N/A - I don't have digestive issues", score: 0 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["chronicity", "developmental_factors"]
  },
  {
    id: "ASM002",
    module: "ASSIMILATION",
    text: "Did your symptoms start after a specific event? (Select all that apply)",
    type: "MULTI_SELECT",
    options: [
      { value: "food_poisoning", label: "Food poisoning", score: 3 },
      { value: "antibiotics", label: "Antibiotic treatment", score: 3 },
      { value: "travel", label: "International travel", score: 2 },
      { value: "surgery", label: "Surgery", score: 2 },
      { value: "stress", label: "Major stress/trauma", score: 2 },
      { value: "pregnancy", label: "Pregnancy", score: 1 },
      { value: "medication", label: "New medication", score: 2 },
      { value: "none", label: "No specific trigger", score: 0 },
      { value: "na", label: "N/A - I don't have digestive issues", score: 0 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["post_infectious_IBS", "dysbiosis_triggers"],
    labCorrelations: ["GI-MAP", "SIBO_breath_test"]
  },
  
  // ========== SEED OIL DIGESTIVE IMPACT (2 questions) ==========
  {
    id: "ASM_SO01",
    module: "ASSIMILATION",
    category: "SEED_OIL",
    text: "Do you experience digestive discomfort after eating fried foods?",
    type: "LIKERT_SCALE",
    scoringWeight: 1.8,
    scaleMin: "Never",
    scaleMax: "Always, severely",
    scale: { min: 0, max: 10 },
    clinicalRelevance: ["lipid_digestion", "gallbladder_function", "oxidative_stress"],
    labCorrelations: ["lipase", "GGT", "oxidized_LDL"]
  },
  {
    id: "ASM_SO02",
    module: "ASSIMILATION",
    category: "SEED_OIL",
    text: "How long after eating fried/processed foods do you feel digestive symptoms?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "immediate", label: "Within 30 minutes", score: 3 },
      { value: "1_2hrs", label: "1-2 hours", score: 2 },
      { value: "2_4hrs", label: "2-4 hours", score: 2 },
      { value: "next_day", label: "Next day", score: 1 },
      { value: "no_symptoms", label: "No symptoms", score: 0 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["digestive_timing", "inflammation_response"]
  },

  // ========== STOMACH ACID & DIGESTION (5 questions) ==========
  {
    id: "ASM003",
    module: "ASSIMILATION",
    text: "Do you experience heartburn or acid reflux?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely (1-2x/month)", score: 1 },
      { value: "weekly", label: "Weekly", score: 2 },
      { value: "several_weekly", label: "Several times/week", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["GERD", "hypochlorhydria", "H_pylori"],
    labCorrelations: ["H_pylori", "pepsinogen"]
  },
  {
    id: "ASM004",
    module: "ASSIMILATION",
    text: "Do you feel full quickly when eating?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "always", label: "Always", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["gastroparesis", "low_stomach_acid"]
  },
  {
    id: "ASM005",
    module: "ASSIMILATION",
    text: "Do you see undigested food in your stool?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["enzyme_insufficiency", "malabsorption"],
    labCorrelations: ["elastase", "fecal_fat"]
  },
  {
    id: "ASM006",
    module: "ASSIMILATION",
    text: "Do you burp or belch frequently after meals?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "always", label: "Always", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["low_HCl", "SIBO", "aerophagia"]
  },
  {
    id: "ASM007",
    module: "ASSIMILATION",
    text: "Do you take antacids or acid-blocking medications?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 },
      { value: "weekly", label: "Weekly", score: 2 },
      { value: "daily", label: "Daily", score: 3 },
      { value: "prescription_ppi", label: "Daily prescription PPI", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["medication_impact", "nutrient_absorption"]
  },

  // ========== BOWEL PATTERNS (5 questions) ==========
  {
    id: "ASM008",
    module: "ASSIMILATION",
    text: "How would you describe your typical bowel movements?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "type_1_2", label: "Hard, difficult to pass", score: 3 },
      { value: "type_3_4", label: "Normal, well-formed", score: 0 },
      { value: "type_5", label: "Soft, blob-like", score: 1 },
      { value: "type_6_7", label: "Loose or watery", score: 3 },
      { value: "alternating", label: "Alternating constipation/diarrhea", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["IBS", "dysbiosis", "inflammation"],
    labCorrelations: ["calprotectin", "lactoferrin"]
  },
  {
    id: "ASM009",
    module: "ASSIMILATION",
    text: "Do you strain to have bowel movements?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "always", label: "Always", score: 3 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["constipation", "pelvic_floor_dysfunction"]
  },
  {
    id: "ASM010",
    module: "ASSIMILATION",
    text: "Do you have urgent bowel movements?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["IBS_D", "inflammation", "infection"],
    labCorrelations: ["calprotectin"]
  },
  {
    id: "ASM011",
    module: "ASSIMILATION",
    text: "Do you see mucus in your stool?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["IBS", "IBD", "infection"]
  },
  {
    id: "ASM012",
    module: "ASSIMILATION",
    text: "Have you noticed blood in your stool?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "once", label: "Once", score: 2 },
      { value: "occasionally", label: "Occasionally", score: 3 },
      { value: "frequently", label: "Frequently", score: 5 }
    ],
    scoringWeight: 3.0,
    clinicalRelevance: ["hemorrhoids", "IBD", "colorectal_concern"],
    triggerConditions: [
      {
        threshold: 2,
        operator: "gte",
        alertLevel: "critical",
        requiresFollowup: true
      }
    ]
  },

  // ========== GAS & BLOATING (3 questions) ==========
  {
    id: "ASM013",
    module: "ASSIMILATION",
    text: "When do you typically experience bloating?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_bloating", label: "No bloating", score: 0 },
      { value: "morning", label: "Wake up bloated", score: 2 },
      { value: "after_meals", label: "After meals", score: 2 },
      { value: "evening", label: "Worse as day progresses", score: 3 },
      { value: "constant", label: "Constant bloating", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["SIBO", "dysbiosis", "food_intolerance"]
  },
  {
    id: "ASM014",
    module: "ASSIMILATION",
    text: "Do you experience excessive gas?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "constantly", label: "Constantly", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["dysbiosis", "malabsorption"]
  },
  {
    id: "ASM015",
    module: "ASSIMILATION",
    text: "Does your abdomen physically distend (look pregnant)?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["SIBO", "severe_dysbiosis"],
    labCorrelations: ["SIBO_breath_test"]
  }
];
