/**
 * FNTP Master Clinical Recommendation System - Supplement Database
 * Kevin Rutherford, FNTP - Truck Driver Health Optimization
 *
 * Implements strict hierarchy: LetsTruck.com → Biotics Research → Fullscript
 * Maximum 4 supplements per phase - MANDATORY LIMIT
 */

export interface SupplementProduct {
  id: string;
  name: string;
  brand: string;
  source: "letstruck" | "biotics" | "fullscript";
  url?: string;
  basePrice?: number;
  strengthOptions: string[];
  defaultStrength: string;
  dosageOptions: string[];
  defaultDosage: string;
  timing: string[];
  defaultTiming: string;
  truckerInstructions: string;
  purposes: string[];
  interactions?: string[];
  contraindications?: string[];
  notes?: string;
}

export interface ProtocolSupplement {
  productId: string;
  product: SupplementProduct;
  dosage: string;
  timing: string;
  duration: string;
  purpose: string;
  priority: 1 | 2 | 3 | 4; // Max 4 per phase
  truckerInstructions: string;
  educationPoints: string[];
  monitoringNotes?: string[];
}

/**
 * MANDATORY LETSTRUCK.COM PRODUCTS - ALWAYS PRIORITIZED
 */
export const LETSTRUCK_PRIORITY_PRODUCTS: SupplementProduct[] = [
  {
    id: "letstruck-algae-omega3",
    name: "Algae Oil DHA Omega-3s",
    brand: "LetsTruck",
    source: "letstruck",
    url: "https://store.letstruck.com/products/algae-oil-dha-omega-3s",
    basePrice: 39.99,
    strengthOptions: ["500mg DHA per softgel"],
    defaultStrength: "500mg DHA",
    dosageOptions: [
      "1 softgel daily",
      "2 softgels daily",
      "2 softgels 2x daily",
      "3 softgels 2x daily",
    ],
    defaultDosage: "2 softgels 2x daily",
    timing: ["with breakfast", "with dinner", "with largest meal"],
    defaultTiming: "with breakfast and dinner",
    truckerInstructions:
      "Keep in cooler if possible, room temperature stable for weeks. Take with fat-containing meals.",
    purposes: [
      "Reduce systemic inflammation",
      "Support brain function and mental clarity",
      "Cardiovascular protection",
      "Joint health and mobility",
      "Mood stability",
    ],
    notes: "Superior to fish oil - no contaminants, sustainable, vegetarian",
  },
  {
    id: "letstruck-lyte-balance",
    name: "Lyte Balance (Magnesium/Potassium/Sodium)",
    brand: "LetsTruck",
    source: "letstruck",
    url: "https://store.letstruck.com/products/lyte-balance-magnesium-potassium-sodium",
    basePrice: 34.99,
    strengthOptions: ["Per scoop: 400mg Mg, 300mg K, 150mg Na"],
    defaultStrength: "Full scoop",
    dosageOptions: [
      "1/2 scoop daily",
      "1 scoop daily",
      "1 scoop 2x daily",
      "2 scoops daily",
    ],
    defaultDosage: "1 scoop 2x daily",
    timing: [
      "morning in water",
      "afternoon in water",
      "before bed",
      "during/after physical activity",
    ],
    defaultTiming: "morning and afternoon in water",
    truckerInstructions:
      "Mix in 16-20oz water, drink throughout drive. Essential for truckers due to electrolyte loss.",
    purposes: [
      "Prevent and relieve muscle cramps",
      "Support proper hydration",
      "Maintain electrolyte balance",
      "Support blood pressure regulation",
      "Improve sleep quality (magnesium)",
      "Reduce stress and anxiety",
    ],
    notes:
      "Critical for truck drivers - addresses cramping, dehydration, and magnesium deficiency",
  },
  {
    id: "letstruck-bio-d-mulsion",
    name: "Bio-D-Mulsion",
    brand: "LetsTruck",
    source: "letstruck",
    url: "https://store.letstruck.com/products/bio-dk-mulsion",
    basePrice: 24.99,
    strengthOptions: ["1000 IU per drop"],
    defaultStrength: "1000 IU per drop",
    dosageOptions: [
      "2 drops (2000 IU)",
      "4 drops (4000 IU)",
      "6 drops (6000 IU)",
      "8 drops (8000 IU)",
    ],
    defaultDosage: "4 drops (4000 IU)",
    timing: ["with breakfast", "with largest meal", "with fat-containing meal"],
    defaultTiming: "with breakfast",
    truckerInstructions:
      "Drops can be taken directly or mixed in small amount of food. Stable at room temperature.",
    purposes: [
      "Immune system support",
      "Bone health maintenance",
      "Mood and energy support",
      "Hormone balance support",
      "Calcium absorption",
    ],
    notes:
      "Liquid form for superior absorption, critical for drivers with limited sun exposure",
  },
  {
    id: "letstruck-cardio-miracle",
    name: "Cardio Miracle",
    brand: "LetsTruck",
    source: "letstruck",
    url: "https://store.letstruck.com/products/cardio-miracle",
    basePrice: 79.99,
    strengthOptions: ["Complete nitric oxide support formula"],
    defaultStrength: "Full scoop",
    dosageOptions: ["1/2 scoop daily", "1 scoop daily", "1 scoop 2x daily"],
    defaultDosage: "1 scoop 2x daily",
    timing: ["morning on empty stomach", "evening before bed", "between meals"],
    defaultTiming: "morning and evening",
    truckerInstructions:
      "Mix in 8-12oz water, drink 30 minutes before or 2 hours after meals for best absorption.",
    purposes: [
      "Blood pressure support and regulation",
      "Nitric oxide production",
      "Cardiovascular health optimization",
      "Circulation improvement",
      "Energy and endurance support",
    ],
    notes:
      "Comprehensive cardiovascular support - critical for DOT medical compliance",
  },
  {
    id: "letstruck-atrantil",
    name: "Atrantil",
    brand: "LetsTruck",
    source: "letstruck",
    url: "https://store.letstruck.com/products/atrantil",
    basePrice: 49.99,
    strengthOptions: ["Standard strength"],
    defaultStrength: "Standard",
    dosageOptions: ["2 caps daily", "2 caps 2x daily", "2 caps 3x daily"],
    defaultDosage: "2 caps 3x daily",
    timing: ["with meals", "before meals"],
    defaultTiming: "with meals",
    truckerInstructions:
      "Take with meals. Start with loading dose (2 caps 3x daily) for 2 weeks, then maintenance (2 caps daily).",
    purposes: [
      "Bloating and gas relief",
      "SIBO (Small Intestinal Bacterial Overgrowth) support",
      "Digestive comfort",
      "Methane reduction",
      "Gut health restoration",
    ],
    notes:
      "Specifically for bloating and SIBO - common in truckers due to irregular eating and stress",
  },
  {
    id: "letstruck-atrantil-pro",
    name: "Atrantil Pro",
    brand: "LetsTruck",
    source: "letstruck",
    url: "https://store.letstruck.com/products/atrantil-pro",
    basePrice: 69.99,
    strengthOptions: ["Professional strength - 2x regular"],
    defaultStrength: "Professional",
    dosageOptions: ["2 caps daily", "2 caps 2x daily"],
    defaultDosage: "2 caps 2x daily",
    timing: ["with meals"],
    defaultTiming: "with meals",
    truckerInstructions:
      "Professional strength for severe cases. Take with meals for 2-3 months, then reassess.",
    purposes: [
      "Severe bloating and SIBO",
      "Resistant digestive issues",
      "Methane and hydrogen sulfide SIBO",
      "Advanced gut restoration",
    ],
    notes:
      "For severe digestive dysfunction - use when standard Atrantil insufficient",
  },
];

