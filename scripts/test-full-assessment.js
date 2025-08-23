const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Hard-code some body system questions for testing
// We'll use a subset of questions from each system for this test
const neurologicalQuestions = require("./test-data/neurological-questions.json");
const digestiveQuestions = require("./test-data/digestive-questions.json");
const cardiovascularQuestions = require("./test-data/cardiovascular-questions.json");
const respiratoryQuestions = require("./test-data/respiratory-questions.json");
const immuneQuestions = require("./test-data/immune-questions.json");
const musculoskeletalQuestions = require("./test-data/musculoskeletal-questions.json");
const endocrineQuestions = require("./test-data/endocrine-questions.json");
const integumentaryQuestions = require("./test-data/integumentary-questions.json");
const genitourinaryQuestions = require("./test-data/genitourinary-questions.json");
const specialTopicsQuestions = require("./test-data/special-topics-questions.json");

// Create test personas with different health profiles
const testPersonas = {
  // Persona 1: Middle-aged woman with thyroid/hormone issues
  hormoneIssues: {
    name: "Sarah Thompson",
    email: "sarah.test@example.com",
    age: 45,
    gender: "female",
    profile: "Hypothyroid, perimenopause, fatigue, weight gain",
    systemScores: {
      ENDOCRINE: 0.75,      // High - main issue
      NEUROLOGICAL: 0.60,    // Moderate - brain fog, mood
      DIGESTIVE: 0.50,       // Moderate - bloating
      CARDIOVASCULAR: 0.30,  // Low - some circulation issues
      RESPIRATORY: 0.20,     // Low
      IMMUNE: 0.40,          // Low-moderate
      MUSCULOSKELETAL: 0.45, // Moderate - joint stiffness
      INTEGUMENTARY: 0.55,   // Moderate - dry skin, hair loss
      GENITOURINARY: 0.50,   // Moderate - hormonal
      SPECIAL_TOPICS: 0.30   // Low
    }
  },

  // Persona 2: Post-COVID long hauler
  longCovid: {
    name: "Mark Davis",
    email: "mark.test@example.com",
    age: 38,
    gender: "male",
    profile: "Post-COVID syndrome, fatigue, breathing issues, brain fog",
    systemScores: {
      ENDOCRINE: 0.65,      // High - fatigue
      NEUROLOGICAL: 0.80,    // Very high - brain fog, headaches
      DIGESTIVE: 0.40,       // Moderate
      CARDIOVASCULAR: 0.70,  // High - POTS, palpitations
      RESPIRATORY: 0.75,     // High - shortness of breath
      IMMUNE: 0.70,          // High - poor recovery
      MUSCULOSKELETAL: 0.60, // Moderate-high - pain
      INTEGUMENTARY: 0.30,   // Low
      GENITOURINARY: 0.25,   // Low
      SPECIAL_TOPICS: 0.80   // Very high - COVID specific
    }
  },

  // Persona 3: Commercial driver with metabolic syndrome
  metabolicDriver: {
    name: "John Williams",
    email: "john.test@example.com",
    age: 52,
    gender: "male",
    profile: "Commercial driver, diabetes, hypertension, back pain",
    systemScores: {
      ENDOCRINE: 0.80,      // Very high - diabetes, weight
      NEUROLOGICAL: 0.40,    // Moderate - sleep issues
      DIGESTIVE: 0.60,       // High - poor diet
      CARDIOVASCULAR: 0.85,  // Very high - hypertension
      RESPIRATORY: 0.50,     // Moderate - sleep apnea
      IMMUNE: 0.35,          // Low-moderate
      MUSCULOSKELETAL: 0.90, // Very high - chronic back pain
      INTEGUMENTARY: 0.40,   // Moderate
      GENITOURINARY: 0.45,   // Moderate - prostate
      SPECIAL_TOPICS: 0.70   // High - driver specific
    }
  }
};

