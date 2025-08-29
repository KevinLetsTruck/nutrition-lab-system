import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced interfaces for lab analysis
export interface LabAnalysisResult {
  testName: string;
  testCode?: string;
  value: number;
  unit: string;
  status:
    | 'critical_low'
    | 'low'
    | 'optimal'
    | 'high'
    | 'critical_high'
    | 'unknown';
  trend?: 'improving' | 'stable' | 'declining' | null;
  fmRange: string;
  standardRange: string;
  clinicalSignificance?: string;
  category: string;
  dateCollected?: Date;
}

export interface SystemAnalysis {
  systemName: string;
  category: string;
  overallStatus: 'optimal' | 'suboptimal' | 'concerning' | 'critical';
  keyFindings: string[];
  labValues: LabAnalysisResult[];
  recommendations: string[];
  criticalCount: number;
  suboptimalCount: number;
  optimalCount: number;
}

export interface LabAnalysisReport {
  criticalValues: LabAnalysisResult[];
  systemAnalyses: SystemAnalysis[];
  trends: {
    improving: LabAnalysisResult[];
    declining: LabAnalysisResult[];
    stable: LabAnalysisResult[];
  };
  protocolInsights: {
    immediatePriorities: string[];
    secondaryFocus: string[];
    monitoringSchedule: string[];
    missingTests: string[];
  };
  summary: {
    totalTests: number;
    criticalValues: number;
    suboptimalValues: number;
    optimalValues: number;
    systemsAnalyzed: number;
  };
}

/**
 * Generates enhanced functional medicine lab analysis with system-based groupings
 */
export class FunctionalMedicineLabAnalysis {
  private fmRangesCache: Map<string, any> = new Map();
  private rangesCacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Main analysis function that processes lab results
   */
  async generateEnhancedLabAnalysis(
    labResults: any[]
  ): Promise<LabAnalysisReport> {
    if (!labResults || !labResults.length) {
      return this.generateEmptyReport();
    }

    // Load functional medicine ranges with caching
    await this.loadFunctionalMedicineRanges();

    // Analyze each lab result against FM ranges
    const analyzedLabs = await this.analyzeLabValues(labResults);

    // Group by system categories
    const systemAnalyses = this.groupLabsBySystem(analyzedLabs);

    // Generate trends analysis
    const trends = this.analyzeLabTrends(analyzedLabs);

    // Generate protocol insights
    const protocolInsights = this.generateProtocolInsights(
      systemAnalyses,
      analyzedLabs
    );

    // Generate summary statistics
    const summary = this.generateSummaryStats(analyzedLabs, systemAnalyses);

    return {
      criticalValues: analyzedLabs.filter(
        lab => lab.status === 'critical_low' || lab.status === 'critical_high'
      ),
      systemAnalyses,
      trends,
      protocolInsights,
      summary,
    };
  }

  /**
   * Generate markdown representation of lab analysis
   */
  generateLabAnalysisMarkdown(report: LabAnalysisReport): string {
    if (report.summary.totalTests === 0) {
      return '### 🔬 LAB RESULTS ANALYSIS\n*No lab results available for analysis*\n\n';
    }

    return `### 🔬 FUNCTIONAL MEDICINE LAB ANALYSIS

## 📊 ANALYSIS SUMMARY
- **Total Tests Analyzed**: ${report.summary.totalTests}
- **Critical Values**: ${report.summary.criticalValues} 🔴
- **Suboptimal Values**: ${report.summary.suboptimalValues} 🟡  
- **Optimal Values**: ${report.summary.optimalValues} ✅
- **Systems Analyzed**: ${report.summary.systemsAnalyzed}

## 🚨 CRITICAL VALUES (Immediate Attention Required)
${this.generateCriticalValuesTable(report.criticalValues)}

## 🏥 SYSTEM-BASED ANALYSIS
${this.generateSystemAnalysesMarkdown(report.systemAnalyses)}

## 📈 LAB TRENDS ANALYSIS
${this.generateTrendsAnalysisMarkdown(report.trends)}

## 🎯 PROTOCOL DEVELOPMENT INSIGHTS
${this.generateProtocolInsightsMarkdown(report.protocolInsights)}

---
*Analysis based on Functional Medicine optimal ranges for enhanced health outcomes*

`;
  }

