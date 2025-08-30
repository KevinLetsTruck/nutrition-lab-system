/**
 * Comprehensive Assessment Scoring System
 * 
 * Sophisticated scoring algorithms for functional medicine assessment with root cause analysis,
 * system prioritization, and treatment sequencing based on evidence-based FM principles.
 */

import { 
  ComprehensiveQuestion, 
  COMPREHENSIVE_QUESTIONS, 
  SYSTEM_CATEGORIES, 
  SCORING_CONFIG,
  QUESTION_CLUSTERS
} from '../simple-assessment/comprehensive-questions';

// Core interfaces for scoring results
export interface SystemScore {
  systemCategory: string;
  systemName: string;
  rawScore: number;           // Average of weighted question scores
  adjustedScore: number;      // After system weight applied
  severityLevel: 'minimal' | 'mild' | 'moderate' | 'severe' | 'critical';
  interventionPriority: number; // 1-5 priority ranking
  keySymptoms: string[];      // Top contributing symptoms
  confidenceScore: number;    // Based on question cluster completion
  subCategoryScores: SubCategoryScore[];
  clinicalInsights: string[]; // Key clinical patterns identified
}

export interface SubCategoryScore {
  subCategory: string;
  name: string;
  score: number;
  severity: string;
  questionCount: number;
  completionRate: number;
  keyFindings: string[];
}

export interface RootCauseAnalysis {
  primaryDrivers: string[];          // 1-2 main systems driving symptoms
  systemInterconnections: SystemInterconnection[];
  underlyingMechanisms: string[];    // Physiological mechanisms involved
  treatmentSequence: TreatmentPhase[];
  confidenceLevel: number;           // Overall analysis confidence
}

export interface SystemInterconnection {
  fromSystem: string;
  toSystem: string;
  mechanism: string;
  strength: number; // 1.0-3.0 connection strength
  clinicalEvidence: string;
}

export interface TreatmentPhase {
  phase: number;
  duration: string;
  systems: string[];
  rationale: string;
  expectedOutcomes: string[];
}

export interface TreatmentRecommendation {
  category: 'supplements' | 'dietary' | 'lifestyle' | 'testing' | 'referral';
  priority: number;
  intervention: string;
  rationale: string;
  expectedTimeline: string;
  monitoringMarkers: string[];
}

export interface TestingRecommendation {
  testType: string;
  priority: number;
  rationale: string;
  expectedFindings: string;
  cost: 'low' | 'medium' | 'high';
}

export interface AssessmentResults {
  overallHealthScore: number;
  systemScores: SystemScore[];
  interventionPriorities: string[];  // Systems ordered by priority
  rootCauseAnalysis: RootCauseAnalysis;
  treatmentRecommendations: TreatmentRecommendation[];
  followUpTesting: TestingRecommendation[];
  assessmentQuality: AssessmentQuality;
}

export interface AssessmentQuality {
  completionRate: number;
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
  missingCriticalData: string[];
  recommendedImprovements: string[];
}

export class ComprehensiveAssessmentScorer {
  private questions: ComprehensiveQuestion[];
  private responses: Map<number, number>;
  private scoringConfig: typeof SCORING_CONFIG;

  constructor(responses: Array<{questionId: number, score: number}>) {
    this.questions = COMPREHENSIVE_QUESTIONS.filter(q => q.isActive);
    this.responses = new Map(responses.map(r => [r.questionId, r.score]));
    this.scoringConfig = SCORING_CONFIG;
  }

  public calculateComprehensiveResults(): AssessmentResults {
    console.log('🧠 Starting comprehensive assessment analysis...');
    
    const systemScores = this.calculateSystemScores();
    const interventionPriorities = this.determineInterventionPriorities(systemScores);
    const rootCauseAnalysis = this.performRootCauseAnalysis(systemScores);
    const overallHealthScore = this.calculateOverallHealth(systemScores);
    const assessmentQuality = this.assessAssessmentQuality();
    
    console.log('✅ Comprehensive assessment analysis complete');
    
    return {
      overallHealthScore,
      systemScores,
      interventionPriorities,
      rootCauseAnalysis,
      treatmentRecommendations: this.generateTreatmentRecommendations(systemScores),
      followUpTesting: this.recommendFollowUpTesting(systemScores),
      assessmentQuality,
    };
  }

