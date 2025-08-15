'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';

interface TextInputProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInput({
  question,
  value,
  onChange,
  disabled = false
}: TextInputProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const [charCount, setCharCount] = useState(0);
  
  const maxLength = question.textOptions?.maxLength || 500;
  const minLength = question.textOptions?.minLength || 0;
  const placeholder = question.textOptions?.placeholder || 'Type your answer here...';

  useEffect(() => {
    setCharCount(localValue.length);
  }, [localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  const isValid = localValue.length >= minLength;

  return (
    <div className="space-y-2">
      <textarea
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={question.textOptions?.rows || 4}
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-colors
          ${disabled 
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
            : 'bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }
          ${!isValid && localValue.length > 0 ? 'border-red-300' : ''}
          resize-none focus:outline-none
        `}
      />
      
      <div className="flex justify-between items-center text-sm">
        <div>
          {minLength > 0 && !isValid && (
            <span className="text-red-500">
              Minimum {minLength} characters required
            </span>
          )}
        </div>
        <div className={`
          ${charCount > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'}
        `}>
          {charCount} / {maxLength}
        </div>
      </div>
      
      {question.textOptions?.suggestions && localValue.length === 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-600">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {question.textOptions.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setLocalValue(suggestion);
                  onChange(suggestion);
                }}
                disabled={disabled}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
