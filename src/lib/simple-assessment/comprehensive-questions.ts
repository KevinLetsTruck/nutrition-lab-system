/**
 * Comprehensive Functional Medicine Assessment System
 * 
 * Expands from 80 to 270+ questions across 8 body systems with modern FM categories.
 * Built for flexibility, easy modification, and optimization based on clinical results.
 */

import { SCALES, ScaleType } from './questions';

// Enhanced question interface for comprehensive assessment
export interface ComprehensiveQuestion {
  id: number;
  systemCategory: string;           // 'digestive', 'energy', 'hormonal', etc.
  subCategory: string;              // 'sibo', 'enzyme_function', 'bile_flow', etc.
  questionText: string;
  helpText?: string;                // Explanatory text for complex questions
  scaleType: ScaleType;
  
  // Flexible scoring configuration
  diagnosticWeight: number;         // 1.0-3.0 based on diagnostic value
  reverseScore: boolean;            // Some symptoms are better when lower
  
  // Question grouping for pattern recognition
  questionCluster: string;          // Groups related questions for analysis
  rootCauseIndicator: boolean;      // Primary vs secondary symptom questions
  
  // Clinical significance
  clinicalNotes: string;            // Why this question matters clinically
  modernFMUpdate: boolean;          // New questions not in traditional assessments
  
  // System for easy modification
  version: number;                  // Track question changes
  isActive: boolean;                // Enable/disable questions for testing
  testingNotes?: string;            // Notes about question performance
}

// Comprehensive system categories with diagnostic priorities
export const SYSTEM_CATEGORIES = {
  digestive: {
    name: 'Digestive Function',
    subCategories: {
      sibo_dysbiosis: 'SIBO & Dysbiosis',
      intestinal_permeability: 'Intestinal Permeability (Leaky Gut)',
      enzyme_function: 'Digestive Enzyme Function', 
      bile_flow: 'Bile Flow & Liver Detox',
      food_sensitivities: 'Food Sensitivity Patterns',
      stomach_acid: 'Stomach Acid Production',
    },
    questionCount: 50,
    diagnosticPriority: 1, // Highest priority - gut affects everything
    description: 'Foundational system affecting nutrient absorption, immunity, and systemic inflammation',
  },
  energy: {
    name: 'Energy & Adrenal Function', 
    subCategories: {
      hpa_axis: 'HPA Axis Dysfunction',
      mitochondrial: 'Mitochondrial Function',
      blood_sugar: 'Blood Sugar Regulation',
      circadian: 'Circadian Rhythm Function',
      stress_response: 'Stress Response Patterns',
    },
    questionCount: 42,
    diagnosticPriority: 2, // Energy affects quality of life
    description: 'Energy production and stress response systems affecting daily function',
  },
  hormonal: {
    name: 'Hormonal Balance',
    subCategories: {
      thyroid: 'Thyroid Function & Conversion',
      sex_hormones: 'Sex Hormone Balance',
      insulin: 'Insulin Sensitivity',
      cortisol: 'Cortisol Rhythm Dysfunction',
    },
    questionCount: 38,
    diagnosticPriority: 1, // Hormones regulate multiple systems
    description: 'Hormonal systems regulating metabolism, reproduction, and stress response',
  },
  toxic_load: {
    name: 'Toxic Load & Detoxification',
    subCategories: {
      chemical_exposure: 'Chemical Exposure History',
      detox_capacity: 'Phase I/II Detox Capacity',
      environmental_sensitivity: 'Environmental Sensitivities',
      heavy_metals: 'Heavy Metal Indicators',
    },
    questionCount: 32,
    diagnosticPriority: 3, // Important but often secondary
    modernFMCategory: true,
    description: 'Body\'s ability to process and eliminate environmental toxins',
  },
  inflammatory: {
    name: 'Inflammatory & Immune Function',
    subCategories: {
      chronic_inflammation: 'Chronic Inflammation',
      autoimmune: 'Autoimmune Indicators',
      infection_susceptibility: 'Infection Patterns',
      allergic_response: 'Allergic Response Patterns',
    },
    questionCount: 28,
    diagnosticPriority: 2, // Inflammation affects multiple systems
    description: 'Immune system function and inflammatory response patterns',
  },
  neurological: {
    name: 'Neurological & Mental Health',
    subCategories: {
      neurotransmitter: 'Neurotransmitter Balance',
      cognitive: 'Cognitive Function',
      mood_regulation: 'Mood Regulation',
      brain_fog: 'Brain Fog & Mental Clarity',
    },
    questionCount: 28,
    diagnosticPriority: 2, // Affects quality of life significantly
    description: 'Brain function, mood regulation, and cognitive performance',
  },
  cardiovascular: {
    name: 'Cardiovascular Function',
    subCategories: {
      heart_function: 'Heart Function & Rhythm',
      circulation: 'Circulation & Blood Pressure',
      lipid_metabolism: 'Lipid Metabolism',
    },
    questionCount: 20,
    diagnosticPriority: 3, // Important but often secondary to other systems
    description: 'Heart health, circulation, and cardiovascular risk factors',
  },
  modern_fm: {
    name: 'Modern Functional Medicine',
    subCategories: {
      emf_sensitivity: 'EMF Sensitivity',
      seed_oil_damage: 'Inflammatory Food Reactions',
      mold_biotoxin: 'Mold & Biotoxin Illness',
      advanced_gut_brain: 'Advanced Gut-Brain Axis',
      circadian_disruption: 'Light & Circadian Disruption',
    },
    questionCount: 30,
    diagnosticPriority: 2,
    modernFMCategory: true,
    description: 'Modern environmental and lifestyle factors affecting health',
  },
};