  private calculateSystemScores(): SystemScore[] {
    const systemScores: SystemScore[] = [];
    
    Object.entries(SYSTEM_CATEGORIES).forEach(([systemKey, systemConfig]) => {
      const systemQuestions = this.questions.filter(q => 
        q.systemCategory === systemKey
      );
      
      if (systemQuestions.length === 0) return;
      
      // Calculate sub-category scores first
      const subCategoryScores = this.calculateSubCategoryScores(systemKey);
      
      // Calculate overall system score
      let totalWeightedScore = 0;
      let totalWeight = 0;
      const contributingSymptoms: string[] = [];
      
      systemQuestions.forEach(question => {
        const response = this.responses.get(question.id);
        if (response !== undefined) {
          let adjustedScore = question.reverseScore ? (6 - response) : response;
          let weightedScore = adjustedScore * question.diagnosticWeight;
          
          totalWeightedScore += weightedScore;
          totalWeight += question.diagnosticWeight;
          
          // Track significant symptoms (scores 3+ after adjustment)
          if (adjustedScore >= 3) {
            contributingSymptoms.push(question.questionText);
          }
        }
      });
      
      const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const systemWeight = this.scoringConfig.systemWeights[systemKey] || 1.0;
      const adjustedScore = rawScore * systemWeight;
      
      const severityLevel = this.determineSeverityLevel(adjustedScore);
      const interventionPriority = this.scoringConfig.interventionPriorities[severityLevel];
      
      // Calculate confidence based on question completion rate
      const completedQuestions = systemQuestions.filter(q => this.responses.has(q.id)).length;
      const confidenceScore = Math.round((completedQuestions / systemQuestions.length) * 100);
      
      // Generate clinical insights based on patterns
      const clinicalInsights = this.generateClinicalInsights(systemKey, subCategoryScores, adjustedScore);
      
      systemScores.push({
        systemCategory: systemKey,
        systemName: systemConfig.name,
        rawScore,
        adjustedScore,
        severityLevel,
        interventionPriority,
        keySymptoms: contributingSymptoms.slice(0, 5), // Top 5 symptoms
        confidenceScore,
        subCategoryScores,
        clinicalInsights,
      });
    });
    
    return systemScores.sort((a, b) => a.interventionPriority - b.interventionPriority);
  }

  private calculateSubCategoryScores(systemCategory: string): SubCategoryScore[] {
    const systemConfig = SYSTEM_CATEGORIES[systemCategory];
    if (!systemConfig?.subCategories) return [];

    const subCategoryScores: SubCategoryScore[] = [];

    Object.entries(systemConfig.subCategories).forEach(([subCatKey, subCatName]) => {
      const subCategoryQuestions = this.questions.filter(q => 
        q.systemCategory === systemCategory && q.subCategory === subCatKey
      );

      if (subCategoryQuestions.length === 0) return;

      let totalScore = 0;
      let completedQuestions = 0;
      const keyFindings: string[] = [];

      subCategoryQuestions.forEach(question => {
        const response = this.responses.get(question.id);
        if (response !== undefined) {
          let adjustedScore = question.reverseScore ? (6 - response) : response;
          totalScore += adjustedScore * question.diagnosticWeight;
          completedQuestions++;

          // Track significant findings
          if (adjustedScore >= 3 && question.rootCauseIndicator) {
            keyFindings.push(question.questionText);
          }
        }
      });

      const averageScore = completedQuestions > 0 ? totalScore / completedQuestions : 0;
      const completionRate = Math.round((completedQuestions / subCategoryQuestions.length) * 100);
      const severity = this.determineSeverityLevel(averageScore);

      subCategoryScores.push({
        subCategory: subCatKey,
        name: subCatName,
        score: averageScore,
        severity,
        questionCount: subCategoryQuestions.length,
        completionRate,
        keyFindings: keyFindings.slice(0, 3), // Top 3 findings
      });
    });

    return subCategoryScores;
  }

