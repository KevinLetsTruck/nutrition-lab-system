'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

interface MultiSelectProps {
  question: AssessmentQuestion;
  value: string[] | null;
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultiSelect({
  question,
  value,
  onChange,
  disabled = false
}: MultiSelectProps) {
  const options = question.options || [];
  const selectedValues = value || [];
  const maxSelections = question.multiSelectOptions?.maxSelections || options.length;
  const minSelections = question.multiSelectOptions?.minSelections || 0;

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      if (selectedValues.length < maxSelections) {
        onChange([...selectedValues, optionValue]);
      }
    }
  };

  const isValid = selectedValues.length >= minSelections;
  const canSelectMore = selectedValues.length < maxSelections;

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {minSelections > 0 && (
          <span>Select at least {minSelections} option{minSelections > 1 ? 's' : ''}</span>
        )}
        {maxSelections < options.length && (
          <span> • Maximum {maxSelections} selections</span>
        )}
        {selectedValues.length > 0 && (
          <span className="ml-2 text-blue-600">
            ({selectedValues.length} selected)
          </span>
        )}
      </div>
      
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const isDisabled = disabled || (!isSelected && !canSelectMore);
        const isHighRisk = question.seedOilRelevant && option.seedOilRisk === 'high';
        
        return (
          <button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            disabled={isDisabled}
            className={`
              w-full text-left p-4 rounded-lg transition-all
              ${isSelected 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-50 border-2 border-gray-200'
              }
              ${!isDisabled && !isSelected ? 'hover:bg-gray-100' : ''}
              ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${isHighRisk && isSelected ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`
                w-5 h-5 rounded-md border-2 mt-0.5 flex-shrink-0
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
      
      {!isValid && selectedValues.length > 0 && (
        <p className="text-sm text-red-500">
          Please select at least {minSelections} option{minSelections > 1 ? 's' : ''}
        </p>
      )}
      
      {question.seedOilRelevant && selectedValues.some(v => 
        options.find(o => o.value === v && o.seedOilRisk === 'high')
      ) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> One or more selections indicate high seed oil exposure. 
            This information helps us understand your overall dietary patterns.
          </p>
        </div>
      )}
    </div>
  );
}
