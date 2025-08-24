import { BodySystem, bodySystemOrder } from "./body-systems";

export interface BodySystemModule {
  id: BodySystem;
  name: string;
  description: string;
  questionCount: number;
  order: number;
}

export const bodySystemModules: BodySystemModule[] = [
  {
    id: "NEUROLOGICAL",
    name: "Neurological System",
    description: "Brain function, mood, memory, sleep, and stress response",
    questionCount: 20,
    order: 1,
  },
  {
    id: "DIGESTIVE",
    name: "Digestive System",
    description: "Gut health, digestion, absorption, and microbiome",
    questionCount: 20,
    order: 2,
  },
  {
    id: "CARDIOVASCULAR",
    name: "Cardiovascular System",
    description: "Heart health, circulation, and blood pressure",
    questionCount: 28,
    order: 3,
  },
  {
    id: "RESPIRATORY",
    name: "Respiratory System",
    description: "Lung function, breathing, and oxygenation",
    questionCount: 26,
    order: 4,
  },
  {
    id: "IMMUNE",
    name: "Immune System",
    description: "Immune response, inflammation, and infection resistance",
    questionCount: 29,
    order: 5,
  },
  {
    id: "MUSCULOSKELETAL",
    name: "Musculoskeletal System",
    description: "Muscles, joints, bones, and movement",
    questionCount: 28,
    order: 6,
  },
  {
    id: "ENDOCRINE",
    name: "Endocrine System",
    description: "Hormones, metabolism, and energy regulation",
    questionCount: 30,
    order: 7,
  },
  {
    id: "INTEGUMENTARY",
    name: "Skin, Hair & Nails",
    description: "Skin health, wound healing, and external barriers",
    questionCount: 20,
    order: 8,
  },
  {
    id: "GENITOURINARY",
    name: "Genitourinary System",
    description: "Kidney, bladder, and reproductive health",
    questionCount: 25,
    order: 9,
  },
  {
    id: "SPECIAL_TOPICS",
    name: "Modern Health Factors",
    description: "Seed oils, COVID-19, environmental exposures",
    questionCount: 20,
    order: 10,
  },
];

// Get the ordered list of body system IDs
export const getBodySystemOrder = (): BodySystem[] => {
  return bodySystemModules.map(m => m.id);
};

// Get next body system in sequence
export const getNextBodySystem = (
  currentSystem: BodySystem,
  completedSystems: Set<BodySystem>
): BodySystem | null => {
  const systemOrder = getBodySystemOrder();
  const currentIndex = systemOrder.indexOf(currentSystem);
  
  for (let i = currentIndex + 1; i < systemOrder.length; i++) {
    if (!completedSystems.has(systemOrder[i])) {
      return systemOrder[i];
    }
  }
  
  return null;
};

// For compatibility with existing code
export const assessmentModules = bodySystemModules.map(m => ({
  id: m.id as any,
  name: m.name,
  description: m.description,
  questionCount: m.questionCount,
  activationThreshold: 0, // All systems are always active
  questions: [],
  seedOilIntegration: m.id === "SPECIAL_TOPICS",
}));
