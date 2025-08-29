import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enhanced interfaces for assessment analysis
export interface AssessmentAnalysisResult {
  categoryId: string;
  categoryName: string;
  systemFocus: string;
  currentScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  diagnosticConfidence: number; // 0-100%
  keySymptoms: string[];
  patternMatch: number; // 0-100% match to known patterns
  interventionPriority: number; // 1=Critical, 2=High, 3=Moderate, 4=Low
  rootCauseIndicators: string[];
  trend?: 'improving' | 'stable' | 'worsening' | null;
}

export interface SystemAnalysis {
  systemName: string;
  systemFocus: string;
  overallScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  categories: AssessmentAnalysisResult[];
  primaryConcerns: string[];
  interventionStrategy: string[];
  criticalCount: number;
  highRiskCount: number;
  moderateCount: number;
}

export interface AssessmentAnalysisReport {
  systemAnalyses: SystemAnalysis[];
  criticalFindings: AssessmentAnalysisResult[];
  patternInsights: {
    highConfidencePatterns: AssessmentAnalysisResult[];
    emergingPatterns: AssessmentAnalysisResult[];
    rootCauseConnections: string[];
  };
  interventionMatrix: {
    phase1: string[]; // Immediate (0-4 weeks)
    phase2: string[]; // Building (4-12 weeks)
    phase3: string[]; // Optimization (3-6 months)
  };
  summary: {
    totalCategories: number;
    criticalCategories: number;
    highRiskCategories: number;
    moderateRiskCategories: number;
    systemsAnalyzed: number;
    overallHealthScore: number;
  };
}

/**
 * Advanced functional medicine assessment analysis with pattern recognition
 */
export class FunctionalMedicineAssessmentAnalysis {
  private categoriesCache: any[] = [];
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Main analysis function for assessment categorization
   */
  async generateEnhancedAssessmentAnalysis(
    assessments: any[]
  ): Promise<AssessmentAnalysisReport> {
    if (!assessments || !assessments.length) {
      return this.generateEmptyReport();
    }

    // Load assessment categories with caching
    await this.loadAssessmentCategories();

    // Get latest assessment and previous for trend analysis
    const latestAssessment = assessments[0];
    const previousAssessment = assessments[1] || null;

    // Analyze assessment responses against categories
    const categoryAnalyses = await this.analyzeCategoricalPerformance(
      latestAssessment,
      previousAssessment
    );

    // Group by system
    const systemAnalyses = this.groupCategoriesBySystem(categoryAnalyses);

    // Generate pattern insights
    const patternInsights = this.generatePatternInsights(categoryAnalyses);

    // Generate intervention matrix
    const interventionMatrix = this.generateInterventionMatrix(systemAnalyses);

    // Generate summary statistics
    const summary = this.generateSummaryStats(categoryAnalyses, systemAnalyses);

    return {
      systemAnalyses,
      criticalFindings: categoryAnalyses.filter(
        cat => cat.riskLevel === 'critical'
      ),
      patternInsights,
      interventionMatrix,
      summary,
    };
  }

  /**
   * Generate markdown representation of assessment analysis
   */
  generateAssessmentAnalysisMarkdown(report: AssessmentAnalysisReport): string {
    if (report.summary.totalCategories === 0) {
      return '### 🎯 ASSESSMENT ANALYSIS\n*No assessments available for functional medicine analysis*\n\n';
    }

    return `### 🎯 FUNCTIONAL MEDICINE ASSESSMENT ANALYSIS

## 📊 ASSESSMENT OVERVIEW
- **Total Categories Analyzed**: ${report.summary.totalCategories}
- **Critical Risk**: ${report.summary.criticalCategories} 🔴
- **High Risk**: ${report.summary.highRiskCategories} 🟠
- **Moderate Risk**: ${report.summary.moderateRiskCategories} 🟡
- **Overall Health Score**: ${report.summary.overallHealthScore.toFixed(1)}/5.0
- **Systems Analyzed**: ${report.summary.systemsAnalyzed}

## 🏥 SYSTEM-BASED ANALYSIS
${this.generateSystemScoresTable(report.systemAnalyses)}

${this.generateDetailedSystemAnalysis(report.systemAnalyses)}

## 🚨 CRITICAL FINDINGS FOR PROTOCOL DEVELOPMENT
${this.generateCriticalFindings(report.criticalFindings)}

## 🔍 PATTERN RECOGNITION INSIGHTS
${this.generatePatternAnalysisMarkdown(report.patternInsights)}

## 🎯 INTERVENTION PRIORITY MATRIX
${this.generateInterventionMatrixMarkdown(report.interventionMatrix)}

---
*Analysis based on Functional Medicine assessment categorization and pattern recognition*

`;
  }

