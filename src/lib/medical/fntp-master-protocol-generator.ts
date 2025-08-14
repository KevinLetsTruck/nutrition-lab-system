/**
 * FNTP Master Clinical Recommendation System
 * Root Cause Focused Protocol Generation with IFM/Kresser Institute Standards
 * Kevin Rutherford, FNTP - Truck Driver Health Optimization
 *
 * CRITICAL RULES:
 * - Maximum 4 supplements per phase (MANDATORY)
 * - Phase duration: Minimum 2 weeks before adding next phase
 * - Total active supplements: Never exceed 8-10 at one time
 * - ALWAYS prioritize LetsTruck.com products first
 */

import { prisma } from "@/lib/db/prisma";
import {
  SupplementSelector,
  ProtocolSupplement,
  SupplementProduct,
  SUPPLEMENT_EDUCATION,
} from "./fntp-supplement-database";

/**
 * ROOT CAUSE PATTERNS - PRIMARY FOCUS
 */
export enum RootCausePattern {
  GUT_DYSFUNCTION = "gut_dysfunction",
  HPA_AXIS_DYSFUNCTION = "hpa_axis_dysfunction",
  METABOLIC_DYSFUNCTION = "metabolic_dysfunction",
  INFLAMMATION_IMMUNE = "inflammation_immune",
  DETOXIFICATION_IMPAIRMENT = "detoxification_impairment",
  CARDIOVASCULAR_RISK = "cardiovascular_risk",
}

export interface RootCauseAnalysis {
  primary: RootCausePattern;
  secondary?: RootCausePattern;
  confidence: number;
  labTriggers: string[];
  symptomTriggers: string[];
  description: string;
}

export interface PhaseProtocol {
  phase: 1 | 2 | 3;
  name: string;
  duration: string;
  goal: string;
  supplements: ProtocolSupplement[]; // MAX 4
  lifestyle: LifestyleRecommendation[];
  monitoring: MonitoringPoint[];
  education: EducationPoint[];
}

export interface LifestyleRecommendation {
  category: "nutrition" | "movement" | "sleep" | "stress" | "environment";
  recommendation: string;
  truckerSpecific: string;
  difficulty: "easy" | "moderate" | "challenging";
  frequency: string;
}

export interface MonitoringPoint {
  type: "symptom" | "lab" | "metric" | "red_flag";
  description: string;
  frequency: string;
  target?: string;
  action?: string;
}

export interface EducationPoint {
  topic: string;
  content: string;
  timelineExpectation?: string;
  troubleshooting?: string[];
}

export interface ClientEducationHandout {
  protocolName: string;
  rootCauseExplanation: string;
  phaseOverview: string;
  supplementInstructions: SupplementInstruction[];
  truckingSchedule: TruckingSchedule;
  successChecklist: string[];
  contactTriggers: string[];
  nextSteps: string[];
}

export interface SupplementInstruction {
  product: SupplementProduct;
  dosage: string;
  timing: string;
  instructions: string;
  education: (typeof SUPPLEMENT_EDUCATION)[keyof typeof SUPPLEMENT_EDUCATION];
}

export interface TruckingSchedule {
  preTrip: string[];
  duringDrive: string[];
  breakTime: string[];
  eveningStop: string[];
  bedtime: string[];
  organization: string[];
}

/**
 * LAB VALUE TRIGGERS FOR IMMEDIATE INTERVENTION
 */
export const CRITICAL_LAB_TRIGGERS = {
  hba1c_critical: { threshold: 6.0, operator: ">", immediate: true },
  bp_critical: { systolic: 130, diastolic: 85, immediate: true },
  triglycerides_critical: { threshold: 150, operator: ">", immediate: true },
  crp_critical: { threshold: 3.0, operator: ">", immediate: true },
  vitamin_d_critical: { threshold: 30, operator: "<", immediate: true },
};

export const FUNCTIONAL_LAB_TRIGGERS = {
  insulin_resistance: {
    glucose: { threshold: 86, operator: ">" },
    tg_hdl_ratio: { threshold: 2, operator: ">" },
    confidence: 0.8,
  },
  thyroid_dysfunction: {
    tsh: { threshold: 2.0, operator: ">" },
    free_t3: { threshold: 3.0, operator: "<" },
    confidence: 0.7,
  },
  inflammation_pattern: {
    crp: { threshold: 1.0, operator: ">" },
    ferritin: { threshold: 150, operator: ">" },
    confidence: 0.75,
  },
  gut_dysfunction: {
    vitamin_d: { threshold: 50, operator: "<" },
    b12: { threshold: 400, operator: "<" },
    confidence: 0.6,
  },
};

/**
 * ENHANCED FNTP PROTOCOL GENERATOR
 */
export class FNTPMasterProtocolGenerator {
  /**
   * Generate complete 3-phase protocol with strict supplement limits
   */
  async generateMasterProtocol(documentId: string): Promise<{
    rootCauseAnalysis: RootCauseAnalysis;
    phases: PhaseProtocol[];
    clientEducation: ClientEducationHandout;
    dotOptimization?: DOTOptimizationPlan;
  }> {
    console.log(
      "🎯 Generating FNTP Master Protocol with root cause analysis..."
    );

    try {
      // Get comprehensive analysis data
      const analysisData = await this.getAnalysisData(documentId);

      // Perform root cause analysis
      const rootCauseAnalysis = await this.analyzeRootCauses(analysisData);

      // Generate 3-phase protocol with supplement limits
      const phases = await this.generatePhaseProtocols(
        rootCauseAnalysis,
        analysisData
      );

      // Create client education materials
      const clientEducation = await this.generateClientEducation(
        rootCauseAnalysis,
        phases,
        analysisData
      );

      // DOT medical optimization if applicable
      let dotOptimization;
      if (analysisData.client?.isTruckDriver) {
        dotOptimization = await this.generateDOTOptimization(
          rootCauseAnalysis,
          phases
        );
      }

      // Save complete protocol
      await this.saveMasterProtocol(documentId, {
        rootCauseAnalysis,
        phases,
        clientEducation,
        dotOptimization,
      });

      console.log("✅ FNTP Master Protocol generated successfully");
      return { rootCauseAnalysis, phases, clientEducation, dotOptimization };
    } catch (error) {
      console.error("❌ Master protocol generation error:", error);
      throw error;
    }
  }

