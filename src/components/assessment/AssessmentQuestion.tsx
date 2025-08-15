"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AssessmentQuestion as QuestionType,
  QuestionOption,
  isScaleQuestion,
  isOptionsQuestion,
} from "@/lib/assessment/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AssessmentQuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
  onAutoSave?: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Renders an assessment question based on its type
 * Implements auto-save functionality to prevent data loss
 */
export function AssessmentQuestion({
  question,
  value,
  onChange,
  onAutoSave,
  error,
  disabled = false,
}: AssessmentQuestionProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (onAutoSave && localValue !== value) {
      const timer = setTimeout(async () => {
        setIsSaving(true);
        await onAutoSave(localValue);
        setIsSaving(false);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timer);
    }
  }, [localValue, value, onAutoSave]);

  const handleChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // Render multiple choice question
  if (question.type === "multiple_choice" && isOptionsQuestion(question)) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
        <div className="space-y-2">
          {question.options.map((option: QuestionOption) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                localValue === option.value
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={localValue === option.value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className="mr-3"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>
    );
  }

  // Render scale question
  if (question.type === "scale" && isScaleQuestion(question)) {
    const {
      min,
      max,
      step = 1,
      minLabel,
      maxLabel,
      midLabel,
    } = question.scaleConfig;
    const midPoint = Math.floor((max + min) / 2);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
        <div className="space-y-4">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue || min}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{minLabel || min}</span>
            {midLabel && <span>{midLabel}</span>}
            <span>{maxLabel || max}</span>
          </div>
          <div className="text-center text-lg font-semibold">
            {localValue || min}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>
    );
  }

  // Render text question
  if (question.type === "text") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
        <textarea
          value={localValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 border rounded-lg resize-none"
          rows={3}
          placeholder="Enter your response..."
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>
    );
  }

  // Render number question
  if (question.type === "number") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
        <Input
          type="number"
          value={localValue || ""}
          onChange={(e) =>
            handleChange(e.target.value ? Number(e.target.value) : null)
          }
          disabled={disabled}
          className="w-full"
          placeholder="Enter a number..."
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>
    );
  }

  // Render boolean question
  if (question.type === "boolean") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
        <div className="flex space-x-4">
          <Button
            type="button"
            onClick={() => handleChange(true)}
            disabled={disabled}
            className={`px-6 py-2 ${
              localValue === true
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Yes
          </Button>
          <Button
            type="button"
            onClick={() => handleChange(false)}
            disabled={disabled}
            className={`px-6 py-2 ${
              localValue === false
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            No
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>
    );
  }

  // Render multi-select question
  if (question.type === "multi_select" && isOptionsQuestion(question)) {
    const selectedValues = Array.isArray(localValue) ? localValue : [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      handleChange(newValues);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.helpText && (
          <p className="text-sm text-gray-500">{question.helpText}</p>
        )}
        <div className="space-y-2">
          {question.options.map((option: QuestionOption) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedValues.includes(option.value)
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                value={option.value}
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                disabled={disabled}
                className="mr-3"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">
        Unsupported question type: {question.type}
      </p>
    </div>
  );
}
