"use client";

import React from "react";
import { AssessmentQuestion } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

interface LikertScaleProps {
  question: AssessmentQuestion;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LikertScale({
  question,
  value,
  onChange,
  disabled = false,
}: LikertScaleProps) {
  // 0-10 scale for better granularity in symptom tracking
  const scale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = parseInt(e.key);
      if (!isNaN(key) && key >= 0 && key <= 10) {
        onChange(key === 10 ? 10 : key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [onChange, disabled]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>{question.scaleMin || "None"}</span>
        <span>{question.scaleMax || "Severe"}</span>
      </div>

      <div className="grid grid-cols-11 gap-2">
        {scale.map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            disabled={disabled}
            className={cn(
              "aspect-square rounded-lg border-2 font-semibold transition-all",
              "hover:scale-110 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              value === num
                ? "bg-blue-500 border-blue-600 text-white"
                : "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-blue-400"
            )}
          >
            {num}
          </button>
        ))}
      </div>

      {value !== null && (
        <div className="text-center text-sm text-gray-400">
          Selected: <span className="font-semibold">{value}</span>
          {value <= 3 && " - Mild"}
          {value >= 4 && value <= 6 && " - Moderate"}
          {value >= 7 && " - Severe"}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Tip: Press number keys 0-9 for quick selection
      </p>
    </div>
  );
}
