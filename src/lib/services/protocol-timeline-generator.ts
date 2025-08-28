/**
 * Protocol Timeline Generator
 *
 * Specialized timeline analysis service focused on protocol development for Claude Desktop.
 * Generates protocol-focused markdown optimized for AI-assisted treatment planning.
 *
 * Features:
 * - Protocol development context generation
 * - Critical findings analysis for treatment planning
 * - Progress trends identification
 * - Claude Desktop optimization
 * - Integration with existing timeline system
 */

interface TimelineData {
  client: any;
  assessments: any[];
  labResults: any[];
  protocols: any[];
  clinicalNotes: any[];
  medicalDocuments?: any[];
  statusChanges?: any[];
  aiAnalyses?: any[];
}

interface CriticalFinding {
  type: "assessment" | "lab" | "clinical" | "trend";
  severity: "high" | "critical";
  finding: string;
  context: string;
  protocolImplication: string;
  timelineRelevance: string;
}

interface ProgressTrend {
  system: string;
  direction: "improving" | "declining" | "stable";
  significance: "minor" | "moderate" | "major";
  timeframe: string;
  dataPoints: any[];
  protocolRecommendation: string;
}

interface ProtocolContext {
  clientProfile: string;
  primaryConcerns: string[];
  systemPriorities: string[];
  complianceFactors: string[];
  timelineConstraints: string[];
  treatmentHistory: string[];
  contraindications: string[];
  successIndicators: string[];
}

export class ProtocolTimelineGenerator {
  /**
   * Generate protocol-focused timeline analysis for Claude Desktop
   */
  static generateProtocolTimelineAnalysis(data: TimelineData): string {
    const {
      client,
      assessments,
      labResults,
      protocols,
      clinicalNotes,
      medicalDocuments = [],
      statusChanges = [],
      aiAnalyses = [],
    } = data;

    // Enhanced analysis with protocol focus
    const criticalFindings = this.analyzeCriticalFindings(
      assessments,
      labResults,
      medicalDocuments
    );
    const progressTrends = this.analyzeProgressTrends(assessments, labResults);
    const protocolContext = this.generateProtocolContext(
      client,
      assessments,
      protocols,
      clinicalNotes
    );
    const treatmentHistory = this.analyzeProtocolHistory(protocols);
    const systemInsights = this.generateSystemInsights(
      assessments,
      labResults,
      aiAnalyses
    );

    return `# 🎯 PROTOCOL DEVELOPMENT TIMELINE: ${client.firstName} ${
      client.lastName
    }

## 📋 EXECUTIVE PROTOCOL SUMMARY

**Client Profile**: ${protocolContext.clientProfile}  
**Analysis Date**: ${new Date().toLocaleDateString()}  
**Primary Focus**: Protocol optimization based on comprehensive health timeline  
**Claude Desktop Context**: Optimized for AI-assisted protocol development

---

## 📅 CHRONOLOGICAL HEALTH JOURNEY

### 📊 Assessment Evolution
${this.generateAssessmentHistory(assessments, progressTrends)}

### 🔬 Lab Results Timeline
${this.generateLabResultsTimeline(labResults, medicalDocuments)}

### 💊 Protocol History & Effectiveness
${this.generateProtocolTimeline(protocols, treatmentHistory)}

### 📝 Clinical Observations Timeline
${this.generateClinicalNotesTimeline(clinicalNotes)}

${
  statusChanges.length > 0
    ? `### 📈 Status Progression Timeline
${this.generateStatusProgressionTimeline(statusChanges)}`
    : ""
}

${
  aiAnalyses.length > 0
    ? `### 🤖 AI Analysis Insights
${this.generateAIInsightsTimeline(aiAnalyses)}`
    : ""
}

---

## 📊 PROGRESS TRENDS ANALYSIS

${this.generateProgressAnalysis(progressTrends, criticalFindings)}

---

## 🚨 CRITICAL FINDINGS FOR PROTOCOL DEVELOPMENT

${this.generateCriticalFindingsForProtocol(criticalFindings)}

---

## 🎯 PROTOCOL DEVELOPMENT CONTEXT

### Client Profile Analysis
- **Demographics**: ${protocolContext.clientProfile}
- **Primary Health Concerns**: ${protocolContext.primaryConcerns.join(", ")}
- **System Priorities**: ${protocolContext.systemPriorities.join(", ")}
- **Compliance Profile**: ${protocolContext.complianceFactors.join(", ")}

### Treatment Readiness Assessment
- **Timeline Constraints**: ${protocolContext.timelineConstraints.join(", ")}
- **Previous Treatment Response**: ${protocolContext.treatmentHistory.join(
      ", "
    )}
- **Contraindications**: ${protocolContext.contraindications.join(", ")}
- **Success Indicators**: ${protocolContext.successIndicators.join(", ")}

### Protocol Development Priorities
${this.generateProtocolPriorities(
  criticalFindings,
  progressTrends,
  protocolContext
)}

---

## 🎯 CLAUDE PROTOCOL DEVELOPMENT TEMPLATES

### Phase 1: Foundation Protocol (Weeks 1-4)
**Focus**: ${this.generatePhase1Focus(criticalFindings)}
**Supplements**: [Claude to specify based on critical findings]
**Monitoring**: [Claude to specify key biomarkers]
**Success Metrics**: [Claude to define phase 1 goals]

### Phase 2: Optimization Protocol (Weeks 5-12)  
**Focus**: ${this.generatePhase2Focus(progressTrends)}
**Adjustments**: [Claude to specify based on progress trends]
**Advanced Support**: [Claude to specify enhanced interventions]
**Success Metrics**: [Claude to define phase 2 goals]

### Phase 3: Maintenance Protocol (Weeks 13+)
**Focus**: ${this.generatePhase3Focus(protocolContext)}
**Long-term Support**: [Claude to specify maintenance strategy]
**Monitoring Schedule**: [Claude to define follow-up timeline]
**Success Metrics**: [Claude to define long-term goals]

---

## 📋 PROTOCOL DECISION SUPPORT

### Immediate Action Items
${this.generateImmediateActions(criticalFindings)}

### Treatment Sequence Considerations
${this.generateTreatmentSequence(progressTrends, criticalFindings)}

### Monitoring Requirements
${this.generateMonitoringRequirements(criticalFindings, protocols)}

### Risk Mitigation Strategies
${this.generateRiskMitigation(criticalFindings, protocolContext)}

---

*Generated on ${new Date().toLocaleDateString()} for Claude Desktop Protocol Development*  
*Timeline Analysis Version: ${this.getAnalysisVersion()}*  
*Data Sources: Assessments (${assessments.length}), Lab Results (${
      labResults.length
    }), Protocols (${protocols.length}), Clinical Notes (${
      clinicalNotes.length
    })*`;
  }