  private async loadFunctionalMedicineRanges(): Promise<void> {
    const now = Date.now();

    // Check cache validity
    if (this.fmRangesCache.size > 0 && now < this.rangesCacheExpiry) {
      return;
    }

    try {
      const fmRanges = await prisma.functionalMedicineLabRange.findMany();

      // Clear and rebuild cache
      this.fmRangesCache.clear();

      fmRanges.forEach(range => {
        // Create multiple cache keys for flexible matching
        const keys = [
          range.testName.toLowerCase().trim(),
          range.testCode?.toLowerCase().trim(),
          // Common variations
          range.testName.toLowerCase().replace(/[()]/g, '').trim(),
          range.testName.toLowerCase().replace(/\s+/g, '').trim(),
        ].filter(Boolean);

        keys.forEach(key => {
          if (key) {
            this.fmRangesCache.set(key, range);
          }
        });
      });

      this.rangesCacheExpiry = now + this.CACHE_DURATION;

      console.log(
        `📋 Loaded ${fmRanges.length} functional medicine lab ranges into cache`
      );
    } catch (error) {
      console.error('❌ Error loading functional medicine ranges:', error);
      throw new Error('Failed to load lab ranges for analysis');
    }
  }

  private async analyzeLabValues(
    labResults: any[]
  ): Promise<LabAnalysisResult[]> {
    const analyzedLabs: LabAnalysisResult[] = [];

    for (const labResult of labResults) {
      const analyzed = this.analyzeIndividualLabValue(labResult);
      if (analyzed) {
        analyzedLabs.push(analyzed);
      }
    }

    return analyzedLabs;
  }

  private analyzeIndividualLabValue(labResult: any): LabAnalysisResult | null {
    try {
      // Extract test name and value
      const testName = labResult.testName?.trim();
      const testCode = labResult.testCode?.trim();
      const value = this.parseLabValue(labResult.value);

      if (!testName || isNaN(value)) {
        return null;
      }

      // Find matching functional medicine range
      const range = this.findMatchingRange(testName, testCode);

      if (!range) {
        // Return unknown status for unmatched tests
        return {
          testName,
          testCode,
          value,
          unit: labResult.unit || 'unknown',
          status: 'unknown',
          fmRange: 'Not available',
          standardRange: 'Not available',
          category: 'unclassified',
          clinicalSignificance: 'No reference range available',
          dateCollected: labResult.dateCollected
            ? new Date(labResult.dateCollected)
            : undefined,
        };
      }

      // Determine status based on FM optimal ranges
      const status = this.determineLabStatus(value, range);

      // Format range strings
      const fmRange = this.formatRange(
        range.fmOptimalMin,
        range.fmOptimalMax,
        range.unit
      );
      const standardRange =
        range.standardRangeMin && range.standardRangeMax
          ? this.formatRange(
              range.standardRangeMin,
              range.standardRangeMax,
              range.unit
            )
          : 'Not specified';

      return {
        testName: range.testName,
        testCode: range.testCode,
        value,
        unit: range.unit,
        status,
        fmRange,
        standardRange,
        clinicalSignificance: range.clinicalSignificance,
        category: range.category,
        dateCollected: labResult.dateCollected
          ? new Date(labResult.dateCollected)
          : undefined,
      };
    } catch (error) {
      console.error('❌ Error analyzing lab value:', labResult.testName, error);
      return null;
    }
  }

  private parseLabValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // Remove common text patterns and parse
      const cleanValue = value
        .replace(/[<>]/g, '') // Remove comparison operators
        .replace(/[^\d.-]/g, '') // Keep only digits, decimal, and minus
        .trim();

