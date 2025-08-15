'use client';

import React from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { LikertScale } from './questions/LikertScale';
import { MultipleChoice } from './questions/MultipleChoice';
import { YesNo } from './questions/YesNo';
import { Frequency } from './questions/Frequency';
import { Duration } from './questions/Duration';
import { TextInput } from './questions/TextInput';
import { MultiSelect } from './questions/MultiSelect';
import { NumberInput } from './questions/NumberInput';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  value: any;
  onChange: (value: any) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  onSubmit,
  disabled = false
}: QuestionRendererProps) {
  // Auto-advance for certain question types
  const handleChange = React.useCallback((newValue: any) => {
    onChange(newValue);
    
    // Auto-advance for multiple choice and yes/no questions
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'YES_NO') {
      // Small delay to show selection before advancing
      setTimeout(() => {
        onSubmit();
      }, 300);
    }
  }, [onChange, onSubmit, question.type]);

  const renderQuestion = () => {
    switch (question.type) {
      case 'LIKERT_SCALE':
        return (
          <LikertScale
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoice
            question={question}
            value={value}
            onChange={handleChange}
            disabled={disabled}
          />
        );
      
      case 'YES_NO':
        return (
          <YesNo
            question={question}
            value={value}
            onChange={handleChange}
            disabled={disabled}
          />
        );
      
      case 'FREQUENCY':
        return (
          <Frequency
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      
      case 'DURATION':
        return (
          <Duration
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      
      case 'TEXT':
        return (
          <TextInput
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      
      case 'MULTI_SELECT':
        return (
          <MultiSelect
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      
      case 'NUMBER':
        return (
          <NumberInput
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      
      default:
        // Default to text input for unknown types
        console.warn('Unknown question type:', question.type);
        return (
          <TextInput
            question={question}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
    }
  };

  // Debug logging
  React.useEffect(() => {
    console.log('QuestionRenderer - question type:', question.type);
    console.log('QuestionRenderer - question:', question);
  }, [question]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900 leading-tight">
          {question.text}
        </h3>
        
        {question.helpText && (
          <p className="text-base text-gray-700 mt-2">
            {question.helpText}
          </p>
        )}
        
        {question.category === 'SEED_OIL' && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            Seed Oil Assessment
          </div>
        )}
      </div>

      <div className="py-4">
        {renderQuestion()}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          {question.required && (
            <span className="text-red-500">* Required</span>
          )}
        </div>
        
        <button
          onClick={onSubmit}
          disabled={disabled || (question.required && !value)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
