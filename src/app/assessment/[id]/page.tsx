"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, Save } from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  required: boolean;
  module: string;
}

export default function PublicAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState<any>("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentModule, setCurrentModule] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Get session data
    const session = localStorage.getItem("assessmentSession");
    if (!session) {
      router.push("/assessment/start");
      return;
    }
    
    const data = JSON.parse(session);
    if (data.assessmentId !== assessmentId) {
      router.push("/assessment/start");
      return;
    }
    
    setSessionData(data);
    fetchNextQuestion();
  }, [assessmentId]);

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessment/${assessmentId}/public/next-question`, {
        headers: {
          "X-Client-ID": sessionData?.clientId || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }

      const data = await response.json();

      if (data.completed) {
        handleCompletion();
        return;
      }

      setCurrentQuestion(data.question);
      setCurrentModule(data.currentModule);
      setQuestionsAnswered(data.questionsAnswered);
      setProgress(data.progress);
      setResponse("");
    } catch (err) {
      setError("Failed to load question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!currentQuestion || !response) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/assessment/${assessmentId}/public/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-ID": sessionData?.clientId || "",
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          response,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save response");
      }

      // Fetch next question
      fetchNextQuestion();
    } catch (err) {
      setError("Failed to save response");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCompletion = () => {
    // Clear session
    localStorage.removeItem("assessmentSession");
    
    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Show completion screen
    setCurrentQuestion(null);
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "YES_NO":
      case "YES_NO_UNSURE":
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            <div className="space-y-3">
              <Label className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="yes" />
                <span>Yes</span>
              </Label>
              <Label className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="no" />
                <span>No</span>
              </Label>
              {currentQuestion.type === "YES_NO_UNSURE" && (
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="unsure" />
                  <span>Unsure</span>
                </Label>
              )}
            </div>
          </RadioGroup>
        );

      case "LIKERT_SCALE":
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Strongly Disagree</span>
              <span>Neutral</span>
              <span>Strongly Agree</span>
            </div>
            <Slider
              value={[response || 3]}
              onValueChange={(value) => setResponse(value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="text-center text-lg font-semibold text-white">
              {response || 3}
            </div>
          </div>
        );

      case "MULTIPLE_CHOICE":
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <Label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value={option} />
                  <span>{option}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        );

      case "TEXT":
        return (
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[100px] bg-gray-700 border-gray-600 text-white"
          />
        );

      case "FREQUENCY":
        return (
          <Select value={response} onValueChange={setResponse}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="sometimes">Sometimes</SelectItem>
              <SelectItem value="often">Often</SelectItem>
              <SelectItem value="always">Always</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-green mx-auto mb-4" />
          <p className="text-gray-400">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion && questionsAnswered > 0) {
    // Completion screen
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-gray-800 border-gray-700 text-center">
          <CardContent className="p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Congratulations! 🎉
              </h1>
              <p className="text-xl text-gray-300">
                You've completed your health assessment
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <p className="text-gray-300 mb-2">Questions Answered</p>
              <p className="text-3xl font-bold text-brand-green">{questionsAnswered}</p>
            </div>

            <p className="text-gray-400 mb-8">
              Thank you for completing the MetabolX Health Assessment, {sessionData?.clientName}.
              Your practitioner will review your responses and contact you with personalized recommendations.
            </p>

            <Button
              onClick={() => router.push("/")}
              className="bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-brand-green to-brand-orange bg-clip-text text-transparent">
              MetabolX
            </span>
          </h1>
          <p className="text-gray-400">Health Assessment</p>
        </div>

        {/* Progress */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Module: {currentModule}
              </span>
              <span className="text-sm text-gray-400">
                Question {questionsAnswered + 1}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        {currentQuestion && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">
                {currentQuestion.text}
              </h2>
              {currentQuestion.required && (
                <p className="text-sm text-gray-400">* Required</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                {renderQuestionInput()}
              </div>

              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Save progress and exit
                    router.push("/");
                  }}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save & Exit
                </Button>

                <Button
                  onClick={submitResponse}
                  disabled={!response || saving}
                  className="bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
