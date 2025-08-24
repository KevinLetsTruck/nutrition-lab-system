import {
  FUNCTIONAL_MEDICINE_RANGES,
  DOT_CRITICAL_VALUES,
} from "./functional-ranges";
import { prisma } from "@/lib/db/prisma";

export interface LabAssessment {
  testName: string;
  value: number;
  unit: string;
  status: "optimal" | "functional" | "conventional" | "concerning" | "critical";
  functionalStatus: "low" | "optimal" | "high";
  deviation: number; // How far from optimal range
  interpretation: string;
  truckDriverRisk?: {
    dotImpact?: string;
    careerRisk?: string;
    priority: "urgent" | "high" | "medium" | "low";
  };
}

export interface HealthPattern {
  name: string;
  confidence: number;
  affectedLabs: string[];
  description: string;
  rootCauses: string[];
  truckDriverImpact: string;
  interventions: {
    priority: number;
    category: "nutrition" | "supplements" | "lifestyle" | "medical";
    recommendation: string;
    roadCompatible: boolean;
  }[];
}

export interface FunctionalAnalysisResult {
  overallHealth: {
    score: number; // 0-100
    grade: "A" | "B" | "C" | "D" | "F";
    summary: string;
  };
  assessments: LabAssessment[];
  patterns: HealthPattern[];
  criticalFindings: LabAssessment[];
  dotRisks: {
    immediate: string[];
    monitoring: string[];
    careerThreat: boolean;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  nextSteps: string[];
}

export class FunctionalMedicineAnalyzer {
  async analyzeDocument(documentId: string): Promise<FunctionalAnalysisResult> {

    try {
      // Get lab values for this document
      const labValues = await prisma.medicalLabValue.findMany({
        where: { documentId },
        orderBy: { confidence: "desc" },
      });

      if (labValues.length === 0) {
        throw new Error("No lab values found for analysis");
      }

      // Assess each lab value against functional ranges
      const assessments = labValues.map((lab) => this.assessLabValue(lab));

      // Detect health patterns
      const patterns = this.detectHealthPatterns(assessments);

      // Identify critical findings
      const criticalFindings = assessments.filter(
        (a) => a.status === "critical"
      );

      // Assess DOT medical risks
      const dotRisks = this.assessDOTRisks(assessments);

      // Calculate overall health score
      const overallHealth = this.calculateOverallHealth(assessments, patterns);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        assessments,
        patterns
      );

      // Create next steps
      const nextSteps = this.createNextSteps(
        assessments,
        patterns,
        criticalFindings
      );

      const result: FunctionalAnalysisResult = {
        overallHealth,
        assessments,
        patterns,
        criticalFindings,
        dotRisks,
        recommendations,
        nextSteps,
      };

      // Save analysis to database
      await this.saveAnalysis(documentId, result);

      return result;
    } catch (error) {
      console.error("❌ Functional analysis error:", error);
      throw error;
    }
  }

