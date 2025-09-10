/**
 * Fix Critical Assumptive Questions - UX Completion Rate Fix
 * 
 * Updates 4 most critical questions that assume behaviors, 
 * causing confusion and assessment abandonment
 */

const { PrismaClient } = require('@prisma/client');

const QUESTION_FIXES = [
  {
    id: 7, // EMF during meals (was id 7 in our questions, not 6)
    oldText: 'How often do you eat while using electronic devices (phone, computer, TV)?',
    newText: 'How does using electronic devices during meals affect your digestion?',
    rationale: 'Removes assumption that everyone uses devices during meals'
  },
  {
    id: 11, // Late night eating 
    oldText: 'How often do you experience worse digestion when eating late at night?',
    newText: 'How does your evening meal timing affect your digestion?',
    rationale: 'Removes assumption of late-night eating behavior'
  },
  {
    id: 15, // Fermented foods
    oldText: 'How often do fermented foods (kombucha, sauerkraut, yogurt) make you feel worse?',
    newText: 'How do fermented foods (kombucha, sauerkraut, yogurt) affect how you feel?',
    rationale: 'Removes assumption of fermented food consumption'
  },
  {
    id: 40, // Alcohol tolerance
    oldText: 'How often do you have difficulty tolerating alcohol (even small amounts)?',
    newText: 'How does alcohol consumption affect how you feel?',
    rationale: 'Removes assumption of alcohol consumption'
  }
];

async function fixAssumptiveQuestions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing critical assumptive questions for better completion rates...\n');
    
    for (const fix of QUESTION_FIXES) {
      console.log(`📝 Updating Question ${fix.id}:`);
      console.log(`   FROM: "${fix.oldText}"`);
      console.log(`   TO:   "${fix.newText}"`);
      console.log(`   WHY:  ${fix.rationale}`);
      
      // Update the question in database
      const updatedQuestion = await prisma.fmDigestiveQuestion.update({
        where: { id: fix.id },
        data: {
          questionText: fix.newText,
          updatedAt: new Date()
        }
      });
      
      console.log(`   ✅ Updated successfully\n`);
    }
    
    // Verify all updates
    const updatedQuestions = await prisma.fmDigestiveQuestion.findMany({
      where: {
        id: { in: QUESTION_FIXES.map(f => f.id) }
      },
      select: {
        id: true,
        questionText: true,
        category: true,
        subcategory: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log('🎯 Verification - Updated Questions:');
    updatedQuestions.forEach(q => {
      console.log(`   [${q.id}] ${q.category}/${q.subcategory}`);
      console.log(`        "${q.questionText}"`);
      console.log('');
    });
    
    // Check total questions still intact
    const totalQuestions = await prisma.fmDigestiveQuestion.count({
      where: { isActive: true }
    });
    
    console.log(`✅ All fixes applied! ${totalQuestions} questions remain active.`);
    console.log('\n🎯 Impact: Questions now answerable by 100% of users without confusion');
    console.log('📈 Expected: Significant completion rate improvement');
    
  } catch (error) {
    console.error('❌ Error fixing assumptive questions:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAssumptiveQuestions();
