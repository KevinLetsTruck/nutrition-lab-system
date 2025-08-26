"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  SIMPLE_QUESTIONS,
  SCALES,
  type Question,
} from "@/lib/simple-assessment/questions";

const questions = SIMPLE_QUESTIONS;

interface AssessmentResponse {
  id: string;
  assessmentId: string;
  questionId: number;
  questionText: string;
  category: string;
  score: number;
  answeredAt: string;
}

interface Assessment {
  id: string;
  status: "in_progress" | "completed";
  responses: AssessmentResponse[];
}

interface Props {
  clientId: string;
}

export function SimpleAssessmentForm({ clientId }: Props) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/simple-assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start assessment");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to start assessment");
      }

      setAssessment(data.assessment);

      // Find current question index based on responses
      const answeredCount = data.assessment.responses.length;
      setCurrentQuestionIndex(answeredCount);
    } catch (err) {
      console.error("Start assessment error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Start or resume assessment
  useEffect(() => {
    startAssessment();
  }, [startAssessment]);

  const submitResponse = async (score: number) => {
    if (!assessment) return;

    try {
      setSubmitting(true);
      const questionId = currentQuestionIndex + 1; // Questions are 1-indexed

      const response = await fetch(
        `/api/simple-assessment/${assessment.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, score }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit response");

      const data = await response.json();
      setAssessment(data.assessment);

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-gray-900 dark:text-gray-100">
            Loading assessment...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            Error: {error}
            <br />
            <Button onClick={startAssessment} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-gray-900 dark:text-gray-100">
            No assessment found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Assessment completed
  if (
    assessment.status === "completed" ||
    currentQuestionIndex >= questions.length
  ) {
    return <SimpleAssessmentResults assessment={assessment} />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const currentScale = SCALES[currentQuestion.scaleType];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <CardHeader>
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 text-center uppercase tracking-wide">
            {currentQuestion.category.replace("_", " ")} HEALTH
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 text-center">
            {currentQuestion.text}
          </h2>

          <div className="grid grid-cols-5 gap-3">
            {currentScale.map((option) => {
              // For reverse frequency questions, lower is better
              const isReverse =
                currentQuestion.scaleType === "frequencyReverse";
              const getVariant = () => {
                if (isReverse) {
                  // For negative symptoms: 1 (Never) is good, 5 (Always) is bad
                  if (option.value === 1) return "success"; // Green for "Never" symptoms
                  if (option.value === 5) return "destructive"; // Red for "Always" symptoms
                  return "outline";
                } else {
                  // For positive attributes: 1 is bad, 5 is good
                  if (option.value === 1) return "destructive"; // Red for low scores
                  if (option.value === 5) return "success"; // Green for high scores
                  return "outline";
                }
              };

              return (
                <Button
                  key={option.value}
                  onClick={() => submitResponse(option.value)}
                  disabled={submitting}
                  variant={
                    getVariant() as "success" | "destructive" | "outline"
                  }
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl font-bold">{option.value}</span>
                  <span className="text-xs text-center">{option.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-500">
            Select the option that best describes your experience
          </div>

          {submitting && (
            <div className="text-center text-sm text-blue-600 dark:text-blue-400">
              Saving your response...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Results component
function SimpleAssessmentResults({ assessment }: { assessment: Assessment }) {
  const [scores, setScores] = useState<
    Record<string, { total: number; count: number; average: number }>
  >({});

  useEffect(() => {
    // Calculate category averages
    const categoryScores: Record<
      string,
      { total: number; count: number; average: number }
    > = {};

    assessment.responses.forEach((response) => {
      const question = questions.find((q) => q.id === response.questionId);
      if (!question) return;

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, count: 0, average: 0 };
      }

      categoryScores[question.category].total += response.score;
      categoryScores[question.category].count += 1;
    });

    // Calculate averages
    Object.keys(categoryScores).forEach((category) => {
      categoryScores[category].average =
        categoryScores[category].total / categoryScores[category].count;
    });

    setScores(categoryScores);
  }, [assessment.responses]);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <CardHeader>
        <CardTitle className="text-center text-green-600 dark:text-green-400">
          Assessment Complete! 🎉
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Here are your health scores by category:
        </div>

        <div className="space-y-4">
          {Object.entries(scores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
                  {category.replace("_", " ")} Health
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {score.average.toFixed(1)}/5
                </span>
              </div>
              <Progress value={(score.average / 5) * 100} className="h-3" />
              <div className="text-sm text-gray-500 dark:text-gray-500 text-center">
                {score.average >= 4
                  ? "Excellent"
                  : score.average >= 3
                  ? "Good"
                  : score.average >= 2
                  ? "Fair"
                  : "Needs Attention"}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          Next steps: Schedule a consultation to discuss your personalized
          protocol
        </div>

        <Button
          onClick={() => window.location.reload()}
          className="w-full"
          variant="outline"
        >
          Take Assessment Again
        </Button>
      </CardContent>
    </Card>
  );
}
