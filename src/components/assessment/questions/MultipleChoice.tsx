'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

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

  // Auto-advance after selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    // Parent component will handle auto-advance
  };

  // Keyboard navigation with letters a-z
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      const index = key.charCodeAt(0) - 97; // a=0, b=1, etc.
      if (index >= 0 && index < options.length) {
        handleSelect(options[index].value.toString());
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [options, disabled]);

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const letter = String.fromCharCode(97 + index).toUpperCase();
        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value.toString())}
            disabled={disabled}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
              "hover:shadow-md hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              value === option.value.toString()
                ? "bg-blue-50 border-blue-600"
                : "bg-white border-gray-200 hover:border-blue-400"
            )}
          >
            <div className="flex items-center">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold mr-3">
                {letter}
              </span>
              <span className={cn(
                "flex-grow",
                value === option.value.toString() && "font-semibold"
              )}>
                {option.label}
              </span>
              {value === option.value.toString() && (
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        );
      })}

      <p className="text-xs text-gray-500 text-center mt-4">
        Tip: Press A-{String.fromCharCode(97 + options.length - 1).toUpperCase()} for quick selection
      </p>
    </div>
  );
}