/**
 * FNTP Master Clinical Recommendation System - Decision Trees
 * Automated decision trees for digestive, energy, and cardiovascular complaints
 * Kevin Rutherford, FNTP - Truck Driver Health Optimization
 */

import {
  SupplementSelector,
  ProtocolSupplement,
} from "./fntp-supplement-database";

export interface DecisionNode {
  id: string;
  question: string;
  condition?: (data: any) => boolean;
  yesNode?: string | DecisionAction;
  noNode?: string | DecisionAction;
  children?: DecisionNode[];
}

export interface DecisionAction {
  type: "protocol" | "referral" | "immediate" | "assessment";
  supplements: ProtocolSupplement[];
  instructions: string[];
  monitoringPoints: string[];
  redFlags?: string[];
  followUp?: string;
}

/**
 * DIGESTIVE COMPLAINT RESOLVER TREE
 */
export const DIGESTIVE_DECISION_TREE: DecisionNode = {
  id: "digestive_root",
  question: "Primary digestive complaint pattern?",
  children: [
    {
      id: "bloating_immediate",
      question: "Bloating immediately after eating?",
      condition: (data) => data.symptoms?.includes("bloating_immediate"),
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "biotics-hydro-zyme",
            product: SupplementSelector.findProduct("hydro-zyme")!,
            dosage: "Start 1 tablet, increase by 1 every 2 days until warmth",
            timing: "with protein meals",
            duration: "Ongoing",
            purpose: "Improve protein digestion",
            priority: 1,
            truckerInstructions:
              "Start low, build up. Back off 1 from warmth dose.",
            educationPoints: [
              "Low stomach acid pattern",
              "Improves protein breakdown",
            ],
          },
          {
            productId: "biotics-intenzyme-forte",
            product: SupplementSelector.findProduct("intenzyme")!,
            dosage: "1 tablet with meals",
            timing: "with meals",
            duration: "3 months",
            purpose: "Digestive enzyme support",
            priority: 2,
            truckerInstructions: "Take with larger meals for better digestion.",
            educationPoints: ["Helps break down all macronutrients"],
          },
        ],
        instructions: [
          "Low stomach acid pattern detected",
          "Start Betaine HCl slowly and build up",
          "Add digestive enzymes with meals",
          "Chew food thoroughly",
        ],
        monitoringPoints: [
          "Reduction in post-meal bloating",
          "Improved energy after eating",
          "Better stool formation",
        ],
      },
      noNode: "bloating_delayed",
    },
    {
      id: "bloating_delayed",
      question: "Bloating 2-3 hours after eating?",
      condition: (data) => data.symptoms?.includes("bloating_delayed"),
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "letstruck-atrantil",
            product: SupplementSelector.getSIBOProduct(false),
            dosage: "2 capsules 3x daily with meals",
            timing: "with meals",
            duration: "2 weeks loading, then maintenance",
            purpose: "SIBO treatment - methane reduction",
            priority: 1,
            truckerInstructions: "Loading dose for 2 weeks, then 2 caps daily.",
            educationPoints: [
              "SIBO pattern detected",
              "Targets methane-producing bacteria",
            ],
          },
          {
            productId: "biotics-fc-cidal",
            product: SupplementSelector.findProduct("fc-cidal")!,
            dosage: "1 capsule 2x daily, build to 2 capsules",
            timing: "with meals",
            duration: "6 weeks",
            purpose: "Antimicrobial support for SIBO",
            priority: 2,
            truckerInstructions: "Start slow, build up. Part of SIBO protocol.",
            educationPoints: ["Herbal antimicrobial", "Used with Dysbiocide"],
          },
          {
            productId: "biotics-dysbiocide",
            product: SupplementSelector.findProduct("dysbiocide")!,
            dosage: "1 capsule 2x daily, build to 2 capsules",
            timing: "with meals",
            duration: "6 weeks",
            purpose: "Antimicrobial support for SIBO",
            priority: 2,
            truckerInstructions: "Start slow, build up. Part of SIBO protocol.",
            educationPoints: ["Herbal antimicrobial", "Targets dysbiosis"],
          },
        ],
        instructions: [
          "SIBO (Small Intestinal Bacterial Overgrowth) pattern",
          "Requires antimicrobial protocol",
          "Common in truckers due to stress and irregular eating",
          "Expect improvement in 2-4 weeks",
        ],
        monitoringPoints: [
          "Reduction in delayed bloating",
          "Less gas production",
          "Improved bowel regularity",
        ],
        redFlags: [
          "Severe abdominal pain",
          "Blood in stool",
          "Persistent fever",
        ],
      },
      noNode: "bloating_food_specific",
    },
    {
      id: "bloating_food_specific",
      question: "Bloating with specific foods?",
      condition: (data) => data.symptoms?.includes("food_sensitivity"),
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "biotics-intenzyme-forte",
            product: SupplementSelector.findProduct("intenzyme")!,
            dosage: "2 tablets between meals",
            timing: "empty stomach",
            duration: "3 months",
            purpose: "Reduce food sensitivity inflammation",
            priority: 1,
            truckerInstructions:
              "Take on empty stomach for inflammation reduction.",
            educationPoints: [
              "Anti-inflammatory protocol",
              "Reduces food sensitivity reactions",
            ],
          },
        ],
        instructions: [
          "Food sensitivity pattern detected",
          "Elimination diet recommended",
          "Focus on anti-inflammatory support",
          "Common triggers: gluten, dairy, processed foods",
        ],
        monitoringPoints: [
          "Identification of trigger foods",
          "Reduced reaction severity",
          "Improved overall digestion",
        ],
      },
      noNode: "bloating_constant",
    },
    {
      id: "bloating_constant",
      question: "Constant bloating regardless of food?",
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "letstruck-atrantil-pro",
            product: SupplementSelector.getSIBOProduct(true),
            dosage: "2 capsules 2x daily",
            timing: "with meals",
            duration: "3 months",
            purpose: "Severe dysbiosis treatment",
            priority: 1,
            truckerInstructions: "Professional strength for severe cases.",
            educationPoints: [
              "Severe dysbiosis pattern",
              "Requires intensive protocol",
            ],
          },
        ],
        instructions: [
          "Severe gut dysfunction requiring comprehensive approach",
          "Consider comprehensive stool testing",
          "May need practitioner supervision",
          "Full gut restoration protocol needed",
        ],
        monitoringPoints: [
          "Any improvement in bloating severity",
          "Bowel movement changes",
          "Energy level improvements",
        ],
        followUp: "2 weeks - may need additional testing or referral",
      },
    },
  ],
};

