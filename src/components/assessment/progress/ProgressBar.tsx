'use client';

import React from 'react';

interface ProgressBarProps {
  currentModule: string;
  completionRate: number;
  questionsAsked: number;
  onPause?: () => void;
  isPaused?: boolean;
}

export function ProgressBar({
  currentModule,
  completionRate,
  questionsAsked,
  onPause,
  isPaused = false
}: ProgressBarProps) {
  const moduleShortNames: Record<string, string> = {
    SCREENING: 'Screening',
    ASSIMILATION: 'Digestion',
    DEFENSE_REPAIR: 'Immune',
    ENERGY: 'Energy',
    BIOTRANSFORMATION: 'Detox',
    TRANSPORT: 'Cardio',
    COMMUNICATION: 'Hormones',
    STRUCTURAL: 'Structure'
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              {moduleShortNames[currentModule] || currentModule}
            </span>
            <span className="text-sm text-gray-500">
              Question {questionsAsked + 1}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-blue-600">
              {Math.round(completionRate)}%
            </span>
            {onPause && (
              <button
                onClick={onPause}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${completionRate}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500 ease-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