  private async loadAssessmentCategories(): Promise<void> {
    const now = Date.now();

    // Check cache validity
    if (this.categoriesCache.length > 0 && now < this.cacheExpiry) {
      return;
    }

    try {
      const categories = await prisma.assessmentCategory.findMany({
        include: {
          questionCategories: true,
        },
        orderBy: [
          { interventionPriority: 'asc' },
          { diagnosticWeight: 'desc' },
        ],
      });

      this.categoriesCache = categories;
      this.cacheExpiry = now + this.CACHE_DURATION;

      console.log(
        `📋 Loaded ${categories.length} assessment categories into cache`
      );
    } catch (error) {
      console.error('❌ Error loading assessment categories:', error);
      throw new Error('Failed to load assessment categories for analysis');
    }
  }

  private async analyzeCategoricalPerformance(
    latestAssessment: any,
    previousAssessment: any
  ): Promise<AssessmentAnalysisResult[]> {
    const categoryAnalyses: AssessmentAnalysisResult[] = [];

    for (const category of this.categoriesCache) {
      // Calculate category score based on question responses
      const categoryScore = this.calculateCategoryScore(
        latestAssessment,
        category
      );
      const previousScore = previousAssessment
        ? this.calculateCategoryScore(previousAssessment, category)
        : null;

      // Determine risk level
      const riskLevel = this.determineRiskLevel(categoryScore);

      // Calculate diagnostic confidence based on pattern matching
      const patternMatch = this.calculatePatternMatch(
        latestAssessment,
        category
      );
      const diagnosticConfidence = this.calculateDiagnosticConfidence(
        categoryScore,
        patternMatch,
        category.diagnosticWeight
      );

      // Extract key symptoms for this category
      const keySymptoms = this.extractKeySymptoms(latestAssessment, category);

      // Identify root cause indicators
      const rootCauseIndicators = this.identifyRootCauseIndicators(category);

      // Determine trend if previous assessment available
      const trend = previousScore
        ? this.calculateTrend(categoryScore, previousScore)
        : null;

      categoryAnalyses.push({
        categoryId: category.id,
        categoryName: category.categoryName,
        systemFocus: category.systemFocus,
        currentScore: categoryScore,
        riskLevel,
        diagnosticConfidence,
        keySymptoms,
        patternMatch,
        interventionPriority: category.interventionPriority,
        rootCauseIndicators,
        trend,
      });
    }

    // Sort by intervention priority and then by score
    return categoryAnalyses.sort(
      (a, b) =>
        a.interventionPriority - b.interventionPriority ||
        b.currentScore - a.currentScore
    );
  }

