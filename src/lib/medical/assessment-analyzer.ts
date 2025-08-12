/**
 * Assessment Analyzer
 * Analyzes NAQ and Symptom Burden assessment results
 */

import { prisma } from "@/lib/db/prisma";

interface NAQScore {
  sectionName: string;
  score: number;
  maxPossible: number;
  percentage: number;
  severity: "low" | "moderate" | "high" | "critical";
  interpretation: string;
}

interface NAQAnalysis {
  totalScore: number;
  sections: NAQScore[];
  topConcerns: string[];
  primarySystems: string[];
  recommendations: string[];
}

export class AssessmentAnalyzer {
  /**
   * Analyze NAQ responses for a client
   */
  async analyzeNAQResponses(documentId: string): Promise<NAQAnalysis> {
    // Get all NAQ values for this document
    const naqValues = await prisma.medicalLabValue.findMany({
      where: {
        documentId,
        standardName: {
          in: ["naq_question", "naq_question_binary", "naq_section_total"],
        },
      },
      orderBy: {
        testName: "asc",
      },
    });

    // Group by sections
    const sectionScores = new Map<string, NAQScore>();
    const questionResponses = new Map<number, number>();

    // Process values
    naqValues.forEach((value) => {
      if (value.standardName === "naq_section_total" && value.value) {
        const sectionName = value.testName.replace("NAQ Section Total: ", "");
        sectionScores.set(sectionName, {
          sectionName,
          score: value.value,
          maxPossible: this.getMaxScoreForSection(sectionName),
          percentage: 0,
          severity: "low",
          interpretation: "",
        });
      } else if (value.value !== null) {
        const questionNum = parseInt(value.testName.replace("NAQ Q", ""));
        questionResponses.set(questionNum, value.value);
      }
    });

    // Calculate section scores if not already present
    if (sectionScores.size === 0) {
      this.calculateSectionScores(questionResponses, sectionScores);
    }

    // Calculate percentages and severity
    sectionScores.forEach((score) => {
      score.percentage = (score.score / score.maxPossible) * 100;
      score.severity = this.getSeverity(score.percentage);
      score.interpretation = this.getInterpretation(
        score.sectionName,
        score.severity
      );
    });

    // Sort sections by score
    const sortedSections = Array.from(sectionScores.values()).sort(
      (a, b) => b.percentage - a.percentage
    );

    // Get top concerns (sections with high scores)
    const topConcerns = sortedSections
      .filter((s) => s.severity === "high" || s.severity === "critical")
      .map((s) => s.sectionName);

    // Calculate total score
    const totalScore = sortedSections.reduce((sum, s) => sum + s.score, 0);

    // Generate recommendations
    const recommendations = this.generateRecommendations(sortedSections);

    return {
      totalScore,
      sections: sortedSections,
      topConcerns,
      primarySystems: topConcerns.slice(0, 3),
      recommendations,
    };
  }

  /**
   * Get maximum possible score for a section
   */
  private getMaxScoreForSection(sectionName: string): number {
    const sectionQuestions: { [key: string]: number } = {
      "Upper Gastrointestinal": 18 * 3, // 18 questions, max 3 points each
      "Liver & Gallbladder": 25 * 3,
      "Small Intestine": 17 * 3,
      "Large Intestine": 19 * 3,
      "Mineral Needs": 29 * 3,
      "Essential Fatty Acids": 8 * 3,
      "Sugar Handling": 13 * 3,
      "Vitamin Need": 27 * 3,
      Adrenal: 26 * 3,
      Pituitary: 13 * 3,
      Thyroid: 16 * 3,
      "Female Reproductive": 20 * 3,
      "Male Hormonal": 10 * 3,
      Cardiovascular: 10 * 3,
      "Kidney & Bladder": 5 * 3,
      "Immune System": 7 * 3,
    };

    return sectionQuestions[sectionName] || 30; // Default if unknown
  }

  /**
   * Calculate section scores from individual questions
   */
  private calculateSectionScores(
    responses: Map<number, number>,
    sectionScores: Map<string, NAQScore>
  ) {
    // Question ranges for each section
    const sectionRanges: { [key: string]: [number, number] } = {
      "Upper Gastrointestinal": [52, 70],
      "Liver & Gallbladder": [71, 98],
      "Small Intestine": [99, 115],
      "Large Intestine": [116, 135],
      "Mineral Needs": [136, 164],
      "Essential Fatty Acids": [165, 172],
      "Sugar Handling": [173, 185],
      "Vitamin Need": [186, 212],
      Adrenal: [213, 238],
      Pituitary: [239, 251],
      Thyroid: [252, 267],
      "Female Reproductive": [277, 296],
      Cardiovascular: [297, 306],
      "Kidney & Bladder": [307, 311],
      "Immune System": [312, 318],
    };

    // Calculate scores for each section
    Object.entries(sectionRanges).forEach(([section, [start, end]]) => {
      let score = 0;
      for (let q = start; q <= end; q++) {
        score += responses.get(q) || 0;
      }

      sectionScores.set(section, {
        sectionName: section,
        score,
        maxPossible: this.getMaxScoreForSection(section),
        percentage: 0,
        severity: "low",
        interpretation: "",
      });
    });
  }

