import { AssessmentQuestion } from '../../types';
import { BodySystems } from '../../body-systems';

export const specialTopicsQuestions: AssessmentQuestion[] = [
  // Seed Oil Consumption & Reactions
  {
    id: "SPEC001",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "How often do you eat fried foods or foods cooked in vegetable oils?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely (1-2x/month)", score: 1 },
      { value: "weekly", label: "Weekly", score: 2 },
      { value: "several_week", label: "Several times per week", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["seed_oil_exposure", "inflammation", "oxidative_stress"],
    seedOilRelevant: true
  },
  {
    id: "SPEC002",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Do you check labels to avoid seed oils (canola, soybean, corn, sunflower)?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "always", label: "Always", score: 0 },
      { value: "often", label: "Often", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "rarely", label: "Rarely", score: 3 },
      { value: "never", label: "Never/Don't know what they are", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["dietary_awareness", "seed_oil_avoidance"],
    seedOilRelevant: true
  },
  {
    id: "SPEC003",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Have you noticed inflammation or joint pain after eating processed foods?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["inflammatory_response", "seed_oil_sensitivity"],
    seedOilRelevant: true
  },
  
  // COVID-19 History
  {
    id: "SPEC004",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Have you had COVID-19?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "once_mild", label: "Yes, once (mild)", score: 1 },
      { value: "once_moderate", label: "Yes, once (moderate)", score: 2 },
      { value: "once_severe", label: "Yes, once (severe)", score: 3 },
      { value: "multiple", label: "Yes, multiple times", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["covid_history", "post_covid_risk"]
  },
  {
    id: "SPEC005",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "If you had COVID-19, when was your most recent infection?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "na", label: "Not applicable", score: 0 },
      { value: "current", label: "Currently infected", score: 4 },
      { value: "1month", label: "Within 1 month", score: 3 },
      { value: "1-3months", label: "1-3 months ago", score: 2 },
      { value: "3-6months", label: "3-6 months ago", score: 1 },
      { value: "over6months", label: "Over 6 months ago", score: 0 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["recovery_timeline", "acute_vs_chronic"],
    conditionalLogic: [{
      condition: "no",
      action: "skip",
      skipQuestions: ["SPEC005", "SPEC006", "SPEC007"]
    }]
  },
  {
    id: "SPEC006",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Do you have ongoing symptoms since COVID-19 (Long COVID)?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "improving", label: "Yes, but improving", score: 2 }
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["long_covid", "persistent_inflammation"]
  },
  {
    id: "SPEC007",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Which symptoms persist since COVID-19? (Select most bothersome)",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "fatigue", label: "Fatigue", score: 2 },
      { value: "brain_fog", label: "Brain fog", score: 2 },
      { value: "breathing", label: "Breathing problems", score: 3 },
      { value: "heart", label: "Heart issues", score: 3 },
      { value: "multiple", label: "Multiple symptoms", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["long_covid_type", "system_affected"]
  },
  
  // COVID Vaccine Status
  {
    id: "SPEC008",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "What is your COVID-19 vaccination status?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "Unvaccinated", score: 0 },
      { value: "partial", label: "Partially vaccinated", score: 0 },
      { value: "full", label: "Fully vaccinated (initial series)", score: 0 },
      { value: "boosted1", label: "1 booster", score: 0 },
      { value: "boosted_multiple", label: "Multiple boosters", score: 0 }
    ],
    scoringWeight: 0.5,
    clinicalRelevance: ["vaccine_status", "exposure_history"]
  },
  {
    id: "SPEC009",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Did you experience adverse effects from COVID-19 vaccination?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "na", label: "Not vaccinated", score: 0 },
      { value: "none", label: "No adverse effects", score: 0 },
      { value: "mild", label: "Mild (sore arm, mild fatigue)", score: 1 },
      { value: "moderate", label: "Moderate (fever, significant fatigue)", score: 2 },
      { value: "severe", label: "Severe (hospitalization, ongoing issues)", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["vaccine_adverse_events", "immune_response"],
    conditionalLogic: [{
      condition: "none",
      action: "skip",
      skipQuestions: ["SPEC009", "SPEC010"]
    }]
  },
  {
    id: "SPEC010",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Are you still experiencing effects from COVID-19 vaccination?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 2 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["persistent_vaccine_effects", "chronic_inflammation"]
  },
  
  // Commercial Driver Specific
  {
    id: "SPEC011",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "How many hours do you sit continuously while driving?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "na", label: "Not a driver", score: 0 },
      { value: "less2", label: "Less than 2 hours", score: 0 },
      { value: "2-4hours", label: "2-4 hours", score: 1 },
      { value: "4-6hours", label: "4-6 hours", score: 2 },
      { value: "6-8hours", label: "6-8 hours", score: 3 },
      { value: "over8", label: "Over 8 hours", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["sedentary_risk", "circulation", "back_health"],
    conditionalLogic: [{
      condition: "no",
      action: "skip",
      skipQuestions: ["SPEC011", "SPEC012", "SPEC013", "SPEC014"]
    }]
  },
  {
    id: "SPEC012",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Do you experience back pain from driving?",
    type: "LIKERT_SCALE",
    scaleMin: "No pain",
    scaleMax: "Severe pain",
    scoringWeight: 1.5,
    clinicalRelevance: ["occupational_injury", "ergonomics", "chronic_pain"]
  },
  {
    id: "SPEC013",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "How often do you eat at truck stops or fast food?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "weekly", label: "Weekly", score: 2 },
      { value: "several_week", label: "Several times per week", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["dietary_quality", "seed_oil_exposure"],
    seedOilRelevant: true
  },
  {
    id: "SPEC014",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Do you have trouble staying alert while driving?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["sleep_apnea", "fatigue", "safety_risk"]
  },
  
  // Environmental Exposures
  {
    id: "SPEC015",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Are you regularly exposed to chemicals or fumes?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["toxic_exposure", "detoxification_needs"]
  },
  {
    id: "SPEC016",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Do you live or work in a moldy or water-damaged building?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "past", label: "In the past", score: 2 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["mold_exposure", "biotoxin_illness"]
  },
  
  // EMF Sensitivity
  {
    id: "SPEC017",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Are you sensitive to WiFi, cell phones, or electronics?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["EMF_sensitivity", "environmental_illness"]
  },
  
  // Medication/Supplement Use
  {
    id: "SPEC018",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "How many prescription medications do you take daily?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "1-2", label: "1-2", score: 1 },
      { value: "3-5", label: "3-5", score: 2 },
      { value: "6-9", label: "6-9", score: 3 },
      { value: "10plus", label: "10 or more", score: 4 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["polypharmacy", "drug_interactions", "side_effects"]
  },
  {
    id: "SPEC019",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "Do you take acid-blocking medications (PPIs, antacids)?",
    type: "YES_NO",
    options: [
      { value: "yes_daily", label: "Yes, daily", score: 3 },
      { value: "yes_often", label: "Yes, often", score: 2 },
      { value: "occasionally", label: "Occasionally", score: 1 },
      { value: "no", label: "No", score: 0 }
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["nutrient_absorption", "gut_health", "B12_deficiency"]
  },
  
  // Stress & Lifestyle
  {
    id: "SPEC020",
    module: "SCREENING",
    bodySystem: BodySystems.SPECIAL_TOPICS,
    text: "How would you rate your overall quality of life?",
    type: "LIKERT_SCALE",
    scaleMin: "Very Poor",
    scaleMax: "Excellent",
    scoringWeight: 1.5,
    clinicalRelevance: ["overall_health", "wellbeing", "life_satisfaction"]
  }
];