// Comprehensive question bank - Full functional medicine assessment
export const COMPREHENSIVE_QUESTIONS: ComprehensiveQuestion[] = [
  
  // ========================================
  // DIGESTIVE SYSTEM - SIBO & DYSBIOSIS (15 questions)
  // ========================================
  {
    id: 1,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How often do you experience bloating within 1-3 hours after eating?',
    helpText: 'Bloating after meals can indicate bacterial overgrowth or digestive dysfunction',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    reverseScore: true,
    questionCluster: 'post_meal_symptoms',
    rootCauseIndicator: true,
    clinicalNotes: 'Post-meal bloating is primary SIBO indicator, especially 1-3 hours post-meal',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 2,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How severe is your abdominal distension after eating carbohydrates or fiber?',
    helpText: 'Reaction to specific macronutrients can indicate bacterial fermentation patterns',
    scaleType: 'severity',
    diagnosticWeight: 3.0,
    reverseScore: true,
    questionCluster: 'carbohydrate_intolerance',
    rootCauseIndicator: true,
    clinicalNotes: 'Carb/fiber reaction strongly suggests SIBO - highest diagnostic value',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 3,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How often do you experience excessive gas or flatulence?',
    scaleType: 'frequency',
    diagnosticWeight: 2.0,
    reverseScore: true,
    questionCluster: 'bacterial_fermentation',
    rootCauseIndicator: false,
    clinicalNotes: 'Secondary SIBO symptom - confirms bacterial overgrowth patterns',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 4,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How often do you have alternating constipation and diarrhea?',
    helpText: 'Irregular bowel patterns can indicate dysbiotic bacterial populations',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    reverseScore: true,
    questionCluster: 'bowel_irregularity',
    rootCauseIndicator: true,
    clinicalNotes: 'Classic dysbiosis pattern - indicates bacterial imbalance',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 5,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How much do symptoms improve when you skip meals or fast?',
    helpText: 'Symptom relief during fasting suggests bacterial overgrowth that feeds on food',
    scaleType: 'level',
    diagnosticWeight: 2.8,
    reverseScore: false,
    questionCluster: 'fasting_response',
    rootCauseIndicator: true,
    clinicalNotes: 'Fasting improvement is pathognomonic for SIBO - very high diagnostic value',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 6,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How often do you experience brain fog or mental fatigue after eating?',
    helpText: 'Brain fog after meals can indicate gut-brain axis dysfunction from bacterial overgrowth',
    scaleType: 'frequency',
    diagnosticWeight: 2.1,
    reverseScore: true,
    questionCluster: 'gut_brain_symptoms',
    rootCauseIndicator: true,
    clinicalNotes: 'Gut-brain connection - bacterial toxins affecting cognitive function',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 7,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How often do you have food intolerances or reactions to foods you used to tolerate?',
    scaleType: 'frequency',
    diagnosticWeight: 2.0,
    reverseScore: true,
    questionCluster: 'food_sensitivity_development',
    rootCauseIndicator: true,
    clinicalNotes: 'Developing food intolerances indicates dysbiosis and possible intestinal permeability',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 8,
    systemCategory: 'digestive',
    subCategory: 'sibo_dysbiosis',
    questionText: 'How severe is your sugar or carbohydrate craving?',
    scaleType: 'severity',
    diagnosticWeight: 1.8,
    reverseScore: true,
    questionCluster: 'dysbiotic_cravings',
    rootCauseIndicator: false,
    clinicalNotes: 'Sugar cravings can indicate dysbiotic bacteria influencing food choices',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },

  // ========================================
  // DIGESTIVE SYSTEM - INTESTINAL PERMEABILITY (12 questions)
  // ========================================
  {
    id: 15,
    systemCategory: 'digestive',
    subCategory: 'intestinal_permeability',
    questionText: 'How often do you experience joint pain or stiffness that moves around your body?',
    helpText: 'Migrating joint pain can indicate inflammatory reactions from intestinal permeability',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    reverseScore: true,
    questionCluster: 'systemic_inflammation',
    rootCauseIndicator: true,
    clinicalNotes: 'Leaky gut allows inflammatory proteins to trigger systemic reactions',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 16,
    systemCategory: 'digestive',
    subCategory: 'intestinal_permeability',
    questionText: 'How often do you develop new allergies or sensitivities to environmental triggers?',
    scaleType: 'frequency',
    diagnosticWeight: 2.3,
    reverseScore: true,
    questionCluster: 'immune_reactivity',
    rootCauseIndicator: true,
    clinicalNotes: 'Developing new allergies suggests immune system overstimulation from gut dysfunction',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },

  // ========================================
  // ENERGY & ADRENAL SYSTEM - HPA AXIS DYSFUNCTION (15 questions)
  // ========================================
  {
    id: 50,
    systemCategory: 'energy',
    subCategory: 'hpa_axis',
    questionText: 'How difficult is it for you to get out of bed in the morning?',
    helpText: 'Morning energy levels reflect cortisol awakening response',
    scaleType: 'ease',
    diagnosticWeight: 2.3,
    reverseScore: true,
    questionCluster: 'morning_cortisol',
    rootCauseIndicator: true,
    clinicalNotes: 'Morning fatigue indicates blunted cortisol awakening response',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 51,
    systemCategory: 'energy',
    subCategory: 'hpa_axis',
    questionText: 'How often do you experience an afternoon energy crash (2-4 PM)?',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    reverseScore: true,
    questionCluster: 'cortisol_rhythm',
    rootCauseIndicator: true,
    clinicalNotes: 'Afternoon crashes indicate dysregulated cortisol rhythm - classic adrenal dysfunction',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 52,
    systemCategory: 'energy',
    subCategory: 'hpa_axis',
    questionText: 'How much does stress affect your physical symptoms?',
    scaleType: 'level',
    diagnosticWeight: 2.1,
    reverseScore: true,
    questionCluster: 'stress_symptom_correlation',
    rootCauseIndicator: true,
    clinicalNotes: 'High stress-symptom correlation indicates HPA axis involvement in health issues',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },

  // ========================================
  // MODERN FUNCTIONAL MEDICINE - EMF SENSITIVITY (8 questions)
  // ========================================
  {
    id: 240,
    systemCategory: 'modern_fm',
    subCategory: 'emf_sensitivity',
    questionText: 'How much does your sleep quality worsen when sleeping near electronic devices?',
    helpText: 'EMF exposure can disrupt sleep patterns and cellular function',
    scaleType: 'level',
    diagnosticWeight: 1.8,
    reverseScore: true,
    questionCluster: 'emf_sleep_disruption',
    rootCauseIndicator: true,
    clinicalNotes: 'Modern concern - EMF disrupts mitochondrial function and sleep quality',
    modernFMUpdate: true,
    version: 1,
    isActive: true,
    testingNotes: 'New question - monitor for client understanding and clinical relevance',
  },
  {
    id: 241,
    systemCategory: 'modern_fm',
    subCategory: 'emf_sensitivity',
    questionText: 'How often do you feel anxious or agitated when in environments with many electronic devices?',
    helpText: 'EMF exposure can affect nervous system function and mood regulation',
    scaleType: 'frequency',
    diagnosticWeight: 1.5,
    reverseScore: true,
    questionCluster: 'emf_nervous_system',
    rootCauseIndicator: false,
    clinicalNotes: 'EMF can affect voltage-gated calcium channels and neurotransmitter function',
    modernFMUpdate: true,
    version: 1,
    isActive: true,
    testingNotes: 'Monitor for false positives - anxiety has many causes',
  },

  // ========================================
  // MODERN FUNCTIONAL MEDICINE - SEED OIL DAMAGE (7 questions)
  // ========================================
  {
    id: 248,
    systemCategory: 'modern_fm',
    subCategory: 'seed_oil_damage',
    questionText: 'How often do you experience inflammation or joint pain after eating fried or processed foods?',
    helpText: 'Seed oils high in omega-6 can trigger inflammatory responses',
    scaleType: 'frequency',
    diagnosticWeight: 2.0,
    reverseScore: true,
    questionCluster: 'inflammatory_food_response',
    rootCauseIndicator: true,
    clinicalNotes: 'Seed oil consumption creates inflammatory cascade through omega-6 pathways',
    modernFMUpdate: true,
    version: 1,
    isActive: true,
    testingNotes: 'High priority modern FM question - seed oils major health disruptor',
  },

  // ========================================
  // HORMONAL SYSTEM - THYROID FUNCTION (12 questions)
  // ========================================
  {
    id: 100,
    systemCategory: 'hormonal',
    subCategory: 'thyroid',
    questionText: 'How often do you feel cold when others are comfortable?',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    reverseScore: true,
    questionCluster: 'thyroid_temperature_regulation',
    rootCauseIndicator: true,
    clinicalNotes: 'Cold intolerance classic hypothyroid symptom - indicates low metabolic rate',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 101,
    systemCategory: 'hormonal',
    subCategory: 'thyroid',
    questionText: 'How difficult is it to lose weight even with diet and exercise?',
    scaleType: 'ease',
    diagnosticWeight: 2.1,
    reverseScore: true,
    questionCluster: 'metabolic_dysfunction',
    rootCauseIndicator: true,
    clinicalNotes: 'Weight loss resistance indicates thyroid-mediated metabolic slowdown',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },

  // ========================================
  // TOXIC LOAD & DETOXIFICATION - DETOX CAPACITY (10 questions)
  // ========================================
  {
    id: 200,
    systemCategory: 'toxic_load',
    subCategory: 'detox_capacity',
    questionText: 'How sensitive are you to perfumes, chemicals, or strong odors?',
    scaleType: 'severity',
    diagnosticWeight: 2.0,
    reverseScore: true,
    questionCluster: 'chemical_sensitivity',
    rootCauseIndicator: true,
    clinicalNotes: 'Chemical sensitivity indicates Phase I detox dysfunction or toxic overload',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },
  {
    id: 201,
    systemCategory: 'toxic_load',
    subCategory: 'detox_capacity',
    questionText: 'How often do you feel worse after taking supplements or medications?',
    helpText: 'Poor supplement tolerance can indicate detoxification pathway dysfunction',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    reverseScore: true,
    questionCluster: 'supplement_intolerance',
    rootCauseIndicator: true,
    clinicalNotes: 'Supplement intolerance suggests impaired Phase II detox or methylation dysfunction',
    modernFMUpdate: false,
    version: 1,
    isActive: true,
  },

  // [Continue adding questions to reach 270+ total]
  // This is a starting foundation - would continue with all categories
];

