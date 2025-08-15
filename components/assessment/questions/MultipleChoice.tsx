'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

interface MultipleChoiceProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({
  question,
  value,
  onChange,
  disabled = false
}: MultipleChoiceProps) {
  const options = question.options || [];

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        const isHighRisk = question.seedOilRelevant && option.seedOilRisk === 'high';
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-lg transition-all
              ${isSelected 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${isHighRisk && isSelected ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
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
                  {option.label}
                </p>
                {option.description && (
                  <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {option.description}
                  </p>
                )}
                {isHighRisk && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-2">
                    High Seed Oil Risk
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
      
      {question.seedOilRelevant && value && options.find(o => o.value === value && o.seedOilRisk === 'high') && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Important:</strong> This choice suggests high seed oil exposure. 
            We'll explore this further to understand the impact on your health.
          </p>
        </div>
      )}
    </div>
  );
}
