/**
 * FNTP Health Analysis Example
 * Demonstrates how to use the enhanced AnthropicProvider for Kevin Rutherford's FNTP practice
 */

import { aiService } from '../index';

// Example 1: Analyze lab results for a truck driver
export async function analyzeTruckDriverLabResults() {
  const healthData = {
    demographics: {
      age: 45,
      gender: 'Male',
      occupation: 'Long-haul Truck Driver',
      yearsDriving: 20
    },
    labResults: {
      metabolicPanel: {
        glucose: { value: 112, unit: 'mg/dL', range: '70-100', optimalRange: '75-85' },
        hba1c: { value: 6.1, unit: '%', range: '<5.7', optimalRange: '<5.3' },
        insulin: { value: 18, unit: 'uIU/mL', range: '2-25', optimalRange: '2-5' }
      },
      lipidPanel: {
        totalCholesterol: { value: 245, unit: 'mg/dL', range: '<200', optimalRange: '150-180' },
        ldl: { value: 165, unit: 'mg/dL', range: '<100', optimalRange: '<80' },
        hdl: { value: 38, unit: 'mg/dL', range: '>40', optimalRange: '>60' },
        triglycerides: { value: 210, unit: 'mg/dL', range: '<150', optimalRange: '<100' }
      },
      inflammation: {
        hscrp: { value: 4.2, unit: 'mg/L', range: '<3.0', optimalRange: '<1.0' },
        homocysteine: { value: 14, unit: 'umol/L', range: '<15', optimalRange: '<7' }
      },
      hormones: {
        testosterone: { value: 285, unit: 'ng/dL', range: '300-1000', optimalRange: '500-800' },
        cortisol: { value: 22, unit: 'ug/dL', range: '5-25', optimalRange: '10-18' }
      }
    },
    symptoms: {
      fatigue: { severity: 8, timing: 'constant', worseWith: 'after meals' },
      brainFog: { severity: 6, timing: 'afternoon', frequency: 'daily' },
      jointPain: { severity: 5, location: 'lower back, knees', worseWith: 'long drives' },
      digestive: { 
        bloating: 'after meals',
        bowelMovements: 'irregular',
        heartburn: 'frequent'
      }
    },
    lifestyle: {
      diet: 'Truck stop food, fast food 5x/week',
      exercise: 'None - sitting 10-12 hours/day',
      sleep: '5-6 hours, irregular schedule',
      stress: 'High - deadlines, traffic, isolation',
      smoking: 'No',
      alcohol: '2-3 beers on weekends',
      hydration: 'Mostly coffee and energy drinks'
    },
    truckingFactors: {
      hoursPerDay: 11,
      routeType: 'Long-haul cross-country',
      homeTime: '2-3 days every 2 weeks',
      foodAccess: 'Limited - truck stops and fast food',
      exerciseAccess: 'Very limited - no gym access'
    },
    medications: [
      { name: 'Metformin', dose: '500mg', frequency: 'twice daily' },
      { name: 'Omeprazole', dose: '20mg', frequency: 'daily' },
      { name: 'Ibuprofen', dose: '400mg', frequency: 'as needed for pain' }
    ],
    goals: [
      'Reduce fatigue and improve energy',
      'Lower blood sugar naturally',
      'Lose 30 pounds',
      'Reduce inflammation and joint pain',
      'Find practical solutions that work on the road'
    ]
  };

  try {
    console.log('Analyzing health data for truck driver...\n');
    
    const analysis = await aiService.analyzeHealth(healthData, {
      provider: 'anthropic', // Use Anthropic for FNTP analysis
      useCache: true
    });

    console.log('=== FNTP HEALTH ANALYSIS RESULTS ===\n');
    console.log('Summary:', analysis.summary);
    console.log('\nConfidence:', analysis.confidence + '%');
    
    // Display root causes (FNTP specific)
    if (analysis.metadata?.rootCauses) {
      console.log('\n=== ROOT CAUSES (Functional Medicine Perspective) ===');
      analysis.metadata.rootCauses.forEach((rc: any, index: number) => {
        console.log(`\n${index + 1}. ${rc.issue}`);
        console.log(`   Description: ${rc.description}`);
        console.log(`   Evidence: ${rc.evidence.join(', ')}`);
        console.log(`   Functional Approach: ${rc.functionalApproach}`);
      });
    }

    // Display truck driver specific concerns
    if (analysis.metadata?.truckDriverSpecific) {
      console.log('\n=== TRUCK DRIVER SPECIFIC CONSIDERATIONS ===');
      analysis.metadata.truckDriverSpecific.forEach((td: any, index: number) => {
        console.log(`\n${index + 1}. ${td.concern}`);
        console.log(`   Impact: ${td.impact}`);
        console.log(`   Solutions:`);
        td.solutions.forEach((solution: string) => {
          console.log(`   - ${solution}`);
        });
      });
    }

    // Display prioritized interventions
    if (analysis.metadata?.priority) {
      console.log('\n=== PRIORITIZED INTERVENTIONS ===');
      analysis.metadata.priority.forEach((p: any) => {
        console.log(`\n${p.order}. ${p.intervention}`);
        console.log(`   Timeframe: ${p.timeframe}`);
        console.log(`   Expected Outcome: ${p.expectedOutcome}`);
      });
    }

    // Display findings
    console.log('\n=== KEY FINDINGS ===');
    analysis.findings.forEach(finding => {
      console.log(`- [${finding.severity.toUpperCase()}] ${finding.description}`);
      if (finding.value) {
        console.log(`  Value: ${finding.value} (Reference: ${finding.reference})`);
      }
    });

    // Display recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    analysis.recommendations.forEach(rec => {
      console.log(`- [${rec.priority.toUpperCase()}] ${rec.description}`);
      if (rec.timeframe) {
        console.log(`  Timeframe: ${rec.timeframe}`);
      }
    });

    // Display risk factors
    console.log('\n=== RISK FACTORS ===');
    analysis.riskFactors.forEach(risk => {
      console.log(`- ${risk.name} (${risk.level}): ${risk.description}`);
      if (risk.mitigationStrategies && risk.mitigationStrategies.length > 0) {
        console.log('  Mitigation strategies:');
        risk.mitigationStrategies.forEach(strategy => {
          console.log(`  • ${strategy}`);
        });
      }
    });

    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

