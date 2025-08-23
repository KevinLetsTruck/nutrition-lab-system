#!/usr/bin/env node

/**
 * Reorganizes screening questions to create a more natural flow
 * by distributing seed oil questions throughout rather than clustering them
 */

const fs = require('fs');
const path = require('path');

// Define the new question order with better flow
// This creates logical groupings and intersperses seed oil questions naturally
const newQuestionOrder = [
  // Start with general health status
  "SCR001", // Overall energy level
  "SCR015", // PRIMARY health concern (text)
  "SCR016", // How long experiencing concern
  "SCR017", // Impact on daily activities
  
  // Sleep and recovery
  "SCR003", // Sleep quality
  "SCR030", // Hours of sleep
  "SCR031", // Feel refreshed after sleep
  "SCR032", // Time to feel awake
  
  // Energy patterns throughout the day
  "SCR025", // Energy when waking
  "SCR026", // Energy crashes
  "SCR027", // When lowest energy
  "SCR028", // Time between meals (metabolic flexibility)
  
  // Digestive health
  "SCR002", // Bloating/discomfort
  "SCR_SO01", // Fried foods frequency (natural fit with digestive)
  
  // Stress and mental health
  "SCR006", // Anxiety/overwhelm
  "SCR_SO03", // Brain fog after fried foods (fits with mental symptoms)
  
  // What helps/worsens symptoms
  "SCR018", // What makes symptoms better
  "SCR019", // What makes symptoms worse
  
  // Lifestyle and diet habits
  "SCR_SO02", // Cooking oils used at home
  "SCR029", // Need caffeine
  "SCR_SO04", // Packaged/processed foods frequency
  
  // Physical symptoms
  "SCR004", // Joint pain
  "SCR_SO05", // Skin issues with fried foods
  
  // Weight and metabolic
  "SCR005", // Weight changes
  "SCR_SO06", // Low-fat diet history
  
  // Treatment history
  "SCR020", // Treatments tried
  "SCR023", // Number of practitioners seen
  
  // Health trajectory
  "SCR021", // Health compared to 1 year ago
  "SCR022", // Symptom patterns through day
  
  // Health awareness and goals
  "SCR_SO07", // Check labels for seed oils
  "SCR_SO08", // Noticed improvement avoiding seed oils
  "SCR024", // Health goal priority
  
  // Continue with remaining questions...
];

async function reorganizeQuestions() {
  try {
    const filePath = path.join(__dirname, '../lib/assessment/questions/screening-questions.ts');
    const backupPath = path.join(__dirname, '../lib/assessment/questions/screening-questions.backup.ts');
    
    // Create backup
    console.log('📋 Creating backup of screening questions...');
    fs.copyFileSync(filePath, backupPath);
    console.log('✅ Backup created at:', backupPath);
    
    // Read the current file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse questions
    console.log('\n🔍 Parsing questions...');
    const questionRegex = /\{[\s\S]*?"id":\s*"(SCR[^"]+)"[\s\S]*?\}(?=,\s*\{|\s*\]|\s*\.\.\.)/g;
    const questions = new Map();
    let match;
    
    while ((match = questionRegex.exec(content)) !== null) {
      const questionId = match[1];
      const questionObj = match[0];
      questions.set(questionId, questionObj);
    }
    
    console.log(`✅ Found ${questions.size} questions`);
    
    // Log seed oil questions for visibility
    const seedOilQuestions = Array.from(questions.keys()).filter(id => id.includes('_SO'));
    console.log(`\n🛢️  Seed oil questions found: ${seedOilQuestions.length}`);
    seedOilQuestions.forEach(id => console.log(`   - ${id}`));
    
    // Build new questions array in the specified order
    console.log('\n🔄 Reorganizing questions...');
    const reorganizedQuestions = [];
    const usedQuestions = new Set();
    
    // Add questions in new order
    for (const questionId of newQuestionOrder) {
      if (questions.has(questionId)) {
        reorganizedQuestions.push(questions.get(questionId));
        usedQuestions.add(questionId);
      } else {
        console.warn(`⚠️  Question ${questionId} not found`);
      }
    }
    
    // Add any remaining questions not in our order list
    for (const [questionId, questionObj] of questions) {
      if (!usedQuestions.has(questionId) && !questionId.includes('additionalScreeningQuestionsPart2')) {
        reorganizedQuestions.push(questionObj);
        usedQuestions.add(questionId);
      }
    }
    
    // Rebuild the file content
    const newContent = `import { AssessmentQuestion } from '../types';
import { additionalScreeningQuestionsPart2 } from './screening-questions-additional';

export const screeningQuestions: AssessmentQuestion[] = [
${reorganizedQuestions.join(',\n')},
  // Include all additional screening questions (SCR033-SCR075)
  ...additionalScreeningQuestionsPart2
];
`;
    
    // Write the new file
    console.log('\n💾 Writing reorganized questions...');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log('\n✅ Questions reorganized successfully!');
    console.log('\n📊 New question flow:');
    console.log('   1. General health status and chief complaint');
    console.log('   2. Sleep and recovery patterns');
    console.log('   3. Energy and metabolic flexibility');
    console.log('   4. Digestive health (with relevant diet question)');
    console.log('   5. Mental health (with dietary connection)');
    console.log('   6. Lifestyle and dietary habits (integrated)');
    console.log('   7. Physical symptoms and connections');
    console.log('   8. Treatment history and goals');
    console.log('\n✨ Seed oil questions are now naturally integrated throughout!');
    
  } catch (error) {
    console.error('❌ Error reorganizing questions:', error.message);
    process.exit(1);
  }
}

// Run the reorganization
reorganizeQuestions();
