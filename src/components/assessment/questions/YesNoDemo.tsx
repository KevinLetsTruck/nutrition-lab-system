'use client';

import React, { useState } from 'react';
import { YesNo } from './YesNo';
import { AssessmentQuestion } from '@/lib/assessment/types';

/**
 * Demo component showing YesNo with auto-advance
 */
export function YesNoDemo() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const questions: AssessmentQuestion[] = [
    {
      id: 'avoid_seed_oils',
      module: 'SCREENING' as any,
      text: 'Do you actively try to avoid seed oils in your diet?',
      type: 'YES_NO' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Dietary awareness', 'Health consciousness'],
      seedOilRelevant: true,
      category: 'SEED_OIL' as any,
    },
    {
      id: 'read_labels',
      module: 'SCREENING' as any,
      text: 'Do you read ingredient labels when shopping for food?',
      type: 'YES_NO' as any,
      scoringWeight: 1,
      clinicalRelevance: ['Dietary awareness'],
      helpText: 'This helps identify hidden seed oils in processed foods',
    },
    {
      id: 'digestive_issues',
      module: 'ASSIMILATION' as any,
      text: 'Do you experience digestive discomfort after meals?',
      type: 'YES_NO' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Gut health', 'Food sensitivities'],
    },
    {
      id: 'energy_crashes',
      module: 'ENERGY' as any,
      text: 'Do you experience energy crashes in the afternoon?',
      type: 'YES_NO' as any,
      scoringWeight: 2,
      clinicalRelevance: ['Mitochondrial function', 'Blood sugar regulation'],
    },
    {
      id: 'joint_pain',
      module: 'DEFENSE_REPAIR' as any,
      text: 'Do you have chronic joint pain or stiffness?',
      type: 'YES_NO' as any,
      scoringWeight: 3,
      clinicalRelevance: ['Inflammation', 'Autoimmune markers'],
    },
  ];

  const handleAnswer = (value: boolean) => {
    const question = questions[currentQuestion];
    setAnswers(prev => ({ ...prev, [question.id]: value }));

    // Auto-advance to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 300);
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
          <h2 className="text-2xl font-bold mb-4">Quick Assessment Complete!</h2>
          <div className="space-y-4">
            <h3 className="font-semibold">Your Responses:</h3>
            {questions.map(q => (
              <div key={q.id} className="flex items-center justify-between border-b pb-2">
                <p className="text-sm">{q.text}</p>
                <span className={`font-semibold ${answers[q.id] ? 'text-green-600' : 'text-red-600'}`}>
                  {answers[q.id] ? 'Yes' : 'No'}
                </span>
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Quick Analysis:</h4>
              <ul className="text-sm space-y-1">
                {answers.avoid_seed_oils && (
                  <li className="text-green-700">✓ Great job avoiding seed oils!</li>
                )}
                {answers.digestive_issues && (
                  <li className="text-orange-700">⚠ Digestive issues may be related to diet</li>
                )}
                {answers.energy_crashes && (
                  <li className="text-orange-700">⚠ Energy crashes suggest metabolic imbalance</li>
                )}
                {answers.joint_pain && (
                  <li className="text-red-700">⚠ Joint pain indicates inflammation</li>
                )}
              </ul>
            </div>
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
          <h1 className="text-2xl font-bold">Yes/No Quick Assessment Demo</h1>
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
        <h3 className="text-lg font-semibold mb-2">{question.text}</h3>

        {question.helpText && (
          <p className="text-sm text-gray-600 mb-4">{question.helpText}</p>
        )}

        {question.seedOilRelevant && (
          <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            🌻 Seed Oil Related
          </div>
        )}

        <YesNo
          question={question}
          value={answers[question.id] ?? null}
          onChange={handleAnswer}
          disabled={false}
        />

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Quick Tip:</strong> Press <kbd className="px-2 py-1 bg-gray-200 rounded">Y</kbd> for Yes 
            or <kbd className="px-2 py-1 bg-gray-200 rounded">N</kbd> for No. 
            Questions auto-advance for a faster experience!
          </p>
        </div>
      </div>
    </div>
  );
}
