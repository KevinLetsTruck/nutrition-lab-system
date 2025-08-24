const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚫 PERMANENTLY REMOVING ALL CHOLESTEROL QUESTIONS...');

  try {
    // Update the template to remove cholesterol questions
    console.log('📝 Updating assessment template...');
    const response = await fetch('http://localhost:3000/api/assessment/seed', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to update template');
    }
    
    console.log('✅ Template updated - cholesterol questions removed');

    // Find any existing responses to cholesterol questions
    const cholesterolResponses = await prisma.clientResponse.findMany({
      where: {
        OR: [
          { questionId: 'CARDIO017' },
          { questionText: { contains: 'cholesterol', mode: 'insensitive' } },
          { questionText: { contains: 'lipid', mode: 'insensitive' } },
          { questionText: { contains: 'statin', mode: 'insensitive' } },
        ],
      },
    });

    if (cholesterolResponses.length > 0) {
      console.log(`🗑️  Found ${cholesterolResponses.length} cholesterol-related responses to delete`);
      
      await prisma.clientResponse.deleteMany({
        where: {
          id: { in: cholesterolResponses.map(r => r.id) },
        },
      });
      
      console.log('✅ Deleted all cholesterol-related responses');
    }

    // Reset any in-progress assessments
    const assessment = await prisma.clientAssessment.findFirst({
      orderBy: { startedAt: 'desc' },
      where: { status: 'IN_PROGRESS' },
      include: {
        client: {
          select: { email: true },
        },
      },
    });

    if (assessment) {
      console.log(`\n📋 Resetting assessment for: ${assessment.client.email}`);
      
      await prisma.clientResponse.deleteMany({
        where: { assessmentId: assessment.id },
      });

      await prisma.clientAssessment.delete({
        where: { id: assessment.id },
      });

      console.log('✅ Assessment reset');
    }

    console.log('\n🎉 CHOLESTEROL QUESTIONS PERMANENTLY REMOVED!');
    console.log('\n📋 PROJECT POLICY:');
    console.log('   ❌ NO cholesterol questions');
    console.log('   ❌ NO lipid questions');
    console.log('   ❌ NO statin questions');
    console.log('   ✅ This is documented in PROJECT_CHOLESTEROL_POLICY.md');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
