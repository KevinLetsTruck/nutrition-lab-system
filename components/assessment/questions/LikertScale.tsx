'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

interface LikertScaleProps {
  question: AssessmentQuestion;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LikertScale({
  question,
  value,
  onChange,
  disabled = false
}: LikertScaleProps) {
  const scale = question.scale || {
    min: 0,
    max: 10,
    labels: {
      0: 'Never',
      5: 'Sometimes',
      10: 'Always'
    }
  };

  const renderOption = (num: number) => {
    const label = scale.labels?.[num];
    const isSelected = value === num;
    
    return (
      <button
        key={num}
        onClick={() => onChange(num)}
        disabled={disabled}
        className={`
          relative flex flex-col items-center p-3 rounded-lg transition-all
          ${isSelected 
            ? 'bg-blue-100 border-2 border-blue-500' 
            : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${question.seedOilRelevant && isSelected && num >= 7 
            ? 'ring-2 ring-orange-400 ring-offset-2' 
            : ''
          }
        `}
      >
        <span className={`text-2xl font-bold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
          {num}
        </span>
        {label && (
          <span className={`text-xs mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
            {label}
          </span>
        )}
      </button>
    );
  };

  const options = [];
  for (let i = scale.min; i <= scale.max; i++) {
    options.push(i);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-11 gap-2">
        {options.map(renderOption)}
      </div>
      
      {question.seedOilRelevant && value !== null && value >= 7 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> This response indicates potential high seed oil exposure. 
            Additional questions will help assess the impact.
          </p>
        </div>
      )}
    </div>
  );
}
