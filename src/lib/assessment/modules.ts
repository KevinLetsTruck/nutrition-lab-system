import { AssessmentModule, FunctionalModule } from './types';

export const assessmentModules: AssessmentModule[] = [
  {
    id: FunctionalModule.SCREENING,
    name: "Universal Screening",
    description: "Initial comprehensive screening to identify primary areas of concern, including seed oil exposure assessment",
    questionCount: 75,
    activationThreshold: 0, // Always active
    questions: [], // Will be populated from question bank
    seedOilIntegration: true
  },
  {
    id: FunctionalModule.ASSIMILATION,
    name: "Digestive System & Gut Health",
    description: "Comprehensive evaluation of digestive function, gut microbiome, and intestinal permeability",
    questionCount: 65,
    activationThreshold: 20,
    questions: [],
    dependencies: [FunctionalModule.SCREENING],
    seedOilIntegration: true
  },
  {
    id: FunctionalModule.DEFENSE_REPAIR,
    name: "Immune System & Inflammation",
    description: "Assessment of immune function, inflammatory status, and autoimmune risk factors",
    questionCount: 60,
    activationThreshold: 15,
    questions: [],
    dependencies: [FunctionalModule.SCREENING],
    seedOilIntegration: true
  },
  {
    id: FunctionalModule.ENERGY,
    name: "Energy Production & Mitochondrial Health",
    description: "Evaluation of cellular energy production, mitochondrial function, and metabolic efficiency",
    questionCount: 70,
    activationThreshold: 18,
    questions: [],
    dependencies: [FunctionalModule.SCREENING],
    seedOilIntegration: true
  },
  {
    id: FunctionalModule.BIOTRANSFORMATION,
    name: "Detoxification & Elimination",
    description: "Assessment of liver function, detox pathways, and toxic burden",
    questionCount: 55,
    activationThreshold: 12,
    questions: [],
    dependencies: [FunctionalModule.SCREENING],
    seedOilIntegration: true
  },
  {
    id: FunctionalModule.TRANSPORT,
    name: "Cardiovascular & Lymphatic Systems",
    description: "Evaluation of circulation, cardiovascular health, and lymphatic drainage",
    questionCount: 50,
    activationThreshold: 10,
    questions: [],
    dependencies: [FunctionalModule.SCREENING]
  },
  {
    id: FunctionalModule.COMMUNICATION,
    name: "Hormonal & Neurological Balance",
    description: "Assessment of hormone levels, neurotransmitter balance, and nervous system function",
    questionCount: 75,
    activationThreshold: 15,
    questions: [],
    dependencies: [FunctionalModule.SCREENING]
  },
  {
    id: FunctionalModule.STRUCTURAL,
    name: "Structural Integrity & Musculoskeletal Health",
    description: "Evaluation of structural alignment, joint health, and connective tissue integrity",
    questionCount: 45,
    activationThreshold: 8,
    questions: [],
    dependencies: [FunctionalModule.SCREENING]
  }
];

// Module activation logic
export const getActiveModules = (screeningScore: number, responses: Map<string, any>): FunctionalModule[] => {
  const activeModules: FunctionalModule[] = [FunctionalModule.SCREENING];
  
  assessmentModules.forEach(module => {
    if (module.id === FunctionalModule.SCREENING) return;
    
    // Check if module should be activated based on screening score
    if (screeningScore >= module.activationThreshold) {
      activeModules.push(module.id);
    }
    
    // Check for specific trigger conditions from responses
    // This would be enhanced with more complex logic based on specific response patterns
  });
  
  return activeModules;
};

// Calculate module progress
export const calculateModuleProgress = (moduleId: FunctionalModule, answeredQuestions: Set<string>, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredQuestions.size / totalQuestions) * 100);
};

// Get next module to activate
export const getNextModule = (currentModule: FunctionalModule, completedModules: Set<FunctionalModule>): FunctionalModule | null => {
  const moduleOrder = [
    FunctionalModule.SCREENING,
    FunctionalModule.ASSIMILATION,
    FunctionalModule.DEFENSE_REPAIR,
    FunctionalModule.ENERGY,
    FunctionalModule.BIOTRANSFORMATION,
    FunctionalModule.TRANSPORT,
    FunctionalModule.COMMUNICATION,
    FunctionalModule.STRUCTURAL
  ];
  
  const currentIndex = moduleOrder.indexOf(currentModule);
  
  for (let i = currentIndex + 1; i < moduleOrder.length; i++) {
    if (!completedModules.has(moduleOrder[i])) {
      return moduleOrder[i];
    }
  }
  
  return null;
};

// Module scoring weights for overall assessment
export const moduleWeights: Record<FunctionalModule, number> = {
  [FunctionalModule.SCREENING]: 0.20,
  [FunctionalModule.ASSIMILATION]: 0.15,
  [FunctionalModule.DEFENSE_REPAIR]: 0.15,
  [FunctionalModule.ENERGY]: 0.15,
  [FunctionalModule.BIOTRANSFORMATION]: 0.10,
  [FunctionalModule.TRANSPORT]: 0.10,
  [FunctionalModule.COMMUNICATION]: 0.10,
  [FunctionalModule.STRUCTURAL]: 0.05
};
