/**
 * FNTP Master Protocol Monitoring System
 * Progress tracking, safety monitoring, and follow-up scheduling
 * Kevin Rutherford, FNTP - Truck Driver Health Optimization
 */

import { prisma } from "@/lib/db/prisma";

export interface ProgressEntry {
  id: string;
  clientId: string;
  protocolId: string;
  week: number;
  date: Date;
  compliance: {
    supplementCompliance: number; // 0-100%
    lifestyleCompliance: number; // 0-100%
    overallCompliance: number; // 0-100%
  };
  symptoms: {
    energy: number; // 1-10 scale
    sleep: number; // 1-10 scale
    digestion: number; // 1-10 scale
    mood: number; // 1-10 scale
    pain: number; // 1-10 scale
    custom: Record<string, number>;
  };
  metrics: {
    weight?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    bloodSugar?: number;
    custom: Record<string, number>;
  };
  concerns: string[];
  improvements: string[];
  sideEffects: string[];
  notes: string;
  practitionerNotes?: string;
  needsAttention: boolean;
  nextContactDate?: Date;
}

export interface SafetyAlert {
  id: string;
  clientId: string;
  protocolId: string;
  alertType: "red_flag" | "side_effect" | "non_compliance" | "no_progress";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  triggerData: any;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  actions: string[];
}

export interface FollowUpSchedule {
  clientId: string;
  protocolId: string;
  checkPoints: {
    week: number;
    type: "check_in" | "assessment" | "lab_retest" | "phase_transition";
    status: "pending" | "completed" | "overdue" | "skipped";
    scheduledDate: Date;
    completedDate?: Date;
    items: string[];
    priority: "low" | "medium" | "high";
  }[];
}

/**
 * FNTP MONITORING SYSTEM
 */
export class FNTPMonitoringSystem {
  /**
   * Initialize monitoring for a new protocol
   */
  async initializeMonitoring(
    clientId: string,
    protocolId: string,
    phases: any[]
  ): Promise<FollowUpSchedule> {
    console.log(`📊 Initializing FNTP monitoring for client: ${clientId}`);

    const followUpSchedule: FollowUpSchedule = {
      clientId,
      protocolId,
      checkPoints: [],
    };

    const startDate = new Date();

    // Standard FNTP follow-up schedule
    const checkPoints = [
      // Week 1: Initial tolerance check
      {
        week: 1,
        type: "check_in" as const,
        priority: "high" as const,
        items: [
          "Supplement tolerance assessment",
          "Initial side effects check",
          "Compliance barriers identification",
          "Questions and concerns",
        ],
      },
      // Week 2: Phase 1 completion
      {
        week: 2,
        type: "assessment" as const,
        priority: "high" as const,
        items: [
          "Phase 1 effectiveness evaluation",
          "Symptom improvement tracking",
          "Supplement compliance review",
          "Phase 2 planning",
        ],
      },
      // Week 4: Phase 2 mid-point
      {
        week: 4,
        type: "check_in" as const,
        priority: "medium" as const,
        items: [
          "Phase 2 tolerance and effectiveness",
          "Lifestyle modification progress",
          "Monitoring metric reviews",
          "Protocol adjustments if needed",
        ],
      },
      // Week 6: Phase 2 completion
      {
        week: 6,
        type: "phase_transition" as const,
        priority: "high" as const,
        items: [
          "Phase 2 outcomes assessment",
          "Progress towards goals evaluation",
          "Phase 3 transition planning",
          "Supplement reduction strategy",
        ],
      },
      // Week 8: Phase 3 initiation
      {
        week: 8,
        type: "assessment" as const,
        priority: "medium" as const,
        items: [
          "Maintenance protocol establishment",
          "Long-term compliance planning",
          "Lab retest scheduling",
          "Success sustainability planning",
        ],
      },
      // Week 12: Final assessment
      {
        week: 12,
        type: "lab_retest" as const,
        priority: "high" as const,
        items: [
          "Comprehensive lab retest",
          "Root cause resolution assessment",
          "Long-term maintenance planning",
          "Protocol effectiveness documentation",
        ],
      },
    ];

    // Create scheduled check points
    checkPoints.forEach((checkpoint) => {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + checkpoint.week * 7);

      followUpSchedule.checkPoints.push({
        ...checkpoint,
        status: "pending",
        scheduledDate,
      });
    });

    // Save to database
    await this.saveFollowUpSchedule(followUpSchedule);