  /**
   * ROOT CAUSE ANALYSIS ENGINE
   */
  private async analyzeRootCauses(
    analysisData: any
  ): Promise<RootCauseAnalysis> {
    const labValues = analysisData.labValues || [];
    const symptoms = analysisData.symptoms || [];

    const rootCauseScores: Record<RootCausePattern, number> = {
      [RootCausePattern.GUT_DYSFUNCTION]: 0,
      [RootCausePattern.HPA_AXIS_DYSFUNCTION]: 0,
      [RootCausePattern.METABOLIC_DYSFUNCTION]: 0,
      [RootCausePattern.INFLAMMATION_IMMUNE]: 0,
      [RootCausePattern.DETOXIFICATION_IMPAIRMENT]: 0,
      [RootCausePattern.CARDIOVASCULAR_RISK]: 0,
    };

    const triggeringSigns: Record<RootCausePattern, string[]> = {
      [RootCausePattern.GUT_DYSFUNCTION]: [],
      [RootCausePattern.HPA_AXIS_DYSFUNCTION]: [],
      [RootCausePattern.METABOLIC_DYSFUNCTION]: [],
      [RootCausePattern.INFLAMMATION_IMMUNE]: [],
      [RootCausePattern.DETOXIFICATION_IMPAIRMENT]: [],
      [RootCausePattern.CARDIOVASCULAR_RISK]: [],
    };

    // Analyze lab patterns for gut dysfunction
    const vitaminD = this.findLabValue(labValues, "vitamin d");
    const b12 = this.findLabValue(labValues, "b12");
    const ferritin = this.findLabValue(labValues, "ferritin");

    if (vitaminD && vitaminD.value < 50) {
      rootCauseScores[RootCausePattern.GUT_DYSFUNCTION] += 0.3;
      triggeringSigns[RootCausePattern.GUT_DYSFUNCTION].push(
        `Low Vitamin D: ${vitaminD.value} ng/mL`
      );
    }

    if (b12 && b12.value < 400) {
      rootCauseScores[RootCausePattern.GUT_DYSFUNCTION] += 0.2;
      triggeringSigns[RootCausePattern.GUT_DYSFUNCTION].push(
        `Low B12: ${b12.value} pg/mL`
      );
    }

    // Metabolic dysfunction patterns
    const glucose = this.findLabValue(labValues, "glucose");
    const triglycerides = this.findLabValue(labValues, "triglycerides");
    const hdl = this.findLabValue(labValues, "hdl");
    const hba1c = this.findLabValue(labValues, "hba1c");

    if (glucose && glucose.value > 86) {
      rootCauseScores[RootCausePattern.METABOLIC_DYSFUNCTION] += 0.3;
      triggeringSigns[RootCausePattern.METABOLIC_DYSFUNCTION].push(
        `Elevated fasting glucose: ${glucose.value} mg/dL`
      );
    }

    if (triglycerides && hdl) {
      const ratio = triglycerides.value / hdl.value;
      if (ratio > 2) {
        rootCauseScores[RootCausePattern.METABOLIC_DYSFUNCTION] += 0.4;
        triggeringSigns[RootCausePattern.METABOLIC_DYSFUNCTION].push(
          `TG/HDL ratio: ${ratio.toFixed(2)}`
        );
      }
    }

    if (hba1c && hba1c.value > 5.3) {
      rootCauseScores[RootCausePattern.METABOLIC_DYSFUNCTION] += 0.3;
      triggeringSigns[RootCausePattern.METABOLIC_DYSFUNCTION].push(
        `Elevated HbA1c: ${hba1c.value}%`
      );
    }

    // Inflammation patterns
    const crp = this.findLabValue(labValues, "crp");
    const esr = this.findLabValue(labValues, "esr");

    if (crp && crp.value > 1.0) {
      rootCauseScores[RootCausePattern.INFLAMMATION_IMMUNE] += 0.4;
      triggeringSigns[RootCausePattern.INFLAMMATION_IMMUNE].push(
        `Elevated hs-CRP: ${crp.value} mg/L`
      );
    }

    if (ferritin && ferritin.value > 150) {
      rootCauseScores[RootCausePattern.INFLAMMATION_IMMUNE] += 0.2;
      triggeringSigns[RootCausePattern.INFLAMMATION_IMMUNE].push(
        `Elevated ferritin: ${ferritin.value} ng/mL`
      );
    }

    // HPA axis dysfunction
    if (symptoms.includes("fatigue") || symptoms.includes("energy crashes")) {
      rootCauseScores[RootCausePattern.HPA_AXIS_DYSFUNCTION] += 0.3;
      triggeringSigns[RootCausePattern.HPA_AXIS_DYSFUNCTION].push(
        "Energy crashes and fatigue"
      );
    }

    // Cardiovascular risk
    const systolic =
      this.findLabValue(labValues, "systolic") ||
      this.findLabValue(labValues, "blood pressure");
    if (systolic && systolic.value > 125) {
      rootCauseScores[RootCausePattern.CARDIOVASCULAR_RISK] += 0.4;
      triggeringSigns[RootCausePattern.CARDIOVASCULAR_RISK].push(
        `Elevated BP: ${systolic.value} mmHg`
      );
    }

    // Determine primary and secondary root causes
    const sortedCauses = Object.entries(rootCauseScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0.2);

    if (sortedCauses.length === 0) {
      // Default for truckers without obvious patterns
      return {
        primary: RootCausePattern.GUT_DYSFUNCTION,
        confidence: 0.6,
        labTriggers: ["General optimization needed"],
        symptomTriggers: ["Trucker lifestyle factors"],
        description:
          "Foundation gut health and general optimization needed for truck driver health",
      };
    }

    const [primaryCause, primaryScore] = sortedCauses[0];
    const secondary =
      sortedCauses.length > 1
        ? (sortedCauses[1][0] as RootCausePattern)
        : undefined;

    return {
      primary: primaryCause as RootCausePattern,
      secondary,
      confidence: Math.min(primaryScore, 0.95),
      labTriggers: triggeringSigns[primaryCause as RootCausePattern],
      symptomTriggers: symptoms || [],
      description: this.getRootCauseDescription(
        primaryCause as RootCausePattern
      ),
    };
  }

  private getRootCauseDescription(pattern: RootCausePattern): string {
    const descriptions = {
      [RootCausePattern.GUT_DYSFUNCTION]:
        "Digestive dysfunction affecting nutrient absorption, inflammation, and overall health",
      [RootCausePattern.HPA_AXIS_DYSFUNCTION]:
        "Stress response system dysfunction affecting energy, sleep, and resilience",
      [RootCausePattern.METABOLIC_DYSFUNCTION]:
        "Blood sugar and insulin regulation problems affecting weight and energy",
      [RootCausePattern.INFLAMMATION_IMMUNE]:
        "Chronic inflammation affecting multiple body systems",
      [RootCausePattern.DETOXIFICATION_IMPAIRMENT]:
        "Reduced ability to process and eliminate toxins",
      [RootCausePattern.CARDIOVASCULAR_RISK]:
        "Cardiovascular system dysfunction and elevated disease risk",
    };
    return descriptions[pattern];
  }