/**
 * ENERGY COMPLAINT RESOLVER TREE
 */
export const ENERGY_DECISION_TREE: DecisionNode = {
  id: "energy_root",
  question: "Primary energy pattern?",
  children: [
    {
      id: "morning_fatigue",
      question: "Worse fatigue in morning?",
      condition: (data) => data.symptoms?.includes("morning_fatigue"),
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "biotics-adhs",
            product: SupplementSelector.findProduct("adhs")!,
            dosage: "2 tablets with breakfast, 1 with lunch",
            timing: "morning and noon only",
            duration: "3 months",
            purpose: "Adrenal support for morning energy",
            priority: 1,
            truckerInstructions: "Morning only - can be stimulating.",
            educationPoints: [
              "Adrenal support pattern",
              "Helps with morning energy",
            ],
          },
          {
            productId: "letstruck-lyte-balance",
            product: SupplementSelector.getElectrolyteProduct(),
            dosage: "1 scoop upon waking",
            timing: "first thing in morning",
            duration: "Ongoing",
            purpose: "Electrolyte support for energy",
            priority: 1,
            truckerInstructions: "Critical first thing in morning for energy.",
            educationPoints: [
              "Supports adrenal function",
              "Essential electrolytes",
            ],
          },
        ],
        instructions: [
          "Adrenal fatigue pattern - common in truckers",
          "Irregular sleep schedules stress adrenal glands",
          "Focus on morning support",
          "Avoid stimulants after 2 PM",
        ],
        monitoringPoints: [
          "Easier morning wake-up",
          "Sustained morning energy",
          "Less need for excessive caffeine",
        ],
      },
      noNode: "afternoon_crash",
    },
    {
      id: "afternoon_crash",
      question: "Afternoon energy crash?",
      condition: (data) => data.symptoms?.includes("afternoon_crash"),
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "biotics-glucobalance",
            product: SupplementSelector.findProduct("glucobalance")!,
            dosage: "2 capsules with largest meal",
            timing: "with largest meal",
            duration: "6 months",
            purpose: "Blood sugar stabilization",
            priority: 1,
            truckerInstructions: "Take with meal containing carbs.",
            educationPoints: ["Blood sugar pattern", "Prevents energy crashes"],
          },
          {
            productId: "fullscript-berberine-hcl",
            product: SupplementSelector.findProduct("berberine")!,
            dosage: "500mg 2x daily",
            timing: "with meals",
            duration: "3 months",
            purpose: "Natural blood sugar support",
            priority: 2,
            truckerInstructions: "Take with meals to reduce GI upset.",
            educationPoints: [
              "Natural metformin alternative",
              "Stabilizes blood sugar",
            ],
          },
        ],
        instructions: [
          "Blood sugar instability pattern",
          "Common with irregular eating and road food",
          "Focus on protein and healthy fats",
          "Avoid simple carbohydrates",
        ],
        monitoringPoints: [
          "Stable afternoon energy",
          "Reduced carb cravings",
          "Better energy after meals",
        ],
      },
      noNode: "post_meal_fatigue",
    },
    {
      id: "post_meal_fatigue",
      question: "Fatigue after meals?",
      condition: (data) => data.symptoms?.includes("post_meal_fatigue"),
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "biotics-intenzyme-forte",
            product: SupplementSelector.findProduct("intenzyme")!,
            dosage: "1 tablet with meals",
            timing: "with meals",
            duration: "3 months",
            purpose: "Improve digestion efficiency",
            priority: 1,
            truckerInstructions: "Take with larger meals.",
            educationPoints: [
              "Digestive efficiency",
              "Reduces post-meal fatigue",
            ],
          },
          {
            productId: "fullscript-berberine-hcl",
            product: SupplementSelector.findProduct("berberine")!,
            dosage: "500mg with meals",
            timing: "with meals",
            duration: "3 months",
            purpose: "Improve glucose metabolism",
            priority: 2,
            truckerInstructions: "Helps process carbohydrates efficiently.",
            educationPoints: ["Metabolic support", "Improves carb processing"],
          },
        ],
        instructions: [
          "Post-meal fatigue suggests poor digestion or blood sugar issues",
          "Focus on digestive support",
          "Smaller, more frequent meals",
          "Avoid large carbohydrate loads",
        ],
        monitoringPoints: [
          "Energy stable after eating",
          "Less digestive discomfort",
          "Improved meal tolerance",
        ],
      },
      noNode: "chronic_fatigue",
    },
    {
      id: "chronic_fatigue",
      question: "All-day fatigue regardless of activity?",
      yesNode: {
        type: "assessment",
        supplements: [],
        instructions: [
          "Chronic fatigue requires comprehensive evaluation",
          "Check thyroid function (TSH, Free T4, Free T3)",
          "Assess B12, folate, iron status",
          "Consider sleep study",
          "Rule out underlying conditions",
        ],
        monitoringPoints: [
          "Energy levels throughout day",
          "Sleep quality assessment",
          "Response to basic interventions",
        ],
        followUp: "Comprehensive lab work and possible referral needed",
      },
    },
  ],
};