  private calculateCategoryScore(assessment: any, category: any): number {
    // Calculate weighted score for category based on question responses
    let totalScore = 0;
    let totalWeight = 0;
    let responseCount = 0;

    // Since we don't have question mappings yet, calculate based on responses
    // This is a simplified approach that looks for symptom patterns in responses
    const responses = assessment.responses || [];

    if (!responses.length) return 0;

    // Look for pattern matches in assessment responses
    const patterns = category.symptomPatterns || {};
    const primarySymptoms = patterns.primary || [];
    const secondarySymptoms = patterns.secondary || [];

    for (const response of responses) {
      const questionText =
        response.questionText || response.question?.text || '';
      const responseValue = parseInt(
        response.score || response.responseValue || 0
      );

      if (!questionText || isNaN(responseValue)) continue;

      // Check if this response matches category patterns
      let weight = 0.1; // Base weight for any response

      // Higher weight for primary symptom matches
      for (const symptom of primarySymptoms) {
        if (questionText.toLowerCase().includes(symptom.toLowerCase())) {
          weight = 2.0; // High weight for primary symptoms
          break;
        }
      }

      // Medium weight for secondary symptom matches
      if (weight === 0.1) {
        for (const symptom of secondarySymptoms) {
          if (questionText.toLowerCase().includes(symptom.toLowerCase())) {
            weight = 1.0; // Medium weight for secondary symptoms
            break;
          }
        }
      }

      if (weight > 0.1) {
        totalScore += responseValue * weight;
        totalWeight += weight;
        responseCount++;
      }
    }

    // Apply category diagnostic weight
    const baseScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    return Math.min(5.0, baseScore * category.diagnosticWeight * 0.5); // Scale to 5-point system
  }

  private determineRiskLevel(
    score: number
  ): AssessmentAnalysisResult['riskLevel'] {
    if (score >= 4.0) return 'critical';
    if (score >= 3.0) return 'high';
    if (score >= 2.0) return 'moderate';
    return 'low';
  }

  private calculatePatternMatch(assessment: any, category: any): number {
    const patterns = category.symptomPatterns || {};
    const primarySymptoms = patterns.primary || [];
    const secondarySymptoms = patterns.secondary || [];

    if (primarySymptoms.length === 0 && secondarySymptoms.length === 0) {
      return 0;
    }

    const responses = assessment.responses || [];

    const primaryMatches = this.countSymptomMatches(responses, primarySymptoms);
    const secondaryMatches = this.countSymptomMatches(
      responses,
      secondarySymptoms
    );

    const primaryScore =
      primarySymptoms.length > 0
        ? (primaryMatches / primarySymptoms.length) * 70
        : 0;

    const secondaryScore =
      secondarySymptoms.length > 0
        ? (secondaryMatches / secondarySymptoms.length) * 30
        : 0;

    return Math.min(100, primaryScore + secondaryScore);
  }

  private countSymptomMatches(responses: any[], symptoms: string[]): number {
    let matches = 0;

    for (const symptom of symptoms) {
      const hasSymptom = responses.some(response => {
        const questionText =
          response.questionText || response.question?.text || '';
        const responseValue = parseInt(
          response.score || response.responseValue || 0
        );

        return (
          questionText.toLowerCase().includes(symptom.toLowerCase()) &&
          responseValue >= 3 // Moderate or higher severity
        );
      });

      if (hasSymptom) matches++;
    }

    return matches;
  }

  private calculateDiagnosticConfidence(
    categoryScore: number,
    patternMatch: number,
    diagnosticWeight: number
  ): number {
    // Calculate confidence based on score, pattern match, and diagnostic weight
    const scoreConfidence = Math.min(100, (categoryScore / 5) * 100);
    const weightedConfidence = scoreConfidence * 0.6 + patternMatch * 0.4;

    // Apply diagnostic weight multiplier (capped at 100%)
    return Math.min(
      100,
      Math.round(weightedConfidence * diagnosticWeight * 0.8)
    );
  }

