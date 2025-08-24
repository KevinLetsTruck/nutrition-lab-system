'use client';

import React, { useState } from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  question: AssessmentQuestion;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function NumberInput({
  question,
  value,
  onChange,
  disabled = false
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');

  const min = question.min ?? 0;
  const max = question.max ?? 999;
  const step = question.step ?? 1;
  const unit = question.unit || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseFloat(newValue);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleIncrement = () => {
    const current = value || min;
    const newValue = Math.min(current + step, max);
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const handleDecrement = () => {
    const current = value || min;
    const newValue = Math.max(current - step, min);
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          disabled={disabled || (value !== null && value <= min)}
          className={cn(
            "w-10 h-10 rounded-lg border-2 transition-all",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "border-gray-300"
          )}
        >
          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <div className="flex-1 relative max-w-xs">
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 text-center border rounded-lg",
              "text-gray-900 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-gray-300",
              unit && "pr-12"
            )}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {unit}
            </span>
          )}
        </div>

        <button
          onClick={handleIncrement}
          disabled={disabled || (value !== null && value >= max)}
          className={cn(
            "w-10 h-10 rounded-lg border-2 transition-all",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "border-gray-300"
          )}
        >
          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        Range: {min} - {max} {unit}
        {step !== 1 && ` (step: ${step})`}
      </div>
    </div>
  );
}