/**
 * CARDIOVASCULAR RISK RESOLVER TREE
 */
export const CARDIOVASCULAR_DECISION_TREE: DecisionNode = {
  id: "cardiovascular_root",
  question: "Blood pressure and cardiovascular risk level?",
  children: [
    {
      id: "bp_critical",
      question: "Blood pressure >140/90?",
      condition: (data) => {
        const systolic = data.labValues?.find(
          (lab: any) =>
            lab.testName?.toLowerCase().includes("systolic") ||
            lab.testName?.toLowerCase().includes("blood pressure")
        );
        return systolic && systolic.value > 140;
      },
      yesNode: {
        type: "immediate",
        supplements: [
          {
            productId: "letstruck-cardio-miracle",
            product: SupplementSelector.getCardioProduct(),
            dosage: "2 scoops daily",
            timing: "morning and evening",
            duration: "Immediate and ongoing",
            purpose: "Urgent blood pressure support",
            priority: 1,
            truckerInstructions: "CRITICAL for DOT medical. Take consistently.",
            educationPoints: ["Urgent intervention needed", "DOT medical risk"],
          },
          {
            productId: "letstruck-lyte-balance",
            product: SupplementSelector.getElectrolyteProduct(),
            dosage: "2 scoops daily",
            timing: "morning and afternoon",
            duration: "Immediate and ongoing",
            purpose: "Blood pressure regulation support",
            priority: 1,
            truckerInstructions: "Essential for blood pressure control.",
            educationPoints: [
              "Critical electrolyte balance",
              "Supports BP regulation",
            ],
          },
        ],
        instructions: [
          "URGENT: Blood pressure requires immediate medical attention",
          "Start supplements immediately",
          "Monitor blood pressure daily",
          "Reduce sodium intake significantly",
          "Schedule medical evaluation within 48 hours",
        ],
        monitoringPoints: [
          "Daily blood pressure readings",
          "Headache or vision changes",
          "Response to intervention",
        ],
        redFlags: [
          "Chest pain or pressure",
          "Severe headaches",
          "Vision changes",
          "Shortness of breath",
        ],
        followUp: "Medical evaluation within 48 hours - DOT medical at risk",
      },
      noNode: "bp_elevated",
    },
    {
      id: "bp_elevated",
      question: "Blood pressure 130-140/85-90?",
      condition: (data) => {
        const systolic = data.labValues?.find((lab: any) =>
          lab.testName?.toLowerCase().includes("systolic")
        );
        return systolic && systolic.value >= 130 && systolic.value <= 140;
      },
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "letstruck-cardio-miracle",
            product: SupplementSelector.getCardioProduct(),
            dosage: "1 scoop 2x daily",
            timing: "morning and evening",
            duration: "Ongoing",
            purpose: "Blood pressure optimization",
            priority: 1,
            truckerInstructions: "Consistent use critical for DOT medical.",
            educationPoints: [
              "BP optimization protocol",
              "DOT medical preparation",
            ],
          },
          {
            productId: "letstruck-algae-omega3",
            product: SupplementSelector.getOmega3Product(),
            dosage: "3 softgels 2x daily",
            timing: "with meals",
            duration: "Ongoing",
            purpose: "Cardiovascular protection",
            priority: 1,
            truckerInstructions: "Higher dose for cardiovascular risk.",
            educationPoints: [
              "Anti-inflammatory support",
              "Cardiovascular protection",
            ],
          },
          {
            productId: "biotics-coq-zyme-100",
            product: SupplementSelector.findProduct("coq")!,
            dosage: "2 capsules daily",
            timing: "with breakfast",
            duration: "Ongoing",
            purpose: "Heart muscle support",
            priority: 2,
            truckerInstructions: "Essential for heart health.",
            educationPoints: ["Heart muscle support", "Cellular energy"],
          },
        ],
        instructions: [
          "Elevated blood pressure - intervention needed",
          "Focus on cardiovascular support",
          "Dietary sodium reduction critical",
          "DOT medical preparation protocol",
        ],
        monitoringPoints: [
          "Weekly blood pressure checks",
          "Energy and exercise tolerance",
          "Response to lifestyle changes",
        ],
      },
      noNode: "bp_optimal",
    },
    {
      id: "bp_optimal",
      question:
        "Blood pressure optimal but family history of cardiovascular disease?",
      yesNode: {
        type: "protocol",
        supplements: [
          {
            productId: "letstruck-algae-omega3",
            product: SupplementSelector.getOmega3Product(),
            dosage: "2 softgels 2x daily",
            timing: "with meals",
            duration: "Ongoing",
            purpose: "Preventive cardiovascular protection",
            priority: 1,
            truckerInstructions: "Preventive care - consistent use important.",
            educationPoints: ["Preventive care", "Family history protection"],
          },
          {
            productId: "letstruck-lyte-balance",
            product: SupplementSelector.getElectrolyteProduct(),
            dosage: "1 scoop daily",
            timing: "morning",
            duration: "Ongoing",
            purpose: "Maintain optimal cardiovascular function",
            priority: 2,
            truckerInstructions: "Daily foundation for heart health.",
            educationPoints: [
              "Preventive electrolyte support",
              "Heart health maintenance",
            ],
          },
        ],
        instructions: [
          "Preventive cardiovascular care",
          "Family history requires proactive approach",
          "Focus on anti-inflammatory nutrition",
          "Regular exercise within trucking constraints",
        ],
        monitoringPoints: [
          "Annual blood pressure monitoring",
          "Lipid panel annually",
          "Exercise tolerance",
        ],
      },
    },
  ],
};