  /**
   * Analyze critical findings across all data sources
   */
  private static analyzeCriticalFindings(
    assessments: any[],
    labResults: any[],
    medicalDocuments: any[] = []
  ): CriticalFinding[] {
    const findings: CriticalFinding[] = [];

    // Assessment critical findings
    if (assessments.length > 0) {
      const latestAssessment = assessments[0];

      // Analyze response patterns for critical indicators
      if (latestAssessment.responses) {
        for (const response of latestAssessment.responses) {
          if (this.isCriticalAssessmentResponse(response)) {
            findings.push({
              type: "assessment",
              severity: this.getResponseSeverity(response),
              finding: this.formatAssessmentFinding(response),
              context: `Assessment completed ${new Date(
                latestAssessment.createdAt
              ).toLocaleDateString()}`,
              protocolImplication: this.getProtocolImplication(response),
              timelineRelevance: "Current health status indicator",
            });
          }
        }
      }
    }

    // Lab results critical findings
    const allLabValues = [
      ...labResults,
      ...medicalDocuments.flatMap((doc) => doc.labValues || []),
    ];

    for (const lab of allLabValues) {
      if (this.isCriticalLabValue(lab)) {
        findings.push({
          type: "lab",
          severity: this.getLabSeverity(lab),
          finding: `${lab.testName}: ${lab.value} ${lab.unit} (Ref: ${lab.referenceRange})`,
          context: `Lab collected ${new Date(
            lab.collectionDate || lab.testDate
          ).toLocaleDateString()}`,
          protocolImplication: this.getLabProtocolImplication(lab),
          timelineRelevance: this.getLabTimelineRelevance(lab),
        });
      }
    }

    // Trend-based critical findings
    if (assessments.length > 1) {
      const trendFindings = this.analyzeTrendFindings(assessments);
      findings.push(...trendFindings);
    }

    return findings.sort(
      (a, b) =>
        (b.severity === "critical" ? 2 : 1) -
        (a.severity === "critical" ? 2 : 1)
    );
  }

