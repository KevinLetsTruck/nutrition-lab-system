'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ModuleProgress {
  [key: string]: number;
}

interface AssessmentProgressProps {
  currentModule: string;
  questionsAsked: number;
  completionRate: number;
  moduleProgress: ModuleProgress;
  estimatedMinutesRemaining: number;
}

const moduleNames: Record<string, string> = {
  SCREENING: 'Initial Screening',
  ASSIMILATION: 'Digestive Health',
  DEFENSE_REPAIR: 'Immune & Inflammation',
  ENERGY: 'Energy & Mitochondria',
  BIOTRANSFORMATION: 'Detoxification',
  TRANSPORT: 'Cardiovascular',
  COMMUNICATION: 'Hormonal & Neurological',
  STRUCTURAL: 'Musculoskeletal'
};

const moduleColors: Record<string, string> = {
  SCREENING: 'bg-gray-500',
  ASSIMILATION: 'bg-green-500',
  DEFENSE_REPAIR: 'bg-red-500',
  ENERGY: 'bg-yellow-500',
  BIOTRANSFORMATION: 'bg-purple-500',
  TRANSPORT: 'bg-blue-500',
  COMMUNICATION: 'bg-indigo-500',
  STRUCTURAL: 'bg-orange-500'
};

export function AssessmentProgress({
  currentModule,
  questionsAsked,
  completionRate,
  moduleProgress,
  estimatedMinutesRemaining
}: AssessmentProgressProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-2xl font-bold text-blue-600">
            {Math.round(completionRate)}%
          </span>
        </div>
        <Progress value={completionRate} className="h-3" />
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{questionsAsked} questions answered</span>
          <span>~{formatTime(estimatedMinutesRemaining)} remaining</span>
        </div>
      </div>

      {/* Current Module */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${moduleColors[currentModule]}`} />
          <span className="text-sm font-medium text-gray-700">Currently in:</span>
          <span className="text-sm font-bold text-gray-900">
            {moduleNames[currentModule] || currentModule}
          </span>
        </div>
      </div>

      {/* Module Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Module Progress</h4>
        <div className="space-y-2">
          {Object.entries(moduleNames).map(([key, name]) => {
            const count = moduleProgress[key] || 0;
            const isActive = key === currentModule;
            const isCompleted = count > 0 && key !== currentModule;
            
            return (
              <div key={key} className="flex items-center space-x-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${isActive ? `${moduleColors[key]} text-white` : ''}
                  ${isCompleted ? 'bg-green-100 text-green-700' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-400' : ''}
                `}>
                  {isCompleted ? '✓' : count || '-'}
                </div>
                <div className="flex-1">
                  <span className={`
                    text-sm
                    ${isActive ? 'font-semibold text-gray-900' : ''}
                    ${isCompleted ? 'text-gray-700' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                  `}>
                    {name}
                  </span>
                  {count > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({count} question{count !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-sm text-green-800">
          {completionRate < 25 && "Great start! Every question helps us understand your health better."}
          {completionRate >= 25 && completionRate < 50 && "You're making excellent progress! Keep going!"}
          {completionRate >= 50 && completionRate < 75 && "Over halfway there! Your dedication is impressive."}
          {completionRate >= 75 && "Almost done! Just a few more questions to complete your assessment."}
        </p>
      </div>
    </div>
  );
}
