const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyGenderSpecific() {
  try {
    // Get the assessment template
    const template = await prisma.assessmentTemplate.findFirst({
      where: { id: "default" },
    });

    if (!template) {
      console.error("No template found");
      return;
    }

    const questions = template.questionBank;
    
    // Check female-specific questions
    const femaleQuestionIds = ['SCR049', 'COM001', 'COM023', 'COM078'];
    
    console.log("Checking gender-specific questions:\n");
    
    femaleQuestionIds.forEach(questionId => {
      const question = questions.find(q => q.id === questionId);
      
      if (question) {
        console.log(`${questionId}: ${question.text}`);
        console.log(`  Gender Specific: ${question.genderSpecific || 'NOT SET'}`);
        
        if (question.genderSpecific === 'female') {
          console.log(`  ✅ Correctly marked as female-specific`);
        } else {
          console.log(`  ❌ Missing or incorrect genderSpecific property`);
        }
      } else {
        console.log(`${questionId}: NOT FOUND in question bank`);
      }
      console.log("");
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyGenderSpecific();
