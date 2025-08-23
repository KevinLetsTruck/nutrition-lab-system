"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Question types that are supported
type QuestionType =
  | "LIKERT_SCALE"
  | "MULTIPLE_CHOICE"
  | "YES_NO"
  | "FREQUENCY"
  | "DURATION"
  | "TEXT"
  | "MULTI_SELECT"
  | "NUMBER";

interface QuestionOption {
  value: string | number;
  label: string;
  description?: string;
}

export default function SimpleAssessmentTest() {
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(5);
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const addLog = (msg: string, type: "info" | "success" | "error" = "info") => {
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "📝";
    setLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${prefix} ${msg}`,
    ]);
  };

  const testAPIHealth = async () => {
    setStatus("testing");
    addLog("Testing API health...");

    try {
      const res = await fetch("/api/assessment/info");
      const data = await res.json();

      if (res.ok && data.success) {
        addLog(`API is healthy!`, "success");
        addLog(`Total questions: ${data.totalQuestions}`);
        addLog(`Modules: ${data.modules?.join(", ")}`);
        setMessage("API is working!");
      } else {
        addLog(`API error: ${data.error || "Unknown"}`, "error");
        setMessage("API error - check logs");
      }
    } catch (error) {
      addLog(`Network error: ${error}`, "error");
      setMessage("Cannot reach API");
    }

    setStatus("ready");
  };

  const startRealAssessment = async (includeTest = false) => {
    setStatus("starting");
    addLog("Starting real assessment with database...");

    try {
      const res = await fetch("/api/assessment/test-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeTest }),
      });

      const text = await res.text();
      addLog(`Response status: ${res.status}`);

      try {
        const data = JSON.parse(text);

        if (data.success && data.data) {
          const {
            assessmentId: newId,
            firstQuestion,
            status: assessmentStatus,
            questionsAsked,
            answeredCount,
          } = data.data;
          setAssessmentId(newId);
          setCurrentQuestion(firstQuestion);
          // Use the actual count of questions already answered
          const actualQuestionsAnswered = questionsAsked || answeredCount || 0;
          setQuestionsAnswered(actualQuestionsAnswered);
          resetAnswer(firstQuestion);
          addLog(`Assessment ${assessmentStatus}: ${newId}`, "success");
          addLog(`First question loaded: ${firstQuestion?.id}`, "success");
          addLog(`Question type: ${firstQuestion?.type}`, "info");
          addLog(
            `Questions already answered: ${actualQuestionsAnswered}`,
            "info"
          );
          setMessage(`Assessment ${newId} ${assessmentStatus}!`);
        } else {
          addLog(`Failed to start: ${data.error || "Unknown error"}`, "error");
          setMessage("Failed to start assessment");
        }
      } catch (parseError) {
        addLog("Response is not JSON", "error");
        addLog(`Raw response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      addLog(`Error: ${error}`, "error");
      setMessage("Error starting assessment");
    }

    setStatus("ready");
  };

  const resetAnswer = (question: any) => {
    // Reset answer based on question type
    switch (question?.type) {
      case "LIKERT_SCALE":
        setSelectedAnswer(5); // Middle value for 1-10 scale
        break;
      case "YES_NO":
        setSelectedAnswer("");
        break;
      case "MULTIPLE_CHOICE":
      case "FREQUENCY":
      case "DURATION":
        setSelectedAnswer("");
        break;
      case "MULTI_SELECT":
        setMultiSelectAnswers([]);
        break;
      case "TEXT":
        setSelectedAnswer("");
        break;
      case "NUMBER":
        setSelectedAnswer("");
        break;
      default:
        setSelectedAnswer(null);
    }
  };

  const getAnswerValue = () => {
    if (currentQuestion?.type === "MULTI_SELECT") {
      return multiSelectAnswers;
    }
    return selectedAnswer;
  };

  const submitAnswer = async () => {
    if (!assessmentId || !currentQuestion) {
      addLog("No active assessment or question", "error");
      return;
    }

    const answerValue = getAnswerValue();

    // Validate answer
    if (
      currentQuestion.type === "MULTI_SELECT" &&
      multiSelectAnswers.length === 0
    ) {
      addLog("Please select at least one option", "error");
      setMessage("Please select at least one option");
      return;
    } else if (!answerValue && answerValue !== 0) {
      addLog("Please provide an answer", "error");
      setMessage("Please provide an answer");
      return;
    }

    setStatus("submitting");
    addLog(
      `Submitting answer: ${JSON.stringify(answerValue)} for question ${
        currentQuestion.id
      }`
    );

    try {
      // First, submit the response
      const submitRes = await fetch(
        `/api/assessment/test/${assessmentId}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            response: {
              type: currentQuestion.type,
              value: answerValue,
            },
          }),
        }
      );

      if (!submitRes.ok) {
        const errorData = await submitRes.json();
        addLog(
          `Failed to submit: ${errorData.error || "Unknown error"}`,
          "error"
        );
        setMessage("Failed to submit answer");
        setStatus("ready");
        return;
      }

      const submitData = await submitRes.json();
      if (submitData.success) {
        addLog(`Answer submitted successfully`, "success");
        setQuestionsAnswered((prev) => prev + 1);

        // Now get the next question
        const nextRes = await fetch(
          `/api/assessment/test/${assessmentId}/next-question`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!nextRes.ok) {
          const errorData = await nextRes.json();
          addLog(`Failed to get next question: ${errorData.error}`, "error");
        } else {
          const nextData = await nextRes.json();

          if (nextData.success && nextData.data?.question) {
            setCurrentQuestion(nextData.data.question);
            resetAnswer(nextData.data.question);
            addLog(
              `Next question loaded: ${nextData.data.question.id}`,
              "success"
            );
            addLog(`Question type: ${nextData.data.question.type}`, "info");
            setMessage(
              `Question ${questionsAnswered + 1} answered. Moving to next...`
            );
          } else if (nextData.data?.complete) {
            addLog("Assessment complete!", "success");
            setMessage("Assessment completed successfully!");
            setCurrentQuestion(null);
          } else {
            addLog("No more questions available", "info");
            setMessage("No more questions");
            setCurrentQuestion(null);
          }
        }
      } else {
        addLog(`Failed to submit: ${submitData.error}`, "error");
      }
    } catch (error) {
      addLog(`Error: ${error}`, "error");
      setMessage("Error submitting answer");
    }

    setStatus("ready");
  };

  const resetAssessment = async () => {
    setStatus("resetting");
    addLog("Resetting test assessments...");

    try {
      const res = await fetch("/api/assessment/reset-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) {
        addLog(data.message, "success");
        setAssessmentId(null);
        setCurrentQuestion(null);
        setQuestionsAnswered(0);
        setMessage("Reset complete");
      } else {
        addLog(`Reset failed: ${data.error}`, "error");
      }
    } catch (error) {
      addLog(`Error: ${error}`, "error");
    }

    setStatus("ready");
  };

  const clearLog = () => {
    setLog([]);
    setMessage("");
  };

  // Helper function to get LIKERT scale labels
  const getLikertLabels = (question: any) => {
    // For energy question specifically
    if (question.id === "SCR001") {
      return {
        min: "No energy - exhausted all day",
        max: "Abundant energy all day",
      };
    }

    // Check if options array has labels
    if (
      question.options &&
      Array.isArray(question.options) &&
      question.options.length >= 2
    ) {
      return {
        min: question.options[0]?.label || "Lowest",
        max:
          question.options[1]?.label ||
          question.options[question.options.length - 1]?.label ||
          "Highest",
      };
    }

    // Use scaleMin/scaleMax if provided
    if (question.scaleMin || question.scaleMax) {
      return {
        min: question.scaleMin || "Lowest",
        max: question.scaleMax || "Highest",
      };
    }

    // Default fallback
    return {
      min: "Lowest",
      max: "Highest",
    };
  };

  // Render question based on type - SIMPLIFIED DESIGN
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const questionType = currentQuestion.type as QuestionType;

    switch (questionType) {
      case "LIKERT_SCALE":
        // LIKERT_SCALE should show a 1-10 numeric scale
        const labels = getLikertLabels(currentQuestion);

        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{labels.min || "1"}</span>
              <span>{labels.max || "10"}</span>
            </div>
            <RadioGroup
              value={selectedAnswer.toString()}
              onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            >
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`scale-${value}`}
                      className="mb-1"
                    />
                    <Label
                      htmlFor={`scale-${value}`}
                      className="cursor-pointer text-xs"
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
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
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
            </div>
          </RadioGroup>
        );

      case "MULTIPLE_CHOICE":
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {currentQuestion.options?.map(
                (option: QuestionOption, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`mc-${index}`}
                    />
                    <Label htmlFor={`mc-${index}`} className="cursor-pointer">
                      <div>
                        <div className="text-base">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </Label>
                  </div>
                )
              )}
            </div>
          </RadioGroup>
        );

      case "FREQUENCY":
        const frequencyOptions = currentQuestion.frequencyOptions ||
          currentQuestion.options || [
            { value: "never", label: "Never" },
            { value: "rarely", label: "Rarely (1-2 times/month)" },
            { value: "sometimes", label: "Sometimes (1-2 times/week)" },
            { value: "often", label: "Often (3-5 times/week)" },
            { value: "always", label: "Always (Daily)" },
          ];
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {frequencyOptions.map((option: any, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem
                    value={(option.value || index).toString()}
                    id={`freq-${index}`}
                  />
                  <Label htmlFor={`freq-${index}`} className="cursor-pointer">
                    <div>
                      <div className="text-base">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "DURATION":
        const durationOptions = currentQuestion.durationOptions || [
          { value: "less_than_month", label: "Less than 1 month" },
          { value: "1_3_months", label: "1-3 months" },
          { value: "3_6_months", label: "3-6 months" },
          { value: "6_12_months", label: "6-12 months" },
          { value: "over_year", label: "Over 1 year" },
        ];
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-3">
              {durationOptions.map((option: any, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem value={option.value} id={`dur-${index}`} />
                  <Label
                    htmlFor={`dur-${index}`}
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
            {currentQuestion.options?.map(
              (option: QuestionOption, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <Checkbox
                    id={`ms-${index}`}
                    checked={multiSelectAnswers.includes(
                      option.value.toString()
                    )}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMultiSelectAnswers([
                          ...multiSelectAnswers,
                          option.value.toString(),
                        ]);
                      } else {
                        setMultiSelectAnswers(
                          multiSelectAnswers.filter(
                            (v) => v !== option.value.toString()
                          )
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`ms-${index}`} className="cursor-pointer">
                    <div>
                      <div className="text-base">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              )
            )}
          </div>
        );

      case "TEXT":
        return (
          <Textarea
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder={
              currentQuestion.placeholder || "Enter your response here..."
            }
            rows={currentQuestion.textOptions?.rows || 4}
            maxLength={currentQuestion.maxLength || 500}
            className="w-full"
          />
        );

      case "NUMBER":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              min={currentQuestion.numberOptions?.min}
              max={currentQuestion.numberOptions?.max}
              step={currentQuestion.numberOptions?.step || 1}
              placeholder={currentQuestion.placeholder || "Enter a number"}
              className="w-full max-w-xs text-lg"
            />
            {currentQuestion.numberOptions && (
              <div className="text-sm text-gray-500">
                {currentQuestion.numberOptions.min !== undefined &&
                  `Min: ${currentQuestion.numberOptions.min}`}
                {currentQuestion.numberOptions.min !== undefined &&
                  currentQuestion.numberOptions.max !== undefined &&
                  " | "}
                {currentQuestion.numberOptions.max !== undefined &&
                  `Max: ${currentQuestion.numberOptions.max}`}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-500">
            Question type "{currentQuestion.type}" not yet implemented
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Assessment System Test
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={testAPIHealth}
                disabled={status !== "ready"}
                variant="secondary"
              >
                Test API
              </Button>
              <Button
                onClick={() => startRealAssessment(false)}
                disabled={status !== "ready"}
                variant="default"
              >
                Start Assessment
              </Button>
              <Button
                onClick={() => startRealAssessment(true)}
                disabled={status !== "ready"}
                variant="secondary"
              >
                Start with Test Questions
              </Button>
              <Button
                onClick={resetAssessment}
                disabled={status !== "ready"}
                variant="outline"
              >
                Reset All
              </Button>
              <Button onClick={clearLog} variant="outline">
                Clear Log
              </Button>
            </div>

            {assessmentId && (
              <div className="text-sm text-gray-400">
                Assessment ID: {assessmentId} | Questions Answered:{" "}
                {questionsAnswered}
              </div>
            )}
          </CardContent>
        </Card>

        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Question {questionsAnswered + 1}</CardTitle>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-mono",
                    currentQuestion.type === "LIKERT_SCALE" &&
                      "bg-blue-900 text-blue-100",
                    currentQuestion.type === "YES_NO" &&
                      "bg-green-900 text-green-100",
                    currentQuestion.type === "MULTIPLE_CHOICE" &&
                      "bg-purple-900 text-purple-100",
                    currentQuestion.type === "FREQUENCY" &&
                      "bg-orange-900 text-orange-100",
                    currentQuestion.type === "MULTI_SELECT" &&
                      "bg-indigo-900 text-indigo-100",
                    currentQuestion.type === "TEXT" &&
                      "bg-teal-900 text-teal-100",
                    currentQuestion.type === "NUMBER" &&
                      "bg-red-900 text-red-100"
                  )}
                >
                  {currentQuestion.type}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {currentQuestion.text}
                </h3>
                {renderQuestionInput()}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={submitAnswer}
                  disabled={status !== "ready"}
                  className="flex-1"
                >
                  Submit Answer
                </Button>
                <Button
                  onClick={() => resetAnswer(currentQuestion)}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {message && (
          <div className="mb-6 p-4 bg-blue-900/20 text-blue-100 rounded border border-blue-800">
            {message}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs max-h-64 overflow-y-auto">
              {log.length === 0 ? (
                <div>No activity yet.</div>
              ) : (
                log.map((entry, i) => <div key={i}>{entry}</div>)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
