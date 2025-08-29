/**
 * Timeline Markdown Generator
 *
 * Generates Claude Desktop-optimized markdown files from timeline analysis data.
 * Creates comprehensive client-timeline.md files for protocol development workflow.
 *
 * Features:
 * - Claude-optimized formatting
 * - Structured health journey documentation
 * - Critical findings highlighting
 * - Treatment protocol tracking
 * - Chronological event organization
 * - Enhanced Functional Medicine lab analysis
 */

import type { LabAnalysisReport } from './functional-medicine-lab-analysis';
import { functionalMedicineLabAnalysis } from './functional-medicine-lab-analysis';
import type { AssessmentAnalysisReport } from './functional-medicine-assessment-analysis';
import { functionalMedicineAssessmentAnalysis } from './functional-medicine-assessment-analysis';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'assessment' | 'document' | 'note' | 'protocol' | 'status_change';
  category: string;
  title: string;
  description: string;
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  findings?: any;
  metadata?: Record<string, any>;
}

interface CriticalFinding {
  id: string;
  category: 'symptom' | 'biomarker' | 'trend' | 'risk_factor';
  severity: 'moderate' | 'high' | 'critical';
  title: string;
  description: string;
  firstObserved: Date;
  lastObserved: Date;
  frequency: number;
  trend?: 'improving' | 'worsening' | 'stable';
  relatedEvents: string[];
}

interface TimelineAnalysis {
  clientId: string;
  clientName: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  totalEvents: number;
  events: TimelineEvent[];
  criticalFindings: CriticalFinding[];
  healthPhases: {
    phase: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    keyEvents: string[];
  }[];
  // Enhanced lab analysis
  labAnalysis?: LabAnalysisReport;
  // Enhanced assessment analysis
  assessmentAnalysis?: AssessmentAnalysisReport;
  analysisVersion: string;
  generatedAt: Date;
  dataSourcesIncluded: string[];
}

export class TimelineMarkdownGenerator {
  /**
   * Generate Claude Desktop-optimized markdown from timeline analysis
   */
  static generateMarkdown(analysis: TimelineAnalysis): string {
    // Handle protocol development timeline type
    if ((analysis as any).protocolMarkdown) {
      return (analysis as any).protocolMarkdown;
    }
    const sections = [
      this.generateHeader(analysis),
      this.generateExecutiveSummary(analysis),
      this.generateCriticalFindings(analysis),
      this.generateEnhancedLabAnalysis(analysis), // Enhanced lab analysis section
      this.generateEnhancedAssessmentAnalysis(analysis), // Enhanced assessment analysis section
      this.generateHealthPhases(analysis),
      this.generateChronologicalTimeline(analysis),
      this.generateTreatmentProtocols(analysis),
      this.generateAssessmentSummary(analysis),
      this.generateRecommendationsTemplate(),
      this.generateFooter(analysis),
    ];

    return sections.join('\n\n---\n\n');
  }

  /**
   * Generate document header with client overview
   */
  private static generateHeader(analysis: TimelineAnalysis): string {
    return `# Client Health Timeline: ${analysis.clientName}

## Document Overview
- **Client ID**: ${analysis.clientId}
- **Analysis Period**: ${this.formatDate(
      analysis.dateRange.startDate
    )} to ${this.formatDate(analysis.dateRange.endDate)}
- **Total Health Events**: ${analysis.totalEvents}
- **Critical Findings**: ${
      analysis.criticalFindings.filter(f => f.severity === 'critical').length
    }
- **High Priority Issues**: ${
      analysis.criticalFindings.filter(f => f.severity === 'high').length
    }
- **Analysis Version**: ${analysis.analysisVersion}
- **Generated**: ${this.formatDateTime(analysis.generatedAt)}

## Data Sources Included
${analysis.dataSourcesIncluded.map(source => `- ✅ ${source}`).join('\n')}

## Purpose
This timeline provides a comprehensive chronological view of ${
      analysis.clientName
    }'s health journey, optimized for Claude Desktop protocol development. Use this document to:
- Identify health patterns and trends
- Understand treatment progression
- Develop targeted intervention protocols
- Track treatment effectiveness over time`;
  }

