const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Sample questions from each body system for testing
const sampleQuestions = {
  NEUROLOGICAL: [
    {
      id: "NEURO001",
      bodySystem: "NEUROLOGICAL",
      text: "Do you experience frequent headaches?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "daily", label: "Daily", score: 4 }
      ]
    },
    {
      id: "NEURO003",
      bodySystem: "NEUROLOGICAL",
      text: "Do you have brain fog or difficulty concentrating?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "constant", label: "Constant", score: 4 }
      ]
    }
  ],
  DIGESTIVE: [
    {
      id: "DIG001",
      bodySystem: "DIGESTIVE",
      text: "Do you experience bloating after meals?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "always", label: "Always", score: 4 }
      ]
    },
    {
      id: "DIG003",
      bodySystem: "DIGESTIVE",
      text: "How often do you have bowel movements?",
      type: "MULTIPLE_CHOICE",
      options: [
        { value: "less3week", label: "Less than 3 per week", score: 3 },
        { value: "3-5week", label: "3-5 per week", score: 2 },
        { value: "daily", label: "Daily", score: 0 },
        { value: "2-3day", label: "2-3 per day", score: 0 },
        { value: "more3day", label: "More than 3 per day", score: 2 }
      ]
    }
  ],
  CARDIOVASCULAR: [
    {
      id: "CARDIO001",
      bodySystem: "CARDIOVASCULAR",
      text: "Do you experience heart palpitations?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "daily", label: "Daily", score: 4 }
      ]
    },
    {
      id: "CARDIO004",
      bodySystem: "CARDIOVASCULAR",
      text: "Have you been told you have high blood pressure?",
      type: "YES_NO",
      options: [
        { value: "yes", label: "Yes", score: 3 },
        { value: "no", label: "No", score: 0 },
        { value: "borderline", label: "Borderline", score: 2 }
      ]
    }
  ],
  RESPIRATORY: [
    {
      id: "RESP001",
      bodySystem: "RESPIRATORY",
      text: "Do you experience shortness of breath at rest?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "always", label: "Always", score: 4 }
      ]
    }
  ],
  IMMUNE: [
    {
      id: "IMMUNE001",
      bodySystem: "IMMUNE",
      text: "How often do you get colds or flu?",
      type: "MULTIPLE_CHOICE",
      options: [
        { value: "never", label: "Never/Rarely", score: 0 },
        { value: "1-2year", label: "1-2 times per year", score: 0 },
        { value: "3-4year", label: "3-4 times per year", score: 1 },
        { value: "5-6year", label: "5-6 times per year", score: 2 },
        { value: "monthly", label: "Monthly or more", score: 3 }
      ]
    }
  ],
  MUSCULOSKELETAL: [
    {
      id: "MUSC001",
      bodySystem: "MUSCULOSKELETAL",
      text: "Do you experience joint pain or stiffness?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "daily", label: "Daily", score: 4 }
      ]
    },
    {
      id: "MUSC004",
      bodySystem: "MUSCULOSKELETAL",
      text: "Do you have lower back pain?",
      type: "FREQUENCY",
      options: [
        { value: "never", label: "Never", score: 0 },
        { value: "rarely", label: "Rarely", score: 1 },
        { value: "sometimes", label: "Sometimes", score: 2 },
        { value: "often", label: "Often", score: 3 },
        { value: "constantly", label: "Constantly", score: 4 }
      ]
    }
  ],
  ENDOCRINE: [
    {
      id: "ENDO001",
      bodySystem: "ENDOCRINE",
      text: "How would you rate your overall energy level?",
      type: "LIKERT_SCALE",
      scaleMin: "No energy",
      scaleMax: "Abundant energy",
      options: [
        { value: "1", label: "1", score: 4 },
        { value: "2", label: "2", score: 3 },
        { value: "3", label: "3", score: 2 },
        { value: "4", label: "4", score: 1 },
        { value: "5", label: "5", score: 0 }
      ]
    },
    {
      id: "ENDO007",
      bodySystem: "ENDOCRINE",
      text: "Are you always cold or have cold hands/feet?",
      type: "YES_NO",
      options: [
        { value: "yes", label: "Yes", score: 2 },
        { value: "no", label: "No", score: 0 },
        { value: "extremely", label: "Yes, extremely", score: 3 }
      ]
    }
  ],
  INTEGUMENTARY: [
    {
      id: "SKIN001",
      bodySystem: "INTEGUMENTARY",
      text: "Do you have dry, flaky, or scaly skin?",
      type: "YES_NO",
      options: [
        { value: "yes", label: "Yes", score: 2 },
        { value: "no", label: "No", score: 0 },
        { value: "severely", label: "Yes, severely", score: 3 }
      ]
    }
  ],
  GENITOURINARY: [
    {
      id: "GU001",
      bodySystem: "GENITOURINARY",
      text: "How often do you urinate during the day?",
      type: "MULTIPLE_CHOICE",
      options: [
        { value: "3-4", label: "3-4 times", score: 0 },
        { value: "5-7", label: "5-7 times", score: 0 },
        { value: "8-10", label: "8-10 times", score: 1 },
        { value: "11-15", label: "11-15 times", score: 2 },
        { value: "over15", label: "Over 15 times", score: 3 }
      ]
    }
  ],
  SPECIAL_TOPICS: [
    {
      id: "SPEC004",
      bodySystem: "SPECIAL_TOPICS",
      text: "Have you had COVID-19?",
      type: "MULTIPLE_CHOICE",
      options: [
        { value: "no", label: "No", score: 0 },
        { value: "once_mild", label: "Yes, once (mild)", score: 1 },
        { value: "once_moderate", label: "Yes, once (moderate)", score: 2 },
        { value: "once_severe", label: "Yes, once (severe)", score: 3 },
        { value: "multiple", label: "Yes, multiple times", score: 4 }
      ]
    }
  ]
};