    return followUpSchedule;
  }

  /**
   * Record progress entry from client
   */
  async recordProgressEntry(
    entry: Omit<ProgressEntry, "id">
  ): Promise<ProgressEntry> {
    console.log(
      `📝 Recording progress entry for client: ${entry.clientId}, week: ${entry.week}`
    );

    // Calculate overall compliance
    entry.compliance.overallCompliance =
      (entry.compliance.supplementCompliance +
        entry.compliance.lifestyleCompliance) /
      2;

    // Check for safety alerts
    await this.evaluateSafetyAlerts(entry);

    // Save progress entry
    const savedEntry = await this.saveProgressEntry(entry);

    // Update follow-up schedule if needed
    await this.updateFollowUpStatus(entry.clientId, entry.week);

    return savedEntry;
  }

  /**
   * Evaluate and create safety alerts
   */
  private async evaluateSafetyAlerts(
    entry: Omit<ProgressEntry, "id">
  ): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    // RED FLAG SYMPTOMS
    const redFlags = [
      "chest pain",
      "severe headache",
      "vision changes",
      "shortness of breath",
      "severe abdominal pain",
      "allergic reaction",
      "rash",
      "swelling",
    ];

    const hasRedFlags = entry.concerns.some((concern) =>
      redFlags.some((flag) => concern.toLowerCase().includes(flag))
    );

    if (hasRedFlags) {
      alerts.push({
        id: `alert_${Date.now()}_1`,
        clientId: entry.clientId,
        protocolId: entry.protocolId,
        alertType: "red_flag",
        severity: "critical",
        description:
          "Red flag symptoms reported - immediate attention required",
        triggerData: { concerns: entry.concerns },
        createdAt: new Date(),
        resolved: false,
        actions: [
          "Contact client immediately",
          "Review symptoms in detail",
          "Consider medical referral",
          "Stop problematic supplements if identified",
        ],
      });
    }

    // SEVERE SIDE EFFECTS
    if (entry.sideEffects.length > 0) {
      const severeSideEffects = entry.sideEffects.filter(
        (effect) =>
          effect.toLowerCase().includes("severe") ||
          effect.toLowerCase().includes("persistent") ||
          effect.toLowerCase().includes("worsening")
      );

      if (severeSideEffects.length > 0) {
        alerts.push({
          id: `alert_${Date.now()}_2`,
          clientId: entry.clientId,
          protocolId: entry.protocolId,
          alertType: "side_effect",
          severity: "high",
          description: "Severe side effects reported",
          triggerData: { sideEffects: severeSideEffects },
          createdAt: new Date(),
          resolved: false,
          actions: [
            "Review supplement protocol",
            "Identify problematic supplements",
            "Adjust dosages or discontinue",
            "Schedule follow-up within 48 hours",
          ],
        });
      }
    }

    // NON-COMPLIANCE ISSUES
    if (entry.compliance.overallCompliance < 50) {
      alerts.push({
        id: `alert_${Date.now()}_3`,
        clientId: entry.clientId,
        protocolId: entry.protocolId,
        alertType: "non_compliance",
        severity: "medium",
        description: `Low compliance: ${entry.compliance.overallCompliance}%`,
        triggerData: { compliance: entry.compliance },
        createdAt: new Date(),
        resolved: false,
        actions: [
          "Identify compliance barriers",
          "Simplify protocol if needed",
          "Provide additional education",
          "Consider motivation strategies",
        ],
      });
    }

    // NO PROGRESS AFTER 4 WEEKS
    if (
      entry.week >= 4 &&
      entry.symptoms.energy <= 4 &&
      entry.symptoms.sleep <= 4
    ) {
      alerts.push({
        id: `alert_${Date.now()}_4`,
        clientId: entry.clientId,
        protocolId: entry.protocolId,
        alertType: "no_progress",
        severity: "medium",
        description: "No significant improvement after 4 weeks",
        triggerData: { symptoms: entry.symptoms, week: entry.week },
        createdAt: new Date(),
        resolved: false,
        actions: [
          "Reassess root cause analysis",
          "Review lab values for missed patterns",
          "Consider additional testing",
          "Modify protocol approach",
        ],
      });
    }

    // Save alerts
    for (const alert of alerts) {
      await this.saveSafetyAlert(alert);
    }

    return alerts;
  }

  /**
   * Generate progress report
   */
  async generateProgressReport(
    clientId: string,
    protocolId: string
  ): Promise<{
    summary: {
      protocolWeeks: number;
      averageCompliance: number;
      overallProgress: "excellent" | "good" | "fair" | "poor";
      keyImprovements: string[];
      remainingConcerns: string[];
    };
    trendAnalysis: {
      energy: {
        trend: "improving" | "stable" | "declining";
        current: number;
        baseline: number;
      };
      sleep: {
        trend: "improving" | "stable" | "declining";
        current: number;
        baseline: number;
      };
      digestion: {
        trend: "improving" | "stable" | "declining";
        current: number;
        baseline: number;
      };
      compliance: {
        trend: "improving" | "stable" | "declining";
        current: number;
        average: number;
      };
    };
    alerts: SafetyAlert[];
    nextSteps: string[];
  }> {
    console.log(`📈 Generating progress report for client: ${clientId}`);

    // Get all progress entries
    const progressEntries = await this.getProgressEntries(clientId, protocolId);
    const alerts = await this.getSafetyAlerts(clientId, protocolId);

    if (progressEntries.length === 0) {
      throw new Error("No progress data available");
    }

    // Calculate trends
    const baseline = progressEntries[0];
    const latest = progressEntries[progressEntries.length - 1];
    const averageCompliance =
      progressEntries.reduce(
        (sum, entry) => sum + entry.compliance.overallCompliance,
        0
      ) / progressEntries.length;

    const calculateTrend = (current: number, baseline: number) => {
      const change = current - baseline;
      if (change >= 1) return "improving";
      if (change <= -1) return "declining";
      return "stable";
    };

    const trendAnalysis = {
      energy: {
        trend: calculateTrend(latest.symptoms.energy, baseline.symptoms.energy),
        current: latest.symptoms.energy,
        baseline: baseline.symptoms.energy,
      },
      sleep: {
        trend: calculateTrend(latest.symptoms.sleep, baseline.symptoms.sleep),
        current: latest.symptoms.sleep,
        baseline: baseline.symptoms.sleep,
      },
      digestion: {
        trend: calculateTrend(
          latest.symptoms.digestion,
          baseline.symptoms.digestion
        ),
        current: latest.symptoms.digestion,
        baseline: baseline.symptoms.digestion,
      },
      compliance: {
        trend: calculateTrend(
          latest.compliance.overallCompliance,
          averageCompliance
        ),
        current: latest.compliance.overallCompliance,
        average: averageCompliance,
      },
    };

    // Determine overall progress
    const improvingMetrics = Object.values(trendAnalysis).filter(
      (t) => t.trend === "improving"
    ).length;
    const decliningMetrics = Object.values(trendAnalysis).filter(
      (t) => t.trend === "declining"
    ).length;

    let overallProgress: "excellent" | "good" | "fair" | "poor";
    if (improvingMetrics >= 3 && decliningMetrics === 0)
      overallProgress = "excellent";
    else if (improvingMetrics >= 2 && decliningMetrics <= 1)
      overallProgress = "good";
    else if (improvingMetrics >= 1 && decliningMetrics <= 2)
      overallProgress = "fair";
    else overallProgress = "poor";

    // Collect improvements and concerns
    const allImprovements = progressEntries.flatMap(
      (entry) => entry.improvements
    );
    const allConcerns = progressEntries.flatMap((entry) => entry.concerns);
    const keyImprovements = [...new Set(allImprovements)].slice(0, 5);
    const remainingConcerns = [...new Set(allConcerns)].slice(0, 5);

    // Generate next steps
    const nextSteps = this.generateNextSteps(
      trendAnalysis,
      overallProgress,
      latest.week
    );

    return {
      summary: {
        protocolWeeks: latest.week,
        averageCompliance,
        overallProgress,
        keyImprovements,
        remainingConcerns,
      },
      trendAnalysis,
      alerts: alerts.filter((alert) => !alert.resolved),
      nextSteps,
    };
  }

  private generateNextSteps(
    trends: any,
    progress: string,
    currentWeek: number
  ): string[] {
    const steps: string[] = [];

    if (progress === "excellent") {
      steps.push("Continue current protocol - excellent progress");
      if (currentWeek >= 6) {
        steps.push("Begin transition to maintenance phase");
      }
    } else if (progress === "poor") {
      steps.push("Reassess root cause analysis");
      steps.push("Consider protocol modifications");
      steps.push("Schedule immediate consultation");
    }

    if (trends.compliance.trend === "declining") {
      steps.push("Address compliance barriers");
      steps.push("Simplify supplement schedule if needed");
    }

    if (currentWeek >= 8 && progress !== "poor") {
      steps.push("Schedule lab retest");
      steps.push("Plan long-term maintenance strategy");
    }

    return steps;
  }

  // Database operations (simplified - would use actual Prisma calls)
  private async saveFollowUpSchedule(
    schedule: FollowUpSchedule
  ): Promise<void> {
    // Implementation would save to database
    console.log("💾 Saving follow-up schedule");
  }

  private async saveProgressEntry(
    entry: Omit<ProgressEntry, "id">
  ): Promise<ProgressEntry> {
    // Implementation would save to database and return with ID
    return { ...entry, id: `progress_${Date.now()}` } as ProgressEntry;
  }

  private async saveSafetyAlert(alert: SafetyAlert): Promise<void> {
    // Implementation would save to database
    console.log(
      `🚨 Safety alert created: ${alert.alertType} - ${alert.severity}`
    );
  }

  private async updateFollowUpStatus(
    clientId: string,
    week: number
  ): Promise<void> {
    // Implementation would update follow-up status
    console.log(`✅ Updated follow-up status for week ${week}`);
  }

  private async getProgressEntries(
    clientId: string,
    protocolId: string
  ): Promise<ProgressEntry[]> {
    // Implementation would fetch from database
    return [];
  }

  private async getSafetyAlerts(
    clientId: string,
    protocolId: string
  ): Promise<SafetyAlert[]> {
    // Implementation would fetch from database
    return [];
  }
}

// Export singleton instance
export const fntpMonitoringSystem = new FNTPMonitoringSystem();