  /**
   * GENERATE 3-PHASE PROTOCOLS WITH SUPPLEMENT LIMITS
   */
  private async generatePhaseProtocols(
    rootCause: RootCauseAnalysis,
    analysisData: any
  ): Promise<PhaseProtocol[]> {
    const phases: PhaseProtocol[] = [];

    // PHASE 1: FOUNDATION (Weeks 1-2) - MAX 4 SUPPLEMENTS
    phases.push(await this.generatePhase1(rootCause, analysisData));

    // PHASE 2: TARGETED SUPPORT (Weeks 3-6) - MAX 4 ADDITIONAL
    phases.push(await this.generatePhase2(rootCause, analysisData));

    // PHASE 3: OPTIMIZATION (Weeks 7-12) - REDUCE TO 6-8 TOTAL
    phases.push(await this.generatePhase3(rootCause, analysisData));

    return phases;
  }

  private async generatePhase1(
    rootCause: RootCauseAnalysis,
    analysisData: any
  ): Promise<PhaseProtocol> {
    const supplements: ProtocolSupplement[] = [];

    // ALWAYS START WITH FOUNDATION SUPPLEMENTS FROM LETSTRUCK

    // 1. Algae Omega-3 (ALWAYS included)
    const omega3 = SupplementSelector.getOmega3Product();
    supplements.push({
      productId: omega3.id,
      product: omega3,
      dosage: "2 softgels 2x daily",
      timing: "with breakfast and dinner",
      duration: "Ongoing",
      purpose: "Reduce inflammation, support brain and cardiovascular function",
      priority: 1,
      truckerInstructions:
        "Keep in cooler if possible, room temp stable. Take with fat-containing meals.",
      educationPoints: [
        "Foundation anti-inflammatory support",
        "Critical for truckers due to limited omega-3 intake",
        "Expect gradual reduction in stiffness and brain fog",
      ],
    });

    // 2. Vitamin D (ALWAYS included if <50 ng/mL)
    const vitaminD = this.findLabValue(analysisData.labValues, "vitamin d");
    if (!vitaminD || vitaminD.value < 50) {
      const bioD = SupplementSelector.getVitaminDProduct();
      const dosage =
        vitaminD && vitaminD.value < 30
          ? "6 drops (6000 IU)"
          : "4 drops (4000 IU)";

      supplements.push({
        productId: bioD.id,
        product: bioD,
        dosage,
        timing: "with breakfast",
        duration: "3 months, then retest",
        purpose: "Immune support, mood, bone health, hormone balance",
        priority: 1,
        truckerInstructions:
          "Liquid drops for superior absorption. Take with fat.",
        educationPoints: [
          "Critical for truckers with limited sun exposure",
          "Supports immune system and mood",
          "Target level: 50-80 ng/mL",
        ],
      });
    }

    // 3 & 4: ROOT CAUSE SPECIFIC SUPPLEMENTS
    const rootCauseSupplements = await this.getPhase1RootCauseSupplements(
      rootCause,
      analysisData
    );
    if (rootCauseSupplements && Array.isArray(rootCauseSupplements)) {
      supplements.push(...rootCauseSupplements.slice(0, 2)); // Ensure max 4 total
    }

    return {
      phase: 1,
      name: "Foundation Phase",
      duration: "Weeks 1-2",
      goal: "Remove obstacles to healing, support basic functions",
      supplements,
      lifestyle: await this.getPhase1Lifestyle(rootCause),
      monitoring: await this.getPhase1Monitoring(rootCause),
      education: await this.getPhase1Education(rootCause),
    };
  }

