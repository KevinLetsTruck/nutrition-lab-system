import { AssessmentQuestion } from "../../types";
import { BodySystems } from "../../body-systems";

export const immuneQuestions: AssessmentQuestion[] = [
  // Infection Frequency
  {
    id: "IMMUNE001",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "How often do you get colds or flu?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "never", label: "Never/Rarely", score: 0 },
      { value: "1-2year", label: "1-2 times per year", score: 0 },
      { value: "3-4year", label: "3-4 times per year", score: 1 },
      { value: "5-6year", label: "5-6 times per year", score: 2 },
      { value: "monthly", label: "Monthly or more", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["immune_function", "infection_susceptibility"],
  },
  {
    id: "IMMUNE002",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "How long do colds or infections typically last?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "3-5days", label: "3-5 days", score: 0 },
      { value: "1week", label: "About 1 week", score: 0 },
      { value: "2weeks", label: "About 2 weeks", score: 1 },
      { value: "3weeks", label: "3 weeks or more", score: 2 },
      { value: "chronic", label: "They become chronic", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["recovery_time", "immune_resilience"],
  },
  {
    id: "IMMUNE003",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you get recurrent infections (ear, sinus, bladder, skin)?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["chronic_infections", "immune_deficiency"],
  },

  // Wound Healing
  {
    id: "IMMUNE004",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "How quickly do cuts and wounds heal?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "very_fast", label: "Very quickly", score: 0 },
      { value: "normal", label: "Normal speed", score: 0 },
      { value: "slow", label: "Slowly", score: 2 },
      { value: "very_slow", label: "Very slowly", score: 3 },
      { value: "dont_heal", label: "Often don't heal well", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["wound_healing", "immune_function", "nutrition"],
  },
  {
    id: "IMMUNE005",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you scar easily or have poor wound healing?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["collagen_synthesis", "vitamin_C", "zinc_status"],
  },

  // Allergies
  {
    id: "IMMUNE006",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have environmental allergies (pollen, dust, mold)?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "seasonal", label: "Seasonal only", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["allergies", "histamine", "immune_dysregulation"],
  },
  {
    id: "IMMUNE007",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have food allergies or severe food reactions?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "suspected", label: "Suspected but not confirmed", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["food_allergy", "immune_reaction", "anaphylaxis"],
  },
  {
    id: "IMMUNE008",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you experience hives, rashes, or itching?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["urticaria", "allergic_response", "histamine"],
  },

  // Autoimmune
  {
    id: "IMMUNE009",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Have you been diagnosed with an autoimmune condition?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "suspected", label: "Suspected", score: 2 },
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["autoimmune_disease", "immune_dysregulation"],
  },
  {
    id: "IMMUNE010",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have a family history of autoimmune conditions?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["genetic_risk", "autoimmune_predisposition"],
  },

  // Lymph System
  {
    id: "IMMUNE011",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have swollen lymph nodes?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "chronically", label: "Chronically", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["lymphatic_function", "chronic_infection", "immune_activation"],
  },
  {
    id: "IMMUNE012",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have tender or painful lymph nodes?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["lymphadenopathy", "infection", "inflammation"],
  },

  // Fever & Temperature
  {
    id: "IMMUNE013",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you run low-grade fevers frequently?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["chronic_inflammation", "infection", "autoimmune"],
  },
  {
    id: "IMMUNE014",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you rarely or never get fevers when sick?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["immune_suppression", "poor_immune_response"],
  },

  // Inflammatory Symptoms
  {
    id: "IMMUNE015",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have unexplained inflammation or swelling?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 2 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["systemic_inflammation", "immune_dysregulation"],
  },
  {
    id: "IMMUNE016",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have red, inflamed skin patches?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "constantly", label: "Constantly", score: 4 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["dermatitis", "inflammation", "immune_skin"],
  },

  // Cancer History
  {
    id: "IMMUNE017",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Have you had cancer or precancerous conditions?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "precancerous", label: "Precancerous only", score: 2 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["cancer_history", "immune_surveillance"],
  },
  {
    id: "IMMUNE018",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have a family history of cancer?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["genetic_risk", "cancer_predisposition"],
  },

  // Chemical Sensitivity
  {
    id: "IMMUNE019",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Are you sensitive to chemicals, perfumes, or cleaning products?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "mildly", label: "Mildly", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["MCS", "toxic_burden", "immune_reactivity"],
  },

  // Post-Infection Recovery
  {
    id: "IMMUNE020",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you feel you never fully recovered from a past infection?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["chronic_infection", "post_viral", "immune_dysfunction"],
  },
  {
    id: "IMMUNE021",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Have you had mononucleosis (mono) or Epstein-Barr virus?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["EBV", "chronic_fatigue", "viral_reactivation"],
  },

  // Vaccination Response
  {
    id: "IMMUNE022",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you react strongly to vaccines?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["vaccine_reaction", "immune_hyperactivity"],
  },

  // Fungal/Yeast
  {
    id: "IMMUNE023",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have recurring yeast or fungal infections?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["candida", "fungal_overgrowth", "immune_dysfunction"],
  },
  {
    id: "IMMUNE024",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you have athlete's foot, nail fungus, or jock itch?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "past", label: "In the past", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["fungal_infection", "immune_function"],
  },

  // Cold Sores/Herpes
  {
    id: "IMMUNE025",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you get cold sores or fever blisters?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "few_year", label: "Few times a year", score: 2 },
      { value: "monthly", label: "Monthly", score: 3 },
      { value: "constantly", label: "Constantly", score: 4 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["herpes_simplex", "immune_suppression", "stress"],
  },

  // General Immune Status
  {
    id: "IMMUNE026",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "How would you rate your overall immune system?",
    type: "LIKERT_SCALE",
    scaleMin: "Very Weak",
    scaleMax: "Very Strong",
    scoringWeight: 1.5,
    clinicalRelevance: ["immune_perception", "overall_health"],
  },
  {
    id: "IMMUNE027",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you catch everything that goes around?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["susceptibility", "immune_weakness"],
  },

  // Post-COVID Immune
  {
    id: "IMMUNE028",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Since COVID-19, is your immune system weaker?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "Haven't had COVID", score: 0 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["post_covid_immune", "long_covid"],
  },
  {
    id: "IMMUNE029",
    module: "SCREENING",
    bodySystem: BodySystems.IMMUNE,
    text: "Do you get sick more often since COVID-19?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "Haven't had COVID", score: 0 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["post_covid_susceptibility", "immune_dysfunction"],
  },
];
