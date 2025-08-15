'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

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

  const handleToggle = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  const maxSelections = question.maxSelections;
  const canSelectMore = !maxSelections || selectedValues.length < maxSelections;

  return (
    <div className="space-y-3">
      {maxSelections && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Select up to {maxSelections} options ({selectedValues.length} selected)
        </div>
      )}

      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const isDisabled = disabled || (!isSelected && !canSelectMore);

        return (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            disabled={isDisabled}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
              "hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected
                ? "bg-blue-50 border-blue-600"
                : "bg-white border-gray-200 hover:border-blue-400"
            )}
          >
            <div className="flex items-center">
              <div className={cn(
                "w-5 h-5 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0",
                isSelected
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              )}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={cn(
                "flex-grow",
                isSelected && "font-semibold"
              )}>
                {option.label}
              </span>
            </div>
          </button>
        );
      })}

      {selectedValues.length > 0 && (
        <button
          onClick={() => onChange([])}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-gray-700 underline mt-2"
        >
          Clear all selections
        </button>
      )}
    </div>
  );
}