  private extractKeySymptoms(assessment: any, category: any): string[] {
    const keySymptoms: string[] = [];
    const responses = assessment.responses || [];
    const patterns = category.symptomPatterns || {};
    const allSymptoms = [
      ...(patterns.primary || []),
      ...(patterns.secondary || []),
    ];

    // Find responses that match category symptoms and have high scores
    for (const response of responses) {
      const questionText =
        response.questionText || response.question?.text || '';
      const responseValue = parseInt(
        response.score || response.responseValue || 0
      );

      if (responseValue >= 3) {
        // Check if this response matches any category symptoms
        for (const symptom of allSymptoms) {
          if (questionText.toLowerCase().includes(symptom.toLowerCase())) {
            keySymptoms.push(`${questionText}: ${responseValue}/5`);
            break;
          }
        }
      }
    }

    return keySymptoms.slice(0, 5); // Top 5 symptoms
  }

  private identifyRootCauseIndicators(category: any): string[] {
    const indicators = category.rootCauseIndicators?.causes || [];
    const mechanisms = category.rootCauseIndicators?.mechanisms || [];

    return [...indicators.slice(0, 3), ...mechanisms.slice(0, 2)];
  }

  private calculateTrend(
    currentScore: number,
    previousScore: number
  ): 'improving' | 'stable' | 'worsening' {
    const difference = currentScore - previousScore;
    const threshold = 0.3; // Minimum change to be considered significant

    if (difference > threshold) return 'worsening';
    if (difference < -threshold) return 'improving';
    return 'stable';
  }

