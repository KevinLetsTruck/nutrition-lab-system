#!/usr/bin/env node

/**
 * Simple reordering of screening questions to distribute seed oil questions naturally
 */

const fs = require('fs');
const path = require('path');

async function reorderQuestions() {
  try {
    const filePath = path.join(__dirname, '../lib/assessment/questions/screening-questions.ts');
    const backupPath = path.join(__dirname, '../lib/assessment/questions/screening-questions.backup2.ts');
    
    // Create backup
    console.log('📋 Creating backup...');
    fs.copyFileSync(filePath, backupPath);
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the questions array content (between the brackets)
    const match = content.match(/export const screeningQuestions: AssessmentQuestion\[\] = \[([\s\S]*?)\n  \.\.\.additionalScreeningQuestionsPart2\n\];/);
    
    if (!match) {
      throw new Error('Could not parse questions array');
    }
    
    const questionsContent = match[1];
    
    // Split into individual question objects
    const questionBlocks = [];
    let currentBlock = '';
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < questionsContent.length; i++) {
      const char = questionsContent[i];
      
      if (escapeNext) {
        escapeNext = false;
        currentBlock += char;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        currentBlock += char;
        continue;
      }
      
      if (char === '"' && !inString) {
        inString = true;
      } else if (char === '"' && inString) {
        inString = false;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      currentBlock += char;
      
      if (braceCount === 0 && char === '}') {
        // Found end of a question object
        const nextComma = questionsContent.indexOf(',', i);
        const nextBrace = questionsContent.indexOf('{', i);
        
        if (nextComma !== -1 && (nextBrace === -1 || nextComma < nextBrace)) {
          currentBlock += questionsContent.substring(i + 1, nextComma + 1);
          i = nextComma;
        }
        
        questionBlocks.push(currentBlock.trim());
        currentBlock = '';
      }
    }
    
    // Parse question IDs from blocks
    const questionsMap = new Map();
    questionBlocks.forEach(block => {
      const idMatch = block.match(/"id":\s*"([^"]+)"/);
      if (idMatch) {
        questionsMap.set(idMatch[1], block);
      }
    });
    
    console.log(`\n📊 Found ${questionsMap.size} questions`);
    
    // Define new order - distribute seed oil questions naturally
    const newOrder = [
      "SCR001",    // Overall energy
      "SCR002",    // Bloating (digestive)
      "SCR003",    // Sleep quality
      "SCR_SO01",  // Fried foods (fits with digestive)
      "SCR004",    // Joint pain
      "SCR005",    // Weight changes
      "SCR006",    // Anxiety
      "SCR_SO03",  // Brain fog after fried foods (fits with mental)
      "SCR_SO02",  // Cooking oils at home
      "SCR_SO04",  // Processed foods
      "SCR_SO05",  // Skin issues with fried foods
      "SCR_SO06",  // Low-fat diet history
      "SCR_SO07",  // Check labels
      "SCR_SO08",  // Improvement avoiding oils
    ];
    
    // Build reorganized content
    const reorganized = [];
    const used = new Set();
    
    // Add in new order
    for (const id of newOrder) {
      if (questionsMap.has(id)) {
        reorganized.push(questionsMap.get(id));
        used.add(id);
      }
    }
    
    // Add any remaining questions
    for (const [id, block] of questionsMap) {
      if (!used.has(id)) {
        reorganized.push(block);
      }
    }
    
    // Rebuild file
    const newContent = `import { AssessmentQuestion } from '../types';
import { additionalScreeningQuestionsPart2 } from './screening-questions-additional';

export const screeningQuestions: AssessmentQuestion[] = [
${reorganized.join('\n')}
  // Include all additional screening questions (SCR033-SCR075)
  ...additionalScreeningQuestionsPart2
];
`;
    
    // Write file
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log('\n✅ Questions reordered successfully!');
    console.log('\n📋 New flow:');
    console.log('   - Energy → Digestive → Sleep → Diet connection');
    console.log('   - Physical symptoms interspersed with relevant diet questions');
    console.log('   - Mental symptoms paired with dietary impacts');
    console.log('   - Awareness questions at the end');
    console.log('\n✨ Seed oil questions now flow naturally within context!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reorderQuestions();
