import { AssessmentQuestion } from "../../types";
import { BodySystems } from "../../body-systems";

export const cardiovascularQuestions: AssessmentQuestion[] = [
  // Heart Rate & Rhythm
  {
    id: "CARDIO001",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you experience heart palpitations or irregular heartbeat?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["arrhythmia", "cardiac_function", "anxiety"],
  },
  {
    id: "CARDIO002",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Does your heart race or pound without physical exertion?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["tachycardia", "anxiety", "thyroid"],
  },
  {
    id: "CARDIO003",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you feel your heart skip beats?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "occasionally", label: "Occasionally", score: 2 },
      { value: "frequently", label: "Frequently", score: 3 },
      { value: "constantly", label: "Constantly", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["PVCs", "PACs", "arrhythmia"],
  },

  // Blood Pressure
  {
    id: "CARDIO004",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Have you been told you have high blood pressure?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "borderline", label: "Borderline", score: 2 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["hypertension", "cardiovascular_risk"],
  },
  {
    id: "CARDIO005",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you get dizzy when standing up quickly?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["orthostatic_hypotension", "adrenal", "dehydration"],
  },

  // Chest Symptoms
  {
    id: "CARDIO006",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you experience chest pain or discomfort?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 2 },
      { value: "sometimes", label: "Sometimes", score: 3 },
      { value: "often", label: "Often", score: 4 },
      { value: "daily", label: "Daily", score: 5 },
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["angina", "cardiac_ischemia", "GERD"],
  },
  {
    id: "CARDIO007",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Does chest discomfort occur with physical activity?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "No chest discomfort", score: 0 },
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["exertional_angina", "coronary_disease"],
    conditionalLogic: [
      {
        condition: "never",
        action: "skip",
        skipQuestions: ["CARDIO007"],
      },
    ],
  },
  {
    id: "CARDIO008",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you experience chest tightness or pressure?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["cardiac_symptoms", "anxiety", "costochondritis"],
  },

  // Circulation
  {
    id: "CARDIO009",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Are your hands and feet often cold?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["poor_circulation", "thyroid", "raynauds"],
  },
  {
    id: "CARDIO010",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do your fingers or toes turn white or blue in the cold?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["raynauds", "vascular_disease", "autoimmune"],
  },
  {
    id: "CARDIO011",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you have varicose veins or spider veins?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "developing", label: "Starting to develop", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["venous_insufficiency", "circulation"],
  },

  // Edema & Swelling
  {
    id: "CARDIO012",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do your ankles or feet swell?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["edema", "heart_failure", "venous_insufficiency"],
    conditionalLogic: [
      {
        condition: "never",
        action: "skip",
        skipQuestions: ["CARDIO013"],
      },
    ],
  },
  {
    id: "CARDIO013",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Is the swelling worse in the evening?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["dependent_edema", "venous_return"],
  },

  // Exercise Tolerance
  {
    id: "CARDIO014",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you get short of breath with mild exertion (walking, stairs)?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["cardiac_function", "deconditioning", "lung_function"],
  },
  {
    id: "CARDIO015",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "How many flights of stairs can you climb without stopping?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "Cannot climb stairs", score: 4 },
      { value: "less1", label: "Less than 1 flight", score: 3 },
      { value: "1-2", label: "1-2 flights", score: 2 },
      { value: "3-4", label: "3-4 flights", score: 1 },
      { value: "more4", label: "More than 4 flights", score: 0 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["functional_capacity", "cardiac_fitness"],
  },

  // Cardiovascular Risk Factors
  {
    id: "CARDIO016",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you have a family history of heart disease?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["genetic_risk", "family_history"],
  },

  // Leg Symptoms
  {
    id: "CARDIO018",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you experience leg cramps while walking?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 2 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["claudication", "PAD", "vascular_disease"],
  },
  {
    id: "CARDIO019",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you have leg pain at rest that improves with walking?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["venous_congestion", "restless_legs"],
  },

  // Post-COVID Cardiovascular
  {
    id: "CARDIO020",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Since COVID-19, have you noticed new heart symptoms?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "Haven't had COVID", score: 0 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["post_covid_cardiac", "myocarditis", "POTS"],
  },
  {
    id: "CARDIO021",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you have rapid heart rate when standing (POTS symptoms)?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["POTS", "dysautonomia", "post_covid"],
  },

  // Stroke Risk
  {
    id: "CARDIO022",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Have you experienced sudden weakness on one side of your body?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 5 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 2 },
    ],
    scoringWeight: 2.5,
    clinicalRelevance: ["TIA", "stroke_risk", "neurological"],
  },
  {
    id: "CARDIO023",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you have difficulty speaking that comes and goes?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 2 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["TIA", "neurological", "vascular"],
  },

  // Sleep-Related
  {
    id: "CARDIO024",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you wake up gasping for air at night?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "nightly", label: "Nightly", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["sleep_apnea", "heart_failure", "GERD"],
  },
  {
    id: "CARDIO025",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you need extra pillows to breathe comfortably at night?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 2 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["orthopnea", "heart_failure", "COPD"],
  },

  // Fatigue Related
  {
    id: "CARDIO026",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you tire more easily than you used to?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "significantly", label: "Yes, significantly", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["cardiac_output", "anemia", "deconditioning"],
  },

  // Skin Changes
  {
    id: "CARDIO027",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Do you have a bluish tint to your lips or fingernails?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 2 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["cyanosis", "oxygenation", "cardiac_function"],
  },

  // Fainting/Syncope
  {
    id: "CARDIO028",
    module: "SCREENING",
    bodySystem: BodySystems.CARDIOVASCULAR,
    text: "Have you fainted or nearly fainted?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "once", label: "Once", score: 2 },
      { value: "few_times", label: "A few times", score: 3 },
      { value: "regularly", label: "Regularly", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["syncope", "arrhythmia", "vasovagal"],
  },
];