  private determineSeverityLevel(score: number): 'minimal' | 'mild' | 'moderate' | 'severe' | 'critical' {
    const thresholds = this.scoringConfig.severityThresholds;
    
    if (score >= thresholds.critical[0]) return 'critical';
    if (score >= thresholds.severe[0]) return 'severe';
    if (score >= thresholds.moderate[0]) return 'moderate';
    if (score >= thresholds.mild[0]) return 'mild';
    return 'minimal';
  }

  private determineInterventionPriorities(systemScores: SystemScore[]): string[] {
    // Functional medicine root cause-based prioritization
    const priorities: string[] = [];
    
    // 1. Critical systems always get priority
    const criticalSystems = systemScores.filter(s => s.severityLevel === 'critical');
    
    // 2. Digestive dysfunction takes highest priority due to systemic impact
    const digestiveCritical = criticalSystems.find(s => s.systemCategory === 'digestive');
    if (digestiveCritical) {
      priorities.push('digestive');
    }
    
    // 3. Energy/HPA axis dysfunction - affects compliance and healing capacity
    const energyCritical = criticalSystems.find(s => s.systemCategory === 'energy');
    if (energyCritical && !priorities.includes('energy')) {
      priorities.push('energy');
    }
    
    // 4. Hormonal dysfunction - regulates multiple systems
    const hormonalCritical = criticalSystems.find(s => s.systemCategory === 'hormonal');
    if (hormonalCritical && !priorities.includes('hormonal')) {
      priorities.push('hormonal');
    }
    
    // 5. Add remaining critical systems
    criticalSystems.forEach(system => {
      if (!priorities.includes(system.systemCategory)) {
        priorities.push(system.systemCategory);
      }
    });
    
    // 6. Add severe systems in functional medicine priority order
    const severeDigestive = systemScores.find(s => 
      s.systemCategory === 'digestive' && s.severityLevel === 'severe'
    );
    if (severeDigestive && !priorities.includes('digestive')) {
      priorities.push('digestive');
    }
    
    const severeEnergy = systemScores.find(s => 
      s.systemCategory === 'energy' && s.severityLevel === 'severe'
    );
    if (severeEnergy && !priorities.includes('energy')) {
      priorities.push('energy');
    }
    
    // Add remaining severe systems
    const severeSystems = systemScores.filter(s => s.severityLevel === 'severe');
    severeSystems.forEach(system => {
      if (!priorities.includes(system.systemCategory)) {
        priorities.push(system.systemCategory);
      }
    });
    
    return priorities.slice(0, 4); // Limit to top 4 priorities for focus
  }

  private performRootCauseAnalysis(systemScores: SystemScore[]): RootCauseAnalysis {
    console.log('🔍 Performing root cause analysis...');
    
    // Identify primary drivers (systems with highest dysfunction scores)
    const primaryDrivers = this.identifyPrimaryDrivers(systemScores);
    
    // Analyze system interconnections using functional medicine principles
    const interconnections = this.analyzeSystemInterconnections(systemScores);
    
    // Identify underlying physiological mechanisms
    const mechanisms = this.identifyUnderlyingMechanisms(systemScores);
    
    // Create treatment sequence based on root causes
    const treatmentSequence = this.recommendTreatmentSequence(systemScores);
    
    // Calculate overall confidence in analysis
    const confidenceLevel = this.calculateAnalysisConfidence(systemScores);
    
    return {
      primaryDrivers,
      systemInterconnections: interconnections,
      underlyingMechanisms: mechanisms,
      treatmentSequence,
      confidenceLevel,
    };
  }

