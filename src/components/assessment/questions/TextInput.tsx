'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

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
  const [text, setText] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const maxLength = question.maxLength || 500;

  // Debounce the onChange to avoid too many updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text !== value) {
        setIsSaving(true);
        onChange(text);
        // Simulate save complete
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={question.placeholder || "Please provide details..."}
          rows={4}
          className={cn(
            "w-full px-4 py-3 border rounded-lg resize-none",
            "text-gray-900 placeholder-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "border-gray-300"
          )}
        />
        {isSaving && (
          <div className="absolute top-2 right-2 flex items-center text-sm text-green-600">
            <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>
          {question.required ? 'Required' : 'Optional'}
        </span>
        <span className={cn(
          text.length > maxLength * 0.9 && "text-orange-600",
          text.length === maxLength && "text-red-600"
        )}>
          {text.length} / {maxLength}
        </span>
      </div>

      {text.length > maxLength * 0.9 && text.length < maxLength && (
        <div className="text-xs text-orange-600">
          Approaching character limit
        </div>
      )}
    </div>
  );
}