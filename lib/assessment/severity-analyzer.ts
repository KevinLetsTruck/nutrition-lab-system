export interface SeverityScore {
  category: string;
  score: number;
  interpretation: string;
  priority: "low" | "medium" | "high" | "critical";
}

export function analyzeSeverity(responses: any[]): SeverityScore[] {
  const severityScores: SeverityScore[] = [];

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
    const combinedScore = calculateCombinedScore(
      inflammationSeverity.value,
      getFrequencyScore(inflammationFrequency.value)
    );
    severityScores.push({
      category: "Inflammation",
      score: combinedScore,
      interpretation: `${inflammationFrequency.value} at severity ${inflammationSeverity.value}/5`,
      priority: getPriority(combinedScore),
    });
  }

  // Analyze anxiety/mood
  const anxietyImpact = responses.find(
    (r) => r.questionId === "essential-anxiety-impact"
  );
  const anxietyFrequency = responses.find(
    (r) => r.questionId === "essential-anxiety-frequency"
  );
  if (anxietyImpact && anxietyFrequency) {
    const combinedScore = calculateCombinedScore(
      anxietyImpact.value,
      getFrequencyScore(anxietyFrequency.value)
    );
    severityScores.push({
      category: "Mental Health",
      score: combinedScore,
      interpretation: `${anxietyFrequency.value} with ${getImpactInterpretation(
        anxietyImpact.value
      ).toLowerCase()}`,
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

function getSeverityInterpretation(score: number): string {
  if (score <= 1) return "Minimal symptoms";
  if (score <= 2) return "Mild symptoms - monitor";
  if (score <= 3) return "Moderate symptoms - intervention recommended";
  if (score <= 4) return "Significant symptoms - priority treatment";
  return "Severe symptoms - immediate attention needed";
}

function getImpactInterpretation(score: number): string {
  if (score <= 1) return "Minimal impact on daily life";
  if (score <= 2) return "Some limitations";
  if (score <= 3) return "Moderate interference with activities";
  if (score <= 4) return "Significant disability";
  return "Severe disability - major life impact";
}

function getPriority(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 1) return "low";
  if (score <= 2) return "medium";
  if (score <= 4) return "high";
  return "critical";
}

function getFrequencyScore(frequency: string): number {
  const frequencyMap: Record<string, number> = {
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

function calculateCombinedScore(severity: number, frequency: number): number {
  // Weight: 60% severity, 40% frequency
  return Math.round(severity * 0.6 + frequency * 0.4);
}

// Generate summary report
export function generateSeverityReport(
  severityScores: SeverityScore[]
): string {
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
    report += "\n";
  }

  const mediumLowItems = severityScores.filter(
    (s) => s.priority === "medium" || s.priority === "low"
  );

  if (mediumLowItems.length > 0) {
    report += "### 📋 Other Areas to Monitor:\n";
    mediumLowItems.forEach((item) => {
      report += `- ${item.category}: ${item.interpretation}\n`;
    });
  }

  return report;
}
