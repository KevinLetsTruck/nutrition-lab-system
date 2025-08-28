import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AssessmentCategory {
  categoryName: string;
  categoryDescription: string;
  systemFocus: string;
  diagnosticWeight: number;
  interventionPriority: number;
  symptomPatterns: any;
  rootCauseIndicators: any;
}

export async function seedAssessmentCategories() {
  console.log(
    "🎯 Seeding Assessment Categories for Functional Medicine Analysis..."
  );

  const categories: AssessmentCategory[] = [
    // DIGESTIVE SYSTEM
    {
      categoryName: "Digestive Dysfunction - SIBO/Dysbiosis",
      categoryDescription:
        "Small intestinal bacterial overgrowth and gut microbiome imbalances affecting digestion and systemic health",
      systemFocus: "digestive",
      diagnosticWeight: 2.5,
      interventionPriority: 1, // Critical
      symptomPatterns: {
        primary: [
          "bloating after meals",
          "gas and belching",
          "irregular bowel movements",
          "abdominal pain",
        ],
        secondary: [
          "brain fog after eating",
          "food sensitivities",
          "fatigue after meals",
          "joint pain",
        ],
        timing:
          "symptoms worsen 1-3 hours after meals, especially carbohydrates",
        duration: "symptoms persist for 2+ hours after eating",
      },
      rootCauseIndicators: {
        causes: [
          "antibiotic use",
          "low stomach acid",
          "slow gut motility",
          "chronic stress",
          "PPI use",
        ],
        mechanisms: [
          "bacterial overgrowth",
          "impaired digestion",
          "intestinal permeability",
          "dysbiosis",
        ],
        consequences: [
          "nutrient malabsorption",
          "systemic inflammation",
          "immune dysfunction",
          "neurotransmitter imbalances",
        ],
      },
    },
    {
      categoryName: "Digestive Dysfunction - Low Stomach Acid",
      categoryDescription:
        "Hypochlorhydria affecting protein digestion, mineral absorption, and pathogen defense",
      systemFocus: "digestive",
      diagnosticWeight: 2.0,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "feeling full quickly",
          "undigested food in stool",
          "protein intolerance",
          "bloating with protein",
        ],
        secondary: [
          "iron deficiency",
          "B12 deficiency",
          "brittle nails",
          "hair thinning",
        ],
        timing:
          "symptoms improve with digestive enzymes or HCl supplementation",
        duration: "fullness persists 30+ minutes after small meals",
      },
      rootCauseIndicators: {
        causes: [
          "aging",
          "chronic stress",
          "H. pylori infection",
          "PPI medication use",
          "zinc deficiency",
        ],
        mechanisms: [
          "reduced HCl production",
          "impaired protein breakdown",
          "mineral malabsorption",
          "bacterial overgrowth risk",
        ],
        consequences: [
          "nutrient deficiencies",
          "osteoporosis risk",
          "immune dysfunction",
          "increased infection risk",
        ],
      },
    },
    {
      categoryName: "Digestive Dysfunction - Intestinal Permeability",
      categoryDescription:
        "Leaky gut syndrome leading to systemic inflammation and immune activation",
      systemFocus: "digestive",
      diagnosticWeight: 2.2,
      interventionPriority: 1,
      symptomPatterns: {
        primary: [
          "multiple food sensitivities",
          "chronic fatigue",
          "joint pain",
          "skin issues",
        ],
        secondary: [
          "mood disorders",
          "autoimmune conditions",
          "chemical sensitivities",
          "seasonal allergies",
        ],
        timing: "symptoms vary with dietary changes and stress levels",
        duration: "symptoms can persist for days after trigger exposure",
      },
      rootCauseIndicators: {
        causes: [
          "chronic stress",
          "NSAIDs",
          "gluten sensitivity",
          "dysbiosis",
          "alcohol consumption",
        ],
        mechanisms: [
          "tight junction dysfunction",
          "inflammatory cascade",
          "immune system activation",
          "molecular mimicry",
        ],
        consequences: [
          "systemic inflammation",
          "autoimmune triggers",
          "nutrient malabsorption",
          "neuroinflammation",
        ],
      },
    },

    // ENERGY/ADRENAL SYSTEM
    {
      categoryName: "Energy - HPA Axis Dysfunction",
      categoryDescription:
        "Hypothalamic-Pituitary-Adrenal axis dysregulation causing adrenal fatigue and cortisol imbalances",
      systemFocus: "energy",
      diagnosticWeight: 3.0,
      interventionPriority: 1,
      symptomPatterns: {
        primary: [
          "morning fatigue",
          "afternoon energy crash",
          "difficulty falling asleep",
          "tired but wired",
        ],
        secondary: [
          "sugar cravings",
          "low stress tolerance",
          "frequent infections",
          "difficulty losing weight",
        ],
        timing: "energy lowest in morning (8-10am) and mid-afternoon (2-4pm)",
        duration: "fatigue cycles predictably with cortisol rhythm disruption",
      },
      rootCauseIndicators: {
        causes: [
          "chronic stress",
          "sleep deprivation",
          "blood sugar instability",
          "chronic inflammation",
          "overtraining",
        ],
        mechanisms: [
          "cortisol dysregulation",
          "neurotransmitter imbalances",
          "mitochondrial dysfunction",
          "insulin resistance",
        ],
        consequences: [
          "metabolic dysfunction",
          "immune suppression",
          "mood disorders",
          "accelerated aging",
        ],
      },
    },
    {
      categoryName: "Energy - Mitochondrial Dysfunction",
      categoryDescription:
        "Impaired cellular energy production and ATP synthesis affecting systemic energy",
      systemFocus: "energy",
      diagnosticWeight: 2.5,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "muscle fatigue",
          "exercise intolerance",
          "cognitive fatigue",
          "post-exertional malaise",
        ],
        secondary: [
          "temperature regulation issues",
          "poor recovery",
          "chemical sensitivities",
          "light sensitivity",
        ],
        timing:
          "fatigue worsens significantly with physical or mental exertion",
        duration: "recovery time from exertion is prolonged (24-48+ hours)",
      },
      rootCauseIndicators: {
        causes: [
          "nutrient deficiencies",
          "toxin exposure",
          "oxidative stress",
          "genetic factors",
          "chronic infections",
        ],
        mechanisms: [
          "electron transport chain dysfunction",
          "CoQ10 deficiency",
          "ATP depletion",
          "oxidative damage",
        ],
        consequences: [
          "systemic fatigue",
          "accelerated aging",
          "chronic disease risk",
          "cognitive decline",
        ],
      },
    },

    // HORMONAL SYSTEM
    {
      categoryName: "Hormonal - Thyroid Dysfunction",
      categoryDescription:
        "Hypothyroidism, hyperthyroidism, and thyroid hormone conversion issues affecting metabolism",
      systemFocus: "hormonal",
      diagnosticWeight: 2.8,
      interventionPriority: 1,
      symptomPatterns: {
        primary: ["cold intolerance", "weight gain", "hair loss", "fatigue"],
        secondary: ["constipation", "depression", "dry skin", "brain fog"],
        timing: "symptoms consistent throughout day, worsen with stress",
        duration: "symptoms develop gradually over months to years",
      },
      rootCauseIndicators: {
        causes: [
          "autoimmune thyroiditis",
          "iodine deficiency",
          "stress",
          "toxin exposure",
          "selenium deficiency",
        ],
        mechanisms: [
          "TSH elevation",
          "T4 to T3 conversion issues",
          "reverse T3 elevation",
          "thyroid receptor resistance",
        ],
        consequences: [
          "metabolic slowdown",
          "cardiovascular issues",
          "cognitive dysfunction",
          "fertility problems",
        ],
      },
    },
    {
      categoryName: "Hormonal - Sex Hormone Imbalance",
      categoryDescription:
        "Estrogen dominance, low testosterone, progesterone deficiency affecting reproductive and metabolic health",
      systemFocus: "hormonal",
      diagnosticWeight: 2.3,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "PMS symptoms",
          "irregular cycles",
          "low libido",
          "mood swings",
        ],
        secondary: [
          "weight gain",
          "sleep disruption",
          "breast tenderness",
          "hot flashes",
        ],
        timing:
          "symptoms cyclical in premenopausal women, consistent in menopause",
        duration: "PMS symptoms typically 7-14 days before menstruation",
      },
      rootCauseIndicators: {
        causes: [
          "stress",
          "insulin resistance",
          "liver dysfunction",
          "environmental toxins",
          "poor gut health",
        ],
        mechanisms: [
          "hormone synthesis disruption",
          "SHBG changes",
          "receptor sensitivity",
          "aromatase activity",
        ],
        consequences: [
          "reproductive issues",
          "bone loss",
          "cardiovascular risk",
          "mood disorders",
        ],
      },
    },

    // INFLAMMATION/IMMUNE
    {
      categoryName: "Inflammation - Chronic Systemic",
      categoryDescription:
        "Persistent low-grade inflammation affecting multiple organ systems",
      systemFocus: "inflammation",
      diagnosticWeight: 2.7,
      interventionPriority: 1,
      symptomPatterns: {
        primary: ["joint pain", "muscle aches", "chronic fatigue", "brain fog"],
        secondary: [
          "mood changes",
          "frequent infections",
          "poor wound healing",
          "skin issues",
        ],
        timing: "symptoms persistent with periodic flares",
        duration: "inflammatory symptoms can last weeks to months",
      },
      rootCauseIndicators: {
        causes: [
          "gut dysfunction",
          "chronic infections",
          "food sensitivities",
          "toxin exposure",
          "chronic stress",
        ],
        mechanisms: [
          "cytokine elevation",
          "NF-κB activation",
          "oxidative stress",
          "immune dysregulation",
        ],
        consequences: [
          "tissue damage",
          "accelerated aging",
          "chronic disease risk",
          "autoimmune development",
        ],
      },
    },
    {
      categoryName: "Inflammation - Autoimmune Patterns",
      categoryDescription:
        "Immune system targeting self-tissues with inflammatory cascade activation",
      systemFocus: "inflammation",
      diagnosticWeight: 2.9,
      interventionPriority: 1,
      symptomPatterns: {
        primary: [
          "joint stiffness",
          "tissue-specific symptoms",
          "fatigue",
          "inflammation flares",
        ],
        secondary: [
          "brain fog",
          "mood changes",
          "digestive issues",
          "skin problems",
        ],
        timing:
          "symptoms may have cyclical patterns or be triggered by stress/infections",
        duration:
          "flares can last days to weeks, with varying remission periods",
      },
      rootCauseIndicators: {
        causes: [
          "genetic predisposition",
          "leaky gut",
          "molecular mimicry",
          "chronic infections",
          "stress",
        ],
        mechanisms: [
          "autoantibody production",
          "tissue destruction",
          "inflammatory cytokines",
          "immune complex formation",
        ],
        consequences: [
          "organ damage",
          "disability",
          "increased infection risk",
          "comorbid conditions",
        ],
      },
    },

    // DETOXIFICATION
    {
      categoryName: "Detoxification - Phase I Dysfunction",
      categoryDescription:
        "Impaired cytochrome P450 enzyme function affecting initial toxin processing",
      systemFocus: "detoxification",
      diagnosticWeight: 2.0,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "chemical sensitivities",
          "caffeine intolerance",
          "medication sensitivities",
          "alcohol intolerance",
        ],
        secondary: [
          "hormonal imbalances",
          "chronic fatigue",
          "skin issues",
          "headaches",
        ],
        timing:
          "symptoms worsen with toxin exposure (perfumes, chemicals, medications)",
        duration: "reactions can last hours to days after exposure",
      },
      rootCauseIndicators: {
        causes: [
          "genetic polymorphisms",
          "nutrient deficiencies",
          "toxin overload",
          "liver dysfunction",
        ],
        mechanisms: [
          "CYP enzyme inhibition",
          "cofactor depletion",
          "oxidative stress",
          "substrate accumulation",
        ],
        consequences: [
          "toxin accumulation",
          "hormone disruption",
          "increased disease risk",
          "medication intolerance",
        ],
      },
    },
    {
      categoryName: "Detoxification - Phase II Dysfunction",
      categoryDescription:
        "Impaired conjugation pathways affecting toxin elimination and clearance",
      systemFocus: "detoxification",
      diagnosticWeight: 2.1,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "slow healing",
          "poor stress tolerance",
          "environmental sensitivities",
          "chronic fatigue",
        ],
        secondary: [
          "sulfur intolerance",
          "difficulty losing weight",
          "chronic infections",
          "mood issues",
        ],
        timing:
          "symptoms improve with liver support supplements and reduced toxin load",
        duration: "improvement may take weeks to months of consistent support",
      },
      rootCauseIndicators: {
        causes: [
          "amino acid deficiencies",
          "sulfur metabolism issues",
          "genetic variants",
          "nutrient depletion",
        ],
        mechanisms: [
          "conjugation pathway dysfunction",
          "glutathione depletion",
          "methylation issues",
          "sulfation problems",
        ],
        consequences: [
          "impaired elimination",
          "toxic burden",
          "chronic inflammation",
          "oxidative stress",
        ],
      },
    },

    // NEUROLOGICAL/MENTAL
    {
      categoryName: "Neurological - Neurotransmitter Imbalance",
      categoryDescription:
        "Serotonin, dopamine, GABA, and norepinephrine dysfunction affecting mood and cognition",
      systemFocus: "neurological",
      diagnosticWeight: 2.4,
      interventionPriority: 2,
      symptomPatterns: {
        primary: ["mood changes", "anxiety", "depression", "irritability"],
        secondary: [
          "sleep issues",
          "cognitive dysfunction",
          "cravings",
          "social withdrawal",
        ],
        timing: "symptoms may have circadian patterns or be stress-related",
        duration:
          "mood symptoms can fluctuate daily or persist for weeks/months",
      },
      rootCauseIndicators: {
        causes: [
          "gut dysfunction",
          "nutrient deficiencies",
          "stress",
          "genetic factors",
          "inflammation",
        ],
        mechanisms: [
          "neurotransmitter synthesis issues",
          "receptor dysfunction",
          "reuptake problems",
          "breakdown issues",
        ],
        consequences: [
          "mood disorders",
          "cognitive decline",
          "behavioral changes",
          "addiction risk",
        ],
      },
    },
    {
      categoryName: "Neurological - Cognitive Dysfunction",
      categoryDescription:
        "Brain fog, memory issues, and cognitive decline affecting mental performance",
      systemFocus: "neurological",
      diagnosticWeight: 2.2,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "brain fog",
          "memory problems",
          "difficulty concentrating",
          "word-finding issues",
        ],
        secondary: [
          "mental fatigue",
          "slow processing",
          "learning difficulties",
          "executive function problems",
        ],
        timing:
          "symptoms may worsen with stress, inflammation, or blood sugar fluctuations",
        duration: "cognitive symptoms can be episodic or persistent",
      },
      rootCauseIndicators: {
        causes: [
          "neuroinflammation",
          "blood sugar dysregulation",
          "nutrient deficiencies",
          "toxin exposure",
          "sleep disorders",
        ],
        mechanisms: [
          "neuroinflammation",
          "oxidative stress",
          "mitochondrial dysfunction",
          "neurotransmitter imbalances",
        ],
        consequences: [
          "reduced productivity",
          "quality of life impact",
          "social isolation",
          "career limitations",
        ],
      },
    },

    // METABOLIC
    {
      categoryName: "Metabolic - Blood Sugar Dysregulation",
      categoryDescription:
        "Insulin resistance, reactive hypoglycemia, and glucose metabolism dysfunction",
      systemFocus: "metabolic",
      diagnosticWeight: 2.6,
      interventionPriority: 1,
      symptomPatterns: {
        primary: [
          "energy crashes",
          "sugar cravings",
          "difficulty losing weight",
          "hunger between meals",
        ],
        secondary: [
          "brain fog",
          "mood swings",
          "increased appetite",
          "fatigue after eating",
        ],
        timing:
          "symptoms related to meal timing, composition, and stress levels",
        duration: "energy crashes typically occur 1-3 hours after meals",
      },
      rootCauseIndicators: {
        causes: [
          "diet high in refined carbs",
          "stress",
          "sedentary lifestyle",
          "genetics",
          "sleep deprivation",
        ],
        mechanisms: [
          "insulin resistance",
          "pancreatic dysfunction",
          "cellular glucose uptake issues",
          "hormone disruption",
        ],
        consequences: [
          "type 2 diabetes risk",
          "cardiovascular disease",
          "metabolic syndrome",
          "cognitive decline",
        ],
      },
    },
    {
      categoryName: "Metabolic - Lipid Metabolism Dysfunction",
      categoryDescription:
        "Abnormal cholesterol and triglyceride metabolism affecting cardiovascular health",
      systemFocus: "metabolic",
      diagnosticWeight: 2.1,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "elevated cholesterol",
          "high triglycerides",
          "low HDL",
          "weight gain",
        ],
        secondary: [
          "fatigue",
          "poor exercise tolerance",
          "xanthomas",
          "family history",
        ],
        timing: "lipid abnormalities typically develop gradually over years",
        duration: "metabolic changes persist without intervention",
      },
      rootCauseIndicators: {
        causes: [
          "insulin resistance",
          "thyroid dysfunction",
          "genetic factors",
          "diet composition",
          "inflammation",
        ],
        mechanisms: [
          "HMG-CoA reductase activity",
          "lipoprotein metabolism",
          "receptor function",
          "enzyme activity",
        ],
        consequences: [
          "cardiovascular disease",
          "stroke risk",
          "peripheral artery disease",
          "cognitive decline",
        ],
      },
    },

    // IMMUNE SYSTEM
    {
      categoryName: "Immune - Recurrent Infections",
      categoryDescription:
        "Frequent or prolonged infections indicating immune system dysfunction",
      systemFocus: "immune",
      diagnosticWeight: 2.3,
      interventionPriority: 2,
      symptomPatterns: {
        primary: [
          "frequent colds",
          "slow healing",
          "chronic infections",
          "antibiotic resistance",
        ],
        secondary: [
          "fatigue",
          "swollen glands",
          "poor vaccine response",
          "oral thrush",
        ],
        timing: "infections occur more frequently than 4-6 times per year",
        duration: "infections last longer than typical (>10-14 days for viral)",
      },
      rootCauseIndicators: {
        causes: [
          "nutrient deficiencies",
          "chronic stress",
          "gut dysbiosis",
          "toxin exposure",
          "genetic factors",
        ],
        mechanisms: [
          "immune cell dysfunction",
          "antibody production issues",
          "complement system problems",
          "barrier function",
        ],
        consequences: [
          "chronic illness",
          "antibiotic resistance",
          "organ damage",
          "quality of life impact",
        ],
      },
    },
  ];

  // Clear existing data before seeding (optional - remove in production)
  console.log("🧹 Clearing existing assessment categories...");
  await prisma.assessmentQuestionCategory.deleteMany({});
  await prisma.assessmentCategory.deleteMany({});

  // Insert assessment categories
  let successCount = 0;
  let errorCount = 0;

  for (const category of categories) {
    try {
      await prisma.assessmentCategory.create({
        data: {
          categoryName: category.categoryName,
          categoryDescription: category.categoryDescription,
          systemFocus: category.systemFocus,
          diagnosticWeight: category.diagnosticWeight,
          interventionPriority: category.interventionPriority,
          symptomPatterns: category.symptomPatterns,
          rootCauseIndicators: category.rootCauseIndicators,
        },
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Error seeding ${category.categoryName}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Assessment categories seeded successfully!`);
  console.log(`   - Successfully created: ${successCount} categories`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(
    `   - Systems covered: ${[
      ...new Set(categories.map((c) => c.systemFocus)),
    ].join(", ")}`
  );
  console.log(
    `   - Total patterns: ${categories.reduce(
      (total, c) =>
        total +
        (c.symptomPatterns.primary?.length || 0) +
        (c.symptomPatterns.secondary?.length || 0),
      0
    )}`
  );

  return { successCount, errorCount, totalCategories: categories.length };
}

// Export default for standalone execution
export default async function main() {
  try {
    await seedAssessmentCategories();
  } catch (error) {
    console.error("❌ Error seeding assessment categories:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log("🎉 Assessment categories seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Assessment categories seeding failed:", error);
      process.exit(1);
    });
}
