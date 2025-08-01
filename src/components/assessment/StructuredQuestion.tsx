'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Info, TruckIcon } from 'lucide-react';

export interface ResponseOption {
  value: number | string;
  label: string;
  description?: string;
  icon?: string;
}

export interface StructuredQuestion {
  id: string;
  section: string;
  questionText: string;
  aiContext?: string;
  responseType: 'scale' | 'multiple_choice' | 'binary' | 'frequency';
  options: ResponseOption[];
  followUpLogic?: any;
  truckDriverContext?: string;
}

interface Props {
  question: StructuredQuestion;
  onResponse: (value: number | string) => void;
  isLoading?: boolean;
}

export function StructuredQuestion({ question, onResponse, isLoading }: Props) {
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);

  const handleResponse = (value: number | string) => {
    setSelectedValue(value);
    // Small delay for visual feedback
    setTimeout(() => {
      onResponse(value);
    }, 200);
  };

  const renderScaleButtons = () => {
    // Check if this is asking about severity/symptoms vs quality/rating
    const questionText = question.questionText.toLowerCase();
    const isSymptomQuestion = (questionText.includes('pain') || 
                              questionText.includes('discomfort') || 
                              questionText.includes('symptom') ||
                              questionText.includes('issue') ||
                              questionText.includes('problem')) &&
                             !questionText.includes('quality') &&
                             !questionText.includes('rate');
    
    const scaleLabels = isSymptomQuestion 
      ? ['None', 'Mild', 'Moderate', 'Severe']
      : ['Poor', 'Fair', 'Good', 'Excellent'];
      
    const scaleDescriptions = isSymptomQuestion
      ? ['No symptoms', 'Occasional', 'Regular issue', 'Major impact']
      : ['Significant issues', 'Some problems', 'Generally good', 'Very good'];
      
    // Reverse colors for quality questions (poor=red, excellent=green)
    const scaleColors = isSymptomQuestion ? [
      'bg-green-900/20 border-green-600 hover:bg-green-900/30',
      'bg-yellow-900/20 border-yellow-600 hover:bg-yellow-900/30',
      'bg-orange-900/20 border-orange-600 hover:bg-orange-900/30',
      'bg-red-900/20 border-red-600 hover:bg-red-900/30'
    ] : [
      'bg-red-900/20 border-red-600 hover:bg-red-900/30',
      'bg-orange-900/20 border-orange-600 hover:bg-orange-900/30',
      'bg-yellow-900/20 border-yellow-600 hover:bg-yellow-900/30',
      'bg-green-900/20 border-green-600 hover:bg-green-900/30'
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[0, 1, 2, 3].map((value) => (
          <button
            key={value}
            onClick={() => handleResponse(value)}
            disabled={isLoading}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              ${selectedValue === value ? 'ring-2 ring-[#10b981] transform scale-105' : ''}
              ${scaleColors[value]}
              hover:transform hover:scale-105 hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              flex flex-col items-center justify-center min-h-[100px]
            `}
          >
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-sm font-medium text-gray-200 mt-1">{scaleLabels[value]}</span>
            <span className="text-xs text-gray-400 mt-1">{scaleDescriptions[value]}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderMultipleChoiceButtons = () => {
    return (
      <div className="space-y-3 mt-6">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleResponse(option.value)}
            disabled={isLoading}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedValue === option.value 
                ? 'border-[#10b981] bg-[#10b981]/20 ring-2 ring-[#10b981]' 
                : 'border-[#4338ca] bg-[#1e1b4b] hover:border-[#10b981] hover:bg-[#4338ca]/20'}
              hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
              flex items-start gap-3
            `}
          >
            {option.icon && <span className="text-2xl mt-0.5">{option.icon}</span>}
            <div className="flex-1">
              <span className="text-base font-medium text-white block">{option.label}</span>
              {option.description && (
                <span className="text-sm text-gray-300 block mt-1">{option.description}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderBinaryButtons = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mt-6">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleResponse(option.value)}
            disabled={isLoading}
            className={`
              p-6 rounded-lg border-2 transition-all duration-200
              ${selectedValue === option.value 
                ? 'border-[#10b981] bg-[#10b981]/20 ring-2 ring-[#10b981]' 
                : 'border-[#4338ca] bg-[#1e1b4b] hover:border-[#10b981] hover:bg-[#4338ca]/20'}
              hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
              flex flex-col items-center justify-center min-h-[100px]
            `}
          >
            <span className="text-lg font-medium text-white">{option.label}</span>
            {option.description && (
              <span className="text-sm text-gray-300 mt-1">{option.description}</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderResponseOptions = () => {
    switch (question.responseType) {
      case 'scale':
        return renderScaleButtons();
      case 'multiple_choice':
        return renderMultipleChoiceButtons();
      case 'binary':
        return renderBinaryButtons();
      case 'frequency':
        return renderMultipleChoiceButtons(); // Same as multiple choice
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto bg-[#312e81] border-[#4338ca]">
      {/* AI Context */}
      {question.aiContext && (
        <div className="bg-[#4338ca]/20 border border-[#4338ca] rounded-lg p-3 mb-4 flex items-start gap-2">
          <Info className="h-5 w-5 text-[#818cf8] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-200">{question.aiContext}</p>
        </div>
      )}

      {/* Main Question */}
      <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
        {question.questionText}
      </h3>

      {/* Truck Driver Context */}
      {question.truckDriverContext && (
        <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-3 mb-4 flex items-start gap-2">
          <TruckIcon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-200">{question.truckDriverContext}</p>
        </div>
      )}

      {/* Response Options */}
      {renderResponseOptions()}
    </Card>
  );
}