'use client';

import React, { useState } from 'react';
import { TextInput } from './TextInput';
import { AssessmentQuestion } from '@/lib/assessment/types';

/**
 * Demo component showing TextInput with different configurations
 */
export function TextInputDemo() {
  const [values, setValues] = useState<Record<string, string | null>>({
    symptoms: null,
    diet: null,
    medications: null,
    goals: null,
  });

  const questions: AssessmentQuestion[] = [
    {
      id: 'symptom_description',
      module: 'SCREENING' as any,
      text: 'Please describe your main symptoms in detail',
      type: 'TEXT' as any,
      scoringWeight: 1,
      clinicalRelevance: ['Symptom patterns', 'Patient expression'],
      placeholder: 'Describe when symptoms occur, what makes them better or worse, and how they affect your daily life...',
      maxLength: 500,
      required: true,
    },
    {
      id: 'dietary_details',
      module: 'ASSIMILATION' as any,
      text: 'Describe your typical daily diet',
      type: 'TEXT' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Nutritional intake', 'Seed oil exposure'],
      placeholder: 'Include breakfast, lunch, dinner, snacks, and beverages...',
      maxLength: 300,
      seedOilRelevant: true,
      category: 'SEED_OIL' as any,
    },
    {
      id: 'medication_list',
      module: 'DEFENSE_REPAIR' as any,
      text: 'List all medications and supplements you currently take',
      type: 'TEXT' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Drug interactions', 'Supplement usage'],
      placeholder: 'Include dosages and frequency for each...',
      maxLength: 400,
      helpText: 'Include prescription medications, over-the-counter drugs, vitamins, and herbal supplements',
    },
    {
      id: 'health_goals',
      module: 'SCREENING' as any,
      text: 'What are your primary health goals?',
      type: 'TEXT' as any,
      scoringWeight: 1,
      clinicalRelevance: ['Patient motivation', 'Treatment alignment'],
      placeholder: 'What would you like to achieve through this assessment and treatment?',
      maxLength: 250,
      required: false,
    },
  ];

  const getWordCount = (text: string | null) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const analyzeResponses = () => {
    const analysis = [];

    // Check for seed oil mentions in diet
    if (values.diet && /fried|canola|vegetable oil|seed oil/i.test(values.diet)) {
      analysis.push({
        type: 'warning',
        text: 'Potential seed oil exposure detected in diet description'
      });
    }

    // Check for polypharmacy
    const medicationCount = values.medications ? 
      values.medications.split(/,|\n/).filter(m => m.trim()).length : 0;
    if (medicationCount >= 5) {
      analysis.push({
        type: 'alert',
        text: 'Multiple medications detected - consider drug interaction review'
      });
    }

    // Check response completeness
    const totalWords = Object.values(values).reduce((sum, val) => 
      sum + getWordCount(val), 0
    );
    if (totalWords < 50) {
      analysis.push({
        type: 'info',
        text: 'Brief responses detected - follow-up questions may be needed'
      });
    }

    return analysis;
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Text Input Component Demo
        </h1>
        <p className="text-gray-600">
          Detailed text responses with auto-save functionality
        </p>
      </div>

      {questions.map((question, index) => {
        const key = ['symptoms', 'diet', 'medications', 'goals'][index];

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

            <TextInput
              question={question}
              value={values[key]}
              onChange={(value) =>
                setValues((prev) => ({ ...prev, [key]: value }))
              }
              disabled={false}
            />

            {values[key] && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Words: {getWordCount(values[key])}</span>
                  <span>Characters: {values[key]!.length}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {Object.values(values).some(v => v && v.length > 0) && (
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Response Analysis:</h3>
          <div className="space-y-2">
            {analyzeResponses().map((item, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-start space-x-2 ${
                  item.type === 'alert' ? 'bg-red-50 text-red-800' :
                  item.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                  'bg-blue-50 text-blue-800'
                }`}
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

          <div className="mt-4 p-3 bg-white rounded-lg">
            <h4 className="font-medium mb-2">Auto-Save Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Saves automatically after 500ms of inactivity</li>
              <li>✓ Shows "Saving..." indicator during save</li>
              <li>✓ Character count with color warnings</li>
              <li>✓ Preserves text during navigation</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
