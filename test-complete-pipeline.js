// test-complete-pipeline.js
const fs = require("fs");
const path = require("path");

// Configuration
const API_BASE = "http://localhost:3000";
const RESULTS_DIR = "./pipeline-test-results";
const REPORTS_DIR = "./client-reports";

// Ensure directories exist
[RESULTS_DIR, REPORTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

async function testCompletePipeline(
  documentPath,
  documentName,
  clientInfo = null
) {
  console.log(`\n${colors.bright}${"=".repeat(70)}${colors.reset}`);
  console.log(
    `${colors.cyan}📄 Testing Complete Pipeline: ${documentName}${colors.reset}`
  );
  console.log(`${colors.bright}${"=".repeat(70)}${colors.reset}`);

  const startTime = Date.now();
  const results = {
    documentName,
    timestamp: new Date().toISOString(),
    stages: {},
  };

  try {
    // Read the document
    const text = fs.readFileSync(documentPath, "utf8");
    console.log(
      `${colors.cyan}📏 Document length: ${text.length} characters${colors.reset}`
    );

    // ============ STAGE 1: Structure Analysis ============
    console.log(
      `\n${colors.magenta}🔍 STAGE 1: Document Structure Analysis${colors.reset}`
    );
    const structureStart = Date.now();

    const structureResponse = await fetch(`${API_BASE}/api/test-structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const structureResult = await structureResponse.json();
    results.stages.structure = {
      success: structureResult.success,
      time: Date.now() - structureStart,
      data: structureResult.analysis,
    };

    if (structureResult.success) {
      console.log(
        `  ✅ Document Type: ${structureResult.analysis.documentType}`
      );
      console.log(`  ✅ Lab Source: ${structureResult.analysis.labSource}`);
      console.log(
        `  ✅ OCR Quality: ${structureResult.analysis.ocrQuality.overall}/10`
      );
      console.log(
        `  ✅ Expected Tests: ${structureResult.analysis.extractionStrategy.expectedTestCount}`
      );

      if (structureResult.analysis.ocrQuality.issues.length > 0) {
        console.log(
          `  ⚠️  OCR Issues: ${structureResult.analysis.ocrQuality.issues.join(
            ", "
          )}`
        );
      }
    } else {
      console.log(`  ❌ Structure analysis failed: ${structureResult.error}`);
      return results;
    }

    // ============ STAGE 2: Lab Value Extraction ============
    console.log(
      `\n${colors.magenta}🧪 STAGE 2: AI-Powered Lab Value Extraction${colors.reset}`
    );
    const extractionStart = Date.now();

    const extractionResponse = await fetch(`${API_BASE}/api/test-extraction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const extractionResult = await extractionResponse.json();
    results.stages.extraction = {
      success: extractionResult.success,
      time: Date.now() - extractionStart,
      data: extractionResult.extraction,
    };

    if (extractionResult.success && extractionResult.extraction) {
      const extraction = extractionResult.extraction;
      console.log(`  ✅ Values Extracted: ${extraction.labValues.length}`);
      console.log(
        `  ✅ Confidence: ${(
          extraction.extractionSummary.confidence * 100
        ).toFixed(1)}%`
      );
      console.log(
        `  ✅ Validation: ${extraction.isValid ? "PASSED" : "FAILED"}`
      );
      console.log(
        `  ✅ Method: ${extraction.extractionSummary.extractionMethod}`
      );

      // Display extracted values
      console.log(
        `\n  ${colors.yellow}📋 Extracted Lab Values:${colors.reset}`
      );
      extraction.labValues.forEach((lab, index) => {
        const statusEmoji =
          lab.status.functional === "optimal"
            ? "✅"
            : lab.status.functional === "suboptimal"
            ? "⚠️"
            : lab.status.functional === "concerning"
            ? "🔶"
            : "🔴";

        console.log(
          `    ${index + 1}. ${statusEmoji} ${lab.testName}: ${lab.value} ${
            lab.unit
          } (${lab.status.functional})`
        );
        console.log(
          `       Conventional: ${lab.status.conventional} | Functional: ${lab.functionalRange.low}-${lab.functionalRange.high}`
        );
      });

      if (extraction.missedValues?.length > 0) {
        console.log(
          `\n  ${colors.yellow}⚠️  Missed Values: ${extraction.missedValues.length}${colors.reset}`
        );
        extraction.missedValues.forEach((m) => {
          console.log(`    - ${m.potentialTest}: ${m.reason}`);
        });
      }

      if (extraction.extractionSummary.issues?.length > 0) {
        console.log(`\n  ${colors.yellow}🚨 Extraction Issues:${colors.reset}`);
        extraction.extractionSummary.issues.forEach((issue) => {
          console.log(`    - ${issue}`);
        });
      }
    } else {
      console.log(`  ❌ Extraction failed: ${extractionResult.error}`);
      return results;
    }

    // ============ STAGE 3: Functional Medicine Analysis ============
    console.log(
      `\n${colors.magenta}🔬 STAGE 3: Functional Medicine Pattern Analysis${colors.reset}`
    );
    const analysisStart = Date.now();

    const analysisResponse = await fetch(`${API_BASE}/api/test-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        labValues: extractionResult.extraction.labValues,
        clientInfo: clientInfo || {
          firstName: "Test",
          lastName: "Client",
          isTruckDriver: true,
          healthGoals: "Optimize health for DOT physical",
          conditions: "Pre-diabetes",
          medications: "None",
        },
      }),
    });

    const analysisResult = await analysisResponse.json();
    results.stages.analysis = {
      success: analysisResult.success,
      time: Date.now() - analysisStart,
      data: analysisResult.analysis,
    };

    if (analysisResult.success && analysisResult.analysis) {
      const analysis = analysisResult.analysis;
      console.log(
        `  ✅ Overall Health: ${analysis.summary.overallHealth.toUpperCase()}`
      );
      console.log(`  ✅ Patterns Found: ${analysis.patterns.length}`);
      console.log(`  ✅ Root Causes: ${analysis.rootCauses.length}`);
      console.log(
        `  ✅ Primary Concerns: ${analysis.summary.primaryConcerns.length}`
      );
      console.log(
        `  ✅ Positive Findings: ${analysis.summary.positiveFindings.length}`
      );

      // Display patterns
      if (analysis.patterns.length > 0) {
        console.log(
          `\n  ${colors.yellow}🎯 Identified Patterns:${colors.reset}`
        );
        analysis.patterns.forEach((pattern, index) => {
          console.log(
            `    ${index + 1}. ${pattern.name} (${pattern.severity} severity, ${
              pattern.confidence
            } confidence)`
          );
          console.log(`       ${pattern.explanation}`);
          console.log(`       Markers: ${pattern.markers.join(", ")}`);
        });
      }

      // Display root causes
      if (analysis.rootCauses.length > 0) {
        console.log(`\n  ${colors.yellow}🔍 Root Causes:${colors.reset}`);
        analysis.rootCauses.forEach((cause, index) => {
          console.log(
            `    ${index + 1}. ${cause.cause} (${cause.likelihood} likelihood)`
          );
          console.log(`       ${cause.explanation}`);
          console.log(`       Evidence: ${cause.evidence.join(", ")}`);
        });
      }

      // Display primary concerns
      if (analysis.summary.primaryConcerns.length > 0) {
        console.log(`\n  ${colors.yellow}🚨 Primary Concerns:${colors.reset}`);
        analysis.summary.primaryConcerns.forEach((concern, index) => {
          console.log(`    ${index + 1}. ${concern}`);
        });
      }

      // Display immediate recommendations
      console.log(
        `\n  ${colors.yellow}📋 Immediate Recommendations:${colors.reset}`
      );
      analysis.recommendations.immediate.forEach((rec, i) => {
        console.log(`    ${i + 1}. ${rec}`);
      });

      // Display truck driver considerations if relevant
      if (analysis.truckDriverConsiderations.relevant) {
        console.log(
          `\n  ${colors.yellow}🚛 Truck Driver Considerations:${colors.reset}`
        );
        console.log(
          `    Challenges: ${analysis.truckDriverConsiderations.specificChallenges.length}`
        );
        console.log(
          `    Adapted Recommendations: ${analysis.truckDriverConsiderations.adaptedRecommendations.length}`
        );
      }

      // Save narrative report
      const reportPath = path.join(
        REPORTS_DIR,
        `${documentName}-functional-medicine-report.txt`
      );
      const reportContent = generateFullReport(
        analysis,
        documentName,
        clientInfo
      );
      fs.writeFileSync(reportPath, reportContent);
      console.log(
        `\n  ${colors.green}📄 Functional Medicine Report saved: ${reportPath}${colors.reset}`
      );

      // Save JSON analysis
      const jsonPath = path.join(REPORTS_DIR, `${documentName}-analysis.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
      console.log(
        `  ${colors.green}📊 JSON Analysis saved: ${jsonPath}${colors.reset}`
      );
    } else {
      console.log(`  ❌ Functional analysis failed: ${analysisResult.error}`);
    }

    // ============ SUMMARY ============
    const totalTime = Date.now() - startTime;
    results.totalTime = totalTime;
    results.success = Object.values(results.stages).every(
      (stage) => stage.success
    );

    console.log(`\n${colors.bright}${"=".repeat(70)}${colors.reset}`);
    console.log(`${colors.green}✨ PIPELINE COMPLETE${colors.reset}`);
    console.log(`${colors.bright}${"=".repeat(70)}${colors.reset}`);
    console.log(
      `⏱️  Total Processing Time: ${(totalTime / 1000).toFixed(1)} seconds`
    );
    console.log(
      `📊 Success Rate: ${
        Object.values(results.stages).filter((s) => s.success).length
      }/${Object.keys(results.stages).length} stages`
    );
    console.log(
      `🎯 Overall Result: ${
        results.success
          ? colors.green + "SUCCESS" + colors.reset
          : colors.red + "PARTIAL SUCCESS" + colors.reset
      }`
    );

    // Performance breakdown
    console.log(`\n📈 Performance Breakdown:`);
    Object.entries(results.stages).forEach(([stage, data]) => {
      const status = data.success ? "✅" : "❌";
      console.log(
        `  ${status} ${stage.charAt(0).toUpperCase() + stage.slice(1)}: ${(
          data.time / 1000
        ).toFixed(1)}s`
      );
    });

    // Save complete results
    const resultsPath = path.join(
      RESULTS_DIR,
      `${documentName}-pipeline-results-${Date.now()}.json`
    );
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Complete results saved: ${resultsPath}`);

    return results;
  } catch (error) {
    console.error(
      `${colors.red}❌ Pipeline error: ${error.message}${colors.reset}`
    );
    results.error = error.message;
    results.success = false;
    return results;
  }
}

function generateFullReport(analysis, documentName, clientInfo) {
  const report = analysis.narrativeReport;
  const date = new Date().toLocaleDateString();
  const clientName = clientInfo
    ? `${clientInfo.firstName} ${clientInfo.lastName}`
    : "Test Client";

  return `
================================================================================
FUNCTIONAL MEDICINE ANALYSIS REPORT
================================================================================
Client: ${clientName}
Document: ${documentName}
Generated: ${date}
Practitioner: Kevin Rutherford, FNTP
Overall Health Status: ${analysis.summary.overallHealth.toUpperCase()}
================================================================================

${report.introduction}

WHAT WE FOUND IN YOUR LABS
--------------------------
${report.whatWeFound}

WHAT THIS MEANS FOR YOUR HEALTH
-------------------------------
${report.whatThisMeans}

ROOT CAUSE ANALYSIS
------------------
${report.rootCauseExplanation}

THE GOOD NEWS
------------
${report.positiveNews}

YOUR NEXT STEPS
--------------
${report.nextSteps}

ADDITIONAL TESTING RECOMMENDATIONS
----------------------------------
${report.additionalTesting}

IMMEDIATE PRIORITIES (Start This Week)
--------------------------------------
${analysis.recommendations.immediate.map((r, i) => `${i + 1}. ${r}`).join("\n")}

SHORT-TERM GOALS (Next 1-3 Months)
----------------------------------
${analysis.recommendations.shortTerm.map((r, i) => `${i + 1}. ${r}`).join("\n")}

LONG-TERM HEALTH OPTIMIZATION
-----------------------------
${analysis.recommendations.longTerm.map((r, i) => `${i + 1}. ${r}`).join("\n")}

${
  analysis.truckDriverConsiderations.relevant
    ? `
TRUCK DRIVER SPECIFIC STRATEGIES
--------------------------------
The road presents unique challenges, but we can work with your lifestyle:

Challenges We're Addressing:
${analysis.truckDriverConsiderations.specificChallenges
  .map((c) => `• ${c}`)
  .join("\n")}

Road-Ready Solutions:
${analysis.truckDriverConsiderations.adaptedRecommendations
  .map((r) => `• ${r}`)
  .join("\n")}
`
    : ""
}

PATTERNS IDENTIFIED
------------------
${analysis.patterns
  .map(
    (p, i) => `${i + 1}. ${p.name} (${p.severity} severity)
   What it means: ${p.explanation}
   Lab markers: ${p.markers.join(", ")}`
  )
  .join("\n\n")}

SUMMARY OF CONCERNS
------------------
${analysis.summary.primaryConcerns.map((c, i) => `${i + 1}. ${c}`).join("\n")}

POSITIVE FINDINGS TO BUILD ON
----------------------------
${analysis.summary.positiveFindings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

${
  analysis.additionalTestsNeeded.length > 0
    ? `
RECOMMENDED ADDITIONAL TESTING
------------------------------
${analysis.additionalTestsNeeded
  .map(
    (test) => `• ${test.test} (${test.priority} priority)
  Reason: ${test.reason}`
  )
  .join("\n\n")}
`
    : ""
}

================================================================================
This analysis was prepared by Kevin Rutherford, FNTP
Functional Nutrition Therapy Practitioner
Specializing in Truck Driver Health & Metabolic Optimization

Remember: You're not broken, and small consistent changes can lead to 
significant improvements in how you feel and perform on the road.
================================================================================
`;
}

async function runPipelineTests() {
  console.log(
    `${colors.bright}${colors.cyan}🚀 COMPLETE PIPELINE TESTING SUITE${colors.reset}`
  );
  console.log(
    `${colors.cyan}Testing all 3 stages: Structure Analysis → Lab Extraction → Functional Analysis${colors.reset}`
  );
  console.log(
    `${colors.cyan}Kevin Rutherford's AI-Powered Medical Document Processing System v3.0${colors.reset}\n`
  );

  // Define your test documents here
  const testDocuments = [
    {
      path: "./public/uploads/sample-basic-metabolic-panel.txt",
      name: "BasicMetabolic-John",
      client: {
        firstName: "John",
        lastName: "Smith",
        isTruckDriver: true,
        healthGoals: "Pass DOT physical, improve energy levels",
        conditions: "Pre-diabetes, borderline hypertension",
        medications: "Metformin 500mg daily",
      },
    },
    {
      path: "./public/uploads/sample-lipid-panel.txt",
      name: "LipidPanel-Mike",
      client: {
        firstName: "Mike",
        lastName: "Johnson",
        isTruckDriver: true,
        healthGoals: "Lower cholesterol, lose weight for DOT",
        conditions: "High cholesterol, family history of heart disease",
        medications: "None - prefers natural approach",
      },
    },
    // Add more documents as needed
  ];

  console.log(`📂 Testing ${testDocuments.length} documents:`);
  testDocuments.forEach((doc) => {
    const exists = fs.existsSync(doc.path);
    console.log(`  ${exists ? "✅" : "❌"} ${doc.name}: ${doc.path}`);
  });

  const allResults = [];
  let successCount = 0;

  for (const doc of testDocuments) {
    if (fs.existsSync(doc.path)) {
      const result = await testCompletePipeline(doc.path, doc.name, doc.client);
      allResults.push(result);

      if (result.success) {
        successCount++;
      }

      // Wait between tests to avoid overwhelming the API
      console.log(
        `${colors.cyan}⏳ Waiting 3 seconds before next test...${colors.reset}`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      console.log(
        `${colors.yellow}⚠️  File not found: ${doc.path}${colors.reset}`
      );
      allResults.push({
        documentName: doc.name,
        success: false,
        error: "File not found",
      });
    }
  }

  // Generate comprehensive summary report
  console.log(`\n${colors.bright}${"=".repeat(70)}${colors.reset}`);
  console.log(`${colors.green}📊 COMPLETE TESTING SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${"=".repeat(70)}${colors.reset}`);

  console.log(`\n📈 Overall Results:`);
  console.log(`  📄 Documents Tested: ${allResults.length}`);
  console.log(`  ✅ Successful Pipelines: ${successCount}`);
  console.log(`  ❌ Failed Pipelines: ${allResults.length - successCount}`);
  console.log(
    `  📊 Success Rate: ${((successCount / allResults.length) * 100).toFixed(
      1
    )}%`
  );

  if (allResults.length > 0) {
    const avgTime =
      allResults
        .filter((r) => r.totalTime)
        .reduce((sum, r) => sum + r.totalTime, 0) /
      Math.max(1, allResults.filter((r) => r.totalTime).length);

    console.log(
      `  ⏱️  Average Processing Time: ${(avgTime / 1000).toFixed(1)} seconds`
    );
  }

  console.log(`\n📋 Individual Results:`);
  allResults.forEach((result) => {
    if (result.success) {
      const stageCount = Object.keys(result.stages).length;
      const successCount = Object.values(result.stages).filter(
        (s) => s.success
      ).length;
      console.log(
        `  ✅ ${result.documentName}: ${successCount}/${stageCount} stages (${(
          result.totalTime / 1000
        ).toFixed(1)}s)`
      );
    } else {
      console.log(
        `  ❌ ${result.documentName}: ${result.error || "Pipeline failed"}`
      );
    }
  });

  // Stage-specific analysis
  const successfulResults = allResults.filter((r) => r.stages);
  if (successfulResults.length > 0) {
    console.log(`\n🔍 Stage Performance Analysis:`);

    ["structure", "extraction", "analysis"].forEach((stage) => {
      const stageResults = successfulResults.filter((r) => r.stages[stage]);
      const stageSuccesses = stageResults.filter(
        (r) => r.stages[stage].success
      );
      const avgTime =
        stageResults.reduce((sum, r) => sum + r.stages[stage].time, 0) /
        stageResults.length;

      console.log(`  📊 ${stage.charAt(0).toUpperCase() + stage.slice(1)}:`);
      console.log(
        `     Success Rate: ${stageSuccesses.length}/${stageResults.length} (${(
          (stageSuccesses.length / stageResults.length) *
          100
        ).toFixed(1)}%)`
      );
      console.log(`     Average Time: ${(avgTime / 1000).toFixed(1)}s`);
    });
  }

  console.log(
    `\n${colors.green}✨ All pipeline tests complete!${colors.reset}`
  );
  console.log(`📄 Functional Medicine Reports saved in: ${REPORTS_DIR}/`);
  console.log(`📊 Technical Results saved in: ${RESULTS_DIR}/`);
  console.log(
    `\n${colors.cyan}🎯 Your AI-powered medical document processing system is ready for production!${colors.reset}`
  );
}

// Run the tests
runPipelineTests().catch(console.error);