// Function to generate realistic responses based on system scores
function generateResponse(question, systemScore, persona) {
  const score = systemScore || 0.5; // Default to moderate if no score
  
  switch (question.type) {
    case "YES_NO":
      const options = question.options || [];
      // Higher score = more likely to have the symptom
      const rand = Math.random();
      if (rand < score * 0.8) {
        // Has the symptom
        const yesOption = options.find(o => o.value === "yes") || options[0];
        return { value: yesOption.value, score: yesOption.score };
      } else if (rand < score * 0.9) {
        // Sometimes/unsure
        const maybeOption = options.find(o => o.value === "sometimes" || o.value === "unsure");
        if (maybeOption) return { value: maybeOption.value, score: maybeOption.score };
      }
      // No symptom
      const noOption = options.find(o => o.value === "no") || options[1];
      return { value: noOption.value, score: noOption.score };

    case "FREQUENCY":
      const freqOptions = question.options || [];
      // Map score to frequency
      if (score > 0.8) {
        // Very frequent
        return freqOptions[freqOptions.length - 1] || freqOptions[3];
      } else if (score > 0.6) {
        // Often
        return freqOptions[3] || freqOptions[2];
      } else if (score > 0.4) {
        // Sometimes
        return freqOptions[2] || freqOptions[1];
      } else if (score > 0.2) {
        // Rarely
        return freqOptions[1] || freqOptions[0];
      }
      // Never
      return freqOptions[0];

    case "LIKERT_SCALE":
      // 5-point scale: map score to 1-5
      const likertValue = Math.ceil(score * 5);
      return { value: likertValue.toString(), score: likertValue - 1 };

    case "MULTIPLE_CHOICE":
      const mcOptions = question.options || [];
      // Select based on score and relevance
      const index = Math.floor(score * (mcOptions.length - 1));
      return mcOptions[index] || mcOptions[0];

    default:
      return { value: "unknown", score: 0 };
  }
}

