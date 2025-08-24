"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Download,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Brain,
  Activity,
  Heart,
  Zap,
  Shield,
  Dumbbell,
  Droplet,
  Wind,
  Stethoscope,
} from "lucide-react";
import { format } from "date-fns";

interface AnalysisData {
  assessment: {
    id: string;
    status: string;
    currentModule: string;
    questionsAsked: number;
    questionsSaved: number;
    startedAt: string;
    completedAt?: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      dateOfBirth?: string;
      gender?: string;
    };
  };
  analysis?: {
    overallScore: number;
    nodeScores: Record<string, number>;
    aiSummary: string;
    keyFindings: string[];
    riskFactors: string[];
    strengths: string[];
    primaryConcerns: string[];
    suggestedLabs: {
      essential: string[];
      recommended: string[];
      optional: string[];
    };
    seedOilScore?: {
      exposureLevel: number;
      damageIndicators: number;
      recoveryPotential: number;
      priorityLevel: string;
      recommendations: string[];
    };
  };
  responses: Array<{
    id: string;
    questionId: string;
    questionText: string;
    questionModule: string;
    responseValue: string;
    responseText?: string;
    score: number;
    answeredAt: string;
  }>;
}

const BODY_SYSTEM_ICONS: Record<string, any> = {
  NEUROLOGICAL: Brain,
  DIGESTIVE: Droplet,
  CARDIOVASCULAR: Heart,
  RESPIRATORY: Wind,
  IMMUNE: Shield,
  MUSCULOSKELETAL: Dumbbell,
  ENDOCRINE: Zap,
  INTEGUMENTARY: Activity,
  GENITOURINARY: Stethoscope,
  SPECIAL_TOPICS: AlertCircle,
};

const BODY_SYSTEM_NAMES: Record<string, string> = {
  NEUROLOGICAL: "Neurological System",
  DIGESTIVE: "Digestive System",
  CARDIOVASCULAR: "Cardiovascular System",
  RESPIRATORY: "Respiratory System",
  IMMUNE: "Immune System",
  MUSCULOSKELETAL: "Musculoskeletal System",
  ENDOCRINE: "Endocrine System",
  INTEGUMENTARY: "Integumentary System",
  GENITOURINARY: "Genitourinary System",
  SPECIAL_TOPICS: "Special Topics",
};

export default function AdminAssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    fetchAssessmentDetails();
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/assessments/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch assessment details");

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to load assessment details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(
        `/api/admin/assessments/${assessmentId}/report`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assessment-${assessmentId}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error generating report:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-400">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Assessment
          </h2>
          <p className="text-gray-400 mb-4">
            {error || "Unable to load assessment"}
          </p>
          <Button onClick={() => router.push("/dashboard/assessments")}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const { assessment, analysis, responses } = data;
  const scoreColor = !analysis
    ? "text-gray-400"
    : analysis.overallScore >= 80
    ? "text-green-600"
    : analysis.overallScore >= 60
    ? "text-yellow-500"
    : analysis.overallScore >= 40
    ? "text-orange-600"
    : "text-red-500";

  return (
    <div className="min-h-screen bg-brand-navy p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard/assessments")}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </button>

          <div className="flex gap-2">
            <Button
              onClick={() =>
                router.push(`/dashboard/clients/${assessment.client.id}`)
              }
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              <User className="h-4 w-4 mr-2" />
              View Client
            </Button>
            <Button
              onClick={generateReport}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Client Info Card */}
        <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-white">
                {assessment.client.firstName} {assessment.client.lastName}
              </h1>
              <div className="text-gray-400 space-y-1">
                <p>{assessment.client.email}</p>
                {assessment.client.gender && (
                  <p>Gender: {assessment.client.gender}</p>
                )}
                {assessment.client.dateOfBirth && (
                  <p>
                    Age:{" "}
                    {new Date().getFullYear() -
                      new Date(
                        assessment.client.dateOfBirth
                      ).getFullYear()}{" "}
                    years
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Assessment Status</p>
              <p className="font-semibold text-white">{assessment.status}</p>
              <p className="text-sm text-gray-400 mt-2">
                Started: {format(new Date(assessment.startedAt), "MMM d, yyyy")}
              </p>
              {assessment.completedAt && (
                <p className="text-sm text-gray-400">
                  Completed:{" "}
                  {format(new Date(assessment.completedAt), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Main Score Card - Only show if analysis exists */}
        {analysis && (
          <>
            <Card className="p-8 mb-6 text-center bg-gray-800 border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Overall Health Score
              </h2>
              <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
                {analysis.overallScore}/100
              </div>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                {analysis.aiSummary}
              </p>

              <div className="mt-6 flex justify-center gap-8 text-sm">
                <div>
                  <span className="text-gray-400">Questions Asked:</span>
                  <span className="ml-2 font-semibold text-white">
                    {assessment.questionsAsked}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Questions Saved by AI:</span>
                  <span className="ml-2 font-semibold text-green-500">
                    {assessment.questionsSaved}
                  </span>
                </div>
              </div>
            </Card>

            {/* Body System Scores */}
            <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Body System Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.nodeScores).map(([system, score]) => {
                  const Icon = BODY_SYSTEM_ICONS[system] || Activity;
                  return (
                    <div
                      key={system}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-white">
                          {BODY_SYSTEM_NAMES[system] || system}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-600 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${
                              score >= 80
                                ? "bg-green-500"
                                : score >= 60
                                ? "bg-yellow-500"
                                : score >= 40
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="font-semibold w-12 text-right text-white">
                          {score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Key Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-red-500">
                  Primary Concerns
                </h2>
                <ul className="space-y-2">
                  {analysis.primaryConcerns.map((concern, i) => (
                    <li key={i} className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">{concern}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-green-500">
                  Strengths
                </h2>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Suggested Labs */}
            <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Recommended Laboratory Tests
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-red-500 mb-2">
                    Essential Tests
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.suggestedLabs.essential.map((lab, i) => (
                      <li key={i} className="text-gray-300">
                        {lab}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-yellow-500 mb-2">
                    Recommended Tests
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.suggestedLabs.recommended.map((lab, i) => (
                      <li key={i} className="text-gray-300">
                        {lab}
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.suggestedLabs.optional.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">
                      Optional Tests
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.suggestedLabs.optional.map((lab, i) => (
                        <li key={i} className="text-gray-300">
                          {lab}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Response Details */}
        <Card className="p-6 mb-6 bg-gray-800 border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Assessment Responses
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResponses(!showResponses)}
            >
              {showResponses ? "Hide" : "Show"} All Responses (
              {responses.length})
            </Button>
          </div>

          {showResponses && (
            <div className="space-y-4 mt-4">
              {responses.map((response, index) => (
                <div
                  key={response.id}
                  className="border rounded-lg p-4 bg-gray-700 border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {index + 1}. {response.questionText}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Module:{" "}
                        {BODY_SYSTEM_NAMES[response.questionModule] ||
                          response.questionModule}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-white">
                        {response.responseText || response.responseValue}
                      </p>
                      <p className="text-sm text-gray-400">
                        Score: {response.score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={() =>
              router.push(
                `/dashboard/clients/${assessment.client.id}/protocols`
              )
            }
            className="bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
          >
            Generate Treatment Protocol
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/dashboard/assessments")}
            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          >
            Back to Assessments
          </Button>
        </div>
      </div>
    </div>
  );
}
