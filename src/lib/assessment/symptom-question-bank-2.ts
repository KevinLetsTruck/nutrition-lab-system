import { SymptomQuestion, SEVERITY_SCALE, FREQUENCY_SCALE } from './symptom-question-bank';

export const SYMPTOM_QUESTION_BANK_PART2: Record<string, Record<string, SymptomQuestion[]>> = {
  // PART 4: NEUROLOGICAL & COGNITIVE (25 questions)
  neuroCognitive: {
    brainFunction: [
      {
        id: 'brain_fog_daily',
        text: 'Do you experience brain fog or mental cloudiness?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'brainFunction'
      },
      {
        id: 'memory_short_term',
        text: 'How is your short-term memory (forgetting why you walked into a room, etc.)?',
        type: 'scale',
        options: [
          { value: 0, label: 'Excellent', description: 'Sharp memory' },
          { value: 1, label: 'Occasional lapses', description: 'Normal forgetfulness' },
          { value: 2, label: 'Frequent forgetfulness', description: 'Concerning to me' },
          { value: 3, label: 'Severe issues', description: 'Affecting daily life' }
        ],
        category: 'neuroCognitive',
        subcategory: 'brainFunction'
      },
      {
        id: 'concentration_focus',
        text: 'How is your ability to concentrate and focus?',
        type: 'scale',
        options: [
          { value: 0, label: 'Excellent focus', description: 'Can concentrate for hours' },
          { value: 1, label: 'Good with occasional drift', description: 'Normal distractibility' },
          { value: 2, label: 'Difficulty focusing', description: 'Easily distracted' },
          { value: 3, label: 'Cannot focus', description: 'Mind constantly wanders' }
        ],
        category: 'neuroCognitive',
        subcategory: 'brainFunction',
        truckDriverContext: 'Critical for safe driving on long hauls'
      },
      {
        id: 'word_finding_difficulty',
        text: 'Do you have trouble finding the right words when speaking?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'brainFunction'
      },
      {
        id: 'mental_fatigue_speed',
        text: 'How quickly do you experience mental fatigue?',
        type: 'scale',
        options: [
          { value: 0, label: 'Rarely', description: 'Can think clearly all day' },
          { value: 1, label: 'After several hours', description: 'Normal mental fatigue' },
          { value: 2, label: 'Within 1-2 hours', description: 'Quick mental exhaustion' },
          { value: 3, label: 'Almost immediately', description: 'Cannot sustain mental effort' }
        ],
        category: 'neuroCognitive',
        subcategory: 'brainFunction'
      },
      {
        id: 'decision_making_difficulty',
        text: 'Do you have trouble making decisions (even simple ones)?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'brainFunction'
      },
      {
        id: 'mental_clarity_time_of_day',
        text: 'When is your mental clarity best?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Consistent throughout day' },
          { value: 1, label: 'Morning - then declines' },
          { value: 2, label: 'Afternoon/evening only' },
          { value: 3, label: 'Never clear-headed' }
        ],
        category: 'neuroCognitive',
        subcategory: 'brainFunction'
      }
    ],
    
    moodAnxiety: [
      {
        id: 'mood_stability',
        text: 'How stable is your mood throughout the day?',
        type: 'scale',
        options: [
          { value: 0, label: 'Very stable', description: 'Consistent mood' },
          { value: 1, label: 'Minor fluctuations', description: 'Normal variation' },
          { value: 2, label: 'Noticeable swings', description: 'Ups and downs' },
          { value: 3, label: 'Extreme swings', description: 'Unpredictable moods' }
        ],
        category: 'neuroCognitive',
        subcategory: 'moodAnxiety'
      },
      {
        id: 'anxiety_levels',
        text: 'Rate your typical anxiety levels:',
        type: 'scale',
        options: [
          { value: 0, label: 'No anxiety', description: 'Calm and relaxed' },
          { value: 1, label: 'Mild anxiety', description: 'Manageable worry' },
          { value: 2, label: 'Moderate anxiety', description: 'Frequent worry/tension' },
          { value: 3, label: 'Severe anxiety', description: 'Constant worry/panic' }
        ],
        category: 'neuroCognitive',
        subcategory: 'moodAnxiety'
      },
      {
        id: 'depression_symptoms',
        text: 'Do you experience feelings of depression or hopelessness?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'moodAnxiety'
      },
      {
        id: 'irritability_anger',
        text: 'How easily do you become irritable or angry?',
        type: 'scale',
        options: [
          { value: 0, label: 'Rarely', description: 'Very patient' },
          { value: 1, label: 'Sometimes', description: 'Normal irritability' },
          { value: 2, label: 'Often', description: 'Quick to anger' },
          { value: 3, label: 'Constantly', description: 'Always on edge' }
        ],
        category: 'neuroCognitive',
        subcategory: 'moodAnxiety'
      },
      {
        id: 'panic_attacks',
        text: 'Do you experience panic attacks or sudden intense fear?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'moodAnxiety'
      },
      {
        id: 'social_anxiety',
        text: 'Do you feel anxious in social situations?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'moodAnxiety',
        truckDriverContext: 'May affect interactions at truck stops, deliveries'
      }
    ],
    
    neurologicalSymptoms: [
      {
        id: 'headache_frequency',
        text: 'How often do you experience headaches?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'headache_severity',
        text: 'When you have headaches, how severe are they?',
        type: 'scale',
        options: [
          { value: 0, label: 'No headaches' },
          { value: 1, label: 'Mild - can work through them' },
          { value: 2, label: 'Moderate - need to rest' },
          { value: 3, label: 'Severe - debilitating' }
        ],
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'migraine_symptoms',
        text: 'Do you experience migraines with vision changes, nausea, or light sensitivity?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'numbness_tingling',
        text: 'Do you experience numbness or tingling in hands, feet, or face?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'balance_coordination',
        text: 'Do you have problems with balance or coordination?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'tremors_shaking',
        text: 'Do you experience tremors or involuntary shaking?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'vision_changes',
        text: 'Do you experience blurred vision or other vision changes?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms',
        truckDriverContext: 'Critical safety concern for driving'
      },
      {
        id: 'light_sensitivity',
        text: 'Are you sensitive to bright lights?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'sound_sensitivity',
        text: 'Are you sensitive to sounds that don\'t bother others?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'smell_sensitivity',
        text: 'Are you sensitive to smells (perfumes, chemicals, etc.)?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      },
      {
        id: 'muscle_twitching',
        text: 'Do you experience muscle twitching or spasms?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'neuroCognitive',
        subcategory: 'neurologicalSymptoms'
      }
    ]
  },

  // PART 5: IMMUNE & INFLAMMATORY (20 questions)
  immuneInflammatory: {
    immuneFunction: [
      {
        id: 'infection_frequency',
        text: 'How often do you get colds, flu, or other infections?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Rarely (less than 1x/year)' },
          { value: 1, label: '1-2 times per year' },
          { value: 2, label: '3-4 times per year' },
          { value: 3, label: 'More than 4 times per year' }
        ],
        category: 'immuneInflammatory',
        subcategory: 'immuneFunction'
      },
      {
        id: 'infection_recovery',
        text: 'How long does it take you to recover from infections?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Quick recovery (3-5 days)' },
          { value: 1, label: 'Normal recovery (1 week)' },
          { value: 2, label: 'Slow recovery (2+ weeks)' },
          { value: 3, label: 'Very slow (weeks to months)' }
        ],
        category: 'immuneInflammatory',
        subcategory: 'immuneFunction'
      },
      {
        id: 'lymph_node_swelling',
        text: 'Do you get swollen lymph nodes (neck, armpits, groin)?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'immuneFunction'
      },
      {
        id: 'wound_healing',
        text: 'How well do cuts and wounds heal?',
        type: 'scale',
        options: [
          { value: 0, label: 'Heal quickly', description: 'Normal healing' },
          { value: 1, label: 'Slightly slow', description: 'Take a bit longer' },
          { value: 2, label: 'Very slow', description: 'Noticeable delay' },
          { value: 3, label: 'Poor healing', description: 'Wounds stay open' }
        ],
        category: 'immuneInflammatory',
        subcategory: 'immuneFunction'
      },
      {
        id: 'autoimmune_symptoms',
        text: 'Do you have any diagnosed autoimmune conditions?',
        type: 'binary',
        options: [
          { value: 0, label: 'No' },
          { value: 3, label: 'Yes' }
        ],
        category: 'immuneInflammatory',
        subcategory: 'immuneFunction'
      }
    ],
    
    inflammation: [
      {
        id: 'joint_pain_inflammation',
        text: 'Do you experience joint pain, stiffness, or swelling?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'inflammation'
      },
      {
        id: 'morning_stiffness',
        text: 'How long does morning stiffness last?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'No morning stiffness' },
          { value: 1, label: 'Less than 30 minutes' },
          { value: 2, label: '30-60 minutes' },
          { value: 3, label: 'More than 1 hour' }
        ],
        category: 'immuneInflammatory',
        subcategory: 'inflammation'
      },
      {
        id: 'muscle_pain_widespread',
        text: 'Do you have widespread muscle pain or tenderness?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'inflammation'
      },
      {
        id: 'body_temperature_inflammation',
        text: 'Do you often feel like you have a low-grade fever?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'inflammation'
      },
      {
        id: 'redness_heat_swelling',
        text: 'Do you notice areas of redness, heat, or swelling on your body?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'inflammation'
      }
    ],
    
    allergicResponses: [
      {
        id: 'seasonal_allergies',
        text: 'Do you have seasonal allergies (hay fever)?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'allergicResponses'
      },
      {
        id: 'food_reactions',
        text: 'Do you have immediate reactions to foods (hives, swelling, difficulty breathing)?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'allergicResponses'
      },
      {
        id: 'environmental_sensitivities',
        text: 'Do you react to dust, mold, or pet dander?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'allergicResponses'
      },
      {
        id: 'hives_rashes',
        text: 'Do you get unexplained hives or rashes?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'allergicResponses'
      },
      {
        id: 'itchy_eyes_nose',
        text: 'Do you experience itchy, watery eyes or runny nose?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'allergicResponses'
      }
    ],
    
    skinIssues: [
      {
        id: 'eczema_psoriasis',
        text: 'Do you have eczema, psoriasis, or other chronic skin conditions?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'skinIssues'
      },
      {
        id: 'acne_breakouts',
        text: 'Do you experience acne or skin breakouts?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'skinIssues'
      },
      {
        id: 'dry_flaky_skin',
        text: 'Is your skin excessively dry, flaky, or itchy?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'skinIssues'
      },
      {
        id: 'skin_bruising',
        text: 'Do you bruise easily?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'skinIssues'
      },
      {
        id: 'skin_healing',
        text: 'Does your skin heal slowly or scar easily?',
        type: 'scale',
        options: SEVERITY_SCALE,
        category: 'immuneInflammatory',
        subcategory: 'skinIssues'
      }
    ]
  }
};