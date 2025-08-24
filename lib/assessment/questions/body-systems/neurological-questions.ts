import { AssessmentQuestion } from "../../types";
import { BodySystems } from "../../body-systems";

export const neurologicalQuestions: AssessmentQuestion[] = [
  // Headaches & Migraines
  {
    id: "NEURO001",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How often do you experience headaches?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely (less than monthly)", score: 1 },
      { value: "monthly", label: "Monthly", score: 2 },
      { value: "weekly", label: "Weekly", score: 3 },
      { value: "daily", label: "Daily", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: [
      "neurological_function",
      "inflammation",
      "vascular_health",
    ],
  },
  {
    id: "NEURO002",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Rate the typical severity of your headaches",
    type: "LIKERT_SCALE",
    scaleMin: "Mild",
    scaleMax: "Severe",
    scoringWeight: 1.5,
    clinicalRelevance: ["pain_severity", "quality_of_life"],
    conditionalLogic: [
      {
        condition: "never",
        action: "skip",
        skipQuestions: ["NEURO002"],
      },
    ],
  },

  // Brain Fog & Cognitive Function
  {
    id: "NEURO003",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Do you experience brain fog or mental cloudiness?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 },
      { value: "frequently", label: "Frequently", score: 2 },
      { value: "daily", label: "Daily", score: 3 },
      { value: "constant", label: "Constant", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["cognitive_function", "inflammation", "post_covid"],
  },
  {
    id: "NEURO004",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How would you rate your memory compared to 5 years ago?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "better", label: "Better", score: 0 },
      { value: "same", label: "About the same", score: 0 },
      { value: "slightly_worse", label: "Slightly worse", score: 1 },
      { value: "moderately_worse", label: "Moderately worse", score: 2 },
      { value: "much_worse", label: "Much worse", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["cognitive_decline", "neurodegeneration"],
  },
  {
    id: "NEURO005",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Do you have difficulty concentrating or focusing?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["ADHD", "cognitive_function", "inflammation"],
  },

  // Mood & Mental Health
  {
    id: "NEURO006",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How often do you feel anxious or worried?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: [
      "anxiety",
      "stress_response",
      "neurotransmitter_balance",
    ],
  },
  {
    id: "NEURO007",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How often do you feel depressed or hopeless?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: [
      "depression",
      "neurotransmitter_balance",
      "inflammation",
    ],
  },

  // Sleep Quality
  {
    id: "NEURO008",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How would you rate your sleep quality?",
    type: "LIKERT_SCALE",
    scaleMin: "Very Poor",
    scaleMax: "Excellent",
    scoringWeight: 2.0,
    clinicalRelevance: ["sleep_quality", "recovery", "hormone_balance"],
  },
  {
    id: "NEURO009",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How long does it typically take you to fall asleep?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "immediate", label: "Less than 10 minutes", score: 0 },
      { value: "10-20min", label: "10-20 minutes", score: 0 },
      { value: "20-30min", label: "20-30 minutes", score: 1 },
      { value: "30-60min", label: "30-60 minutes", score: 2 },
      { value: "over60min", label: "Over 60 minutes", score: 3 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["sleep_onset", "anxiety", "circadian_rhythm"],
  },
  {
    id: "NEURO010",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How many times do you wake up during the night?",
    type: "MULTIPLE_CHOICE",
    options: [
      { value: "none", label: "None", score: 0 },
      { value: "once", label: "Once", score: 1 },
      { value: "2-3times", label: "2-3 times", score: 2 },
      { value: "4-5times", label: "4-5 times", score: 3 },
      { value: "more5", label: "More than 5 times", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["sleep_maintenance", "bladder_function", "stress"],
  },

  // Stress Response
  {
    id: "NEURO011",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "How well do you handle stressful situations?",
    type: "LIKERT_SCALE",
    scaleMin: "Very Poorly",
    scaleMax: "Very Well",
    scoringWeight: 1.5,
    clinicalRelevance: ["stress_resilience", "adrenal_function", "coping"],
  },
  {
    id: "NEURO012",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Do you feel overwhelmed by daily tasks?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["stress_tolerance", "burnout", "executive_function"],
  },

  // Neurological Symptoms
  {
    id: "NEURO013",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Do you experience dizziness or lightheadedness?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: [
      "orthostatic_hypotension",
      "vestibular",
      "blood_pressure",
    ],
  },
  {
    id: "NEURO014",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Do you experience numbness or tingling in your extremities?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["neuropathy", "B12_deficiency", "diabetes"],
  },
  {
    id: "NEURO015",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Have you experienced tremors or involuntary movements?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["movement_disorders", "neurological_dysfunction"],
  },

  // Post-COVID Neurological
  {
    id: "NEURO016",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Since COVID-19, have you noticed changes in taste or smell?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "Haven't had COVID", score: 0 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["post_covid", "neurological_damage", "olfactory"],
  },
  {
    id: "NEURO017",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Since COVID-19, has your brain fog or memory worsened?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "na", label: "Haven't had COVID", score: 0 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["post_covid", "cognitive_dysfunction", "long_covid"],
  },

  // COVID Vaccination Status - Ask First
  {
    id: "NEURO017_VAX_STATUS",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Have you received any COVID-19 vaccinations?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 0 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 0 },
    ],
    scoringWeight: 0.5,
    clinicalRelevance: ["vaccine_status", "exposure_history"],
    conditionalLogic: [
      {
        condition: "no",
        action: "skip",
        skipQuestions: ["NEURO018"],
      },
      {
        condition: "unsure",
        action: "skip",
        skipQuestions: ["NEURO018"],
      },
    ],
  },

  // Vaccine-Related Neurological
  {
    id: "NEURO018",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "After COVID vaccination, did you experience new neurological symptoms?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["vaccine_adverse_events", "neurological_inflammation"],
  },

  // Balance & Coordination
  {
    id: "NEURO019",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Do you have problems with balance or coordination?",
    type: "FREQUENCY",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: ["cerebellar_function", "vestibular", "neuropathy"],
  },

  // Vision Changes
  {
    id: "NEURO020",
    module: "SCREENING",
    bodySystem: BodySystems.NEUROLOGICAL,
    text: "Have you noticed changes in your vision (blurry, double, floaters)?",
    type: "YES_NO",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    scoringWeight: 1.5,
    clinicalRelevance: [
      "optic_nerve",
      "vascular_health",
      "neurological_function",
    ],
  },
];
