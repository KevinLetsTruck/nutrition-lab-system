/**
 * FNTP Complete Analysis API - Integration Endpoint
 * Demonstrates the complete FNTP Master Clinical Recommendation System
 * Kevin Rutherford, FNTP - Truck Driver Health Optimization
 */

import { NextRequest, NextResponse } from "next/server";
import { fntpMasterProtocolGenerator } from "@/lib/medical/fntp-master-protocol-generator";
import { DecisionTreeProcessor } from "@/lib/medical/fntp-decision-trees";
import { fntpMonitoringSystem } from "@/lib/medical/fntp-monitoring-system";
import { SupplementSelector } from "@/lib/medical/fntp-supplement-database";
import { prisma } from "@/lib/db";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    return NextResponse.json({
      message: "FNTP Complete Analysis endpoint is working",
      documentId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ GET test error:", error);
    return NextResponse.json(
      {
        error: "GET test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {

    const { id } = await params;

    const body = await req.json();
    const { generateComplete = true, includeMonitoring = true } = body;

    // Get document with all related data
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isTruckDriver: true,
            healthGoals: true,
            medications: true,
            conditions: true,
            allergies: true,
          },
        },
      },
    });

    if (document) {

    }

    if (!document) {

      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if functional analysis is complete
    const metadata = document.metadata as any;
    const hasAnalysis = metadata && "functionalAnalysisComplete" in metadata;

    // For now, allow analysis even without prior functional analysis
    // This will be enhanced later when we have the full OCR pipeline working
    if (!hasAnalysis) {

    }

    const clientName = `${document.client?.firstName || ""} ${
      document.client?.lastName || ""
    }`.trim();
    `
    );

    // STEP 1: Generate Master Protocol with Root Cause Analysis

    const masterProtocol =
      await fntpMasterProtocolGenerator.generateMasterProtocol(id);

    // STEP 2: Run Decision Tree Analysis

    const symptoms = metadata?.symptoms || [];
    const complaints = metadata?.complaints || [];

    const decisionTreeResults =
      DecisionTreeProcessor.getAutomatedRecommendations(
        complaints,
        symptoms,
        document.LabValue || []
      );

    // STEP 3: Analyze Lab Value Triggers

    const labTriggerAnalysis = await analyzeCriticalLabTriggers(
      document.LabValue || []
    );

    // STEP 4: Generate Supplement Product Analysis

    const supplementAnalysis = analyzeSupplementRecommendations(
      masterProtocol.phases
    );

    // STEP 5: Initialize Monitoring System (if requested)
    let monitoringSetup = null;
    if (includeMonitoring) {

      monitoringSetup = await fntpMonitoringSystem.initializeMonitoring(
        document.client!.id,
        `protocol_${id}`,
        masterProtocol.phases
      );
    }

    // STEP 6: Generate DOT Medical Optimization (for truckers)
    let dotOptimization = null;
    if (document.client?.isTruckDriver && masterProtocol.dotOptimization) {

      dotOptimization = {
        ...masterProtocol.dotOptimization,
        criticalFindings: labTriggerAnalysis.criticalFindings,
        timeToNextPhysical: calculateTimeToPhysical(),
        complianceRisk: assessDOTComplianceRisk(document.LabValue || []),
      };
    }

    // STEP 7: Generate Implementation Summary
    const implementationSummary = generateImplementationSummary(
      masterProtocol,
      decisionTreeResults,
      labTriggerAnalysis,
      document.client?.isTruckDriver || false
    );

    // Prepare comprehensive response
    const completeAnalysis = {
      // Core Protocol
      masterProtocol,

      // Analysis Results
      rootCauseAnalysis: masterProtocol.rootCauseAnalysis,
      decisionTreeResults,
      labTriggerAnalysis,
      supplementAnalysis,

      // Implementation Support
      clientEducation: masterProtocol.clientEducation,
      monitoringSetup,
      dotOptimization,
      implementationSummary,

      // Metadata
      analysisMetadata: {
        documentId: id,
        clientName,
        isTruckDriver: document.client?.isTruckDriver,
        generatedAt: new Date().toISOString(),
        protocolComplexity: assessProtocolComplexity(masterProtocol.phases),
        estimatedImplementationTime: "2-3 hours initial setup",
        followUpScheduled: !!monitoringSetup,
      },
    };

    // Update document metadata
    await prisma.document.update({
      where: { id },
      data: {
        metadata: {
          ...metadata,
          fntpCompleteAnalysisComplete: true,
          completeAnalysisGeneratedAt: new Date().toISOString(),
          protocolComplexity:
            completeAnalysis.analysisMetadata.protocolComplexity,
          rootCausePrimary: masterProtocol.rootCauseAnalysis.primary,
          totalSupplementsPhase1:
            masterProtocol.phases[0]?.supplements.length || 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      completeAnalysis,
      summary: {
        rootCause: masterProtocol.rootCauseAnalysis.primary,
        confidence: `${(
          masterProtocol.rootCauseAnalysis.confidence * 100
        ).toFixed(0)}%`,
        phases: masterProtocol.phases.length,
        totalSupplements: supplementAnalysis.totalProducts,
        letsTruckProducts: supplementAnalysis.letsTruckCount,
        criticalFindings: labTriggerAnalysis.criticalFindings.length,
        dotRisk: dotOptimization?.complianceRisk || "N/A",
        monitoringInitialized: !!monitoringSetup,
      },
      nextSteps: [
        "Review complete protocol with client",
        "Implement Phase 1 supplements immediately",
        "Schedule Week 2 follow-up",
        "Begin lifestyle modifications",
        "Monitor for safety alerts",
      ],
    });
  } catch (error) {
    console.error("❌ FNTP Complete Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to complete FNTP analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function analyzeCriticalLabTriggers(labValues: any[]) {
  const criticalFindings = [];
  const functionalConcerns = [];
  const recommendations = [];

  // Ensure labValues is an array
  if (!labValues || !Array.isArray(labValues)) {
    return {
      criticalFindings,
      functionalConcerns,
      recommendations,
      dotRiskLevel: "unknown",
    };
  }

  // Critical thresholds
  const critical = {
    glucose: { value: 126, name: "Fasting Glucose" },
    hba1c: { value: 6.0, name: "HbA1c" },
    systolic: { value: 140, name: "Systolic BP" },
    triglycerides: { value: 200, name: "Triglycerides" },
    crp: { value: 3.0, name: "hs-CRP" },
  };

  // Functional thresholds
  const functional = {
    glucose: { value: 86, name: "Fasting Glucose" },
    triglycerides: { value: 100, name: "Triglycerides" },
    crp: { value: 1.0, name: "hs-CRP" },
    vitamin_d: { value: 50, name: "Vitamin D" },
    ferritin: { value: 150, name: "Ferritin" },
  };

  for (const lab of labValues) {
    const testName = lab.testName?.toLowerCase() || "";

    // Check critical values
    if (testName.includes("glucose") && lab.value > critical.glucose.value) {
      criticalFindings.push(
        `Critical: ${critical.glucose.name} ${lab.value} mg/dL (>126)`
      );
      recommendations.push("Immediate diabetes evaluation required");
    }

    if (testName.includes("hba1c") && lab.value > critical.hba1c.value) {
      criticalFindings.push(
        `Critical: ${critical.hba1c.name} ${lab.value}% (>6.0)`
      );
      recommendations.push("Diabetes confirmed - medical management needed");
    }

    if (testName.includes("systolic") && lab.value > critical.systolic.value) {
      criticalFindings.push(
        `Critical: ${critical.systolic.name} ${lab.value} mmHg (>140)`
      );
      recommendations.push("Hypertension stage 2 - immediate intervention");
    }

    // Check functional ranges
    if (
      testName.includes("glucose") &&
      lab.value > functional.glucose.value &&
      lab.value <= critical.glucose.value
    ) {
      functionalConcerns.push(
        `Functional: ${functional.glucose.name} ${lab.value} mg/dL (optimal <86)`
      );
    }

    if (
      testName.includes("vitamin d") &&
      lab.value < functional.vitamin_d.value
    ) {
      functionalConcerns.push(
        `Functional: ${functional.vitamin_d.name} ${lab.value} ng/mL (optimal >50)`
      );
    }
  }

  return {
    criticalFindings,
    functionalConcerns,
    recommendations,
    requiresImmediateAttention: criticalFindings.length > 0,
  };
}

function analyzeSupplementRecommendations(phases: any[]) {
  const allSupplements = phases.flatMap((phase) => phase.supplements);
  const sourceBreakdown = {
    letstruck: allSupplements.filter((s) => s.product.source === "letstruck")
      .length,
    biotics: allSupplements.filter((s) => s.product.source === "biotics")
      .length,
    fullscript: allSupplements.filter((s) => s.product.source === "fullscript")
      .length,
  };

  const priorityBreakdown = {
    priority1: allSupplements.filter((s) => s.priority === 1).length,
    priority2: allSupplements.filter((s) => s.priority === 2).length,
    priority3: allSupplements.filter((s) => s.priority === 3).length,
    priority4: allSupplements.filter((s) => s.priority === 4).length,
  };

  // Calculate estimated monthly cost (simplified)
  const estimatedCost = {
    phase1: 150, // LetsTruck products typically $150/month
    phase2: 200,
    phase3: 120, // Maintenance reduced cost
  };

  return {
    totalProducts: allSupplements.length,
    letsTruckCount: sourceBreakdown.letstruck,
    bioticsCount: sourceBreakdown.biotics,
    fullscriptCount: sourceBreakdown.fullscript,
    priorityBreakdown,
    estimatedMonthlyCost: estimatedCost,
    complianceExpectation: allSupplements.length <= 12 ? "High" : "Moderate",
    adherenceFactors: [
      "Truck-compatible packaging",
      "Clear timing instructions",
      "LetsTruck.com priority for truckers",
      "Maximum 4 supplements per phase",
    ],
  };
}

function calculateTimeToPhysical(): string {
  // This would typically integrate with DOT physical schedules
  // For demo purposes, return estimated time
  return "6-8 weeks (typical DOT renewal cycle)";
}

function assessDOTComplianceRisk(
  labValues: any[]
): "low" | "medium" | "high" | "critical" {
  let riskFactors = 0;

  // Ensure labValues is an array
  if (!labValues || !Array.isArray(labValues)) {
    return "low";
  }

  const glucose = labValues.find((lab) =>
    lab.testName?.toLowerCase().includes("glucose")
  );
  const bp = labValues.find((lab) =>
    lab.testName?.toLowerCase().includes("systolic")
  );
  const hba1c = labValues.find((lab) =>
    lab.testName?.toLowerCase().includes("hba1c")
  );

  if (glucose && glucose.value > 126) riskFactors += 3;
  else if (glucose && glucose.value > 100) riskFactors += 1;

  if (bp && bp.value > 140) riskFactors += 3;
  else if (bp && bp.value > 130) riskFactors += 2;

  if (hba1c && hba1c.value > 6.0) riskFactors += 3;
  else if (hba1c && hba1c.value > 5.7) riskFactors += 1;

  if (riskFactors >= 6) return "critical";
  if (riskFactors >= 4) return "high";
  if (riskFactors >= 2) return "medium";
  return "low";
}

function assessProtocolComplexity(
  phases: any[]
): "simple" | "moderate" | "complex" {
  const totalSupplements = phases.reduce(
    (sum, phase) => sum + phase.supplements.length,
    0
  );
  const totalLifestyle = phases.reduce(
    (sum, phase) => sum + phase.lifestyle.length,
    0
  );

  const complexity = totalSupplements + totalLifestyle * 0.5;

  if (complexity <= 8) return "simple";
  if (complexity <= 15) return "moderate";
  return "complex";
}

function generateImplementationSummary(
  masterProtocol: any,
  decisionTrees: any,
  labTriggers: any,
  isTrucker: boolean
) {
  return {
    readinessScore: calculateReadinessScore(masterProtocol, labTriggers),
    implementationPriority:
      labTriggers.criticalFindings.length > 0 ? "urgent" : "standard",
    estimatedTimeToResults: estimateTimeToResults(
      masterProtocol.rootCauseAnalysis.primary
    ),
    keySuccessFactors: [
      "Consistent supplement compliance (>90%)",
      "Regular monitoring and check-ins",
      "Lifestyle modification implementation",
      "Open communication about concerns",
    ],
    potentialBarriers: isTrucker
      ? [
          "Irregular schedule compliance",
          "Limited healthy food access",
          "Medication storage in truck",
          "Follow-up appointment scheduling",
        ]
      : [
          "Supplement compliance",
          "Lifestyle changes",
          "Cost considerations",
          "Follow-up consistency",
        ],
    mitigation: [
      "Simplified dosing schedules",
      "Truck-specific storage solutions",
      "Flexible follow-up options",
      "Clear education materials",
    ],
  };
}

function calculateReadinessScore(protocol: any, triggers: any): number {
  let score = 85; // Base score

  // Reduce for critical findings
  score -= triggers.criticalFindings.length * 10;

  // Reduce for complex protocols
  const complexity = protocol.phases.reduce(
    (sum: number, phase: any) => sum + phase.supplements.length,
    0
  );
  if (complexity > 10) score -= 10;

  // Improve for high confidence root cause
  if (protocol.rootCauseAnalysis.confidence > 0.8) score += 10;

  return Math.max(Math.min(score, 100), 0);
}

function estimateTimeToResults(rootCause: string): string {
  const timelines = {
    gut_dysfunction:
      "2-4 weeks for initial improvement, 8-12 weeks for significant change",
    metabolic_dysfunction:
      "2-3 weeks for energy, 6-8 weeks for lab improvements",
    cardiovascular_risk:
      "1-2 weeks for initial response, 4-6 weeks for measurable change",
    hpa_axis_dysfunction:
      "1-3 weeks for energy improvement, 6-8 weeks for full adaptation",
    inflammation_immune:
      "2-4 weeks for symptom relief, 8-12 weeks for full resolution",
    detoxification_impairment:
      "3-6 weeks for initial improvement, 12+ weeks for optimization",
  };

  return (
    timelines[rootCause as keyof typeof timelines] ||
    "4-8 weeks for noticeable improvements"
  );
}
