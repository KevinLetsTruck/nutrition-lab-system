'use client';

import React from 'react';
import { LikertScaleDemo } from '@/components/assessment/questions/LikertScaleDemo';
import { MultipleChoiceDemo } from '@/components/assessment/questions/MultipleChoiceDemo';
import { YesNoDemo } from '@/components/assessment/questions/YesNoDemo';
import { FrequencyDemo } from '@/components/assessment/questions/FrequencyDemo';
import { DurationDemo } from '@/components/assessment/questions/DurationDemo';

export default function AssessmentDemoPage() {
  const [activeDemo, setActiveDemo] = React.useState<'likert' | 'multiple' | 'yesno' | 'frequency' | 'duration'>('duration');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Assessment Components Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Interactive demonstration of question components with keyboard shortcuts
          </p>
          
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveDemo('likert')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === 'likert'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Likert Scale (0-10)
            </button>
            <button
              onClick={() => setActiveDemo('multiple')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === 'multiple'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Multiple Choice (A-E)
            </button>
            <button
              onClick={() => setActiveDemo('yesno')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === 'yesno'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yes/No (Y/N)
            </button>
            <button
              onClick={() => setActiveDemo('frequency')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === 'frequency'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Frequency
            </button>
            <button
              onClick={() => setActiveDemo('duration')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeDemo === 'duration'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Duration
            </button>
          </div>
        </div>

        <div className="mt-8">
          {activeDemo === 'likert' && <LikertScaleDemo />}
          {activeDemo === 'multiple' && <MultipleChoiceDemo />}
          {activeDemo === 'yesno' && <YesNoDemo />}
          {activeDemo === 'frequency' && <FrequencyDemo />}
          {activeDemo === 'duration' && <DurationDemo />}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Component Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Likert Scale</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">0</kbd> - <kbd className="px-2 py-1 bg-gray-100 rounded">9</kbd> to select values</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> to navigate between scales</li>
                <li>• Visual feedback for severity levels</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Multiple Choice</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">A</kbd> - <kbd className="px-2 py-1 bg-gray-100 rounded">E</kbd> for quick selection</li>
                <li>• Auto-advances to next question</li>
                <li>• Visual confirmation before advancing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Yes/No</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">Y</kbd> for Yes</li>
                <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded">N</kbd> for No</li>
                <li>• Auto-advances immediately</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Frequency</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Standard & custom patterns</li>
                <li>• Bowel, pain, fatigue variants</li>
                <li>• Click to select frequency</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Flexible time units</li>
                <li>• Days, weeks, months, years</li>
                <li>• Auto-validation of ranges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