  private identifyPrimaryDrivers(systemScores: SystemScore[]): string[] {
    // Primary drivers are systems with critical/severe dysfunction that affect other systems
    const drivers: string[] = [];
    
    // Digestive dysfunction is almost always a primary driver when present
    const digestiveScore = systemScores.find(s => s.systemCategory === 'digestive');
    if (digestiveScore && (digestiveScore.severityLevel === 'critical' || digestiveScore.severityLevel === 'severe')) {
      drivers.push('Digestive dysfunction (gut-systemic axis)');
    }
    
    // HPA axis dysfunction when energy is severely affected
    const energyScore = systemScores.find(s => s.systemCategory === 'energy');
    if (energyScore && (energyScore.severityLevel === 'critical' || energyScore.severityLevel === 'severe')) {
      drivers.push('HPA axis dysfunction (stress response)');
    }
    
    // Toxic load when detox systems are overwhelmed
    const toxicScore = systemScores.find(s => s.systemCategory === 'toxic_load');
    if (toxicScore && toxicScore.severityLevel === 'critical') {
      drivers.push('Toxic overload (detoxification overwhelm)');
    }
    
    // Hormonal when thyroid or insulin severely affected
    const hormonalScore = systemScores.find(s => s.systemCategory === 'hormonal');
    if (hormonalScore && hormonalScore.severityLevel === 'critical') {
      drivers.push('Hormonal dysregulation (metabolic control)');
    }
    
    return drivers.slice(0, 2); // Limit to 2 primary drivers for focus
  }

  private analyzeSystemInterconnections(systemScores: SystemScore[]): SystemInterconnection[] {
    const interconnections: SystemInterconnection[] = [];
    
    // Gut-Brain Axis
    const digestiveScore = systemScores.find(s => s.systemCategory === 'digestive');
    const neuroScore = systemScores.find(s => s.systemCategory === 'neurological');
    if (digestiveScore && neuroScore && 
        (digestiveScore.severityLevel !== 'minimal' || neuroScore.severityLevel !== 'minimal')) {
      interconnections.push({
        fromSystem: 'digestive',
        toSystem: 'neurological',
        mechanism: 'Gut-brain axis via microbiome and vagal nerve signaling',
        strength: Math.min(digestiveScore.adjustedScore, neuroScore.adjustedScore),
        clinicalEvidence: 'Gut dysbiosis affects neurotransmitter production and mood regulation',
      });
    }
    
    // Gut-Immune Axis
    const inflammatoryScore = systemScores.find(s => s.systemCategory === 'inflammatory');
    if (digestiveScore && inflammatoryScore && 
        (digestiveScore.severityLevel !== 'minimal' || inflammatoryScore.severityLevel !== 'minimal')) {
      interconnections.push({
        fromSystem: 'digestive',
        toSystem: 'inflammatory',
        mechanism: 'Intestinal permeability allowing systemic immune activation',
        strength: Math.min(digestiveScore.adjustedScore, inflammatoryScore.adjustedScore),
        clinicalEvidence: 'Leaky gut triggers systemic inflammation and autoimmune responses',
      });
    }
    
    // HPA-Thyroid Axis
    const energyScore = systemScores.find(s => s.systemCategory === 'energy');
    const hormonalScore = systemScores.find(s => s.systemCategory === 'hormonal');
    if (energyScore && hormonalScore && 
        (energyScore.severityLevel !== 'minimal' || hormonalScore.severityLevel !== 'minimal')) {
      interconnections.push({
        fromSystem: 'energy',
        toSystem: 'hormonal',
        mechanism: 'HPA axis dysfunction affecting thyroid hormone conversion',
        strength: Math.min(energyScore.adjustedScore, hormonalScore.adjustedScore),
        clinicalEvidence: 'Chronic stress impairs T4 to T3 conversion and increases reverse T3',
      });
    }
    
    // Toxin-Liver-Hormone Axis
    const toxicScore = systemScores.find(s => s.systemCategory === 'toxic_load');
    if (toxicScore && hormonalScore && 
        (toxicScore.severityLevel !== 'minimal' || hormonalScore.severityLevel !== 'minimal')) {
      interconnections.push({
        fromSystem: 'toxic_load',
        toSystem: 'hormonal',
        mechanism: 'Toxic burden overwhelming liver detox and hormone metabolism',
        strength: Math.min(toxicScore.adjustedScore, hormonalScore.adjustedScore),
        clinicalEvidence: 'Impaired liver detox leads to hormone metabolism dysfunction and estrogen dominance',
      });
    }
    
    return interconnections.sort((a, b) => b.strength - a.strength);
  }

