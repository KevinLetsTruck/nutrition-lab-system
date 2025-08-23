// Body System-Based Assessment Structure
export const BodySystems = {
  NEUROLOGICAL: "NEUROLOGICAL",
  DIGESTIVE: "DIGESTIVE",
  CARDIOVASCULAR: "CARDIOVASCULAR",
  RESPIRATORY: "RESPIRATORY",
  IMMUNE: "IMMUNE",
  MUSCULOSKELETAL: "MUSCULOSKELETAL",
  ENDOCRINE: "ENDOCRINE",
  INTEGUMENTARY: "INTEGUMENTARY", // Skin
  GENITOURINARY: "GENITOURINARY",
  SPECIAL_TOPICS: "SPECIAL_TOPICS",
} as const;

export type BodySystem = (typeof BodySystems)[keyof typeof BodySystems];

export const bodySystemOrder: BodySystem[] = [
  BodySystems.NEUROLOGICAL,
  BodySystems.DIGESTIVE,
  BodySystems.CARDIOVASCULAR,
  BodySystems.RESPIRATORY,
  BodySystems.IMMUNE,
  BodySystems.MUSCULOSKELETAL,
  BodySystems.ENDOCRINE,
  BodySystems.INTEGUMENTARY,
  BodySystems.GENITOURINARY,
  BodySystems.SPECIAL_TOPICS,
];

export const bodySystemInfo = {
  [BodySystems.NEUROLOGICAL]: {
    name: "Neurological System",
    description: "Brain, nervous system, mood, and cognitive function",
    targetQuestions: 20,
    keySymptoms: [
      "headaches",
      "brain fog",
      "memory",
      "mood",
      "sleep",
      "stress",
    ],
  },
  [BodySystems.DIGESTIVE]: {
    name: "Digestive System",
    description: "Stomach, intestines, and digestive function",
    targetQuestions: 20,
    keySymptoms: [
      "bloating",
      "gas",
      "bowel movements",
      "stomach pain",
      "food sensitivities",
    ],
  },
  [BodySystems.CARDIOVASCULAR]: {
    name: "Cardiovascular System",
    description: "Heart, blood vessels, and circulation",
    targetQuestions: 15,
    keySymptoms: [
      "palpitations",
      "blood pressure",
      "chest pain",
      "circulation",
    ],
  },
  [BodySystems.RESPIRATORY]: {
    name: "Respiratory System",
    description: "Lungs, breathing, and oxygen exchange",
    targetQuestions: 15,
    keySymptoms: ["breathing", "cough", "sinus", "exercise tolerance"],
  },
  [BodySystems.IMMUNE]: {
    name: "Immune System",
    description: "Immune function and resistance to illness",
    targetQuestions: 15,
    keySymptoms: ["infections", "allergies", "autoimmune", "recovery"],
  },
  [BodySystems.MUSCULOSKELETAL]: {
    name: "Musculoskeletal System",
    description: "Muscles, bones, joints, and connective tissue",
    targetQuestions: 15,
    keySymptoms: ["joint pain", "muscle weakness", "back pain", "stiffness"],
  },
  [BodySystems.ENDOCRINE]: {
    name: "Endocrine System",
    description: "Hormones and metabolic function",
    targetQuestions: 15,
    keySymptoms: ["energy", "weight", "temperature", "hormones", "blood sugar"],
  },
  [BodySystems.INTEGUMENTARY]: {
    name: "Skin & Hair",
    description: "Skin, hair, and nails",
    targetQuestions: 10,
    keySymptoms: ["skin conditions", "wound healing", "hair loss", "rashes"],
  },
  [BodySystems.GENITOURINARY]: {
    name: "Genitourinary System",
    description: "Kidneys, bladder, and reproductive organs",
    targetQuestions: 10,
    keySymptoms: ["urination", "UTIs", "reproductive health", "libido"],
  },
  [BodySystems.SPECIAL_TOPICS]: {
    name: "Special Health Topics",
    description: "Modern health concerns and exposures",
    targetQuestions: 20,
    keySymptoms: [
      "seed oils",
      "COVID-19",
      "vaccines",
      "driver health",
      "environmental",
    ],
  },
};