/**
 * BIOTICS RESEARCH PRODUCTS - SECOND PRIORITY
 */
export const BIOTICS_PRODUCTS: SupplementProduct[] = [
  {
    id: "biotics-hydro-zyme",
    name: "Hydro-Zyme",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["Betaine HCl 500mg with Pepsin"],
    defaultStrength: "Standard",
    dosageOptions: ["1 tablet", "2 tablets", "3 tablets", "4 tablets"],
    defaultDosage: "1 tablet with protein meals",
    timing: ["with protein meals", "beginning of meals"],
    defaultTiming: "with protein meals",
    truckerInstructions:
      "Start with 1 tablet, increase by 1 every 2 days until warmth felt, then back off by 1 tablet.",
    purposes: [
      "Improve protein digestion",
      "Support stomach acid production",
      "Enhance nutrient absorption",
      "Reduce bloating after meals",
    ],
    notes:
      "Essential for truckers with poor digestion from stress and irregular eating",
  },
  {
    id: "biotics-intenzyme-forte",
    name: "Intenzyme Forte",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["Proteolytic enzyme complex"],
    defaultStrength: "Standard",
    dosageOptions: ["1 tablet", "2 tablets", "3 tablets"],
    defaultDosage: "2 tablets between meals",
    timing: ["between meals on empty stomach", "with meals for digestion"],
    defaultTiming: "between meals for inflammation",
    truckerInstructions:
      "For inflammation: take on empty stomach. For digestion: take with meals.",
    purposes: [
      "Reduce systemic inflammation",
      "Support tissue repair",
      "Improve protein digestion",
      "Joint health support",
    ],
    notes:
      "Dual purpose - anti-inflammatory between meals, digestive with meals",
  },
  {
    id: "biotics-adhs",
    name: "ADHS",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["Adrenal glandular with herbs"],
    defaultStrength: "Standard",
    dosageOptions: ["1 tablet", "2 tablets", "3 tablets"],
    defaultDosage: "2 tablets with breakfast",
    timing: ["with breakfast", "morning only"],
    defaultTiming: "with breakfast",
    truckerInstructions:
      "Take in morning only - can be stimulating. Support for energy and stress resilience.",
    purposes: [
      "Adrenal gland support",
      "Energy and stamina",
      "Stress resilience",
      "Cortisol balance",
      "Blood sugar stability",
    ],
    notes:
      "Critical for truckers dealing with irregular schedules and chronic stress",
  },
  {
    id: "biotics-glucobalance",
    name: "Glucobalance",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["Chromium, vanadium, and herbs"],
    defaultStrength: "Standard",
    dosageOptions: ["1 capsule", "2 capsules", "3 capsules"],
    defaultDosage: "2 capsules with largest meal",
    timing: ["with largest meal", "with carbohydrate meals"],
    defaultTiming: "with largest meal",
    truckerInstructions:
      "Take with meal containing carbohydrates. Helps stabilize blood sugar from road food.",
    purposes: [
      "Blood sugar stabilization",
      "Insulin sensitivity support",
      "Carbohydrate metabolism",
      "Weight management support",
    ],
    notes:
      "Essential for metabolic support in truckers with poor dietary access",
  },
  {
    id: "biotics-coq-zyme-100",
    name: "CoQ-Zyme 100 Plus",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["100mg CoQ10 emulsified"],
    defaultStrength: "100mg",
    dosageOptions: ["1 capsule daily", "2 capsules daily", "3 capsules daily"],
    defaultDosage: "1 capsule daily",
    timing: ["with food", "with fat-containing meal"],
    defaultTiming: "with breakfast",
    truckerInstructions:
      "Take with fat-containing meal for absorption. Essential for heart health.",
    purposes: [
      "Cardiovascular support",
      "Cellular energy production",
      "Antioxidant protection",
      "Blood pressure support",
    ],
    notes: "Critical for truckers, especially those on statin medications",
  },
  {
    id: "biotics-fc-cidal",
    name: "FC-Cidal",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["Herbal antimicrobial"],
    defaultStrength: "Standard",
    dosageOptions: ["1 capsule", "2 capsules", "3 capsules"],
    defaultDosage: "1 capsule 2x daily, build to 2 capsules",
    timing: ["with meals", "between meals"],
    defaultTiming: "with meals",
    truckerInstructions:
      "Start slowly, build dose. Used with Dysbiocide for SIBO protocol.",
    purposes: [
      "Antimicrobial support",
      "SIBO treatment",
      "Gut dysbiosis",
      "Digestive infections",
    ],
    contraindications: ["Pregnancy", "nursing"],
    notes: "Part of comprehensive SIBO protocol - use with Dysbiocide",
  },
  {
    id: "biotics-dysbiocide",
    name: "Dysbiocide",
    brand: "Biotics Research",
    source: "biotics",
    strengthOptions: ["Herbal antimicrobial complex"],
    defaultStrength: "Standard",
    dosageOptions: ["1 capsule", "2 capsules", "3 capsules"],
    defaultDosage: "1 capsule 2x daily, build to 2 capsules",
    timing: ["with meals", "between meals"],
    defaultTiming: "with meals",
    truckerInstructions:
      "Start slowly, build dose. Used with FC-Cidal for SIBO protocol.",
    purposes: [
      "Antimicrobial support",
      "SIBO treatment",
      "Gut dysbiosis",
      "Yeast overgrowth",
    ],
    contraindications: ["Pregnancy", "nursing"],
    notes: "Part of comprehensive SIBO protocol - use with FC-Cidal",
  },
];

