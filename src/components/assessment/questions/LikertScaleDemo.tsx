'use client';

import React, { useState } from 'react';
import { LikertScale } from './LikertScale';
import { AssessmentQuestion } from '@/lib/assessment/types';

/**
 * Demo component showing different configurations of the LikertScale
 */
export function LikertScaleDemo() {
  const [values, setValues] = useState<Record<string, number | null>>({
    fatigue: null,
    pain: null,
    seedOil: null,
  });

  const questions: AssessmentQuestion[] = [
    {
      id: 'fatigue_level',
      module: 'ENERGY' as any,
      text: 'How severe is your fatigue on a typical day?',
      type: 'LIKERT_SCALE' as any,
      scaleMin: 'No fatigue',
      scaleMax: 'Debilitating',
      scoringWeight: 2,
      clinicalRelevance: ['Mitochondrial dysfunction', 'Adrenal fatigue'],
      required: true,
    },
    {
      id: 'pain_level',
      module: 'STRUCTURAL' as any,
      text: 'Rate your average pain level over the past week',
      type: 'LIKERT_SCALE' as any,
      scaleMin: 'No pain',
      scaleMax: 'Severe pain',
      scoringWeight: 1.5,
      clinicalRelevance: ['Inflammation', 'Tissue damage'],
      helpText: 'Consider your worst pain moments when rating',
    },
    {
      id: 'seed_oil_symptoms',
      module: 'DEFENSE_REPAIR' as any,
      text: 'How often do you experience inflammation after eating fried foods?',
      type: 'LIKERT_SCALE' as any,
      scaleMin: 'Never',
      scaleMax: 'Always',
      scoringWeight: 3,
      clinicalRelevance: ['Seed oil damage', 'Oxidative stress'],
      seedOilRelevant: true,
      category: 'SEED_OIL' as any,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          LikertScale Component Demo
        </h1>
        <p className="text-gray-600">
          Try keyboard shortcuts: Press number keys 0-9 for quick selection
        </p>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Example {index + 1}: {question.text}
            </h3>
            {question.helpText && (
              <p className="text-sm text-gray-600">{question.helpText}</p>
            )}
            {question.seedOilRelevant && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-2">
                Seed Oil Assessment
              </span>
            )}
          </div>

          <LikertScale
            question={question}
            value={values[question.id] || null}
            onChange={(value) =>
              setValues((prev) => ({ ...prev, [question.id]: value }))
            }
            disabled={false}
          />

          {values[question.id] !== null && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Debug Info:</strong> Value = {values[question.id]} | 
                Module = {question.module} | 
                Weight = {question.scoringWeight}
              </p>
            </div>
          )}
        </div>
      ))}

      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Current Values:</h3>
        <pre className="text-sm">{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
