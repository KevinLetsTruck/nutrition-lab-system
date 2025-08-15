'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

interface FrequencyProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Standard frequency options for most questions
const STANDARD_FREQUENCIES = [
  { value: 'never', label: 'Never', description: '0 times' },
  { value: 'rarely', label: 'Rarely', description: '1-2 times/month' },
  { value: 'sometimes', label: 'Sometimes', description: '1-2 times/week' },
  { value: 'often', label: 'Often', description: '3-5 times/week' },
  { value: 'always', label: 'Always', description: 'Daily or more' }
];

// Custom frequency patterns for specific symptoms
const CUSTOM_FREQUENCIES = {
  bowel: [
    { value: 'multiple_daily', label: 'Multiple times daily', description: '3+ per day' },
    { value: 'daily', label: 'Daily', description: '1-2 per day' },
    { value: 'every_other', label: 'Every other day', description: '3-4 per week' },
    { value: 'twice_weekly', label: 'Twice weekly', description: '2 per week' },
    { value: 'weekly_less', label: 'Weekly or less', description: '≤1 per week' }
  ],
  pain: [
    { value: 'constant', label: 'Constant', description: 'All the time' },
    { value: 'frequent', label: 'Frequent', description: 'Several times daily' },
    { value: 'occasional', label: 'Occasional', description: 'Few times per week' },
    { value: 'rare', label: 'Rare', description: 'Few times per month' },
    { value: 'none', label: 'None', description: 'No pain' }
  ],
  fatigue: [
    { value: 'morning_only', label: 'Morning only', description: 'Worst in AM' },
    { value: 'afternoon_crash', label: 'Afternoon crash', description: '2-4 PM slump' },
    { value: 'evening_only', label: 'Evening only', description: 'Worst in PM' },
    { value: 'all_day', label: 'All day', description: 'Constant fatigue' },
    { value: 'variable', label: 'Variable', description: 'Changes daily' }
  ]
};

export function Frequency({
  question,
  value,
  onChange,
  disabled = false
}: FrequencyProps) {
  // Use custom frequencies if specified, otherwise standard
  const frequencies = question.frequencyType 
    ? CUSTOM_FREQUENCIES[question.frequencyType as keyof typeof CUSTOM_FREQUENCIES] || STANDARD_FREQUENCIES
    : STANDARD_FREQUENCIES;

  return (
    <div className="space-y-3">
      {frequencies.map((freq, index) => (
        <button
          key={freq.value}
          onClick={() => onChange(freq.value)}
          disabled={disabled}
          className={cn(
            "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
            "hover:shadow-md hover:scale-[1.02]",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value === freq.value
              ? "bg-blue-50 border-blue-600"
              : "bg-white border-gray-200 hover:border-blue-400"
          )}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className={cn(
                "font-medium",
                value === freq.value && "text-blue-900"
              )}>
                {freq.label}
              </div>
              <div className="text-sm text-gray-500">
                {freq.description}
              </div>
            </div>
            {value === freq.value && (
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}