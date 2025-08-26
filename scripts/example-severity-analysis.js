// Example of using the severity analyzer after assessment completion
// This is a demonstration - in real usage, import from the TypeScript module

// Mock implementation of the analyzer functions for demonstration
function analyzeSeverity(responses) {
  const severityScores = [];

  // Analyze digestive severity
  const digestiveSeverity = responses.find(
    (r) => r.questionId === "essential-digest-severity"
  );
  if (digestiveSeverity) {
    severityScores.push({
      category: "Digestive",
      score: digestiveSeverity.value,
      interpretation: getSeverityInterpretation(digestiveSeverity.value),
      priority: getPriority(digestiveSeverity.value),
    });
  }

  // Analyze chronic condition impact
  const chronicImpact = responses.find(
    (r) => r.questionId === "essential-chronic-impact"
  );
  if (chronicImpact) {
    severityScores.push({
      category: "Chronic Conditions",
      score: chronicImpact.value,
      interpretation: getImpactInterpretation(chronicImpact.value),
      priority: getPriority(chronicImpact.value),
    });
  }

  // Analyze inflammation
  const inflammationSeverity = responses.find(
    (r) => r.questionId === "essential-inflammation-severity"
  );
  const inflammationFrequency = responses.find(
    (r) => r.questionId === "essential-inflammation-frequency"
  );
  if (inflammationSeverity && inflammationFrequency) {
    const combinedScore = Math.round(
      inflammationSeverity.value * 0.6 +
        getFrequencyScore(inflammationFrequency.value) * 0.4
    );
    severityScores.push({
      category: "Inflammation",
      score: combinedScore,
      interpretation: `${inflammationFrequency.value} at severity ${inflammationSeverity.value}/5`,
      priority: getPriority(combinedScore),
    });
  }

  // Sort by priority and score
  severityScores.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    return priorityDiff !== 0 ? priorityDiff : b.score - a.score;
  });

  return severityScores;
}

function getSeverityInterpretation(score) {
  if (score <= 1) return "Minimal symptoms";
  if (score <= 2) return "Mild symptoms - monitor";
  if (score <= 3) return "Moderate symptoms - intervention recommended";
  if (score <= 4) return "Significant symptoms - priority treatment";
  return "Severe symptoms - immediate attention needed";
}

function getImpactInterpretation(score) {
  if (score <= 1) return "Minimal impact on daily life";
  if (score <= 2) return "Some limitations";
  if (score <= 3) return "Moderate interference with activities";
  if (score <= 4) return "Significant disability";
  return "Severe disability - major life impact";
}

function getPriority(score) {
  if (score <= 1) return "low";
  if (score <= 2) return "medium";
  if (score <= 4) return "high";
  return "critical";
}

function getFrequencyScore(frequency) {
  const frequencyMap = {
    Daily: 5,
    "Multiple times daily": 5,
    "4-6 times per week": 4,
    "Several times per week": 4,
    "2-3 times per week": 3,
    Weekly: 2,
    "A few times per month": 1,
    "Monthly or less": 0,
  };
  return frequencyMap[frequency] || 0;
}

function generateSeverityReport(severityScores) {
  if (severityScores.length === 0) {
    return "No significant symptoms reported requiring severity assessment.";
  }

  const criticalItems = severityScores.filter((s) => s.priority === "critical");
  const highItems = severityScores.filter((s) => s.priority === "high");

  let report = "## Severity Assessment Summary\n\n";

  if (criticalItems.length > 0) {
    report += "### 🚨 Critical Priority Areas:\n";
    criticalItems.forEach((item) => {
      report += `- **${item.category}**: ${item.interpretation} (Score: ${item.score}/5)\n`;
    });
    report += "\n";
  }

  if (highItems.length > 0) {
    report += "### ⚠️ High Priority Areas:\n";
    highItems.forEach((item) => {
      report += `- **${item.category}**: ${item.interpretation} (Score: ${item.score}/5)\n`;
    });
  }

  return report;
}

// Example responses from a completed assessment
const sampleResponses = [
  // Digestive symptoms selected
  {
    questionId: "essential-digestive-issues-details",
    value: ["Bloating", "Gas", "Stomach pain", "Heartburn/Acid reflux"],
  },
  // High digestive severity
  {
    questionId: "essential-digest-severity",
    value: 4, // Severe
  },
  // Chronic conditions selected
  {
    questionId: "essential-chronic-conditions-list",
    value: ["Diabetes (Type 2)", "High Blood Pressure", "Arthritis"],
  },
  // Moderate chronic impact
  {
    questionId: "essential-chronic-impact",
    value: 3, // Significant
  },
  // Inflammation symptoms
  {
    questionId: "essential-inflammation-details",
    value: ["Joint pain - knees", "Morning stiffness", "Muscle aches"],
  },
  // Daily inflammation
  {
    questionId: "essential-inflammation-frequency",
    value: "Daily",
  },
  // Moderate inflammation severity
  {
    questionId: "essential-inflammation-severity",
    value: 3,
  },
  // Anxiety symptoms
  {
    questionId: "essential-anxiety-mood-details",
    value: ["General anxiety", "Difficulty concentrating", "Stress-triggered"],
  },
  // Several times per week
  {
    questionId: "essential-anxiety-frequency",
    value: "Several times per week",
  },
  // Moderate impact
  {
    questionId: "essential-anxiety-impact",
    value: 2,
  },
];

// Analyze severity
console.log("🔬 Analyzing Assessment Severity...\n");
const severityScores = analyzeSeverity(sampleResponses);

// Display results
console.log("📊 Severity Analysis Results:\n");
severityScores.forEach((score, index) => {
  console.log(`${index + 1}. ${score.category}`);
  console.log(`   Score: ${score.score}/5`);
  console.log(`   Priority: ${score.priority.toUpperCase()}`);
  console.log(`   Interpretation: ${score.interpretation}`);
  console.log("");
});

// Generate report
console.log("📄 Generated Report:\n");
const report = generateSeverityReport(severityScores);
console.log(report);

// Treatment prioritization
console.log("\n🎯 Treatment Prioritization:");
console.log("\nBased on this assessment, the treatment priority should be:");
const criticalAreas = severityScores.filter((s) => s.priority === "critical");
const highAreas = severityScores.filter((s) => s.priority === "high");

if (criticalAreas.length > 0) {
  console.log("\n1. IMMEDIATE ATTENTION:");
  criticalAreas.forEach((area) => {
    console.log(`   - ${area.category}: ${area.interpretation}`);
  });
}

if (highAreas.length > 0) {
  console.log("\n2. HIGH PRIORITY:");
  highAreas.forEach((area) => {
    console.log(`   - ${area.category}: ${area.interpretation}`);
  });
}

console.log("\n💡 Clinical Insights:");
console.log("- Multiple high-severity areas suggest systemic issues");
console.log("- Daily symptoms indicate need for immediate intervention");
console.log("- Combined inflammation and digestive issues may be related");
console.log("- Consider comprehensive functional medicine approach");