// Scoring algorithm configuration - flexible for optimization
export const SCORING_CONFIG = {
  // System weights (can be adjusted based on clinical outcomes)
  systemWeights: {
    digestive: 1.2,      // Higher weight due to gut-health centrality in FM
    energy: 1.1,         // Energy affects all systems and quality of life
    hormonal: 1.0,       // Standard weight - hormones regulate multiple systems
    toxic_load: 0.9,     // Important but often secondary to foundational systems
    inflammatory: 1.0,   // Standard weight - affects multiple systems
    neurological: 0.9,   // Important for quality of life
    cardiovascular: 0.8, // Often downstream of other systems
    modern_fm: 0.7,      // New categories need clinical validation
  },
  
  // Severity level thresholds (adjustable based on population data)
  severityThresholds: {
    minimal: [1.0, 1.8],    // Score 1.0-1.8 - minimal dysfunction
    mild: [1.9, 2.5],       // Score 1.9-2.5 - mild dysfunction
    moderate: [2.6, 3.5],   // Score 2.6-3.5 - moderate dysfunction  
    severe: [3.6, 4.5],     // Score 3.6-4.5 - severe dysfunction
    critical: [4.6, 5.0],   // Score 4.6-5.0 - critical dysfunction
  },
  
  // Intervention priority mapping
  interventionPriorities: {
    critical: 1,    // Immediate intervention required
    severe: 2,      // High priority intervention
    moderate: 3,    // Standard priority
    mild: 4,        // Lower priority
    minimal: 5,     // Monitoring only
  },
  
  // Confidence thresholds for scoring
  confidenceThresholds: {
    high: 85,       // 85%+ questions answered in category
    medium: 70,     // 70-84% questions answered
    low: 50,        // 50-69% questions answered
    insufficient: 49, // <50% questions answered
  },
};