      return parseFloat(cleanValue);
    }

    return NaN;
  }

  private findMatchingRange(testName: string, testCode?: string): any {
    // Try exact matches first
    const keys = [
      testName.toLowerCase().trim(),
      testCode?.toLowerCase().trim(),
      // Common variations
      testName.toLowerCase().replace(/[()]/g, '').trim(),
      testName.toLowerCase().replace(/\s+/g, '').trim(),
    ].filter(Boolean);

    for (const key of keys) {
      const range = this.fmRangesCache.get(key);
      if (range) {
        return range;
      }
    }

    // Try partial matches
    const entries = Array.from(this.fmRangesCache.entries());
    for (const [cacheKey, range] of entries) {
      if (
        cacheKey.includes(testName.toLowerCase()) ||
        testName.toLowerCase().includes(cacheKey)
      ) {
        return range;
      }
    }

    return null;
  }

  private determineLabStatus(
    value: number,
    range: any
  ): LabAnalysisResult['status'] {
    // Check critical values first
    if (range.criticalLow && value < range.criticalLow) {
      return 'critical_low';
    }
    if (range.criticalHigh && value > range.criticalHigh) {
      return 'critical_high';
    }

    // Check FM optimal ranges
    if (value < range.fmOptimalMin) {
      return 'low';
    }
    if (value > range.fmOptimalMax) {
      return 'high';
    }

    return 'optimal';
  }

  private formatRange(min: number, max: number, unit: string): string {
    return `${min}-${max} ${unit}`;
  }

  private groupLabsBySystem(
    analyzedLabs: LabAnalysisResult[]
  ): SystemAnalysis[] {
    // Group labs by category/system
    const systemGroups = analyzedLabs.reduce(
      (groups, lab) => {
        const category = lab.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(lab);
        return groups;
      },
      {} as Record<string, LabAnalysisResult[]>
    );

    return Object.entries(systemGroups).map(([category, labs]) => {
      const systemAnalysis = this.analyzeSystemHealth(category, labs);
      return systemAnalysis;
    });
  }

  private analyzeSystemHealth(
    category: string,
    labs: LabAnalysisResult[]
  ): SystemAnalysis {
    const criticalCount = labs.filter(
      lab => lab.status === 'critical_low' || lab.status === 'critical_high'
    ).length;

    const suboptimalCount = labs.filter(
      lab => lab.status === 'low' || lab.status === 'high'
    ).length;

    const optimalCount = labs.filter(lab => lab.status === 'optimal').length;

    // Determine overall system status
    let overallStatus: SystemAnalysis['overallStatus'] = 'optimal';
    if (criticalCount > 0) {
      overallStatus = 'critical';
    } else if (suboptimalCount >= Math.ceil(labs.length / 2)) {
      overallStatus = 'concerning';
    } else if (suboptimalCount > 0) {
      overallStatus = 'suboptimal';
    }

    const keyFindings = this.generateSystemKeyFindings(
      category,
      labs,
      criticalCount,
      suboptimalCount
    );
    const recommendations = this.generateSystemRecommendations(
      category,
      labs,
      overallStatus
    );

    return {
      systemName: this.formatSystemName(category),
      category,
      overallStatus,
      keyFindings,
      labValues: labs,
      recommendations,
      criticalCount,
      suboptimalCount,
      optimalCount,
    };
  }

  private formatSystemName(category: string): string {
    const systemNames: Record<string, string> = {
      thyroid: 'Thyroid Function',
      metabolic: 'Metabolic Health',
      inflammation: 'Inflammatory Status',
      nutritional: 'Nutritional Status',
      cardiovascular: 'Cardiovascular Risk',
      liver: 'Liver Function',
      kidney: 'Kidney Function',
      hormonal: 'Hormonal Balance',
      unclassified: 'Other Tests',
    };

    return (
      systemNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  }

  private generateSystemKeyFindings(
    category: string,
    labs: LabAnalysisResult[],
    criticalCount: number,
    suboptimalCount: number
  ): string[] {
    const findings = [];

    if (criticalCount > 0) {
      findings.push(
        `${criticalCount} critical value${
          criticalCount > 1 ? 's' : ''
        } requiring immediate intervention`
      );
    }

    if (suboptimalCount > 0) {
      findings.push(
        `${suboptimalCount} suboptimal marker${
          suboptimalCount > 1 ? 's' : ''
        } indicating system dysfunction`
      );
    }

    // Add category-specific findings
    const categoryFindings = this.getCategorySpecificFindings(category, labs);
    findings.push(...categoryFindings);

    return findings.length > 0
      ? findings
      : ['All markers within functional medicine optimal ranges'];
  }

  private getCategorySpecificFindings(
    category: string,
    labs: LabAnalysisResult[]
  ): string[] {
    const findings = [];

    switch (category) {
      case 'thyroid':
        const tshLab = labs.find(lab => lab.testName.includes('TSH'));
        const ft3Lab = labs.find(lab => lab.testName.includes('T3'));
        const ft4Lab = labs.find(lab => lab.testName.includes('T4'));

        if (tshLab && tshLab.status === 'high') {
          findings.push(
            'Elevated TSH suggests primary hypothyroidism or inadequate thyroid medication'
          );
        }
        if (ft3Lab && ft3Lab.status === 'low') {
          findings.push(
            'Low Free T3 indicates poor T4 to T3 conversion or central hypothyroidism'
          );
        }
        if (
          ft4Lab &&
          ft3Lab &&
          ft4Lab.status === 'optimal' &&
          ft3Lab.status === 'low'
        ) {
          findings.push(
            'Poor T4 to T3 conversion - consider reverse T3 testing'
          );
        }
        break;

      case 'metabolic':
        const glucoseLab = labs.find(lab => lab.testName.includes('Glucose'));
        const hba1cLab = labs.find(lab => lab.testName.includes('A1c'));
        const insulinLab = labs.find(lab => lab.testName.includes('Insulin'));

        if (
          glucoseLab &&
          hba1cLab &&
          glucoseLab.status !== 'optimal' &&
          hba1cLab.status !== 'optimal'
        ) {
          findings.push(
            'Both fasting glucose and HbA1c suboptimal - comprehensive metabolic intervention needed'
          );
        }
        if (insulinLab && insulinLab.status === 'high') {
          findings.push(
            'Elevated fasting insulin indicates insulin resistance'
          );
        }
        break;

      case 'inflammation':
        const crpLab = labs.find(lab => lab.testName.includes('CRP'));
        if (crpLab && crpLab.status !== 'optimal') {
          findings.push(
            'Elevated inflammatory markers suggest underlying inflammatory process'
          );
        }
        break;
    }

    return findings;
  }

  private generateSystemRecommendations(
    category: string,
    labs: LabAnalysisResult[],
    overallStatus: string
  ): string[] {
    const recommendations = [];

    // General recommendations based on status
    switch (overallStatus) {
      case 'critical':
        recommendations.push('Immediate medical consultation required');
        recommendations.push(
          'Recheck critical markers within 1-2 weeks after intervention'
        );
        break;
      case 'concerning':
        recommendations.push(
          'Comprehensive protocol targeting multiple system dysfunctions'
        );
        recommendations.push(
          'Recheck in 4-6 weeks to assess intervention effectiveness'
        );
        break;
      case 'suboptimal':
        recommendations.push(
          'Targeted interventions to optimize suboptimal markers'
        );
        recommendations.push('Recheck in 8-12 weeks to monitor progress');
        break;
      default:
        recommendations.push('Continue current health optimization strategies');
        recommendations.push('Annual monitoring recommended');
    }

    // Category-specific recommendations
    const categoryRecs = this.getCategorySpecificRecommendations(
      category,
      labs
    );
    recommendations.push(...categoryRecs);

    return recommendations;
  }

  private getCategorySpecificRecommendations(
    category: string,
    labs: LabAnalysisResult[]
  ): string[] {
    const recommendations = [];

    switch (category) {
      case 'thyroid':
        if (labs.some(lab => lab.status !== 'optimal')) {
          recommendations.push(
            'Consider comprehensive thyroid panel including TPO antibodies'
          );
          recommendations.push(
            'Evaluate for nutrients: iodine, selenium, zinc, tyrosine'
          );
          recommendations.push('Assess adrenal function and cortisol patterns');
        }
        break;

      case 'metabolic':
        if (labs.some(lab => lab.status !== 'optimal')) {
          recommendations.push(
            'Blood sugar stabilization protocol with chromium, alpha-lipoic acid'
          );
          recommendations.push(
            'Consider continuous glucose monitoring for optimization'
          );
          recommendations.push(
            'Evaluate insulin sensitivity with HOMA-IR calculation'
          );
        }
        break;

      case 'inflammation':
        if (
          labs.some(
            lab => lab.status === 'high' || lab.status === 'critical_high'
          )
        ) {
          recommendations.push(
            'Anti-inflammatory protocol: omega-3s, curcumin, quercetin'
          );
          recommendations.push(
            'Investigate root causes: gut health, food sensitivities, infections'
          );
          recommendations.push(
            'Consider advanced inflammatory markers: IL-6, TNF-alpha'
          );
        }
        break;

      case 'nutritional':
        const deficientNutrients = labs.filter(
          lab => lab.status === 'low' || lab.status === 'critical_low'
        );
        if (deficientNutrients.length > 0) {
          recommendations.push(
            'Targeted nutrient repletion based on identified deficiencies'
          );
          recommendations.push('Assess absorption capacity and gut health');
          recommendations.push(
            'Consider methylated forms for B-vitamins if MTHFR concerns'
          );
        }
        break;

      case 'cardiovascular':
        if (labs.some(lab => lab.status !== 'optimal')) {
          recommendations.push(
            'Cardiovascular risk assessment with advanced lipid panel'
          );
          recommendations.push(
            'Consider Lp(a), apoB, and particle size analysis'
          );
          recommendations.push(
            'Evaluate homocysteine and inflammatory markers'
          );
        }
        break;

      case 'liver':
        if (labs.some(lab => lab.status !== 'optimal')) {
          recommendations.push(
            'Liver detoxification support: milk thistle, NAC, glutathione'
          );
          recommendations.push('Assess for environmental toxin exposure');
          recommendations.push(
            'Consider Phase I/II detoxification pathway testing'
          );
        }
        break;
    }

    return recommendations;
  }

  private analyzeLabTrends(
    analyzedLabs: LabAnalysisResult[]
  ): LabAnalysisReport['trends'] {
    // For now, return empty arrays - trend analysis requires historical data
    // This would be enhanced with actual trend calculation logic
    return {
      improving: [], // analyzedLabs.filter(lab => lab.trend === 'improving'),
      declining: [], // analyzedLabs.filter(lab => lab.trend === 'declining'),
      stable: analyzedLabs, // Most current values assumed stable without historical data
    };
  }

  private generateProtocolInsights(
    systemAnalyses: SystemAnalysis[],
    analyzedLabs: LabAnalysisResult[]
  ): LabAnalysisReport['protocolInsights'] {
    const criticalSystems = systemAnalyses.filter(
      s => s.overallStatus === 'critical'
    );
    const concerningSystems = systemAnalyses.filter(
      s => s.overallStatus === 'concerning'
    );

    const immediatePriorities = criticalSystems.map(
      s =>
        `${s.systemName}: Critical dysfunction requiring immediate intervention`
    );

    const secondaryFocus = concerningSystems.map(
      s =>
        `${s.systemName}: Multiple suboptimal markers requiring comprehensive support`
    );

    // Generate monitoring schedule
    const monitoringSchedule = [];
    if (criticalSystems.length > 0) {
      monitoringSchedule.push(
        '1-2 weeks: Recheck critical markers after immediate interventions'
      );
    }
    if (concerningSystems.length > 0) {
      monitoringSchedule.push(
        '4-6 weeks: Assess concerning systems response to protocols'
      );
    }
    monitoringSchedule.push('8-12 weeks: Comprehensive follow-up panel');
    monitoringSchedule.push(
      '6 months: Complete metabolic and nutritional reassessment'
    );

    // Suggest missing tests based on current findings
    const missingTests = this.suggestMissingTests(systemAnalyses);

    return {
      immediatePriorities,
      secondaryFocus,
      monitoringSchedule,
      missingTests,
    };
  }

  private suggestMissingTests(systemAnalyses: SystemAnalysis[]): string[] {
    const suggestions = [];

    const thyroidSystem = systemAnalyses.find(s => s.category === 'thyroid');
    if (
      thyroidSystem &&
      !thyroidSystem.labValues.some(lab => lab.testName.includes('TPO'))
    ) {
      suggestions.push(
        'Thyroid Peroxidase Antibodies (TPO) - assess autoimmune thyroid'
      );
    }

    const metabolicSystem = systemAnalyses.find(
      s => s.category === 'metabolic'
    );
    if (
      metabolicSystem &&
      !metabolicSystem.labValues.some(lab => lab.testName.includes('Insulin'))
    ) {
      suggestions.push('Fasting Insulin - assess insulin resistance');
    }

    const nutritionalSystem = systemAnalyses.find(
      s => s.category === 'nutritional'
    );
    if (nutritionalSystem && nutritionalSystem.labValues.length < 3) {
      suggestions.push(
        'Comprehensive micronutrient panel - assess nutritional status'
      );
    }

    const inflammationSystem = systemAnalyses.find(
      s => s.category === 'inflammation'
    );
    if (!inflammationSystem) {
      suggestions.push(
        'Inflammatory markers (CRP, ESR) - assess inflammatory status'
      );
    }

    return suggestions;
  }

  private generateSummaryStats(
    analyzedLabs: LabAnalysisResult[],
    systemAnalyses: SystemAnalysis[]
  ): LabAnalysisReport['summary'] {
    const criticalValues = analyzedLabs.filter(
      lab => lab.status === 'critical_low' || lab.status === 'critical_high'
    ).length;

    const suboptimalValues = analyzedLabs.filter(
      lab => lab.status === 'low' || lab.status === 'high'
    ).length;

    const optimalValues = analyzedLabs.filter(
      lab => lab.status === 'optimal'
    ).length;

    return {
      totalTests: analyzedLabs.length,
      criticalValues,
      suboptimalValues,
      optimalValues,
      systemsAnalyzed: systemAnalyses.length,
    };
  }

  private generateEmptyReport(): LabAnalysisReport {
    return {
      criticalValues: [],
      systemAnalyses: [],
      trends: { improving: [], declining: [], stable: [] },
      protocolInsights: {
        immediatePriorities: [],
        secondaryFocus: [],
        monitoringSchedule: [],
        missingTests: [],
      },
      summary: {
        totalTests: 0,
        criticalValues: 0,
        suboptimalValues: 0,
        optimalValues: 0,
        systemsAnalyzed: 0,
      },
    };
  }

  private generateCriticalValuesTable(
    criticalValues: LabAnalysisResult[]
  ): string {
    if (!criticalValues.length) {
      return '*No critical values identified - excellent health optimization opportunity*\n\n';
    }

    const tableRows = criticalValues
      .map(lab => {
        const statusIcon =
          lab.status === 'critical_high' ? '🔴 HIGH' : '🔵 LOW';
        const trendIcon =
          lab.trend === 'improving'
            ? '↗️'
            : lab.trend === 'declining'
              ? '↘️'
              : '→';

        return `| ${lab.testName} | **${lab.value} ${lab.unit}** | ${lab.fmRange} | ${statusIcon} | ${trendIcon} |`;
      })
      .join('\n');

    return `| Test Name | Current Value | FM Optimal Range | Status | Trend |
|-----------|---------------|------------------|---------|--------|
${tableRows}

⚠️  **Critical values require immediate medical consultation and intervention**

`;
  }

  private generateSystemAnalysesMarkdown(
    systemAnalyses: SystemAnalysis[]
  ): string {
    if (!systemAnalyses.length) {
      return '*No lab systems available for analysis*\n\n';
    }

    return systemAnalyses
      .map(system => {
        const statusIcon =
          system.overallStatus === 'critical'
            ? '🔴'
            : system.overallStatus === 'concerning'
              ? '🟠'
              : system.overallStatus === 'suboptimal'
                ? '🟡'
                : '🟢';

        const labValuesList = system.labValues
          .map(lab => {
            const valueStatus =
              lab.status === 'optimal'
                ? '✅'
                : lab.status.includes('critical')
                  ? '🔴'
                  : '🟡';
            return `  - **${lab.testName}**: ${lab.value} ${lab.unit} (FM: ${lab.fmRange}) ${valueStatus}`;
          })
          .join('\n');

        const findingsList = system.keyFindings
          .map(finding => `  - ${finding}`)
          .join('\n');
        const recommendationsList = system.recommendations
          .map(rec => `  - ${rec}`)
          .join('\n');

        return `#### ${statusIcon} **${system.systemName.toUpperCase()}** 
*Status: ${system.overallStatus.toUpperCase()}* | Critical: ${
          system.criticalCount
        } | Suboptimal: ${system.suboptimalCount} | Optimal: ${
          system.optimalCount
        }

**Lab Values:**
${labValuesList}

**Key Clinical Insights:**
${findingsList}

**Protocol Recommendations:**
${recommendationsList}

`;
      })
      .join('\n');
  }

  private generateTrendsAnalysisMarkdown(
    trends: LabAnalysisReport['trends']
  ): string {
    return `- **Improving Markers**: ${
      trends.improving.length > 0
        ? trends.improving.map(l => l.testName).join(', ')
        : 'Historical data needed for trend analysis'
    }
- **Declining Markers**: ${
      trends.declining.length > 0
        ? trends.declining.map(l => l.testName).join(', ')
        : 'Historical data needed for trend analysis'
    }  
- **Stable Markers**: ${
      trends.stable.length > 0
        ? `${trends.stable.length} current values`
        : 'No stable markers identified'
    }
- **Trend Analysis**: *Enhanced trend tracking requires multiple lab results over time*

`;
  }

  private generateProtocolInsightsMarkdown(
    insights: LabAnalysisReport['protocolInsights']
  ): string {
    const priorities =
      insights.immediatePriorities.length > 0
        ? insights.immediatePriorities.map(p => `1. ${p}`).join('\n')
        : '✅ No immediate critical priorities identified';

    const secondary =
      insights.secondaryFocus.length > 0
        ? insights.secondaryFocus.map(f => `- ${f}`).join('\n')
        : '- Focus on health optimization and prevention strategies';

    const monitoring = insights.monitoringSchedule
      .map(m => `- ${m}`)
      .join('\n');

    const missing =
      insights.missingTests.length > 0
        ? insights.missingTests.map(t => `- ${t}`).join('\n')
        : '- Current lab panel appears comprehensive for identified concerns';

    return `**🚨 Immediate Protocol Priorities:**
${priorities}

**🎯 Secondary Protocol Focus:**
${secondary}

**📅 Recommended Monitoring Schedule:**
${monitoring}

**🔍 Suggested Additional Testing:**
${missing}

`;
  }
}

// Export singleton instance
export const functionalMedicineLabAnalysis =
  new FunctionalMedicineLabAnalysis();
