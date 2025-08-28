import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LabRange {
  testName: string;
  testCode?: string;
  category: string;
  standardRangeMin?: number;
  standardRangeMax?: number;
  fmOptimalMin: number;
  fmOptimalMax: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit: string;
  genderSpecific?: boolean;
  ageDependent?: boolean;
  description?: string;
  clinicalSignificance?: string;
}

export async function seedFunctionalMedicineLabRanges() {
  console.log("🔬 Seeding Functional Medicine lab ranges...");

  const labRanges: LabRange[] = [
    // INFLAMMATION MARKERS
    {
      testName: "C-Reactive Protein (CRP)",
      testCode: "CRP",
      category: "inflammation",
      standardRangeMin: 0,
      standardRangeMax: 3.0,
      fmOptimalMin: 0,
      fmOptimalMax: 1.0,
      criticalLow: undefined,
      criticalHigh: 10.0,
      unit: "mg/L",
      description: "Marker of systemic inflammation",
      clinicalSignificance:
        "Elevated CRP indicates inflammation, infection, or tissue damage. FM optimal <1.0 for cardiovascular health and reduced inflammatory burden.",
    },
    {
      testName: "Erythrocyte Sedimentation Rate (ESR)",
      testCode: "ESR",
      category: "inflammation",
      standardRangeMin: 0,
      standardRangeMax: 20,
      fmOptimalMin: 0,
      fmOptimalMax: 10,
      criticalLow: undefined,
      criticalHigh: 50,
      unit: "mm/hr",
      description: "Non-specific marker of inflammation",
      clinicalSignificance:
        "Elevated ESR suggests inflammation, autoimmune conditions, or chronic disease. Low ESR indicates minimal inflammatory activity.",
    },
    {
      testName: "Fibrinogen",
      testCode: "FIBRINOGEN",
      category: "inflammation",
      standardRangeMin: 200,
      standardRangeMax: 400,
      fmOptimalMin: 250,
      fmOptimalMax: 350,
      criticalLow: 100,
      criticalHigh: 700,
      unit: "mg/dL",
      description: "Coagulation protein and inflammatory marker",
      clinicalSignificance:
        "Elevated fibrinogen increases cardiovascular risk and indicates chronic inflammation. Optimal levels support healthy coagulation.",
    },

    // THYROID FUNCTION
    {
      testName: "Thyroid Stimulating Hormone (TSH)",
      testCode: "TSH",
      category: "thyroid",
      standardRangeMin: 0.4,
      standardRangeMax: 4.0,
      fmOptimalMin: 0.5,
      fmOptimalMax: 2.0,
      criticalLow: 0.1,
      criticalHigh: 10.0,
      unit: "mIU/L",
      description: "Primary thyroid function marker",
      clinicalSignificance:
        "FM optimal 0.5-2.0 for optimal thyroid function, energy, and metabolism. Values >2.0 may indicate subclinical hypothyroidism.",
    },
    {
      testName: "Free T3",
      testCode: "FT3",
      category: "thyroid",
      standardRangeMin: 2.3,
      standardRangeMax: 4.2,
      fmOptimalMin: 3.0,
      fmOptimalMax: 4.0,
      criticalLow: 1.0,
      criticalHigh: 6.0,
      unit: "pg/mL",
      description: "Active thyroid hormone",
      clinicalSignificance:
        "Free T3 is the active form of thyroid hormone. Low levels indicate poor conversion or thyroid dysfunction. Optimal levels support energy and metabolism.",
    },
    {
      testName: "Free T4",
      testCode: "FT4",
      category: "thyroid",
      standardRangeMin: 0.8,
      standardRangeMax: 1.8,
      fmOptimalMin: 1.0,
      fmOptimalMax: 1.5,
      criticalLow: 0.4,
      criticalHigh: 3.0,
      unit: "ng/dL",
      description: "Thyroid prohormone",
      clinicalSignificance:
        "Free T4 converts to T3. Levels should be in upper half of range for optimal function and adequate T3 conversion.",
    },
    {
      testName: "Reverse T3",
      testCode: "rT3",
      category: "thyroid",
      standardRangeMin: 90,
      standardRangeMax: 350,
      fmOptimalMin: 90,
      fmOptimalMax: 250,
      criticalLow: undefined,
      criticalHigh: 500,
      unit: "pg/mL",
      description: "Inactive thyroid hormone",
      clinicalSignificance:
        "Elevated rT3 indicates stress, inflammation, or poor T4 to T3 conversion. High rT3 can block active T3 at cellular level.",
    },
    {
      testName: "Thyroid Peroxidase Antibodies (TPO)",
      testCode: "TPO",
      category: "thyroid",
      standardRangeMin: 0,
      standardRangeMax: 34,
      fmOptimalMin: 0,
      fmOptimalMax: 15,
      criticalLow: undefined,
      criticalHigh: 100,
      unit: "IU/mL",
      description: "Autoimmune thyroid marker",
      clinicalSignificance:
        "Elevated TPO indicates autoimmune thyroid disease (Hashimoto's). Early detection allows for intervention before significant damage.",
    },

    // METABOLIC MARKERS
    {
      testName: "Fasting Glucose",
      testCode: "FBG",
      category: "metabolic",
      standardRangeMin: 70,
      standardRangeMax: 99,
      fmOptimalMin: 75,
      fmOptimalMax: 85,
      criticalLow: 50,
      criticalHigh: 200,
      unit: "mg/dL",
      description: "Fasting blood sugar level",
      clinicalSignificance:
        "FM optimal 75-85 mg/dL for metabolic health and diabetes prevention. Values >85 indicate early insulin resistance.",
    },
    {
      testName: "Hemoglobin A1c (HbA1c)",
      testCode: "HBA1C",
      category: "metabolic",
      standardRangeMin: 4.0,
      standardRangeMax: 5.6,
      fmOptimalMin: 4.0,
      fmOptimalMax: 5.3,
      criticalLow: undefined,
      criticalHigh: 9.0,
      unit: "%",
      description: "3-month average blood sugar",
      clinicalSignificance:
        "HbA1c <5.3% indicates excellent long-term glucose control and reduced disease risk. Values >5.3% suggest metabolic dysfunction.",
    },
    {
      testName: "Fasting Insulin",
      testCode: "INSULIN",
      category: "metabolic",
      standardRangeMin: 2,
      standardRangeMax: 25,
      fmOptimalMin: 2,
      fmOptimalMax: 10,
      criticalLow: undefined,
      criticalHigh: 50,
      unit: "µIU/mL",
      description: "Fasting insulin level",
      clinicalSignificance:
        "Insulin <10 µIU/mL indicates good insulin sensitivity and metabolic health. Elevated levels suggest insulin resistance.",
    },
    {
      testName: "HOMA-IR",
      testCode: "HOMA_IR",
      category: "metabolic",
      standardRangeMin: undefined,
      standardRangeMax: undefined,
      fmOptimalMin: 0.5,
      fmOptimalMax: 1.5,
      criticalLow: undefined,
      criticalHigh: 5.0,
      unit: "index",
      description: "Insulin resistance index",
      clinicalSignificance:
        "HOMA-IR <1.5 indicates good insulin sensitivity. Values >2.5 suggest significant insulin resistance requiring intervention.",
    },

    // NUTRITIONAL MARKERS
    {
      testName: "Vitamin B12",
      testCode: "B12",
      category: "nutritional",
      standardRangeMin: 200,
      standardRangeMax: 900,
      fmOptimalMin: 500,
      fmOptimalMax: 800,
      criticalLow: 150,
      criticalHigh: 1500,
      unit: "pg/mL",
      description: "Essential B vitamin for neurological function",
      clinicalSignificance:
        "B12 >500 pg/mL supports optimal neurological function, energy, and methylation. Deficiency causes irreversible neurological damage.",
    },
    {
      testName: "Folate (Serum)",
      testCode: "FOLATE",
      category: "nutritional",
      standardRangeMin: 3.0,
      standardRangeMax: 17.0,
      fmOptimalMin: 15.0,
      fmOptimalMax: 25.0,
      criticalLow: 2.0,
      criticalHigh: undefined,
      unit: "ng/mL",
      description: "Essential B vitamin for DNA synthesis",
      clinicalSignificance:
        "Folate >15 ng/mL supports optimal methylation, mood, and cardiovascular health. Deficiency increases homocysteine and disease risk.",
    },
    {
      testName: "25-Hydroxyvitamin D",
      testCode: "VIT_D",
      category: "nutritional",
      standardRangeMin: 20,
      standardRangeMax: 50,
      fmOptimalMin: 50,
      fmOptimalMax: 80,
      criticalLow: 10,
      criticalHigh: 150,
      unit: "ng/mL",
      description: "Vitamin D storage form",
      clinicalSignificance:
        "Vitamin D 50-80 ng/mL supports immune function, bone health, and mood regulation. Deficiency increases autoimmune and cancer risk.",
    },
    {
      testName: "Magnesium (RBC)",
      testCode: "MG_RBC",
      category: "nutritional",
      standardRangeMin: 4.2,
      standardRangeMax: 6.8,
      fmOptimalMin: 5.5,
      fmOptimalMax: 6.5,
      criticalLow: 3.0,
      criticalHigh: undefined,
      unit: "mg/dL",
      description: "Intracellular magnesium levels",
      clinicalSignificance:
        "RBC magnesium >5.5 mg/dL indicates adequate cellular magnesium. Deficiency causes muscle cramps, anxiety, and cardiovascular issues.",
    },
    {
      testName: "Zinc (Serum)",
      testCode: "ZINC",
      category: "nutritional",
      standardRangeMin: 70,
      standardRangeMax: 120,
      fmOptimalMin: 90,
      fmOptimalMax: 110,
      criticalLow: 50,
      criticalHigh: 150,
      unit: "µg/dL",
      description: "Essential trace mineral",
      clinicalSignificance:
        "Zinc 90-110 µg/dL supports immune function, wound healing, and hormone production. Deficiency impairs immunity and taste.",
    },

    // CARDIOVASCULAR MARKERS
    {
      testName: "Total Cholesterol",
      testCode: "CHOL_TOTAL",
      category: "cardiovascular",
      standardRangeMin: 100,
      standardRangeMax: 199,
      fmOptimalMin: 160,
      fmOptimalMax: 220,
      criticalLow: undefined,
      criticalHigh: 300,
      unit: "mg/dL",
      description: "Total blood cholesterol",
      clinicalSignificance:
        "Total cholesterol 160-220 mg/dL supports hormone production and cell membrane health. Very low levels can impair hormone synthesis.",
    },
    {
      testName: "HDL Cholesterol",
      testCode: "HDL",
      category: "cardiovascular",
      standardRangeMin: 40,
      standardRangeMax: 100,
      fmOptimalMin: 60,
      fmOptimalMax: 100,
      criticalLow: 20,
      criticalHigh: undefined,
      unit: "mg/dL",
      description: "Good cholesterol",
      clinicalSignificance:
        "HDL >60 mg/dL provides cardiovascular protection and supports hormone transport. Low HDL increases heart disease risk.",
    },
    {
      testName: "LDL Cholesterol",
      testCode: "LDL",
      category: "cardiovascular",
      standardRangeMin: 0,
      standardRangeMax: 99,
      fmOptimalMin: 80,
      fmOptimalMax: 120,
      criticalLow: undefined,
      criticalHigh: 200,
      unit: "mg/dL",
      description: "Low-density lipoprotein cholesterol",
      clinicalSignificance:
        "LDL 80-120 mg/dL provides optimal cardiovascular protection while supporting cellular functions. Context matters more than absolute numbers.",
    },
    {
      testName: "Triglycerides",
      testCode: "TRIG",
      category: "cardiovascular",
      standardRangeMin: 0,
      standardRangeMax: 149,
      fmOptimalMin: 50,
      fmOptimalMax: 100,
      criticalLow: undefined,
      criticalHigh: 500,
      unit: "mg/dL",
      description: "Blood fats",
      clinicalSignificance:
        "Triglycerides <100 mg/dL indicate good metabolic health and cardiovascular risk reduction. Elevated levels suggest insulin resistance.",
    },
    {
      testName: "Lipoprotein(a)",
      testCode: "LPA",
      category: "cardiovascular",
      standardRangeMin: 0,
      standardRangeMax: 30,
      fmOptimalMin: 0,
      fmOptimalMax: 20,
      criticalLow: undefined,
      criticalHigh: 75,
      unit: "mg/dL",
      description: "Genetic cardiovascular risk marker",
      clinicalSignificance:
        "Lp(a) <20 mg/dL indicates low genetic cardiovascular risk. Elevated levels require aggressive risk factor modification.",
    },

    // LIVER FUNCTION
    {
      testName: "Alanine Aminotransferase (ALT)",
      testCode: "ALT",
      category: "liver",
      standardRangeMin: 7,
      standardRangeMax: 56,
      fmOptimalMin: 10,
      fmOptimalMax: 25,
      criticalLow: undefined,
      criticalHigh: 200,
      unit: "U/L",
      description: "Liver enzyme",
      clinicalSignificance:
        "ALT <25 U/L indicates optimal liver function and detoxification capacity. Elevated levels suggest liver stress or damage.",
    },
    {
      testName: "Aspartate Aminotransferase (AST)",
      testCode: "AST",
      category: "liver",
      standardRangeMin: 10,
      standardRangeMax: 40,
      fmOptimalMin: 15,
      fmOptimalMax: 30,
      criticalLow: undefined,
      criticalHigh: 150,
      unit: "U/L",
      description: "Liver and muscle enzyme",
      clinicalSignificance:
        "AST <30 U/L supports optimal liver function, low inflammation, and tissue health. Can be elevated from muscle damage.",
    },
    {
      testName: "Gamma-Glutamyl Transferase (GGT)",
      testCode: "GGT",
      category: "liver",
      standardRangeMin: 9,
      standardRangeMax: 48,
      fmOptimalMin: 10,
      fmOptimalMax: 25,
      criticalLow: undefined,
      criticalHigh: 100,
      unit: "U/L",
      description: "Liver detoxification enzyme",
      clinicalSignificance:
        "GGT <25 U/L indicates optimal detoxification capacity. Elevated levels suggest oxidative stress and impaired detox pathways.",
    },
    {
      testName: "Alkaline Phosphatase (ALP)",
      testCode: "ALP",
      category: "liver",
      standardRangeMin: 44,
      standardRangeMax: 147,
      fmOptimalMin: 70,
      fmOptimalMax: 100,
      criticalLow: undefined,
      criticalHigh: 250,
      unit: "U/L",
      description: "Liver and bone enzyme",
      clinicalSignificance:
        "ALP 70-100 U/L indicates healthy liver and bone metabolism. Low levels may suggest zinc or magnesium deficiency.",
    },

    // KIDNEY FUNCTION
    {
      testName: "Creatinine",
      testCode: "CREATININE",
      category: "kidney",
      standardRangeMin: 0.6,
      standardRangeMax: 1.2,
      fmOptimalMin: 0.8,
      fmOptimalMax: 1.1,
      criticalLow: undefined,
      criticalHigh: 3.0,
      unit: "mg/dL",
      description: "Kidney function marker",
      clinicalSignificance:
        "Creatinine 0.8-1.1 mg/dL indicates optimal kidney function and adequate muscle mass. Elevated levels suggest kidney dysfunction.",
    },
    {
      testName: "Blood Urea Nitrogen (BUN)",
      testCode: "BUN",
      category: "kidney",
      standardRangeMin: 7,
      standardRangeMax: 20,
      fmOptimalMin: 10,
      fmOptimalMax: 16,
      criticalLow: 5,
      criticalHigh: 50,
      unit: "mg/dL",
      description: "Protein metabolism and kidney function marker",
      clinicalSignificance:
        "BUN 10-16 mg/dL indicates balanced protein metabolism and good kidney function. Elevated levels suggest dehydration or kidney issues.",
    },

    // HORMONAL MARKERS
    {
      testName: "Cortisol (AM)",
      testCode: "CORTISOL_AM",
      category: "hormonal",
      standardRangeMin: 6.2,
      standardRangeMax: 19.4,
      fmOptimalMin: 12.0,
      fmOptimalMax: 18.0,
      criticalLow: 3.0,
      criticalHigh: 30.0,
      unit: "µg/dL",
      description: "Morning cortisol level",
      clinicalSignificance:
        "AM cortisol 12-18 µg/dL indicates healthy adrenal function and circadian rhythm. Low levels suggest adrenal fatigue.",
    },
    {
      testName: "DHEA-S",
      testCode: "DHEA_S",
      category: "hormonal",
      standardRangeMin: 95,
      standardRangeMax: 530,
      fmOptimalMin: 200,
      fmOptimalMax: 400,
      criticalLow: 50,
      criticalHigh: 800,
      unit: "µg/dL",
      description: "Adrenal hormone precursor",
      clinicalSignificance:
        "DHEA-S 200-400 µg/dL supports healthy aging, immune function, and stress resilience. Low levels indicate adrenal dysfunction.",
      ageDependent: true,
      genderSpecific: true,
    },
  ];

  // Clear existing data before seeding (optional - remove in production)
  console.log("🧹 Clearing existing lab ranges...");
  await prisma.functionalMedicineLabRange.deleteMany({});

  // Insert lab ranges
  let successCount = 0;
  let errorCount = 0;

  for (const range of labRanges) {
    try {
      await prisma.functionalMedicineLabRange.create({
        data: {
          testName: range.testName,
          testCode: range.testCode,
          category: range.category,
          standardRangeMin: range.standardRangeMin,
          standardRangeMax: range.standardRangeMax,
          fmOptimalMin: range.fmOptimalMin,
          fmOptimalMax: range.fmOptimalMax,
          criticalLow: range.criticalLow,
          criticalHigh: range.criticalHigh,
          unit: range.unit,
          genderSpecific: range.genderSpecific || false,
          ageDependent: range.ageDependent || false,
          description: range.description,
          clinicalSignificance: range.clinicalSignificance,
        },
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Error seeding ${range.testName}:`, error);
      errorCount++;
    }
  }

  console.log(`✅ Functional Medicine lab ranges seeded successfully!`);
  console.log(`   - Successfully created: ${successCount} lab ranges`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(
    `   - Categories: ${[...new Set(labRanges.map((r) => r.category))].join(
      ", "
    )}`
  );

  return { successCount, errorCount, totalRanges: labRanges.length };
}

// Export default for standalone execution
export default async function main() {
  try {
    await seedFunctionalMedicineLabRanges();
  } catch (error) {
    console.error("❌ Error seeding functional medicine lab ranges:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
