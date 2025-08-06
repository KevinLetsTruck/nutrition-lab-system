/**
 * Mock Provider Implementation
 * Used for testing and as a fallback when other providers are unavailable
 */

import { 
  AIProvider, 
  AIProviderType, 
  AIOptions, 
  AIResponse, 
  HealthAnalysis,
  Finding,
  Recommendation,
  RiskFactor
} from '../types';

export class MockProvider implements AIProvider {
  name: AIProviderType = 'mock';
  private isEnabled: boolean = true;

  async isHealthy(): Promise<boolean> {
    // Simulate occasional failures for testing
    return this.isEnabled && Math.random() > 0.1;
  }

  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    // Simulate latency
    await this.simulateLatency(100, 500);

    const responses = [
      'This is a mock response for testing purposes.',
      'The analysis has been completed successfully.',
      'Based on the provided data, here are the key findings...',
      'The results indicate normal ranges across all parameters.',
    ];

    const content = responses[Math.floor(Math.random() * responses.length)];

    return {
      content,
      provider: 'mock',
      model: 'mock-model-v1',
      usage: {
        promptTokens: prompt.length,
        completionTokens: content.length,
        totalTokens: prompt.length + content.length,
      },
      latency: Math.floor(Math.random() * 400) + 100,
    };
  }

  async analyzeHealth(data: any): Promise<HealthAnalysis> {
    // Simulate latency
    await this.simulateLatency(200, 800);

    // Generate mock health analysis based on input data
    const hasLabResults = !!data.labResults;
    const hasSymptoms = !!data.symptoms;
    
    const findings: Finding[] = [
      {
        category: 'Blood Work',
        description: 'Hemoglobin levels within normal range',
        severity: 'low',
        value: '14.5 g/dL',
        reference: '13.5-17.5 g/dL',
      },
      {
        category: 'Metabolic Panel',
        description: 'Slightly elevated fasting glucose',
        severity: 'medium',
        value: '105 mg/dL',
        reference: '70-100 mg/dL',
      },
    ];

    if (hasLabResults) {
      findings.push({
        category: 'Lipid Panel',
        description: 'Total cholesterol at upper normal limit',
        severity: 'medium',
        value: '199 mg/dL',
        reference: '<200 mg/dL',
      });
    }

    const recommendations: Recommendation[] = [
      {
        priority: 'high',
        category: 'Nutrition',
        description: 'Reduce simple carbohydrate intake to help normalize glucose levels',
        timeframe: 'Immediate',
      },
      {
        priority: 'medium',
        category: 'Exercise',
        description: 'Increase aerobic activity to 150 minutes per week',
        timeframe: '2-4 weeks',
      },
      {
        priority: 'low',
        category: 'Supplementation',
        description: 'Consider vitamin D supplementation based on seasonal exposure',
        timeframe: '1-2 months',
      },
    ];

    const riskFactors: RiskFactor[] = [
      {
        name: 'Prediabetes Risk',
        level: 'moderate',
        description: 'Fasting glucose in prediabetic range',
        mitigationStrategies: [
          'Dietary modifications',
          'Regular exercise',
          'Weight management',
        ],
      },
    ];

    if (hasSymptoms) {
      riskFactors.push({
        name: 'Chronic Inflammation',
        level: 'low',
        description: 'Minor inflammatory markers present',
        mitigationStrategies: [
          'Anti-inflammatory diet',
          'Stress management',
          'Adequate sleep',
        ],
      });
    }

    const summary = `Mock health analysis summary: Overall health status shows ${
      hasLabResults ? 'mostly normal lab values with' : ''
    } some areas for improvement. ${
      hasSymptoms ? 'Reported symptoms suggest mild systemic inflammation.' : ''
    } Focus on lifestyle modifications including diet and exercise will likely yield positive results.`;

    return {
      summary,
      findings,
      recommendations,
      riskFactors,
      confidence: 85,
      metadata: {
        provider: 'mock',
        timestamp: new Date().toISOString(),
        mockData: true,
      },
    };
  }

  /**
   * Simulate network latency
   */
  private async simulateLatency(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Enable or disable the mock provider (for testing)
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Generate mock lab results
   */
  generateMockLabResults(): any {
    return {
      cbc: {
        hemoglobin: { value: 14.5, unit: 'g/dL', range: '13.5-17.5' },
        hematocrit: { value: 43.2, unit: '%', range: '41-53' },
        wbc: { value: 6.8, unit: 'K/uL', range: '4.5-11.0' },
        platelets: { value: 250, unit: 'K/uL', range: '150-400' },
      },
      metabolic: {
        glucose: { value: 105, unit: 'mg/dL', range: '70-100' },
        sodium: { value: 140, unit: 'mEq/L', range: '136-145' },
        potassium: { value: 4.2, unit: 'mEq/L', range: '3.5-5.1' },
        chloride: { value: 102, unit: 'mEq/L', range: '98-107' },
      },
      lipids: {
        totalCholesterol: { value: 199, unit: 'mg/dL', range: '<200' },
        ldl: { value: 120, unit: 'mg/dL', range: '<100' },
        hdl: { value: 55, unit: 'mg/dL', range: '>40' },
        triglycerides: { value: 120, unit: 'mg/dL', range: '<150' },
      },
    };
  }

  /**
   * Generate mock symptoms data
   */
  generateMockSymptoms(): any {
    return {
      energy: { level: 6, trend: 'stable' },
      sleep: { quality: 7, duration: 6.5, issues: ['occasional insomnia'] },
      digestion: { status: 'good', issues: [] },
      mood: { level: 7, stability: 'mostly stable' },
      pain: { level: 2, locations: [] },
    };
  }
}