  private identifyUnderlyingMechanisms(systemScores: SystemScore[]): string[] {
    const mechanisms: string[] = [];
    
    // Identify key physiological mechanisms based on system dysfunction patterns
    const criticalSevere = systemScores.filter(s => 
      s.severityLevel === 'critical' || s.severityLevel === 'severe'
    );
    
    criticalSevere.forEach(system => {
      switch (system.systemCategory) {
        case 'digestive':
          mechanisms.push('Intestinal barrier dysfunction and microbiome dysregulation');
          mechanisms.push('Impaired nutrient absorption and inflammatory immune activation');
          break;
        case 'energy':
          mechanisms.push('HPA axis dysregulation and cortisol rhythm disruption');
          mechanisms.push('Mitochondrial dysfunction and cellular energy production impairment');
          break;
        case 'hormonal':
          mechanisms.push('Hormone synthesis and conversion pathway dysfunction');
          mechanisms.push('Receptor sensitivity and hormone binding protein dysregulation');
          break;
        case 'toxic_load':
          mechanisms.push('Phase I/II detoxification pathway overwhelm');
          mechanisms.push('Methylation cycle dysfunction and glutathione depletion');
          break;
        case 'inflammatory':
          mechanisms.push('Chronic immune system activation and cytokine elevation');
          mechanisms.push('NF-κB pathway activation and oxidative stress');
          break;
      }
    });
    
    // Remove duplicates and limit to most relevant
    return [...new Set(mechanisms)].slice(0, 4);
  }

  private recommendTreatmentSequence(systemScores: SystemScore[]): TreatmentPhase[] {
    const phases: TreatmentPhase[] = [];
    
    // Phase 1: Foundation (0-6 weeks) - Address most critical dysfunction
    const phase1Systems = systemScores
      .filter(s => s.severityLevel === 'critical' || 
                  (s.severityLevel === 'severe' && ['digestive', 'energy'].includes(s.systemCategory)))
      .slice(0, 2); // Maximum 2 systems for compliance
    
    if (phase1Systems.length > 0) {
      phases.push({
        phase: 1,
        duration: '4-6 weeks',
        systems: phase1Systems.map(s => s.systemName),
        rationale: 'Address foundational dysfunction affecting multiple systems',
        expectedOutcomes: [
          'Improved energy and sleep quality',
          'Reduced digestive symptoms',
          'Better stress tolerance',
          'Decreased systemic inflammation',
        ],
      });
    }
    
    // Phase 2: Building (6-16 weeks) - Support additional systems
    const phase2Systems = systemScores
      .filter(s => s.severityLevel === 'severe' && 
                  !phase1Systems.some(p1 => p1.systemCategory === s.systemCategory))
      .slice(0, 2);
    
    if (phase2Systems.length > 0) {
      phases.push({
        phase: 2,
        duration: '8-12 weeks',
        systems: phase2Systems.map(s => s.systemName),
        rationale: 'Build on Phase 1 foundation with targeted system support',
        expectedOutcomes: [
          'Continued symptom improvement',
          'Enhanced system function',
          'Better treatment tolerance',
          'Stable progress maintenance',
        ],
      });
    }
    
    // Phase 3: Optimization (3-6 months) - Address remaining moderate dysfunction
    const phase3Systems = systemScores
      .filter(s => s.severityLevel === 'moderate' && 
                  !phase1Systems.some(p1 => p1.systemCategory === s.systemCategory) &&
                  !phase2Systems.some(p2 => p2.systemCategory === s.systemCategory))
      .slice(0, 3);
    
    if (phase3Systems.length > 0) {
      phases.push({
        phase: 3,
        duration: '3-6 months',
        systems: phase3Systems.map(s => s.systemName),
        rationale: 'Optimize remaining systems for long-term health and prevention',
        expectedOutcomes: [
          'Complete symptom resolution',
          'Optimal system function',
          'Preventive health maintenance',
          'Sustained wellness',
        ],
      });
    }
    
    return phases;
  }

