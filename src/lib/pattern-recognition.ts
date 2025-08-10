// import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface HealthPattern {
  id: string;
  name: string;
  category: string;
  symptoms: string[];
  confidence: number;
  rootCauses: string[];
  truckDriverFactors?: string[];
  severity: 'low' | 'moderate' | 'high';
}

export interface PatternDetectionResult {
  patterns: HealthPattern[];
  underreportingScore: number;
  recommendedFollowUps: string[];
  urgentConcerns: string[];
}

// Define common health patterns with their symptom clusters
const HEALTH_PATTERNS = {
  gut_dysbiosis: {
    name: 'Gut Dysbiosis/SIBO',
    category: 'digestive',
    symptoms: [
      'bloating', 'gas', 'irregular bowel', 'brain fog', 'fatigue', 
      'skin issues', 'mood changes', 'food sensitivities'
    ],
    rootCauses: [
      'Poor diet quality', 'Chronic stress', 'Antibiotic use', 
      'Limited food variety on the road'
    ],
    truckDriverFactors: [
      'Truck stop food choices', 'Irregular eating schedule', 
      'Limited bathroom access affecting gut motility'
    ]
  },
  hpa_dysfunction: {
    name: 'HPA Axis Dysfunction',
    category: 'endocrine',
    symptoms: [
      'chronic fatigue', 'stress intolerance', 'sleep issues', 
      'blood sugar swings', 'afternoon crashes', 'salt cravings',
      'difficulty waking', 'wired but tired'
    ],
    rootCauses: [
      'Chronic stress', 'Sleep deprivation', 'Shift work',
      'Poor stress management'
    ],
    truckDriverFactors: [
      'Irregular sleep schedule', 'Traffic stress', 'Deadline pressure',
      'Long hours without breaks'
    ]
  },
  thyroid_dysfunction: {
    name: 'Thyroid Dysfunction',
    category: 'endocrine',
    symptoms: [
      'fatigue', 'cold intolerance', 'weight gain', 'hair loss',
      'constipation', 'dry skin', 'brain fog', 'depression'
    ],
    rootCauses: [
      'Autoimmune', 'Nutrient deficiencies', 'Chronic inflammation',
      'Environmental toxins'
    ],
    truckDriverFactors: [
      'Diesel exhaust exposure', 'Limited access to fresh foods',
      'Sedentary lifestyle affecting metabolism'
    ]
  },
  inflammation: {
    name: 'Chronic Inflammation',
    category: 'systemic',
    symptoms: [
      'joint pain', 'muscle aches', 'brain fog', 'digestive issues',
      'skin problems', 'fatigue', 'headaches'
    ],
    rootCauses: [
      'Poor diet', 'Lack of movement', 'Chronic stress',
      'Environmental toxins', 'Poor sleep'
    ],
    truckDriverFactors: [
      'Prolonged sitting', 'Inflammatory diet', 'Diesel fume exposure',
      'Limited exercise opportunities'
    ]
  },
  insulin_resistance: {
    name: 'Insulin Resistance/Metabolic Dysfunction',
    category: 'metabolic',
    symptoms: [
      'energy crashes', 'carb cravings', 'weight gain', 'brain fog',
      'afternoon fatigue', 'hungry shortly after eating', 'belly fat'
    ],
    rootCauses: [
      'High carb diet', 'Sedentary lifestyle', 'Chronic stress',
      'Poor sleep', 'Nutrient deficiencies'
    ],
    truckDriverFactors: [
      'Convenience food reliance', 'Long sitting periods',
      'Irregular meal timing', 'Energy drink consumption'
    ]
  },
  iron_deficiency: {
    name: 'Iron Deficiency Anemia',
    category: 'nutritional',
    symptoms: [
      'extreme fatigue', 'shortness of breath', 'cold hands/feet',
      'pale skin', 'dizziness', 'heavy periods', 'restless legs'
    ],
    rootCauses: [
      'Heavy menstruation', 'Poor absorption', 'Low dietary intake',
      'Gut dysfunction'
    ],
    truckDriverFactors: [
      'Limited iron-rich food options', 'Coffee/tea with meals blocking absorption',
      'Fatigue affecting driving safety'
    ]
  }
};

