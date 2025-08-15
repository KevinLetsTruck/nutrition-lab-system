'use client';

import React, { useState } from 'react';
import { Frequency } from './Frequency';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

/**
 * Demo component showing different frequency patterns
 */
export function FrequencyDemo() {
  const [values, setValues] = useState<Record<string, string | null>>({
    standard: null,
    bowel: null,
    pain: null,
    fatigue: null,
  });

  const questions: AssessmentQuestion[] = [
    {
      id: 'exercise_frequency',
      module: 'LIFESTYLE' as any,
      text: 'How often do you exercise?',
      type: 'FREQUENCY' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Physical activity', 'Metabolic health'],
      helpText: 'Include any physical activity lasting 20+ minutes',
    },
    {
      id: 'bowel_frequency',
      module: 'ASSIMILATION' as any,
      text: 'How often do you have bowel movements?',
      type: 'FREQUENCY' as any,
      frequencyType: 'bowel',
      scoringWeight: 3,
      clinicalRelevance: ['Digestive health', 'Detoxification'],
      helpText: 'Normal range is 1-3 times daily to 3 times weekly',
    },
    {
      id: 'joint_pain',
      module: 'STRUCTURAL' as any,
      text: 'How often do you experience joint pain?',
      type: 'FREQUENCY' as any,
      frequencyType: 'pain',
      scoringWeight: 3,
      clinicalRelevance: ['Inflammation', 'Structural integrity'],
      seedOilRelevant: true,
      category: 'SEED_OIL' as any,
    },
    {
      id: 'fatigue_pattern',
      module: 'ENERGY' as any,
      text: 'When do you typically experience fatigue?',
      type: 'FREQUENCY' as any,
      frequencyType: 'fatigue',
      scoringWeight: 3,
      clinicalRelevance: ['Mitochondrial function', 'Adrenal health'],
      helpText: 'Consider your energy patterns throughout the day',
    },
  ];

  const getAnalysis = () => {
    const analysis = [];
    
    if (values.bowel === 'weekly_less') {
      analysis.push({ type: 'warning', text: 'Infrequent bowel movements may indicate digestive issues' });
    }
    if (values.pain === 'constant' || values.pain === 'frequent') {
      analysis.push({ type: 'alert', text: 'Frequent pain suggests chronic inflammation' });
    }
    if (values.fatigue === 'all_day') {
      analysis.push({ type: 'alert', text: 'Constant fatigue may indicate mitochondrial dysfunction' });
    }
    if (values.fatigue === 'afternoon_crash') {
      analysis.push({ type: 'info', text: 'Afternoon crashes often relate to blood sugar imbalance' });
    }
    if (values.exercise === 'never' || values.exercise === 'rarely') {
      analysis.push({ type: 'warning', text: 'Regular exercise is crucial for metabolic health' });
    }
    
    return analysis;
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Frequency Component Demo
        </h1>
        <p className="text-gray-600">
          Different frequency patterns for various symptoms
        </p>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {question.text}
            </h3>
            {question.helpText && (
              <p className="text-sm text-gray-600">{question.helpText}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {question.frequencyType ? `Custom: ${question.frequencyType}` : 'Standard'}
              </span>
              {question.seedOilRelevant && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Seed Oil Related
                </span>
              )}
            </div>
          </div>

          <Frequency
            question={question}
            value={values[question.frequencyType || 'standard'] || null}
            onChange={(value) =>
              setValues((prev) => ({ 
                ...prev, 
                [question.frequencyType || 'standard']: value 
              }))
            }
            disabled={false}
          />

          {values[question.frequencyType || 'standard'] && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {values[question.frequencyType || 'standard']}
              </p>
            </div>
          )}
        </div>
      ))}

      {Object.values(values).some(v => v !== null) && (
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Pattern Analysis:</h3>
          <div className="space-y-2">
            {getAnalysis().map((item, index) => (
              <div 
                key={index}
                className={cn(
                  "p-3 rounded-lg flex items-start space-x-2",
                  item.type === 'alert' && "bg-red-50 text-red-800",
                  item.type === 'warning' && "bg-yellow-50 text-yellow-800",
                  item.type === 'info' && "bg-blue-50 text-blue-800"
                )}
              >
                <span className="text-lg">
                  {item.type === 'alert' && '⚠️'}
                  {item.type === 'warning' && '⚡'}
                  {item.type === 'info' && 'ℹ️'}
                </span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