  private groupCategoriesBySystem(
    categoryAnalyses: AssessmentAnalysisResult[]
  ): SystemAnalysis[] {
    // Group categories by system
    const systemGroups = categoryAnalyses.reduce(
      (groups, category) => {
        const system = category.systemFocus;
        if (!groups[system]) {
          groups[system] = [];
        }
        groups[system].push(category);
        return groups;
      },
      {} as Record<string, AssessmentAnalysisResult[]>
    );

    return Object.entries(systemGroups)
      .map(([systemFocus, categories]) => {
        const overallScore =
          categories.length > 0
            ? categories.reduce((sum, cat) => sum + cat.currentScore, 0) /
              categories.length
            : 0;

        const riskLevel = this.determineRiskLevel(overallScore);

        const primaryConcerns = categories
          .filter(
            cat => cat.riskLevel === 'critical' || cat.riskLevel === 'high'
          )
          .map(cat => cat.categoryName);

        const interventionStrategy = this.generateSystemInterventionStrategy(
          systemFocus,
          categories
        );

        const criticalCount = categories.filter(
          cat => cat.riskLevel === 'critical'
        ).length;
        const highRiskCount = categories.filter(
          cat => cat.riskLevel === 'high'
        ).length;
        const moderateCount = categories.filter(
          cat => cat.riskLevel === 'moderate'
        ).length;

        return {
          systemName: this.formatSystemName(systemFocus),
          systemFocus,
          overallScore,
          riskLevel,
          categories: categories.sort(
            (a, b) => b.currentScore - a.currentScore
          ),
          primaryConcerns,
          interventionStrategy,
          criticalCount,
          highRiskCount,
          moderateCount,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore); // Sort by severity
  }

  private formatSystemName(systemFocus: string): string {
    const systemNames: Record<string, string> = {
      digestive: 'Digestive Health',
      energy: 'Energy & Adrenals',
      hormonal: 'Hormonal Balance',
      inflammation: 'Inflammatory Status',
      detoxification: 'Detoxification Capacity',
      neurological: 'Neurological Function',
      metabolic: 'Metabolic Health',
      immune: 'Immune Function',
    };

    return (
      systemNames[systemFocus] ||
      systemFocus.charAt(0).toUpperCase() + systemFocus.slice(1)
    );
  }

  private generateSystemInterventionStrategy(
    systemFocus: string,
    categories: AssessmentAnalysisResult[]
  ): string[] {
    const strategies = [];
    const hasHighRisk = categories.some(
      cat => cat.riskLevel === 'high' || cat.riskLevel === 'critical'
    );

    switch (systemFocus.toLowerCase()) {
      case 'digestive':
        if (hasHighRisk) {
          strategies.push(
            'Comprehensive digestive repair protocol with enzymes, probiotics, and gut healing nutrients'
          );
          strategies.push(
            'Food sensitivity testing and targeted elimination diet'
          );
          strategies.push('SIBO/dysbiosis testing and antimicrobial therapy');
        } else {
          strategies.push('Digestive support with enzymes and prebiotic foods');
          strategies.push('Gut health maintenance with probiotics and fiber');
        }
        break;

      case 'energy':
        if (hasHighRisk) {
          strategies.push(
            'Comprehensive adrenal support protocol with adaptogenic herbs'
          );
          strategies.push(
            'Mitochondrial support with CoQ10, B-vitamins, and magnesium'
          );
          strategies.push(
            'Sleep optimization and circadian rhythm restoration'
          );
        } else {
          strategies.push('Energy optimization with B-complex and magnesium');
          strategies.push('Stress management and exercise moderation');
        }
        break;

      case 'hormonal':
        if (hasHighRisk) {
          strategies.push(
            'Comprehensive hormone testing and targeted balancing protocol'
          );
          strategies.push(
            'Liver detoxification support for hormone metabolism'
          );
          strategies.push('Stress management and lifestyle modifications');
        } else {
          strategies.push('Hormone optimization with targeted nutrition');
          strategies.push('Lifestyle modifications for hormonal balance');
        }
        break;

      case 'inflammation':
        if (hasHighRisk) {
          strategies.push(
            'Aggressive anti-inflammatory protocol with omega-3s, curcumin, quercetin'
          );
          strategies.push(
            'Root cause investigation: gut health, infections, toxins'
          );
          strategies.push('Advanced inflammatory marker testing');
        } else {
          strategies.push(
            'Anti-inflammatory nutrition with omega-3s and antioxidants'
          );
          strategies.push('Stress reduction and gentle exercise');
        }
        break;

      case 'detoxification':
        if (hasHighRisk) {
          strategies.push(
            'Comprehensive detox support with Phase I/II nutrients'
          );
          strategies.push('Environmental toxin reduction and testing');
          strategies.push(
            'Liver support with milk thistle, NAC, and glutathione'
          );
        } else {
          strategies.push(
            'Basic detox support with cruciferous vegetables and fiber'
          );
          strategies.push('Hydration optimization and sauna therapy');
        }
        break;

      case 'neurological':
        if (hasHighRisk) {
          strategies.push('Comprehensive neurotransmitter support and testing');
          strategies.push(
            'Neuroinflammation reduction with specialized nutrients'
          );
          strategies.push(
            'Cognitive support with nootropics and lifestyle changes'
          );
        } else {
          strategies.push(
            'Brain health optimization with omega-3s and B-vitamins'
          );
          strategies.push('Stress management and cognitive exercises');
        }
        break;

      case 'metabolic':
        if (hasHighRisk) {
          strategies.push('Intensive blood sugar stabilization protocol');
          strategies.push(
            'Insulin sensitivity improvement with targeted nutrients'
          );
          strategies.push('Comprehensive metabolic testing and monitoring');
        } else {
          strategies.push(
            'Blood sugar optimization with chromium and cinnamon'
          );
          strategies.push('Exercise and dietary modifications');
        }
        break;

      case 'immune':
        if (hasHighRisk) {
          strategies.push('Comprehensive immune system support and testing');
          strategies.push('Gut health optimization for immune function');
          strategies.push('Nutrient repletion for immune competence');
        } else {
          strategies.push('Immune optimization with vitamin D and zinc');
          strategies.push('Stress reduction and adequate sleep');
        }
        break;

      default:
        strategies.push('Targeted nutritional and lifestyle interventions');
        strategies.push('System-specific testing and monitoring');
        strategies.push('Root cause investigation and treatment');
    }

    return strategies;
  }

  private generatePatternInsights(
    categoryAnalyses: AssessmentAnalysisResult[]
  ): AssessmentAnalysisReport['patternInsights'] {
    const highConfidencePatterns = categoryAnalyses
      .filter(cat => cat.diagnosticConfidence >= 75)
      .slice(0, 5);

    const emergingPatterns = categoryAnalyses
      .filter(
        cat => cat.diagnosticConfidence >= 50 && cat.diagnosticConfidence < 75
      )
      .slice(0, 3);

    // Identify potential root cause connections
    const rootCauseConnections =
      this.identifyRootCauseConnections(categoryAnalyses);

    return {
      highConfidencePatterns,
      emergingPatterns,
      rootCauseConnections,
    };
  }

  private identifyRootCauseConnections(
    categoryAnalyses: AssessmentAnalysisResult[]
  ): string[] {
    const connections = [];
    const highRiskCategories = categoryAnalyses.filter(
      cat => cat.riskLevel === 'high' || cat.riskLevel === 'critical'
    );

    // Look for common root cause patterns
    if (
      highRiskCategories.some(cat => cat.systemFocus === 'digestive') &&
      highRiskCategories.some(cat => cat.systemFocus === 'inflammation')
    ) {
      connections.push(
        'Gut dysfunction appears to be driving systemic inflammation'
      );
    }

    if (
      highRiskCategories.some(cat => cat.systemFocus === 'energy') &&
      highRiskCategories.some(cat => cat.systemFocus === 'hormonal')
    ) {
      connections.push(
        'HPA axis dysfunction may be affecting multiple hormone systems'
      );
    }

    if (
      highRiskCategories.some(cat => cat.systemFocus === 'metabolic') &&
      highRiskCategories.some(cat => cat.systemFocus === 'inflammation')
    ) {
      connections.push(
        'Metabolic dysfunction and inflammation are interconnected'
      );
    }

    if (
      highRiskCategories.some(cat => cat.systemFocus === 'detoxification') &&
      highRiskCategories.some(cat => cat.systemFocus === 'neurological')
    ) {
      connections.push(
        'Impaired detoxification may be affecting neurological function'
      );
    }

    return connections.length > 0
      ? connections
      : ['No clear root cause connections identified'];
  }

  private generateInterventionMatrix(
    systemAnalyses: SystemAnalysis[]
  ): AssessmentAnalysisReport['interventionMatrix'] {
    const phase1 = systemAnalyses
      .filter(s => s.overallScore >= 3.5)
      .slice(0, 2)
      .map(
        s =>
          `${s.systemName}: ${
            s.interventionStrategy[0] || 'Comprehensive support protocol'
          }`
      );

    const phase2 = systemAnalyses
      .filter(s => s.overallScore >= 2.5 && s.overallScore < 3.5)
      .slice(0, 3)
      .map(
        s =>
          `${s.systemName}: ${
            s.interventionStrategy[0] || 'Optimization and support'
          }`
      );

    const phase3 = systemAnalyses
      .filter(s => s.overallScore < 2.5)
      .map(s => `${s.systemName}: Maintenance and prevention protocols`);

    return {
      phase1:
        phase1.length > 0
          ? phase1
          : ['Focus on symptom stabilization and immediate concerns'],
      phase2: phase2.length > 0 ? phase2 : ['Continue optimization protocols'],
      phase3:
        phase3.length > 0 ? phase3 : ['Long-term maintenance and prevention'],
    };
  }

  private generateSummaryStats(
    categoryAnalyses: AssessmentAnalysisResult[],
    systemAnalyses: SystemAnalysis[]
  ): AssessmentAnalysisReport['summary'] {
    const criticalCategories = categoryAnalyses.filter(
      cat => cat.riskLevel === 'critical'
    ).length;
    const highRiskCategories = categoryAnalyses.filter(
      cat => cat.riskLevel === 'high'
    ).length;
    const moderateRiskCategories = categoryAnalyses.filter(
      cat => cat.riskLevel === 'moderate'
    ).length;

    const overallHealthScore =
      systemAnalyses.length > 0
        ? systemAnalyses.reduce((sum, system) => sum + system.overallScore, 0) /
          systemAnalyses.length
        : 0;

    return {
      totalCategories: categoryAnalyses.length,
      criticalCategories,
      highRiskCategories,
      moderateRiskCategories,
      systemsAnalyzed: systemAnalyses.length,
      overallHealthScore: 5.0 - overallHealthScore, // Invert for health score (higher = better)
    };
  }

  private generateEmptyReport(): AssessmentAnalysisReport {
    return {
      systemAnalyses: [],
      criticalFindings: [],
      patternInsights: {
        highConfidencePatterns: [],
        emergingPatterns: [],
        rootCauseConnections: [],
      },
      interventionMatrix: {
        phase1: [],
        phase2: [],
        phase3: [],
      },
      summary: {
        totalCategories: 0,
        criticalCategories: 0,
        highRiskCategories: 0,
        moderateRiskCategories: 0,
        systemsAnalyzed: 0,
        overallHealthScore: 5.0,
      },
    };
  }

  private generateSystemScoresTable(systemAnalyses: SystemAnalysis[]): string {
    if (!systemAnalyses.length) {
      return '*No systems available for analysis*\n\n';
    }

    const tableRows = systemAnalyses
      .map(system => {
        const riskIcon =
          system.riskLevel === 'critical'
            ? '🔴'
            : system.riskLevel === 'high'
              ? '🟠'
              : system.riskLevel === 'moderate'
                ? '🟡'
                : '🟢';

        const trend = '→'; // Would calculate from historical data
        const riskLevel =
          system.riskLevel.charAt(0).toUpperCase() + system.riskLevel.slice(1);

        return `| ${system.systemName} | ${system.overallScore.toFixed(
          1
        )}/5 | N/A | ${trend} | ${riskIcon} ${riskLevel} |`;
      })
      .join('\n');

    return `| System | Current Score | Previous Score | Change | Risk Level |
|---------|---------------|----------------|---------|------------|
${tableRows}

`;
  }

  private generateDetailedSystemAnalysis(
    systemAnalyses: SystemAnalysis[]
  ): string {
    return systemAnalyses
      .map(system => {
        const statusIcon =
          system.riskLevel === 'critical'
            ? '🔴'
            : system.riskLevel === 'high'
              ? '🟠'
              : system.riskLevel === 'moderate'
                ? '🟡'
                : '🟢';

        const categoriesList = system.categories
          .map(cat => {
            const confidenceIcon =
              cat.diagnosticConfidence >= 80
                ? '🎯'
                : cat.diagnosticConfidence >= 60
                  ? '📊'
                  : '🔍';

            const trendIcon =
              cat.trend === 'improving'
                ? '📈'
                : cat.trend === 'worsening'
                  ? '📉'
                  : '📊';

            return `  - **${cat.categoryName}**: ${cat.currentScore.toFixed(
              1
            )}/5 (${
              cat.diagnosticConfidence
            }% confidence) ${confidenceIcon} ${trendIcon}`;
          })
          .join('\n');

        const keySymptomsList = system.categories
          .flatMap(cat => cat.keySymptoms.slice(0, 2))
          .slice(0, 4)
          .map(symptom => `  - ${symptom}`)
          .join('\n');

        const interventionsList = system.interventionStrategy
          .map(strategy => `  - ${strategy}`)
          .join('\n');

        const statsLine = `Critical: ${system.criticalCount} | High Risk: ${system.highRiskCount} | Moderate: ${system.moderateCount}`;

        return `#### ${statusIcon} **${system.systemName.toUpperCase()}** (Score: ${system.overallScore.toFixed(
          1
        )}/5)
*${statsLine}*

**Categories Analyzed:**
${categoriesList}

**Key Problem Areas:**
${keySymptomsList || '  - No significant symptoms identified'}

**Primary Concerns:**
${
  system.primaryConcerns.length > 0
    ? system.primaryConcerns.map(concern => `  - ${concern}`).join('\n')
    : '  - No critical patterns identified'
}

**Intervention Strategy:**
${interventionsList}

`;
      })
      .join('\n');
  }

  private generateCriticalFindings(
    criticalFindings: AssessmentAnalysisResult[]
  ): string {
    if (criticalFindings.length === 0) {
      return '✅ **No critical findings identified in assessment analysis**\n- Focus on health optimization and prevention strategies\n\n';
    }

    const criticalList = criticalFindings
      .map(cat => {
        const confidence =
          cat.diagnosticConfidence >= 80
            ? 'High'
            : cat.diagnosticConfidence >= 60
              ? 'Moderate'
              : 'Low';

        return `- 🔴 **${cat.categoryName}**: Score ${cat.currentScore.toFixed(
          1
        )}/5 (${confidence} confidence)
  - Pattern match: ${cat.patternMatch}%
  - Key symptoms: ${cat.keySymptoms.slice(0, 2).join(', ')}
  - Priority: ${cat.interventionPriority === 1 ? 'Critical' : 'High'}`;
      })
      .join('\n\n');

    return `## IMMEDIATE ATTENTION REQUIRED

${criticalList}

⚠️ **Critical categories require immediate functional medicine intervention and monitoring**

`;
  }

  private generatePatternAnalysisMarkdown(
    insights: AssessmentAnalysisReport['patternInsights']
  ): string {
    const { highConfidencePatterns, emergingPatterns, rootCauseConnections } =
      insights;

    let analysis = '';

    if (highConfidencePatterns.length > 0) {
      analysis += '## HIGH CONFIDENCE PATTERNS\n';
      analysis +=
        highConfidencePatterns
          .map(cat => {
            return `**${cat.categoryName}** (${
              cat.diagnosticConfidence
            }% pattern match)
- Root causes: ${cat.rootCauseIndicators.slice(0, 3).join(', ')}
- Intervention priority: ${
              cat.interventionPriority === 1
                ? 'Critical'
                : cat.interventionPriority === 2
                  ? 'High'
                  : 'Moderate'
            }`;
          })
          .join('\n\n') + '\n\n';
    }

    if (emergingPatterns.length > 0) {
      analysis += '## EMERGING PATTERNS\n';
      analysis +=
        emergingPatterns
          .map(
            cat =>
              `- **${cat.categoryName}**: ${cat.diagnosticConfidence}% confidence`
          )
          .join('\n') + '\n\n';
    }

    if (rootCauseConnections.length > 0) {
      analysis += '## ROOT CAUSE CONNECTIONS\n';
      analysis +=
        rootCauseConnections.map(connection => `- ${connection}`).join('\n') +
        '\n\n';
    }

    return (
      analysis ||
      '- No clear patterns identified with sufficient confidence\n- Consider comprehensive follow-up assessment for pattern clarification\n\n'
    );
  }

  private generateInterventionMatrixMarkdown(
    matrix: AssessmentAnalysisReport['interventionMatrix']
  ): string {
    return `**Phase 1 (Immediate - 0-4 weeks):**
${
  matrix.phase1.length > 0
    ? matrix.phase1.map(item => `- ${item}`).join('\n')
    : '- Focus on symptom stabilization'
}

**Phase 2 (Building - 4-12 weeks):**
${
  matrix.phase2.length > 0
    ? matrix.phase2.map(item => `- ${item}`).join('\n')
    : '- Continued optimization protocols'
}

**Phase 3 (Optimization - 3-6 months):**
${
  matrix.phase3.length > 0
    ? matrix.phase3.map(item => `- ${item}`).join('\n')
    : '- Long-term maintenance and prevention'
}

`;
  }
}

// Export singleton instance
export const functionalMedicineAssessmentAnalysis =
  new FunctionalMedicineAssessmentAnalysis();