// Example 2: Quick symptom analysis for truck drivers
export async function quickTruckDriverSymptomCheck() {
  const symptomData = {
    demographics: {
      occupation: 'Truck Driver'
    },
    symptoms: {
      primaryComplaints: [
        'Chronic lower back pain',
        'Fatigue after eating',
        'Difficulty staying awake while driving',
        'Frequent urination',
        'Numbness in feet'
      ]
    },
    truckingFactors: {
      hoursPerDay: 10,
      routeType: 'Regional',
      exerciseAccess: 'None'
    }
  };

  const analysis = await aiService.analyzeHealth(symptomData, {
    provider: 'anthropic'
  });

  return analysis;
}

// Example 3: Analyze dietary patterns for truck drivers
export async function analyzeTruckDriverDiet() {
  const dietData = {
    demographics: {
      occupation: 'Truck Driver',
      age: 52
    },
    lifestyle: {
      diet: 'Typical truck stop meals',
      mealTiming: 'Irregular - eating when stopped',
      typicalMeals: {
        breakfast: 'Coffee, donuts, or skip',
        lunch: 'Burger and fries or sandwich',
        dinner: 'Truck stop buffet or fast food',
        snacks: 'Chips, candy, energy drinks'
      },
      hydration: 'Limited water, mostly coffee and soda'
    },
    symptoms: {
      digestive: ['Heartburn', 'Bloating', 'Constipation'],
      energy: 'Energy crashes after meals',
      cravings: 'Strong sugar cravings in afternoon'
    },
    goals: [
      'Find healthy options at truck stops',
      'Meal prep ideas for the truck',
      'Reduce inflammation through diet'
    ]
  };

  const analysis = await aiService.analyzeHealth(dietData, {
    provider: 'anthropic'
  });

  return analysis;
}

// Run the example
if (require.main === module) {
  analyzeTruckDriverLabResults()
    .then(() => console.log('\nAnalysis complete!'))
    .catch(error => console.error('Error:', error));
}