  /**
   * Analyze progress trends across time
   */
  private static analyzeProgressTrends(
    assessments: any[],
    labResults: any[]
  ): ProgressTrend[] {
    const trends: ProgressTrend[] = [];

    if (assessments.length < 2) {
      return [
        {
          system: "Overall Health",
          direction: "stable",
          significance: "minor",
          timeframe: "Baseline established",
          dataPoints: assessments,
          protocolRecommendation:
            "Establish comprehensive baseline assessment tracking",
        },
      ];
    }

    // Compare latest vs previous assessments
    const latest = assessments[0];
    const previous = assessments[1];
    const timeframe = this.calculateTimeframe(
      previous.createdAt,
      latest.createdAt
    );

    // Analyze system-specific trends
    const systems = this.identifyHealthSystems(assessments);

    for (const system of systems) {
      const trend = this.analyzeSystemTrend(
        system,
        latest,
        previous,
        assessments
      );
      if (trend) {
        trends.push({
          ...trend,
          timeframe,
          protocolRecommendation: this.getSystemProtocolRecommendation(
            system,
            trend
          ),
        });
      }
    }

    return trends;
  }

  /**
   * Generate comprehensive protocol context
   */
  private static generateProtocolContext(
    client: any,
    assessments: any[],
    protocols: any[],
    clinicalNotes: any[]
  ): ProtocolContext {
    return {
      clientProfile: this.buildClientProfile(client),
      primaryConcerns: this.identifyPrimaryConcerns(assessments),
      systemPriorities: this.identifySystemPriorities(assessments),
      complianceFactors: this.identifyComplianceFactors(client, protocols),
      timelineConstraints: this.identifyTimelineConstraints(protocols),
      treatmentHistory: this.analyzeTreatmentHistory(protocols),
      contraindications: this.identifyContraindications(client, assessments),
      successIndicators: this.identifySuccessIndicators(assessments, protocols),
    };
  }

  /**
   * Helper methods for timeline generation
   */
  private static generateAssessmentHistory(
    assessments: any[],
    progressTrends: ProgressTrend[]
  ): string {
    if (assessments.length === 0) return "No assessment history available.";

    return assessments
      .map((assessment, index) => {
        const date = new Date(assessment.createdAt).toLocaleDateString();
        const responseCount = assessment.responses?.length || 0;
        const trendIndicator =
          index === 0 ? this.getTrendIndicator(progressTrends) : "";

        return `**${date}** - ${
          assessment.status
        } Assessment (${responseCount} responses) ${trendIndicator}
  ${this.formatAssessmentInsights(assessment)}`;
      })
      .join("\n\n");
  }

  private static generateLabResultsTimeline(
    labResults: any[],
    medicalDocuments: any[] = []
  ): string {
    const allLabs = [
      ...labResults,
      ...medicalDocuments.flatMap((doc) => doc.labValues || []),
    ].sort(
      (a, b) =>
        new Date(b.collectionDate || b.testDate).getTime() -
        new Date(a.collectionDate || a.testDate).getTime()
    );

    if (allLabs.length === 0) return "No lab results available.";

    return allLabs
      .slice(0, 10)
      .map((lab) => {
        const date = new Date(
          lab.collectionDate || lab.testDate
        ).toLocaleDateString();
        const status = this.getLabStatus(lab);

        return `**${date}** - ${lab.testName}: ${lab.value} ${lab.unit} ${status}`;
      })
      .join("\n");
  }

  private static generateProtocolTimeline(
    protocols: any[],
    treatmentHistory: string[]
  ): string {
    if (protocols.length === 0) return "No protocol history available.";

    return protocols
      .map((protocol, index) => {
        const date = new Date(protocol.createdAt).toLocaleDateString();
        const effectiveness = this.assessProtocolEffectiveness(protocol);

        return `**${date}** - ${protocol.protocolName || "Protocol"} (${
          protocol.status
        })
  ${this.formatProtocolDetails(protocol)}
  ${effectiveness}`;
      })
      .join("\n\n");
  }

  private static generateClinicalNotesTimeline(clinicalNotes: any[]): string {
    if (clinicalNotes.length === 0) return "No clinical notes available.";

    return clinicalNotes
      .slice(0, 5)
      .map((note) => {
        const date = new Date(note.createdAt).toLocaleDateString();
        return `**${date}** - ${note.noteType} Session
  ${this.formatClinicalNoteInsights(note)}`;
      })
      .join("\n\n");
  }

