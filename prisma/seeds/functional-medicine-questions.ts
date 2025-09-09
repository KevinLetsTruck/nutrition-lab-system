/**
 * Functional Medicine Digestive Questions Seed Data
 * 
 * Seeds the database with 45+ sophisticated digestive questions
 * including modern FM insights and clinical significance data
 */

import { PrismaClient } from '@prisma/client';
// Import the questions directly since module imports are tricky with ts-node
const DIGESTIVE_QUESTIONS = [
  // Upper GI questions
  {
    id: 1, category: 'upper_gi', subcategory: 'stomach_acid_production',
    questionText: 'How often do you experience belching, gas, or bloating within 30 minutes of eating?',
    questionContext: 'This occurs immediately after eating, not hours later',
    clinicalSignificance: 'Primary indicator of hypochlorhydria (low stomach acid) - fundamental to all digestion',
    scaleType: 'frequency', diagnosticWeight: 2.8, symptomType: 'root_cause',
    conditionAssociations: ['hypochlorhydria', 'SIBO', 'malabsorption'],
    isTraditional: true, isModernInsight: false, displayOrder: 1, requiredLevel: 'required',
    reverseScoring: false, environmentalFactor: null
  },
  {
    id: 2, category: 'upper_gi', subcategory: 'stomach_acid_production',
    questionText: 'How often do you feel excessively full after normal-sized meals?',
    questionContext: 'Feeling like food just sits in your stomach',
    clinicalSignificance: 'Indicates gastroparesis or severe hypochlorhydria affecting gastric emptying',
    scaleType: 'frequency', diagnosticWeight: 2.5, symptomType: 'primary_symptom',
    conditionAssociations: ['gastroparesis', 'hypochlorhydria', 'vagal_dysfunction'],
    isTraditional: true, isModernInsight: false, displayOrder: 2, requiredLevel: 'required',
    reverseScoring: false, environmentalFactor: null
  },
  {
    id: 3, category: 'upper_gi', subcategory: 'emf_stress_impact',
    questionText: 'How often do you eat while using electronic devices (phone, computer, TV)?',
    questionContext: 'Multitasking during meals with digital devices',
    clinicalSignificance: 'EMF exposure during eating disrupts vagal nerve function and digestive enzyme production',
    scaleType: 'frequency', diagnosticWeight: 1.8, symptomType: 'modifier',
    conditionAssociations: ['vagal_dysfunction', 'emf_sensitivity', 'stress_digestion'],
    isTraditional: false, isModernInsight: true, displayOrder: 3, requiredLevel: 'standard',
    reverseScoring: false, environmentalFactor: 'emf'
  },
  {
    id: 4, category: 'small_intestine', subcategory: 'sibo_bacterial_overgrowth',
    questionText: 'How often do you experience bloating 1-3 hours after eating (especially carbohydrates)?',
    questionContext: 'Delayed bloating that occurs well after the meal, particularly with starches, sugars, or fiber',
    clinicalSignificance: 'Hallmark sign of SIBO - bacterial fermentation in small intestine creates delayed gas production',
    scaleType: 'frequency', diagnosticWeight: 3.0, symptomType: 'root_cause',
    conditionAssociations: ['SIBO', 'bacterial_overgrowth', 'carbohydrate_malabsorption'],
    isTraditional: true, isModernInsight: false, displayOrder: 4, requiredLevel: 'required',
    reverseScoring: false, environmentalFactor: null
  },
  {
    id: 5, category: 'large_intestine', subcategory: 'bowel_movement_patterns',
    questionText: 'How often do you have fewer than one complete bowel movement per day?',
    questionContext: 'Not having at least one substantial bowel movement daily',
    clinicalSignificance: 'Constipation indicates compromised colon function and increased toxin reabsorption',
    scaleType: 'frequency', diagnosticWeight: 2.5, symptomType: 'root_cause',
    conditionAssociations: ['constipation', 'colon_dysfunction', 'dysbiosis'],
    isTraditional: true, isModernInsight: false, displayOrder: 5, requiredLevel: 'required',
    reverseScoring: false, environmentalFactor: null
  }
];

const prisma = new PrismaClient();

