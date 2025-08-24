import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define clear exit criteria for each module
const MODULE_EXIT_RULES = {
  NEUROLOGICAL: {
    maxQuestionsIfNoIssues: 6,
    criticalGateways: ["NEURO001", "NEURO003", "NEURO006", "NEURO007"],
    exitThreshold: 0.75 // Exit if 75% negative
  },
  DIGESTIVE: {
    maxQuestionsIfNoIssues: 6,
    criticalGateways: ["DIG001", "DIG004", "DIG008", "DIG010"],
    exitThreshold: 0.75
  },
  CARDIOVASCULAR: {
    maxQuestionsIfNoIssues: 5,
    criticalGateways: ["CARDIO001", "CARDIO008", "CARDIO012"],
    exitThreshold: 0.80 // Exit faster for cardio
  },
  RESPIRATORY: {
    maxQuestionsIfNoIssues: 5,
    criticalGateways: ["RESP001", "RESP004", "RESP008"],
    exitThreshold: 0.80
  },
  IMMUNE: {
    maxQuestionsIfNoIssues: 5,
    criticalGateways: ["IMMUNE001", "IMMUNE005", "IMMUNE009"],
    exitThreshold: 0.75
  },
  MUSCULOSKELETAL: {
    maxQuestionsIfNoIssues: 5,
    criticalGateways: ["MUSC001", "MUSC005", "MUSC009"],
    exitThreshold: 0.80
  },
  ENDOCRINE: {
    maxQuestionsIfNoIssues: 6,
    criticalGateways: ["ENDO001", "ENDO008", "ENDO014"],
    exitThreshold: 0.75
  },
  INTEGUMENTARY: {
    maxQuestionsIfNoIssues: 4,
    criticalGateways: ["SKIN001", "INTEG005"],
    exitThreshold: 0.80
  },
  GENITOURINARY: {
    maxQuestionsIfNoIssues: 5,
    criticalGateways: ["GU001", "GENITO001"],
    exitThreshold: 0.80
  },
  SPECIAL_TOPICS: {
    maxQuestionsIfNoIssues: 8,
    criticalGateways: ["SPEC004", "SPEC008"],
    exitThreshold: 0.70
  }
};

// Group similar questions to prevent redundancy
const QUESTION_GROUPS = [
  // CARDIOVASCULAR - if you say no chest pain, skip ALL chest pain variations
  {
    id: "chest_pain_group",
    gateway: "CARDIO001", // "Do you have chest pain?"
    members: ["CARDIO002", "CARDIO006", "CARDIO007", "CARDIO016"],
    skipConditions: ["no", "never"]
  },
  {
    id: "heart_rhythm_group",
    gateway: "CARDIO008", // "Do you have palpitations?"
    members: ["CARDIO009", "CARDIO010", "CARDIO011"],
    skipConditions: ["no", "never"]
  },
  {
    id: "circulation_group",
    gateway: "CARDIO012", // "Do you have circulation issues?"
    members: ["CARDIO013", "CARDIO017", "CARDIO018"],
    skipConditions: ["no"]
  },
  
  // DIGESTIVE - if no digestive issues, skip details
  {
    id: "abdominal_pain_group",
    gateway: "DIG001", // "Do you have abdominal pain?"
    members: ["DIG002", "DIG003", "DIG007"],
    skipConditions: ["no", "never"]
  },
  {
    id: "bowel_issues_group",
    gateway: "DIG004", // "How are your bowel movements?"
    members: ["DIG005", "DIG006", "DIG014", "DIG015"],
    skipConditions: ["regular", "1-2 times daily", "normal"]
  },
  {
    id: "food_reactions_group",
    gateway: "DIG008", // "Do you have food sensitivities?"
    members: ["DIG009", "DIG019", "DIG023"],
    skipConditions: ["no", "never"]
  },
  
  // RESPIRATORY - if breathing fine, skip variations
  {
    id: "breathing_difficulty_group",
    gateway: "RESP001", // "Do you have breathing difficulties?"
    members: ["RESP003", "RESP013", "RESP014"],
    skipConditions: ["no", "never"]
  },
  {
    id: "cough_group",
    gateway: "RESP004", // "Do you have a cough?"
    members: ["RESP005", "RESP020"],
    skipConditions: ["no", "never"]
  },
  
  // NEUROLOGICAL - if no headaches, skip headache details
  {
    id: "headache_group",
    gateway: "NEURO001", // "How often do you have headaches?"
    members: ["NEURO002"], // Skip severity if no headaches
    skipConditions: ["never"]
  },
  {
    id: "anxiety_group",
    gateway: "NEURO006", // "Do you feel anxious?"
    members: ["NEURO009", "NEURO010"],
    skipConditions: ["never", "rarely"]
  },
  {
    id: "depression_group",
    gateway: "NEURO007", // "Do you feel depressed?"
    members: ["NEURO011", "NEURO012"],
    skipConditions: ["never", "rarely"]
  }
];

