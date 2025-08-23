const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to generate comprehensive AI analysis
async function generateAIAnalysis(assessmentId) {
  try {
    // Fetch assessment with all responses
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

    const client = assessment.client;
    const responses = assessment.responses;

    // Group responses by body system
    const systemResponses = {};
    const systemScores = {};
    
    responses.forEach(response => {
      const system = response.clinicalFlags?.bodySystem || 'UNKNOWN';
      if (!systemResponses[system]) {
        systemResponses[system] = [];
        systemScores[system] = { total: 0, count: 0, symptoms: [] };
      }
      
      systemResponses[system].push(response);
      const severity = response.clinicalFlags?.severity || 0;
      systemScores[system].total += severity * 4; // Convert back to 0-4 scale
      systemScores[system].count++;
      
      if (severity >= 0.5) { // Moderate or higher
        systemScores[system].symptoms.push({
          question: response.questionText,
          severity: severity
        });
      }
    });

    // Calculate averages and percentages
    Object.keys(systemScores).forEach(system => {
      const score = systemScores[system];
      score.average = score.count > 0 ? score.total / score.count : 0;
      score.percentage = (score.average / 4) * 100;
      score.severity = 
        score.percentage >= 75 ? 'CRITICAL' :
        score.percentage >= 50 ? 'HIGH' :
        score.percentage >= 25 ? 'MODERATE' : 'LOW';
    });

    // Sort systems by severity
    const sortedSystems = Object.entries(systemScores)
      .sort((a, b) => b[1].percentage - a[1].percentage)
      .filter(([system, _]) => system !== 'UNKNOWN');

    // Generate the analysis
    console.log("\n" + "=".repeat(80));
    console.log("COMPREHENSIVE FUNCTIONAL MEDICINE ASSESSMENT ANALYSIS");
    console.log("=".repeat(80));
    
    console.log(`\n📋 PATIENT INFORMATION:`);
    console.log(`Name: ${client.firstName} ${client.lastName}`);
    console.log(`Age: ${client.dateOfBirth ? Math.floor((new Date() - new Date(client.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'}`);
    console.log(`Gender: ${client.gender || 'Not specified'}`);
    console.log(`Assessment Date: ${new Date().toLocaleDateString()}`);
    console.log(`Total Questions Answered: ${responses.length}`);

    console.log(`\n📊 BODY SYSTEM ANALYSIS:`);
    console.log("─".repeat(60));
    sortedSystems.forEach(([system, score], index) => {
      console.log(`\n${index + 1}. ${system} SYSTEM`);
      console.log(`   Severity: ${score.severity} (${score.percentage.toFixed(1)}%)`);
      console.log(`   Key Symptoms:`);
      score.symptoms.slice(0, 3).forEach(symptom => {
        console.log(`   • ${symptom.question} (${(symptom.severity * 100).toFixed(0)}% severity)`);
      });
    });

    console.log(`\n\n🔍 ROOT CAUSE ANALYSIS:`);
    console.log("─".repeat(60));
    
    const topSystems = sortedSystems.slice(0, 3).map(([s, _]) => s);
    
    // Pattern recognition
    if (topSystems.includes('ENDOCRINE') && topSystems.includes('NEUROLOGICAL')) {
      console.log("• HPA Axis Dysfunction Pattern Detected");
      console.log("  - Chronic stress impacting hormone production");
      console.log("  - Likely cortisol dysregulation affecting energy and mood");
    }
    
    if (topSystems.includes('DIGESTIVE') && topSystems.includes('IMMUNE')) {
      console.log("• Gut-Immune Axis Dysfunction");
      console.log("  - Intestinal permeability likely compromising immune function");
      console.log("  - Dysbiosis contributing to systemic inflammation");
    }
    
    if (topSystems.includes('CARDIOVASCULAR') && topSystems.includes('RESPIRATORY')) {
      console.log("• Cardiopulmonary Compromise");
      console.log("  - Reduced oxygen delivery affecting multiple systems");
      console.log("  - Consider post-viral or environmental factors");
    }

    console.log(`\n\n💊 PRIORITY INTERVENTIONS:`);
    console.log("─".repeat(60));
    
    sortedSystems.slice(0, 3).forEach(([system, score]) => {
      console.log(`\n${system} SYSTEM PROTOCOL:`);
      
      switch(system) {
        case 'ENDOCRINE':
          console.log("1. Adrenal Support:");
          console.log("   - Adaptogenic herbs (Ashwagandha, Rhodiola)");
          console.log("   - B-complex vitamins");
          console.log("   - Magnesium glycinate 400mg before bed");
          console.log("2. Thyroid Support:");
          console.log("   - Comprehensive thyroid panel");
          console.log("   - Consider selenium, iodine, tyrosine");
          console.log("3. Blood Sugar Regulation:");
          console.log("   - Chromium picolinate");
          console.log("   - Alpha-lipoic acid");
          break;
          
        case 'NEUROLOGICAL':
          console.log("1. Neurotransmitter Support:");
          console.log("   - Omega-3 fatty acids (EPA/DHA 2-3g daily)");
          console.log("   - Phosphatidylserine");
          console.log("   - Lion's Mane mushroom");
          console.log("2. Inflammation Reduction:");
          console.log("   - Curcumin with piperine");
          console.log("   - Resveratrol");
          console.log("3. Sleep Optimization:");
          console.log("   - Melatonin 1-3mg");
          console.log("   - L-theanine 200mg");
          break;
          
        case 'DIGESTIVE':
          console.log("1. Gut Restoration:");
          console.log("   - Probiotic therapy (multi-strain)");
          console.log("   - L-glutamine 5g twice daily");
          console.log("   - Digestive enzymes with meals");
          console.log("2. Remove Inflammatory Foods:");
          console.log("   - Elimination diet protocol");
          console.log("   - Reduce seed oils and processed foods");
          console.log("3. Repair & Reinoculate:");
          console.log("   - Bone broth or collagen peptides");
          console.log("   - Prebiotic fiber");
          break;
          
        case 'IMMUNE':
          console.log("1. Immune Modulation:");
          console.log("   - Vitamin D3 (test and optimize to 50-80 ng/mL)");
          console.log("   - Vitamin C 1-2g daily");
          console.log("   - Zinc picolinate 30mg");
          console.log("2. Anti-inflammatory Support:");
          console.log("   - Quercetin 500mg twice daily");
          console.log("   - NAC 600mg twice daily");
          console.log("3. Gut-Immune Support:");
          console.log("   - Saccharomyces boulardii");
          console.log("   - Immunoglobulins");
          break;
          
        default:
          console.log("   - System-specific protocol to be developed");
      }
    });

    console.log(`\n\n📈 IMPLEMENTATION STRATEGY:`);
    console.log("─".repeat(60));
    console.log("\nPHASE 1 (Weeks 1-4): FOUNDATION");
    console.log("• Remove inflammatory triggers");
    console.log("• Support detoxification pathways");
    console.log("• Optimize sleep and stress management");
    console.log("• Begin foundational supplements");
    
    console.log("\nPHASE 2 (Weeks 5-12): TARGETED REPAIR");
    console.log("• Implement system-specific protocols");
    console.log("• Monitor symptom improvements weekly");
    console.log("• Adjust dosages based on response");
    console.log("• Consider advanced testing if needed");
    
    console.log("\nPHASE 3 (Weeks 13+): OPTIMIZATION");
    console.log("• Fine-tune protocols based on progress");
    console.log("• Introduce maintenance strategies");
    console.log("• Focus on prevention and longevity");
    console.log("• Reassess with follow-up questionnaire");

    console.log(`\n\n🎯 KEY RECOMMENDATIONS:`);
    console.log("─".repeat(60));
    console.log("1. IMMEDIATE ACTIONS:");
    console.log("   • Reduce inflammatory foods (seed oils, sugar, processed foods)");
    console.log("   • Improve sleep hygiene (7-9 hours, consistent schedule)");
    console.log("   • Implement stress reduction (meditation, breathing exercises)");
    console.log("   • Stay hydrated (half body weight in ounces of water daily)");
    
    console.log("\n2. LIFESTYLE MODIFICATIONS:");
    console.log("   • Regular movement (avoid prolonged sitting)");
    console.log("   • Morning sunlight exposure (15-20 minutes)");
    console.log("   • Limit blue light exposure after sunset");
    console.log("   • Practice time-restricted eating (12-14 hour fast)");
    
    console.log("\n3. MONITORING:");
    console.log("   • Track symptoms daily in a journal");
    console.log("   • Note energy levels, mood, and digestion");
    console.log("   • Weekly check-ins on protocol adherence");
    console.log("   • Monthly progress photos and measurements");

    console.log(`\n\n⚠️  IMPORTANT NOTES:`);
    console.log("─".repeat(60));
    console.log("• This analysis is for educational purposes only");
    console.log("• Consult with your healthcare provider before starting any new protocol");
    console.log("• Dosages may need adjustment based on individual response");
    console.log("• Some recommendations may interact with medications");
    
    console.log(`\n\n📊 CONFIDENCE METRICS:`);
    console.log("─".repeat(60));
    console.log(`Analysis Confidence: ${responses.length >= 50 ? 'HIGH' : responses.length >= 20 ? 'MODERATE' : 'LOW'} (based on ${responses.length} responses)`);
    console.log(`Pattern Recognition: ${sortedSystems[0][1].percentage >= 60 ? 'STRONG' : 'MODERATE'}`);
    console.log(`Recommended Re-assessment: ${sortedSystems[0][1].severity === 'CRITICAL' ? '4 weeks' : '8-12 weeks'}`);
    
    console.log("\n" + "=".repeat(80));
    console.log("END OF ASSESSMENT ANALYSIS");
    console.log("=".repeat(80) + "\n");

    return {
      topSystems: sortedSystems.slice(0, 3),
      totalQuestions: responses.length,
      overallSeverity: sortedSystems[0][1].severity
    };

  } catch (error) {
    console.error("Error generating analysis:", error);
    throw error;
  }
}

// Main function to run analysis on recent assessments
async function main() {
  try {
    // Find recent completed assessments
    const assessments = await prisma.clientAssessment.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          not: null
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 5,
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (assessments.length === 0) {
      console.log("No completed assessments found. Run test-assessment-simulation.js first.");
      return;
    }

    console.log(`Found ${assessments.length} completed assessments:\n`);
    
    for (const assessment of assessments) {
      console.log(`\nAnalyzing assessment for ${assessment.client.firstName} ${assessment.client.lastName}...`);
      await generateAIAnalysis(assessment.id);
      
      // Add a delay between analyses for readability
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
main();
