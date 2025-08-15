'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

interface DurationProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const defaultDurations = [
  { value: 'less_than_week', label: 'Less than a week' },
  { value: '1_4_weeks', label: '1-4 weeks' },
  { value: '1_3_months', label: '1-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: '6_12_months', label: '6-12 months' },
  { value: 'over_1_year', label: 'Over 1 year' },
  { value: 'over_5_years', label: 'Over 5 years' }
];

export function Duration({
  question,
  value,
  onChange,
  disabled = false
}: DurationProps) {
  const durations = question.durationOptions || defaultDurations;

  return (
    <div className="space-y-3">
      {durations.map((duration) => {
        const isSelected = value === duration.value;
        const isLongTerm = ['over_1_year', 'over_5_years'].includes(duration.value);
        
        return (
          <button
            key={duration.value}
            onClick={() => onChange(duration.value)}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-lg transition-all
              ${isSelected 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${isLongTerm && isSelected && question.seedOilRelevant 
                ? 'ring-2 ring-orange-400 ring-offset-2' 
                : ''
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex-shrink-0
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
                  {duration.label}
                </p>
                {isLongTerm && question.seedOilRelevant && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                    Long-term exposure
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
      
      {question.seedOilRelevant && value && ['over_1_year', 'over_5_years'].includes(value) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> Long-term exposure to seed oils can lead to cumulative 
            damage. Recovery is possible with the right approach.
          </p>
        </div>
      )}
    </div>
  );
}