/**
 * FULLSCRIPT CATALOG - THIRD PRIORITY
 */
export const FULLSCRIPT_PRODUCTS: SupplementProduct[] = [
  {
    id: "fullscript-berberine-hcl",
    name: "Berberine HCl",
    brand: "Thorne",
    source: "fullscript",
    strengthOptions: ["500mg per capsule"],
    defaultStrength: "500mg",
    dosageOptions: ["500mg daily", "500mg 2x daily", "500mg 3x daily"],
    defaultDosage: "500mg 2x daily",
    timing: ["with meals", "before meals"],
    defaultTiming: "with meals",
    truckerInstructions:
      "Take with meals to reduce GI upset. Monitor blood sugar if diabetic.",
    purposes: [
      "Blood sugar regulation",
      "Insulin sensitivity",
      "Cholesterol support",
      "Weight management",
      "Antimicrobial properties",
    ],
    interactions: ["Diabetes medications", "Blood thinners"],
    notes: "Natural metformin alternative - excellent for metabolic syndrome",
  },
  {
    id: "fullscript-phosphatidylserine",
    name: "Phosphatidylserine",
    brand: "Integrative Therapeutics",
    source: "fullscript",
    strengthOptions: ["100mg", "200mg"],
    defaultStrength: "200mg",
    dosageOptions: ["100mg daily", "200mg daily", "200mg 2x daily"],
    defaultDosage: "200mg before bed",
    timing: ["before bed", "evening"],
    defaultTiming: "before bed",
    truckerInstructions:
      "Take 1-2 hours before sleep to help lower evening cortisol.",
    purposes: [
      "Cortisol regulation",
      "Sleep quality improvement",
      "Stress management",
      "Cognitive support",
      "Memory enhancement",
    ],
    notes: "Excellent for truckers with high stress and poor sleep patterns",
  },
  {
    id: "fullscript-l-glutamine",
    name: "L-Glutamine Powder",
    brand: "Pure Encapsulations",
    source: "fullscript",
    strengthOptions: ["5g per scoop"],
    defaultStrength: "5g",
    dosageOptions: ["5g daily", "5g 2x daily", "10g 2x daily"],
    defaultDosage: "5g 2x daily",
    timing: ["empty stomach", "between meals", "before bed"],
    defaultTiming: "between meals",
    truckerInstructions:
      "Mix in water, drink on empty stomach for gut healing.",
    purposes: [
      "Gut lining repair",
      "Intestinal permeability support",
      "Immune system support",
      "Recovery support",
      "Muscle preservation",
    ],
    notes:
      "Essential for leaky gut repair in truckers with poor diet and stress",
  },
];