  /**
   * Determine severity based on percentage
   */
  private getSeverity(
    percentage: number
  ): "low" | "moderate" | "high" | "critical" {
    if (percentage >= 75) return "critical";
    if (percentage >= 50) return "high";
    if (percentage >= 25) return "moderate";
    return "low";
  }

  /**
   * Get interpretation for a section based on severity
   */
  private getInterpretation(sectionName: string, severity: string): string {
    const interpretations: { [key: string]: { [key: string]: string } } = {
      "Upper Gastrointestinal": {
        critical: "Severe digestive dysfunction, likely low stomach acid",
        high: "Significant digestive issues, possible hypochlorhydria",
        moderate: "Mild digestive concerns, monitor closely",
        low: "Normal digestive function",
      },
      "Liver & Gallbladder": {
        critical:
          "Severe hepatobiliary dysfunction, immediate attention needed",
        high: "Significant liver/gallbladder stress",
        moderate: "Mild hepatic burden, support detoxification",
        low: "Good liver function",
      },
      "Sugar Handling": {
        critical: "Severe blood sugar dysregulation, pre-diabetic risk",
        high: "Significant glucose metabolism issues",
        moderate: "Mild blood sugar instability",
        low: "Good metabolic function",
      },
      Adrenal: {
        critical: "Severe adrenal dysfunction, burnout risk",
        high: "Significant stress response dysfunction",
        moderate: "Mild adrenal stress",
        low: "Healthy stress response",
      },
    };

    const sectionInterpretations = interpretations[sectionName] || {
      critical: "Severe dysfunction in this system",
      high: "Significant issues requiring attention",
      moderate: "Mild concerns to monitor",
      low: "System functioning well",
    };

    return sectionInterpretations[severity] || "No interpretation available";
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(sections: NAQScore[]): string[] {
    const recommendations: string[] = [];

    sections.forEach((section) => {
      if (section.severity === "critical" || section.severity === "high") {
        switch (section.sectionName) {
          case "Upper Gastrointestinal":
            recommendations.push(
              "Consider digestive enzyme support and betaine HCl"
            );
            break;
          case "Liver & Gallbladder":
            recommendations.push(
              "Support liver detoxification pathways, consider bile support"
            );
            break;
          case "Sugar Handling":
            recommendations.push(
              "Implement blood sugar stabilization protocol"
            );
            break;
          case "Adrenal":
            recommendations.push(
              "Adrenal support protocol with adaptogenic herbs"
            );
            break;
          case "Essential Fatty Acids":
            recommendations.push("Increase omega-3 fatty acid intake");
            break;
          case "Mineral Needs":
            recommendations.push(
              "Comprehensive mineral supplementation recommended"
            );
            break;
        }
      }
    });

    // Add general recommendations
    if (recommendations.length === 0) {
      recommendations.push("Continue current health maintenance protocols");
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Analyze symptom burden scores
   */
  async analyzeSymptomBurden(documentId: string) {
    const symptomValues = await prisma.medicalLabValue.findMany({
      where: {
        documentId,
        standardName: "symptom_burden_score",
      },
    });

    // Calculate total burden
    const totalBurden = symptomValues.reduce(
      (sum, v) => sum + (v.value || 0),
      0
    );

    // Group by priority
    const byPriority = {
      high: symptomValues.filter((v) => v.priority === "High"),
      medium: symptomValues.filter((v) => v.priority === "Medium"),
      low: symptomValues.filter((v) => v.priority === "Low"),
    };

    // Get top symptoms
    const topSymptoms = symptomValues
      .filter((v) => v.value && v.value >= 6)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5);

    return {
      totalBurden,
      byPriority,
      topSymptoms,
      interpretation: this.interpretSymptomBurden(totalBurden),
    };
  }

  private interpretSymptomBurden(total: number): string {
    if (total >= 100)
      return "Very high symptom burden - immediate intervention needed";
    if (total >= 75)
      return "High symptom burden - comprehensive support required";
    if (total >= 50)
      return "Moderate symptom burden - targeted interventions recommended";
    if (total >= 25) return "Mild symptom burden - preventive measures advised";
    return "Low symptom burden - maintain current protocols";
  }
}

export const assessmentAnalyzer = new AssessmentAnalyzer();
