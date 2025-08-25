// Scale types for different question formats
export const SCALES = {
  frequency: [
    { value: 1, label: "Never" },
    { value: 2, label: "Rarely" },
    { value: 3, label: "Sometimes" },
    { value: 4, label: "Often" },
    { value: 5, label: "Always" },
  ],
  frequencyReverse: [
    // For negative frequency questions
    { value: 1, label: "Never" },
    { value: 2, label: "Rarely" },
    { value: 3, label: "Sometimes" },
    { value: 4, label: "Often" },
    { value: 5, label: "Always" },
  ],
  quality: [
    { value: 1, label: "Very Poor" },
    { value: 2, label: "Poor" },
    { value: 3, label: "Fair" },
    { value: 4, label: "Good" },
    { value: 5, label: "Excellent" },
  ],
  consistency: [
    { value: 1, label: "Very Inconsistent" },
    { value: 2, label: "Inconsistent" },
    { value: 3, label: "Somewhat Consistent" },
    { value: 4, label: "Consistent" },
    { value: 5, label: "Very Consistent" },
  ],
  satisfaction: [
    { value: 1, label: "Very Unsatisfied" },
    { value: 2, label: "Unsatisfied" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Satisfied" },
    { value: 5, label: "Very Satisfied" },
  ],
  energy: [
    { value: 1, label: "Very Low" },
    { value: 2, label: "Low" },
    { value: 3, label: "Moderate" },
    { value: 4, label: "High" },
    { value: 5, label: "Very High" },
  ],
  ease: [
    { value: 1, label: "Very Difficult" },
    { value: 2, label: "Difficult" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Easy" },
    { value: 5, label: "Very Easy" },
  ],
  level: [
    // For feelings, relaxation, balance
    { value: 1, label: "Very Low" },
    { value: 2, label: "Low" },
    { value: 3, label: "Moderate" },
    { value: 4, label: "High" },
    { value: 5, label: "Very High" },
  ],
  regularity: [
    { value: 1, label: "Very Irregular" },
    { value: 2, label: "Irregular" },
    { value: 3, label: "Somewhat Regular" },
    { value: 4, label: "Regular" },
    { value: 5, label: "Very Regular" },
  ],
  severity: [
    // New scale for symptom severity
    { value: 1, label: "Very Mild" },
    { value: 2, label: "Mild" },
    { value: 3, label: "Moderate" },
    { value: 4, label: "Severe" },
    { value: 5, label: "Very Severe" },
  ],
  sensitivity: [
    // How sensitive to various factors
    { value: 1, label: "Not Sensitive" },
    { value: 2, label: "Slightly Sensitive" },
    { value: 3, label: "Moderately Sensitive" },
    { value: 4, label: "Very Sensitive" },
    { value: 5, label: "Extremely Sensitive" },
  ],
  effectiveness: [
    // How effective something is
    { value: 1, label: "Not Effective" },
    { value: 2, label: "Slightly Effective" },
    { value: 3, label: "Moderately Effective" },
    { value: 4, label: "Very Effective" },
    { value: 5, label: "Extremely Effective" },
  ],
  speed: [
    // How fast recovery/response is
    { value: 1, label: "Very Slow" },
    { value: 2, label: "Slow" },
    { value: 3, label: "Moderate" },
    { value: 4, label: "Fast" },
    { value: 5, label: "Very Fast" },
  ],
};

export type ScaleType = keyof typeof SCALES;

export interface Question {
  id: number;
  category: string;
  text: string;
  scaleType: ScaleType;
}

export const SIMPLE_QUESTIONS: Question[] = [
  // Digestive (Questions 1-10)
  {
    id: 1,
    category: "digestive",
    text: "How often do you experience bloating after meals?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 2,
    category: "digestive",
    text: "How regular are your bowel movements?",
    scaleType: "regularity",
  },
  {
    id: 3,
    category: "digestive",
    text: "How often do you have heartburn or acid reflux?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 4,
    category: "digestive",
    text: "How well do you digest fatty foods?",
    scaleType: "quality",
  },
  {
    id: 5,
    category: "digestive",
    text: "How satisfied do you feel after eating?",
    scaleType: "satisfaction",
  },

  {
    id: 6,
    category: "digestive",
    text: "How often do you experience gas or flatulence?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 7,
    category: "digestive",
    text: "How severe is your abdominal pain when it occurs?",
    scaleType: "severity",
  },
  {
    id: 8,
    category: "digestive",
    text: "How often do you experience nausea?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 9,
    category: "digestive",
    text: "How strong are your food cravings?",
    scaleType: "level",
  },
  {
    id: 10,
    category: "digestive",
    text: "How much do digestive issues affect your daily activities?",
    scaleType: "level",
  },

  // Energy (Questions 11-20)
  {
    id: 11,
    category: "energy",
    text: "How consistent is your energy throughout the day?",
    scaleType: "consistency",
  },
  {
    id: 12,
    category: "energy",
    text: "How energetic do you feel when you wake up?",
    scaleType: "energy",
  },
  {
    id: 13,
    category: "energy",
    text: "How often do you experience afternoon energy crashes?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 14,
    category: "energy",
    text: "How well can you maintain focus during work?",
    scaleType: "quality",
  },
  {
    id: 15,
    category: "energy",
    text: "How motivated do you feel to exercise regularly?",
    scaleType: "level",
  },

  {
    id: 16,
    category: "energy",
    text: "How good is your physical stamina throughout the day?",
    scaleType: "quality",
  },
  {
    id: 17,
    category: "energy",
    text: "How often do you experience mental fatigue?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 18,
    category: "energy",
    text: "How quickly do you recover from physical exertion?",
    scaleType: "quality",
  },
  {
    id: 19,
    category: "energy",
    text: "How affected is your energy by seasonal changes?",
    scaleType: "level",
  },
  {
    id: 20,
    category: "energy",
    text: "How dependent are you on caffeine for energy?",
    scaleType: "level",
  },

  // Sleep (Questions 21-30)
  {
    id: 21,
    category: "sleep",
    text: "How easily do you fall asleep at night?",
    scaleType: "ease",
  },
  {
    id: 22,
    category: "sleep",
    text: "How often do you wake up during the night?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 23,
    category: "sleep",
    text: "How refreshed do you feel upon waking?",
    scaleType: "level",
  },
  {
    id: 24,
    category: "sleep",
    text: "How consistent is your sleep schedule?",
    scaleType: "consistency",
  },
  {
    id: 25,
    category: "sleep",
    text: "How well do you sleep without interruptions?",
    scaleType: "quality",
  },

  {
    id: 26,
    category: "sleep",
    text: "How deep and restorative is your sleep?",
    scaleType: "quality",
  },
  {
    id: 27,
    category: "sleep",
    text: "How sensitive are you to noise/light when sleeping?",
    scaleType: "sensitivity",
  },
  {
    id: 28,
    category: "sleep",
    text: "How comfortable are you in your sleep position throughout the night?",
    scaleType: "level",
  },
  {
    id: 29,
    category: "sleep",
    text: "How well does your natural sleep schedule match your required schedule?",
    scaleType: "quality",
  },
  {
    id: 30,
    category: "sleep",
    text: "How quickly do you feel alert and functional after waking?",
    scaleType: "speed",
  },

  // Stress (Questions 31-40)
  {
    id: 31,
    category: "stress",
    text: "How well do you handle daily stress?",
    scaleType: "quality",
  },
  {
    id: 32,
    category: "stress",
    text: "How often do you feel overwhelmed?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 33,
    category: "stress",
    text: "How relaxed do you feel at the end of the day?",
    scaleType: "level",
  },
  {
    id: 34,
    category: "stress",
    text: "How well do you manage work pressure?",
    scaleType: "quality",
  },
  {
    id: 35,
    category: "stress",
    text: "How balanced does your life feel overall?",
    scaleType: "level",
  },

  {
    id: 36,
    category: "stress",
    text: "How often do you experience physical symptoms from stress?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 37,
    category: "stress",
    text: "How quickly do you recover after a stressful event?",
    scaleType: "speed",
  },
  {
    id: 38,
    category: "stress",
    text: "How much do you worry about future events or situations?",
    scaleType: "level",
  },
  {
    id: 39,
    category: "stress",
    text: "How sensitive are you to unexpected changes or disruptions?",
    scaleType: "sensitivity",
  },
  {
    id: 40,
    category: "stress",
    text: "How effective are your current stress management strategies?",
    scaleType: "effectiveness",
  },

  // Immune (Questions 41-50)
  {
    id: 41,
    category: "immune",
    text: "How often do you get colds or flu?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 42,
    category: "immune",
    text: "How quickly do you recover from infections?",
    scaleType: "quality",
  },
  {
    id: 43,
    category: "immune",
    text: "How often do you experience allergic reactions?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 44,
    category: "immune",
    text: "How strong is your immune system overall?",
    scaleType: "level",
  },
  {
    id: 45,
    category: "immune",
    text: "How often do you need antibiotics?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },

  {
    id: 46,
    category: "immune",
    text: "When you do get sick, how severe are your symptoms typically?",
    scaleType: "severity",
  },
  {
    id: 47,
    category: "immune",
    text: "How much do seasonal changes affect your health?",
    scaleType: "sensitivity",
  },
  {
    id: 48,
    category: "immune",
    text: "How often do you experience unexplained inflammation or swelling?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 49,
    category: "immune",
    text: "How well do you maintain energy when fighting off illness?",
    scaleType: "quality",
  },
  {
    id: 50,
    category: "immune",
    text: "How well does your immune system handle multiple stressors?",
    scaleType: "quality",
  },

  // Hormonal (Questions 51-60)
  {
    id: 51,
    category: "hormonal",
    text: "How stable are your moods throughout the month?",
    scaleType: "consistency",
  },
  {
    id: 52,
    category: "hormonal",
    text: "How often do you experience hot flashes or night sweats?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 53,
    category: "hormonal",
    text: "How balanced is your appetite and weight?",
    scaleType: "level",
  },
  {
    id: 54,
    category: "hormonal",
    text: "How healthy is your libido?",
    scaleType: "level",
  },
  {
    id: 55,
    category: "hormonal",
    text: "How regular are your menstrual cycles? (if applicable)",
    scaleType: "regularity",
  },

  {
    id: 56,
    category: "hormonal",
    text: "How stable is your weight without active effort?",
    scaleType: "consistency",
  },
  {
    id: 57,
    category: "hormonal",
    text: "How well does your body regulate temperature in different environments?",
    scaleType: "quality",
  },
  {
    id: 58,
    category: "hormonal",
    text: "How often do you notice unexplained changes in hair or skin quality?",
    scaleType: "frequency",
  },
  {
    id: 59,
    category: "hormonal",
    text: "How consistent and appropriate are your hunger/satiety signals?",
    scaleType: "quality",
  },
  {
    id: 60,
    category: "hormonal",
    text: "How predictable are your energy and mood patterns throughout the day?",
    scaleType: "consistency",
  },

  // Detox (Questions 61-70)
  {
    id: 61,
    category: "detox",
    text: "How often do you experience headaches?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 62,
    category: "detox",
    text: "How clear is your skin?",
    scaleType: "quality",
  },
  {
    id: 63,
    category: "detox",
    text: "How often do you feel chemically sensitive?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 64,
    category: "detox",
    text: "How well does your body eliminate toxins?",
    scaleType: "quality",
  },
  {
    id: 65,
    category: "detox",
    text: "How often do you experience brain fog?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },

  {
    id: 66,
    category: "detox",
    text: "How often do you notice unusual or strong body odor despite good hygiene?",
    scaleType: "frequency",
  },
  {
    id: 67,
    category: "detox",
    text: "How appropriate is your sweating response to temperature and activity?",
    scaleType: "quality",
  },
  {
    id: 68,
    category: "detox",
    text: "How sensitive are you to perfumes, cleaning products, or other chemicals?",
    scaleType: "sensitivity",
  },
  {
    id: 69,
    category: "detox",
    text: "How sensitive are you to medications or supplements (needing lower doses)?",
    scaleType: "sensitivity",
  },
  {
    id: 70,
    category: "detox",
    text: "How quickly do you recover from exposure to alcohol, processed foods, or toxins?",
    scaleType: "speed",
  },

  // Cardiovascular (Questions 71-80)
  {
    id: 71,
    category: "cardiovascular",
    text: "How stable is your blood pressure?",
    scaleType: "consistency",
  },
  {
    id: 72,
    category: "cardiovascular",
    text: "How often do you experience chest discomfort?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 73,
    category: "cardiovascular",
    text: "How good is your circulation?",
    scaleType: "quality",
  },
  {
    id: 74,
    category: "cardiovascular",
    text: "How often do you get short of breath?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 75,
    category: "cardiovascular",
    text: "How strong is your cardiovascular endurance?",
    scaleType: "level",
  },

  {
    id: 76,
    category: "cardiovascular",
    text: "How well does your heart rate adapt to different activities and stress levels?",
    scaleType: "quality",
  },
  {
    id: 77,
    category: "cardiovascular",
    text: "How stable is your blood pressure throughout the day?",
    scaleType: "consistency",
  },
  {
    id: 78,
    category: "cardiovascular",
    text: "How often do you have cold hands or feet?",
    scaleType: "frequency",
  },
  {
    id: 79,
    category: "cardiovascular",
    text: "How noticeable are varicose veins or spider veins on your body?",
    scaleType: "severity",
  },
  {
    id: 80,
    category: "cardiovascular",
    text: "How quickly does your heart rate return to normal after physical activity?",
    scaleType: "speed",
  },
];

// Legacy labels - kept for backwards compatibility
export const SCORING_LABELS = [
  { value: 1, label: "Very Poor" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Average" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

export const CATEGORIES = [
  {
    id: "digestive",
    name: "Digestive Health",
    description: "How well your digestive system functions",
  },
  {
    id: "energy",
    name: "Energy & Focus",
    description: "Your energy levels and mental clarity",
  },
  {
    id: "sleep",
    name: "Sleep Quality",
    description: "How well you sleep and recover",
  },
  {
    id: "stress",
    name: "Stress Management",
    description: "How you handle stress and feel balanced",
  },
  {
    id: "immune",
    name: "Immune System",
    description: "Your body's ability to fight infections and stay healthy",
  },
  {
    id: "hormonal",
    name: "Hormonal Balance",
    description: "How balanced your hormones and related symptoms are",
  },
  {
    id: "detox",
    name: "Detoxification",
    description: "Your body's ability to eliminate toxins and stay clear",
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular Health",
    description: "Your heart health and circulation",
  },
];
