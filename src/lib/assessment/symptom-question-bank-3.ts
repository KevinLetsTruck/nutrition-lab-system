import { SymptomQuestion, SEVERITY_SCALE, FREQUENCY_SCALE } from './symptom-question-bank';

export const SYMPTOM_QUESTION_BANK_PART3: Record<string, Record<string, SymptomQuestion[]>> = {
  // PART 6: HORMONAL (25 questions)
  hormonal: {
    thyroid: [
      {
        id: 'hair_loss_thinning',
        text: 'Are you experiencing hair loss or thinning?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'thyroid'
      },
      {
        id: 'eyebrow_thinning',
        text: 'Have you lost the outer third of your eyebrows?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 3, label: 'Yes' }
        ],
        category: 'hormonal',
        subcategory: 'thyroid'
      },
      {
        id: 'cold_intolerance',
        text: 'Are you intolerant to cold temperatures?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'thyroid'
      },
      {
        id: 'heat_intolerance',
        text: 'Are you intolerant to hot temperatures?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'thyroid'
      },
      {
        id: 'voice_hoarseness',
        text: 'Has your voice become hoarse or deeper?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'thyroid'
      },
      {
        id: 'dry_skin_hair',
        text: 'Is your skin or hair unusually dry?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'thyroid'
      },
      {
        id: 'brittle_nails',
        text: 'Are your nails brittle or ridged?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'thyroid'
      }
    ],
    
    adrenal: [
      {
        id: 'fatigue_pattern',
        text: 'When is your fatigue worst?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'No significant fatigue' },
          { value: 1, label: 'Afternoon only' },
          { value: 2, label: 'Morning and evening' },
          { value: 3, label: 'All day fatigue' }
        ],
        category: 'hormonal',
        subcategory: 'adrenal'
      },
      {
        id: 'stress_tolerance',
        text: 'How well do you handle stress?',
        type: 'scale',
        options: [
          { value: 0, label: 'Very well', description: 'Thrive under pressure' },
          { value: 1, label: 'Fairly well', description: 'Normal stress response' },
          { value: 2, label: 'Poorly', description: 'Easily overwhelmed' },
          { value: 3, label: 'Cannot handle stress', description: 'Shut down with stress' }
        ],
        category: 'hormonal',
        subcategory: 'adrenal'
      },
      {
        id: 'salt_cravings',
        text: 'Do you crave salty foods?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'adrenal'
      },
      {
        id: 'blood_pressure_low',
        text: 'Do you have low blood pressure or feel faint when standing?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'hormonal',
        subcategory: 'adrenal'
      },
      {
        id: 'recovery_from_illness',
        text: 'How long does it take to recover from stress or illness?',
        type: 'scale',
        options: [
          { value: 0, label: 'Quick recovery', description: 'Bounce back fast' },
          { value: 1, label: 'Normal recovery', description: 'Few days to a week' },
          { value: 2, label: 'Slow recovery', description: 'Weeks to recover' },
          { value: 3, label: 'Very slow recovery', description: 'Months to recover' }
        ],
        category: 'hormonal',
        subcategory: 'adrenal'
      },
      {
        id: 'exercise_recovery',
        text: 'How do you feel after exercise?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Energized and refreshed' },
          { value: 1, label: 'Tired but recover quickly' },
          { value: 2, label: 'Exhausted for hours' },
          { value: 3, label: 'Wiped out for days' }
        ],
        category: 'hormonal',
        subcategory: 'adrenal'
      }
    ],
    
    sexHormones: [
      {
        id: 'libido_changes',
        text: 'How is your sex drive/libido?',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal/healthy', description: 'Satisfied with libido' },
          { value: 1, label: 'Slightly decreased', description: 'Minor reduction' },
          { value: 2, label: 'Significantly decreased', description: 'Major reduction' },
          { value: 3, label: 'No sex drive', description: 'Complete loss' }
        ],
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'erectile_dysfunction',
        text: '(Men) Do you experience erectile dysfunction?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'menstrual_irregularity',
        text: '(Women) Are your periods irregular, heavy, or painful?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'pms_symptoms',
        text: '(Women) Do you experience PMS symptoms?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'hot_flashes',
        text: 'Do you experience hot flashes or night sweats?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'breast_tenderness',
        text: 'Do you experience breast tenderness or swelling?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'facial_hair_women',
        text: '(Women) Do you have excess facial or body hair?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'muscle_mass_loss',
        text: 'Have you noticed loss of muscle mass or strength?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'body_composition_changes',
        text: 'Have you noticed changes in body fat distribution?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'bone_density_concerns',
        text: 'Do you have concerns about bone density or have you had fractures?',
        type: 'binary',
        options: [
          { value: 0, label: 'No concerns' },
          { value: 3, label: 'Yes, concerns or fractures' }
        ],
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'mood_hormone_related',
        text: 'Do your moods change with your hormonal cycle?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      },
      {
        id: 'water_retention_hormonal',
        text: 'Do you retain water at certain times of the month?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'hormonal',
        subcategory: 'sexHormones'
      }
    ]
  },

  // PART 7: DETOXIFICATION (15 questions)
  detoxification: {
    liverFunction: [
      {
        id: 'alcohol_tolerance',
        text: 'How well do you tolerate alcohol?',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal tolerance', description: 'No issues' },
          { value: 1, label: 'Reduced tolerance', description: 'Get drunk easily' },
          { value: 2, label: 'Poor tolerance', description: 'Feel sick from small amounts' },
          { value: 3, label: 'Cannot tolerate', description: 'React badly to any alcohol' }
        ],
        category: 'detoxification',
        subcategory: 'liverFunction'
      },
      {
        id: 'caffeine_sensitivity',
        text: 'How sensitive are you to caffeine?',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal', description: 'Can drink coffee anytime' },
          { value: 1, label: 'Slightly sensitive', description: 'Avoid after 2pm' },
          { value: 2, label: 'Very sensitive', description: 'One cup affects me all day' },
          { value: 3, label: 'Extremely sensitive', description: 'Cannot tolerate any caffeine' }
        ],
        category: 'detoxification',
        subcategory: 'liverFunction'
      },
      {
        id: 'medication_sensitivity',
        text: 'Are you sensitive to medications (need lower doses)?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'liverFunction'
      },
      {
        id: 'chemical_sensitivity',
        text: 'Do you react to perfumes, cleaning products, or exhaust fumes?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'liverFunction',
        truckDriverContext: 'Consider diesel fumes and industrial chemical exposure'
      },
      {
        id: 'hangover_severity',
        text: 'If you drink alcohol, how severe are your hangovers?',
        type: 'scale',
        options: [
          { value: 0, label: 'Don\'t drink or no hangovers' },
          { value: 1, label: 'Mild hangovers' },
          { value: 2, label: 'Moderate hangovers' },
          { value: 3, label: 'Severe hangovers from small amounts' }
        ],
        category: 'detoxification',
        subcategory: 'liverFunction'
      }
    ],
    
    detoxSymptoms: [
      {
        id: 'body_odor_changes',
        text: 'Have you noticed changes in body odor?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'detoxSymptoms'
      },
      {
        id: 'bad_breath',
        text: 'Do you have persistent bad breath despite good oral hygiene?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'detoxSymptoms'
      },
      {
        id: 'metallic_taste',
        text: 'Do you experience a metallic taste in your mouth?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'detoxification',
        subcategory: 'detoxSymptoms'
      },
      {
        id: 'dark_circles_eyes',
        text: 'Do you have dark circles under your eyes?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'detoxSymptoms'
      },
      {
        id: 'skin_yellowing',
        text: 'Have you noticed yellowing of skin or eyes?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 3, label: 'Yes' }
        ],
        category: 'detoxification',
        subcategory: 'detoxSymptoms',
        aiContext: 'Red flag symptom requiring immediate medical attention'
      }
    ],
    
    eliminationPathways: [
      {
        id: 'sweating_ability',
        text: 'How easily do you sweat?',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal sweating', description: 'Sweat with heat/exercise' },
          { value: 1, label: 'Reduced sweating', description: 'Takes effort to sweat' },
          { value: 2, label: 'Minimal sweating', description: 'Rarely sweat' },
          { value: 3, label: 'Cannot sweat', description: 'Never sweat even when hot' }
        ],
        category: 'detoxification',
        subcategory: 'eliminationPathways'
      },
      {
        id: 'urine_color',
        text: 'What color is your urine typically?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Pale yellow' },
          { value: 1, label: 'Yellow' },
          { value: 2, label: 'Dark yellow' },
          { value: 3, label: 'Brown or very dark' }
        ],
        category: 'detoxification',
        subcategory: 'eliminationPathways'
      },
      {
        id: 'bowel_movement_detox',
        text: 'How often do you have complete bowel movements?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: '1-2 times daily' },
          { value: 1, label: 'Once daily' },
          { value: 2, label: 'Every other day' },
          { value: 3, label: 'Less than every other day' }
        ],
        category: 'detoxification',
        subcategory: 'eliminationPathways'
      },
      {
        id: 'lymphatic_congestion',
        text: 'Do you experience swelling or puffiness, especially in the morning?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'eliminationPathways'
      },
      {
        id: 'sinus_congestion',
        text: 'Do you have chronic sinus congestion or post-nasal drip?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'detoxification',
        subcategory: 'eliminationPathways'
      }
    ]
  },

  // PART 8: PAIN & MUSCULOSKELETAL (20 questions)
  painMusculoskeletal: {
    chronicPain: [
      {
        id: 'back_pain_location',
        text: 'Do you experience back pain?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'No back pain' },
          { value: 1, label: 'Upper back/neck' },
          { value: 2, label: 'Mid back' },
          { value: 3, label: 'Lower back' }
        ],
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain',
        truckDriverContext: 'Common issue from prolonged sitting and vibration'
      },
      {
        id: 'neck_shoulder_pain',
        text: 'Do you have neck or shoulder pain/tension?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain'
      },
      {
        id: 'hip_pain',
        text: 'Do you experience hip pain or stiffness?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain'
      },
      {
        id: 'knee_pain',
        text: 'Do you have knee pain?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain'
      },
      {
        id: 'foot_ankle_pain',
        text: 'Do you experience foot or ankle pain?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain'
      },
      {
        id: 'pain_worse_time',
        text: 'When is your pain typically worst?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'No significant pain' },
          { value: 1, label: 'Morning' },
          { value: 2, label: 'Evening' },
          { value: 3, label: 'Constant throughout day' }
        ],
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain'
      },
      {
        id: 'pain_weather_sensitive',
        text: 'Does weather affect your pain levels?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'chronicPain'
      }
    ],
    
    muscleFunction: [
      {
        id: 'muscle_cramps',
        text: 'Do you experience muscle cramps?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'muscleFunction'
      },
      {
        id: 'muscle_weakness',
        text: 'Do you experience muscle weakness?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'muscleFunction'
      },
      {
        id: 'muscle_tension',
        text: 'Do you carry tension in specific muscle groups?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'muscleFunction'
      },
      {
        id: 'restless_legs',
        text: 'Do you experience restless legs, especially at night?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'muscleFunction'
      },
      {
        id: 'muscle_recovery',
        text: 'How quickly do your muscles recover after activity?',
        type: 'scale',
        options: [
          { value: 0, label: 'Quick recovery', description: 'Next day feel fine' },
          { value: 1, label: 'Normal recovery', description: '1-2 days' },
          { value: 2, label: 'Slow recovery', description: '3-4 days' },
          { value: 3, label: 'Very slow recovery', description: 'Week or more' }
        ],
        category: 'painMusculoskeletal',
        subcategory: 'muscleFunction'
      }
    ],
    
    structuralIssues: [
      {
        id: 'posture_problems',
        text: 'Do you have posture problems?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'structuralIssues'
      },
      {
        id: 'scoliosis_curvature',
        text: 'Do you have scoliosis or spinal curvature?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 2, label: 'Yes' }
        ],
        category: 'painMusculoskeletal',
        subcategory: 'structuralIssues'
      },
      {
        id: 'disc_problems',
        text: 'Have you been diagnosed with disc problems?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 3, label: 'Yes' }
        ],
        category: 'painMusculoskeletal',
        subcategory: 'structuralIssues'
      },
      {
        id: 'arthritis_diagnosis',
        text: 'Have you been diagnosed with arthritis?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 3, label: 'Yes' }
        ],
        category: 'painMusculoskeletal',
        subcategory: 'structuralIssues'
      },
      {
        id: 'joint_instability',
        text: 'Do you have joints that feel unstable or "give out"?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'structuralIssues'
      },
      {
        id: 'repetitive_strain',
        text: 'Do you have pain from repetitive motions?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'painMusculoskeletal',
        subcategory: 'structuralIssues',
        truckDriverContext: 'Consider steering, shifting, loading/unloading activities'
      }
    ]
  },

  // PART 9: DRIVER-SPECIFIC SYMPTOMS (15 questions)
  driverSpecific: {
    sittingRelated: [
      {
        id: 'hemorrhoids',
        text: 'Do you experience hemorrhoids?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'sittingRelated'
      },
      {
        id: 'tailbone_pain',
        text: 'Do you have tailbone (coccyx) pain?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'sittingRelated'
      },
      {
        id: 'sciatica_symptoms',
        text: 'Do you experience sciatica (pain radiating down leg)?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'sittingRelated'
      },
      {
        id: 'leg_circulation',
        text: 'Do your legs feel heavy, swollen, or have poor circulation?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'sittingRelated'
      },
      {
        id: 'deep_vein_concerns',
        text: 'Have you had concerns about blood clots or DVT?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 3, label: 'Yes' }
        ],
        category: 'driverSpecific',
        subcategory: 'sittingRelated'
      }
    ],
    
    vibrationExposure: [
      {
        id: 'whole_body_vibration',
        text: 'Do you feel the effects of truck vibration in your body?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'vibrationExposure'
      },
      {
        id: 'hand_arm_vibration',
        text: 'Do you experience numbness or tingling from steering wheel vibration?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'driverSpecific',
        subcategory: 'vibrationExposure'
      },
      {
        id: 'vibration_fatigue',
        text: 'Does truck vibration contribute to your fatigue?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'vibrationExposure'
      }
    ],
    
    scheduleRelated: [
      {
        id: 'shift_work_symptoms',
        text: 'Do irregular schedules affect your health?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      },
      {
        id: 'time_zone_issues',
        text: 'Do you struggle with time zone changes?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      },
      {
        id: 'meal_timing_disruption',
        text: 'How disrupted are your meal times due to driving?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      },
      {
        id: 'bathroom_access_issues',
        text: 'Do limited bathroom breaks cause you problems?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      },
      {
        id: 'sleep_location_quality',
        text: 'How does sleeping in the truck affect your sleep quality?',
        type: 'scale',
        options: [
          { value: 0, label: 'Sleep fine in truck' },
          { value: 1, label: 'Slightly worse' },
          { value: 2, label: 'Much worse' },
          { value: 3, label: 'Cannot get good sleep in truck' }
        ],
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      },
      {
        id: 'home_time_recovery',
        text: 'How many days of home time do you need to feel recovered?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: '1 day is enough' },
          { value: 1, label: '2-3 days' },
          { value: 2, label: '4-5 days' },
          { value: 3, label: 'Never feel fully recovered' }
        ],
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      },
      {
        id: 'stress_deadlines',
        text: 'How much stress do delivery deadlines cause you?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'driverSpecific',
        subcategory: 'scheduleRelated'
      }
    ]
  }
};