// Question clusters for pattern recognition
export const QUESTION_CLUSTERS = {
  // Digestive clusters
  post_meal_symptoms: {
    name: 'Post-Meal Symptoms',
    description: 'Symptoms occurring 1-4 hours after eating',
    diagnosticSignificance: 'Indicates bacterial overgrowth or enzyme dysfunction',
  },
  carbohydrate_intolerance: {
    name: 'Carbohydrate Intolerance',
    description: 'Symptoms specifically triggered by carbohydrates or fiber',
    diagnosticSignificance: 'Strong indicator of SIBO or carbohydrate malabsorption',
  },
  
  // Energy clusters
  morning_cortisol: {
    name: 'Morning Cortisol Response',
    description: 'Energy patterns in the first 2 hours after waking',
    diagnosticSignificance: 'Reflects cortisol awakening response and HPA axis function',
  },
  cortisol_rhythm: {
    name: 'Cortisol Rhythm Dysfunction',
    description: 'Energy patterns throughout the day indicating cortisol dysregulation',
    diagnosticSignificance: 'Classic adrenal fatigue pattern - afternoon crashes, evening energy',
  },
  
  // Modern FM clusters
  emf_sleep_disruption: {
    name: 'EMF Sleep Disruption',
    description: 'Sleep quality changes related to electronic device exposure',
    diagnosticSignificance: 'Modern environmental factor affecting mitochondrial function',
  },
  inflammatory_food_response: {
    name: 'Inflammatory Food Response',
    description: 'Inflammatory symptoms triggered by processed foods and seed oils',
    diagnosticSignificance: 'Indicates omega-6 inflammatory pathway activation',
  },
};