  private static generateProgressAnalysis(
    progressTrends: ProgressTrend[],
    criticalFindings: CriticalFinding[]
  ): string {
    if (progressTrends.length === 0)
      return "Insufficient data for progress trend analysis.";

    const improving = progressTrends.filter((t) => t.direction === "improving");
    const declining = progressTrends.filter((t) => t.direction === "declining");
    const stable = progressTrends.filter((t) => t.direction === "stable");

    return `### 📈 Improving Systems (${improving.length})
${improving
  .map((t) => `- **${t.system}**: ${t.protocolRecommendation}`)
  .join("\n")}

### 📉 Declining Systems (${declining.length})
${declining
  .map((t) => `- **${t.system}**: ${t.protocolRecommendation} ⚠️`)
  .join("\n")}

### ➡️ Stable Systems (${stable.length})
${stable
  .map((t) => `- **${t.system}**: ${t.protocolRecommendation}`)
  .join("\n")}

### Protocol Development Insights
${this.generateProtocolInsights(progressTrends, criticalFindings)}`;
  }

  private static generateCriticalFindingsForProtocol(
    criticalFindings: CriticalFinding[]
  ): string {
    if (criticalFindings.length === 0)
      return "✅ No critical findings requiring immediate protocol attention.";

    const critical = criticalFindings.filter((f) => f.severity === "critical");
    const high = criticalFindings.filter((f) => f.severity === "high");

    return `${
      critical.length > 0
        ? `### 🚨 CRITICAL - Immediate Protocol Action Required
${critical.map((f) => this.formatCriticalFinding(f)).join("\n\n")}`
        : ""
    }

${
  high.length > 0
    ? `### ⚠️ HIGH PRIORITY - Protocol Integration Recommended  
${high.map((f) => this.formatCriticalFinding(f)).join("\n\n")}`
    : ""
}

### Protocol Development Summary
- **Critical Issues**: ${critical.length} requiring immediate intervention
- **High Priority**: ${high.length} for protocol integration
- **Timeline Impact**: ${this.assessTimelineImpact(criticalFindings)}`;
  }

  /**
   * Helper methods for analysis
   */
  private static buildClientProfile(client: any): string {
    const age = this.calculateAge(client.dateOfBirth);
    const gender = client.gender || "Not specified";
    const driverStatus = client.isTruckDriver
      ? "Commercial Driver"
      : "Non-driver";

    return `${age} year old ${gender}, ${driverStatus}`;
  }

  private static calculateAge(dateOfBirth: string | Date): number {
    if (!dateOfBirth) return 0;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  private static identifyPrimaryConcerns(assessments: any[]): string[] {
    if (assessments.length === 0) return ["Assessment data needed"];

    // Analyze assessment responses to identify top concerns
    // This would be enhanced with specific assessment logic
    return [
      "Health optimization",
      "Symptom management",
      "Performance enhancement",
    ];
  }

  private static identifySystemPriorities(assessments: any[]): string[] {
    // Analyze which body systems need priority attention
    return ["Digestive health", "Energy metabolism", "Sleep optimization"];
  }

  private static identifyComplianceFactors(
    client: any,
    protocols: any[]
  ): string[] {
    const factors = [];

    if (client.isTruckDriver) factors.push("Travel schedule considerations");
    if (protocols.some((p) => p.status === "completed"))
      factors.push("Previous protocol completion");

    return factors.length > 0 ? factors : ["Standard compliance profile"];
  }

  private static identifyTimelineConstraints(protocols: any[]): string[] {
    return [
      "Standard 12-week protocol timeline",
      "Monthly progress assessments",
    ];
  }

  private static isCriticalAssessmentResponse(response: any): boolean {
    // Logic to identify critical assessment responses
    return response.severity === "high" || response.score > 7;
  }

  private static isCriticalLabValue(lab: any): boolean {
    // Logic to identify critical lab values
    return lab.flag === "CRITICAL" || lab.flag === "HIGH" || lab.flag === "LOW";
  }

  private static getAnalysisVersion(): string {
    return "v2.0-protocol-focused";
  }

  // Additional helper methods would be implemented based on specific needs
  private static formatAssessmentFinding(response: any): string {
    return `${response.question?.text || "Assessment item"}: ${response.value}`;
  }

  private static getProtocolImplication(response: any): string {
    return "Requires targeted protocol intervention";
  }

  private static getLabProtocolImplication(lab: any): string {
    return `${lab.testName} optimization needed in protocol`;
  }

  private static getLabTimelineRelevance(lab: any): string {
    return "Current biomarker status for protocol planning";
  }

  private static getResponseSeverity(response: any): "high" | "critical" {
    return response.severity === "critical" ? "critical" : "high";
  }

  private static getLabSeverity(lab: any): "high" | "critical" {
    return lab.flag === "CRITICAL" ? "critical" : "high";
  }

  private static analyzeTrendFindings(assessments: any[]): CriticalFinding[] {
    // Compare assessments over time to identify concerning trends
    return [];
  }

  private static calculateTimeframe(
    start: string | Date,
    end: string | Date
  ): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    return `${Math.round(diffDays / 365)} years`;
  }