export async function seedFunctionalMedicineQuestions() {
  console.log('🌱 Seeding Functional Medicine Digestive Questions...');

  // First, deactivate all existing questions
  await prisma.fmDigestiveQuestion.updateMany({
    data: { isActive: false }
  });

  // Insert or update questions
  const questionPromises = DIGESTIVE_QUESTIONS.map(async (question) => {
    return prisma.fmDigestiveQuestion.upsert({
      where: { id: question.id },
      update: {
        category: question.category,
        subcategory: question.subcategory,
        questionText: question.questionText,
        questionContext: question.questionContext || null,
        clinicalSignificance: question.clinicalSignificance,
        scaleType: question.scaleType,
        reverseScoring: question.reverseScoring || false,
        diagnosticWeight: question.diagnosticWeight,
        symptomType: question.symptomType,
        conditionAssociations: question.conditionAssociations,
        isTraditional: question.isTraditional,
        isModernInsight: question.isModernInsight,
        environmentalFactor: question.environmentalFactor || null,
        displayOrder: question.displayOrder,
        requiredLevel: question.requiredLevel,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        id: question.id,
        category: question.category,
        subcategory: question.subcategory,
        questionText: question.questionText,
        questionContext: question.questionContext || null,
        clinicalSignificance: question.clinicalSignificance,
        scaleType: question.scaleType,
        reverseScoring: question.reverseScoring || false,
        diagnosticWeight: question.diagnosticWeight,
        symptomType: question.symptomType,
        conditionAssociations: question.conditionAssociations,
        isTraditional: question.isTraditional,
        isModernInsight: question.isModernInsight,
        environmentalFactor: question.environmentalFactor || null,
        displayOrder: question.displayOrder,
        requiredLevel: question.requiredLevel,
        isActive: true
      }
    });
  });

  await Promise.all(questionPromises);

  // Create or update default scoring algorithm
  const existingAlgorithm = await prisma.fmScoringAlgorithm.findFirst({
    where: { systemName: 'digestive_system', isActive: true }
  });

  const algorithmData = {
    systemName: 'digestive_system',
    algorithmVersion: 'v1.0',
    isActive: true,
    scoringRules: {
      categoryWeights: {
        upper_gi: 1.2,
        small_intestine: 1.3,
        large_intestine: 1.0,
        liver_detox: 1.1,
        modern_factors: 0.8
      },
      severityThresholds: {
        normal: { min: 0, max: 1.5 },
        mild: { min: 1.5, max: 2.5 },
        moderate: { min: 2.5, max: 3.5 },
        severe: { min: 3.5, max: 5.0 }
      },
      rootCauseWeights: {
        root_cause: 3.0,
        primary_symptom: 2.0,
        secondary_symptom: 1.0,
        modifier: 0.5
      }
    },
    thresholds: {
      overallScore: {
        excellent: { min: 0, max: 1.0 },
        good: { min: 1.0, max: 2.0 },
        fair: { min: 2.0, max: 3.0 },
        poor: { min: 3.0, max: 4.0 },
        critical: { min: 4.0, max: 5.0 }
      },
      categoryThresholds: {
        upper_gi: {
          normal: { min: 0, max: 1.5 },
          dysfunction: { min: 1.5, max: 2.5 },
          severe: { min: 2.5, max: 5.0 }
        },
        small_intestine: {
          normal: { min: 0, max: 1.8 },
          permeability: { min: 1.8, max: 2.8 },
          severe: { min: 2.8, max: 5.0 }
        },
        large_intestine: {
          normal: { min: 0, max: 1.5 },
          dysbiosis: { min: 1.5, max: 2.8 },
          severe: { min: 2.8, max: 5.0 }
        },
        liver_detox: {
          normal: { min: 0, max: 1.6 },
          congestion: { min: 1.6, max: 2.8 },
          severe: { min: 2.8, max: 5.0 }
        }
      }
    },
    treatmentAlgorithms: {
      phase1Priorities: [
        {
          condition: 'hypochlorhydria',
          indicators: ['question_1_high', 'question_2_high', 'question_3_high'],
          priority: 1,
          interventions: ['HCl_support', 'digestive_enzymes', 'bitter_herbs']
        },
        {
          condition: 'SIBO',
          indicators: ['question_13_high', 'question_14_high', 'question_15_high'],
          priority: 2,
          interventions: ['SIBO_protocol', 'prokinetics', 'herbal_antimicrobials']
        },
        {
          condition: 'leaky_gut',
          indicators: ['question_16_high', 'question_19_high', 'question_21_high'],
          priority: 3,
          interventions: ['gut_barrier_support', 'anti_inflammatory', 'food_elimination']
        },
        {
          condition: 'bile_insufficiency',
          indicators: ['question_41_high', 'question_42_high', 'question_43_high'],
          priority: 4,
          interventions: ['bile_salts', 'gallbladder_support', 'fat_soluble_vitamins']
        }
      ]
    },
    updatedAt: new Date()
  };

  if (existingAlgorithm) {
    await prisma.fmScoringAlgorithm.update({
      where: { id: existingAlgorithm.id },
      data: algorithmData
    });
  } else {
    await prisma.fmScoringAlgorithm.create({
      data: algorithmData
    });
  }

  const questionCount = await prisma.fmDigestiveQuestion.count({
    where: { isActive: true }
  });

  console.log(`✅ Successfully seeded ${questionCount} functional medicine questions`);
  
  // Print category breakdown
  const categories = await prisma.fmDigestiveQuestion.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: { id: true }
  });

  console.log('📊 Questions by category:');
  categories.forEach(category => {
    console.log(`  ${category.category}: ${category._count.id} questions`);
  });

  console.log('✅ Functional Medicine Questions seeding complete!');
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFunctionalMedicineQuestions()
    .catch((e) => {
      console.error('❌ Error seeding functional medicine questions:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
