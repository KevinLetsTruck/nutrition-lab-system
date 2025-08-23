"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRight, ChevronLeft, Save, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  type: string;
  module: string;
  options?: Array<{
    label: string;
    value: string;
    score: number;
  }>;
}

interface Assessment {
  id: string;
  status: string;
  currentModule: string;
  questionsAsked: number;
  totalQuestions: number;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<any>("");
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Initialize assessment
  useEffect(() => {
    if (user?.clientId) {
      initializeAssessment();
    }
  }, [user]);

  const initializeAssessment = async () => {
    try {
      // First, try to find existing assessment
      const response = await fetch(`/api/assessment/client/${user.clientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.assessment && data.assessment.status !== "COMPLETED") {
          // Resume existing assessment
          setAssessment(data.assessment);
          await loadNextQuestion(data.assessment.id);
        } else {
          // Create new assessment
          await createNewAssessment();
        }
      } else {
        // Create new assessment
        await createNewAssessment();
      }
    } catch (err) {
      setError("Failed to load assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createNewAssessment = async () => {
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          clientId: user.clientId,
          templateId: "default",
        }),
      });

      if (!response.ok) throw new Error("Failed to create assessment");

      const data = await response.json();
      setAssessment(data.assessment);
      setCurrentQuestion(data.firstQuestion);
    } catch (err) {
      setError("Failed to start assessment. Please try again.");
    }
  };

  const loadNextQuestion = async (assessmentId: string) => {
    try {
      const response = await fetch(
        `/api/assessment/${assessmentId}/next-question`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load question");

      const data = await response.json();

      if (data.completed) {
        // Assessment complete
        router.push("/assessment/complete");
      } else {
        setCurrentQuestion(data.question);
        setAssessment((prev) => ({
          ...prev!,
          questionsAsked: data.questionsAsked,
          currentModule: data.currentModule,
        }));
        resetAnswer(data.question);
      }
    } catch (err) {
      setError("Failed to load next question. Please try again.");
    }
  };

  const loadPreviousQuestion = async () => {
    if (!assessment) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/assessment/${assessment.id}/previous-question`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (data.atStart) {
          setError("You're at the beginning of the assessment");
        } else {
          throw new Error("Failed to load previous question");
        }
        return;
      }

      const data = await response.json();

      setCurrentQuestion(data.question);
      setAssessment((prev) => ({
        ...prev!,
        questionsAsked: data.questionsAsked,
        currentModule: data.currentModule,
      }));

      // Set the previous answer
      if (data.previousAnswer !== undefined && data.previousAnswer !== null) {
        if (data.question.type === "MULTI_SELECT") {
          setMultiSelectAnswers(data.previousAnswer);
        } else {
          setAnswer(data.previousAnswer);
        }
      } else {
        resetAnswer(data.question);
      }
    } catch (err) {
      setError("Failed to load previous question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnswer = (question: Question) => {
    switch (question.type) {
      case "LIKERT_SCALE":
        setAnswer(5);
        break;
      case "MULTI_SELECT":
        setMultiSelectAnswers([]);
        break;
      case "TEXT":
      case "NUMBER":
        setAnswer("");
        break;
      default:
        setAnswer("");
    }
  };

  const submitAnswer = async () => {
    if (!assessment || !currentQuestion) return;

    setSaving(true);
    setError("");

    try {
      // Prepare answer value based on question type
      let answerValue = answer;
      if (currentQuestion.type === "MULTI_SELECT") {
        answerValue = multiSelectAnswers;
      } else if (currentQuestion.type === "NUMBER") {
        answerValue = parseInt(answer) || 0;
      }

      // Validate answer
      if (
        currentQuestion.type === "MULTI_SELECT" &&
        multiSelectAnswers.length === 0
      ) {
        setError("Please select at least one option");
        setSaving(false);
        return;
      } else if (!answerValue && answerValue !== 0) {
        setError("Please provide an answer");
        setSaving(false);
        return;
      }

      const response = await fetch(
        `/api/assessment/${assessment.id}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            value: answerValue,
            questionType: currentQuestion.type,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save answer");

      // Load next question
      await loadNextQuestion(assessment.id);
    } catch (err) {
      setError("Failed to save answer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "LIKERT_SCALE":
        // Get labels from question options (if available)
        const lowLabel = currentQuestion.options?.[0]?.label || "Strongly Disagree";
        const highLabel = currentQuestion.options?.[1]?.label || "Strongly Agree";
        
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{lowLabel}</span>
              <span>{highLabel}</span>
            </div>
            <RadioGroup
              value={answer.toString()}
              onValueChange={(value) => setAnswer(parseInt(value))}
            >
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-2">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`scale-${value}`}
                      className="h-6 w-6"
                    />
                    <Label
                      htmlFor={`scale-${value}`}
                      className="cursor-pointer text-sm font-medium"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case "YES_NO":
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer text-base">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer text-base">
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsure" id="unsure" />
                <Label htmlFor="unsure" className="cursor-pointer text-base">
                  Unsure
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case "MULTIPLE_CHOICE":
      case "FREQUENCY":
      case "DURATION":
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="cursor-pointer text-base"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "MULTI_SELECT":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`check-${index}`}
                  checked={multiSelectAnswers.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMultiSelectAnswers([
                        ...multiSelectAnswers,
                        option.value,
                      ]);
                    } else {
                      setMultiSelectAnswers(
                        multiSelectAnswers.filter((v) => v !== option.value)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`check-${index}`}
                  className="cursor-pointer text-base"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "TEXT":
        return (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[120px]"
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter a number"
            className="max-w-[200px]"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="text-gray-400">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Header */}
      <div className="border-b border-gray-800 bg-brand-darkNavy">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6 flex-1">
              {/* Logo */}
              <span className="font-semibold text-xl gradient-text">
                DestinationHealth
              </span>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-700"></div>

              {/* Assessment Info */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Health Assessment
                </h1>
                <p className="text-sm text-gray-400">
                  {assessment?.currentModule.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Center Section - MetabolX Logo */}
            <div className="flex items-center justify-center flex-1">
              <div className="flex flex-col items-center">
                {/* MetabolX Icon */}
                <div className="relative w-12 h-12 mb-1">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Define gradient */}
                    <defs>
                      <linearGradient id="metabolx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#84cc16" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                    {/* X shape with gradient */}
                    <path
                      d="M 20 10 L 35 30 L 50 10 L 65 30 L 80 10 L 90 20 L 65 50 L 90 80 L 80 90 L 50 60 L 20 90 L 10 80 L 35 50 L 10 20 Z"
                      fill="url(#metabolx-gradient)"
                    />
                  </svg>
                </div>
                {/* MetabolX Text */}
                <div className="text-center">
                  <div className="font-bold text-white text-sm">MetabolX</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Assessment</div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end flex-1">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to exit? Your progress is saved."
                    )
                  ) {
                    logout();
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>
              Question {(assessment?.questionsAsked || 0) + 1} of{" "}
              {assessment?.totalQuestions || 0}
            </span>
            <span>
              {Math.round(
                ((assessment?.questionsAsked || 0) /
                  (assessment?.totalQuestions || 1)) *
                  100
              )}
              % Complete
            </span>
          </div>
          <Progress
            value={
              ((assessment?.questionsAsked || 0) /
                (assessment?.totalQuestions || 1)) *
              100
            }
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="max-w-3xl mx-auto bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold flex-1 pr-4">
                  {currentQuestion?.text}
                </h2>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium shrink-0",
                    "bg-brand-green/20 text-brand-green"
                  )}
                >
                  {currentQuestion?.type.replace("_", " ")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="min-h-[200px]">{renderQuestionInput()}</div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={loadPreviousQuestion}
                disabled={loading || assessment?.questionsAsked === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button onClick={submitAnswer} disabled={saving}>
                {saving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