  private assessLabValue(labValue: unknown): LabAssessment {
    const lab = labValue as any; // Type assertion for database result
    const standardName = lab.standardName?.toLowerCase();
    const testNameKey = lab.testName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    // Try to find ranges by standard name first, then by processed test name
    let ranges = standardName
      ? FUNCTIONAL_MEDICINE_RANGES[standardName]
      : undefined;
    if (!ranges) {
      ranges = FUNCTIONAL_MEDICINE_RANGES[testNameKey];
    }

    if (!ranges) {
      // No functional ranges defined, use basic assessment
      return {
        testName: lab.testName,
        value: lab.value,
        unit: lab.unit || "",
        status: "conventional",
        functionalStatus:
          lab.flag === "normal"
            ? "optimal"
            : lab.flag === "low"
            ? "low"
            : "high",
        deviation: 0,
        interpretation: `${lab.testName} is ${lab.flag || "normal"}`,
        truckDriverRisk: { priority: "low" },
      };
    }

    // Determine functional status
    const [optimalMin, optimalMax] = ranges.optimal;
    const [functionalMin, functionalMax] = ranges.functional;

    let status: LabAssessment["status"];
    let functionalStatus: LabAssessment["functionalStatus"];
    let deviation: number;

    if (
      ranges.critical &&
      (lab.value <= ranges.critical.low || lab.value >= ranges.critical.high)
    ) {
      status = "critical";
      functionalStatus = lab.value <= ranges.critical.low ? "low" : "high";
      deviation =
        lab.value <= ranges.critical.low
          ? ranges.critical.low - lab.value
          : lab.value - ranges.critical.high;
    } else if (lab.value >= optimalMin && lab.value <= optimalMax) {
      status = "optimal";
      functionalStatus = "optimal";
      deviation = 0;
    } else if (lab.value >= functionalMin && lab.value <= functionalMax) {
      status = "functional";
      functionalStatus = lab.value < optimalMin ? "low" : "high";
      deviation =
        lab.value < optimalMin
          ? optimalMin - lab.value
          : lab.value - optimalMax;
    } else {
      status = "concerning";
      functionalStatus = lab.value < functionalMin ? "low" : "high";
      deviation =
        lab.value < functionalMin
          ? functionalMin - lab.value
          : lab.value - functionalMax;
    }

    return {
      testName: lab.testName,
      value: lab.value,
      unit: lab.unit || "",
      status,
      functionalStatus,
      deviation,
      interpretation: ranges.interpretation[functionalStatus],
      truckDriverRisk: ranges.truckDriverConcerns
        ? {
            dotImpact: ranges.truckDriverConcerns.dotImpact,
            careerRisk: ranges.truckDriverConcerns.careerRisk,
            priority: ranges.truckDriverConcerns.interventionPriority || "low",
          }
        : { priority: "low" },
    };
  }