  /**
   * Generate executive summary section
   */
  private static generateExecutiveSummary(analysis: TimelineAnalysis): string {
    const criticalCount = analysis.criticalFindings.filter(
      f => f.severity === 'critical'
    ).length;
    const highCount = analysis.criticalFindings.filter(
      f => f.severity === 'high'
    ).length;
    const timespan = this.calculateTimespan(
      analysis.dateRange.startDate,
      analysis.dateRange.endDate
    );

    const protocolEvents = analysis.events.filter(e => e.type === 'protocol');
    const assessmentEvents = analysis.events.filter(
      e => e.type === 'assessment'
    );
    const documentEvents = analysis.events.filter(e => e.type === 'document');

    return `# Executive Summary

## Health Journey Overview
**${analysis.clientName}** has been tracked over **${timespan}** with **${
      analysis.totalEvents
    } documented health events**. The timeline reveals:

### Key Metrics
- **Assessment Events**: ${assessmentEvents.length}
- **Treatment Protocols**: ${protocolEvents.length}
- **Document Uploads**: ${documentEvents.length}
- **Clinical Notes**: ${analysis.events.filter(e => e.type === 'note').length}

### Risk Assessment
${
  criticalCount > 0
    ? `- **🚨 CRITICAL ISSUES**: ${criticalCount} critical findings requiring immediate attention`
    : ''
}
${
  highCount > 0
    ? `- **⚠️ HIGH PRIORITY**: ${highCount} high-priority health concerns identified`
    : ''
}
- **📊 MONITORING**: ${
      analysis.criticalFindings.filter(f => f.severity === 'moderate').length
    } items requiring ongoing monitoring

### Health Trajectory
${this.generateHealthTrajectoryInsight(analysis)}`;
  }

  /**
   * Generate critical findings section
   */
  private static generateCriticalFindings(analysis: TimelineAnalysis): string {
    if (analysis.criticalFindings.length === 0) {
      return '# Critical Findings\n\n✅ **No critical findings identified** - Overall health tracking appears stable.';
    }

    let markdown = '# Critical Findings\n\n';

    const criticalFindings = analysis.criticalFindings.filter(
      f => f.severity === 'critical'
    );
    const highFindings = analysis.criticalFindings.filter(
      f => f.severity === 'high'
    );
    const moderateFindings = analysis.criticalFindings.filter(
      f => f.severity === 'moderate'
    );

    if (criticalFindings.length > 0) {
      markdown += '## 🚨 Critical Issues\n\n';
      criticalFindings.forEach((finding, index) => {
        markdown += this.generateFindingMarkdown(finding, index + 1);
      });
    }

    if (highFindings.length > 0) {
      markdown += '## ⚠️ High Priority Issues\n\n';
      highFindings.forEach((finding, index) => {
        markdown += this.generateFindingMarkdown(finding, index + 1);
      });
    }

    if (moderateFindings.length > 0) {
      markdown += '## 📊 Monitoring Required\n\n';
      moderateFindings.forEach((finding, index) => {
        markdown += this.generateFindingMarkdown(finding, index + 1);
      });
    }

    return markdown;
  }

  /**
   * Generate individual finding markdown
   */
  private static generateFindingMarkdown(
    finding: CriticalFinding,
    index: number
  ): string {
    const trendIcon =
      finding.trend === 'improving'
        ? '📈'
        : finding.trend === 'worsening'
          ? '📉'
          : '➡️';

    return `### ${index}. ${finding.title}

**Category**: ${finding.category.replace('_', ' ').toUpperCase()}  
**Severity**: ${finding.severity.toUpperCase()}  
**Trend**: ${trendIcon} ${finding.trend?.toUpperCase() || 'STABLE'}  
**Timeline**: ${this.formatDate(finding.firstObserved)} to ${this.formatDate(
      finding.lastObserved
    )}  
**Frequency**: ${finding.frequency} occurrence${
      finding.frequency !== 1 ? 's' : ''
    }

${finding.description}

**Related Events**: ${
      finding.relatedEvents.length
    } events linked to this finding

`;
  }

