import { Response } from './question-selector';

export interface DetectedPattern {
  name: string;
  displayName: string;
  confidence: number;
  evidence: Evidence[];
  nextQuestions: string[];
  urgency?: 'low' | 'medium' | 'high';
}

export interface Evidence {
  questionId: string;
  value: number | string;
  significance: string;
}

export class PatternMatcher {
  
  detectPatterns(responses: Response[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Check for Iron Deficiency Pattern
    const ironPattern = this.checkIronDeficiency(responses);
    if (ironPattern) patterns.push(ironPattern);
    
    // Check for HPA Axis Dysfunction
    const hpaPattern = this.checkHPADysfunction(responses);
    if (hpaPattern) patterns.push(hpaPattern);
    
    // Check for Sleep Deprivation Pattern
    const sleepPattern = this.checkSleepDeprivation(responses);
    if (sleepPattern) patterns.push(sleepPattern);
    
    // Check for Metabolic Syndrome Pattern
    const metabolicPattern = this.checkMetabolicSyndrome(responses);
    if (metabolicPattern) patterns.push(metabolicPattern);
    
    // Check for Gut Dysbiosis Pattern
    const gutPattern = this.checkGutDysbiosis(responses);
    if (gutPattern) patterns.push(gutPattern);
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }
  
  private checkIronDeficiency(responses: Response[]): DetectedPattern | null {
    const evidence: Evidence[] = [];
    let score = 0;
    
    // Check for fatigue
    const fatigue = responses.find(r => r.questionId === 'energy_level' || r.questionId === 'energy_compared');
    if (fatigue && (fatigue.value === 'worse' || fatigue.value === 'much_worse' || Number(fatigue.value) >= 2)) {
      score += 2;
      evidence.push({ 
        questionId: fatigue.questionId, 
        value: fatigue.value,
        significance: 'Primary symptom of iron deficiency'
      });
    }
    
    // Check for shortness of breath
    const breathless = responses.find(r => r.questionId === 'shortness_breath');
    if (breathless && Number(breathless.value) >= 1) {
      score += 1.5;
      evidence.push({
        questionId: 'shortness_breath',
        value: breathless.value,
        significance: 'Reduced oxygen carrying capacity'
      });
    }
    
    // Check for cold intolerance
    const cold = responses.find(r => r.questionId === 'always_cold' || r.questionId === 'cold_hands_feet');
    if (cold && Number(cold.value) >= 2) {
      score += 1;
      evidence.push({
        questionId: cold.questionId,
        value: cold.value,
        significance: 'Poor circulation from low iron'
      });
    }
    
    // Check for heavy menstrual bleeding (if applicable)
    const heavyBleeding = responses.find(r => r.questionId === 'menstrual_flow');
    if (heavyBleeding && Number(heavyBleeding.value) >= 2) {
      score += 2;
      evidence.push({
        questionId: 'menstrual_flow',
        value: heavyBleeding.value,
        significance: 'Common cause of iron loss'
      });
    }
    
    // Check for pale skin/nails
    const pale = responses.find(r => r.questionId === 'pale_skin' || r.questionId === 'pale_nails');
    if (pale && (pale.value === 'yes' || Number(pale.value) >= 2)) {
      score += 1.5;
      evidence.push({
        questionId: pale.questionId,
        value: pale.value,
        significance: 'Visual sign of anemia'
      });
    }
    
    if (score >= 3) {
      return {
        name: 'IRON_DEFICIENCY_ANEMIA',
        displayName: 'Iron Deficiency Anemia',
        confidence: Math.min(score / 8, 1), // Normalize to 0-1
        evidence,
        nextQuestions: ['ice_cravings', 'restless_legs', 'frequent_infections', 'hair_loss', 'brittle_nails'],
        urgency: score >= 5 ? 'high' : 'medium'
      };
    }
    
    return null;
  }
  
  private checkHPADysfunction(responses: Response[]): DetectedPattern | null {
    const evidence: Evidence[] = [];
    let score = 0;
    
    // Check for energy crashes
    const energyCrash = responses.find(r => r.questionId === 'energy_crash_afternoon');
    if (energyCrash && Number(energyCrash.value) >= 2) {
      score += 2;
      evidence.push({
        questionId: 'energy_crash_afternoon',
        value: energyCrash.value,
        significance: 'Classic adrenal fatigue pattern'
      });
    }
    
    // Check for second wind at night
    const secondWind = responses.find(r => r.questionId === 'second_wind_evening');
    if (secondWind && (secondWind.value === 'yes' || Number(secondWind.value) >= 2)) {
      score += 1.5;
      evidence.push({
        questionId: 'second_wind_evening',
        value: secondWind.value,
        significance: 'Cortisol rhythm disruption'
      });
    }
    
    // Check for salt cravings
    const saltCravings = responses.find(r => r.questionId === 'salt_cravings');
    if (saltCravings && Number(saltCravings.value) >= 2) {
      score += 1;
      evidence.push({
        questionId: 'salt_cravings',
        value: saltCravings.value,
        significance: 'Aldosterone insufficiency sign'
      });
    }
    
    // Check for stress intolerance
    const stressIntolerance = responses.find(r => r.questionId === 'stress_tolerance');
    if (stressIntolerance && Number(stressIntolerance.value) >= 2) {
      score += 1.5;
      evidence.push({
        questionId: 'stress_tolerance',
        value: stressIntolerance.value,
        significance: 'Reduced stress adaptation'
      });
    }
    
    if (score >= 3) {
      return {
        name: 'HPA_AXIS_DYSFUNCTION',
        displayName: 'HPA Axis Dysfunction (Adrenal Fatigue)',
        confidence: Math.min(score / 6, 1),
        evidence,
        nextQuestions: ['morning_difficulty', 'blood_pressure_drops', 'dizziness_standing', 'caffeine_dependence'],
        urgency: 'medium'
      };
    }
    
    return null;
  }
  
  private checkSleepDeprivation(responses: Response[]): DetectedPattern | null {
    const evidence: Evidence[] = [];
    let score = 0;
    
    // Check sleep hours
    const sleepHours = responses.find(r => r.questionId === 'sleep_hours');
    if (sleepHours) {
      if (sleepHours.value === 'less_4') {
        score += 3;
        evidence.push({
          questionId: 'sleep_hours',
          value: sleepHours.value,
          significance: 'Severe sleep deprivation'
        });
      } else if (sleepHours.value === '4_6') {
        score += 2;
        evidence.push({
          questionId: 'sleep_hours',
          value: sleepHours.value,
          significance: 'Chronic sleep insufficiency'
        });
      }
    }
    
    // Check sleep quality
    const sleepQuality = responses.find(r => r.questionId === 'sleep_quality');
    if (sleepQuality && Number(sleepQuality.value) >= 2) {
      score += 1.5;
      evidence.push({
        questionId: 'sleep_quality',
        value: sleepQuality.value,
        significance: 'Poor sleep restoration'
      });
    }
    
    // Check daytime sleepiness
    const daySleepiness = responses.find(r => r.questionId === 'daytime_sleepiness');
    if (daySleepiness && Number(daySleepiness.value) >= 2) {
      score += 2;
      evidence.push({
        questionId: 'daytime_sleepiness',
        value: daySleepiness.value,
        significance: 'Excessive daytime fatigue'
      });
    }
    
    if (score >= 3) {
      return {
        name: 'SLEEP_DEPRIVATION',
        displayName: 'Chronic Sleep Deprivation',
        confidence: Math.min(score / 6.5, 1),
        evidence,
        nextQuestions: ['sleep_apnea_risk', 'snoring', 'wake_refreshed', 'microsleeps'],
        urgency: score >= 5 ? 'high' : 'medium'
      };
    }
    
    return null;
  }
  
  private checkMetabolicSyndrome(responses: Response[]): DetectedPattern | null {
    const evidence: Evidence[] = [];
    let score = 0;
    
    // Check for weight gain
    const weightGain = responses.find(r => r.questionId === 'weight_gain_recent');
    if (weightGain && (weightGain.value === 'yes' || Number(weightGain.value) >= 2)) {
      score += 1.5;
      evidence.push({
        questionId: 'weight_gain_recent',
        value: weightGain.value,
        significance: 'Central adiposity indicator'
      });
    }
    
    // Check for sugar cravings
    const sugarCravings = responses.find(r => r.questionId === 'sugar_cravings');
    if (sugarCravings && Number(sugarCravings.value) >= 2) {
      score += 1;
      evidence.push({
        questionId: 'sugar_cravings',
        value: sugarCravings.value,
        significance: 'Blood sugar dysregulation'
      });
    }
    
    // Check for afternoon energy crash
    const afternoonCrash = responses.find(r => r.questionId === 'energy_after_meals');
    if (afternoonCrash && Number(afternoonCrash.value) >= 2) {
      score += 1.5;
      evidence.push({
        questionId: 'energy_after_meals',
        value: afternoonCrash.value,
        significance: 'Insulin resistance sign'
      });
    }
    
    if (score >= 2.5) {
      return {
        name: 'METABOLIC_SYNDROME',
        displayName: 'Metabolic Syndrome Risk',
        confidence: Math.min(score / 4, 1),
        evidence,
        nextQuestions: ['waist_size_increase', 'blood_pressure_high', 'cholesterol_issues', 'family_diabetes'],
        urgency: 'medium'
      };
    }
    
    return null;
  }
  
  private checkGutDysbiosis(responses: Response[]): DetectedPattern | null {
    const evidence: Evidence[] = [];
    let score = 0;
    
    // Check for bloating
    const bloating = responses.find(r => r.questionId === 'bloating');
    if (bloating && Number(bloating.value) >= 2) {
      score += 1.5;
      evidence.push({
        questionId: 'bloating',
        value: bloating.value,
        significance: 'Gut fermentation issue'
      });
    }
    
    // Check for irregular bowel movements
    const bowelIrregular = responses.find(r => r.questionId === 'bowel_movements');
    if (bowelIrregular && (bowelIrregular.value === 'irregular' || Number(bowelIrregular.value) >= 2)) {
      score += 1.5;
      evidence.push({
        questionId: 'bowel_movements',
        value: bowelIrregular.value,
        significance: 'Gut motility dysfunction'
      });
    }
    
    // Check for food sensitivities
    const foodSensitive = responses.find(r => r.questionId === 'food_sensitivities');
    if (foodSensitive && (foodSensitive.value === 'yes' || Number(foodSensitive.value) >= 2)) {
      score += 1;
      evidence.push({
        questionId: 'food_sensitivities',
        value: foodSensitive.value,
        significance: 'Intestinal permeability'
      });
    }
    
    if (score >= 2.5) {
      return {
        name: 'GUT_DYSBIOSIS',
        displayName: 'Gut Health Imbalance',
        confidence: Math.min(score / 4, 1),
        evidence,
        nextQuestions: ['antibiotic_use', 'heartburn', 'stomach_pain', 'stool_consistency'],
        urgency: 'low'
      };
    }
    
    return null;
  }
  
  calculateUnderreportingRisk(responses: Response[]): number {
    // Check if most responses are mild (1) when patterns suggest they should be higher
    const mildResponses = responses.filter(r => Number(r.value) === 1).length;
    const totalResponses = responses.length;
    
    if (totalResponses === 0) return 0;
    
    const mildPercentage = mildResponses / totalResponses;
    
    // If more than 70% of responses are "mild" but patterns are detected, likely underreporting
    const patterns = this.detectPatterns(responses);
    if (mildPercentage > 0.7 && patterns.length > 0) {
      return 0.8; // High underreporting risk
    }
    
    return mildPercentage > 0.8 ? 0.6 : 0.2;
  }
  
  suggestValidationQuestions(patterns: DetectedPattern[]): string[] {
    const validationQuestions: string[] = [];
    
    patterns.forEach(pattern => {
      // Add validation questions based on pattern
      if (pattern.confidence < 0.7) {
        validationQuestions.push(...pattern.nextQuestions.slice(0, 2));
      }
    });
    
    return [...new Set(validationQuestions)]; // Remove duplicates
  }
}