  private detectHealthPatterns(assessments: LabAssessment[]): HealthPattern[] {
    const patterns: HealthPattern[] = [];

    // Insulin Resistance Pattern
    const insulinResistanceMarkers = ["glucose", "triglycerides", "hdl"];
    const irAssessments = assessments.filter((a) =>
      insulinResistanceMarkers.some((marker) =>
        a.testName.toLowerCase().includes(marker)
      )
    );

    if (irAssessments.length >= 2) {
      const elevatedGlucose = irAssessments.find(
        (a) =>
          a.testName.toLowerCase().includes("glucose") &&
          a.functionalStatus === "high"
      );
      const elevatedTriglycerides = irAssessments.find(
        (a) =>
          a.testName.toLowerCase().includes("triglycerides") &&
          a.functionalStatus === "high"
      );
      const lowHDL = irAssessments.find(
        (a) =>
          a.testName.toLowerCase().includes("hdl") &&
          a.functionalStatus === "low"
      );

      if (
        (elevatedGlucose && elevatedTriglycerides) ||
        (elevatedGlucose && lowHDL) ||
        (elevatedTriglycerides && lowHDL)
      ) {
        patterns.push({
          name: "Insulin Resistance",
          confidence: 0.8,
          affectedLabs: irAssessments.map((a) => a.testName),
          description:
            "Pattern suggesting insulin resistance and metabolic dysfunction",
          rootCauses: [
            "Chronic high-carbohydrate diet",
            "Sedentary lifestyle from long-haul driving",
            "Chronic stress and elevated cortisol",
            "Poor sleep quality and circadian disruption",
          ],
          truckDriverImpact:
            "Increased risk of Type 2 diabetes, cardiovascular disease, and potential DOT medical disqualification",
          interventions: [
            {
              priority: 1,
              category: "nutrition",
              recommendation: "Low-carb, high-protein meals with healthy fats",
              roadCompatible: true,
            },
            {
              priority: 2,
              category: "supplements",
              recommendation:
                "Chromium 400mcg, Alpha Lipoic Acid 300mg, Berberine 500mg",
              roadCompatible: true,
            },
            {
              priority: 3,
              category: "lifestyle",
              recommendation: "Walking 10 minutes every 2 hours of driving",
              roadCompatible: true,
            },
          ],
        });
      }
    }

    // Hypothyroid Pattern
    const thyroidMarkers = ["tsh", "freet4", "freet3"];
    const thyroidAssessments = assessments.filter((a) =>
      thyroidMarkers.some((marker) =>
        a.testName
          .toLowerCase()
          .replace(/\s/g, "")
          .includes(marker.replace(/\s/g, ""))
      )
    );

    if (thyroidAssessments.length >= 1) {
      const elevatedTSH = thyroidAssessments.find(
        (a) =>
          a.testName.toLowerCase().includes("tsh") &&
          a.functionalStatus === "high"
      );
      const lowT4 = thyroidAssessments.find(
        (a) =>
          a.testName.toLowerCase().includes("t4") &&
          a.functionalStatus === "low"
      );
      const lowT3 = thyroidAssessments.find(
        (a) =>
          a.testName.toLowerCase().includes("t3") &&
          a.functionalStatus === "low"
      );

      if (elevatedTSH || lowT4 || lowT3) {
        patterns.push({
          name: "Hypothyroid Pattern",
          confidence: elevatedTSH ? 0.9 : 0.7,
          affectedLabs: thyroidAssessments.map((a) => a.testName),
          description: "Pattern suggesting underactive thyroid function",
          rootCauses: [
            "Iodine and selenium deficiency",
            "Chronic stress affecting HPA axis",
            "Autoimmune thyroiditis",
            "Environmental toxin exposure (diesel fumes)",
          ],
          truckDriverImpact:
            "Fatigue, brain fog, and depression affecting driving safety and job performance",
          interventions: [
            {
              priority: 1,
              category: "medical",
              recommendation:
                "Comprehensive thyroid panel including antibodies",
              roadCompatible: false,
            },
            {
              priority: 2,
              category: "supplements",
              recommendation:
                "Iodine/Kelp complex, Selenium 200mcg, Tyrosine 500mg",
              roadCompatible: true,
            },
            {
              priority: 3,
              category: "nutrition",
              recommendation:
                "Avoid soy, increase sea vegetables and Brazil nuts",
              roadCompatible: true,
            },
          ],
        });
      }
    }

    // Chronic Inflammation Pattern
    const inflammationMarkers = ["crp", "esr"];
    const inflammationAssessments = assessments.filter((a) =>
      inflammationMarkers.some((marker) =>
        a.testName.toLowerCase().includes(marker)
      )
    );

    if (inflammationAssessments.some((a) => a.functionalStatus === "high")) {
      patterns.push({
        name: "Chronic Inflammation",
        confidence: 0.7,
        affectedLabs: inflammationAssessments.map((a) => a.testName),
        description:
          "Elevated inflammatory markers indicating systemic inflammation",
        rootCauses: [
          "Poor diet high in processed foods",
          "Gut dysbiosis and intestinal permeability",
          "Chronic stress and poor sleep",
          "Environmental toxin exposure",
        ],
        truckDriverImpact:
          "Accelerated aging, increased disease risk, and reduced recovery from stress",
        interventions: [
          {
            priority: 1,
            category: "nutrition",
            recommendation:
              "Anti-inflammatory diet: eliminate processed foods, add turmeric, omega-3s",
            roadCompatible: true,
          },
          {
            priority: 2,
            category: "supplements",
            recommendation:
              "Curcumin 500mg, Algae Omega-3 2g, Probiotics 50B CFU",
            roadCompatible: true,
          },
          {
            priority: 3,
            category: "lifestyle",
            recommendation:
              "Stress reduction techniques and improved sleep hygiene",
            roadCompatible: true,
          },
        ],
      });
    }

    // Anemia Pattern
    const anemiaMarkers = [
      "hemoglobin",
      "hematocrit",
      "rbc",
      "iron",
      "ferritin",
    ];
    const anemiaAssessments = assessments.filter((a) =>
      anemiaMarkers.some((marker) => a.testName.toLowerCase().includes(marker))
    );

    const lowHemoglobin = anemiaAssessments.find(
      (a) =>
        a.testName.toLowerCase().includes("hemoglobin") &&
        a.functionalStatus === "low"
    );
    const lowIron = anemiaAssessments.find(
      (a) =>
        (a.testName.toLowerCase().includes("iron") ||
          a.testName.toLowerCase().includes("ferritin")) &&
        a.functionalStatus === "low"
    );

    if (
      lowHemoglobin ||
      anemiaAssessments.filter((a) => a.functionalStatus === "low").length >= 2
    ) {
      patterns.push({
        name: "Iron Deficiency Anemia",
        confidence: lowHemoglobin && lowIron ? 0.9 : 0.7,
        affectedLabs: anemiaAssessments.map((a) => a.testName),
        description: "Pattern suggesting iron deficiency anemia",
        rootCauses: [
          "Poor dietary iron absorption",
          "Chronic blood loss",
          "Inadequate protein intake",
          "Gut inflammation affecting absorption",
        ],
        truckDriverImpact:
          "Fatigue, weakness, and reduced cognitive function affecting driving safety",
        interventions: [
          {
            priority: 1,
            category: "medical",
            recommendation:
              "Rule out sources of blood loss, comprehensive iron studies",
            roadCompatible: false,
          },
          {
            priority: 2,
            category: "supplements",
            recommendation: "Iron bisglycinate 25mg with Vitamin C 500mg",
            roadCompatible: true,
          },
          {
            priority: 3,
            category: "nutrition",
            recommendation:
              "Increase red meat, organ meats, and iron-rich foods",
            roadCompatible: true,
          },
        ],
      });
    }

    return patterns;
  }