// Function to create a test assessment
async function createTestAssessment(persona) {
  try {
    console.log(`\n🧪 Creating test assessment for ${persona.name}...`);

    // Create test user
    const user = await prisma.user.upsert({
      where: { email: persona.email },
      update: {},
      create: {
        email: persona.email,
        name: persona.name,
        password: "test123", // Not used for testing
        role: "CLIENT"
      }
    });

    // Create test client
    const client = await prisma.client.upsert({
      where: { userId: user.id },
      update: {
        gender: persona.gender,
        dateOfBirth: new Date(new Date().getFullYear() - persona.age, 0, 1),
        healthGoals: {
          primaryGoal: "Improve overall health",
          height: persona.gender === "male" ? "5'10\"" : "5'6\"",
          weight: persona.gender === "male" ? "210 lbs" : "165 lbs"
        },
        medications: {
          current: persona.profile.includes("diabetes") ? ["Metformin 500mg"] : [],
          supplements: ["Vitamin D 2000IU", "Magnesium 400mg"]
        }
      },
      create: {
        userId: user.id,
        gender: persona.gender,
        dateOfBirth: new Date(new Date().getFullYear() - persona.age, 0, 1),
        healthGoals: {
          primaryGoal: "Improve overall health",
          height: persona.gender === "male" ? "5'10\"" : "5'6\"",
          weight: persona.gender === "male" ? "210 lbs" : "165 lbs"
        },
        medications: {
          current: persona.profile.includes("diabetes") ? ["Metformin 500mg"] : [],
          supplements: ["Vitamin D 2000IU", "Magnesium 400mg"]
        }
      }
    });

    // Create assessment
    const assessment = await prisma.clientAssessment.create({
      data: {
        clientId: client.id,
        templateId: "body-systems-v1",
        status: "IN_PROGRESS",
        currentModule: "SCREENING",
        questionsAnswered: 0,
        metadata: {
          testPersona: persona.profile,
          startedAt: new Date()
        }
      }
    });

    console.log(`✅ Created assessment ${assessment.id} for ${persona.name}`);

    // Collect all questions
    const allQuestions = [
      ...neurologicalQuestions,
      ...digestiveQuestions,
      ...cardiovascularQuestions,
      ...respiratoryQuestions,
      ...immuneQuestions,
      ...musculoskeletalQuestions,
      ...endocrineQuestions,
      ...integumentaryQuestions,
      ...genitourinaryQuestions,
      ...specialTopicsQuestions
    ];

    console.log(`📋 Total questions to answer: ${allQuestions.length}`);

    // Generate responses for each question
    let responses = [];
    let systemTotals = {};
    let systemCounts = {};

    for (const question of allQuestions) {
      // Skip gender-specific questions if not applicable
      if (question.genderSpecific && question.genderSpecific !== persona.gender) {
        continue;
      }

      // Get the system score for this question
      const systemScore = persona.systemScores[question.bodySystem] || 0.5;
      
      // Generate response
      const response = generateResponse(question, systemScore, persona);
      
      // Track scores by system
      if (!systemTotals[question.bodySystem]) {
        systemTotals[question.bodySystem] = 0;
        systemCounts[question.bodySystem] = 0;
      }
      systemTotals[question.bodySystem] += response.score || 0;
      systemCounts[question.bodySystem]++;

      // Create response record
      responses.push({
        assessmentId: assessment.id,
        questionId: question.id,
        questionText: question.text,
        responseValue: response.value,
        responseScore: response.score || 0,
        responseType: question.type,
        module: question.module || "SCREENING",
        bodySystem: question.bodySystem,
        answeredAt: new Date()
      });
    }

    // Save all responses
    console.log(`💾 Saving ${responses.length} responses...`);
    await prisma.clientResponse.createMany({
      data: responses
    });

    // Update assessment as complete
    await prisma.clientAssessment.update({
      where: { id: assessment.id },
      data: {
        status: "COMPLETED",
        questionsAnswered: responses.length,
        completedAt: new Date(),
        metadata: {
          ...assessment.metadata,
          completedAt: new Date(),
          totalQuestions: allQuestions.length,
          responseCount: responses.length
        }
      }
    });

    // Calculate system scores
    console.log("\n📊 System Scores:");
    console.log("================");
    
    const systemResults = {};
    for (const system in systemTotals) {
      const avgScore = systemTotals[system] / systemCounts[system];
      const percentage = (avgScore / 4) * 100; // Assuming max score of 4
      systemResults[system] = {
        totalScore: systemTotals[system],
        questionCount: systemCounts[system],
        averageScore: avgScore.toFixed(2),
        percentage: percentage.toFixed(1)
      };
      
      console.log(`${system}: ${percentage.toFixed(1)}% (${avgScore.toFixed(2)}/4 avg from ${systemCounts[system]} questions)`);
    }

    return {
      assessment,
      systemResults,
      responses: responses.length
    };

  } catch (error) {
    console.error("Error creating test assessment:", error);
    throw error;
  }
}

