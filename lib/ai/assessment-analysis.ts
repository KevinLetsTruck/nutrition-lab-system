import { Anthropic } from "@anthropic-ai/sdk";
import { prisma } from "../../src/lib/db/prisma";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface AnalysisResult {
  overallScore: number;
  nodeScores: Record<string, number>;
  summary: string;
  keyFindings: string[];
  riskFactors: string[];
  strengths: string[];
  primaryConcerns: string[];
  suggestedLabs: Record<string, string[]>;
  labPredictions: Record<string, string>;
  seedOilAssessment: {
    exposureLevel: number;
    damageIndicators: number;
    recoveryPotential: number;
    priorityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    recommendations: string[];
  };
}

export async function generateAssessmentAnalysis(params: {
  assessmentId: string;
  responses: any[];
  symptomProfile: any;
  aiContext: any;
}): Promise<AnalysisResult> {
  const { assessmentId, responses, symptomProfile, aiContext } = params;

  // Prepare response data for Claude
  const formattedResponses = responses.map(r => ({
    question: r.questionText,
    module: r.questionModule,
    answer: r.responseValue,
    type: r.responseType
  }));

  try {
    // Call Claude AI for comprehensive analysis
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      temperature: 0.7,
      system: `You are an expert functional medicine practitioner analyzing patient health assessments. 
      Generate a comprehensive health analysis based on the assessment responses provided.
      Focus on identifying patterns, root causes, and providing actionable recommendations.
      Be specific about lab recommendations and protocol priorities.`,
      messages: [{
        role: "user",
        content: `Analyze this health assessment and provide a detailed analysis in JSON format:

Assessment Responses:
${JSON.stringify(formattedResponses, null, 2)}

Please provide the analysis with this exact structure:
{
  "overallScore": <0-100 based on overall health status>,
  "nodeScores": {
    "NEUROLOGICAL": <0-100>,
    "DIGESTIVE": <0-100>,
    "CARDIOVASCULAR": <0-100>,
    "RESPIRATORY": <0-100>,
    "IMMUNE": <0-100>,
    "MUSCULOSKELETAL": <0-100>,
    "ENDOCRINE": <0-100>,
    "INTEGUMENTARY": <0-100>,
    "GENITOURINARY": <0-100>,
    "SPECIAL_TOPICS": <0-100>
  },
  "summary": "<comprehensive summary of findings>",
  "keyFindings": ["<finding 1>", "<finding 2>", ...],
  "riskFactors": ["<risk 1>", "<risk 2>", ...],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "primaryConcerns": ["<concern 1>", "<concern 2>", ...],
  "suggestedLabs": {
    "essential": ["<lab test 1>", "<lab test 2>", ...],
    "recommended": ["<lab test 1>", "<lab test 2>", ...],
    "optional": ["<lab test 1>", "<lab test 2>", ...]
  },
  "labPredictions": {
    "<lab marker>": "<expected result/range>"
  },
  "seedOilAssessment": {
    "exposureLevel": <1-10>,
    "damageIndicators": <1-10>,
    "recoveryPotential": <1-10>,
    "priorityLevel": "<LOW|MODERATE|HIGH|CRITICAL>",
    "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
  },
  "protocolPriority": {
    "primary": "<primary protocol focus>",
    "secondary": "<secondary protocol focus>",
    "urgency": "<LOW|MEDIUM|HIGH>"
  }
}`
      }]
    });

    // Parse Claude's response
    const analysisText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
    
    console.log(`Generated AI analysis for assessment ${assessmentId}`);
    
    return analysis;
  } catch (error) {
    console.error("Claude AI analysis failed, using enhanced fallback:", error);
    
    // Enhanced fallback analysis based on actual responses
    const likertResponses = responses.filter(r => r.responseType === 'LIKERT_SCALE');
    const averageSeverity = likertResponses.length > 0
      ? likertResponses.reduce((sum, r) => sum + (Number(r.responseValue) || 5), 0) / likertResponses.length
      : 5;

    // Determine overall health score (inverse of severity)
    // Ensure score is between 0 and 100, and handle NaN cases
    const rawScore = (10 - averageSeverity) * 10;
    const overallScore = Math.round(Math.max(0, Math.min(100, isNaN(rawScore) ? 50 : rawScore)));

  // Calculate body system scores based on symptom profile
  const moduleScores: Record<string, number> = {
    NEUROLOGICAL: 75,
    DIGESTIVE: 70,
    CARDIOVASCULAR: 85,
    RESPIRATORY: 80,
    IMMUNE: 65,
    MUSCULOSKELETAL: 90,
    ENDOCRINE: 75,
    INTEGUMENTARY: 85,
    GENITOURINARY: 80,
    SPECIAL_TOPICS: 70
  };

  // Adjust scores based on symptom severity in each module
  Object.entries(symptomProfile || {}).forEach(([module, symptoms]) => {
    const moduleSymptoms = Object.values(symptoms as Record<string, number>);
    if (moduleSymptoms.length > 0) {
      const avgModuleSeverity = moduleSymptoms.reduce((a, b) => a + b, 0) / moduleSymptoms.length;
      moduleScores[module] = Math.round((10 - avgModuleSeverity) * 10);
    }
  });

  // Check for seed oil exposure
  const seedOilResponses = aiContext?.seedOilExposure || [];
  const hasHighSeedOilExposure = seedOilResponses.length > 0;

  // Generate comprehensive analysis
  const analysis: AnalysisResult = {
    overallScore,
    nodeScores: moduleScores,
    summary: `Based on your comprehensive assessment of ${responses.length} responses, your overall health score is ${overallScore}/100. ${
      overallScore >= 80 ? "You're showing strong health indicators across most systems." :
      overallScore >= 60 ? "You have some areas that need attention but overall good health foundation." :
      overallScore >= 40 ? "Several systems show signs of dysfunction that should be addressed." :
      "Multiple systems are showing significant stress and require immediate attention."
    }`,
    
    keyFindings: [
      averageSeverity > 6 ? "High symptom severity across multiple systems" : "Moderate symptom burden",
      hasHighSeedOilExposure ? "Significant seed oil exposure detected" : "Low inflammatory oil exposure",
      moduleScores.ENDOCRINE < 60 ? "Endocrine system showing dysfunction" : "Good hormonal balance",
      moduleScores.DIGESTIVE < 60 ? "Digestive system requires support" : "Healthy digestive function",
      moduleScores.IMMUNE < 60 ? "Immune system showing signs of dysregulation" : "Strong immune function"
    ].filter(finding => finding.includes("High") || finding.includes("dysfunction") || finding.includes("requires") || finding.includes("dysregulation")),
    
    riskFactors: [
      hasHighSeedOilExposure && "Chronic inflammatory oil consumption",
      moduleScores.ENDOCRINE < 50 && "Metabolic dysfunction risk",
      moduleScores.DIGESTIVE < 60 && "Impaired nutrient absorption",
      averageSeverity > 7 && "Multiple system dysfunction"
    ].filter(Boolean) as string[],
    
    strengths: Object.entries(moduleScores)
      .filter(([_, score]) => score >= 80)
      .map(([module, score]) => `Strong ${module.toLowerCase().replace('_', ' ')} function (${score}/100)`),
    
    primaryConcerns: [
      ...Object.entries(moduleScores)
        .filter(([_, score]) => score < 60)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([module, score]) => `${module.replace('_', ' ')} dysfunction (${score}/100)`),
      hasHighSeedOilExposure && "Seed oil-induced inflammation"
    ].filter(Boolean) as string[],
    
    suggestedLabs: {
      essential: [
        "Comprehensive Metabolic Panel (CMP)",
        "Complete Blood Count (CBC)",
        "Thyroid Panel (TSH, Free T3, Free T4)",
        hasHighSeedOilExposure && "Omega-6:Omega-3 Ratio",
        moduleScores.ENDOCRINE < 60 && "Comprehensive Hormone Panel",
        moduleScores.DIGESTIVE < 60 && "GI-MAP Stool Test"
      ].filter(Boolean) as string[],
      
      recommended: [
        "hs-CRP (inflammation)",
        "Vitamin D",
        "B12 and Folate",
        moduleScores.NEUROLOGICAL < 60 && "Neurotransmitter Panel",
        moduleScores.IMMUNE < 60 && "Immune Function Panel"
      ].filter(Boolean) as string[],
      
      optional: [
        "Food Sensitivity Panel",
        "Micronutrient Testing",
        "Genetic Testing (MTHFR, etc.)"
      ]
    },
    
    labPredictions: {
      "hs-CRP": hasHighSeedOilExposure ? "Likely elevated (>3.0)" : "Normal range expected",
      "Omega-6:Omega-3": hasHighSeedOilExposure ? "Likely imbalanced (>10:1)" : "Acceptable range",
      "TSH": moduleScores.ENDOCRINE < 60 ? "May show subclinical hypothyroid" : "Normal range expected",
      "Vitamin D": averageSeverity > 6 ? "Likely suboptimal (<40 ng/mL)" : "Variable"
    },
    
    seedOilAssessment: {
      exposureLevel: hasHighSeedOilExposure ? 8 : 3,
      damageIndicators: hasHighSeedOilExposure && moduleScores.CARDIOVASCULAR < 70 ? 7 : 3,
      recoveryPotential: 8, // Most people can recover well
      priorityLevel: hasHighSeedOilExposure ? 'HIGH' : 'LOW',
      recommendations: hasHighSeedOilExposure ? [
        "Immediately eliminate all seed oils from diet",
        "Increase omega-3 intake (wild-caught fish, supplements)",
        "Add vitamin E to protect against lipid peroxidation",
        "Consider mitochondrial support supplements",
        "Track inflammatory markers monthly"
      ] : [
        "Continue avoiding seed oils",
        "Maintain healthy omega-3 intake"
      ]
    },
    protocolPriority: {
      primary: overallScore < 60 ? "Anti-inflammatory" : "Maintenance",
      secondary: hasHighSeedOilExposure ? "Detoxification" : "Optimization",
      urgency: overallScore < 40 ? "HIGH" : overallScore < 70 ? "MEDIUM" : "LOW"
    }
  };

  // Log analysis generation
  console.log(`Generated analysis for assessment ${assessmentId}`);

  return analysis;
}