  private assessDOTRisks(
    assessments: LabAssessment[]
  ): FunctionalAnalysisResult["dotRisks"] {
    const immediate: string[] = [];
    const monitoring: string[] = [];
    let careerThreat = false;

    assessments.forEach((assessment) => {
      if (assessment.truckDriverRisk?.priority === "urgent") {
        immediate.push(`${assessment.testName}: ${assessment.interpretation}`);
        if (assessment.truckDriverRisk.careerRisk) {
          careerThreat = true;
        }
      } else if (
        assessment.truckDriverRisk?.priority === "high" &&
        assessment.status === "concerning"
      ) {
        monitoring.push(`${assessment.testName}: ${assessment.interpretation}`);
      }
    });

    // Check specific DOT critical values
    const glucoseAssessment = assessments.find((a) =>
      a.testName.toLowerCase().includes("glucose")
    );
    if (
      glucoseAssessment &&
      glucoseAssessment.value > DOT_CRITICAL_VALUES.glucose.threshold
    ) {
      immediate.push(
        `Glucose ${glucoseAssessment.value} mg/dL exceeds DOT threshold - diabetes evaluation required`
      );
      careerThreat = true;
    }

    return { immediate, monitoring, careerThreat };
  }

  private calculateOverallHealth(
    assessments: LabAssessment[],
    patterns: HealthPattern[]
  ): FunctionalAnalysisResult["overallHealth"] {
    const totalAssessments = assessments.length;
    const optimalCount = assessments.filter(
      (a) => a.status === "optimal"
    ).length;
    const functionalCount = assessments.filter(
      (a) => a.status === "functional"
    ).length;
    const criticalCount = assessments.filter(
      (a) => a.status === "critical"
    ).length;

    // Base score calculation
    let score = (optimalCount * 100 + functionalCount * 80) / totalAssessments;

    // Deduct for critical findings
    score -= criticalCount * 20;

    // Deduct for patterns (more patterns = more dysfunction)
    score -= patterns.length * 10;

    // Ensure score stays in bounds
    score = Math.max(0, Math.min(100, score));

    let grade: "A" | "B" | "C" | "D" | "F";
    let summary: string;

    if (score >= 90) {
      grade = "A";
      summary = "Excellent health - optimal ranges across most markers";
    } else if (score >= 80) {
      grade = "B";
      summary = "Good health - mostly functional with room for optimization";
    } else if (score >= 70) {
      grade = "C";
      summary = "Fair health - several areas need attention and improvement";
    } else if (score >= 60) {
      grade = "D";
      summary =
        "Poor health - multiple dysfunction patterns require intervention";
    } else {
      grade = "F";
      summary =
        "Critical health concerns - immediate medical attention recommended";
    }

    return { score: Math.round(score), grade, summary };
  }