  private generateTreatmentRecommendations(systemScores: SystemScore[]): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];
    
    // Generate system-specific recommendations based on dysfunction patterns
    systemScores.forEach(system => {
      if (system.severityLevel === 'minimal') return;
      
      switch (system.systemCategory) {
        case 'digestive':
          if (system.severityLevel === 'critical' || system.severityLevel === 'severe') {
            recommendations.push({
              category: 'supplements',
              priority: 1,
              intervention: 'Comprehensive digestive support protocol (enzymes, probiotics, gut healing)',
              rationale: 'Gut dysfunction affects nutrient absorption and systemic inflammation',
              expectedTimeline: '4-8 weeks for initial improvement',
              monitoringMarkers: ['Digestive symptom severity', 'Energy levels', 'Food tolerance'],
            });
            
            recommendations.push({
              category: 'testing',
              priority: 2,
              intervention: 'SIBO breath test and comprehensive stool analysis',
              rationale: 'Identify specific bacterial overgrowth and dysbiosis patterns',
              expectedTimeline: 'Results within 2-3 weeks',
              monitoringMarkers: ['SIBO test results', 'Microbiome analysis', 'Inflammatory markers'],
            });
          }
          break;
          
        case 'energy':
          if (system.severityLevel === 'critical' || system.severityLevel === 'severe') {
            recommendations.push({
              category: 'supplements',
              priority: 1,
              intervention: 'Adrenal support protocol (adaptogenic herbs, B-vitamins, magnesium)',
              rationale: 'HPA axis dysfunction requires targeted nutritional support',
              expectedTimeline: '2-6 weeks for energy improvement',
              monitoringMarkers: ['Morning energy', 'Afternoon energy', 'Stress tolerance'],
            });
            
            recommendations.push({
              category: 'lifestyle',
              priority: 2,
              intervention: 'Stress management and sleep optimization protocol',
              rationale: 'Lifestyle factors directly impact HPA axis recovery',
              expectedTimeline: '4-8 weeks for rhythm normalization',
              monitoringMarkers: ['Sleep quality', 'Stress response', 'Energy consistency'],
            });
          }
          break;
          
        // Add recommendations for other systems...
      }
    });
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private recommendFollowUpTesting(systemScores: SystemScore[]): TestingRecommendation[] {
    const testingRecs: TestingRecommendation[] = [];
    
    systemScores.forEach(system => {
      if (system.severityLevel === 'minimal') return;
      
      switch (system.systemCategory) {
        case 'digestive':
          testingRecs.push({
            testType: 'SIBO Breath Test (Lactulose/Glucose)',
            priority: 1,
            rationale: 'High digestive dysfunction score suggests bacterial overgrowth',
            expectedFindings: 'Elevated hydrogen/methane indicating SIBO',
            cost: 'medium',
          });
          break;
          
        case 'energy':
          testingRecs.push({
            testType: 'Comprehensive Adrenal Panel (4-point cortisol)',
            priority: 2,
            rationale: 'Energy dysfunction suggests HPA axis dysregulation',
            expectedFindings: 'Flattened cortisol curve, low morning cortisol',
            cost: 'medium',
          });
          break;
          
        case 'hormonal':
          testingRecs.push({
            testType: 'Complete Thyroid Panel (TSH, Free T3/T4, Reverse T3)',
            priority: 2,
            rationale: 'Hormonal dysfunction may involve thyroid conversion issues',
            expectedFindings: 'Elevated TSH, low Free T3, high Reverse T3',
            cost: 'medium',
          });
          break;
          
        case 'toxic_load':
          testingRecs.push({
            testType: 'Toxic Load Assessment (Heavy metals, mold, chemicals)',
            priority: 3,
            rationale: 'Detox dysfunction suggests environmental toxin burden',
            expectedFindings: 'Elevated toxic metals, impaired detox capacity',
            cost: 'high',
          });
          break;
      }
    });
    
    return testingRecs.sort((a, b) => a.priority - b.priority);
  }

  private generateClinicalInsights(systemCategory: string, subCategoryScores: SubCategoryScore[], systemScore: number): string[] {
    const insights: string[] = [];
    
    // Generate system-specific clinical insights based on scoring patterns
    switch (systemCategory) {
      case 'digestive':
        const siboScore = subCategoryScores.find(s => s.subCategory === 'sibo_dysbiosis');
        const permeabilityScore = subCategoryScores.find(s => s.subCategory === 'intestinal_permeability');
        
        if (siboScore && siboScore.score >= 3.0) {
          insights.push('Strong SIBO indicators - consider breath testing and antimicrobial protocol');
        }
        if (permeabilityScore && permeabilityScore.score >= 3.0) {
          insights.push('Intestinal permeability likely - systemic symptoms suggest leaky gut');
        }
        if (systemScore >= 4.0) {
          insights.push('Critical digestive dysfunction - immediate intervention required for systemic health');
        }
        break;
        
      case 'energy':
        const hpaScore = subCategoryScores.find(s => s.subCategory === 'hpa_axis');
        const mitoScore = subCategoryScores.find(s => s.subCategory === 'mitochondrial');
        
        if (hpaScore && hpaScore.score >= 3.5) {
          insights.push('Significant HPA axis dysfunction - adrenal support and stress management critical');
        }
        if (mitoScore && mitoScore.score >= 3.0) {
          insights.push('Mitochondrial dysfunction likely - consider CoQ10, B-vitamins, and cellular support');
        }
        break;
        
      case 'modern_fm':
        const emfScore = subCategoryScores.find(s => s.subCategory === 'emf_sensitivity');
        const seedOilScore = subCategoryScores.find(s => s.subCategory === 'seed_oil_damage');
        
        if (emfScore && emfScore.score >= 3.0) {
          insights.push('EMF sensitivity patterns - consider EMF reduction and mitochondrial support');
        }
        if (seedOilScore && seedOilScore.score >= 3.0) {
          insights.push('Inflammatory food reactions - eliminate seed oils and processed foods');
        }
        break;
    }
    
    return insights;
  }

  private calculateOverallHealth(systemScores: SystemScore[]): number {
    if (systemScores.length === 0) return 0;
    
    // Weight systems by their diagnostic priority and confidence
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    systemScores.forEach(system => {
      const systemPriority = SYSTEM_CATEGORIES[system.systemCategory]?.diagnosticPriority || 3;
      const weight = (4 - systemPriority) * (system.confidenceScore / 100); // Higher priority = higher weight
      
      totalWeightedScore += (6 - system.adjustedScore) * weight; // Invert score (higher = better health)
      totalWeight += weight;
    });
    
    const healthScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    return Math.round(Math.max(0, Math.min(5, healthScore)) * 100) / 100; // 0.00-5.00 scale
  }

  private assessAssessmentQuality(): AssessmentQuality {
    const totalQuestions = this.questions.length;
    const completedQuestions = Array.from(this.responses.keys()).length;
    const completionRate = Math.round((completedQuestions / totalQuestions) * 100);
    
    let confidence: 'high' | 'medium' | 'low' | 'insufficient';
    const thresholds = this.scoringConfig.confidenceThresholds;
    
    if (completionRate >= thresholds.high) confidence = 'high';
    else if (completionRate >= thresholds.medium) confidence = 'medium';
    else if (completionRate >= thresholds.low) confidence = 'low';
    else confidence = 'insufficient';
    
    // Identify missing critical data
    const missingCritical = this.questions
      .filter(q => q.rootCauseIndicator && q.diagnosticWeight >= 2.5 && !this.responses.has(q.id))
      .map(q => `${q.systemCategory}: ${q.questionText.substring(0, 50)}...`);
    
    const recommendedImprovements: string[] = [];
    if (completionRate < 80) {
      recommendedImprovements.push('Complete more questions for higher confidence analysis');
    }
    if (missingCritical.length > 5) {
      recommendedImprovements.push('Focus on high-diagnostic-value questions for better insights');
    }
    
    return {
      completionRate,
      confidence,
      missingCriticalData: missingCritical.slice(0, 5),
      recommendedImprovements,
    };
  }

  private calculateAnalysisConfidence(systemScores: SystemScore[]): number {
    // Calculate confidence based on multiple factors
    let confidenceFactors: number[] = [];
    
    // Factor 1: Overall completion rate
    const totalQuestions = this.questions.length;
    const completedQuestions = Array.from(this.responses.keys()).length;
    const completionFactor = (completedQuestions / totalQuestions) * 100;
    confidenceFactors.push(completionFactor);
    
    // Factor 2: Critical question completion
    const criticalQuestions = this.questions.filter(q => q.rootCauseIndicator && q.diagnosticWeight >= 2.5);
    const criticalCompleted = criticalQuestions.filter(q => this.responses.has(q.id)).length;
    const criticalFactor = criticalQuestions.length > 0 ? (criticalCompleted / criticalQuestions.length) * 100 : 100;
    confidenceFactors.push(criticalFactor * 1.5); // Weight critical questions higher
    
    // Factor 3: System coverage
    const systemsWithData = systemScores.filter(s => s.confidenceScore >= 50).length;
    const systemCoverageFactor = (systemsWithData / Object.keys(SYSTEM_CATEGORIES).length) * 100;
    confidenceFactors.push(systemCoverageFactor);
    
    // Calculate weighted average
    const averageConfidence = confidenceFactors.reduce((sum, factor) => sum + factor, 0) / confidenceFactors.length;
    return Math.round(Math.min(100, averageConfidence));
  }
}

