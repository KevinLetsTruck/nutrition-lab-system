'use client';

import React, { useState } from 'react';
import { Duration } from './Duration';
import { AssessmentQuestion } from '@/lib/assessment/types';

/**
 * Demo component showing Duration input for various symptoms
 */
export function DurationDemo() {
  const [values, setValues] = useState<Record<string, { amount: number; unit: string } | null>>({
    symptom: null,
    seedOil: null,
    medication: null,
    improvement: null,
  });

  const questions: AssessmentQuestion[] = [
    {
      id: 'symptom_duration',
      module: 'SCREENING' as any,
      text: 'How long have you been experiencing these symptoms?',
      type: 'DURATION' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Symptom chronicity', 'Disease progression'],
      helpText: 'This helps us understand if your condition is acute or chronic',
    },
    {
      id: 'seed_oil_avoidance',
      module: 'SCREENING' as any,
      text: 'How long have you been avoiding seed oils?',
      type: 'DURATION' as any,
      scoringWeight: 3,
      clinicalRelevance: ['Dietary changes', 'Recovery timeline'],
      seedOilRelevant: true,
      category: 'SEED_OIL' as any,
    },
    {
      id: 'medication_duration',
      module: 'DEFENSE_REPAIR' as any,
      text: 'How long have you been taking your current medications?',
      type: 'DURATION' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Medication effectiveness', 'Side effects'],
      helpText: 'Include prescription and over-the-counter medications',
    },
    {
      id: 'improvement_timeline',
      module: 'ENERGY' as any,
      text: 'When making dietary changes, how long until you typically see improvement?',
      type: 'DURATION' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Response to interventions', 'Healing capacity'],
    },
  ];

  const getAnalysis = () => {
    const analysis = [];
    
    // Convert all durations to days for comparison
    const toDays = (value: { amount: number; unit: string } | null) => {
      if (!value) return 0;
      const multipliers: Record<string, number> = {
        days: 1,
        weeks: 7,
        months: 30,
        years: 365
      };
      return value.amount * (multipliers[value.unit] || 1);
    };

    const symptomDays = toDays(values.symptom);
    const seedOilDays = toDays(values.seedOil);
    const medicationDays = toDays(values.medication);
    const improvementDays = toDays(values.improvement);

    if (symptomDays > 365) {
      analysis.push({ 
        type: 'alert', 
        text: 'Chronic symptoms (>1 year) require comprehensive investigation' 
      });
    } else if (symptomDays > 90) {
      analysis.push({ 
        type: 'warning', 
        text: 'Symptoms lasting >3 months are considered chronic' 
      });
    }

    if (seedOilDays > 0 && seedOilDays < 30) {
      analysis.push({ 
        type: 'info', 
        text: 'Early stages of seed oil elimination - full benefits take 3-6 months' 
      });
    } else if (seedOilDays >= 180) {
      analysis.push({ 
        type: 'success', 
        text: 'Excellent! Long-term seed oil avoidance shows commitment to health' 
      });
    }

    if (medicationDays > 730) {
      analysis.push({ 
        type: 'warning', 
        text: 'Long-term medication use may need review for effectiveness' 
      });
    }

    if (improvementDays > 90) {
      analysis.push({ 
        type: 'info', 
        text: 'Slow response to changes may indicate deeper metabolic issues' 
      });
    }
    
    return analysis;
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Duration Component Demo
        </h1>
        <p className="text-gray-600">
          Flexible time input for symptom and treatment duration
        </p>
      </div>

      {questions.map((question, index) => {
        const key = ['symptom', 'seedOil', 'medication', 'improvement'][index];
        
        return (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {question.text}
              </h3>
              {question.helpText && (
                <p className="text-sm text-gray-600">{question.helpText}</p>
              )}
              {question.seedOilRelevant && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-2">
                  🌻 Seed Oil Related
                </span>
              )}
            </div>

            <Duration
              question={question}
              value={values[key]}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [key]: value }))
              }
              disabled={false}
            />

            {values[key] && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Duration:</strong> {values[key]!.amount} {values[key]!.unit}
                  {values[key]!.unit === 'years' && values[key]!.amount >= 5 && (
                    <span className="ml-2 text-orange-600">(Long-term)</span>
                  )}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {Object.values(values).some(v => v !== null) && (
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Timeline Analysis:</h3>
          <div className="space-y-2">
            {getAnalysis().map((item, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-start space-x-2 ${
                  item.type === 'alert' ? 'bg-red-50 text-red-800' :
                  item.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  item.type === 'info' ? 'bg-blue-50 text-blue-800' :
                  'bg-green-50 text-green-800'
                }`}
              >
                <span className="text-lg">
                  {item.type === 'alert' && '⚠️'}
                  {item.type === 'warning' && '⚡'}
                  {item.type === 'info' && 'ℹ️'}
                  {item.type === 'success' && '✅'}
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
