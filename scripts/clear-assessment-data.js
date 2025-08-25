import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAssessmentData() {
  console.log('🧹 Clearing all assessment data...');
  
  try {
    // Delete in order to respect foreign key constraints
    const deletedResponses = await prisma.clientResponse.deleteMany({});
    console.log(`✅ Deleted ${deletedResponses.count} client responses`);
    
    const deletedAssessments = await prisma.clientAssessment.deleteMany({});
    console.log(`✅ Deleted ${deletedAssessments.count} client assessments`);
    
    const deletedTemplates = await prisma.assessmentTemplate.deleteMany({});
    console.log(`✅ Deleted ${deletedTemplates.count} assessment templates`);
    
    console.log('\n✅ All assessment data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAssessmentData();