// Utility functions for question management and analysis
export function getQuestionsBySystem(systemCategory: string): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.systemCategory === systemCategory && q.isActive
  );
}

export function getQuestionsBySubCategory(systemCategory: string, subCategory: string): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.systemCategory === systemCategory && 
    q.subCategory === subCategory && 
    q.isActive
  );
}

export function getActiveQuestions(): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => q.isActive);
}

export function getModernFMQuestions(): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => q.modernFMUpdate && q.isActive);
}

export function getHighPriorityQuestions(): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.diagnosticWeight >= 2.5 && q.rootCauseIndicator && q.isActive
  );
}

export function getQuestionsByCluster(cluster: string): ComprehensiveQuestion[] {
  return COMPREHENSIVE_QUESTIONS.filter(q => 
    q.questionCluster === cluster && q.isActive
  );
}

// Assessment statistics for monitoring
export const ASSESSMENT_STATISTICS = {
  totalQuestions: COMPREHENSIVE_QUESTIONS.length,
  targetQuestions: 270,
  percentComplete: Math.round((COMPREHENSIVE_QUESTIONS.length / 270) * 100),
  systemsImplemented: Object.keys(SYSTEM_CATEGORIES).length,
  modernFMQuestions: COMPREHENSIVE_QUESTIONS.filter(q => q.modernFMUpdate).length,
  highPriorityQuestions: COMPREHENSIVE_QUESTIONS.filter(q => q.diagnosticWeight >= 2.5).length,
  rootCauseQuestions: COMPREHENSIVE_QUESTIONS.filter(q => q.rootCauseIndicator).length,
};

// Export for easy access to scoring functionality
export { ComprehensiveAssessmentScorer };
