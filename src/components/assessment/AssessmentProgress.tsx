'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ModuleType } from '@/lib/assessment/types';

interface AssessmentProgressProps {
  currentModule: ModuleType;
  questionsInModule: number;
  questionsAnswered: number;
  totalQuestionsAsked: number;
  questionsSaved: number;
}

const MODULE_INFO = {
  SCREENING: { name: 'Screening', total: 75, color: 'bg-blue-600' },
  ASSIMILATION: { name: 'Digestive System', total: 65, color: 'bg-green-600' },
  DEFENSE_REPAIR: { name: 'Immune System', total: 60, color: 'bg-purple-600' },
  ENERGY: { name: 'Energy & Metabolism', total: 70, color: 'bg-yellow-600' },
  BIOTRANSFORMATION: { name: 'Detoxification', total: 55, color: 'bg-red-600' },
  TRANSPORT: { name: 'Cardiovascular', total: 50, color: 'bg-pink-600' },
  COMMUNICATION: { name: 'Hormones & Brain', total: 75, color: 'bg-indigo-600' },
  STRUCTURAL: { name: 'Musculoskeletal', total: 45, color: 'bg-gray-600' }
};

export function AssessmentProgress({
  currentModule,
  questionsInModule,
  questionsAnswered,
  totalQuestionsAsked,
  questionsSaved
}: AssessmentProgressProps) {
  const moduleInfo = MODULE_INFO[currentModule];
  const progress = (questionsAnswered / questionsInModule) * 100;
  const efficiencyRate = questionsSaved > 0 
    ? Math.round((questionsSaved / (totalQuestionsAsked + questionsSaved)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* Current Module Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900">
            {moduleInfo.name}
          </h3>
          <span className="text-sm text-gray-600">
            {questionsAnswered} / {questionsInModule} questions
          </span>
        </div>

        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full transition-all duration-500",
              moduleInfo.color
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Overall Stats - Simplified */}
      <div className="text-center pt-2 border-t">
        <div className="text-2xl font-bold text-gray-900">
          {totalQuestionsAsked}
        </div>
        <div className="text-xs text-gray-600">
          Total Questions Completed
        </div>
      </div>

      {/* Module List Preview */}
      <div className="pt-2 border-t">
        <div className="text-xs text-gray-500 mb-2">Assessment Modules</div>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(MODULE_INFO).map(([key, info]) => (
            <div
              key={key}
              className={cn(
                "h-1 rounded-full",
                key === currentModule ? info.color : "bg-gray-200"
              )}
              title={info.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
