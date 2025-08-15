"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  AssessmentTemplate,
  AssessmentResponse,
  AssessmentSession,
  AssessmentCategory,
} from "@/lib/assessment/types";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { APIResponse } from "@/types/api";

interface AssessmentFormProps {
  template: AssessmentTemplate;
  session: AssessmentSession;
  onSave: (
    responses: Partial<AssessmentResponse>[]
  ) => Promise<APIResponse<AssessmentSession>>;
  onComplete: () => Promise<APIResponse<AssessmentSession>>;
  autoSaveInterval?: number; // milliseconds
}

/**
 * Main assessment form component that manages the assessment session
 * Implements auto-save, progress tracking, and category navigation
 */
export function AssessmentForm({
  template,
  session,
  onSave,
  onComplete,
  autoSaveInterval = 30000, // 30 seconds default
}: AssessmentFormProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Initialize responses from session data
  useEffect(() => {
    const initialResponses: Record<string, any> = {};
    session.responses.forEach((response) => {
      initialResponses[response.questionId] = response.value;
    });
    setResponses(initialResponses);
  }, [session.responses]);

  // Auto-save functionality
  useEffect(() => {
    if (!unsavedChanges) return;

    const timer = setTimeout(async () => {
      await handleAutoSave();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [responses, unsavedChanges, autoSaveInterval]);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  const currentCategory = template.categories[currentCategoryIndex];
  const categoryQuestions = template.questions.filter(
    (q) => q.category === currentCategory.id
  );

  const totalQuestions = template.questions.length;
  const answeredQuestions = Object.keys(responses).filter(
    (qId) => responses[qId] !== null && responses[qId] !== undefined
  ).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  /**
   * Handle response change with validation
   */
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setUnsavedChanges(true);

    // Clear error for this question
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  }, []);

  /**
   * Auto-save current responses
   */
  const handleAutoSave = useCallback(async () => {
    if (!unsavedChanges) return;

    setIsSaving(true);
    try {
      const responsesToSave: Partial<AssessmentResponse>[] = Object.entries(
        responses
      ).map(([questionId, value]) => ({
        questionId,
        value,
        source: "manual" as const,
        timestamp: new Date(),
      }));

      const result = await onSave(responsesToSave);
      if (result.success) {
        setLastSaved(new Date());
        setUnsavedChanges(false);
      } else {
        console.error("Auto-save failed:", result.error);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [responses, unsavedChanges, onSave]);

  /**
   * Validate current category questions
   */
  const validateCurrentCategory = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    categoryQuestions.forEach((question) => {
      if (question.required && !responses[question.id]) {
        newErrors[question.id] = "This field is required";
        isValid = false;
      }

      // Custom validation rules
      question.validationRules?.forEach((rule) => {
        const value = responses[question.id];
        if (value === null || value === undefined) return;

        switch (rule.type) {
          case "min":
            if (Number(value) < rule.value) {
              newErrors[question.id] = rule.message;
              isValid = false;
            }
            break;
          case "max":
            if (Number(value) > rule.value) {
              newErrors[question.id] = rule.message;
              isValid = false;
            }
            break;
          case "pattern":
            if (!new RegExp(rule.value).test(String(value))) {
              newErrors[question.id] = rule.message;
              isValid = false;
            }
            break;
          case "custom":
            if (rule.validator && !rule.validator(value)) {
              newErrors[question.id] = rule.message;
              isValid = false;
            }
            break;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Navigate to next category
   */
  const handleNextCategory = async () => {
    if (!validateCurrentCategory()) {
      return;
    }

    // Save before moving to next category
    await handleAutoSave();

    if (currentCategoryIndex < template.categories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
    }
  };

  /**
   * Navigate to previous category
   */
  const handlePreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
    }
  };

  /**
   * Complete the assessment
   */
  const handleComplete = async () => {
    // Validate all categories
    let allValid = true;
    const allErrors: Record<string, string> = {};

    template.questions.forEach((question) => {
      if (question.required && !responses[question.id]) {
        allErrors[question.id] = "This field is required";
        allValid = false;
      }
    });

    if (!allValid) {
      setErrors(allErrors);
      // Find first category with errors
      const firstErrorCategory = template.categories.findIndex((cat) =>
        template.questions
          .filter((q) => q.category === cat.id)
          .some((q) => allErrors[q.id])
      );
      if (firstErrorCategory !== -1) {
        setCurrentCategoryIndex(firstErrorCategory);
      }
      return;
    }

    // Save and complete
    await handleAutoSave();
    const result = await onComplete();

    if (!result.success) {
      console.error("Failed to complete assessment:", result.error);
    }
  };

  /**
   * Check if a question should be displayed based on conditional rules
   */
  const shouldDisplayQuestion = (
    question: (typeof template.questions)[0]
  ): boolean => {
    if (!question.conditionalDisplay) return true;

    const { dependsOn, condition, value } = question.conditionalDisplay;
    const dependentValue = responses[dependsOn];

    switch (condition) {
      case "equals":
        return dependentValue === value;
      case "not_equals":
        return dependentValue !== value;
      case "contains":
        return Array.isArray(dependentValue) && dependentValue.includes(value);
      case "greater_than":
        return Number(dependentValue) > Number(value);
      case "less_than":
        return Number(dependentValue) < Number(value);
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
        <p className="text-gray-600">{template.description}</p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Progress: {answeredQuestions} of {totalQuestions} questions
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Save status */}
        <div className="mt-2 text-sm text-gray-500">
          {isSaving ? (
            <span>Saving...</span>
          ) : unsavedChanges ? (
            <span className="text-yellow-600">Unsaved changes</span>
          ) : (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Category navigation */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {template.categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setCurrentCategoryIndex(index)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                index === currentCategoryIndex
                  ? "bg-blue-500 text-white"
                  : index < currentCategoryIndex
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold">{currentCategory.name}</h2>
        {currentCategory.description && (
          <p className="text-gray-600">{currentCategory.description}</p>
        )}

        {categoryQuestions.filter(shouldDisplayQuestion).map((question) => (
          <AssessmentQuestion
            key={question.id}
            question={question}
            value={responses[question.id]}
            onChange={(value) => handleResponseChange(question.id, value)}
            error={errors[question.id]}
            disabled={isSaving}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handlePreviousCategory}
          disabled={currentCategoryIndex === 0}
          className="px-6"
        >
          Previous
        </Button>

        <div className="space-x-4">
          <Button
            onClick={handleAutoSave}
            disabled={isSaving || !unsavedChanges}
            className="px-6"
          >
            Save Progress
          </Button>

          {currentCategoryIndex === template.categories.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={isSaving}
              className="px-6 bg-green-500 hover:bg-green-600"
            >
              Complete Assessment
            </Button>
          ) : (
            <Button
              onClick={handleNextCategory}
              disabled={isSaving}
              className="px-6"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
