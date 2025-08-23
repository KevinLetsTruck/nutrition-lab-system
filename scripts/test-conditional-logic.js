const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testConditionalLogic() {
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
    
    // Find SCR067 and check its conditional logic
    const scr067 = questions.find(q => q.id === "SCR067");
    
    if (scr067) {
      console.log("SCR067 - DOT medical certification question:");
      console.log("Text:", scr067.text);
      console.log("Type:", scr067.type);
      console.log("Conditional Logic:", JSON.stringify(scr067.conditionalLogic, null, 2));
      
      if (scr067.conditionalLogic && scr067.conditionalLogic.length > 0) {
        console.log("\n✅ Conditional logic is properly configured!");
        console.log("If answer is 'no', will skip:", scr067.conditionalLogic[0].skipQuestions);
      } else {
        console.log("\n❌ No conditional logic found!");
      }
    } else {
      console.log("❌ SCR067 not found in question bank!");
    }
    
    // List all DOT-related questions
    console.log("\n\nDOT-related questions order:");
    const dotQuestions = questions.filter(q => 
      ["SCR067", "SCR068", "SCR069", "SCR070"].includes(q.id)
    );
    
    dotQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.id}: ${q.text}`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConditionalLogic();