// Utility functions for question management
export function getQuestionsBySystem(systemCategory: string): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.systemCategory === systemCategory && q.isActive
  );
}

export function getQuestionsBySubCategory(subCategory: string): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.subCategory === subCategory && q.isActive
  );
}

export function getActiveQuestions(): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => q.isActive);
}

export function getModernFMQuestions(): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => q.modernFMUpdate && q.isActive);
}

export function getHighPriorityQuestions(): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.diagnosticWeight >= 2.5 && q.rootCauseIndicator && q.isActive
  );
}

// Export total question count for system validation
export const TOTAL_COMPREHENSIVE_QUESTIONS = COMPREHENSIVE_QUESTIONS.length;
export const TARGET_QUESTION_COUNT = 270; // Target for full implementation

// Development progress tracking
export const IMPLEMENTATION_STATUS = {
  currentQuestions: COMPREHENSIVE_QUESTIONS.length,
  targetQuestions: TARGET_QUESTION_COUNT,
  percentComplete: Math.round((COMPREHENSIVE_QUESTIONS.length / TARGET_QUESTION_COUNT) * 100),
  systemsImplemented: Object.keys(SYSTEM_CATEGORIES).length,
  modernFMQuestions: COMPREHENSIVE_QUESTIONS.filter(q => q.modernFMUpdate).length,
};
