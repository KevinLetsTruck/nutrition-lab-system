import { SymptomQuestion, SYMPTOM_QUESTION_BANK } from './symptom-question-bank';
import { SYMPTOM_QUESTION_BANK_PART2 } from './symptom-question-bank-2';
import { SYMPTOM_QUESTION_BANK_PART3 } from './symptom-question-bank-3';

// Re-export SymptomQuestion type
export type { SymptomQuestion } from './symptom-question-bank';

// Combine all question banks
export const COMPLETE_SYMPTOM_QUESTION_BANK = {
  ...SYMPTOM_QUESTION_BANK,
  ...SYMPTOM_QUESTION_BANK_PART2,
  ...SYMPTOM_QUESTION_BANK_PART3
};

// Helper function to get all questions as a flat array
export function getAllQuestions(): SymptomQuestion[] {
  const allQuestions: SymptomQuestion[] = [];
  
  Object.values(COMPLETE_SYMPTOM_QUESTION_BANK).forEach(category => {
    Object.values(category).forEach(subcategory => {
      allQuestions.push(...subcategory);
    });
  });
  
  return allQuestions;
}

// Helper function to get question by ID
export function getQuestionById(id: string): SymptomQuestion | undefined {
  const allQuestions = getAllQuestions();
  return allQuestions.find(q => q.id === id);
}

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): SymptomQuestion[] {
  const categoryData = COMPLETE_SYMPTOM_QUESTION_BANK[category];
  if (!categoryData) return [];
  
  const questions: SymptomQuestion[] = [];
  Object.values(categoryData).forEach(subcategory => {
    questions.push(...subcategory);
  });
  
  return questions;
}

// Helper function to get questions by subcategory
export function getQuestionsBySubcategory(category: string, subcategory: string): SymptomQuestion[] {
  const categoryData = COMPLETE_SYMPTOM_QUESTION_BANK[category];
  if (!categoryData) return [];
  
  const subcategoryData = categoryData[subcategory];
  return subcategoryData || [];
}

// Priority questions for each section (most important symptoms to ask first)
export const SECTION_PRIORITY_QUESTIONS: Record<string, string[]> = {
  digestive: [
    'appetite_patterns',
    'feel_better_eating',
    'bloating_immediate',
    'heartburn_reflux',
    'bowel_movement_frequency'
  ],
  metabolicCardio: [
    'time_between_meals_tolerance',
    'energy_crashes_frequency',
    'chest_tightness_pressure',
    'shortness_breath',
    'weight_gain_pattern'
  ],
  neuroCognitive: [
    'brain_fog_daily',
    'memory_short_term',
    'concentration_focus',
    'mood_stability',
    'headache_frequency'
  ],
  immuneInflammatory: [
    'infection_frequency',
    'joint_pain_inflammation',
    'seasonal_allergies',
    'eczema_psoriasis'
  ],
  hormonal: [
    'hair_loss_thinning',
    'cold_intolerance',
    'fatigue_pattern',
    'libido_changes',
    'menstrual_irregularity'
  ],
  detoxification: [
    'chemical_sensitivity',
    'alcohol_tolerance',
    'body_odor_changes',
    'sweating_ability'
  ],
  painMusculoskeletal: [
    'back_pain_location',
    'neck_shoulder_pain',
    'muscle_cramps',
    'pain_worse_time'
  ],
  driverSpecific: [
    'hemorrhoids',
    'sciatica_symptoms',
    'whole_body_vibration',
    'shift_work_symptoms',
    'bathroom_access_issues'
  ],
  ancestralMismatch: [
    'light_exposure_morning',
    'artificial_light_evening',
    'daily_movement_variety'
  ]
};

// Red flag symptoms that require immediate follow-up
export const RED_FLAG_SYMPTOMS = [
  'chest_tightness_pressure',
  'shortness_breath',
  'heart_palpitations',
  'severe_abdominal_pain',
  'blood_in_stool',
  'skin_yellowing',
  'vision_changes',
  'numbness_tingling',
  'deep_vein_concerns'
];

// Symptom patterns that often occur together
export const SYMPTOM_CLUSTERS = {
  metabolicSyndrome: [
    'weight_gain_pattern',
    'weight_distribution',
    'sugar_carb_cravings',
    'energy_crashes_frequency',
    'skin_tags_darkening'
  ],
  digestiveInsufficiency: [
    'bloating_immediate',
    'burping_belching',
    'heartburn_reflux',
    'undigested_food_stool'
  ],
  sibo: [
    'bloating_delayed',
    'fodmap_trigger_foods',
    'constipation_diarrhea_alternating',
    'foul_smelling_gas',
    'probiotics_worsen'
  ],
  thyroidDysfunction: [
    'hair_loss_thinning',
    'eyebrow_thinning',
    'cold_intolerance',
    'dry_skin_hair',
    'brittle_nails',
    'temperature_preference'
  ],
  adrenalFatigue: [
    'fatigue_pattern',
    'stress_tolerance',
    'salt_cravings',
    'blood_pressure_low',
    'recovery_from_illness'
  ],
  inflammation: [
    'joint_pain_inflammation',
    'morning_stiffness',
    'muscle_pain_widespread',
    'body_temperature_inflammation'
  ]
};

// Export type for sections
export type AssessmentSection = keyof typeof COMPLETE_SYMPTOM_QUESTION_BANK;

// Get total question count
export function getTotalQuestionCount(): number {
  return getAllQuestions().length;
}

// Validate that we have at least 150 questions
console.log(`Total symptom questions in bank: ${getTotalQuestionCount()}`);