/**
 * DECISION TREE PROCESSOR
 */
export class DecisionTreeProcessor {
  static processDigestiveComplaints(
    symptoms: string[],
    labValues: any[]
  ): DecisionAction {
    const data = { symptoms, labValues };
    return this.traverseTree(DIGESTIVE_DECISION_TREE, data);
  }

  static processEnergyComplaints(
    symptoms: string[],
    labValues: any[]
  ): DecisionAction {
    const data = { symptoms, labValues };
    return this.traverseTree(ENERGY_DECISION_TREE, data);
  }

  static processCardiovascularRisk(
    symptoms: string[],
    labValues: any[]
  ): DecisionAction {
    const data = { symptoms, labValues };
    return this.traverseTree(CARDIOVASCULAR_DECISION_TREE, data);
  }

  private static traverseTree(node: DecisionNode, data: any): DecisionAction {
    // If node has children, find the matching child
    if (node.children) {
      for (const child of node.children) {
        if (child.condition && child.condition(data)) {
          if (typeof child.yesNode === "object") {
            return child.yesNode;
          } else if (child.yesNode && typeof child.yesNode === "string") {
            const nextNode = node.children.find((c) => c.id === child.yesNode);
            if (nextNode) return this.traverseTree(nextNode, data);
          }
        }
      }

      // If no condition matched, try the first child's noNode
      const firstChild = node.children[0];
      if (firstChild.noNode) {
        if (typeof firstChild.noNode === "object") {
          return firstChild.noNode;
        } else if (typeof firstChild.noNode === "string") {
          const nextNode = node.children.find(
            (c) => c.id === firstChild.noNode
          );
          if (nextNode) return this.traverseTree(nextNode, data);
        }
      }
    }

    // Default action if no specific path found
    return {
      type: "assessment",
      supplements: [],
      instructions: ["Further assessment needed"],
      monitoringPoints: ["Monitor symptoms"],
      followUp: "Schedule follow-up consultation",
    };
  }