  private static identifyHealthSystems(assessments: any[]): string[] {
    return [
      "Digestive",
      "Energy",
      "Sleep",
      "Stress Response",
      "Detoxification",
    ];
  }

  private static analyzeSystemTrend(
    system: string,
    latest: any,
    previous: any,
    allAssessments: any[]
  ): ProgressTrend | null {
    // Analyze specific system trends
    return {
      system,
      direction: "stable",
      significance: "moderate",
      timeframe: "",
      dataPoints: [latest, previous],
      protocolRecommendation: `Monitor ${system.toLowerCase()} function`,
    };
  }

  private static getSystemProtocolRecommendation(
    system: string,
    trend: ProgressTrend
  ): string {
    return `${system} system: ${trend.direction} trend requires ${trend.significance} protocol adjustment`;
  }

  private static getTrendIndicator(progressTrends: ProgressTrend[]): string {
    const improving = progressTrends.filter(
      (t) => t.direction === "improving"
    ).length;
    const declining = progressTrends.filter(
      (t) => t.direction === "declining"
    ).length;

    if (improving > declining) return "📈";
    if (declining > improving) return "📉";
    return "➡️";
  }

  private static formatAssessmentInsights(assessment: any): string {
    return `Key insights from ${assessment.responses?.length || 0} responses`;
  }

  private static getLabStatus(lab: any): string {
    if (lab.flag === "HIGH") return "🔴 HIGH";
    if (lab.flag === "LOW") return "🔵 LOW";
    if (lab.flag === "CRITICAL") return "🚨 CRITICAL";
    return "✅ Normal";
  }

  private static assessProtocolEffectiveness(protocol: any): string {
    return protocol.effectivenessRating
      ? `Effectiveness: ${protocol.effectivenessRating}/5`
      : "Effectiveness assessment pending";
  }

  private static formatProtocolDetails(protocol: any): string {
    return `${protocol.protocolPhase || "Protocol"} phase with ${
      protocol.protocolSupplements?.length || 0
    } supplements`;
  }

  private static formatClinicalNoteInsights(note: any): string {
    return note.chiefComplaints
      ? `Focus: ${note.chiefComplaints.substring(0, 100)}...`
      : "Clinical observations documented";
  }

  private static generateProtocolInsights(
    progressTrends: ProgressTrend[],
    criticalFindings: CriticalFinding[]
  ): string {
    return "Protocol should prioritize systems showing declining trends while maintaining improvements in stable systems.";
  }

  private static formatCriticalFinding(finding: CriticalFinding): string {
    return `**${finding.finding}**
- **Context**: ${finding.context}
- **Protocol Implication**: ${finding.protocolImplication}
- **Timeline Relevance**: ${finding.timelineRelevance}`;
  }

  private static assessTimelineImpact(
    criticalFindings: CriticalFinding[]
  ): string {
    const critical = criticalFindings.filter(
      (f) => f.severity === "critical"
    ).length;
    return critical > 0
      ? "Immediate protocol initiation recommended"
      : "Standard protocol timeline appropriate";
  }

  private static generateProtocolPriorities(
    criticalFindings: CriticalFinding[],
    progressTrends: ProgressTrend[],
    context: ProtocolContext
  ): string {
    return `1. Address critical findings (${
      criticalFindings.filter((f) => f.severity === "critical").length
    } items)
2. Support declining systems (${
      progressTrends.filter((t) => t.direction === "declining").length
    } systems)  
3. Maintain improving systems (${
      progressTrends.filter((t) => t.direction === "improving").length
    } systems)
4. Consider compliance factors: ${context.complianceFactors.join(", ")}`;
  }

