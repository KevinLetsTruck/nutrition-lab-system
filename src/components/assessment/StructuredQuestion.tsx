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
    const scaleLabels = ['None', 'Mild', 'Moderate', 'Severe'];
    const scaleDescriptions = ['No symptoms', 'Occasional', 'Regular issue', 'Major impact'];
    const scaleColors = ['bg-green-50 border-green-300', 'bg-yellow-50 border-yellow-300', 'bg-orange-50 border-orange-300', 'bg-red-50 border-red-300'];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[0, 1, 2, 3].map((value) => (
          <button
            key={value}
            onClick={() => handleResponse(value)}
            disabled={isLoading}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              ${selectedValue === value ? 'ring-2 ring-blue-500 transform scale-105' : ''}
              ${scaleColors[value]}
              hover:transform hover:scale-105 hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              flex flex-col items-center justify-center min-h-[100px]
            `}
          >
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-sm font-medium text-gray-700 mt-1">{scaleLabels[value]}</span>
            <span className="text-xs text-gray-600 mt-1">{scaleDescriptions[value]}</span>
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
              ${selectedValue === option.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-300'}
              hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
              flex items-start gap-3
            `}
          >
            {option.icon && <span className="text-2xl mt-0.5">{option.icon}</span>}
            <div className="flex-1">
              <span className="text-base font-medium text-gray-900 block">{option.label}</span>
              {option.description && (
                <span className="text-sm text-gray-600 block mt-1">{option.description}</span>
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
              ${selectedValue === option.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white hover:border-gray-300'}
              hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
              flex flex-col items-center justify-center min-h-[100px]
            `}
          >
            <span className="text-lg font-medium text-gray-900">{option.label}</span>
            {option.description && (
              <span className="text-sm text-gray-600 mt-1">{option.description}</span>
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
    <Card className="p-6 max-w-4xl mx-auto">
      {/* AI Context */}
      {question.aiContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">{question.aiContext}</p>
        </div>
      )}

      {/* Main Question */}
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
        {question.questionText}
      </h3>

      {/* Truck Driver Context */}
      {question.truckDriverContext && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <TruckIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-900">{question.truckDriverContext}</p>
        </div>
      )}

      {/* Response Options */}
      {renderResponseOptions()}
    </Card>
  );
}