// Test personas
const testPersonas = {
  hormoneIssues: {
    name: "Sarah Thompson - Hormone Issues",
    email: "sarah.hormones@test.com",
    age: 45,
    gender: "female",
    profile: "Middle-aged woman with thyroid issues, fatigue, and weight gain",
    systemScores: {
      NEUROLOGICAL: 0.60,
      DIGESTIVE: 0.50,
      CARDIOVASCULAR: 0.30,
      RESPIRATORY: 0.20,
      IMMUNE: 0.40,
      MUSCULOSKELETAL: 0.45,
      ENDOCRINE: 0.85,
      INTEGUMENTARY: 0.65,
      GENITOURINARY: 0.50,
      SPECIAL_TOPICS: 0.30
    }
  },
  longCovid: {
    name: "Mark Davis - Long COVID",
    email: "mark.covid@test.com",
    age: 38,
    gender: "male",
    profile: "Post-COVID syndrome with fatigue, breathing issues, and brain fog",
    systemScores: {
      NEUROLOGICAL: 0.80,
      DIGESTIVE: 0.40,
      CARDIOVASCULAR: 0.70,
      RESPIRATORY: 0.85,
      IMMUNE: 0.75,
      MUSCULOSKELETAL: 0.60,
      ENDOCRINE: 0.65,
      INTEGUMENTARY: 0.30,
      GENITOURINARY: 0.25,
      SPECIAL_TOPICS: 0.90
    }
  }
};

// Generate response based on system score
function generateResponse(question, systemScore) {
  const score = systemScore || 0.5;
  const options = question.options || [];
  
  if (question.type === "LIKERT_SCALE") {
    // For Likert, lower number = worse symptoms
    const index = Math.floor((1 - score) * 5);
    return options[Math.min(index, options.length - 1)];
  } else if (question.type === "YES_NO") {
    if (score > 0.6) {
      return options.find(o => o.value === "yes" || o.value === "extremely") || options[0];
    } else if (score > 0.3) {
      return options.find(o => o.value === "unsure" || o.value === "borderline") || options[0];
    }
    return options.find(o => o.value === "no") || options[1];
  } else {
    // For FREQUENCY and MULTIPLE_CHOICE, pick based on score
    const index = Math.floor(score * (options.length - 1));
    return options[index];
  }
}