  /**
   * Generate health phases section
   */
  private static generateHealthPhases(analysis: TimelineAnalysis): string {
    if (analysis.healthPhases.length === 0) {
      return '# Health Phases\n\nNo distinct health phases identified in the current timeline.';
    }

    let markdown = '# Health Phases\n\n';
    markdown +=
      'The health journey can be divided into the following distinct phases:\n\n';

    analysis.healthPhases.forEach((phase, index) => {
      const duration = phase.endDate
        ? this.calculateTimespan(phase.startDate, phase.endDate)
        : 'Ongoing';

      markdown += `## Phase ${index + 1}: ${phase.phase}

**Timeline**: ${this.formatDate(phase.startDate)}${
        phase.endDate ? ` - ${this.formatDate(phase.endDate)}` : ' - Present'
      }  
**Duration**: ${duration}

${phase.description}

**Key Events in This Phase**: ${phase.keyEvents.length} events

`;
    });

    return markdown;
  }

  /**
   * Generate chronological timeline section
   */
  private static generateChronologicalTimeline(
    analysis: TimelineAnalysis
  ): string {
    let markdown = '# Chronological Timeline\n\n';
    markdown +=
      'Complete chronological record of all health-related events:\n\n';

    // Group events by month for better organization
    const eventsByMonth = this.groupEventsByMonth(analysis.events);

    Object.entries(eventsByMonth).forEach(([monthYear, events]) => {
      markdown += `## ${monthYear}\n\n`;

      events.forEach(event => {
        const severityIcon = this.getSeverityIcon(event.severity);
        const typeIcon = this.getTypeIcon(event.type);

        markdown += `### ${this.formatDate(event.date)} - ${event.title}
${typeIcon} **${event.category}** ${severityIcon}

${event.description}

${event.findings ? this.formatFindings(event.findings) : ''}

---

`;
      });
    });

    return markdown;
  }

  /**
   * Generate treatment protocols section
   */
  private static generateTreatmentProtocols(
    analysis: TimelineAnalysis
  ): string {
    const protocolEvents = analysis.events.filter(e => e.type === 'protocol');

    if (protocolEvents.length === 0) {
      return '# Treatment Protocols\n\nNo treatment protocols documented in the current timeline.';
    }

    let markdown = '# Treatment Protocols\n\n';
    markdown += `${protocolEvents.length} treatment protocol${
      protocolEvents.length !== 1 ? 's' : ''
    } documented:\n\n`;

    protocolEvents.forEach((protocol, index) => {
      markdown += `## Protocol ${index + 1}: ${protocol.title}

**Date Initiated**: ${this.formatDate(protocol.date)}  
**Status**: ${protocol.findings?.status || 'Unknown'}  
${protocol.findings?.phase ? `**Phase**: ${protocol.findings.phase}` : ''}

${protocol.description}

### Protocol Details
${
  protocol.findings?.supplementCount
    ? `- **Supplements**: ${protocol.findings.supplementCount} prescribed`
    : ''
}
${protocol.findings?.hasDietary ? `- **Dietary Guidelines**: Included` : ''}
${
  protocol.findings?.hasLifestyle
    ? `- **Lifestyle Modifications**: Included`
    : ''
}
${
  protocol.findings?.effectivenessRating
    ? `- **Effectiveness Rating**: ${protocol.findings.effectivenessRating}/5`
    : ''
}

`;
    });

    return markdown;
  }

  /**
   * Generate assessment summary section
   */
  private static generateAssessmentSummary(analysis: TimelineAnalysis): string {
    const assessmentEvents = analysis.events.filter(
      e => e.type === 'assessment'
    );

    if (assessmentEvents.length === 0) {
      return '# Assessment Summary\n\nNo formal assessments documented in the current timeline.';
    }

    let markdown = '# Assessment Summary\n\n';
    markdown += `${assessmentEvents.length} health assessment${
      assessmentEvents.length !== 1 ? 's' : ''
    } completed:\n\n`;

    assessmentEvents.forEach((assessment, index) => {
      markdown += `## Assessment ${index + 1}: ${assessment.title}

**Date**: ${this.formatDate(assessment.date)}  
**Type**: ${assessment.category}

${assessment.description}

${assessment.findings ? this.formatFindings(assessment.findings) : ''}

`;
    });

    return markdown;
  }