  private static generatePhase1Focus(
    criticalFindings: CriticalFinding[]
  ): string {
    return criticalFindings.length > 0
      ? "Address critical findings and establish foundation"
      : "Establish comprehensive health foundation";
  }

  private static generatePhase2Focus(progressTrends: ProgressTrend[]): string {
    const declining = progressTrends.filter((t) => t.direction === "declining");
    return declining.length > 0
      ? `Optimize ${declining.map((t) => t.system).join(", ")} function`
      : "Optimize and enhance established foundation";
  }

  private static generatePhase3Focus(context: ProtocolContext): string {
    return "Maintain gains and establish long-term health optimization";
  }

  private static generateImmediateActions(
    criticalFindings: CriticalFinding[]
  ): string {
    const critical = criticalFindings.filter((f) => f.severity === "critical");
    return critical.length > 0
      ? critical.map((f) => `• ${f.protocolImplication}`).join("\n")
      : "• Begin comprehensive assessment baseline";
  }

  private static generateTreatmentSequence(
    progressTrends: ProgressTrend[],
    criticalFindings: CriticalFinding[]
  ): string {
    return "1. Address critical findings first\n2. Support declining systems\n3. Enhance stable systems\n4. Maintain improving systems";
  }

  private static generateMonitoringRequirements(
    criticalFindings: CriticalFinding[],
    protocols: any[]
  ): string {
    return `• Weekly check-ins for critical findings\n• Monthly progress assessments\n• Quarterly comprehensive evaluation`;
  }

  private static generateRiskMitigation(
    criticalFindings: CriticalFinding[],
    context: ProtocolContext
  ): string {
    return `• Monitor for contraindications: ${context.contraindications.join(
      ", "
    )}\n• Adjust for compliance factors\n• Track success indicators`;
  }

  private static generateStatusProgressionTimeline(
    statusChanges: any[]
  ): string {
    return statusChanges
      .map((status) => {
        const date = new Date(status.createdAt).toLocaleDateString();
        return `**${date}** - ${status.status.replace("_", " ")}: ${
          status.notes || "Status updated"
        }`;
      })
      .join("\n");
  }

  private static generateAIInsightsTimeline(aiAnalyses: any[]): string {
    return aiAnalyses
      .map((analysis) => {
        const date = new Date(analysis.analysisDate).toLocaleDateString();
        return `**${date}** - AI Analysis v${analysis.analysisVersion}
  ${analysis.executiveSummary || "Comprehensive health analysis completed"}`;
      })
      .join("\n\n");
  }

  private static analyzeTreatmentHistory(protocols: any[]): string[] {
    return protocols.map(
      (p) =>
        `${p.protocolName}: ${p.status} (${
          p.effectivenessRating || "pending"
        }/5)`
    );
  }

  private static identifyContraindications(
    client: any,
    assessments: any[]
  ): string[] {
    const contraindications = [];
    if (client.allergies) contraindications.push("Known allergies documented");
    if (client.medications)
      contraindications.push("Current medications require consideration");
    return contraindications.length > 0
      ? contraindications
      : ["No known contraindications"];
  }

  private static identifySuccessIndicators(
    assessments: any[],
    protocols: any[]
  ): string[] {
    return [
      "Symptom improvement",
      "Lab value optimization",
      "Quality of life enhancement",
      "Energy level improvement",
    ];
  }

  private static analyzeProtocolHistory(protocols: any[]): string[] {
    if (!protocols || protocols.length === 0) {
      return ["No previous protocols documented"];
    }

    return protocols.map((protocol) => {
      const status = protocol.status || "unknown";
      const effectiveness = protocol.effectivenessRating || "not rated";
      return `${
        protocol.protocolName || "Unnamed Protocol"
      }: ${status} (effectiveness: ${effectiveness})`;
    });
  }

  private static generateSystemInsights(
    assessments: any[],
    labResults: any[],
    aiAnalyses: any[]
  ): string[] {
    const insights = [];

    if (assessments && assessments.length > 0) {
      insights.push("Assessment data indicates potential system imbalances");
    }

    if (labResults && labResults.length > 0) {
      insights.push(
        "Lab results provide biomarker insights for protocol development"
      );
    }

    if (aiAnalyses && aiAnalyses.length > 0) {
      insights.push("AI analyses suggest targeted intervention opportunities");
    }

    return insights.length > 0
      ? insights
      : ["Comprehensive data review recommended"];
  }
}
