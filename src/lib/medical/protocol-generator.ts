import { prisma } from "@/lib/db/prisma";
import { FUNCTIONAL_MEDICINE_RANGES } from "./functional-ranges";

export interface SupplementProtocol {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  purpose: string;
  priority: 1 | 2 | 3;
  roadInstructions: string;
  source: "letstruck" | "biotics" | "fullscript" | "pharmacy";
  productUrl?: string;
  notes?: string;
}

export interface MealPlan {
  phase: string;
  duration: string;
  guidelines: string[];
  truckerSpecific: string[];
  sampleMeals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  truckStopOptions: {
    chain: string;
    recommendations: string[];
  }[];
  avoidFoods: string[];
  shoppingList: string[];
}

export interface LifestyleProtocol {
  category: "movement" | "sleep" | "stress" | "environment";
  recommendations: {
    instruction: string;
    frequency: string;
    truckerModification: string;
    difficulty: "easy" | "moderate" | "challenging";
  }[];
}

export interface MonitoringSchedule {
  timeline: string;
  labsToReorder: string[];
  symptomsToTrack: string[];
  successMetrics: string[];
  redFlags: string[];
  nextAppointment: string;
}

export interface ClientProtocol {
  clientInfo: {
    name: string;
    documentType: string;
    analysisDate: string;
    overallGrade: string;
    healthScore: number;
  };
  executiveSummary: {
    keyFindings: string[];
    topPriorities: string[];
    expectedOutcomes: string[];
    timeframe: string;
  };
  supplements: {
    immediate: SupplementProtocol[];
    phase2: SupplementProtocol[];
    maintenance: SupplementProtocol[];
  };
  nutrition: MealPlan;
  lifestyle: LifestyleProtocol[];
  monitoring: MonitoringSchedule;
  education: {
    resources: string[];
    explanations: { topic: string; content: string }[];
  };
  followUp: {
    checkIn1Week: string[];
    checkIn4Week: string[];
    retest6Week: string[];
  };
}

export class FNTPProtocolGenerator {
  async generateProtocol(documentId: string): Promise<ClientProtocol> {
    console.log(`📋 Generating FNTP protocol for document: ${documentId}`);

    try {
      // Get analysis data
      const analysis = await this.getAnalysisData(documentId);

      // Generate supplement protocols based on patterns
      const supplements = await this.generateSupplementProtocols(analysis);

      // Create truck driver optimized meal plan
      const nutrition = await this.generateMealPlan(analysis);

      // Build lifestyle recommendations
      const lifestyle = await this.generateLifestyleProtocols(analysis);

      // Create monitoring schedule
      const monitoring = await this.generateMonitoringSchedule(analysis);

      // Build educational resources
      const education = await this.generateEducation(analysis);

      // Create follow-up schedule
      const followUp = await this.generateFollowUpSchedule(analysis);

      const protocol: ClientProtocol = {
        clientInfo: {
          name: analysis.document.client?.name || "Driver",
          documentType: analysis.document.documentType || "Lab Report",
          analysisDate: new Date().toLocaleDateString(),
          overallGrade: analysis.healthGrade || "C",
          healthScore: analysis.overallHealthScore || 75,
        },
        executiveSummary: this.generateExecutiveSummary(analysis),
        supplements,
        nutrition,
        lifestyle,
        monitoring,
        education,
        followUp,
      };

      // Save protocol to database
      await this.saveProtocol(documentId, protocol);

      console.log(`✅ FNTP protocol generated successfully`);
      return protocol;
    } catch (error) {
      console.error("❌ Protocol generation error:", error);
      throw error;
    }
  }

  private async getAnalysisData(documentId: string) {
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const labValues = await prisma.medicalLabValue.findMany({
      where: { documentId },
      orderBy: { confidence: "desc" },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Extract analysis data from document metadata
    const metadata = document.metadata as any;
    const analysis = {
      document,
      labValues,
      healthGrade: metadata?.healthGrade || "C",
      overallHealthScore: metadata?.overallHealthScore || 75,
      patternsDetected: metadata?.patternsDetected || 0,
      criticalFindings: metadata?.criticalFindings || 0,
      // Simulate pattern detection for protocol generation
      patterns: this.detectPatternsFromLabValues(labValues),
    };

    return analysis;
  }

  private detectPatternsFromLabValues(labValues: any[]): any[] {
    const patterns = [];

    // Check for insulin resistance pattern
    const glucose = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("glucose")
    );
    const triglycerides = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("triglycerides")
    );
    const hdl = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("hdl")
    );