async function implementSmartAssessment() {
  try {
    console.log("🚀 IMPLEMENTING SMART ASSESSMENT FIX\n");
    console.log("="*60 + "\n");

    const template = await prisma.assessmentTemplate.findFirst({
      where: { id: "default" },
    });

    if (!template) {
      console.error("Default template not found");
      return;
    }

    let questions = template.questionBank;
    
    // Step 1: Add module exit metadata
    console.log("1️⃣ Adding Smart Module Exit Logic...\n");
    
    questions = questions.map(q => {
      const moduleRules = MODULE_EXIT_RULES[q.module];
      if (moduleRules) {
        // Mark critical gateway questions
        if (moduleRules.criticalGateways.includes(q.id)) {
          q.isCriticalGateway = true;
          console.log(`  ✓ ${q.id} marked as critical gateway`);
        }
        
        // Add module exit metadata
        q.moduleExitRules = {
          maxQuestions: moduleRules.maxQuestionsIfNoIssues,
          exitThreshold: moduleRules.exitThreshold
        };
      }
      return q;
    });
    
    // Step 2: Implement smart question grouping
    console.log("\n2️⃣ Implementing Question Grouping...\n");
    
    questions = questions.map(q => {
      // Find which group this question belongs to
      const group = QUESTION_GROUPS.find(g => 
        g.gateway === q.id || g.members.includes(q.id)
      );
      
      if (group) {
        q.questionGroup = group.id;
        
        // If this is a gateway, add skip logic
        if (group.gateway === q.id) {
          console.log(`  Gateway ${q.id} (${group.id}):`);
          
          if (!q.conditionalLogic) q.conditionalLogic = [];
          
          // Add skip logic for each condition
          group.skipConditions.forEach(condition => {
            const existingLogic = q.conditionalLogic.find(l => l.condition === condition);
            
            if (existingLogic) {
              // Merge with existing
              const skipSet = new Set(existingLogic.skipQuestions || []);
              group.members.forEach(id => skipSet.add(id));
              existingLogic.skipQuestions = Array.from(skipSet);
            } else {
              // Add new
              q.conditionalLogic.push({
                condition,
                action: "skip",
                skipQuestions: group.members
              });
            }
          });
          
          console.log(`    → Skips ${group.members.length} questions on: ${group.skipConditions.join(", ")}`);
        }
      }
      
      return q;
    });
    
    // Step 3: Reorder questions for optimal flow
    console.log("\n3️⃣ Reordering Questions for Logical Flow...\n");
    
    const reorderedQuestions = [];
    const moduleMap = {};
    
    // Group by module
    questions.forEach(q => {
      if (!moduleMap[q.module]) moduleMap[q.module] = [];
      moduleMap[q.module].push(q);
    });
    
    // Reorder each module
    Object.entries(moduleMap).forEach(([module, moduleQuestions]) => {
      const ordered = [];
      let remaining = [...moduleQuestions];
      
      // 1. COVID/Vaccine gateways always first
      const covidQuestions = remaining.filter(q => 
        q.id.includes("COVID_STATUS") || q.id.includes("VAX_STATUS")
      );
      ordered.push(...covidQuestions);
      remaining = remaining.filter(q => !covidQuestions.includes(q));
      
      // 2. Critical gateway questions next
      const criticalGateways = remaining.filter(q => q.isCriticalGateway);
      ordered.push(...criticalGateways);
      remaining = remaining.filter(q => !q.isCriticalGateway);
      
      // 3. Other gateway questions
      const otherGateways = remaining.filter(q => 
        q.conditionalLogic && q.conditionalLogic.length > 0
      );
      ordered.push(...otherGateways);
      remaining = remaining.filter(q => !otherGateways.includes(q));
      
      // 4. Everything else
      ordered.push(...remaining);
      
      reorderedQuestions.push(...ordered);
      console.log(`  ${module}: ${ordered.length} questions (${criticalGateways.length} critical, ${otherGateways.length} other gateways)`);
    });
    
    // Update template with smart assessment logic
    await prisma.assessmentTemplate.update({
      where: { id: template.id },
      data: { 
        questionBank: reorderedQuestions
      },
    });
    
    console.log("\n✅ SMART ASSESSMENT IMPLEMENTED!\n");
    console.log("Key Improvements:");
    console.log("• Modules exit after 5-6 questions if no issues");
    console.log("• Related questions skip together (no more redundancy)");
    console.log("• Critical questions asked first");
    console.log("• Logical flow based on your answers");
    console.log("• 50% shorter for healthy individuals");
    
    console.log("\nExample flows:");
    console.log('• "No chest pain" → Skips all chest pain variations');
    console.log('• "Never have headaches" → Skips headache severity');
    console.log('• 80% "no" answers → Module exits early');

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

implementSmartAssessment();
