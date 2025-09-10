/**
 * Admin Endpoint: Seed Functional Medicine Questions
 *
 * This endpoint seeds the production database with all 45 FM assessment questions
 * Can be called from browser to populate production database
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Import the complete question set
const DIGESTIVE_QUESTIONS = [
  // ====== UPPER GI FUNCTION (12 QUESTIONS) ======
  {
    id: 1,
    category: 'upper_gi',
    subcategory: 'stomach_acid_production',
    questionText:
      'How often do you experience belching, gas, or bloating within 30 minutes of eating?',
    questionContext: 'This occurs immediately after eating, not hours later',
    clinicalSignificance:
      'Primary indicator of hypochlorhydria (low stomach acid) - fundamental to all digestion',
    scaleType: 'frequency',
    diagnosticWeight: 2.8,
    symptomType: 'root_cause',
    conditionAssociations: ['hypochlorhydria', 'SIBO', 'malabsorption'],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 1,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 2,
    category: 'upper_gi',
    subcategory: 'stomach_acid_production',
    questionText:
      'How often do you feel excessively full after normal-sized meals?',
    questionContext: 'Feeling like food just sits in your stomach',
    clinicalSignificance:
      'Indicates gastroparesis or severe hypochlorhydria affecting gastric emptying',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'gastroparesis',
      'hypochlorhydria',
      'vagal_dysfunction',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 2,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 3,
    category: 'upper_gi',
    subcategory: 'stomach_acid_production',
    questionText:
      'How often do you experience heartburn or acid reflux symptoms?',
    questionContext: 'Burning sensation in chest, throat, or regurgitation',
    clinicalSignificance:
      'Paradoxically often indicates LOW stomach acid, not high - critical diagnostic distinction',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    symptomType: 'primary_symptom',
    conditionAssociations: ['hypochlorhydria', 'hiatal_hernia', 'SIBO'],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 3,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 4,
    category: 'upper_gi',
    subcategory: 'enzyme_function',
    questionText:
      'How often do you see undigested food particles in your stool?',
    questionContext:
      'Visible pieces of vegetables, nuts, seeds, or other foods',
    clinicalSignificance:
      'Direct indicator of pancreatic enzyme insufficiency or severe hypochlorhydria',
    scaleType: 'frequency',
    diagnosticWeight: 2.9,
    symptomType: 'root_cause',
    conditionAssociations: [
      'pancreatic_insufficiency',
      'hypochlorhydria',
      'malabsorption',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 4,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 5,
    category: 'upper_gi',
    subcategory: 'enzyme_function',
    questionText:
      'How often do you experience stomach upset when taking vitamins or supplements?',
    questionContext:
      'Nausea, cramping, or discomfort specifically from supplements',
    clinicalSignificance:
      'Indicates inadequate stomach acid for mineral absorption and supplement breakdown',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    symptomType: 'primary_symptom',
    conditionAssociations: ['hypochlorhydria', 'mineral_malabsorption'],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 5,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 6,
    category: 'upper_gi',
    subcategory: 'enzyme_function',
    questionText: 'How often do you lose your appetite for protein/meat?',
    questionContext: 'Decreased desire for or aversion to protein-rich foods',
    clinicalSignificance:
      'Classic sign of protein maldigestion due to low HCl and pepsin production',
    scaleType: 'frequency',
    diagnosticWeight: 2.6,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'hypochlorhydria',
      'protein_maldigestion',
      'B12_deficiency',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 6,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 7,
    category: 'upper_gi',
    subcategory: 'emf_stress_impact',
    questionText:
      'How often do you eat while using electronic devices (phone, computer, TV)?',
    questionContext: 'Multitasking during meals with digital devices',
    clinicalSignificance:
      'EMF exposure during eating disrupts vagal nerve function and digestive enzyme production',
    scaleType: 'frequency',
    diagnosticWeight: 1.8,
    symptomType: 'modifier',
    conditionAssociations: [
      'vagal_dysfunction',
      'emf_sensitivity',
      'stress_digestion',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'emf',
    displayOrder: 7,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 8,
    category: 'upper_gi',
    subcategory: 'emf_stress_impact',
    questionText:
      'How often do you experience digestive symptoms that worsen during high-stress periods?',
    questionContext:
      'Digestive problems increase during work deadlines, life changes, or emotional stress',
    clinicalSignificance:
      'HPA axis dysfunction directly impairs digestive function through cortisol and autonomic disruption',
    scaleType: 'frequency',
    diagnosticWeight: 2.1,
    symptomType: 'modifier',
    conditionAssociations: [
      'adrenal_dysfunction',
      'vagal_dysfunction',
      'cortisol_dysregulation',
    ],
    isTraditional: true,
    isModernInsight: false,
    environmentalFactor: 'stress',
    displayOrder: 8,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 9,
    category: 'upper_gi',
    subcategory: 'emf_stress_impact',
    questionText:
      'How often do you eat meals in environments with WiFi, cell towers, or high EMF exposure?',
    questionContext:
      'Restaurants, offices, or areas with multiple wireless devices',
    clinicalSignificance:
      'Modern insight: EMF exposure during meals disrupts cellular energy production needed for digestion',
    scaleType: 'frequency',
    diagnosticWeight: 1.6,
    symptomType: 'modifier',
    conditionAssociations: [
      'emf_sensitivity',
      'mitochondrial_dysfunction',
      'cellular_stress',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'emf',
    displayOrder: 9,
    requiredLevel: 'optional',
    reverseScoring: false,
  },
  {
    id: 10,
    category: 'upper_gi',
    subcategory: 'circadian_timing',
    questionText:
      'How often do you feel like skipping breakfast or have no morning appetite?',
    questionContext:
      'Lack of hunger or desire for food in the first 2 hours after waking',
    clinicalSignificance:
      'Indicates circadian disruption affecting natural cortisol rhythm and digestive enzyme cycling',
    scaleType: 'frequency',
    diagnosticWeight: 2.0,
    symptomType: 'modifier',
    conditionAssociations: [
      'circadian_disruption',
      'adrenal_dysfunction',
      'cortisol_dysregulation',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'circadian',
    displayOrder: 10,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 11,
    category: 'upper_gi',
    subcategory: 'circadian_timing',
    questionText:
      'How often do you experience worse digestion when eating late at night?',
    questionContext: 'Digestive symptoms increase with meals after 8 PM',
    clinicalSignificance:
      'Natural digestive enzyme production decreases at night; late eating disrupts circadian metabolism',
    scaleType: 'frequency',
    diagnosticWeight: 1.9,
    symptomType: 'modifier',
    conditionAssociations: ['circadian_disruption', 'metabolic_dysfunction'],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'circadian',
    displayOrder: 11,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 12,
    category: 'upper_gi',
    subcategory: 'circadian_timing',
    questionText:
      'How often do you experience digestive symptoms that vary with seasonal changes?',
    questionContext:
      'Digestion worse in winter, better in summer, or changing with daylight patterns',
    clinicalSignificance:
      'Indicates light-dependent circadian rhythm disruption affecting digestive hormone cycling',
    scaleType: 'frequency',
    diagnosticWeight: 1.7,
    symptomType: 'modifier',
    conditionAssociations: [
      'seasonal_affective_disorder',
      'circadian_disruption',
      'vitamin_d_deficiency',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'circadian',
    displayOrder: 12,
    requiredLevel: 'optional',
    reverseScoring: false,
  },

  // ====== SMALL INTESTINE HEALTH (15 QUESTIONS) ======
  {
    id: 13,
    category: 'small_intestine',
    subcategory: 'sibo_bacterial_overgrowth',
    questionText:
      'How often do you experience bloating 1-3 hours after eating (especially carbohydrates)?',
    questionContext:
      'Delayed bloating that occurs well after the meal, particularly with starches, sugars, or fiber',
    clinicalSignificance:
      'Hallmark sign of SIBO - bacterial fermentation in small intestine creates delayed gas production',
    scaleType: 'frequency',
    diagnosticWeight: 3.0,
    symptomType: 'root_cause',
    conditionAssociations: [
      'SIBO',
      'bacterial_overgrowth',
      'carbohydrate_malabsorption',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 13,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 14,
    category: 'small_intestine',
    subcategory: 'sibo_bacterial_overgrowth',
    questionText:
      'How often do you experience improvement in digestive symptoms when fasting?',
    questionContext:
      'Symptoms decrease or disappear when not eating for 12+ hours',
    clinicalSignificance:
      'Classic SIBO pattern - removing bacterial fuel (food) reduces fermentation and symptoms',
    scaleType: 'frequency',
    diagnosticWeight: 2.8,
    symptomType: 'root_cause',
    conditionAssociations: ['SIBO', 'bacterial_overgrowth'],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 14,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 15,
    category: 'small_intestine',
    subcategory: 'sibo_bacterial_overgrowth',
    questionText:
      'How often do fermented foods (kombucha, sauerkraut, yogurt) make you feel worse?',
    questionContext:
      'Increased bloating, gas, or digestive discomfort after eating fermented foods',
    clinicalSignificance:
      'Indicates histamine intolerance or existing bacterial overgrowth - adding more bacteria worsens symptoms',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'SIBO',
      'histamine_intolerance',
      'bacterial_overgrowth',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 15,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 16,
    category: 'small_intestine',
    subcategory: 'food_sensitivity_immune',
    questionText:
      'How often do specific foods make you feel tired, brain foggy, or mentally unclear?',
    questionContext:
      'Mental/cognitive symptoms within hours of eating certain foods',
    clinicalSignificance:
      'Indicates intestinal permeability allowing food proteins to trigger neuroinflammation',
    scaleType: 'frequency',
    diagnosticWeight: 2.7,
    symptomType: 'root_cause',
    conditionAssociations: [
      'leaky_gut',
      'food_sensitivity',
      'neuroinflammation',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 16,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 17,
    category: 'small_intestine',
    subcategory: 'food_sensitivity_immune',
    questionText:
      'How often do you experience skin reactions (rashes, eczema, acne) related to food intake?',
    questionContext:
      'Skin problems that correlate with eating specific foods or food categories',
    clinicalSignificance:
      'Gut-skin axis dysfunction indicating intestinal permeability and systemic inflammation',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'leaky_gut',
      'food_sensitivity',
      'systemic_inflammation',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 17,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 18,
    category: 'small_intestine',
    subcategory: 'food_sensitivity_immune',
    questionText:
      "How often do you crave foods that you suspect don't agree with you?",
    questionContext:
      'Strong cravings for foods that seem to cause digestive or other symptoms',
    clinicalSignificance:
      'Indicates food addiction patterns often associated with leaky gut and opioid-like food reactions',
    scaleType: 'frequency',
    diagnosticWeight: 2.1,
    symptomType: 'secondary_symptom',
    conditionAssociations: ['food_addiction', 'leaky_gut', 'opioid_excess'],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 18,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 19,
    category: 'small_intestine',
    subcategory: 'intestinal_permeability',
    questionText:
      'How often do you experience joint pain or muscle aches that seem food-related?',
    questionContext:
      'Joint or muscle pain that increases after eating or correlates with certain foods',
    clinicalSignificance:
      'Classic sign of intestinal permeability - food proteins triggering autoimmune-like inflammation',
    scaleType: 'frequency',
    diagnosticWeight: 2.9,
    symptomType: 'root_cause',
    conditionAssociations: [
      'leaky_gut',
      'autoimmune_reactivity',
      'systemic_inflammation',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 19,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 20,
    category: 'small_intestine',
    subcategory: 'intestinal_permeability',
    questionText:
      'How often do you have seasonal allergies or environmental sensitivities?',
    questionContext:
      'Reactions to pollen, dust, chemicals, or environmental factors',
    clinicalSignificance:
      'Indicates compromised immune barrier function - often correlates with intestinal permeability',
    scaleType: 'frequency',
    diagnosticWeight: 2.0,
    symptomType: 'secondary_symptom',
    conditionAssociations: [
      'leaky_gut',
      'immune_dysregulation',
      'mast_cell_activation',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 20,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 21,
    category: 'small_intestine',
    subcategory: 'intestinal_permeability',
    questionText:
      'How often do you experience mood changes (anxiety, depression, irritability) related to eating?',
    questionContext:
      'Emotional or mental symptoms that occur within hours of eating',
    clinicalSignificance:
      'Gut-brain axis disruption indicating intestinal permeability affecting neurotransmitter production',
    scaleType: 'frequency',
    diagnosticWeight: 2.6,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'leaky_gut',
      'gut_brain_axis_dysfunction',
      'neurotransmitter_imbalance',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 21,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 22,
    category: 'small_intestine',
    subcategory: 'seed_oil_inflammation',
    questionText:
      'How often do you consume foods cooked in vegetable oils (canola, soybean, corn oil)?',
    questionContext:
      'Restaurant food, processed foods, or home cooking with industrial seed oils',
    clinicalSignificance:
      'Modern insight: Seed oils create intestinal inflammation and disrupt omega-6/3 ratios',
    scaleType: 'frequency',
    diagnosticWeight: 2.3,
    symptomType: 'root_cause',
    conditionAssociations: [
      'seed_oil_inflammation',
      'omega_imbalance',
      'intestinal_inflammation',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'processed_foods',
    displayOrder: 22,
    requiredLevel: 'required',
    reverseScoring: false,
  },
  {
    id: 23,
    category: 'small_intestine',
    subcategory: 'seed_oil_inflammation',
    questionText:
      'How often do you experience inflammation-type symptoms after eating processed foods?',
    questionContext:
      'Joint pain, skin issues, or digestive inflammation after packaged/processed foods',
    clinicalSignificance:
      'Direct inflammatory response to processed food additives and industrial oils',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'processed_food_sensitivity',
      'systemic_inflammation',
      'additive_sensitivity',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'processed_foods',
    displayOrder: 23,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 24,
    category: 'small_intestine',
    subcategory: 'seed_oil_inflammation',
    questionText:
      'How often do you consume foods with artificial preservatives, colors, or flavor enhancers?',
    questionContext:
      'Foods with ingredients like MSG, artificial colors, BHT, sodium benzoate, etc.',
    clinicalSignificance:
      'Chemical additives disrupt gut barrier function and trigger immune responses',
    scaleType: 'frequency',
    diagnosticWeight: 1.9,
    symptomType: 'modifier',
    conditionAssociations: [
      'chemical_sensitivity',
      'gut_barrier_dysfunction',
      'immune_activation',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'processed_foods',
    displayOrder: 24,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 25,
    category: 'small_intestine',
    subcategory: 'malabsorption_advanced',
    questionText:
      'How often do you experience numbness, tingling, or nerve-related symptoms?',
    questionContext:
      'Peripheral neuropathy, pins and needles, or nerve dysfunction',
    clinicalSignificance:
      'Indicates B12, B6, or folate malabsorption - serious small intestine dysfunction',
    scaleType: 'frequency',
    diagnosticWeight: 2.8,
    symptomType: 'root_cause',
    conditionAssociations: [
      'B_vitamin_malabsorption',
      'pernicious_anemia',
      'small_intestine_damage',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 25,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 26,
    category: 'small_intestine',
    subcategory: 'malabsorption_advanced',
    questionText:
      'How often do your fingernails chip, peel, crack, or have white spots?',
    questionContext: 'Poor nail quality, ridges, white spots, or easy breaking',
    clinicalSignificance:
      'Indicates zinc, protein, and mineral malabsorption affecting collagen synthesis',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'zinc_deficiency',
      'protein_malabsorption',
      'mineral_malabsorption',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 26,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 27,
    category: 'small_intestine',
    subcategory: 'malabsorption_advanced',
    questionText:
      'How often do you experience muscle cramps, especially in legs or feet?',
    questionContext:
      'Muscle cramps, charlie horses, or muscle spasms particularly at night',
    clinicalSignificance:
      'Indicates magnesium, potassium, or calcium malabsorption - critical mineral deficiencies',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'magnesium_deficiency',
      'electrolyte_imbalance',
      'mineral_malabsorption',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 27,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },

  // ====== LARGE INTESTINE FUNCTION (10 QUESTIONS) ======
  {
    id: 28,
    category: 'large_intestine',
    subcategory: 'bowel_movement_patterns',
    questionText:
      'How often do you have fewer than one complete bowel movement per day?',
    questionContext: 'Not having at least one substantial bowel movement daily',
    clinicalSignificance:
      'Constipation indicates compromised colon function and increased toxin reabsorption',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    symptomType: 'root_cause',
    conditionAssociations: ['constipation', 'colon_dysfunction', 'dysbiosis'],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 28,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 29,
    category: 'large_intestine',
    subcategory: 'bowel_movement_patterns',
    questionText:
      'How often are your stools not well-formed (too loose, too hard, or irregular shape)?',
    questionContext:
      'Bristol stool chart types 1-2 (too hard) or 6-7 (too loose), not type 3-5 (ideal)',
    clinicalSignificance:
      'Stool consistency reflects colon transit time, water absorption, and microbiome balance',
    scaleType: 'frequency',
    diagnosticWeight: 2.3,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'IBS',
      'dysbiosis',
      'malabsorption',
      'inflammation',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 29,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 30,
    category: 'large_intestine',
    subcategory: 'bowel_movement_patterns',
    questionText: 'How often do you experience excessive gas with strong odor?',
    questionContext:
      "Foul-smelling gas that's socially disruptive or unusually strong",
    clinicalSignificance:
      'Indicates pathogenic bacterial overgrowth producing sulfur compounds and toxins',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'pathogenic_overgrowth',
      'sulfur_reducing_bacteria',
      'dysbiosis',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 30,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 31,
    category: 'large_intestine',
    subcategory: 'microbiome_disruption',
    questionText: 'How often have you taken antibiotics in the past 2 years?',
    questionContext:
      'Any antibiotic use including oral, topical, or IV antibiotics',
    clinicalSignificance:
      'Antibiotics severely disrupt microbiome diversity and can create long-term dysbiosis',
    scaleType: 'quantity',
    diagnosticWeight: 2.7,
    symptomType: 'root_cause',
    conditionAssociations: [
      'antibiotic_associated_dysbiosis',
      'candida_overgrowth',
      'C_diff_risk',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 31,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 32,
    category: 'large_intestine',
    subcategory: 'microbiome_disruption',
    questionText:
      'How often do you experience yeast-related symptoms that worsen with sugar or alcohol?',
    questionContext:
      'Yeast infections, thrush, or other fungal issues that flare with sugar intake',
    clinicalSignificance:
      'Indicates candida overgrowth often following antibiotic use or high sugar diet',
    scaleType: 'frequency',
    diagnosticWeight: 2.6,
    symptomType: 'root_cause',
    conditionAssociations: [
      'candida_overgrowth',
      'fungal_dysbiosis',
      'sugar_sensitivity',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 32,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 33,
    category: 'large_intestine',
    subcategory: 'modern_dysbiosis_factors',
    questionText: 'How often do you feel worse in moldy or musty environments?',
    questionContext:
      'Symptoms worsen in water-damaged buildings, basements, or moldy areas',
    clinicalSignificance:
      'Indicates mold sensitivity often associated with gut dysbiosis and mycotoxin burden',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    symptomType: 'modifier',
    conditionAssociations: [
      'mold_sensitivity',
      'mycotoxin_exposure',
      'biotoxin_illness',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'mold',
    displayOrder: 33,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 34,
    category: 'large_intestine',
    subcategory: 'modern_dysbiosis_factors',
    questionText:
      'How often do you consume artificial sweeteners or sugar substitutes?',
    questionContext:
      'Aspartame, sucralose, saccharin, acesulfame K, or other artificial sweeteners',
    clinicalSignificance:
      'Modern insight: Artificial sweeteners disrupt gut microbiome and glucose metabolism',
    scaleType: 'frequency',
    diagnosticWeight: 2.1,
    symptomType: 'modifier',
    conditionAssociations: [
      'microbiome_disruption',
      'glucose_intolerance',
      'dysbiosis',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'processed_foods',
    displayOrder: 34,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 35,
    category: 'large_intestine',
    subcategory: 'modern_dysbiosis_factors',
    questionText:
      'How often do you experience digestive symptoms that worsen with stress or poor sleep?',
    questionContext:
      'Gut symptoms directly correlate with stress levels or sleep quality',
    clinicalSignificance:
      'HPA axis and circadian disruption directly affects gut microbiome composition and function',
    scaleType: 'frequency',
    diagnosticWeight: 2.3,
    symptomType: 'modifier',
    conditionAssociations: [
      'stress_induced_dysbiosis',
      'circadian_microbiome_disruption',
      'HPA_axis_dysfunction',
    ],
    isTraditional: true,
    isModernInsight: false,
    environmentalFactor: 'stress',
    displayOrder: 35,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 36,
    category: 'large_intestine',
    subcategory: 'modern_dysbiosis_factors',
    questionText:
      'How often do you consume glyphosate-exposed foods (non-organic grains, legumes)?',
    questionContext:
      'Conventional wheat, oats, beans, or other non-organic crops commonly sprayed with glyphosate',
    clinicalSignificance:
      'Modern insight: Glyphosate acts as antibiotic, disrupting beneficial gut bacteria',
    scaleType: 'frequency',
    diagnosticWeight: 2.0,
    symptomType: 'modifier',
    conditionAssociations: [
      'glyphosate_exposure',
      'microbiome_disruption',
      'leaky_gut',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'chemical_toxins',
    displayOrder: 36,
    requiredLevel: 'optional',
    reverseScoring: false,
  },
  {
    id: 37,
    category: 'large_intestine',
    subcategory: 'pathogenic_overgrowth',
    questionText: 'How often do you experience anal itching or discomfort?',
    questionContext: 'Itching, burning, or discomfort around the anal area',
    clinicalSignificance:
      'Often indicates candida, pinworm, or other pathogenic overgrowth in large intestine',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'candida_overgrowth',
      'parasites',
      'pathogenic_bacteria',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 37,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },

  // ====== LIVER AND DETOXIFICATION (8 QUESTIONS) ======
  {
    id: 38,
    category: 'liver_detox',
    subcategory: 'detoxification_capacity',
    questionText:
      'How often are you sensitive to chemicals, perfumes, or strong smells?',
    questionContext:
      'Reactions to cleaning products, fragrances, paint, or chemical odors',
    clinicalSignificance:
      'Indicates impaired Phase I detoxification creating chemical sensitivity and toxin accumulation',
    scaleType: 'frequency',
    diagnosticWeight: 2.8,
    symptomType: 'root_cause',
    conditionAssociations: [
      'phase1_detox_impairment',
      'chemical_sensitivity',
      'liver_congestion',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 38,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 39,
    category: 'liver_detox',
    subcategory: 'detoxification_capacity',
    questionText:
      'How often do you experience headaches, fatigue, or nausea with chemical exposure?',
    questionContext:
      'Physical symptoms when exposed to cleaning products, new furniture, or chemical environments',
    clinicalSignificance:
      'Direct toxic burden symptoms indicating overwhelmed detoxification pathways',
    scaleType: 'frequency',
    diagnosticWeight: 2.6,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'toxic_burden',
      'detox_pathway_dysfunction',
      'chemical_overload',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 39,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 40,
    category: 'liver_detox',
    subcategory: 'detoxification_capacity',
    questionText:
      'How often do you have difficulty tolerating alcohol (even small amounts)?',
    questionContext:
      'Hangover symptoms, nausea, or feeling unwell from minimal alcohol consumption',
    clinicalSignificance:
      'Indicates compromised alcohol dehydrogenase function and impaired Phase II detoxification',
    scaleType: 'frequency',
    diagnosticWeight: 2.5,
    symptomType: 'primary_symptom',
    conditionAssociations: [
      'alcohol_intolerance',
      'aldehyde_toxicity',
      'phase2_detox_impairment',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 40,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 41,
    category: 'liver_detox',
    subcategory: 'bile_production_flow',
    questionText:
      'How often do you experience nausea or stomach upset after eating fatty foods?',
    questionContext:
      'Nausea, bloating, or discomfort specifically after eating nuts, oils, or fatty meals',
    clinicalSignificance:
      'Indicates inadequate bile production or bile flow obstruction affecting fat digestion',
    scaleType: 'frequency',
    diagnosticWeight: 2.7,
    symptomType: 'root_cause',
    conditionAssociations: [
      'bile_insufficiency',
      'gallbladder_dysfunction',
      'fat_malabsorption',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 41,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 42,
    category: 'liver_detox',
    subcategory: 'bile_production_flow',
    questionText:
      'How often do you experience pain between your shoulder blades, especially after eating?',
    questionContext:
      'Referred pain in the upper back, particularly after fatty meals',
    clinicalSignificance:
      'Classic gallbladder referral pain indicating bile stasis or gallbladder dysfunction',
    scaleType: 'frequency',
    diagnosticWeight: 2.9,
    symptomType: 'root_cause',
    conditionAssociations: [
      'gallbladder_dysfunction',
      'bile_stasis',
      'gallstones',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 42,
    requiredLevel: 'standard',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 43,
    category: 'liver_detox',
    subcategory: 'bile_production_flow',
    questionText: 'How often do you have light-colored or floating stools?',
    questionContext:
      'Stools that are pale, clay-colored, or consistently float on water',
    clinicalSignificance:
      'Indicates fat malabsorption due to insufficient bile - serious biliary dysfunction',
    scaleType: 'frequency',
    diagnosticWeight: 3.0,
    symptomType: 'root_cause',
    conditionAssociations: [
      'bile_insufficiency',
      'fat_malabsorption',
      'biliary_obstruction',
    ],
    isTraditional: true,
    isModernInsight: false,
    displayOrder: 43,
    requiredLevel: 'required',
    reverseScoring: false,
    environmentalFactor: null,
  },
  {
    id: 44,
    category: 'liver_detox',
    subcategory: 'environmental_toxin_load',
    questionText:
      'How often are you exposed to mold, water damage, or musty environments?',
    questionContext:
      'Living or working in buildings with water damage, visible mold, or musty odors',
    clinicalSignificance:
      'Modern insight: Mycotoxin exposure overwhelms liver detox capacity and creates biotoxin illness',
    scaleType: 'frequency',
    diagnosticWeight: 2.4,
    symptomType: 'modifier',
    conditionAssociations: [
      'mycotoxin_exposure',
      'biotoxin_illness',
      'mold_sensitivity',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'mold',
    displayOrder: 44,
    requiredLevel: 'standard',
    reverseScoring: false,
  },
  {
    id: 45,
    category: 'liver_detox',
    subcategory: 'environmental_toxin_load',
    questionText:
      'How often do you live or work in areas with high air pollution, industrial chemicals, or pesticides?',
    questionContext:
      'Urban areas, agricultural regions, or industrial zones with chemical exposure',
    clinicalSignificance:
      'Environmental toxin burden exceeds liver capacity creating systemic inflammation and dysfunction',
    scaleType: 'frequency',
    diagnosticWeight: 2.2,
    symptomType: 'modifier',
    conditionAssociations: [
      'environmental_toxicity',
      'chemical_burden',
      'systemic_inflammation',
    ],
    isTraditional: false,
    isModernInsight: true,
    environmentalFactor: 'chemical_toxins',
    displayOrder: 45,
    requiredLevel: 'optional',
    reverseScoring: false,
  },
];

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    console.log(
      '🌱 Admin seeding: Starting to populate production database with 45 FM questions...'
    );

    // Simple admin check - verify this is being called in production environment
    const origin =
      request.headers.get('origin') || request.headers.get('referer') || '';
    const isProduction =
      origin.includes('nutrition-lab-system-production-0fa7.up.railway.app') ||
      origin.includes('railway.app');

    if (!isProduction && process.env.NODE_ENV === 'production') {
      console.log('❌ Admin seeding blocked: Not from production domain');
      return NextResponse.json(
        { error: 'This endpoint can only be called from production domain' },
        { status: 403 }
      );
    }

    // First, deactivate all existing questions
    await prisma.fmDigestiveQuestion.updateMany({
      data: { isActive: false },
    });

    console.log('📋 Deactivated existing questions');

    // Insert or update all 45 questions
    const questionPromises = DIGESTIVE_QUESTIONS.map(async question => {
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
          updatedAt: new Date(),
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
          isActive: true,
        },
      });
    });

    await Promise.all(questionPromises);

    // Verify seeding
    const totalCount = await prisma.fmDigestiveQuestion.count({
      where: { isActive: true },
    });

    console.log(
      `✅ Successfully seeded ${totalCount} functional medicine questions`
    );

    // Print category breakdown
    const categories = await prisma.fmDigestiveQuestion.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { category: 'asc' },
    });

    const categoryBreakdown: Record<string, number> = {};
    categories.forEach(category => {
      categoryBreakdown[category.category] = category._count.id;
    });

    console.log('📊 Questions by category:', categoryBreakdown);

    // Validate diagnostic weights
    const weightedQuestions = await prisma.fmDigestiveQuestion.count({
      where: {
        isActive: true,
        diagnosticWeight: { gte: 2.5 },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Production database seeded successfully!',
      data: {
        totalQuestions: totalCount,
        expectedQuestions: 45,
        categories: categoryBreakdown,
        highImpactQuestions: weightedQuestions,
        status: totalCount === 45 ? 'COMPLETE' : 'PARTIAL',
      },
    });
  } catch (error) {
    console.error('❌ Admin seeding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed questions',
        details:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    // Simple status check endpoint
    const totalCount = await prisma.fmDigestiveQuestion.count({
      where: { isActive: true },
    });

    const categories = await prisma.fmDigestiveQuestion.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { category: 'asc' },
    });

    const categoryBreakdown: Record<string, number> = {};
    categories.forEach(category => {
      categoryBreakdown[category.category] = category._count.id;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions: totalCount,
        expectedQuestions: 45,
        categories: categoryBreakdown,
        status:
          totalCount === 45
            ? 'COMPLETE'
            : totalCount === 0
              ? 'EMPTY'
              : 'PARTIAL',
        needsSeeding: totalCount !== 45,
      },
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
