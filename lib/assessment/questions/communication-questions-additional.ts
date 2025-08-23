import { AssessmentQuestion, QuestionCategory, FunctionalModule } from "../types";

export const additionalCommunicationQuestions: AssessmentQuestion[] = [
  // Hormone Balance Questions (COM076-COM090)
  {
    "id": "COM076",
    "text": "Do you experience hot flashes or night sweats?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely (1-2x/month)", "value": 1 },
      { "label": "Sometimes (1-2x/week)", "value": 2 },
      { "label": "Often (3-5x/week)", "value": 3 },
      { "label": "Daily", "value": 4 }
    ],
    "category": "METABOLIC",
    "scoringWeight": 1.5,
    "labCorrelations": ["Estrogen", "Progesterone", "FSH", "LH"],
    "clinicalRelevance": ["hormonal_imbalance", "menopause"]
  },
  {
    "id": "COM077",
    "text": "Rate your libido/sex drive",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Absent", "value": 1 },
      { "label": "Normal/Healthy", "value": 5 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Testosterone", "DHEA", "Estrogen", "Thyroid"],
    "clinicalRelevance": ["hormonal_health", "adrenal_function"]
  },
  {
    "id": "COM078",
    "text": "Do you have irregular menstrual cycles? (if applicable)",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "conditionalField": "sex",
    "conditionalValue": "female",
    "scoringWeight": 1.4,
    "labCorrelations": ["FSH", "LH", "Estrogen", "Progesterone"],
    "clinicalRelevance": ["PCOS", "hormonal_dysfunction"]
  },
  {
    "id": "COM079",
    "text": "Do you experience breast tenderness or swelling?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Before periods only", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Constantly", "value": 4 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": ["Estrogen", "Progesterone", "Prolactin"],
    "clinicalRelevance": ["estrogen_dominance", "hormonal_imbalance"]
  },
  {
    "id": "COM080",
    "text": "Have you noticed changes in body hair distribution (increase or decrease)?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.3,
    "labCorrelations": ["Testosterone", "DHEA", "Thyroid"],
    "clinicalRelevance": ["androgen_imbalance", "thyroid_dysfunction"]
  },

  // Neurotransmitter Questions (COM081-COM100)
  {
    "id": "COM081",
    "text": "Do you feel unmotivated or lack drive?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 1 },
      { "label": "Always", "value": 5 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.4,
    "labCorrelations": ["Dopamine", "Norepinephrine", "Testosterone"],
    "clinicalRelevance": ["dopamine_deficiency", "depression"]
  },
  {
    "id": "COM082",
    "text": "Do you have difficulty experiencing pleasure or joy?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Always", "value": 4 }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": ["Dopamine", "Serotonin", "Endorphins"],
    "clinicalRelevance": ["anhedonia", "depression", "dopamine_dysfunction"]
  },
  {
    "id": "COM083",
    "text": "Do you experience racing thoughts or mental hyperactivity?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Constantly", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["GABA", "Glutamate", "Cortisol"],
    "clinicalRelevance": ["anxiety", "GABA_deficiency", "stress_response"]
  },
  {
    "id": "COM084",
    "text": "Do you have obsessive thoughts or compulsive behaviors?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Daily", "value": 4 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["Serotonin", "Dopamine", "Glutamate"],
    "clinicalRelevance": ["OCD", "serotonin_dysfunction", "anxiety"]
  },
  {
    "id": "COM085",
    "text": "Do you have difficulty with impulse control?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 1 },
      { "label": "Always", "value": 5 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Dopamine", "Serotonin", "GABA"],
    "clinicalRelevance": ["ADHD", "impulse_control", "dopamine_dysfunction"]
  },

  // Sleep & Circadian Rhythm (COM086-COM095)
  {
    "id": "COM086",
    "text": "What time do you naturally feel tired in the evening?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Before 9 PM", "value": "early", "score": 0 },
      { "label": "9-10 PM", "value": "normal_early", "score": 1 },
      { "label": "10-11 PM", "value": "normal", "score": 2 },
      { "label": "11 PM-12 AM", "value": "normal_late", "score": 3 },
      { "label": "After midnight", "value": "late", "score": 4 }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": ["Melatonin", "Cortisol"],
    "clinicalRelevance": ["circadian_rhythm", "sleep_disorder"]
  },
  {
    "id": "COM087",
    "text": "Do you feel refreshed upon waking?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Always", "value": 0 },
      { "label": "Usually", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Rarely", "value": 3 },
      { "label": "Never", "value": 4 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["Cortisol", "Growth Hormone", "Testosterone"],
    "clinicalRelevance": ["sleep_quality", "recovery", "hormonal_restoration"]
  },
  {
    "id": "COM088",
    "text": "Do you wake up during the night?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "1-2 times/week", "value": 1 },
      { "label": "3-4 times/week", "value": 2 },
      { "label": "Most nights", "value": 3 },
      { "label": "Multiple times nightly", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Cortisol", "Blood Sugar", "Melatonin"],
    "clinicalRelevance": ["sleep_maintenance", "cortisol_dysregulation"]
  },
  {
    "id": "COM089",
    "text": "If you wake at night, what time is it usually?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Don't wake", "value": "none", "score": 0 },
      { "label": "1-2 AM", "value": "liver_time", "score": 3 },
      { "label": "3-4 AM", "value": "cortisol_time", "score": 3 },
      { "label": "5-6 AM", "value": "early_morning", "score": 2 },
      { "label": "Variable", "value": "variable", "score": 2 }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": ["Cortisol", "Blood Sugar", "Liver Enzymes"],
    "clinicalRelevance": ["liver_congestion", "blood_sugar_dysregulation"]
  },
  {
    "id": "COM090",
    "text": "Do you need an alarm to wake up?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.1,
    "labCorrelations": ["Cortisol", "Melatonin"],
    "clinicalRelevance": ["circadian_rhythm", "sleep_debt"]
  },

  // Stress Response (COM091-COM105)
  {
    "id": "COM091",
    "text": "How do you typically respond to acute stress?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Stay calm and focused", "value": "resilient", "score": 0 },
      { "label": "Get anxious but manage", "value": "anxious", "score": 2 },
      { "label": "Become angry/irritable", "value": "angry", "score": 3 },
      { "label": "Shut down/withdraw", "value": "freeze", "score": 3 },
      { "label": "Panic/overwhelming anxiety", "value": "panic", "score": 4 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.4,
    "labCorrelations": ["Cortisol", "DHEA", "Epinephrine"],
    "clinicalRelevance": ["stress_resilience", "HPA_axis"]
  },
  {
    "id": "COM092",
    "text": "How long does it take you to recover from stressful events?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Minutes", "value": "minutes", "score": 0 },
      { "label": "Hours", "value": "hours", "score": 1 },
      { "label": "Days", "value": "days", "score": 2 },
      { "label": "Weeks", "value": "weeks", "score": 3 },
      { "label": "Months or more", "value": "months", "score": 4 }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": ["Cortisol", "DHEA", "Inflammatory markers"],
    "clinicalRelevance": ["stress_recovery", "resilience", "PTSD"]
  },
  {
    "id": "COM093",
    "text": "Do you startle easily?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Very easily", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Cortisol", "Magnesium", "GABA"],
    "clinicalRelevance": ["hypervigilance", "anxiety", "trauma_response"]
  },
  {
    "id": "COM094",
    "text": "Do you feel 'wired but tired'?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Always", "value": 4 }
    ],
    "scoringWeight": 1.5,
    "labCorrelations": ["Cortisol", "DHEA", "Thyroid"],
    "clinicalRelevance": ["adrenal_dysfunction", "HPA_dysregulation"]
  },
  {
    "id": "COM095",
    "text": "Do you experience panic attacks?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely (< 1/month)", "value": 1 },
      { "label": "Monthly", "value": 2 },
      { "label": "Weekly", "value": 3 },
      { "label": "Daily", "value": 4 }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": ["GABA", "Cortisol", "Thyroid", "Blood Sugar"],
    "clinicalRelevance": ["panic_disorder", "anxiety", "autonomic_dysfunction"]
  },

  // Cognitive Function (COM096-COM110)
  {
    "id": "COM096",
    "text": "How would you rate your ability to learn new information?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Very poor", "value": 1 },
      { "label": "Excellent", "value": 5 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["B12", "Thyroid", "Testosterone", "DHEA"],
    "clinicalRelevance": ["cognitive_function", "neuroplasticity"]
  },
  {
    "id": "COM097",
    "text": "Do you lose your train of thought mid-sentence?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Constantly", "value": 4 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["B12", "Thyroid", "Cortisol", "Blood Sugar"],
    "clinicalRelevance": ["brain_fog", "cognitive_dysfunction"]
  },
  {
    "id": "COM098",
    "text": "Do you have difficulty finding the right words?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Always", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["B12", "Thyroid", "Estrogen"],
    "clinicalRelevance": ["word_retrieval", "cognitive_decline"]
  },
  {
    "id": "COM099",
    "text": "Have you noticed a decline in your cognitive abilities?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.5,
    "labCorrelations": ["Comprehensive metabolic panel", "Inflammatory markers", "Hormones"],
    "clinicalRelevance": ["cognitive_decline", "neurodegeneration"]
  },
  {
    "id": "COM100",
    "text": "Do you have difficulty with mental math or calculations?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "No difficulty", "value": 1 },
      { "label": "Severe difficulty", "value": 5 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": ["B12", "Thyroid", "Blood Sugar"],
    "clinicalRelevance": ["executive_function", "cognitive_processing"]
  },

  // Autonomic Nervous System (COM101-COM110)
  {
    "id": "COM101",
    "text": "Do you experience heart palpitations?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Daily", "value": 4 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["Thyroid", "Magnesium", "Cortisol", "Electrolytes"],
    "clinicalRelevance": ["autonomic_dysfunction", "anxiety", "thyroid"]
  },
  {
    "id": "COM102",
    "text": "Do you feel dizzy when standing up quickly?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Always", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Cortisol", "Aldosterone", "Electrolytes"],
    "clinicalRelevance": ["orthostatic_hypotension", "adrenal_insufficiency"]
  },
  {
    "id": "COM103",
    "text": "Do your pupils react slowly to light changes?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.2,
    "labCorrelations": ["Cortisol", "Thyroid"],
    "clinicalRelevance": ["autonomic_dysfunction", "adrenal_fatigue"]
  },
  {
    "id": "COM104",
    "text": "Do you have excessive sweating or lack of sweating?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Normal sweating", "value": "normal", "score": 0 },
      { "label": "Excessive sweating", "value": "excessive", "score": 2 },
      { "label": "Lack of sweating", "value": "lack", "score": 2 },
      { "label": "Night sweats only", "value": "night", "score": 3 },
      { "label": "Cold sweats", "value": "cold", "score": 3 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": ["Thyroid", "Hormones", "Blood Sugar"],
    "clinicalRelevance": ["autonomic_dysfunction", "hormonal_imbalance"]
  },
  {
    "id": "COM105",
    "text": "Do you have temperature regulation issues?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "No issues", "value": "none", "score": 0 },
      { "label": "Always cold", "value": "cold", "score": 2 },
      { "label": "Always hot", "value": "hot", "score": 2 },
      { "label": "Fluctuates dramatically", "value": "fluctuates", "score": 3 },
      { "label": "Can't tolerate heat or cold", "value": "intolerant", "score": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Thyroid", "Cortisol", "Sex hormones"],
    "clinicalRelevance": ["thyroid_dysfunction", "autonomic_dysfunction"]
  },

  // Neurological Symptoms (COM106-COM121)
  {
    "id": "COM106",
    "text": "Do you experience numbness or tingling in your extremities?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Constantly", "value": 4 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["B12", "Blood Sugar", "B6", "Thyroid"],
    "clinicalRelevance": ["neuropathy", "B12_deficiency", "diabetes"]
  },
  {
    "id": "COM107",
    "text": "Do you have muscle twitches or spasms?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Daily", "value": 4 }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": ["Magnesium", "Calcium", "Potassium", "B12"],
    "clinicalRelevance": ["mineral_deficiency", "neurological_dysfunction"]
  },
  {
    "id": "COM108",
    "text": "Do you experience tremors or shaking?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Only when stressed", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Constantly", "value": 4 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["Thyroid", "Blood Sugar", "Magnesium", "Cortisol"],
    "clinicalRelevance": ["hyperthyroid", "hypoglycemia", "anxiety"]
  },
  {
    "id": "COM109",
    "text": "Have you noticed changes in your handwriting?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.3,
    "labCorrelations": ["Comprehensive neurological panel"],
    "clinicalRelevance": ["neurological_changes", "motor_control"]
  },
  {
    "id": "COM110",
    "text": "Do you have difficulty with balance or coordination?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "No difficulty", "value": 1 },
      { "label": "Severe difficulty", "value": 5 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.4,
    "labCorrelations": ["B12", "Thyroid", "Magnesium"],
    "clinicalRelevance": ["cerebellar_function", "proprioception"]
  },

  // Mood & Emotional Regulation (COM111-COM121)
  {
    "id": "COM111",
    "text": "How stable is your mood throughout the day?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Very unstable", "value": 1 },
      { "label": "Very stable", "value": 5 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["Blood Sugar", "Cortisol", "Thyroid", "Sex hormones"],
    "clinicalRelevance": ["mood_stability", "hormonal_balance"]
  },
  {
    "id": "COM112",
    "text": "Do you experience mood swings related to meals?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Always", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Blood Sugar", "Insulin", "Cortisol"],
    "clinicalRelevance": ["blood_sugar_dysregulation", "reactive_hypoglycemia"]
  },
  {
    "id": "COM113",
    "text": "Do you cry easily or feel emotionally fragile?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Daily", "value": 4 }
    ],
    "scoringWeight": 1.2,
    "labCorrelations": ["Serotonin", "Estrogen", "Progesterone", "Thyroid"],
    "clinicalRelevance": ["emotional_regulation", "hormonal_imbalance"]
  },
  {
    "id": "COM114",
    "text": "Do you experience inappropriate laughter or emotional responses?",
    "type": "FREQUENCY",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 0 },
      { "label": "Rarely", "value": 1 },
      { "label": "Sometimes", "value": 2 },
      { "label": "Often", "value": 3 },
      { "label": "Frequently", "value": 4 }
    ],
    "scoringWeight": 1.3,
    "labCorrelations": ["Comprehensive neurological assessment"],
    "clinicalRelevance": ["pseudobulbar_affect", "neurological_dysfunction"]
  },
  {
    "id": "COM115",
    "text": "Do you feel emotionally numb or disconnected?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Never", "value": 1 },
      { "label": "Always", "value": 5 }
    ],
    "scoringWeight": 1.4,
    "labCorrelations": ["Dopamine", "Serotonin", "Thyroid", "Testosterone"],
    "clinicalRelevance": ["depression", "dissociation", "trauma_response"]
  },

  // Additional Hormonal Questions (COM116-COM121)
  {
    "id": "COM116",
    "text": "Have you noticed changes in your voice (deeper or higher)?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.2,
    "labCorrelations": ["Thyroid", "Testosterone", "Growth Hormone"],
    "clinicalRelevance": ["hormonal_changes", "thyroid_dysfunction"]
  },
  {
    "id": "COM117",
    "text": "Do you have facial hair growth (women) or loss of facial hair (men)?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.3,
    "labCorrelations": ["Testosterone", "DHEA", "Estrogen"],
    "clinicalRelevance": ["androgen_imbalance", "PCOS"]
  },
  {
    "id": "COM118",
    "text": "Rate your overall stress level",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "No stress", "value": 1 },
      { "label": "Overwhelming stress", "value": 5 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.5,
    "labCorrelations": ["Cortisol", "DHEA", "Inflammatory markers"],
    "clinicalRelevance": ["chronic_stress", "HPA_axis_dysfunction"]
  },
  {
    "id": "COM119",
    "text": "Do you have difficulty handling stress compared to the past?",
    "type": "YES_NO",
    "module": "COMMUNICATION",
    "scoringWeight": 1.4,
    "labCorrelations": ["Cortisol", "DHEA", "Thyroid"],
    "clinicalRelevance": ["stress_resilience", "adrenal_fatigue"]
  },
  {
    "id": "COM120",
    "text": "Do you experience seasonal mood changes?",
    "type": "MULTIPLE_CHOICE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "No changes", "value": "none", "score": 0 },
      { "label": "Mild winter blues", "value": "mild_winter", "score": 1 },
      { "label": "Significant winter depression", "value": "SAD", "score": 3 },
      { "label": "Summer depression", "value": "summer", "score": 2 },
      { "label": "Both seasons affect me", "value": "both", "score": 4 }
    ,
      {
        "label": "Unsure",
        "score": 1,
        "value": "unsure"
      }],
    "scoringWeight": 1.2,
    "labCorrelations": ["Vitamin D", "Thyroid", "Serotonin"],
    "clinicalRelevance": ["seasonal_affective_disorder", "vitamin_D_deficiency"]
  },
  {
    "id": "COM121",
    "text": "How would you rate your overall neurological and hormonal health?",
    "type": "LIKERT_SCALE",
    "module": "COMMUNICATION",
    "options": [
      { "label": "Very poor", "value": 1 },
      { "label": "Excellent", "value": 5 }
    ],
    "scoringWeight": 1.6,
    "labCorrelations": ["Comprehensive hormone panel", "Neurotransmitter assessment"],
    "clinicalRelevance": ["overall_communication_health", "quality_of_life"]
  }
];
