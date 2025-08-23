// ASSIMILATION Module Questions - Chunk 4 (Final)
// Questions 56-65 of 65 total

import { AssessmentQuestion } from '../types';

export const assimilationQuestionsChunk4: AssessmentQuestion[] = [
  // ========== FAMILY HISTORY & GENETICS (3 questions) ==========
  {
    id: "ASM056",
    module: "ASSIMILATION",
    category: "DIGESTIVE",
    text: "Do digestive issues run in your family?",
    type: "MULTI_SELECT",
    options: [
      { value: "none", label: "No family history", score: 0 },
      { value: "ibs", label: "IBS", score: 2 },
      { value: "ibd", label: "Crohn's/Colitis", score: 3 },
      { value: "celiac", label: "Celiac disease", score: 3 },
      { value: "colon_cancer", label: "Colon cancer", score: 3 },
      { value: "gerd", label: "GERD/Reflux", score: 2 },
      { value: "gallbladder", label: "Gallbladder issues", score: 2 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["genetic_risk", "family_patterns"]
  },
  {
    id: "ASM057",
    module: "ASSIMILATION",
    text: "Have you had genetic testing showing digestive-related variants?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no_testing", label: "No genetic testing", score: 0 },
      { value: "no_variants", label: "Tested, no variants", score: 0 },
      { value: "mthfr", label: "MTHFR variants", score: 2 },
      { value: "hla_dq", label: "HLA-DQ2/8 (celiac genes)", score: 3 },
      { value: "multiple", label: "Multiple variants", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["genetic_predisposition", "methylation"]
  },
  {
    id: "ASM058",
    module: "ASSIMILATION",
    text: "What is your ethnic background? (affects lactose/gluten tolerance)",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "european", label: "European", score: 0 },
      { value: "african", label: "African", score: 1 },
      { value: "asian", label: "Asian", score: 1 },
      { value: "hispanic", label: "Hispanic/Latino", score: 1 },
      { value: "middle_eastern", label: "Middle Eastern", score: 1 },
      { value: "mixed", label: "Mixed heritage", score: 0 }
    ],
    scoringWeight: 0.8,
    clinicalRelevance: ["lactose_tolerance", "genetic_factors"]
  },

  // ========== SURGICAL HISTORY (2 questions) ==========
  {
    id: "ASM059",
    module: "ASSIMILATION",
    text: "Have you had any abdominal surgeries?",
    type: "MULTI_SELECT",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "appendix", label: "Appendectomy", score: 2 },
      { value: "gallbladder", label: "Gallbladder removal", score: 3 },
      { value: "hernia", label: "Hernia repair", score: 1 },
      { value: "csection", label: "C-section", score: 1 },
      { value: "gastric", label: "Gastric surgery", score: 4 },
      { value: "intestinal", label: "Intestinal surgery", score: 4 }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["adhesions", "anatomical_changes", "dysbiosis"]
  },
  {
    id: "ASM060",
    module: "ASSIMILATION",
    text: "Have you had colonoscopy or endoscopy?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "normal", label: "Yes, normal results", score: 0 },
      { value: "polyps", label: "Polyps found", score: 2 },
      { value: "inflammation", label: "Inflammation found", score: 3 },
      { value: "h_pylori", label: "H. pylori found", score: 3 },
      { value: "other", label: "Other findings", score: 2 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["structural_issues", "pathology"]
  },

  // ========== CHILDHOOD DIGESTIVE HISTORY (2 questions) ==========
  {
    id: "ASM061",
    module: "ASSIMILATION",
    text: "Did you have digestive issues as a child?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No issues", score: 0 },
      { value: "colic", label: "Colic as infant", score: 2 },
      { value: "constipation", label: "Chronic constipation", score: 2 },
      { value: "stomach_aches", label: "Frequent stomach aches", score: 2 },
      { value: "food_allergies", label: "Food allergies", score: 3 },
      { value: "multiple", label: "Multiple issues", score: 3 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["developmental_factors", "chronic_patterns"]
  },
  {
    id: "ASM062",
    module: "ASSIMILATION",
    text: "Were you breastfed as an infant?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "exclusive_6mo", label: "Exclusively >6 months", score: 0 },
      { value: "partial", label: "Partially breastfed", score: 1 },
      { value: "brief", label: "Briefly (<3 months)", score: 2 },
      { value: "formula", label: "Formula only", score: 2 },
      { value: "unknown", label: "Don't know", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["microbiome_development", "immune_programming"]
  },

  // ========== CURRENT SYMPTOM SEVERITY (3 questions) ==========
  {
    id: "ASM063",
    module: "ASSIMILATION",
    text: "Rate the overall severity of your digestive symptoms",
    type: "LIKERT_SCALE",
    scoringWeight: 2.5,
    scaleMin: "No symptoms",
    scaleMax: "Severe, disabling",
    scale: { min: 1, max: 5 },
    clinicalRelevance: ["overall_severity", "treatment_urgency"],
    triggerConditions: [
      {
        threshold: 8,
        operator: "gte",
        priority: "high",
        requiresFollowup: true
      }
    ]
  },
  {
    id: "ASM064",
    module: "ASSIMILATION",
    text: "How much do digestive symptoms limit your daily activities?",
    type: "LIKERT_SCALE",
    scoringWeight: 2.0,
    scaleMin: "No limitation",
    scaleMax: "Completely limited",
    scale: { min: 1, max: 5 },
    clinicalRelevance: ["functional_impact", "quality_of_life"]
  },
  {
    id: "ASM065",
    module: "ASSIMILATION",
    text: "How confident are you that your digestive issues can improve?",
    type: "LIKERT_SCALE",
    scoringWeight: 1.0,
    scaleMin: "Not at all confident",
    scaleMax: "Very confident",
    scale: { min: 1, max: 5 },
    clinicalRelevance: ["treatment_readiness", "patient_outlook"]
  }
];