  /**
   * Generate recommendations template for Claude
   */
  private static generateRecommendationsTemplate(): string {
    return `# Protocol Recommendations Template

*This section is for Claude Desktop to populate with protocol recommendations based on the timeline analysis.*

## Immediate Actions Required
- [ ] **Priority 1**: 
- [ ] **Priority 2**: 
- [ ] **Priority 3**: 

## Supplement Protocol Recommendations
### Phase 1 (Immediate - 0-4 weeks)
- **Foundation Support**: 
- **Targeted Interventions**: 
- **Monitoring Parameters**: 

### Phase 2 (Intermediate - 4-12 weeks)
- **Protocol Adjustments**: 
- **Additional Support**: 
- **Progress Markers**: 

### Phase 3 (Long-term - 12+ weeks)
- **Maintenance Protocol**: 
- **Optimization Strategy**: 
- **Long-term Monitoring**: 

## Lifestyle Modifications
- **Dietary Recommendations**: 
- **Exercise Protocol**: 
- **Sleep Optimization**: 
- **Stress Management**: 

## Monitoring and Follow-up
- **Key Biomarkers to Track**: 
- **Assessment Schedule**: 
- **Warning Signs to Monitor**: 
- **Success Metrics**: 

## Risk Mitigation
- **Identified Risk Factors**: 
- **Preventive Measures**: 
- **Emergency Protocols**: `;
  }

  /**
   * Generate document footer
   */
  private static generateFooter(analysis: TimelineAnalysis): string {
    return `---

# Document Information

**Analysis Metadata**:
- **Client ID**: ${analysis.clientId}
- **Analysis Engine**: FNTP Timeline Analysis System
- **Version**: ${analysis.analysisVersion}
- **Generated**: ${this.formatDateTime(analysis.generatedAt)}
- **Data Sources**: Assessments, Documents, Clinical Notes, Treatment Protocols
- **Quality Score**: ${this.calculateQualityScore(analysis)}/100

**Usage Guidelines**:
- This timeline is generated for healthcare provider use in protocol development
- All dates and medical information should be verified with primary sources
- Clinical decisions should incorporate additional patient consultation
- PHI data handling must comply with HIPAA requirements

**Next Steps**:
1. Review critical findings for immediate intervention needs
2. Analyze health phase transitions for protocol timing
3. Develop targeted supplement and lifestyle protocols
4. Establish monitoring schedule for key health markers
5. Schedule follow-up assessments based on risk factors

---

*Generated by FNTP Enhanced Export System - Timeline Analysis Module*`;
  }

  /**
   * Helper methods for formatting and calculations
   */
  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private static formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }

  private static calculateTimespan(startDate: Date, endDate: Date): string {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;

    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.round(remainingDays / 30);

    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} and ${months} month${
      months !== 1 ? 's' : ''
    }`;
  }

  private static generateHealthTrajectoryInsight(
    analysis: TimelineAnalysis
  ): string {
    const criticalCount = analysis.criticalFindings.filter(
      f => f.severity === 'critical'
    ).length;
    const improvingTrends = analysis.criticalFindings.filter(
      f => f.trend === 'improving'
    ).length;
    const worseningTrends = analysis.criticalFindings.filter(
      f => f.trend === 'worsening'
    ).length;

    if (criticalCount > 0) {
      return `Health trajectory shows **${criticalCount} critical issue${
        criticalCount !== 1 ? 's' : ''
      }** requiring immediate attention.`;
    }

    if (improvingTrends > worseningTrends) {
      return `Health trajectory appears **POSITIVE** with ${improvingTrends} improving trend${
        improvingTrends !== 1 ? 's' : ''
      } identified.`;
    }

    if (worseningTrends > improvingTrends) {
      return `Health trajectory shows **DECLINING PATTERNS** with ${worseningTrends} worsening trend${
        worseningTrends !== 1 ? 's' : ''
      } requiring intervention.`;
    }

    return `Health trajectory appears **STABLE** with consistent monitoring and care patterns.`;
  }

  private static groupEventsByMonth(
    events: TimelineEvent[]
  ): Record<string, TimelineEvent[]> {
    return events.reduce(
      (groups, event) => {
        const monthYear = event.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });

        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(event);

        return groups;
      },
      {} as Record<string, TimelineEvent[]>
    );
  }

  private static getSeverityIcon(severity?: string): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'moderate':
        return '📊';
      case 'low':
        return '📝';
      default:
        return '📝';
    }
  }

  private static getTypeIcon(type: string): string {
    switch (type) {
      case 'assessment':
        return '📋';
      case 'document':
        return '📄';
      case 'note':
        return '📝';
      case 'protocol':
        return '💊';
      case 'status_change':
        return '🔄';
      default:
        return '📌';
    }
  }

  private static formatFindings(findings: any): string {
    if (!findings || typeof findings !== 'object') return '';

    const formatted = Object.entries(findings)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(
        ([key, value]) =>
          `**${key.replace(/([A-Z])/g, ' $1').toLowerCase()}**: ${value}`
      )
      .join('  \n');

    return formatted ? `\n**Key Findings**:  \n${formatted}\n` : '';
  }

  /**
   * Generate enhanced functional medicine lab analysis section
   */
  private static generateEnhancedLabAnalysis(
    analysis: TimelineAnalysis
  ): string {
    if (
      !analysis.labAnalysis ||
      analysis.labAnalysis.summary.totalTests === 0
    ) {
      return `## 🔬 Functional Medicine Lab Analysis

