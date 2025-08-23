import { AssessmentQuestion } from "../../types";
import { BodySystems } from "../../body-systems";

export const integumentaryQuestions: AssessmentQuestion[] = [
  // Skin Conditions
  {
    id: "SKIN001",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have dry, flaky, or scaly skin?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "severely", label: "Yes, severely", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["dry_skin", "thyroid", "essential_fatty_acids"],
  },
  {
    id: "SKIN002",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have oily skin or acne?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "severe_acne", label: "Yes, severe acne", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["acne", "hormones", "sebum_production"],
  },
  {
    id: "SKIN003",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have eczema or atopic dermatitis?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "past", label: "In the past", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["eczema", "allergic", "skin_barrier"],
  },
  {
    id: "SKIN004",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have psoriasis?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "mild", label: "Yes, mild", score: 2 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["psoriasis", "autoimmune", "inflammation"],
  },

  // Rashes & Reactions
  {
    id: "SKIN005",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you get rashes or hives?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "constantly", label: "Constantly", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["urticaria", "allergic_reaction", "histamine"],
  },
  {
    id: "SKIN006",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Is your skin sensitive or reactive?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "extremely", label: "Extremely sensitive", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["skin_sensitivity", "contact_dermatitis", "barrier_function"],
  },

  // Itching
  {
    id: "SKIN007",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have itchy skin without a rash?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "constantly", label: "Constantly", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["pruritus", "liver", "kidney", "histamine"],
  },
  {
    id: "SKIN008",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Is itching worse at night?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "No itching", score: 0 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["nocturnal_pruritus", "liver", "parasites"],
    conditionalLogic: [
      {
        condition: "never",
        action: "skip",
        skipQuestions: ["SKIN008"],
      },
    ],
  },

  // Hair Health
  {
    id: "SKIN009",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Are you experiencing hair loss or thinning?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "significant", label: "Yes, significant", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["alopecia", "thyroid", "nutrients", "hormones"],
  },
  {
    id: "SKIN010",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Is your hair dry, brittle, or breaking?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "severely", label: "Yes, severely", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["hair_quality", "protein", "thyroid"],
  },

  // Nail Health
  {
    id: "SKIN011",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have brittle, splitting, or peeling nails?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "severely", label: "Yes, severely", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["nail_health", "nutrients", "thyroid"],
  },
  {
    id: "SKIN012",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have ridges or spots on your nails?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 1 },
      { value: "no", label: "No", score: 0 },
      { value: "many", label: "Yes, many", score: 2 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["nail_abnormalities", "nutrient_deficiency"],
  },

  // Wound Healing
  {
    id: "SKIN013",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do wounds or cuts heal slowly?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "very_slowly", label: "Yes, very slowly", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["wound_healing", "circulation", "nutrients"],
  },
  {
    id: "SKIN014",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you scar easily or have keloids?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "keloids", label: "Yes, keloids", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["scarring", "collagen", "wound_healing"],
  },

  // Color Changes
  {
    id: "SKIN015",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have dark patches or discoloration on your skin?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "many", label: "Yes, many areas", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["hyperpigmentation", "melasma", "insulin_resistance"],
  },
  {
    id: "SKIN016",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Is your skin pale or yellow-tinted?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "very", label: "Yes, very pale/yellow", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["anemia", "jaundice", "liver"],
  },

  // Sun Sensitivity
  {
    id: "SKIN017",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you burn easily in the sun?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 1 },
      { value: "no", label: "No", score: 0 },
      { value: "extremely", label: "Yes, extremely easily", score: 2 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["photosensitivity", "medication_reaction"],
  },
  {
    id: "SKIN018",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have unusual moles or skin growths?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "changing", label: "Yes, changing ones", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["skin_cancer_risk", "melanoma", "dysplastic_nevi"],
  },

  // Other Symptoms
  {
    id: "SKIN019",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you sweat excessively from hands, feet, or armpits?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "severely", label: "Yes, severely", score: 3 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["hyperhidrosis", "autonomic", "anxiety"],
  },
  {
    id: "SKIN020",
    module: "SCREENING",
    bodySystem: BodySystems.INTEGUMENTARY,
    text: "Do you have skin tags or small growths?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 1 },
      { value: "no", label: "No", score: 0 },
      { value: "many", label: "Yes, many", score: 2 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["skin_tags", "insulin_resistance", "metabolic"],
  },
];