/**
 * SUPPLEMENT HIERARCHY SELECTOR
 */
export class SupplementSelector {
  private static letstruck = LETSTRUCK_PRIORITY_PRODUCTS;
  private static biotics = BIOTICS_PRODUCTS;
  private static fullscript = FULLSCRIPT_PRODUCTS;

  static findProduct(
    searchTerm: string,
    purpose?: string
  ): SupplementProduct | null {
    const normalizedSearch = searchTerm.toLowerCase();

    // First priority: LetsTruck products
    let product = this.letstruck.find(
      (p) =>
        p.name.toLowerCase().includes(normalizedSearch) ||
        p.purposes.some((purpose) =>
          purpose.toLowerCase().includes(normalizedSearch)
        )
    );

    if (product) return product;

    // Second priority: Biotics Research
    product = this.biotics.find(
      (p) =>
        p.name.toLowerCase().includes(normalizedSearch) ||
        p.purposes.some((purpose) =>
          purpose.toLowerCase().includes(normalizedSearch)
        )
    );

    if (product) return product;

    // Third priority: Fullscript
    product = this.fullscript.find(
      (p) =>
        p.name.toLowerCase().includes(normalizedSearch) ||
        p.purposes.some((purpose) =>
          purpose.toLowerCase().includes(normalizedSearch)
        )
    );

    return product || null;
  }

