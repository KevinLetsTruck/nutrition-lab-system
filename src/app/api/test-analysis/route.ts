import { NextResponse } from "next/server";
import { claudeService } from "@/lib/api/claude";

export async function POST(request: Request) {
  try {
    const { labValues, clientInfo } = await request.json();

    // Use sample data if not provided - simulating concerning metabolic pattern
    const testLabValues = labValues || [
      {
        testName: "Glucose",
        value: 110,
        unit: "mg/dL",
        status: { functional: "concerning" },
        referenceRange: { low: 65, high: 99 },
        functionalRange: { low: 75, high: 95 },
      },
      {
        testName: "HDL Cholesterol",
        value: 38,
        unit: "mg/dL",
        status: { functional: "suboptimal" },
        referenceRange: { low: 40, high: 100 },
        functionalRange: { low: 55, high: 100 },
      },
      {
        testName: "Triglycerides",
        value: 185,
        unit: "mg/dL",
        status: { functional: "concerning" },
        referenceRange: { low: 0, high: 150 },
        functionalRange: { low: 0, high: 100 },
      },
      {
        testName: "BUN",
        value: 22,
        unit: "mg/dL",
        status: { functional: "suboptimal" },
        referenceRange: { low: 6, high: 20 },
        functionalRange: { low: 12, high: 16 },
      },
      {
        testName: "Creatinine",
        value: 1.2,
        unit: "mg/dL",
        status: { functional: "optimal" },
        referenceRange: { low: 0.7, high: 1.3 },
        functionalRange: { low: 0.8, high: 1.1 },
      },
    ];

    // Use sample client info if not provided - truck driver profile
    const testClientInfo = clientInfo || {
      firstName: "Mike",
      lastName: "Johnson",
      isTruckDriver: true,
      healthGoals: "Better energy, lose weight, improve heart health",
      conditions: "Pre-diabetes, high blood pressure",
      medications: "Metformin, Lisinopril",
    };

    const startTime = Date.now();
    const analysis = await claudeService.analyzeFunctionalPatterns(
      testLabValues,
      testClientInfo
    );
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      analysis,
      narrative: analysis.narrativeReport,
      summary: {
        overallHealth: analysis.summary.overallHealth,
        patternsFound: analysis.patterns.length,
        rootCausesIdentified: analysis.rootCauses.length,
        primaryConcerns: analysis.summary.primaryConcerns,
        positiveFindings: analysis.summary.positiveFindings,
        processingTime,
      },
      metadata: {
        labValuesAnalyzed: testLabValues.length,
        clientProfile: testClientInfo.isTruckDriver
          ? "Professional Truck Driver"
          : "General Client",
        timestamp: new Date().toISOString(),
        version: "3.0",
      },
    });
  } catch (error) {
    console.error("❌ Functional analysis test failed:", error);
    return NextResponse.json(
      {
        error: "Functional analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Functional Medicine Analysis Test Endpoint",
    usage:
      'POST with { "labValues": [...], "clientInfo": {...} } or use defaults',
    description:
      "Tests Kevin Rutherford's functional medicine pattern analysis",
    sampleLabValues: [
      {
        testName: "Glucose",
        value: 110,
        unit: "mg/dL",
        status: { functional: "concerning" },
        referenceRange: { low: 65, high: 99 },
        functionalRange: { low: 75, high: 95 },
      },
    ],
    sampleClientInfo: {
      firstName: "Mike",
      lastName: "Johnson",
      isTruckDriver: true,
      healthGoals: "Better energy, lose weight",
      conditions: "Pre-diabetes",
      medications: "Metformin",
    },
    features: [
      "Pattern recognition (metabolic, inflammatory, gut, HPA axis)",
      "Root cause analysis",
      "Client-friendly narrative reports",
      "Truck driver specific considerations",
      "Actionable recommendations by priority",
      "Additional testing suggestions",
    ],
    version: "3.0",
    status: "active",
  });
}