// Function to analyze assessment with AI
async function analyzeAssessment(assessmentId) {
  console.log("\n🤖 Requesting AI Analysis...");
  console.log("================================");
  
  try {
    // Fetch the assessment with all responses
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        client: true,
        responses: {
          orderBy: { answeredAt: 'asc' }
        }
      }
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Group responses by body system
    const systemResponses = {};
    assessment.responses.forEach(response => {
      if (!systemResponses[response.bodySystem]) {
        systemResponses[response.bodySystem] = [];
      }
      systemResponses[response.bodySystem].push(response);
    });

    // Create analysis prompt
    const analysisPrompt = `
    Analyze this comprehensive health assessment for ${assessment.client.gender === 'male' ? 'Mr.' : 'Ms.'} ${assessment.client.name || 'Patient'}.
    
    Patient Profile:
    - Age: ${assessment.client.dateOfBirth ? new Date().getFullYear() - new Date(assessment.client.dateOfBirth).getFullYear() : 'Unknown'}
    - Gender: ${assessment.client.gender}
    - Primary Goal: ${assessment.client.healthGoals?.primaryGoal || 'Improve health'}
    - Current Medications: ${assessment.client.medications?.current?.join(', ') || 'None'}
    - Current Supplements: ${assessment.client.medications?.supplements?.join(', ') || 'None'}
    
    System-by-System Results:
    ${Object.entries(systemResponses).map(([system, responses]) => {
      const avgScore = responses.reduce((sum, r) => sum + r.responseScore, 0) / responses.length;
      const percentage = (avgScore / 4) * 100;
      
      return `
      ${system} (${percentage.toFixed(1)}% severity):
      - Questions answered: ${responses.length}
      - Key findings: ${responses.filter(r => r.responseScore >= 3).slice(0, 5).map(r => r.questionText).join('; ')}
      `;
    }).join('\n')}
    
    Please provide:
    1. Top 3 body systems requiring immediate attention
    2. Key interconnections between affected systems
    3. Root cause analysis
    4. Priority interventions for each critical system
    5. Suggested protocol approach
    `;

    // Simulate AI response (in production, this would call Claude)
    const aiAnalysis = generateMockAIAnalysis(assessment, systemResponses);
    
    console.log(aiAnalysis);
    
    return aiAnalysis;

  } catch (error) {
    console.error("Error analyzing assessment:", error);
    throw error;
  }
}

// Mock AI analysis generator
function generateMockAIAnalysis(assessment, systemResponses) {
  const metadata = assessment.metadata;
  const persona = metadata.testPersona || "Unknown profile";
  
  // Calculate system severities
  const systemSeverities = {};
  Object.entries(systemResponses).forEach(([system, responses]) => {
    const avgScore = responses.reduce((sum, r) => sum + r.responseScore, 0) / responses.length;
    systemSeverities[system] = {
      system,
      severity: (avgScore / 4) * 100,
      count: responses.length,
      highScoreItems: responses.filter(r => r.responseScore >= 3).length
    };
  });
  
  // Sort by severity
  const sortedSystems = Object.values(systemSeverities).sort((a, b) => b.severity - a.severity);
  
  return `
🔬 COMPREHENSIVE HEALTH ASSESSMENT ANALYSIS
==========================================

Patient: ${assessment.client.name || 'Test Patient'}
Profile: ${persona}
Assessment Date: ${new Date().toLocaleDateString()}

📊 SYSTEM SEVERITY RANKINGS:
${sortedSystems.map((s, i) => `${i + 1}. ${s.system}: ${s.severity.toFixed(1)}% (${s.highScoreItems} critical symptoms)`).join('\n')}

🎯 TOP 3 CRITICAL SYSTEMS:

1. ${sortedSystems[0].system} (${sortedSystems[0].severity.toFixed(1)}% severity)
   - Primary concern requiring immediate intervention
   - ${sortedSystems[0].highScoreItems} symptoms scoring 3+ out of 4
   - Affecting overall quality of life significantly

2. ${sortedSystems[1].system} (${sortedSystems[1].severity.toFixed(1)}% severity)
   - Secondary system showing significant dysfunction
   - ${sortedSystems[1].highScoreItems} symptoms scoring 3+ out of 4
   - Contributing to systemic inflammation

3. ${sortedSystems[2].system} (${sortedSystems[2].severity.toFixed(1)}% severity)
   - Tertiary system requiring support
   - ${sortedSystems[2].highScoreItems} symptoms scoring 3+ out of 4
   - May be compensatory to primary issues

🔗 KEY SYSTEM INTERCONNECTIONS:
${generateInterconnections(sortedSystems.slice(0, 3))}

🔍 ROOT CAUSE ANALYSIS:
${generateRootCause(persona, sortedSystems)}

💊 PRIORITY INTERVENTIONS:

${sortedSystems.slice(0, 3).map(s => `
${s.system} SYSTEM:
- Immediate: Address acute symptoms
- Short-term: Reduce inflammation and support function
- Long-term: Restore optimal system balance
- Lifestyle: Specific modifications for this system
`).join('\n')}

📋 SUGGESTED PROTOCOL APPROACH:

Phase 1 (Weeks 1-4): Foundation
- Reduce systemic inflammation
- Support detoxification pathways
- Stabilize blood sugar
- Improve sleep quality

Phase 2 (Weeks 5-12): System Repair
- Target top 3 critical systems
- Implement specific protocols
- Monitor symptom improvements
- Adjust based on response

Phase 3 (Weeks 13+): Optimization
- Fine-tune protocols
- Address remaining symptoms
- Implement prevention strategies
- Establish maintenance plan

⚡ KEY TAKEAWAY:
This assessment reveals a clear pattern of ${sortedSystems[0].system.toLowerCase()} dysfunction 
as the primary driver, with cascading effects on ${sortedSystems[1].system.toLowerCase()} 
and ${sortedSystems[2].system.toLowerCase()} systems. A comprehensive protocol addressing 
these interconnected systems will be most effective.

Confidence Level: 87% (based on ${assessment.responses.length} responses)
`;
}