  static getProductById(id: string): SupplementProduct | null {
    const allProducts = [
      ...this.letstruck,
      ...this.biotics,
      ...this.fullscript,
    ];
    return allProducts.find((p) => p.id === id) || null;
  }

  static getOmega3Product(): SupplementProduct {
    return this.letstruck.find((p) => p.id === "letstruck-algae-omega3")!;
  }

  static getElectrolyteProduct(): SupplementProduct {
    return this.letstruck.find((p) => p.id === "letstruck-lyte-balance")!;
  }

  static getVitaminDProduct(): SupplementProduct {
    return this.letstruck.find((p) => p.id === "letstruck-bio-d-mulsion")!;
  }

  static getCardioProduct(): SupplementProduct {
    return this.letstruck.find((p) => p.id === "letstruck-cardio-miracle")!;
  }

  static getSIBOProduct(severe: boolean = false): SupplementProduct {
    return this.letstruck.find(
      (p) => p.id === (severe ? "letstruck-atrantil-pro" : "letstruck-atrantil")
    )!;
  }

  static getAllProducts(): SupplementProduct[] {
    return [...this.letstruck, ...this.biotics, ...this.fullscript];
  }

  static getProductsBySource(
    source: "letstruck" | "biotics" | "fullscript"
  ): SupplementProduct[] {
    switch (source) {
      case "letstruck":
        return [...this.letstruck];
      case "biotics":
        return [...this.biotics];
      case "fullscript":
        return [...this.fullscript];
      default:
        return [];
    }
  }
}

/**
 * EDUCATION CONTENT FOR EACH SUPPLEMENT
 */
export const SUPPLEMENT_EDUCATION = {
  "letstruck-algae-omega3": {
    whatItDoes:
      "Reduces inflammation throughout your body, supports brain function, and helps your heart work better. Think of it as WD-40 for your cells.",
    whyYouNeedIt:
      "Your inflammation markers are elevated and your omega-3 levels are likely low based on your diet. This contributes to joint pain, brain fog, and cardiovascular risk.",
    howToTake:
      "Always take with food containing fat for best absorption. Can keep in truck - stable at room temperature for weeks.",
    timeline: {
      "1-2 weeks": "May notice less dry skin",
      "3-4 weeks": "Joint stiffness improving",
      "5-8 weeks": "Better mental clarity, mood stability",
      "9-12 weeks": "Cardiovascular improvements visible in labs",
    },
    signsWorking: [
      "Less morning stiffness",
      "Improved mental clarity",
      "Better mood stability",
      "Skin less dry",
      "Joints feel more flexible",
    ],
    adjustments:
      "If fishy burps: freeze capsules, take with larger meal. If loose stools: reduce to 1 capsule 2x daily.",
    safety:
      "Safe with most medications. If on blood thinners, notify prescriber. No concerning side effects expected.",
  },
  "letstruck-lyte-balance": {
    whatItDoes:
      "Provides essential electrolytes (magnesium, potassium, sodium) your body loses through stress, sweating, and poor sleep.",
    whyYouNeedIt:
      "Truckers commonly develop electrolyte imbalances leading to muscle cramps, poor sleep, anxiety, and blood pressure issues.",
    howToTake:
      "Mix in 16-20oz water, sip throughout drive. Essential for preventing cramps and supporting cardiovascular health.",
    timeline: {
      "1-3 days": "Reduced muscle cramps",
      "1-2 weeks": "Better sleep quality",
      "2-4 weeks": "Improved energy and mood",
      "4-8 weeks": "Blood pressure improvements",
    },
    signsWorking: [
      "No muscle cramps",
      "Sleeping better",
      "More energy",
      "Less anxiety",
      "Better hydration",
    ],
    adjustments:
      "Start with 1/2 scoop if sensitive stomach. Increase as tolerated. Can take more during hot weather or long drives.",
    safety:
      "Very safe. If on blood pressure medication, monitor levels as they may improve.",
  },
};