  private async getPhase1RootCauseSupplements(
    rootCause: RootCauseAnalysis,
    analysisData: any
  ): Promise<ProtocolSupplement[]> {
    const supplements: ProtocolSupplement[] = [];

    switch (rootCause.primary) {
      case RootCausePattern.GUT_DYSFUNCTION:
        // Check for low stomach acid vs SIBO pattern
        const hasLowAcid = this.hasLowStomachAcidPattern(analysisData);
        const hasSIBO = this.hasSIBOPattern(analysisData);

        if (hasSIBO) {
          // SIBO Protocol
          const atrantil = SupplementSelector.getSIBOProduct(false);
          supplements.push({
            productId: atrantil.id,
            product: atrantil,
            dosage: "2 capsules 3x daily with meals",
            timing: "with meals",
            duration: "2 weeks loading, then 2 caps daily maintenance",
            purpose: "Address SIBO, reduce bloating and gas",
            priority: 2,
            truckerInstructions:
              "Take with meals. After 2 weeks, reduce to maintenance dose.",
            educationPoints: [
              "Targets methane-producing bacteria",
              "Should see bloating reduction in 1-2 weeks",
              "Common in truckers due to irregular eating",
            ],
          });

          const electrolytes1 = SupplementSelector.getElectrolyteProduct();
          supplements.push({
            productId: electrolytes1.id,
            product: electrolytes1,
            dosage: "1 scoop 2x daily",
            timing: "morning and afternoon in water",
            duration: "Ongoing",
            purpose: "Replace electrolytes lost during SIBO treatment",
            priority: 2,
            truckerInstructions:
              "Critical during SIBO treatment to prevent dehydration.",
            educationPoints: [
              "Prevents muscle cramps during gut healing",
              "Supports proper hydration",
              "Essential for truckers",
            ],
          });
        } else {
          // Low stomach acid protocol
          const hydroZyme = SupplementSelector.findProduct("hydro-zyme");
          if (hydroZyme) {
            supplements.push({
              productId: hydroZyme.id,
              product: hydroZyme,
              dosage:
                "Start 1 tablet, increase by 1 every 2 days until warmth felt",
              timing: "with protein meals",
              duration: "Ongoing",
              purpose: "Improve protein digestion and nutrient absorption",
              priority: 2,
              truckerInstructions:
                "Start low, increase gradually. Back off 1 tablet from warmth dose.",
              educationPoints: [
                "Improves digestion of protein",
                "Reduces bloating after meals",
                "Critical for nutrient absorption",
              ],
            });
          }

          const intenzyme = SupplementSelector.findProduct("intenzyme");
          if (intenzyme) {
            supplements.push({
              productId: intenzyme.id,
              product: intenzyme,
              dosage: "2 tablets between meals",
              timing: "empty stomach for inflammation",
              duration: "3 months",
              purpose: "Reduce inflammation, support tissue repair",
              priority: 3,
              truckerInstructions:
                "For inflammation: empty stomach. For digestion: with meals.",
              educationPoints: [
                "Dual purpose enzyme",
                "Reduces systemic inflammation",
                "Supports recovery and healing",
              ],
            });
          }
        }
        break;

      case RootCausePattern.METABOLIC_DYSFUNCTION:
        const glucobalance = SupplementSelector.findProduct("glucobalance");
        if (glucobalance) {
          supplements.push({
            productId: glucobalance.id,
            product: glucobalance,
            dosage: "2 capsules with largest meal",
            timing: "with largest meal",
            duration: "6 months",
            purpose: "Blood sugar stabilization and insulin sensitivity",
            priority: 2,
            truckerInstructions: "Take with meal containing carbohydrates.",
            educationPoints: [
              "Helps process road food carbs",
              "Stabilizes energy levels",
              "Supports weight management",
            ],
          });
        }

        const electrolytes2 = SupplementSelector.getElectrolyteProduct();
        supplements.push({
          productId: electrolytes2.id,
          product: electrolytes2,
          dosage: "1 scoop 2x daily",
          timing: "morning and afternoon",
          duration: "Ongoing",
          purpose: "Support insulin sensitivity and blood pressure",
          priority: 2,
          truckerInstructions:
            "Critical for metabolic health. Drink throughout day.",
          educationPoints: [
            "Magnesium supports insulin function",
            "Potassium helps blood pressure",
            "Essential for truckers",
          ],
        });
        break;

      case RootCausePattern.CARDIOVASCULAR_RISK:
        const cardioMiracle = SupplementSelector.getCardioProduct();
        supplements.push({
          productId: cardioMiracle.id,
          product: cardioMiracle,
          dosage: "1 scoop 2x daily",
          timing: "morning and evening",
          duration: "Ongoing",
          purpose:
            "Comprehensive cardiovascular support and blood pressure regulation",
          priority: 1,
          truckerInstructions:
            "Take on empty stomach for best absorption. Critical for DOT medical.",
          educationPoints: [
            "Supports nitric oxide production",
            "Helps regulate blood pressure",
            "Critical for DOT medical compliance",
          ],
        });

        const coq10 = SupplementSelector.findProduct("coq");
        if (coq10) {
          supplements.push({
            productId: coq10.id,
            product: coq10,
            dosage: "1 capsule daily",
            timing: "with breakfast",
            duration: "Ongoing",
            purpose: "Heart muscle support and cellular energy",
            priority: 2,
            truckerInstructions:
              "Take with fat-containing meal for absorption.",
            educationPoints: [
              "Supports heart muscle function",
              "Essential if on statin medications",
              "Improves cellular energy",
            ],
          });
        }
        break;

      case RootCausePattern.HPA_AXIS_DYSFUNCTION:
        const electrolytes3 = SupplementSelector.getElectrolyteProduct();
        supplements.push({
          productId: electrolytes3.id,
          product: electrolytes3,
          dosage: "1 scoop morning, 1 scoop afternoon",
          timing: "morning and afternoon (before 3 PM)",
          duration: "Ongoing",
          purpose: "Adrenal support and electrolyte balance",
          priority: 2,
          truckerInstructions:
            "Critical for stress resilience. Avoid evening dose.",
          educationPoints: [
            "Supports adrenal function",
            "Helps with stress resilience",
            "Improves energy stability",
          ],
        });

        const adhs = SupplementSelector.findProduct("adhs");
        if (adhs) {
          supplements.push({
            productId: adhs.id,
            product: adhs,
            dosage: "2 tablets with breakfast, 1 with lunch",
            timing: "morning and noon only",
            duration: "3 months",
            purpose: "Direct adrenal gland support",
            priority: 2,
            truckerInstructions:
              "Morning only - can be stimulating. No afternoon doses.",
            educationPoints: [
              "Supports healthy stress response",
              "Helps with energy and stamina",
              "Critical for irregular schedules",
            ],
          });
        }
        break;
    }

    return supplements;
  }

  // Helper methods for pattern detection
  private hasLowStomachAcidPattern(analysisData: any): boolean {
    // Pattern: Poor protein digestion, B12 deficiency, iron deficiency
    const b12 = this.findLabValue(analysisData.labValues, "b12");
    const ferritin = this.findLabValue(analysisData.labValues, "ferritin");

    return (b12 && b12.value < 400) || (ferritin && ferritin.value < 50);
  }

  private hasSIBOPattern(analysisData: any): boolean {
    // Pattern: Bloating, alternating bowels, food sensitivities
    const symptoms = analysisData.symptoms || [];
    return (
      symptoms.includes("bloating") || symptoms.includes("digestive issues")
    );
  }

