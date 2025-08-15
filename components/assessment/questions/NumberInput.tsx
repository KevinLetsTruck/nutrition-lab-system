'use client';

import React, { useState } from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

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
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  
  const min = question.numberOptions?.min ?? 0;
  const max = question.numberOptions?.max ?? 999;
  const step = question.numberOptions?.step ?? 1;
  const unit = question.numberOptions?.unit || '';
  const prefix = question.numberOptions?.prefix || '';
  const suffix = question.numberOptions?.suffix || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string
    if (newValue === '') {
      setLocalValue('');
      return;
    }
    
    // Allow decimal point if step allows decimals
    if (step < 1 && newValue.endsWith('.')) {
      setLocalValue(newValue);
      return;
    }
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      setLocalValue(newValue);
      onChange(numValue);
    }
  };

  const handleIncrement = () => {
    const current = parseFloat(localValue) || min;
    const newValue = Math.min(current + step, max);
    setLocalValue(newValue.toString());
    onChange(newValue);
  };

  const handleDecrement = () => {
    const current = parseFloat(localValue) || min;
    const newValue = Math.max(current - step, min);
    setLocalValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {prefix && <span className="text-gray-700 font-medium">{prefix}</span>}
        
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || parseFloat(localValue) <= min}
            className={`
              p-2 rounded-l-lg border-2 border-r-0
              ${disabled || parseFloat(localValue) <= min
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <input
            type="number"
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`
              w-32 px-4 py-2 text-center border-2 border-l-0 border-r-0
              ${disabled 
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                : 'bg-white border-gray-300 focus:border-blue-500 focus:z-10'
              }
              focus:outline-none appearance-none
            `}
          />
          
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || parseFloat(localValue) >= max}
            className={`
              p-2 rounded-r-lg border-2 border-l-0
              ${disabled || parseFloat(localValue) >= max
                ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        {(unit || suffix) && (
          <span className="text-gray-700 font-medium">{unit || suffix}</span>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        Range: {min} - {max} {unit}
      </div>
      
      {question.numberOptions?.thresholds && value !== null && (
        <div className="mt-4">
          {question.numberOptions.thresholds.map((threshold, index) => {
            if (value >= threshold.min && value <= threshold.max) {
              return (
                <div 
                  key={index}
                  className={`
                    p-3 rounded-lg border
                    ${threshold.severity === 'high' ? 'bg-red-50 border-red-200' : ''}
                    ${threshold.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : ''}
                    ${threshold.severity === 'low' ? 'bg-green-50 border-green-200' : ''}
                  `}
                >
                  <p className={`
                    text-sm
                    ${threshold.severity === 'high' ? 'text-red-800' : ''}
                    ${threshold.severity === 'medium' ? 'text-yellow-800' : ''}
                    ${threshold.severity === 'low' ? 'text-green-800' : ''}
                  `}>
                    <strong>{threshold.label}:</strong> {threshold.message}
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
