export interface SymptomQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'frequency' | 'binary';
  options: Array<{
    value: number | string;
    label: string;
    description?: string;
  }>;
  category?: string;
  subcategory?: string;
  aiContext?: string;
  truckDriverContext?: string;
}

// Standard severity scale for symptom questions
export const SEVERITY_SCALE = [
  { value: 0, label: 'Never/None', description: 'No issues' },
  { value: 1, label: 'Mild', description: 'Occasionally noticeable' },
  { value: 2, label: 'Moderate', description: 'Regularly affects me' },
  { value: 3, label: 'Severe', description: 'Significantly impacts life' }
];

// Standard frequency scale
export const FREQUENCY_SCALE = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely (1-2x/month)' },
  { value: 2, label: 'Sometimes (1-2x/week)' },
  { value: 3, label: 'Often (3+x/week or daily)' }
];

export const SYMPTOM_QUESTION_BANK: Record<string, Record<string, SymptomQuestion[]>> = {
  // PART 1: ANCESTRAL MISMATCH FOUNDATION (15 questions)
  ancestralMismatch: {
    circadianRhythm: [
      {
        id: 'light_exposure_morning',
        text: 'How much natural light do you get within 2 hours of waking?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: '30+ minutes outdoors' },
          { value: 1, label: '10-30 minutes outdoors' },
          { value: 2, label: 'Brief outdoor exposure' },
          { value: 3, label: 'No natural light exposure' }
        ],
        category: 'ancestralMismatch',
        subcategory: 'circadianRhythm'
      },
      {
        id: 'artificial_light_evening',
        text: 'How much artificial light are you exposed to after sunset?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Dim/red lights only' },
          { value: 1, label: 'Normal indoor lighting' },
          { value: 2, label: 'Bright lights, TV, devices' },
          { value: 3, label: 'Constant bright light exposure' }
        ],
        category: 'ancestralMismatch',
        subcategory: 'circadianRhythm'
      },
      {
        id: 'sleep_phone_location',
        text: 'Where is your phone when you sleep?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Different room, airplane mode' },
          { value: 1, label: 'Same room, airplane mode' },
          { value: 2, label: 'Within reach, normal mode' },
          { value: 3, label: 'Next to head, notifications on' }
        ],
        category: 'ancestralMismatch',
        subcategory: 'circadianRhythm',
        truckDriverContext: 'Consider both home sleep and sleeper cab arrangements'
      }
    ],
    
    movement: [
      {
        id: 'daily_movement_variety',
        text: 'How varied is your daily movement?',
        type: 'scale',
        options: [
          { value: 0, label: 'Very varied', description: 'Multiple movement patterns' },
          { value: 1, label: 'Somewhat varied', description: 'Some variety' },
          { value: 2, label: 'Limited variety', description: 'Mostly same movements' },
          { value: 3, label: 'No variety', description: 'Sit/drive only' }
        ],
        category: 'ancestralMismatch',
        subcategory: 'movement',
        truckDriverContext: 'Include loading/unloading, pre-trip inspections, and any exercise'
      }
    ]
  },

  // PART 2: DIGESTIVE DEEP DIVE (25 questions)
  digestive: {
    upperGI: [
      {
        id: 'appetite_patterns',
        text: 'Rate your appetite most days:',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal', description: 'Healthy hunger cues' },
          { value: 1, label: 'Slightly off', description: 'Occasional changes' },
          { value: 2, label: 'Poor appetite', description: 'Rarely hungry' },
          { value: 3, label: 'No appetite', description: 'Food sounds unappealing' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'feel_better_eating',
        text: 'Do you feel better or worse when eating?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Better - eating improves how I feel' },
          { value: 1, label: 'No change - neutral' },
          { value: 2, label: 'Worse - eating makes me uncomfortable' },
          { value: 3, label: 'Much worse - dread eating' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'burping_belching',
        text: 'How often do you burp or belch?',
        type: 'scale',
        options: [
          { value: 0, label: 'Rarely', description: 'Normal amounts' },
          { value: 1, label: 'Sometimes', description: 'Noticeable but not bothersome' },
          { value: 2, label: 'Frequently', description: 'Multiple times per meal' },
          { value: 3, label: 'Constantly', description: 'Excessive, embarrassing' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'bloating_immediate',
        text: 'Do you get bloated within 30 minutes of eating?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'No immediate bloating' },
          { value: 1, label: 'Rarely', description: 'Only with large meals' },
          { value: 2, label: 'Sometimes', description: 'With certain foods' },
          { value: 3, label: 'Always', description: 'Every time I eat' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'heartburn_reflux',
        text: 'How often do you experience heartburn or acid reflux?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'food_stuck_sensation',
        text: 'Does food ever feel "stuck" in your throat or chest?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'Food goes down easily' },
          { value: 1, label: 'Rarely', description: 'Only with dry foods' },
          { value: 2, label: 'Sometimes', description: 'Need water to help swallow' },
          { value: 3, label: 'Often', description: 'Frequent swallowing difficulty' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'digestive_aids_needed',
        text: 'Do you need antacids, digestive enzymes, or other aids?',
        type: 'frequency',
        options: [
          { value: 0, label: 'Never use them' },
          { value: 1, label: 'Occasionally' },
          { value: 2, label: 'Regularly with meals' },
          { value: 3, label: 'Can\'t eat without them' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      },
      {
        id: 'undigested_food_stool',
        text: 'Do you see undigested food in your stool?',
        type: 'frequency',
        options: [
          { value: 0, label: 'Never or very rarely' },
          { value: 1, label: 'Occasionally' },
          { value: 2, label: 'Regularly' },
          { value: 3, label: 'Always - food pieces clearly visible' }
        ],
        category: 'digestive',
        subcategory: 'upperGI'
      }
    ],
    
    siboIndicators: [
      {
        id: 'bloating_delayed',
        text: 'Do you get bloated 2-3 hours after eating?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'No delayed bloating' },
          { value: 1, label: 'Rarely', description: 'Only with certain foods' },
          { value: 2, label: 'Sometimes', description: 'Noticeable pattern' },
          { value: 3, label: 'Always', description: 'Predictable delayed bloating' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      },
      {
        id: 'fodmap_trigger_foods',
        text: 'Do you react poorly to beans, onions, garlic, or high-fiber foods?',
        type: 'scale',
        options: [
          { value: 0, label: 'No reaction', description: 'Tolerate these foods well' },
          { value: 1, label: 'Mild reaction', description: 'Some gas or mild discomfort' },
          { value: 2, label: 'Moderate reaction', description: 'Noticeable digestive upset' },
          { value: 3, label: 'Severe reaction', description: 'Avoid these foods completely' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      },
      {
        id: 'constipation_diarrhea_alternating',
        text: 'Do you alternate between constipation and diarrhea?',
        type: 'frequency',
        options: [
          { value: 0, label: 'No - consistent normal BMs' },
          { value: 1, label: 'Rarely - occasional variation' },
          { value: 2, label: 'Sometimes - noticeable pattern' },
          { value: 3, label: 'Constantly - unpredictable pattern' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      },
      {
        id: 'foul_smelling_gas',
        text: 'Is your gas unusually foul-smelling?',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal', description: 'Not particularly offensive' },
          { value: 1, label: 'Sometimes strong', description: 'Occasionally embarrassing' },
          { value: 2, label: 'Often foul', description: 'Regularly offensive' },
          { value: 3, label: 'Extremely foul', description: 'Clear the room' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      },
      {
        id: 'abdominal_distension',
        text: 'Where do you experience abdominal bloating/distension?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'No significant bloating' },
          { value: 1, label: 'Upper abdomen (below ribs)' },
          { value: 2, label: 'Lower abdomen (below belly button)' },
          { value: 3, label: 'Entire abdomen - belly gets visibly larger' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      },
      {
        id: 'probiotics_worsen',
        text: 'Do probiotics make your digestive symptoms worse?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Haven\'t tried probiotics' },
          { value: 1, label: 'Probiotics help me' },
          { value: 2, label: 'No change with probiotics' },
          { value: 3, label: 'Probiotics make me feel worse' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      },
      {
        id: 'antibiotic_history',
        text: 'How many courses of antibiotics have you taken in the last 5 years?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'None' },
          { value: 1, label: '1-2 courses' },
          { value: 2, label: '3-5 courses' },
          { value: 3, label: '6+ courses or long-term use' }
        ],
        category: 'digestive',
        subcategory: 'siboIndicators'
      }
    ],
    
    lowerGI: [
      {
        id: 'bowel_movement_frequency',
        text: 'How often do you have bowel movements?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: '1-2 times daily' },
          { value: 1, label: 'Every other day' },
          { value: 2, label: '2-3 times per week' },
          { value: 3, label: 'Less than 2 times per week' }
        ],
        category: 'digestive',
        subcategory: 'lowerGI'
      },
      {
        id: 'stool_consistency',
        text: 'What is your typical stool consistency?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Well-formed, easy to pass' },
          { value: 1, label: 'Somewhat hard or loose occasionally' },
          { value: 2, label: 'Regularly hard pellets or loose' },
          { value: 3, label: 'Very hard pellets or watery diarrhea' }
        ],
        category: 'digestive',
        subcategory: 'lowerGI'
      },
      {
        id: 'urgency_control',
        text: 'Do you experience urgency or difficulty controlling bowel movements?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'Full control, normal timing' },
          { value: 1, label: 'Rarely', description: 'Occasional urgency' },
          { value: 2, label: 'Sometimes', description: 'Plan activities around bathrooms' },
          { value: 3, label: 'Often', description: 'Affects daily activities/driving' }
        ],
        category: 'digestive',
        subcategory: 'lowerGI',
        truckDriverContext: 'This can significantly impact driving schedules and route planning'
      },
      {
        id: 'mucus_in_stool',
        text: 'Do you see mucus in your stool?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'digestive',
        subcategory: 'lowerGI'
      },
      {
        id: 'stool_color_changes',
        text: 'Do you notice unusual stool colors (very pale, very dark, or red)?',
        type: 'frequency',
        options: [
          { value: 0, label: 'Normal brown color' },
          { value: 1, label: 'Occasional variation' },
          { value: 2, label: 'Regular color changes' },
          { value: 3, label: 'Consistently abnormal color' }
        ],
        category: 'digestive',
        subcategory: 'lowerGI'
      }
    ],
    
    gutBrainConnection: [
      {
        id: 'brain_fog_after_eating',
        text: 'Do you experience brain fog or mental cloudiness after eating?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'Mental clarity unchanged' },
          { value: 1, label: 'Rarely', description: 'Only with large meals' },
          { value: 2, label: 'Sometimes', description: 'With certain foods' },
          { value: 3, label: 'Always', description: 'Every time I eat' }
        ],
        category: 'digestive',
        subcategory: 'gutBrainConnection'
      },
      {
        id: 'mood_changes_food',
        text: 'Do you notice mood changes after eating certain foods?',
        type: 'scale',
        options: [
          { value: 0, label: 'No connection', description: 'Food doesn\'t affect mood' },
          { value: 1, label: 'Subtle changes', description: 'Slight mood shifts' },
          { value: 2, label: 'Noticeable changes', description: 'Clear food-mood connection' },
          { value: 3, label: 'Dramatic changes', description: 'Avoid foods due to mood effects' }
        ],
        category: 'digestive',
        subcategory: 'gutBrainConnection'
      },
      {
        id: 'anxiety_gut_correlation',
        text: 'Do you notice a connection between anxiety/depression and digestive symptoms?',
        type: 'scale',
        options: [
          { value: 0, label: 'No connection', description: 'Separate issues' },
          { value: 1, label: 'Slight connection', description: 'Sometimes related' },
          { value: 2, label: 'Clear connection', description: 'Often occur together' },
          { value: 3, label: 'Strong connection', description: 'One always triggers the other' }
        ],
        category: 'digestive',
        subcategory: 'gutBrainConnection'
      },
      {
        id: 'skin_food_reaction',
        text: 'Do you get skin reactions (rashes, acne, eczema) after eating certain foods?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'No food-skin connection' },
          { value: 1, label: 'Rarely', description: 'Only with obvious allergens' },
          { value: 2, label: 'Sometimes', description: 'Certain foods trigger skin issues' },
          { value: 3, label: 'Often', description: 'Many foods cause skin reactions' }
        ],
        category: 'digestive',
        subcategory: 'gutBrainConnection'
      },
      {
        id: 'joint_pain_after_eating',
        text: 'Do you experience joint pain or stiffness after eating?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'No food-joint connection' },
          { value: 1, label: 'Rarely', description: 'Only with certain foods' },
          { value: 2, label: 'Sometimes', description: 'Noticeable pattern' },
          { value: 3, label: 'Often', description: 'Regular food-triggered joint pain' }
        ],
        category: 'digestive',
        subcategory: 'gutBrainConnection'
      }
    ]
  },

  // PART 3: METABOLIC & CARDIOVASCULAR (20 questions)
  metabolicCardio: {
    bloodSugar: [
      {
        id: 'time_between_meals_tolerance',
        text: 'How long can you go between meals without symptoms?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: '5+ hours comfortably' },
          { value: 1, label: '3-4 hours' },
          { value: 2, label: '2-3 hours' },
          { value: 3, label: 'Less than 2 hours - need constant eating' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar',
        truckDriverContext: 'Consider typical time between truck stop meals'
      },
      {
        id: 'symptoms_delayed_meal',
        text: 'What happens if you delay a meal?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'No symptoms - feel fine' },
          { value: 1, label: 'Mild hunger only' },
          { value: 2, label: 'Irritable, tired, or shaky' },
          { value: 3, label: 'Severe symptoms - panic, sweating, must eat immediately' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      },
      {
        id: 'energy_crashes_frequency',
        text: 'How often do you experience energy crashes?',
        type: 'frequency',
        options: [
          { value: 0, label: 'Never - stable energy' },
          { value: 1, label: 'Rarely - only when very tired' },
          { value: 2, label: 'Sometimes - 2-3x per week' },
          { value: 3, label: 'Daily - predictable crashes' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      },
      {
        id: 'sugar_carb_cravings',
        text: 'Rate your cravings for sugar or carbohydrates:',
        type: 'scale',
        options: [
          { value: 0, label: 'No cravings', description: 'Can take or leave sweets' },
          { value: 1, label: 'Mild cravings', description: 'Enjoy sweets but not urgent' },
          { value: 2, label: 'Strong cravings', description: 'Think about sweets frequently' },
          { value: 3, label: 'Intense cravings', description: 'Must have sugar/carbs regularly' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      },
      {
        id: 'night_waking_hunger',
        text: 'Do you wake up at night needing to eat?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      },
      {
        id: 'mood_changes_hunger',
        text: 'Do you get irritable, anxious, or moody when hungry?',
        type: 'scale',
        options: [
          { value: 0, label: 'No change', description: 'Mood stable when hungry' },
          { value: 1, label: 'Slightly grumpy', description: 'Minor irritability' },
          { value: 2, label: 'Noticeably moody', description: 'Others notice my mood change' },
          { value: 3, label: 'Severe mood swings', description: 'Can\'t function when hungry' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      },
      {
        id: 'skin_tags_darkening',
        text: 'Do you have skin tags or dark patches on your neck, underarms, or groin?',
        type: 'scale',
        options: [
          { value: 0, label: 'None', description: 'No skin changes' },
          { value: 1, label: 'Few small skin tags', description: 'Minor changes' },
          { value: 2, label: 'Multiple skin tags or dark patches', description: 'Noticeable changes' },
          { value: 3, label: 'Many skin tags and significant darkening', description: 'Obvious changes' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      },
      {
        id: 'increased_thirst_urination',
        text: 'Do you experience increased thirst and urination?',
        type: 'scale',
        options: [
          { value: 0, label: 'Normal', description: 'Typical thirst and urination' },
          { value: 1, label: 'Slightly increased', description: 'Sometimes notice more' },
          { value: 2, label: 'Noticeably increased', description: 'Clear increase in both' },
          { value: 3, label: 'Dramatically increased', description: 'Constant thirst, frequent urination' }
        ],
        category: 'metabolicCardio',
        subcategory: 'bloodSugar'
      }
    ],
    
    cardiovascular: [
      {
        id: 'chest_tightness_pressure',
        text: 'Do you experience chest tightness or pressure?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'metabolicCardio',
        subcategory: 'cardiovascular',
        aiContext: 'Red flag symptom requiring immediate follow-up'
      },
      {
        id: 'shortness_breath',
        text: 'Do you get short of breath with light activity (stairs, walking fast)?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'Normal breathing with activity' },
          { value: 1, label: 'Rarely', description: 'Only with vigorous activity' },
          { value: 2, label: 'Sometimes', description: 'With moderate activity' },
          { value: 3, label: 'Often', description: 'With light activity or at rest' }
        ],
        category: 'metabolicCardio',
        subcategory: 'cardiovascular'
      },
      {
        id: 'leg_pain_walking',
        text: 'Do you get leg pain when walking that improves with rest?',
        type: 'scale',
        options: [
          { value: 0, label: 'Never', description: 'No walking-related leg pain' },
          { value: 1, label: 'Rarely', description: 'Only with long distances' },
          { value: 2, label: 'Sometimes', description: 'With moderate walking' },
          { value: 3, label: 'Often', description: 'Limits walking distance' }
        ],
        category: 'metabolicCardio',
        subcategory: 'cardiovascular'
      },
      {
        id: 'swelling_patterns',
        text: 'Do you experience swelling in your ankles, hands, or face?',
        type: 'scale',
        options: [
          { value: 0, label: 'No swelling', description: 'Normal fluid balance' },
          { value: 1, label: 'Mild occasional swelling', description: 'End of day or after salt' },
          { value: 2, label: 'Regular swelling', description: 'Noticeable pattern' },
          { value: 3, label: 'Significant swelling', description: 'Affects clothing fit' }
        ],
        category: 'metabolicCardio',
        subcategory: 'cardiovascular'
      },
      {
        id: 'dizziness_standing',
        text: 'Do you get dizzy or lightheaded when standing up?',
        type: 'frequency',
        options: FREQUENCY_SCALE,
        category: 'metabolicCardio',
        subcategory: 'cardiovascular'
      },
      {
        id: 'heart_palpitations',
        text: 'Do you experience heart palpitations or irregular heartbeat?',
        type: 'frequency',
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely - only with stress/caffeine' },
          { value: 2, label: 'Sometimes - noticeable episodes' },
          { value: 3, label: 'Often - multiple times per week' }
        ],
        category: 'metabolicCardio',
        subcategory: 'cardiovascular'
      },
      {
        id: 'spider_varicose_veins',
        text: 'Do you have spider veins or varicose veins?',
        type: 'scale',
        options: [
          { value: 0, label: 'None', description: 'No visible vein issues' },
          { value: 1, label: 'Few spider veins', description: 'Minor cosmetic issue' },
          { value: 2, label: 'Multiple spider veins or small varicose veins', description: 'Noticeable' },
          { value: 3, label: 'Significant varicose veins', description: 'Bulging, painful veins' }
        ],
        category: 'metabolicCardio',
        subcategory: 'cardiovascular',
        truckDriverContext: 'Common issue from prolonged sitting while driving'
      }
    ],
    
    weightMetabolism: [
      {
        id: 'weight_gain_pattern',
        text: 'Describe your weight pattern over the last 2 years:',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Stable weight' },
          { value: 1, label: 'Gradual gain (5-10 lbs)' },
          { value: 2, label: 'Moderate gain (10-20 lbs)' },
          { value: 3, label: 'Significant gain (20+ lbs)' }
        ],
        category: 'metabolicCardio',
        subcategory: 'weightMetabolism'
      },
      {
        id: 'weight_distribution',
        text: 'Where do you tend to gain weight?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Don\'t gain weight easily' },
          { value: 1, label: 'Evenly distributed' },
          { value: 2, label: 'Hips and thighs' },
          { value: 3, label: 'Belly/midsection' }
        ],
        category: 'metabolicCardio',
        subcategory: 'weightMetabolism'
      },
      {
        id: 'ability_lose_weight',
        text: 'How easily can you lose weight when you try?',
        type: 'scale',
        options: [
          { value: 0, label: 'Easy', description: 'Lose weight with normal effort' },
          { value: 1, label: 'Somewhat difficult', description: 'Takes more effort than before' },
          { value: 2, label: 'Very difficult', description: 'Weight loss extremely slow' },
          { value: 3, label: 'Nearly impossible', description: 'Can\'t lose weight despite efforts' }
        ],
        category: 'metabolicCardio',
        subcategory: 'weightMetabolism'
      },
      {
        id: 'temperature_preference',
        text: 'Are you always cold or always hot?',
        type: 'multiple_choice',
        options: [
          { value: 0, label: 'Normal temperature tolerance' },
          { value: 1, label: 'Prefer warmer temperatures' },
          { value: 2, label: 'Always cold - need extra layers' },
          { value: 3, label: 'Always hot - prefer air conditioning' }
        ],
        category: 'metabolicCardio',
        subcategory: 'weightMetabolism'
      },
      {
        id: 'energy_despite_sleep',
        text: 'Do you feel tired even when you get adequate sleep?',
        type: 'scale',
        options: [
          { value: 0, label: 'No - sleep restores energy', description: 'Feel refreshed after sleep' },
          { value: 1, label: 'Sometimes tired', description: 'Occasionally feel unrefreshed' },
          { value: 2, label: 'Often tired', description: 'Usually feel unrefreshed' },
          { value: 3, label: 'Always tired', description: 'Never feel rested regardless of sleep' }
        ],
        category: 'metabolicCardio',
        subcategory: 'weightMetabolism'
      }
    ]
  }
};