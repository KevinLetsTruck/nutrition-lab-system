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
};

export type ScaleType = keyof typeof SCALES;

export interface Question {
  id: number;
  category: string;
  text: string;
  scaleType: ScaleType;
}

export const SIMPLE_QUESTIONS: Question[] = [
  // Digestive (Questions 1-5)
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

  // Energy (Questions 6-10)
  {
    id: 6,
    category: "energy",
    text: "How consistent is your energy throughout the day?",
    scaleType: "consistency",
  },
  {
    id: 7,
    category: "energy",
    text: "How energetic do you feel when you wake up?",
    scaleType: "energy",
  },
  {
    id: 8,
    category: "energy",
    text: "How often do you experience afternoon energy crashes?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 9,
    category: "energy",
    text: "How well can you maintain focus during work?",
    scaleType: "quality",
  },
  {
    id: 10,
    category: "energy",
    text: "How motivated do you feel to exercise regularly?",
    scaleType: "level",
  },

  // Sleep (Questions 11-15)
  {
    id: 11,
    category: "sleep",
    text: "How easily do you fall asleep at night?",
    scaleType: "ease",
  },
  {
    id: 12,
    category: "sleep",
    text: "How often do you wake up during the night?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 13,
    category: "sleep",
    text: "How refreshed do you feel upon waking?",
    scaleType: "level",
  },
  {
    id: 14,
    category: "sleep",
    text: "How consistent is your sleep schedule?",
    scaleType: "consistency",
  },
  {
    id: 15,
    category: "sleep",
    text: "How well do you sleep without interruptions?",
    scaleType: "quality",
  },

  // Stress (Questions 16-20)
  {
    id: 16,
    category: "stress",
    text: "How well do you handle daily stress?",
    scaleType: "quality",
  },
  {
    id: 17,
    category: "stress",
    text: "How often do you feel overwhelmed?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 18,
    category: "stress",
    text: "How relaxed do you feel at the end of the day?",
    scaleType: "level",
  },
  {
    id: 19,
    category: "stress",
    text: "How well do you manage work pressure?",
    scaleType: "quality",
  },
  {
    id: 20,
    category: "stress",
    text: "How balanced does your life feel overall?",
    scaleType: "level",
  },

  // Immune (Questions 21-25)
  {
    id: 21,
    category: "immune",
    text: "How often do you get colds or flu?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 22,
    category: "immune",
    text: "How quickly do you recover from infections?",
    scaleType: "quality",
  },
  {
    id: 23,
    category: "immune",
    text: "How often do you experience allergic reactions?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 24,
    category: "immune",
    text: "How strong is your immune system overall?",
    scaleType: "level",
  },
  {
    id: 25,
    category: "immune",
    text: "How often do you need antibiotics?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },

  // Hormonal (Questions 26-30)
  {
    id: 26,
    category: "hormonal",
    text: "How stable are your moods throughout the month?",
    scaleType: "consistency",
  },
  {
    id: 27,
    category: "hormonal",
    text: "How often do you experience hot flashes or night sweats?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 28,
    category: "hormonal",
    text: "How balanced is your appetite and weight?",
    scaleType: "level",
  },
  {
    id: 29,
    category: "hormonal",
    text: "How healthy is your libido?",
    scaleType: "level",
  },
  {
    id: 30,
    category: "hormonal",
    text: "How regular are your menstrual cycles? (if applicable)",
    scaleType: "regularity",
  },

  // Detox (Questions 31-35)
  {
    id: 31,
    category: "detox",
    text: "How often do you experience headaches?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 32,
    category: "detox",
    text: "How clear is your skin?",
    scaleType: "quality",
  },
  {
    id: 33,
    category: "detox",
    text: "How often do you feel chemically sensitive?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 34,
    category: "detox",
    text: "How well does your body eliminate toxins?",
    scaleType: "quality",
  },
  {
    id: 35,
    category: "detox",
    text: "How often do you experience brain fog?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },

  // Cardiovascular (Questions 36-40)
  {
    id: 36,
    category: "cardiovascular",
    text: "How stable is your blood pressure?",
    scaleType: "consistency",
  },
  {
    id: 37,
    category: "cardiovascular",
    text: "How often do you experience chest discomfort?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 38,
    category: "cardiovascular",
    text: "How good is your circulation?",
    scaleType: "quality",
  },
  {
    id: 39,
    category: "cardiovascular",
    text: "How often do you get short of breath?",
    scaleType: "frequencyReverse", // Lower frequency is better
  },
  {
    id: 40,
    category: "cardiovascular",
    text: "How strong is your cardiovascular endurance?",
    scaleType: "level",
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
