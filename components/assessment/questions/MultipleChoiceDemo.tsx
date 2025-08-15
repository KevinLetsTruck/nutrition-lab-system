'use client';

import React, { useState } from 'react';
import { MultipleChoice } from './MultipleChoice';
import { AssessmentQuestion } from '@/lib/assessment/types';

/**
 * Demo component showing MultipleChoice with auto-advance
 */
export function MultipleChoiceDemo() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const questions: AssessmentQuestion[] = [
    {
      id: 'cooking_oil',
      module: 'SCREENING' as any,
      text: 'What type of oil do you most commonly use for cooking?',
      type: 'MULTIPLE_CHOICE' as any,
      options: [
        { value: 'olive', label: 'Olive oil' },
        { value: 'coconut', label: 'Coconut oil' },
        { value: 'canola', label: 'Canola oil', seedOilRisk: 'high' },
        { value: 'vegetable', label: 'Vegetable oil', seedOilRisk: 'high' },
        { value: 'butter', label: 'Butter/Ghee' },
      ],
      scoringWeight: 3,
      clinicalRelevance: ['Seed oil exposure', 'Inflammation'],
      seedOilRelevant: true,
      category: 'SEED_OIL' as any,
    },
    {
      id: 'fried_food_frequency',
      module: 'SCREENING' as any,
      text: 'How often do you eat fried foods from restaurants?',
      type: 'MULTIPLE_CHOICE' as any,
      options: [
        { value: 'never', label: 'Never' },
        { value: 'rarely', label: 'Rarely (1-2 times/month)' },
        { value: 'sometimes', label: 'Sometimes (1-2 times/week)', seedOilRisk: 'medium' },
        { value: 'often', label: 'Often (3-5 times/week)', seedOilRisk: 'high' },
        { value: 'daily', label: 'Daily or more', seedOilRisk: 'high' },
      ],
      scoringWeight: 3,
      clinicalRelevance: ['Seed oil exposure'],
      seedOilRelevant: true,
    },
    {
      id: 'energy_levels',
      module: 'ENERGY' as any,
      text: 'How would you describe your energy levels throughout the day?',
      type: 'MULTIPLE_CHOICE' as any,
      options: [
        { value: 'consistent', label: 'Consistent and stable' },
        { value: 'morning_crash', label: 'Good morning, afternoon crash' },
        { value: 'poor_morning', label: 'Slow start, better later' },
        { value: 'variable', label: 'Highly variable' },
        { value: 'always_low', label: 'Consistently low' },
      ],
      scoringWeight: 2,
      clinicalRelevance: ['Mitochondrial function', 'Adrenal health'],
    },
  ];

  const handleAnswer = (value: string) => {
    const question = questions[currentQuestion];
    setAnswers(prev => ({ ...prev, [question.id]: value }));
    
    // Auto-advance to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 500);
  };

  const resetDemo = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Assessment Complete!</h2>
          <div className="space-y-4">
            <h3 className="font-semibold">Your Answers:</h3>
            {questions.map(q => (
              <div key={q.id} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">{q.text}</p>
                <p className="text-gray-600">
                  Answer: {q.options?.find(o => o.value === answers[q.id])?.label}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={resetDemo}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">MultipleChoice Auto-Advance Demo</h1>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{question.text}</h3>
        
        {question.seedOilRelevant && (
          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            🌻 Seed Oil Assessment
          </div>
        )}

        <MultipleChoice
          question={question}
          value={answers[question.id] || null}
          onChange={handleAnswer}
          disabled={false}
        />

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo Note:</strong> Questions auto-advance after selection. 
            Use keyboard shortcuts A-E for even faster navigation!
          </p>
        </div>
      </div>
    </div>
  );
}
