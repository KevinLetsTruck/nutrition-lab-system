'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

interface YesNoProps {
  question: AssessmentQuestion;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function YesNo({
  question,
  value,
  onChange,
  disabled = false
}: YesNoProps) {
  // Auto-advance after selection
  const handleSelect = (val: boolean) => {
    onChange(val);
  };

  // Keyboard shortcuts: Y for yes, N for no
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (key === 'y') handleSelect(true);
      if (key === 'n') handleSelect(false);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [disabled]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={disabled}
          className={cn(
            "px-6 py-4 rounded-lg border-2 font-semibold transition-all",
            "hover:scale-105 hover:shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value === true
              ? "bg-green-100 border-green-600 text-green-900"
              : "bg-white border-gray-300 hover:border-green-400"
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Yes</span>
            <span className="text-xs text-gray-500">(Press Y)</span>
          </div>
        </button>

        <button
          onClick={() => handleSelect(false)}
          disabled={disabled}
          className={cn(
            "px-6 py-4 rounded-lg border-2 font-semibold transition-all",
            "hover:scale-105 hover:shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value === false
              ? "bg-red-100 border-red-600 text-red-900"
              : "bg-white border-gray-300 hover:border-red-400"
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>No</span>
            <span className="text-xs text-gray-500">(Press N)</span>
          </div>
        </button>
      </div>
    </div>
  );
}