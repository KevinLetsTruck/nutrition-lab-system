'use client';

import React, { useState } from 'react';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

interface DurationProps {
  question: AssessmentQuestion;
  value: { amount: number; unit: string } | null;
  onChange: (value: { amount: number; unit: string }) => void;
  disabled?: boolean;
}

const TIME_UNITS = [
  { value: 'days', label: 'Days', max: 30 },
  { value: 'weeks', label: 'Weeks', max: 52 },
  { value: 'months', label: 'Months', max: 24 },
  { value: 'years', label: 'Years', max: 50 }
];

export function Duration({
  question,
  value,
  onChange,
  disabled = false
}: DurationProps) {
  const [amount, setAmount] = useState(value?.amount || 1);
  const [unit, setUnit] = useState(value?.unit || 'weeks');

  const handleAmountChange = (newAmount: number) => {
    const selectedUnit = TIME_UNITS.find(u => u.value === unit);
    const maxValue = selectedUnit?.max || 100;
    const validAmount = Math.min(Math.max(1, newAmount), maxValue);
    setAmount(validAmount);
    onChange({ amount: validAmount, unit });
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    const selectedUnit = TIME_UNITS.find(u => u.value === newUnit);
    const maxValue = selectedUnit?.max || 100;
    // Adjust amount if it exceeds new unit's max
    const validAmount = Math.min(amount, maxValue);
    if (validAmount !== amount) {
      setAmount(validAmount);
    }
    onChange({ amount: validAmount, unit: newUnit });
  };

  const selectedUnit = TIME_UNITS.find(u => u.value === unit);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            min="1"
            max={selectedUnit?.max}
            value={amount}
            onChange={(e) => handleAmountChange(parseInt(e.target.value) || 1)}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 border rounded-lg",
              "text-gray-900 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-gray-300"
            )}
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 border rounded-lg",
              "text-gray-900 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-gray-300"
            )}
          >
            {TIME_UNITS.map(u => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value && (
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <span className="font-semibold text-blue-900">
            {amount} {unit}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Max: {selectedUnit?.max} {unit}
      </div>
    </div>
  );
}