function generateInterconnections(topSystems) {
  const connections = {
    "ENDOCRINE-NEUROLOGICAL": "Hormonal imbalances directly impact neurotransmitter production and cognitive function",
    "CARDIOVASCULAR-RESPIRATORY": "Cardiac function and respiratory efficiency are intimately linked through oxygen delivery",
    "DIGESTIVE-IMMUNE": "Gut dysfunction compromises immune response through intestinal permeability",
    "MUSCULOSKELETAL-NEUROLOGICAL": "Chronic pain creates neurological sensitization and mood changes",
    "ENDOCRINE-CARDIOVASCULAR": "Metabolic dysfunction drives cardiovascular disease risk",
    "IMMUNE-INTEGUMENTARY": "Immune dysregulation manifests through skin conditions"
  };
  
  const relevant = [];
  for (let i = 0; i < topSystems.length - 1; i++) {
    for (let j = i + 1; j < topSystems.length; j++) {
      const key1 = `${topSystems[i].system}-${topSystems[j].system}`;
      const key2 = `${topSystems[j].system}-${topSystems[i].system}`;
      const connection = connections[key1] || connections[key2];
      if (connection) {
        relevant.push(`- ${topSystems[i].system} ↔ ${topSystems[j].system}: ${connection}`);
      }
    }
  }
  
  return relevant.join('\n') || "- Complex multi-system interactions requiring holistic approach";
}

function generateRootCause(persona, systems) {
  if (persona.includes("Post-COVID")) {
    return "Post-viral syndrome with persistent inflammation affecting multiple systems. Spike protein persistence and mitochondrial dysfunction are likely drivers.";
  } else if (persona.includes("thyroid")) {
    return "Thyroid dysfunction appears to be the metabolic lynchpin, creating downstream effects on energy, mood, weight, and cardiovascular health.";
  } else if (persona.includes("driver")) {
    return "Sedentary lifestyle combined with metabolic syndrome creating a cascade of musculoskeletal, cardiovascular, and endocrine dysfunction.";
  }
  
  return "Multi-factorial causation involving chronic inflammation, oxidative stress, and system-wide compensatory patterns.";
}

// Main execution
async function main() {
  try {
    console.log("🚀 Starting Full Assessment Test");
    console.log("=================================\n");

    // Test with different personas
    for (const [key, persona] of Object.entries(testPersonas)) {
      console.log(`\n📝 Testing Persona: ${persona.name}`);
      console.log(`Profile: ${persona.profile}`);
      console.log("-----------------------------------");
      
      const result = await createTestAssessment(persona);
      
      // Add delay to simulate real assessment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Analyze the assessment
      await analyzeAssessment(result.assessment.id);
      
      console.log("\n✨ Assessment Complete!");
      console.log("=======================\n");
    }

    console.log("\n🎉 All test assessments completed successfully!");

  } catch (error) {
    console.error("\n❌ Error during test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
main();
