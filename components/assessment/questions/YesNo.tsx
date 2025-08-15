'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

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
  return (
    <div className="flex space-x-4">
      <button
        onClick={() => onChange(true)}
        disabled={disabled}
        className={`
          flex-1 py-4 px-6 rounded-lg font-medium transition-all
          ${value === true 
            ? 'bg-green-100 border-2 border-green-500 text-green-900' 
            : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Yes</span>
        </div>
      </button>
      
      <button
        onClick={() => onChange(false)}
        disabled={disabled}
        className={`
          flex-1 py-4 px-6 rounded-lg font-medium transition-all
          ${value === false 
            ? 'bg-red-100 border-2 border-red-500 text-red-900' 
            : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>No</span>
        </div>
      </button>
    </div>
  );
}
