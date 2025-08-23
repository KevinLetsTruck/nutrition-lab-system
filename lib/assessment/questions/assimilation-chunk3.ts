// ASSIMILATION Module Questions - Chunk 3
// Questions 33-52 of 57 total (after removing direct seed oil questions)

import { AssessmentQuestion } from '../types';

export const assimilationQuestionsChunk3: AssessmentQuestion[] = [
  // ========== MEDICATION & SUPPLEMENT HISTORY (5 questions) ==========
  {
    id: "ASM036",
    module: "ASSIMILATION",
    category: "DIGESTIVE",
    text: "How many courses of antibiotics have you taken in the last 5 years?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "1_2", label: "1-2 courses", score: 1 },
      { value: "3_5", label: "3-5 courses", score: 2 },
      { value: "6_10", label: "6-10 courses", score: 3 },
      { value: "over_10", label: "More than 10", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["dysbiosis_risk", "antibiotic_impact"],
    labCorrelations: ["GI-MAP", "comprehensive_stool"]
  },
  {
    id: "ASM037",
    module: "ASSIMILATION",
    text: "Have you taken NSAIDs (ibuprofen, aspirin) regularly?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 },
      { value: "weekly", label: "Weekly", score: 2 },
      { value: "daily_short", label: "Daily for <1 month", score: 3 },
      { value: "daily_long", label: "Daily for >1 month", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["intestinal_permeability", "gastric_damage"]
  },
  {
    id: "ASM038",
    module: "ASSIMILATION",
    text: "Do you take digestive enzymes or HCl supplements?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "enzymes", label: "Digestive enzymes", score: 1 },
      { value: "hcl", label: "HCl/Betaine", score: 1 },
      { value: "both", label: "Both", score: 2 },
      { value: "helped", label: "Yes, they help significantly", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["enzyme_need", "hypochlorhydria"]
  },
  {
    id: "ASM039",
    module: "ASSIMILATION",
    text: "Have you taken birth control pills?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "past_short", label: "In past, <1 year", score: 1 },
      { value: "past_long", label: "In past, >1 year", score: 2 },
      { value: "current_short", label: "Currently, <1 year", score: 2 },
      { value: "current_long", label: "Currently, >1 year", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["microbiome_impact", "nutrient_depletion"]
  },
  {
    id: "ASM040",
    module: "ASSIMILATION",
    text: "Do probiotics help your digestive symptoms?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never_tried", label: "Never tried", score: 0 },
      { value: "no_effect", label: "No effect", score: 1 },
      { value: "mild_help", label: "Mild improvement", score: 2 },
      { value: "significant_help", label: "Significant improvement", score: 3 },
      { value: "worse", label: "Made symptoms worse", score: 4 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["dysbiosis_type", "SIBO_risk"]
  },

  // ========== ORAL HEALTH & DIGESTION START (5 questions) ==========
  {
    id: "ASM041",
    module: "ASSIMILATION",
    text: "Do you have bleeding gums or gum disease?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes when brushing", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "diagnosed", label: "Diagnosed gum disease", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["oral_microbiome", "systemic_inflammation"],
    labCorrelations: ["CRP", "vitamin_C"]
  },
  {
    id: "ASM042",
    module: "ASSIMILATION",
    text: "Do you have silver (amalgam) fillings?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "1_2", label: "1-2 fillings", score: 1 },
      { value: "3_5", label: "3-5 fillings", score: 2 },
      { value: "over_5", label: "More than 5", score: 3 },
      { value: "removed", label: "Had them removed", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["heavy_metal_exposure", "toxic_burden"]
  },
  {
    id: "ASM043",
    module: "ASSIMILATION",
    text: "Do you chew your food thoroughly?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "very_well", label: "Yes, very thoroughly", score: 0 },
      { value: "adequately", label: "Adequately", score: 1 },
      { value: "quickly", label: "I eat quickly", score: 2 },
      { value: "barely", label: "Barely chew", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["digestion_initiation", "enzyme_activation"]
  },
  {
    id: "ASM044",
    module: "ASSIMILATION",
    text: "Do you have bad breath (halitosis)?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "morning_only", label: "Only in morning", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "constant", label: "Constant", score: 4 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["H_pylori", "SIBO", "oral_dysbiosis"]
  },
  {
    id: "ASM045",
    module: "ASSIMILATION",
    text: "Do you have a white coating on your tongue?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "always", label: "Always", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["candida", "oral_dysbiosis"]
  },

  // ========== HYDRATION & FLUID INTAKE (3 questions) ==========
  {
    id: "ASM046",
    module: "ASSIMILATION",
    text: "How much water do you drink daily?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "less_32oz", label: "Less than 32 oz", score: 3 },
      { value: "32_48oz", label: "32-48 oz", score: 2 },
      { value: "48_64oz", label: "48-64 oz", score: 1 },
      { value: "64_80oz", label: "64-80 oz", score: 0 },
      { value: "over_80oz", label: "Over 80 oz", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["hydration_status", "constipation"]
  },
  {
    id: "ASM047",
    module: "ASSIMILATION",
    text: "Do you drink fluids with meals?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No/minimal", score: 0 },
      { value: "small_amount", label: "Small sips", score: 1 },
      { value: "moderate", label: "Moderate amount", score: 2 },
      { value: "large", label: "Large amount", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["HCl_dilution", "digestive_efficiency"]
  },
  {
    id: "ASM048",
    module: "ASSIMILATION",
    text: "What type of water do you primarily drink?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "tap", label: "Tap water", score: 1 },
      { value: "filtered", label: "Filtered", score: 0 },
      { value: "bottled", label: "Bottled", score: 1 },
      { value: "well", label: "Well water", score: 1 },
      { value: "distilled", label: "Distilled", score: 2 },
      { value: "alkaline", label: "Alkaline water", score: 2 }
    ],
    scoringWeight: 0.8,
    clinicalRelevance: ["toxin_exposure", "mineral_balance"]
  },

  // ========== STRESS & EATING PATTERNS (5 questions) ==========
  {
    id: "ASM049",
    module: "ASSIMILATION",
    text: "Do you eat when stressed or anxious?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always when stressed", score: 4 }
    ],
    scoringWeight: 1.3,
    clinicalRelevance: ["stress_eating", "digestive_impact"]
  },
  {
    id: "ASM050",
    module: "ASSIMILATION",
    text: "Do you eat in a relaxed environment?",
    type: "FREQUENCY",
    options: [
      { value: "always", label: "Always", score: 0 },
      { value: "usually", label: "Usually", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "rarely", label: "Rarely", score: 3 },
      { value: "never", label: "Never (eat on the go)", score: 4 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["parasympathetic_activation", "digestion_quality"]
  },
  {
    id: "ASM051",
    module: "ASSIMILATION",
    text: "How many meals do you typically eat per day?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "1", label: "1 meal", score: 2 },
      { value: "2", label: "2 meals", score: 1 },
      { value: "3", label: "3 meals", score: 0 },
      { value: "4_5", label: "4-5 meals", score: 1 },
      { value: "grazing", label: "Constant grazing", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["meal_frequency", "digestive_rest"]
  },
  {
    id: "ASM052",
    module: "ASSIMILATION",
    text: "Do you experience digestive symptoms when stressed?",
    type: "YES_NO",
    scoringWeight: 1.5,
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    clinicalRelevance: ["gut_brain_axis", "stress_response"]
  },
  {
    id: "ASM053",
    module: "ASSIMILATION",
    text: "Do you practice intermittent fasting?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "12_14hr", label: "12-14 hour fast", score: 0 },
      { value: "16_18hr", label: "16-18 hour fast", score: 1 },
      { value: "20hr_plus", label: "20+ hour fast", score: 2 },
      { value: "multi_day", label: "Multi-day fasts", score: 3 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["digestive_rest", "metabolic_flexibility"]
  },

  // ========== TRAVEL & INFECTION HISTORY (2 questions) ==========
  {
    id: "ASM054",
    module: "ASSIMILATION",
    text: "Have you traveled internationally in the past 5 years?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "developed", label: "Developed countries only", score: 1 },
      { value: "developing", label: "Developing countries", score: 2 },
      { value: "extensive", label: "Extensive travel", score: 3 }
    ],
    scoringWeight: 1.2,
    clinicalRelevance: ["parasite_risk", "pathogen_exposure"]
  },
  {
    id: "ASM055",
    module: "ASSIMILATION",
    text: "Have you had confirmed food poisoning or gastroenteritis?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "once", label: "Once", score: 2 },
      { value: "2_3times", label: "2-3 times", score: 3 },
      { value: "multiple", label: "Multiple times", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["post_infectious_IBS", "chronic_infection"],
    labCorrelations: ["GI-MAP", "parasitology"]
  }
];
