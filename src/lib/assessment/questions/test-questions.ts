import { AssessmentQuestion, FunctionalModule, QuestionType } from '../types';

// Test questions with various types for development
export const testQuestions: AssessmentQuestion[] = [
  // LIKERT_SCALE example
  {
    id: "TEST_LIKERT_01",
    text: "How would you rate your energy level throughout the day?",
    type: QuestionType.LIKERT_SCALE,
    module: FunctionalModule.SCREENING,
    scoringWeight: 1.5,
    clinicalRelevance: ["energy", "fatigue"],
    scaleMin: "No energy",
    scaleMax: "Abundant energy"
  },

  // YES_NO example
  {
    id: "TEST_YN_01",
    text: "Do you experience brain fog or difficulty concentrating?",
    type: QuestionType.YES_NO,
    module: FunctionalModule.SCREENING,
    scoringWeight: 1.2,
    clinicalRelevance: ["cognitive_function"]
  },

  // MULTIPLE_CHOICE example
  {
    id: "TEST_MC_01",
    text: "Which cooking oil do you use most frequently at home?",
    type: QuestionType.MULTIPLE_CHOICE,
    module: FunctionalModule.SCREENING,
    options: [
      { value: "olive", label: "Olive oil", score: 0 },
      { value: "coconut", label: "Coconut oil", score: 0 },
      { value: "avocado", label: "Avocado oil", score: 0 },
      { value: "canola", label: "Canola oil", score: 5, seedOilRisk: 'high' },
      { value: "vegetable", label: "Vegetable oil", score: 8, seedOilRisk: 'high' },
      { value: "sunflower", label: "Sunflower oil", score: 7, seedOilRisk: 'high' },
      { value: "butter", label: "Butter/Ghee", score: 0 },
      { value: "other", label: "Other", score: 3 }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["seed_oil_exposure"],
    seedOilRelevant: true
  },

  // FREQUENCY example
  {
    id: "TEST_FREQ_01",
    text: "How often do you experience digestive discomfort after meals?",
    type: QuestionType.FREQUENCY,
    module: FunctionalModule.SCREENING,
    frequencyOptions: [
      { value: "never", label: "Never", description: "No digestive issues" },
      { value: "rarely", label: "Rarely", description: "1-2 times per month" },
      { value: "sometimes", label: "Sometimes", description: "1-2 times per week" },
      { value: "often", label: "Often", description: "3-5 times per week" },
      { value: "always", label: "Always", description: "After every meal" }
    ],
    scoringWeight: 1.8,
    clinicalRelevance: ["digestive_health"]
  },

  // DURATION example
  {
    id: "TEST_DUR_01",
    text: "How long have you been experiencing your current symptoms?",
    type: QuestionType.DURATION,
    module: FunctionalModule.SCREENING,
    durationOptions: [
      { value: "less_week", label: "Less than 1 week" },
      { value: "1_4_weeks", label: "1-4 weeks" },
      { value: "1_3_months", label: "1-3 months" },
      { value: "3_6_months", label: "3-6 months" },
      { value: "6_12_months", label: "6-12 months" },
      { value: "over_year", label: "Over 1 year" },
      { value: "over_5_years", label: "Over 5 years" }
    ],
    scoringWeight: 1.0,
    clinicalRelevance: ["symptom_duration"]
  },

  // MULTI_SELECT example
  {
    id: "TEST_MS_01",
    text: "Which of the following symptoms do you currently experience? (Select all that apply)",
    type: QuestionType.MULTI_SELECT,
    module: FunctionalModule.SCREENING,
    options: [
      { value: "fatigue", label: "Chronic fatigue", description: "Persistent tiredness" },
      { value: "headaches", label: "Frequent headaches" },
      { value: "joint_pain", label: "Joint pain or stiffness" },
      { value: "digestive", label: "Digestive issues", description: "Bloating, gas, constipation" },
      { value: "skin", label: "Skin problems", description: "Rashes, acne, eczema" },
      { value: "mood", label: "Mood changes", description: "Anxiety, depression, irritability" },
      { value: "sleep", label: "Sleep disturbances" },
      { value: "weight", label: "Unexplained weight changes" },
      { value: "allergies", label: "New food sensitivities or allergies" },
      { value: "brain_fog", label: "Brain fog or poor concentration" }
    ],
    scoringWeight: 2.0,
    clinicalRelevance: ["symptom_clustering"]
  },

  // TEXT example
  {
    id: "TEST_TEXT_01",
    text: "Please describe any additional symptoms or health concerns not covered in the questions above:",
    type: QuestionType.TEXT,
    module: FunctionalModule.SCREENING,
    textOptions: {
      minLength: 0,
      maxLength: 500,
      rows: 4,
      placeholder: "Enter any additional symptoms, concerns, or relevant health information..."
    },
    scoringWeight: 0.5,
    clinicalRelevance: ["additional_context"],
    required: false
  },

  // NUMBER example
  {
    id: "TEST_NUM_01",
    text: "How many hours of sleep do you typically get per night?",
    type: QuestionType.NUMBER,
    module: FunctionalModule.SCREENING,
    numberOptions: {
      min: 0,
      max: 24,
      step: 0.5
    },
    placeholder: "Enter hours (e.g., 7.5)",
    scoringWeight: 1.3,
    clinicalRelevance: ["sleep_quality"]
  },

  // Another LIKERT_SCALE with different scale
  {
    id: "TEST_LIKERT_02",
    text: "Rate your stress level over the past month:",
    type: QuestionType.LIKERT_SCALE,
    module: FunctionalModule.SCREENING,
    scoringWeight: 1.7,
    clinicalRelevance: ["stress", "cortisol"],
    scaleMin: "No stress",
    scaleMax: "Overwhelming stress"
  },

  // Another YES_NO
  {
    id: "TEST_YN_02",
    text: "Have you been diagnosed with any autoimmune conditions?",
    type: QuestionType.YES_NO,
    module: FunctionalModule.SCREENING,
    scoringWeight: 2.0,
    clinicalRelevance: ["autoimmune"]
  }
];

// Export function to inject test questions at the beginning of any module
export function injectTestQuestions(questions: AssessmentQuestion[]): AssessmentQuestion[] {
  return [...testQuestions, ...questions];
}