*No lab results available for functional medicine analysis. Consider comprehensive lab panel for health optimization.*

### Recommended Initial Lab Panel
- **Metabolic Health**: Fasting glucose, HbA1c, fasting insulin
- **Thyroid Function**: TSH, Free T3, Free T4, TPO antibodies  
- **Inflammation**: C-reactive protein (CRP), ESR
- **Nutritional Status**: Vitamin D, B12, folate, magnesium (RBC)
- **Cardiovascular Risk**: Lipid panel with particle analysis
- **Liver Function**: ALT, AST, GGT for detoxification capacity

`;
    }

    // Generate markdown using the lab analysis service
    return functionalMedicineLabAnalysis.generateLabAnalysisMarkdown(
      analysis.labAnalysis
    );
  }

  /**
   * Generate enhanced functional medicine assessment analysis section
   */
  private static generateEnhancedAssessmentAnalysis(
    analysis: TimelineAnalysis
  ): string {
    if (
      !analysis.assessmentAnalysis ||
      analysis.assessmentAnalysis.summary.totalCategories === 0
    ) {
      return `## 🎯 Functional Medicine Assessment Analysis

*No assessments available for functional medicine categorization analysis. Consider comprehensive health assessment for system evaluation.*

### Recommended Assessment Areas
- **Digestive Health**: SIBO, dysbiosis, leaky gut, stomach acid levels
- **Energy & Adrenals**: HPA axis function, mitochondrial health, stress response
- **Hormonal Balance**: Thyroid function, sex hormones, adrenal hormones
- **Inflammatory Status**: Chronic inflammation, autoimmune patterns, immune function
- **Detoxification**: Phase I/II liver function, environmental sensitivities
- **Neurological Function**: Neurotransmitter balance, cognitive function, mood regulation
- **Metabolic Health**: Blood sugar regulation, insulin sensitivity, lipid metabolism

`;
    }

    // Generate markdown using the assessment analysis service
    return functionalMedicineAssessmentAnalysis.generateAssessmentAnalysisMarkdown(
      analysis.assessmentAnalysis
    );
  }

  private static calculateQualityScore(analysis: TimelineAnalysis): number {
    let score = 50; // Base score

    // Add points for data richness
    if (analysis.totalEvents > 10) score += 20;
    if (analysis.totalEvents > 25) score += 10;

    // Add points for diverse data types
    const eventTypes = new Set(analysis.events.map(e => e.type));
    score += eventTypes.size * 5;

    // Add points for critical findings analysis
    if (analysis.criticalFindings.length > 0) score += 10;

    // Add points for health phases identification
    if (analysis.healthPhases.length > 1) score += 10;

    // Add points for lab analysis
    if (analysis.labAnalysis && analysis.labAnalysis.summary.totalTests > 0) {
      score += 15;
      // Bonus for comprehensive lab analysis
      if (analysis.labAnalysis.summary.systemsAnalyzed >= 3) score += 5;
    }

    // Add points for assessment analysis
    if (
      analysis.assessmentAnalysis &&
      analysis.assessmentAnalysis.summary.totalCategories > 0
    ) {
      score += 15;
      // Bonus for comprehensive assessment analysis
      if (analysis.assessmentAnalysis.summary.systemsAnalyzed >= 4) score += 5;
      // Additional bonus for pattern recognition
      if (
        analysis.assessmentAnalysis.patternInsights.highConfidencePatterns
          .length >= 2
      )
        score += 5;
    }

    return Math.min(score, 100);
  }
}
