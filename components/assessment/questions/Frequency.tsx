'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

interface FrequencyProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const defaultFrequencies = [
  { value: 'never', label: 'Never', description: 'Not at all' },
  { value: 'rarely', label: 'Rarely', description: '1-2 times per month' },
  { value: 'sometimes', label: 'Sometimes', description: '1-2 times per week' },
  { value: 'often', label: 'Often', description: '3-5 times per week' },
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'multiple_daily', label: 'Multiple times daily', description: '2+ times per day' }
];

export function Frequency({
  question,
  value,
  onChange,
  disabled = false
}: FrequencyProps) {
  const frequencies = question.frequencyOptions || defaultFrequencies;
  
  const getSeedOilRiskLevel = (freq: string) => {
    if (question.seedOilRelevant) {
      if (['daily', 'multiple_daily'].includes(freq)) return 'high';
      if (['often'].includes(freq)) return 'medium';
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {frequencies.map((freq) => {
        const isSelected = value === freq.value;
        const riskLevel = getSeedOilRiskLevel(freq.value);
        
        return (
          <button
            key={freq.value}
            onClick={() => onChange(freq.value)}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-lg transition-all
              ${isSelected 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${riskLevel === 'high' && isSelected ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
              ${riskLevel === 'medium' && isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`
                w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0
                ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white m-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {freq.label}
                </p>
                {freq.description && (
                  <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {freq.description}
                  </p>
                )}
                {riskLevel && (
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2
                    ${riskLevel === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                    ${riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  `}>
                    {riskLevel === 'high' ? 'High' : 'Medium'} Seed Oil Exposure
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
      
      {question.seedOilRelevant && value && ['daily', 'multiple_daily'].includes(value) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Alert:</strong> Frequent consumption suggests high seed oil exposure. 
            This may be contributing to inflammation and other health issues.
          </p>
        </div>
      )}
    </div>
  );
}