  private findLabValue(labValues: any[], searchTerm: string): any | null {
    if (!labValues) return null;
    return (
      labValues.find(
        (lab) =>
          lab.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lab.standardName?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || null
    );
  }

  // Additional phase generation methods would continue here...
  // [Continue with generatePhase2, generatePhase3, and other methods]

  private async getAnalysisData(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isTruckDriver: true,
            healthGoals: true,
            medications: true,
            conditions: true,
            allergies: true,
          },
        },
        LabValue: true,
        DocumentAnalysis: true,
      },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    return {
      document,
      client: document.client,
      labValues: document.LabValue || [],
      analysis: document.DocumentAnalysis,
      symptoms: document.metadata ? (document.metadata as any).symptoms : [],
    };
  }

  private async saveMasterProtocol(
    documentId: string,
    protocol: any
  ): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          metadata: {
            ...(
              await prisma.document.findUnique({
                where: { id: documentId },
                select: { metadata: true },
              })
            )?.metadata,
            fntpMasterProtocolComplete: true,
            masterProtocolGeneratedAt: new Date().toISOString(),
            rootCause: protocol.rootCauseAnalysis.primary,
            supplementPhases: protocol.phases.length,
          },
        },
      });

      console.log("💾 FNTP Master Protocol saved successfully");
    } catch (error) {
      console.error("❌ Failed to save master protocol:", error);
      throw error;
    }
  }

  /**
   * PHASE 2: TARGETED SUPPORT (Weeks 3-6) - MAX 4 ADDITIONAL SUPPLEMENTS
   */
  private async generatePhase2(
    rootCause: RootCauseAnalysis,
    analysisData: any
  ): Promise<PhaseProtocol> {
    const supplements: ProtocolSupplement[] = [];

    switch (rootCause.primary) {
      case RootCausePattern.GUT_DYSFUNCTION:
        if (this.hasLowStomachAcidPattern(analysisData)) {
          // Add gut healing support
          const ips = SupplementSelector.findProduct("ips") || {
            id: "biotics-ips",
            name: "IPS (Intestinal Permeability Support)",
            brand: "Biotics Research",
            source: "biotics" as const,
            strengthOptions: ["Standard"],
            defaultStrength: "Standard",
            dosageOptions: ["2 capsules 2x daily"],
            defaultDosage: "2 capsules 2x daily",
            timing: ["empty stomach"],
            defaultTiming: "empty stomach",
            truckerInstructions: "Take between meals for gut lining repair.",
            purposes: ["Gut lining repair", "Intestinal permeability support"],
          };

          supplements.push({
            productId: ips.id,
            product: ips,
            dosage: "2 capsules 2x daily",
            timing: "empty stomach",
            duration: "3 months",
            purpose: "Repair intestinal permeability (leaky gut)",
            priority: 1,
            truckerInstructions: "Take between meals, away from food.",
            educationPoints: [
              "Repairs gut lining",
              "Critical for nutrient absorption",
            ],
          });

          const lGlutamine = SupplementSelector.findProduct("glutamine")!;
          supplements.push({
            productId: lGlutamine.id,
            product: lGlutamine,
            dosage: "5g 2x daily",
            timing: "between meals",
            duration: "3 months",
            purpose: "Gut lining healing and immune support",
            priority: 2,
            truckerInstructions: "Mix in water, drink on empty stomach.",
            educationPoints: [
              "Primary fuel for gut cells",
              "Accelerates healing",
            ],
          });
        } else {
          // SIBO follow-up protocol
          const biodoph = SupplementSelector.findProduct("biodoph") || {
            id: "biotics-biodoph-7",
            name: "BioDoph-7 Plus",
            brand: "Biotics Research",
            source: "biotics" as const,
            strengthOptions: ["7 strain probiotic"],
            defaultStrength: "7 strain",
            dosageOptions: ["1 capsule daily", "1 capsule 2x daily"],
            defaultDosage: "1 capsule 2x daily",
            timing: ["with food"],
            defaultTiming: "with food",
            truckerInstructions: "Keep refrigerated when possible.",
            purposes: ["Restore beneficial bacteria", "Support gut health"],
          };

          supplements.push({
            productId: biodoph.id,
            product: biodoph,
            dosage: "1 capsule 2x daily",
            timing: "with food",
            duration: "3 months",
            purpose: "Restore beneficial gut bacteria after SIBO treatment",
            priority: 1,
            truckerInstructions:
              "Keep refrigerated when home, room temp okay for travel.",
            educationPoints: [
              "Rebuilds healthy gut flora",
              "Essential after antimicrobial treatment",
            ],
          });

          const lGlutamine = SupplementSelector.findProduct("glutamine")!;
          supplements.push({
            productId: lGlutamine.id,
            product: lGlutamine,
            dosage: "5g 2x daily",
            timing: "between meals",
            duration: "3 months",
            purpose: "Support gut healing after SIBO treatment",
            priority: 2,
            truckerInstructions: "Critical for gut repair after treatment.",
            educationPoints: [
              "Heals gut damage from SIBO",
              "Prevents recurrence",
            ],
          });
        }
        break;

      case RootCausePattern.METABOLIC_DYSFUNCTION:
        const berberine = SupplementSelector.findProduct("berberine")!;
        supplements.push({
          productId: berberine.id,
          product: berberine,
          dosage: "500mg 2x daily",
          timing: "with meals",
          duration: "6 months",
          purpose: "Natural metformin alternative for blood sugar control",
          priority: 1,
          truckerInstructions:
            "Take with meals to reduce GI upset. Monitor blood sugar if diabetic.",
          educationPoints: [
            "Natural blood sugar control",
            "Weight management support",
          ],
          monitoringNotes: [
            "Monitor blood glucose if diabetic",
            "Watch for GI upset",
          ],
        });

        const mcs2 = SupplementSelector.findProduct("mcs") || {
          id: "biotics-mcs-2",
          name: "MCS-2",
          brand: "Biotics Research",
          source: "biotics" as const,
          strengthOptions: ["Metabolic clearing support"],
          defaultStrength: "Standard",
          dosageOptions: ["2 capsules 2x daily"],
          defaultDosage: "2 capsules 2x daily",
          timing: ["between meals"],
          defaultTiming: "between meals",
          truckerInstructions: "Supports metabolic detoxification.",
          purposes: ["Metabolic support", "Detoxification support"],
        };

        supplements.push({
          productId: mcs2.id,
          product: mcs2,
          dosage: "2 capsules 2x daily",
          timing: "between meals",
          duration: "4 months",
          purpose: "Metabolic clearing and detoxification support",
          priority: 2,
          truckerInstructions: "Supports liver function and metabolism.",
          educationPoints: [
            "Helps process metabolic waste",
            "Supports weight loss",
          ],
        });
        break;

      case RootCausePattern.HPA_AXIS_DYSFUNCTION:
        const cytozymeAD = SupplementSelector.findProduct("cytozyme") || {
          id: "biotics-cytozyme-ad",
          name: "Cytozyme-AD",
          brand: "Biotics Research",
          source: "biotics" as const,
          strengthOptions: ["Adrenal cell extract"],
          defaultStrength: "Standard",
          dosageOptions: ["2 tablets daily"],
          defaultDosage: "2 tablets upon waking",
          timing: ["upon waking"],
          defaultTiming: "upon waking",
          truckerInstructions:
            "Take immediately upon waking for morning energy.",
          purposes: ["Adrenal support", "Morning energy"],
        };

        supplements.push({
          productId: cytozymeAD.id,
          product: cytozymeAD,
          dosage: "2 tablets upon waking",
          timing: "immediately upon waking",
          duration: "3 months",
          purpose: "Direct adrenal gland support for morning energy",
          priority: 1,
          truckerInstructions: "Take before getting out of sleeper cab.",
          educationPoints: [
            "Concentrated adrenal support",
            "Improves morning energy",
          ],
        });

        const phosphatidylserine =
          SupplementSelector.findProduct("phosphatidylserine")!;
        supplements.push({
          productId: phosphatidylserine.id,
          product: phosphatidylserine,
          dosage: "200mg before bed",
          timing: "1-2 hours before sleep",
          duration: "3 months",
          purpose: "Lower evening cortisol for better sleep",
          priority: 2,
          truckerInstructions: "Critical for sleep quality improvement.",
          educationPoints: [
            "Reduces evening cortisol",
            "Improves sleep quality",
          ],
        });
        break;

      case RootCausePattern.CARDIOVASCULAR_RISK:
        // Additional cardiovascular support beyond Phase 1
        const optimalEFAs = SupplementSelector.findProduct("optimal") || {
          id: "biotics-optimal-efas",
          name: "Optimal EFAs",
          brand: "Biotics Research",
          source: "biotics" as const,
          strengthOptions: ["Essential fatty acid complex"],
          defaultStrength: "Standard",
          dosageOptions: ["2 capsules daily"],
          defaultDosage: "2 capsules daily",
          timing: ["with food"],
          defaultTiming: "with breakfast",
          truckerInstructions: "Additional EFA support beyond algae omega-3.",
          purposes: [
            "Comprehensive fatty acid support",
            "Cardiovascular health",
          ],
        };

        supplements.push({
          productId: optimalEFAs.id,
          product: optimalEFAs,
          dosage: "2 capsules daily",
          timing: "with breakfast",
          duration: "Ongoing",
          purpose: "Comprehensive essential fatty acid support",
          priority: 2,
          truckerInstructions:
            "Complements algae omega-3 for complete cardiovascular support.",
          educationPoints: [
            "Comprehensive EFA profile",
            "Enhanced cardiovascular protection",
          ],
        });
        break;
    }

    return {
      phase: 2,
      name: "Targeted Support Phase",
      duration: "Weeks 3-6",
      goal: "Address specific dysfunctions and accelerate healing",
      supplements,
      lifestyle: await this.getPhase2Lifestyle(rootCause),
      monitoring: await this.getPhase2Monitoring(rootCause),
      education: await this.getPhase2Education(rootCause),
    };
  }

  /**
   * PHASE 3: OPTIMIZATION (Weeks 7-12) - REDUCE TO 6-8 MAINTENANCE SUPPLEMENTS
   */
  private async generatePhase3(
    rootCause: RootCauseAnalysis,
    analysisData: any
  ): Promise<PhaseProtocol> {
    const supplements: ProtocolSupplement[] = [];

    // CORE MAINTENANCE - Always include these foundational supplements
    const omega3 = SupplementSelector.getOmega3Product();
    supplements.push({
      productId: omega3.id,
      product: omega3,
      dosage: "2 softgels daily",
      timing: "with dinner",
      duration: "Ongoing maintenance",
      purpose: "Ongoing anti-inflammatory and cardiovascular support",
      priority: 1,
      truckerInstructions: "Reduced maintenance dose for long-term health.",
      educationPoints: [
        "Lifelong foundation supplement",
        "Prevents inflammation return",
      ],
    });

    const electrolytes4 = SupplementSelector.getElectrolyteProduct();
    supplements.push({
      productId: electrolytes4.id,
      product: electrolytes4,
      dosage: "1 scoop daily",
      timing: "morning in water",
      duration: "Ongoing maintenance",
      purpose: "Daily electrolyte and magnesium support",
      priority: 1,
      truckerInstructions: "Essential daily foundation for truckers.",
      educationPoints: [
        "Daily foundation for truckers",
        "Prevents cramping and fatigue",
      ],
    });

    // VITAMIN D if levels still not optimal
    const vitaminD = this.findLabValue(analysisData.labValues, "vitamin d");
    if (!vitaminD || vitaminD.value < 60) {
      const bioD = SupplementSelector.getVitaminDProduct();
      supplements.push({
        productId: bioD.id,
        product: bioD,
        dosage: "2 drops (2000 IU)",
        timing: "with breakfast",
        duration: "Ongoing maintenance",
        purpose: "Maintain optimal vitamin D levels",
        priority: 1,
        truckerInstructions: "Maintenance dose to keep levels optimal.",
        educationPoints: [
          "Maintain 50-80 ng/mL levels",
          "Ongoing immune support",
        ],
      });
    }

    // ROOT CAUSE SPECIFIC MAINTENANCE
    switch (rootCause.primary) {
      case RootCausePattern.CARDIOVASCULAR_RISK:
        const cardioMiracle = SupplementSelector.getCardioProduct();
        supplements.push({
          productId: cardioMiracle.id,
          product: cardioMiracle,
          dosage: "1 scoop daily",
          timing: "morning",
          duration: "Ongoing maintenance",
          purpose: "Ongoing cardiovascular protection",
          priority: 1,
          truckerInstructions: "Essential for DOT medical compliance.",
          educationPoints: [
            "Long-term cardiovascular protection",
            "DOT medical support",
          ],
        });
        break;

      case RootCausePattern.METABOLIC_DYSFUNCTION:
        const glucobalance = SupplementSelector.findProduct("glucobalance")!;
        supplements.push({
          productId: glucobalance.id,
          product: glucobalance,
          dosage: "1 capsule with largest meal",
          timing: "with largest meal",
          duration: "Ongoing maintenance",
          purpose: "Ongoing blood sugar support",
          priority: 2,
          truckerInstructions: "Maintenance support for road food challenges.",
          educationPoints: [
            "Ongoing metabolic support",
            "Handles dietary challenges",
          ],
        });
        break;

      case RootCausePattern.GUT_DYSFUNCTION:
        const biodoph = SupplementSelector.findProduct("biodoph") || {
          id: "biotics-biodoph-7",
          name: "BioDoph-7 Plus",
          brand: "Biotics Research",
          source: "biotics" as const,
          strengthOptions: ["7 strain probiotic"],
          defaultStrength: "7 strain",
          dosageOptions: ["1 capsule daily"],
          defaultDosage: "1 capsule daily",
          timing: ["with food"],
          defaultTiming: "with breakfast",
          truckerInstructions: "Quarterly rotation recommended.",
          purposes: ["Maintain gut health", "Prevent dysbiosis recurrence"],
        };

        supplements.push({
          productId: biodoph.id,
          product: biodoph,
          dosage: "1 capsule daily",
          timing: "with breakfast",
          duration: "3 months on, 1 month off rotation",
          purpose: "Maintain healthy gut flora",
          priority: 2,
          truckerInstructions: "Rotate quarterly to prevent tolerance.",
          educationPoints: [
            "Prevents gut dysfunction return",
            "Quarterly rotation strategy",
          ],
        });
        break;
    }

    return {
      phase: 3,
      name: "Optimization & Maintenance Phase",
      duration: "Weeks 7-12 and ongoing",
      goal: "Maintain optimal function and prevent recurrence",
      supplements,
      lifestyle: await this.getPhase3Lifestyle(rootCause),
      monitoring: await this.getPhase3Monitoring(rootCause),
      education: await this.getPhase3Education(rootCause),
    };
  }

  private async getPhase1Lifestyle(
    rootCause: RootCauseAnalysis
  ): Promise<LifestyleRecommendation[]> {
    const baseRecommendations: LifestyleRecommendation[] = [
      {
        category: "movement",
        recommendation: "Walk for 10 minutes every 2 hours of driving",
        truckerSpecific: "Use rest stops, truck stops, or safe roadside areas",
        difficulty: "easy",
        frequency: "Every 2 hours",
      },
      {
        category: "sleep",
        recommendation: "Maintain consistent sleep schedule",
        truckerSpecific:
          "Same hours even with varying routes - use blackout curtains",
        difficulty: "moderate",
        frequency: "Daily",
      },
      {
        category: "nutrition",
        recommendation: "Eat every 3-4 hours to maintain stable blood sugar",
        truckerSpecific:
          "Pre-pack healthy snacks, use truck stop strategically",
        difficulty: "moderate",
        frequency: "Every 3-4 hours",
      },
    ];

    // Add root cause specific recommendations
    switch (rootCause.primary) {
      case RootCausePattern.GUT_DYSFUNCTION:
        baseRecommendations.push({
          category: "nutrition",
          recommendation: "Chew food thoroughly and eat slowly",
          truckerSpecific: "Take extra time during breaks - improves digestion",
          difficulty: "easy",
          frequency: "Every meal",
        });
        break;
      case RootCausePattern.CARDIOVASCULAR_RISK:
        baseRecommendations.push({
          category: "movement",
          recommendation: "Perform cab exercises during mandatory breaks",
          truckerSpecific: "Seated spinal twists, neck rolls, ankle pumps",
          difficulty: "easy",
          frequency: "During 30-minute breaks",
        });
        break;
    }

    return baseRecommendations;
  }

  private async getPhase1Monitoring(
    rootCause: RootCauseAnalysis
  ): Promise<MonitoringPoint[]> {
    const baseMonitoring: MonitoringPoint[] = [
      {
        type: "symptom",
        description: "Energy levels (1-10 scale)",
        frequency: "Daily",
        target: "7+ consistently",
      },
      {
        type: "symptom",
        description: "Sleep quality (1-10 scale)",
        frequency: "Daily",
        target: "7+ consistently",
      },
      {
        type: "red_flag",
        description: "Severe digestive upset or allergic reactions",
        frequency: "Monitor continuously",
        action: "Stop supplements and contact practitioner",
      },
    ];

    switch (rootCause.primary) {
      case RootCausePattern.GUT_DYSFUNCTION:
        baseMonitoring.push({
          type: "symptom",
          description: "Bloating severity after meals (1-10)",
          frequency: "After each meal",
          target: "Reduction by 50% in 2 weeks",
        });
        break;
      case RootCausePattern.CARDIOVASCULAR_RISK:
        baseMonitoring.push({
          type: "metric",
          description: "Blood pressure readings",
          frequency: "Weekly",
          target: "<130/85 mmHg",
        });
        break;
    }

    return baseMonitoring;
  }

  private async getPhase1Education(
    rootCause: RootCauseAnalysis
  ): Promise<EducationPoint[]> {
    return [
      {
        topic: "Why These Supplements Were Chosen",
        content: `Based on your lab results and ${rootCause.description}, these specific supplements target your root cause issues.`,
        timelineExpectation:
          "Initial improvements in 1-2 weeks, significant changes in 4-6 weeks",
      },
      {
        topic: "Truck Driver Health Challenges",
        content:
          "Professional drivers face unique challenges: irregular schedules, limited food access, sedentary work, and environmental exposures. This protocol addresses these specific issues.",
        troubleshooting: [
          "Keep supplements organized in weekly pill containers",
          "Set phone reminders for timing",
          "Pack extra doses in case of delays",
        ],
      },
    ];
  }

  private async getPhase2Lifestyle(
    rootCause: RootCauseAnalysis
  ): Promise<LifestyleRecommendation[]> {
    return [
      {
        category: "stress",
        recommendation: "Deep breathing exercises during traffic or delays",
        truckerSpecific:
          "Use 4-7-8 breathing technique during loading/unloading waits",
        difficulty: "easy",
        frequency: "3x daily or as needed",
      },
      {
        category: "environment",
        recommendation: "Minimize diesel fume exposure",
        truckerSpecific: "Windows up during fueling, avoid unnecessary idling",
        difficulty: "easy",
        frequency: "Always",
      },
    ];
  }

  private async getPhase2Monitoring(
    rootCause: RootCauseAnalysis
  ): Promise<MonitoringPoint[]> {
    return [
      {
        type: "symptom",
        description: "Supplement tolerance and effectiveness",
        frequency: "Weekly assessment",
        target: "No adverse effects, positive symptom changes",
      },
    ];
  }

  private async getPhase2Education(
    rootCause: RootCauseAnalysis
  ): Promise<EducationPoint[]> {
    return [
      {
        topic: "Phase 2 Expectations",
        content:
          "This phase targets specific dysfunction patterns. You should see more targeted improvements.",
        timelineExpectation:
          "Weeks 3-6: More specific improvements in your primary health concerns",
      },
    ];
  }

  private async getPhase3Lifestyle(
    rootCause: RootCauseAnalysis
  ): Promise<LifestyleRecommendation[]> {
    return [
      {
        category: "nutrition",
        recommendation: "Maintain anti-inflammatory eating patterns",
        truckerSpecific:
          "Continue strategic truck stop choices, meal prep when home",
        difficulty: "moderate",
        frequency: "Ongoing lifestyle",
      },
    ];
  }

  private async getPhase3Monitoring(
    rootCause: RootCauseAnalysis
  ): Promise<MonitoringPoint[]> {
    return [
      {
        type: "lab",
        description: "Follow-up lab work to assess improvements",
        frequency: "8-12 weeks after starting",
        target: "Optimal functional ranges achieved",
      },
    ];
  }

  private async getPhase3Education(
    rootCause: RootCauseAnalysis
  ): Promise<EducationPoint[]> {
    return [
      {
        topic: "Long-term Maintenance",
        content:
          "Phase 3 focuses on maintaining your improvements and preventing regression.",
        timelineExpectation:
          "Ongoing: Maintain optimal health for sustainable trucking career",
      },
    ];
  }

  private async generateClientEducation(
    rootCause: RootCauseAnalysis,
    phases: PhaseProtocol[],
    analysisData: any
  ): Promise<ClientEducationHandout> {
    const clientName =
      `${analysisData.client?.firstName || ""} ${
        analysisData.client?.lastName || ""
      }`.trim() || "Driver";
    const phase1 = phases[0];

    const supplementInstructions: SupplementInstruction[] =
      phase1.supplements.map((supp) => ({
        product: supp.product,
        dosage: supp.dosage,
        timing: supp.timing,
        instructions: supp.truckerInstructions,
        education: SUPPLEMENT_EDUCATION[
          supp.productId as keyof typeof SUPPLEMENT_EDUCATION
        ] || {
          whatItDoes: supp.purpose,
          whyYouNeedIt: `Addresses ${rootCause.primary} identified in your analysis`,
          howToTake: supp.truckerInstructions,
          timeline: { "1-2 weeks": "Initial benefits expected" },
          signsWorking: ["Symptom improvement"],
          adjustments: "Contact practitioner if issues arise",
          safety: "Generally well tolerated",
        },
      }));

    return {
      protocolName: `${clientName} - ${rootCause.primary
        .replace("_", " ")
        .toUpperCase()} Protocol`,
      rootCauseExplanation: `Analysis of your lab values and symptoms indicates ${
        rootCause.description
      }. This is common in truck drivers due to irregular schedules, limited food access, and occupational stress. Your confidence level for this pattern is ${(
        rootCause.confidence * 100
      ).toFixed(0)}%.`,
      phaseOverview: `Your protocol is divided into 3 phases over 12 weeks:
      
      **Phase 1 (Weeks 1-2):** Foundation support with ${phase1.supplements.length} key supplements
      **Phase 2 (Weeks 3-6):** Targeted interventions for your specific dysfunctions  
      **Phase 3 (Weeks 7-12):** Optimization and long-term maintenance
      
      We NEVER exceed 4 supplements per phase to ensure compliance and effectiveness.`,
      supplementInstructions,
      truckingSchedule: {
        preTrip: [
          "Check supplement supply for trip duration",
          "Pack Lyte Balance for daily hydration",
          "Set phone reminders for supplement timing",
        ],
        duringDrive: [
          "Sip Lyte Balance throughout drive",
          "Take noon supplements at lunch stop",
          "Use rest stops for movement and hydration",
        ],
        breakTime: [
          "Take supplements with meals as scheduled",
          "Prepare next meal/snack mindfully",
          "Brief walk if possible",
        ],
        eveningStop: [
          "Take evening supplements with dinner",
          "Prepare next day supplements",
          "Wind-down routine for better sleep",
        ],
        bedtime: [
          "Any bedtime supplements (if prescribed)",
          "Ensure blackout environment in sleeper",
          "Set consistent sleep schedule",
        ],
        organization: [
          "7-day pill organizer (AM/Noon/PM/Bed)",
          "Cooler pack for temperature-sensitive items",
          "Backup doses in case of delays",
          "Reorder reminders at week 3 of each month",
        ],
      },
      successChecklist: [
        "□ Taking all supplements consistently (target: 90%+)",
        `□ ${
          rootCause.primary === RootCausePattern.GUT_DYSFUNCTION
            ? "Digestive symptoms improving"
            : "Primary symptoms improving"
        }`,
        "□ Energy more stable throughout day",
        "□ Sleep quality improving",
        "□ No adverse reactions to supplements",
        "□ Understanding how to take each supplement",
      ],
      contactTriggers: [
        "Severe digestive upset lasting >2 days",
        "Rash or signs of allergic reaction",
        "Symptoms significantly worsening",
        "Questions about supplement interactions",
        "Need to adjust protocol for medical changes",
      ],
      nextSteps: [
        "Week 2: Text/email check-in on tolerance and initial response",
        "Week 4: Phone consultation to assess progress and plan Phase 2",
        "Week 8: Mid-protocol review and optimization",
        "Week 12: Complete reassessment and maintenance planning",
      ],
    };
  }

  private async generateDOTOptimization(
    rootCause: RootCauseAnalysis,
    phases: PhaseProtocol[]
  ): Promise<DOTOptimizationPlan> {
    const timelineWeeks = 8; // Standard 8-week DOT prep

    const bloodPressureProtocol = [
      "Week 1-2: Start Cardio Miracle 2 scoops daily",
      "Week 1-2: Lyte Balance 2 scoops daily for electrolyte balance",
      "Week 3-4: Add omega-3 high dose (3 softgels 2x daily)",
      "Week 5-6: Optimize dosing based on BP readings",
      "Week 7-8: Maintain protocol, monitor daily",
      "Exam week: Continue all supplements, extra hydration",
    ];

    const bloodSugarProtocol =
      rootCause.primary === RootCausePattern.METABOLIC_DYSFUNCTION
        ? [
            "Week 1-2: Start Glucobalance with largest meal",
            "Week 3-4: Add Berberine if glucose >90 mg/dL",
            "Week 5-6: Monitor fasting glucose, adjust diet",
            "Week 7-8: Optimize timing for best control",
            "Exam preparation: Consistent eating schedule",
          ]
        : [
            "Monitor fasting glucose if trending upward",
            "Maintain stable eating schedule",
            "Avoid simple sugars week before exam",
          ];

    return {
      timelineWeeks,
      bloodPressureProtocol,
      bloodSugarProtocol,
      weightManagementTips: [
        "Focus on protein at each meal",
        "Drink water before meals",
        "Walk 10 minutes every 2 hours",
        "Avoid late-night eating",
        "Use smaller plates when possible",
        "Track weekly weigh-ins",
      ],
      examPreparation: [
        "Sleep well 3 nights before exam",
        "Take all supplements consistently",
        "Hydrate well but not excessively morning of exam",
        "Bring current supplement list",
        "Avoid caffeine day of exam if sensitive",
        "Arrive early and relaxed",
      ],
    };
  }
}

interface DOTOptimizationPlan {
  timelineWeeks: number;
  bloodPressureProtocol: string[];
  bloodSugarProtocol: string[];
  weightManagementTips: string[];
  examPreparation: string[];
}

// Export singleton instance
export const fntpMasterProtocolGenerator = new FNTPMasterProtocolGenerator();
