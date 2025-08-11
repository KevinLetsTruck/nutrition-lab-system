// Based on Institute for Functional Medicine (IFM) and Chris Kresser Institute standards

export interface RangeSet {
  conventional: [number, number]
  functional: [number, number]
  optimal: [number, number]
  critical?: {
    low: number
    high: number
  }
  units: string[]
  interpretation: {
    low: string
    optimal: string
    high: string
  }
  truckDriverConcerns?: {
    dotImpact?: string
    careerRisk?: string
    interventionPriority?: 'urgent' | 'high' | 'medium' | 'low'
  }
}

export const FUNCTIONAL_MEDICINE_RANGES: Record<string, RangeSet> = {
  // METABOLIC PANEL
  glucose: {
    conventional: [70, 99],
    functional: [83, 99], 
    optimal: [85, 95],
    critical: { low: 60, high: 140 },
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Hypoglycemia risk - energy crashes, brain fog, irritability',
      optimal: 'Stable energy, clear thinking, good metabolic health',
      high: 'Insulin resistance developing - increased diabetes risk'
    },
    truckDriverConcerns: {
      dotImpact: 'Values >140 mg/dL may require DOT diabetes evaluation',
      careerRisk: 'Diabetes diagnosis could impact CDL qualification',
      interventionPriority: 'high'
    }
  },

  bun: {
    conventional: [7, 20],
    functional: [12, 20],
    optimal: [13, 18],
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Possible protein deficiency, liver dysfunction, or overhydration',
      optimal: 'Good protein metabolism and kidney function',
      high: 'Kidney stress, dehydration, or high protein intake'
    },
    truckDriverConcerns: {
      dotImpact: 'Elevated BUN may indicate kidney issues requiring monitoring',
      interventionPriority: 'medium'
    }
  },

  creatinine: {
    conventional: [0.7, 1.3],
    functional: [0.8, 1.2],
    optimal: [0.9, 1.1],
    critical: { high: 1.5 },
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Possible muscle wasting or low protein intake',
      optimal: 'Healthy kidney function and muscle mass',
      high: 'Kidney dysfunction or excessive muscle breakdown'
    },
    truckDriverConcerns: {
      dotImpact: 'Elevated creatinine may trigger kidney function evaluation',
      careerRisk: 'Kidney disease could disqualify from driving',
      interventionPriority: 'high'
    }
  },

  // LIPID PANEL
  totalcholesterol: {
    conventional: [100, 199],
    functional: [160, 200],
    optimal: [170, 200],
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Possible hormone deficiency, malabsorption, or liver issues',
      optimal: 'Good hormone production and cellular membrane health',
      high: 'Cardiovascular risk if combined with inflammation'
    },
    truckDriverConcerns: {
      dotImpact: 'Values >240 mg/dL may require cardiovascular evaluation',
      interventionPriority: 'medium'
    }
  },

  hdl: {
    conventional: [40, 60],
    functional: [59, 100],
    optimal: [70, 85],
    critical: { low: 35 },
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Increased cardiovascular risk, insulin resistance likely',
      optimal: 'Excellent cardiovascular protection',
      high: 'Generally protective, but investigate if >100'
    },
    truckDriverConcerns: {
      dotImpact: 'Low HDL increases cardiovascular risk assessment',
      careerRisk: 'Part of metabolic syndrome evaluation',
      interventionPriority: 'high'
    }
  },

  ldl: {
    conventional: [0, 99],
    functional: [0, 100],
    optimal: [70, 100],
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Good if achieved naturally, concerning if too low (<70)',
      optimal: 'Good cardiovascular risk profile',
      high: 'Cardiovascular risk, especially with inflammation'
    },
    truckDriverConcerns: {
      dotImpact: 'Elevated LDL part of cardiovascular risk assessment',
      interventionPriority: 'medium'
    }
  },

  triglycerides: {
    conventional: [0, 149],
    functional: [0, 100],
    optimal: [50, 90],
    critical: { high: 200 },
    units: ['mg/dL', 'mg/dl'],
    interpretation: {
      low: 'Good if eating adequate fats, concerning if severely low',
      optimal: 'Excellent metabolic health and insulin sensitivity',
      high: 'Insulin resistance, increased cardiovascular risk'
    },
    truckDriverConcerns: {
      dotImpact: 'Elevated triglycerides may trigger diabetes screening',
      careerRisk: 'Part of metabolic syndrome that could affect DOT certification',
      interventionPriority: 'high'
    }
  },

  // THYROID PANEL
  tsh: {
    conventional: [0.4, 4.0],
    functional: [1.8, 3.0],
    optimal: [2.0, 2.5],
    units: ['mIU/mL', 'miu/ml', 'mU/L'],
    interpretation: {
      low: 'Possible hyperthyroidism - anxiety, heart palpitations, weight loss',
      optimal: 'Good thyroid regulation and energy production',
      high: 'Hypothyroidism - fatigue, weight gain, brain fog, depression'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe thyroid dysfunction could affect driving safety',
      careerRisk: 'Untreated thyroid issues may impact alertness and reaction time',
      interventionPriority: 'high'
    }
  },

  freet4: {
    conventional: [0.8, 1.8],
    functional: [1.0, 1.5],
    optimal: [1.1, 1.4],
    units: ['ng/dL', 'ng/dl'],
    interpretation: {
      low: 'Hypothyroid symptoms - fatigue, cold intolerance, brain fog',
      optimal: 'Good thyroid hormone production',
      high: 'Hyperthyroid symptoms - anxiety, palpitations, insomnia'
    },
    truckDriverConcerns: {
      interventionPriority: 'high'
    }
  },

  freet3: {
    conventional: [2.3, 4.2],
    functional: [3.0, 4.0],
    optimal: [3.2, 3.8],
    units: ['pg/mL', 'pg/ml'],
    interpretation: {
      low: 'Poor thyroid hormone conversion - fatigue, depression, brain fog',
      optimal: 'Excellent cellular energy production',
      high: 'Hyperthyroid symptoms - anxiety, rapid heart rate'
    },
    truckDriverConcerns: {
      interventionPriority: 'high'
    }
  },

  // VITAMINS & MINERALS
  vitamind: {
    conventional: [30, 100],
    functional: [50, 80],
    optimal: [60, 70],
    critical: { low: 20 },
    units: ['ng/mL', 'ng/ml'],
    interpretation: {
      low: 'Immune dysfunction, bone health issues, depression risk',
      optimal: 'Strong immune function, good mood, healthy bones',
      high: 'Possible toxicity if >100, but rare from sun exposure'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe deficiency could contribute to mood disorders',
      careerRisk: 'Depression/anxiety could affect driving qualification',
      interventionPriority: 'medium'
    }
  },

  vitaminb12: {
    conventional: [200, 900],
    functional: [500, 1000],
    optimal: [700, 900],
    critical: { low: 300 },
    units: ['pg/mL', 'pg/ml'],
    interpretation: {
      low: 'Fatigue, brain fog, depression, peripheral neuropathy risk',
      optimal: 'Good energy, clear thinking, healthy nerves',
      high: 'Generally safe, but investigate if >1000'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe deficiency could cause neuropathy affecting driving',
      careerRisk: 'Peripheral neuropathy could disqualify from driving',
      interventionPriority: 'high'
    }
  },

  folate: {
    conventional: [2.7, 17.0],
    functional: [7.0, 15.0],
    optimal: [10.0, 15.0],
    critical: { low: 3.0 },
    units: ['ng/mL', 'ng/ml'],
    interpretation: {
      low: 'Fatigue, depression, increased cardiovascular risk',
      optimal: 'Good energy, mood stability, cardiovascular health',
      high: 'Generally safe, but investigate if >20'
    },
    truckDriverConcerns: {
      interventionPriority: 'medium'
    }
  },

  iron: {
    conventional: [60, 170],
    functional: [85, 130],
    optimal: [100, 130],
    units: ['µg/dL', 'ug/dl', 'mcg/dl'],
    interpretation: {
      low: 'Iron deficiency - fatigue, weakness, poor concentration',
      optimal: 'Good oxygen transport and energy production',
      high: 'Iron overload risk - oxidative stress and organ damage'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe iron deficiency could affect driving alertness',
      interventionPriority: 'medium'
    }
  },

  ferritin: {
    conventional: [15, 150],
    functional: [30, 100],
    optimal: [50, 100],
    units: ['ng/mL', 'ng/ml', 'µg/L', 'mcg/l'],
    interpretation: {
      low: 'Iron deficiency - fatigue, restless legs, poor immunity',
      optimal: 'Good iron stores and energy levels',
      high: 'Inflammation or iron overload - increased disease risk'
    },
    truckDriverConcerns: {
      interventionPriority: 'medium'
    }
  },

  // INFLAMMATORY MARKERS
  crp: {
    conventional: [0, 3.0],
    functional: [0, 1.0],
    optimal: [0, 0.5],
    critical: { high: 10.0 },
    units: ['mg/L', 'mg/l', 'mg/dL'],
    interpretation: {
      low: 'Minimal inflammation, good cardiovascular health',
      optimal: 'Low inflammation, reduced disease risk',
      high: 'Systemic inflammation - increased disease risk'
    },
    truckDriverConcerns: {
      dotImpact: 'Elevated CRP indicates cardiovascular risk',
      careerRisk: 'Chronic inflammation accelerates aging and disease',
      interventionPriority: 'medium'
    }
  },

  esr: {
    conventional: [0, 30],
    functional: [0, 10],
    optimal: [0, 5],
    units: ['mm/hr', 'mm/h'],
    interpretation: {
      low: 'Minimal inflammation, good health status',
      optimal: 'Low inflammation, excellent health',
      high: 'Inflammation or infection present'
    },
    truckDriverConcerns: {
      interventionPriority: 'medium'
    }
  },

  // COMPLETE BLOOD COUNT
  wbc: {
    conventional: [4.0, 10.8],
    functional: [5.5, 7.5],
    optimal: [6.0, 7.0],
    units: ['K/uL', 'k/ul', '10^3/ul'],
    interpretation: {
      low: 'Immune suppression, increased infection risk',
      optimal: 'Strong immune function',
      high: 'Infection, inflammation, or immune overactivity'
    },
    truckDriverConcerns: {
      interventionPriority: 'medium'
    }
  },

  rbc: {
    conventional: [4.2, 5.4],
    functional: [4.2, 4.9],
    optimal: [4.4, 4.8],
    units: ['M/uL', 'm/ul', '10^6/ul'],
    interpretation: {
      low: 'Anemia - fatigue, weakness, poor oxygen delivery',
      optimal: 'Good oxygen carrying capacity',
      high: 'Blood thickening - cardiovascular risk'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe anemia could affect driving alertness',
      interventionPriority: 'medium'
    }
  },

  hemoglobin: {
    conventional: [12.0, 15.5],
    functional: [13.5, 15.0],
    optimal: [14.0, 15.0],
    critical: { low: 10.0 },
    units: ['g/dL', 'g/dl'],
    interpretation: {
      low: 'Anemia - fatigue, weakness, shortness of breath',
      optimal: 'Excellent oxygen transport',
      high: 'Blood thickening or dehydration'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe anemia may disqualify from driving',
      careerRisk: 'Chronic fatigue affects driving safety',
      interventionPriority: 'high'
    }
  },

  hematocrit: {
    conventional: [36.0, 46.0],
    functional: [40.0, 44.0],
    optimal: [41.0, 44.0],
    units: ['%', 'percent'],
    interpretation: {
      low: 'Anemia - reduced oxygen carrying capacity',
      optimal: 'Good blood oxygen levels',
      high: 'Blood thickening - stroke risk'
    },
    truckDriverConcerns: {
      interventionPriority: 'medium'
    }
  },

  platelets: {
    conventional: [150, 450],
    functional: [175, 400],
    optimal: [200, 350],
    critical: { low: 100, high: 500 },
    units: ['K/uL', 'k/ul', '10^3/ul'],
    interpretation: {
      low: 'Bleeding risk, poor clotting function',
      optimal: 'Good clotting and healing capacity',
      high: 'Clotting risk - heart attack, stroke danger'
    },
    truckDriverConcerns: {
      dotImpact: 'Severe platelet disorders could disqualify from driving',
      interventionPriority: 'medium'
    }
  }
}

// Truck Driver Specific Risk Factors
export const TRUCK_DRIVER_RISK_MULTIPLIERS = {
  sedentaryLifestyle: 1.2,
  circadianDisruption: 1.3,
  chronicStress: 1.15,
  limitedFoodAccess: 1.1,
  environmentalToxins: 1.1
}

// DOT Medical Disqualifying Conditions
export const DOT_CRITICAL_VALUES = {
  glucose: { threshold: 140, condition: 'Diabetes requiring insulin' },
  bloodPressure: { systolic: 140, diastolic: 90, condition: 'Hypertension' },
  creatinine: { threshold: 1.5, condition: 'Kidney disease' },
  hemoglobin: { low: 10, condition: 'Severe anemia' }
}