    if (glucose && (glucose.value > 99 || glucose.flag === "high")) {
      patterns.push({
        name: "Insulin Resistance",
        confidence: 0.8,
        description:
          "Pattern suggesting insulin resistance and metabolic dysfunction",
      });
    }

    // Check for thyroid pattern
    const tsh = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("tsh")
    );
    const freeT4 = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("t4")
    );

    if (tsh && (tsh.value > 3.0 || tsh.flag === "high")) {
      patterns.push({
        name: "Hypothyroid Pattern",
        confidence: 0.9,
        description: "Pattern suggesting underactive thyroid function",
      });
    }

    // Check for inflammation pattern
    const crp = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("crp")
    );
    const esr = labValues.find((lab) =>
      lab.testName.toLowerCase().includes("esr")
    );

    if (crp && (crp.value > 1.0 || crp.flag === "high")) {
      patterns.push({
        name: "Chronic Inflammation",
        confidence: 0.7,
        description:
          "Elevated inflammatory markers indicating systemic inflammation",
      });
    }

    return patterns;
  }

  private async generateSupplementProtocols(
    analysis: any
  ): Promise<ClientProtocol["supplements"]> {
    const immediate: SupplementProtocol[] = [];
    const phase2: SupplementProtocol[] = [];
    const maintenance: SupplementProtocol[] = [];

    // Always start with foundational support
    immediate.push({
      name: "Algae Omega-3 DHA",
      dosage: "2 capsules daily",
      timing: "With largest meal",
      duration: "Ongoing",
      purpose: "Reduce inflammation, support brain function",
      priority: 1,
      roadInstructions: "Keep in cooler bag, take with dinner",
      source: "letstruck",
      productUrl: "https://store.letstruck.com/products/algae-oil-dha-omega-3s",
      notes: "Superior to fish oil - no contamination, sustainable",
    });

    immediate.push({
      name: "Comprehensive Multivitamin",
      dosage: "1 capsule daily",
      timing: "With breakfast",
      duration: "Ongoing",
      purpose: "Fill nutritional gaps from limited road food options",
      priority: 1,
      roadInstructions: "Take when you stop for breakfast",
      source: "biotics",
      notes: "Choose high-potency formula with active B vitamins",
    });

    // Pattern-specific supplements
    const patterns = analysis.patterns || [];

    for (const pattern of patterns) {
      if (pattern.name === "Insulin Resistance") {
        immediate.push({
          name: "Chromium GTF",
          dosage: "400 mcg",
          timing: "With largest meal",
          duration: "3 months, then reassess",
          purpose: "Improve insulin sensitivity and glucose metabolism",
          priority: 1,
          roadInstructions: "Take with lunch or dinner",
          source: "biotics",
        });

        phase2.push({
          name: "Alpha Lipoic Acid",
          dosage: "300 mg twice daily",
          timing: "Between meals",
          duration: "6 months",
          purpose: "Antioxidant support, improve insulin sensitivity",
          priority: 2,
          roadInstructions: "Take 1 hour before meals",
          source: "fullscript",
        });

        phase2.push({
          name: "Berberine HCl",
          dosage: "500 mg three times daily",
          timing: "Before meals",
          duration: "3 months",
          purpose: "Natural metformin alternative, lower glucose",
          priority: 2,
          roadInstructions: "Take 15 minutes before eating",
          source: "biotics",
          notes: "Monitor blood sugar closely if on diabetes medication",
        });
      }

      if (pattern.name === "Hypothyroid Pattern") {
        immediate.push({
          name: "Iodine/Kelp Complex",
          dosage: "150 mcg iodine",
          timing: "Morning, empty stomach",
          duration: "6 months",
          purpose: "Support thyroid hormone production",
          priority: 1,
          roadInstructions: "Take when you first wake up, 30 min before coffee",
          source: "biotics",
        });

        immediate.push({
          name: "Selenium",
          dosage: "200 mcg",
          timing: "With lunch",
          duration: "6 months",
          purpose: "Support T4 to T3 conversion",
          priority: 1,
          roadInstructions: "Take with midday meal",
          source: "fullscript",
        });

        phase2.push({
          name: "L-Tyrosine",
          dosage: "500 mg",
          timing: "Morning, empty stomach",
          duration: "3 months",
          purpose: "Precursor for thyroid hormone production",
          priority: 2,
          roadInstructions: "Take 30 minutes before breakfast",
          source: "biotics",
        });
      }

      if (pattern.name === "Chronic Inflammation") {
        immediate.push({
          name: "Curcumin Complex",
          dosage: "500 mg twice daily",
          timing: "With meals",
          duration: "6 months",
          purpose: "Powerful anti-inflammatory, reduce systemic inflammation",
          priority: 1,
          roadInstructions: "Take with lunch and dinner",
          source: "biotics",
          notes: "Look for enhanced absorption formula with piperine",
        });

        phase2.push({
          name: "Probiotic 50B CFU",
          dosage: "1 capsule daily",
          timing: "With breakfast",
          duration: "Ongoing",
          purpose: "Restore gut health, reduce inflammatory markers",
          priority: 2,
          roadInstructions:
            "Keep refrigerated when possible, room temp okay for travel",
          source: "biotics",
        });
      }
    }

    // Maintenance supplements for all truck drivers
    maintenance.push({
      name: "Magnesium Glycinate",
      dosage: "400 mg",
      timing: "Before bed",
      duration: "Ongoing",
      purpose: "Muscle relaxation, sleep quality, stress management",
      priority: 3,
      roadInstructions: "Take 1 hour before sleep in sleeper cab",
      source: "biotics",
    });

    maintenance.push({
      name: "Vitamin D3 + K2",
      dosage: "5000 IU D3 + 200 mcg K2",
      timing: "With breakfast",
      duration: "Ongoing",
      purpose: "Bone health, immune function, mood support",
      priority: 3,
      roadInstructions: "Take with morning meal",
      source: "biotics",
    });

    return { immediate, phase2, maintenance };
  }

  private async generateMealPlan(analysis: any): Promise<MealPlan> {
    const patterns = analysis.patterns || [];
    const hasInsulinResistance = patterns.some(
      (p: any) => p.name === "Insulin Resistance"
    );
    const hasInflammation = patterns.some(
      (p: any) => p.name === "Chronic Inflammation"
    );

    let guidelines = [
      "Eat every 3-4 hours to maintain stable blood sugar",
      "Include protein with every meal and snack",
      "Choose whole, unprocessed foods when possible",
      "Stay hydrated with 100+ oz water daily",
    ];

    let avoidFoods = [
      "Processed foods with added sugars",
      "Trans fats and fried foods",
      "Excessive caffeine (limit to 2 cups coffee)",
      "Alcohol during healing phase",
    ];

    if (hasInsulinResistance) {
      guidelines.push(
        "Limit carbohydrates to 30-50g per meal",
        "Focus on healthy fats for sustained energy",
        "Avoid simple sugars and refined grains"
      );
      avoidFoods.push(
        "Bread, pasta, rice, potatoes",
        "Sugary drinks and energy drinks",
        "Candy, cookies, pastries"
      );
    }

    if (hasInflammation) {
      guidelines.push(
        "Emphasize anti-inflammatory foods",
        "Include colorful vegetables daily",
        "Add herbs and spices for flavor and healing"
      );
      avoidFoods.push(
        "Processed meats (hot dogs, deli meat)",
        "Refined vegetable oils",
        "Foods high in omega-6 oils"
      );
    }

    return {
      phase: hasInsulinResistance
        ? "Blood Sugar Stabilization"
        : "Anti-Inflammatory Healing",
      duration: "6-8 weeks, then reassess",
      guidelines,
      truckerSpecific: [
        "Prep meals when home, store in cooler",
        "Use truck stop healthier options strategically",
        "Keep emergency healthy snacks in cab",
        "Plan routes around grocery stores when possible",
      ],
      sampleMeals: {
        breakfast: [
          "Scrambled eggs with avocado and salsa",
          "Greek yogurt with nuts and berries",
          "Protein smoothie with spinach and almond butter",
        ],
        lunch: [
          "Large salad with grilled chicken and olive oil",
          "Lettuce wrap turkey and cheese roll-ups",
          "Canned salmon with mixed vegetables",
        ],
        dinner: [
          "Grilled protein with roasted vegetables",
          "Stir-fry with coconut oil and plenty of veggies",
          "Soup with beans and vegetables",
        ],
        snacks: [
          "Raw almonds or walnuts",
          "Apple with almond butter",
          "Hard-boiled eggs",
          "Beef jerky (sugar-free)",
          "Vegetable sticks with hummus",
        ],
      },
      truckStopOptions: [
        {
          chain: "Love's Travel Stops",
          recommendations: [
            "Fresh fruit from market section",
            "Hard-boiled eggs from cooler",
            "Nuts and seeds (unsalted)",
            "Rotisserie chicken (remove skin)",
          ],
        },
        {
          chain: "Pilot Flying J",
          recommendations: [
            "Subway salad (double protein, oil/vinegar)",
            "Fresh vegetables from market",
            "String cheese and nuts",
            "Grilled chicken strips",
          ],
        },
        {
          chain: "TA/Petro",
          recommendations: [
            "Salad bar with protein",
            "Fresh fruit section",
            "Nuts and jerky",
            "Boiled eggs from grab-and-go",
          ],
        },
      ],
      avoidFoods,
      shoppingList: [
        "Eggs (2 dozen)",
        "Canned wild salmon",
        "Raw almonds/walnuts",
        "Avocados",
        "Spinach/mixed greens",
        "Bell peppers",
        "Cucumber",
        "Greek yogurt (plain)",
        "Olive oil",
        "Apple cider vinegar",
        "Turmeric powder",
        "Garlic",
        "Lemons",
      ],
    };
  }

  private async generateLifestyleProtocols(
    analysis: any
  ): Promise<LifestyleProtocol[]> {
    return [
      {
        category: "movement",
        recommendations: [
          {
            instruction: "Walk for 10 minutes every 2 hours of driving",
            frequency: "Every 2 hours",
            truckerModification:
              "Use rest stops, truck stops, or safe roadside areas",
            difficulty: "easy",
          },
          {
            instruction: "Perform cab exercises during mandatory breaks",
            frequency: "During 30-minute breaks",
            truckerModification:
              "Seated spinal twists, neck rolls, ankle pumps, shoulder shrugs",
            difficulty: "easy",
          },
          {
            instruction: "Resistance band workout",
            frequency: "3x per week",
            truckerModification:
              "Keep bands in cab, use outside truck or in sleeper",
            difficulty: "moderate",
          },
        ],
      },
      {
        category: "sleep",
        recommendations: [
          {
            instruction: "Maintain consistent sleep schedule",
            frequency: "Daily",
            truckerModification: "Sleep same hours even with varying routes",
            difficulty: "moderate",
          },
          {
            instruction: "Block out all light in sleeper cab",
            frequency: "Every night",
            truckerModification:
              "Blackout curtains, eye mask, cover all LED lights",
            difficulty: "easy",
          },
          {
            instruction: "No screens 1 hour before sleep",
            frequency: "Daily",
            truckerModification:
              "Use blue light blocking glasses if must use devices",
            difficulty: "moderate",
          },
        ],
      },
      {
        category: "stress",
        recommendations: [
          {
            instruction: "Deep breathing exercises",
            frequency: "3x daily",
            truckerModification:
              "Practice during traffic, loading/unloading waits",
            difficulty: "easy",
          },
          {
            instruction: "Call family/friends regularly",
            frequency: "Daily",
            truckerModification:
              "Use hands-free during breaks, not while driving",
            difficulty: "easy",
          },
          {
            instruction: "Meditation or prayer",
            frequency: "Daily",
            truckerModification:
              "10 minutes in sleeper before sleep or upon waking",
            difficulty: "moderate",
          },
        ],
      },
      {
        category: "environment",
        recommendations: [
          {
            instruction: "Use HEPA air filter in cab",
            frequency: "Continuously",
            truckerModification: "12V air purifier designed for vehicles",
            difficulty: "easy",
          },
          {
            instruction: "Minimize diesel fume exposure",
            frequency: "Always",
            truckerModification:
              "Windows up during fueling, avoid idling unnecessarily",
            difficulty: "easy",
          },
          {
            instruction: "Grounding/earthing practice",
            frequency: "Daily",
            truckerModification:
              "Walk barefoot on grass during breaks when possible",
            difficulty: "easy",
          },
        ],
      },
    ];
  }

  private async generateMonitoringSchedule(
    analysis: any
  ): Promise<MonitoringSchedule> {
    const patterns = analysis.patterns || [];
    const labsToReorder = ["Comprehensive Metabolic Panel", "Lipid Panel"];
    const symptomsToTrack = [
      "Energy levels (1-10 daily)",
      "Sleep quality (1-10 daily)",
    ];
    const redFlags = ["Chest pain", "Severe fatigue", "Vision changes"];

    // Add pattern-specific monitoring
    patterns.forEach((pattern: any) => {
      if (pattern.name === "Insulin Resistance") {
        labsToReorder.push("Hemoglobin A1C", "Fasting Insulin");
        symptomsToTrack.push("Blood sugar crashes", "Carb cravings intensity");
        redFlags.push("Frequent urination", "Excessive thirst");
      }
      if (pattern.name === "Hypothyroid Pattern") {
        labsToReorder.push(
          "TSH",
          "Free T4",
          "Free T3",
          "Reverse T3",
          "TPO Antibodies"
        );
        symptomsToTrack.push("Morning body temperature", "Cold intolerance");
        redFlags.push("Heart palpitations", "Severe depression");
      }
      if (pattern.name === "Chronic Inflammation") {
        labsToReorder.push("hs-CRP", "ESR", "Ferritin");
        symptomsToTrack.push("Joint pain levels", "Digestive symptoms");
        redFlags.push("Persistent fever", "Significant weight loss");
      }
    });

    return {
      timeline: "6-8 weeks for first recheck",
      labsToReorder,
      symptomsToTrack,
      successMetrics: [
        "Improved energy levels (target: 7+/10)",
        "Better sleep quality (target: 7+/10)",
        "Stable mood throughout day",
        "Reduced cravings for sugar/carbs",
      ],
      redFlags,
      nextAppointment: "Schedule within 2 weeks of lab results",
    };
  }

  private generateExecutiveSummary(
    analysis: any
  ): ClientProtocol["executiveSummary"] {
    const grade = analysis.healthGrade || "C";
    const patterns = analysis.patterns || [];

    const keyFindings = [
      `Overall health grade: ${grade} (${
        analysis.overallHealthScore || 75
      }/100)`,
      ...patterns.map(
        (p: any) =>
          `${p.name} detected with ${(p.confidence * 100).toFixed(
            0
          )}% confidence`
      ),
    ];

    const topPriorities =
      patterns.length > 0
        ? patterns.slice(0, 2).map((p: any) => p.description)
        : ["General health optimization", "Preventive care maintenance"];

    return {
      keyFindings,
      topPriorities,
      expectedOutcomes: [
        "Improved energy and mental clarity within 2-4 weeks",
        "Better sleep quality and stress resilience",
        "Optimized biomarkers within 6-8 weeks",
        "Enhanced long-term health for driving career sustainability",
      ],
      timeframe:
        "6-8 weeks for initial improvements, 3-6 months for full optimization",
    };
  }

  private async generateEducation(
    analysis: any
  ): Promise<ClientProtocol["education"]> {
    return {
      resources: [
        "Truck Driver Health Optimization Guide",
        "Understanding Your Lab Results",
        "Road-Compatible Meal Planning",
        "Functional Medicine Approach to Wellness",
      ],
      explanations: [
        {
          topic: "Why Functional Medicine Ranges",
          content:
            "Functional medicine uses tighter ranges that indicate optimal health rather than just absence of disease. This allows us to catch dysfunction early and optimize your health proactively.",
        },
        {
          topic: "Truck Driver Health Challenges",
          content:
            "Professional drivers face unique health challenges: sedentary work, irregular schedules, limited food access, and environmental exposures. This protocol addresses these specific challenges.",
        },
        {
          topic: "Why These Supplements",
          content:
            "Each supplement is chosen based on your specific lab findings and health patterns. We prioritize road-compatible options that fit your driving lifestyle.",
        },
      ],
    };
  }

  private async generateFollowUpSchedule(
    analysis: any
  ): Promise<ClientProtocol["followUp"]> {
    return {
      checkIn1Week: [
        "How are you tolerating the new supplements?",
        "Any digestive upset or side effects?",
        "Energy levels and sleep quality changes?",
        "Questions about meal planning?",
      ],
      checkIn4Week: [
        "Progress on symptom tracking goals",
        "Compliance with supplement protocol",
        "Challenges with road food planning",
        "Adjustments needed for travel schedule",
      ],
      retest6Week: [
        "Order follow-up lab work",
        "Review symptom improvement",
        "Assess protocol effectiveness",
        "Plan Phase 2 interventions",
      ],
    };
  }

  private async saveProtocol(
    documentId: string,
    protocol: ClientProtocol
  ): Promise<void> {
    try {
      // Update document metadata with protocol completion
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: {
          metadata: {
            ...(
              await prisma.medicalDocument.findUnique({
                where: { id: documentId },
                select: { metadata: true },
              })
            )?.metadata,
            fntpProtocolComplete: true,
            protocolGeneratedAt: new Date().toISOString(),
            supplementsRecommended: protocol.supplements.immediate.length,
            nutritionPhase: protocol.nutrition.phase,
          },
        },
      });

      console.log("💾 FNTP protocol metadata saved to document");
    } catch (error) {
      console.error("❌ Failed to save protocol:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const fntpProtocolGenerator = new FNTPProtocolGenerator();