  /**
   * Get automated protocol recommendations based on chief complaints
   */
  static getAutomatedRecommendations(
    complaints: string[],
    symptoms: string[],
    labValues: any[]
  ): {
    digestive?: DecisionAction;
    energy?: DecisionAction;
    cardiovascular?: DecisionAction;
  } {
    const recommendations: any = {};

    // Check for digestive complaints
    const digestiveSymptoms = symptoms.filter(
      (s) =>
        s.includes("bloating") ||
        s.includes("digestive") ||
        s.includes("gas") ||
        s.includes("constipation") ||
        s.includes("diarrhea")
    );

    if (digestiveSymptoms.length > 0) {
      recommendations.digestive = this.processDigestiveComplaints(
        symptoms,
        labValues
      );
    }

    // Check for energy complaints
    const energySymptoms = symptoms.filter(
      (s) =>
        s.includes("fatigue") ||
        s.includes("energy") ||
        s.includes("tired") ||
        s.includes("exhausted")
    );

    if (energySymptoms.length > 0) {
      recommendations.energy = this.processEnergyComplaints(
        symptoms,
        labValues
      );
    }

    // Check for cardiovascular risk
    const hasCardiovascularRisk = labValues.some((lab: any) => {
      const name = lab.testName?.toLowerCase() || "";
      return (
        (name.includes("blood pressure") && lab.value > 120) ||
        (name.includes("cholesterol") && lab.flag === "high") ||
        (name.includes("triglycerides") && lab.value > 100)
      );
    });

    if (hasCardiovascularRisk) {
      recommendations.cardiovascular = this.processCardiovascularRisk(
        symptoms,
        labValues
      );
    }

    return recommendations;
  }
}