export class PatternRecognitionEngine {
  private conversationId: string;
  
  constructor(conversationId: string) {
    this.conversationId = conversationId;
  }

  async analyzeConversation(): Promise<PatternDetectionResult> {
    // Get all messages from the conversation
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', this.conversationId)
      .eq('role', 'client')
      .order('timestamp', { ascending: true });

    if (!messages || messages.length === 0) {
      return {
        patterns: [],
        underreportingScore: 0,
        recommendedFollowUps: [],
        urgentConcerns: []
      };
    }

    // Extract symptoms from messages
    const extractedSymptoms = this.extractSymptoms(messages);
    
    // Detect patterns
    const detectedPatterns = this.detectPatterns(extractedSymptoms);
    
    // Calculate underreporting score
    const underreportingScore = this.calculateUnderreportingScore(messages);
    
    // Generate follow-up recommendations
    const recommendedFollowUps = this.generateFollowUpQuestions(
      detectedPatterns,
      underreportingScore
    );
    
    // Identify urgent concerns
    const urgentConcerns = this.identifyUrgentConcerns(extractedSymptoms);

    // Store analysis results
    await this.storeAnalysisResults({
      patterns: detectedPatterns,
      underreportingScore,
      recommendedFollowUps,
      urgentConcerns
    });

    return {
      patterns: detectedPatterns,
      underreportingScore,
      recommendedFollowUps,
      urgentConcerns
    };
  }