  private generateRecommendations(
    assessments: LabAssessment[],
    patterns: HealthPattern[]
  ): FunctionalAnalysisResult["recommendations"] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Add critical finding recommendations
    assessments
      .filter((a) => a.status === "critical")
      .forEach((assessment) => {
        immediate.push(
          `Address critical ${assessment.testName} level - consult physician immediately`
        );
      });

    // Add pattern-based recommendations
    patterns.forEach((pattern) => {
      pattern.interventions.forEach((intervention) => {
        if (intervention.priority === 1) {
          immediate.push(intervention.recommendation);
        } else if (intervention.priority === 2) {
          shortTerm.push(intervention.recommendation);
        } else {
          longTerm.push(intervention.recommendation);
        }
      });
    });

    // Add truck driver specific recommendations
    const concerningAssessments = assessments.filter(
      (a) => a.status === "concerning" && a.truckDriverRisk?.priority === "high"
    );

    if (concerningAssessments.length > 0) {
      shortTerm.push("Schedule comprehensive DOT medical evaluation");
      shortTerm.push(
        "Implement truck cab exercise routine for metabolic health"
      );
      longTerm.push(
        "Consider career sustainability planning with health optimization"
      );
    }

    // Add general truck driver health recommendations
    if (patterns.length > 0) {
      longTerm.push(
        "Develop road-compatible meal prep system for consistent nutrition"
      );
      longTerm.push(
        "Install blackout curtains and white noise for better sleep quality"
      );
      longTerm.push(
        "Create stress management routine compatible with driving schedule"
      );
    }

    return { immediate, shortTerm, longTerm };
  }

  private createNextSteps(
    assessments: LabAssessment[],
    patterns: HealthPattern[],
    criticalFindings: LabAssessment[]
  ): string[] {
    const steps: string[] = [];

    if (criticalFindings.length > 0) {
      steps.push(
        "🚨 Schedule immediate physician consultation for critical findings"
      );
    }

    if (patterns.length > 0) {
      steps.push("📋 Implement pattern-specific intervention protocols");
    }

    if (assessments.some((a) => a.truckDriverRisk?.priority === "high")) {
      steps.push(
        "🚛 Review DOT medical requirements and optimize for certification"
      );
    }

    steps.push("🔄 Retest key markers in 6-8 weeks to monitor progress");
    steps.push(
      "📞 Schedule follow-up consultation to review protocol effectiveness"
    );

    return steps;
  }

  private async saveAnalysis(
    documentId: string,
    result: FunctionalAnalysisResult
  ): Promise<void> {
    try {
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: {
          metadata: {
            ...(
              await prisma.medicalDocument.findUnique({
                where: { id: documentId },
                select: { metadata: true },
              })
            )?.metadata,
            functionalAnalysisComplete: true,
            overallHealthScore: result.overallHealth.score,
            healthGrade: result.overallHealth.grade,
            patternsDetected: result.patterns.length,
            criticalFindings: result.criticalFindings.length,
            dotRiskLevel: result.dotRisks.careerThreat
              ? "high"
              : result.dotRisks.immediate.length > 0
              ? "medium"
              : "low",
          },
        },
      });

    } catch (error) {
      console.error("❌ Failed to save analysis:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const functionalAnalyzer = new FunctionalMedicineAnalyzer();