// Create test assessment
async function createTestAssessment(persona) {
  try {
    console.log(`\n🧪 Creating test assessment for ${persona.name}...`);
    
    // Create client directly
    const [firstName, lastName] = persona.name.split(' - ')[0].split(' ');
    
    const client = await prisma.client.upsert({
      where: { email: persona.email },
      update: {
        gender: persona.gender,
        dateOfBirth: new Date(new Date().getFullYear() - persona.age, 0, 1),
        healthGoals: {
          primaryGoal: "Improve overall health"
        }
      },
      create: {
        email: persona.email,
        firstName: firstName,
        lastName: lastName,
        gender: persona.gender,
        dateOfBirth: new Date(new Date().getFullYear() - persona.age, 0, 1),
        healthGoals: {
          primaryGoal: "Improve overall health"
        }
      }
    });

    // Find or create a test template
    let template = await prisma.assessmentTemplate.findFirst({
      where: { isActive: true }
    });
    
    if (!template) {
      template = await prisma.assessmentTemplate.create({
        data: {
          name: "Body Systems Test Template",
          version: "1.0.0",
          questionBank: Object.values(sampleQuestions).flat(),
          modules: Object.keys(sampleQuestions),
          scoringRules: {
            severityThresholds: {
              low: { min: 0, max: 25 },
              moderate: { min: 25, max: 50 },
              high: { min: 50, max: 75 },
              critical: { min: 75, max: 100 }
            }
          }
        }
      });
    }

    // Create assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId: client.id,
        templateId: template.id,
        status: "IN_PROGRESS",
        currentModule: "SCREENING",
        questionsAsked: 0,
        questionsSaved: 0
      }
    });

    console.log(`✅ Created assessment ${assessment.id}`);

    // Generate responses
    const responses = [];
    let totalScore = 0;
    let questionCount = 0;

    for (const [system, questions] of Object.entries(sampleQuestions)) {
      const systemScore = persona.systemScores[system] || 0.5;
      
      for (const question of questions) {
        const response = generateResponse(question, systemScore);
        
        responses.push({
          assessmentId: assessment.id,
          questionId: question.id,
          questionText: question.text,
          responseValue: response.value,
          responseType: question.type,
          questionModule: "SCREENING",
          clinicalFlags: {
            bodySystem: system,
            severity: response.score / 4
          },
          answeredAt: new Date()
        });
        
        totalScore += response.score;
        questionCount++;
      }
    }

    // Save responses
    await prisma.clientResponse.createMany({
      data: responses
    });

    // Update assessment
    await prisma.clientAssessment.update({
      where: { id: assessment.id },
      data: {
        status: "COMPLETED",
        questionsAsked: questionCount,
        questionsSaved: questionCount,
        completedAt: new Date()
      }
    });

    console.log(`💾 Saved ${responses.length} responses`);
    
    // Generate analysis
    console.log("\n📊 Assessment Results:");
    console.log("=====================");
    
    const systemResults = {};
    for (const [system, questions] of Object.entries(sampleQuestions)) {
      const systemResponses = responses.filter(r => r.clinicalFlags?.bodySystem === system);
      const systemTotal = systemResponses.reduce((sum, r) => sum + (r.clinicalFlags?.severity * 4 || 0), 0);
      const systemAvg = systemResponses.length > 0 ? systemTotal / systemResponses.length : 0;
      const percentage = (systemAvg / 4) * 100;
      
      systemResults[system] = {
        score: systemAvg,
        percentage: percentage,
        severity: percentage > 75 ? "CRITICAL" : percentage > 50 ? "HIGH" : percentage > 25 ? "MODERATE" : "LOW"
      };
      
      console.log(`${system}: ${percentage.toFixed(1)}% - ${systemResults[system].severity}`);
    }
    
    // AI-style analysis
    const topSystems = Object.entries(systemResults)
      .sort((a, b) => b[1].percentage - a[1].percentage)
      .slice(0, 3);
    
    console.log("\n🤖 AI Analysis Summary:");
    console.log("=======================");
    console.log(`Primary Concern: ${topSystems[0][0]} (${topSystems[0][1].percentage.toFixed(1)}%)`);
    console.log(`Secondary Concern: ${topSystems[1][0]} (${topSystems[1][1].percentage.toFixed(1)}%)`);
    console.log(`Tertiary Concern: ${topSystems[2][0]} (${topSystems[2][1].percentage.toFixed(1)}%)`);
    
    console.log("\n🎯 Recommended Focus Areas:");
    if (persona.profile.includes("hormone")) {
      console.log("- Thyroid support and hormone balancing");
      console.log("- Metabolic optimization");
      console.log("- Energy production enhancement");
    } else if (persona.profile.includes("COVID")) {
      console.log("- Mitochondrial support");
      console.log("- Anti-inflammatory protocols");
      console.log("- Respiratory rehabilitation");
    }
    
    return { assessment, systemResults };
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Main
async function main() {
  console.log("🚀 Starting Assessment Simulation Test");
  console.log("=====================================\n");
  
  for (const [key, persona] of Object.entries(testPersonas)) {
    await createTestAssessment(persona);
    console.log("\n" + "=".repeat(50) + "\n");
  }
  
  console.log("✅ Test completed!");
  await prisma.$disconnect();
}

main().catch(console.error);