  private extractSymptoms(messages: any[]): Map<string, number> {
    const symptomMap = new Map<string, number>();
    
    // Keywords to look for in messages
    const symptomKeywords = [
      'fatigue', 'tired', 'exhausted', 'brain fog', 'bloating', 'gas',
      'constipation', 'diarrhea', 'pain', 'ache', 'headache', 'dizzy',
      'cold', 'hot', 'weight gain', 'weight loss', 'mood', 'anxiety',
      'depression', 'stress', 'sleep', 'insomnia', 'cravings', 'hungry',
      'shortness of breath', 'palpitations', 'numbness', 'tingling'
    ];

    // Analyze each message for symptoms
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      symptomKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          const currentCount = symptomMap.get(keyword) || 0;
          symptomMap.set(keyword, currentCount + 1);
          
          // Also check for severity indicators
          if (content.includes('severe') || content.includes('extreme') || 
              content.includes('terrible') || content.includes('awful')) {
            symptomMap.set(`severe_${keyword}`, 1);
          }
        }
      });
    });

    return symptomMap;
  }

  private detectPatterns(symptoms: Map<string, number>): HealthPattern[] {
    const detectedPatterns: HealthPattern[] = [];
    
    // Check each pattern against reported symptoms
    Object.entries(HEALTH_PATTERNS).forEach(([patternId, pattern]) => {
      let matchCount = 0;
      const matchedSymptoms: string[] = [];
      
      pattern.symptoms.forEach(patternSymptom => {
        // Check if symptom or related keywords are present
        symptoms.forEach((count, symptom) => {
          if (symptom.includes(patternSymptom) || patternSymptom.includes(symptom)) {
            matchCount++;
            matchedSymptoms.push(symptom);
          }
        });
      });
      
      // Calculate confidence based on symptom matches
      const confidence = matchCount / pattern.symptoms.length;
      
      if (confidence >= 0.3) { // 30% symptom match threshold
        // Determine severity
        let severity: 'low' | 'moderate' | 'high' = 'low';
        if (confidence >= 0.7) severity = 'high';
        else if (confidence >= 0.5) severity = 'moderate';
        
        detectedPatterns.push({
          id: patternId,
          name: pattern.name,
          category: pattern.category,
          symptoms: matchedSymptoms,
          confidence,
          rootCauses: pattern.rootCauses,
          truckDriverFactors: pattern.truckDriverFactors,
          severity
        });
      }
    });
    
    // Sort by confidence
    return detectedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateUnderreportingScore(messages: any[]): number {
    let score = 0;
    const indicators = {
      minimizing: ['just a little', 'not too bad', 'sometimes', 'kind of', 'sort of'],
      deflection: ['but it\'s fine', 'i can handle it', 'not a big deal', 'i\'m used to it'],
      workFocus: ['still driving', 'doesn\'t affect work', 'can still work', 'push through'],
      vague: ['maybe', 'i guess', 'probably', 'might be']
    };
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Check for underreporting indicators
      Object.values(indicators).flat().forEach(indicator => {
        if (content.includes(indicator)) {
          score += 0.1;
        }
      });
      
      // Short responses to health questions suggest underreporting
      if (content.length < 50 && message.section !== 'introduction') {
        score += 0.05;
      }
    });
    
    return Math.min(score, 1); // Cap at 1.0
  }

  private generateFollowUpQuestions(
    patterns: HealthPattern[],
    underreportingScore: number
  ): string[] {
    const followUps: string[] = [];
    
    // High underreporting score warrants gentle probing
    if (underreportingScore > 0.5) {
      followUps.push(
        "I sense you might be downplaying some symptoms. Remember, this is a safe space to share everything you're experiencing.",
        "Many truck drivers push through symptoms. What symptoms do you experience that you normally just 'deal with'?"
      );
    }
    
    // Pattern-specific follow-ups
    patterns.forEach(pattern => {
      switch (pattern.id) {
        case 'gut_dysbiosis':
          followUps.push(
            "Tell me more about when your digestive symptoms are worst - is it after certain foods or at specific times?",
            "How do bathroom access challenges on the road affect your symptoms?"
          );
          break;
        case 'hpa_dysfunction':
          followUps.push(
            "Describe your energy levels throughout a typical driving day - when do you feel best and worst?",
            "How would you rate your stress levels on a scale of 1-10 during different parts of your route?"
          );
          break;
        case 'insulin_resistance':
          followUps.push(
            "What do you typically eat at truck stops, and how do you feel 1-2 hours after meals?",
            "Do you experience strong cravings for specific foods, especially during long drives?"
          );
          break;
      }
    });
    
    return followUps.slice(0, 3); // Return top 3 most relevant
  }

  private identifyUrgentConcerns(symptoms: Map<string, number>): string[] {
    const urgentConcerns: string[] = [];
    
    // Check for red flag symptoms
    const redFlags = [
      { symptom: 'chest pain', concern: 'Chest pain requires immediate medical evaluation' },
      { symptom: 'severe_shortness of breath', concern: 'Severe breathing difficulties need urgent assessment' },
      { symptom: 'severe_dizziness', concern: 'Severe dizziness while driving is a safety concern' },
      { symptom: 'severe_headache', concern: 'Severe headaches, especially if new, need evaluation' },
      { symptom: 'numbness', concern: 'Numbness or tingling could indicate circulation or nerve issues' }
    ];
    
    redFlags.forEach(({ symptom, concern }) => {
      if (symptoms.has(symptom) || symptoms.has(`severe_${symptom}`)) {
        urgentConcerns.push(concern);
      }
    });
    
    return urgentConcerns;
  }

  private async storeAnalysisResults(results: PatternDetectionResult) {
    const analysisData = {
      conversation_id: this.conversationId,
      patterns_detected: results.patterns,
      underreporting_score: results.underreportingScore,
      recommendations: results.recommendedFollowUps,
      urgent_concerns: results.urgentConcerns,
      confidence_scores: results.patterns.reduce((acc, pattern) => ({
        ...acc,
        [pattern.id]: pattern.confidence
      }), {})
    };
    
    await supabase
      .from('conversation_analysis')
      .upsert(analysisData);
  }

  // Real-time pattern detection for use during conversation
  async detectPatternsRealTime(
    currentSymptoms: string[],
    section: string
  ): Promise<HealthPattern[]> {
    const symptomMap = new Map<string, number>();
    currentSymptoms.forEach(symptom => {
      symptomMap.set(symptom.toLowerCase(), 1);
    });
    
    return this.detectPatterns(symptomMap)
      .filter(pattern => pattern.confidence >= 0.4); // Higher threshold for real-time
  }
}