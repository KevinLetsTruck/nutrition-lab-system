import { Anthropic } from "@anthropic-ai/sdk";
import {
  AssessmentSession,
  Finding,
  Recommendation,
  RiskFactor,
  AIAnalysisResult,
} from "@/lib/assessment/types";

/**
 * AI service for analyzing assessment responses using Claude
 * Following the existing pattern from the codebase
 */
export class AssessmentAnalyzer {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is required for AI analysis");
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze assessment responses and generate clinical insights
   */
  async analyzeAssessment(data: {
    client: any;
    template: any;
    responses: any[];
    scores: any[];
  }): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(data);

      const response = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        temperature: 0.2, // Lower temperature for more consistent clinical analysis
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response format from Claude");
      }

      const analysis = JSON.parse(content.text);

      return {
        id: `ai_analysis_${Date.now()}`,
        sessionId: "", // Will be set by caller
        analyzedAt: new Date(),
        model: "claude-3-opus",
        findings: this.parseFindings(analysis.findings || []),
        recommendations: this.parseRecommendations(
          analysis.recommendations || []
        ),
        riskFactors: this.parseRiskFactors(analysis.riskFactors || []),
        confidence: analysis.confidence || 0.85,
      };
    } catch (error) {
      console.error("AI analysis error:", error);
      throw new Error("Failed to analyze assessment");
    }
  }

  /**
   * Build the prompt for Claude analysis
   */
  private buildAnalysisPrompt(data: any): string {
    const { client, template, responses, scores } = data;

    return `You are an expert functional medicine practitioner analyzing patient assessment data. 
Please analyze the following assessment results and provide clinical insights.

PATIENT INFORMATION:
- Name: ${client.firstName} ${client.lastName}
- Age: ${this.calculateAge(client.dateOfBirth)}
- Truck Driver: ${client.isTruckDriver ? "Yes" : "No"}
- Health Goals: ${JSON.stringify(client.healthGoals || "Not specified")}
- Current Medications: ${JSON.stringify(client.medications || "None")}
- Medical Conditions: ${JSON.stringify(client.conditions || "None")}
- Allergies: ${JSON.stringify(client.allergies || "None")}

ASSESSMENT: ${template.name}
${template.description}

RESPONSES:
${responses
  .map((r) => `- ${r.question} (${r.category}): ${r.value}`)
  .join("\n")}

CALCULATED SCORES:
${scores
  .map(
    (s) =>
      `- ${s.ruleName}: ${s.score}/${s.maxScore} (${Math.round(
        (s.score / s.maxScore) * 100
      )}%)`
  )
  .join("\n")}

Please provide a comprehensive analysis in the following JSON format:
{
  "findings": [
    {
      "type": "symptom|pattern|correlation|anomaly",
      "description": "Clear description of the finding",
      "severity": "low|medium|high|critical",
      "relatedQuestions": ["question texts that support this finding"],
      "evidence": ["specific evidence from responses"]
    }
  ],
  "recommendations": [
    {
      "type": "supplement|lifestyle|diet|testing|referral",
      "priority": "low|medium|high|urgent",
      "title": "Brief recommendation title",
      "description": "Detailed recommendation",
      "rationale": "Why this is recommended based on findings",
      "contraindications": ["any contraindications to consider"]
    }
  ],
  "riskFactors": [
    {
      "factor": "Risk factor name",
      "level": "low|moderate|high|severe",
      "description": "Description of the risk",
      "mitigationStrategies": ["specific strategies to reduce risk"]
    }
  ],
  "confidence": 0.0-1.0
}

Focus on:
1. Identifying patterns and correlations in symptoms
2. Considering the patient's occupation as a truck driver
3. Providing practical, actionable recommendations
4. Prioritizing safety and DOT compliance if applicable
5. Suggesting appropriate functional medicine interventions

Ensure all recommendations are evidence-based and appropriate for functional medicine practice.`;
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date | string | null): string {
    if (!dateOfBirth) return "Unknown";

    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return `${age - 1} years`;
    }

    return `${age} years`;
  }

  /**
   * Parse findings from AI response
   */
  private parseFindings(findings: any[]): Finding[] {
    return findings.map((f, index) => ({
      id: `finding_${Date.now()}_${index}`,
      type: f.type || "pattern",
      description: f.description || "",
      severity: f.severity || "medium",
      relatedQuestions: f.relatedQuestions || [],
      evidence: f.evidence || [],
    }));
  }

  /**
   * Parse recommendations from AI response
   */
  private parseRecommendations(recommendations: any[]): Recommendation[] {
    return recommendations.map((r, index) => ({
      id: `rec_${Date.now()}_${index}`,
      type: r.type || "supplement",
      priority: r.priority || "medium",
      title: r.title || "",
      description: r.description || "",
      rationale: r.rationale || "",
      contraindications: r.contraindications || [],
    }));
  }

  /**
   * Parse risk factors from AI response
   */
  private parseRiskFactors(riskFactors: any[]): RiskFactor[] {
    return riskFactors.map((r, index) => ({
      id: `risk_${Date.now()}_${index}`,
      factor: r.factor || "",
      level: r.level || "moderate",
      description: r.description || "",
      mitigationStrategies: r.mitigationStrategies || [],
    }));
  }

  /**
   * Generate a summary report from the analysis
   */
  async generateSummaryReport(analysis: AIAnalysisResult): Promise<string> {
    const criticalFindings = analysis.findings.filter(
      (f) => f.severity === "critical"
    );
    const urgentRecommendations = analysis.recommendations.filter(
      (r) => r.priority === "urgent"
    );
    const highRiskFactors = analysis.riskFactors.filter(
      (r) => r.level === "high" || r.level === "severe"
    );

    let summary = "## Assessment Analysis Summary\n\n";

    if (criticalFindings.length > 0) {
      summary += "### ⚠️ Critical Findings\n";
      criticalFindings.forEach((f) => {
        summary += `- ${f.description}\n`;
      });
      summary += "\n";
    }

    if (urgentRecommendations.length > 0) {
      summary += "### 🚨 Urgent Recommendations\n";
      urgentRecommendations.forEach((r) => {
        summary += `- **${r.title}**: ${r.description}\n`;
      });
      summary += "\n";
    }

    if (highRiskFactors.length > 0) {
      summary += "### ⚡ High Risk Factors\n";
      highRiskFactors.forEach((r) => {
        summary += `- **${r.factor}** (${r.level}): ${r.description}\n`;
      });
      summary += "\n";
    }

    summary += `### 📊 Analysis Confidence: ${Math.round(
      analysis.confidence * 100
    )}%\n`;
    summary += `*Analysis performed on ${new Date(
      analysis.analyzedAt
    ).toLocaleString()}*`;

    return summary;
  }
}

// Export singleton instance
export const assessmentAnalyzer = new AssessmentAnalyzer();
