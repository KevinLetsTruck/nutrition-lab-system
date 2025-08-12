"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Info } from "lucide-react";

interface AssessmentResultsViewerProps {
  documentId: string;
}

interface NAQSection {
  sectionName: string;
  score: number;
  maxPossible: number;
  percentage: number;
  severity: "low" | "moderate" | "high" | "critical";
  interpretation: string;
}

interface NAQAnalysis {
  totalScore: number;
  sections: NAQSection[];
  topConcerns: string[];
  primarySystems: string[];
  recommendations: string[];
}

export default function AssessmentResultsViewer({
  documentId,
}: AssessmentResultsViewerProps) {
  const [analysis, setAnalysis] = useState<NAQAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [documentId]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/assessment-analysis`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "moderate":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "moderate":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-red-600 p-4">
        Error loading assessment results: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            NAQ Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-2xl font-bold">{analysis.totalScore}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sections Analyzed</p>
              <p className="text-2xl font-bold">{analysis.sections.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary Concerns</p>
              <p className="text-2xl font-bold text-orange-600">
                {analysis.topConcerns.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Concerns */}
      {analysis.topConcerns.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Primary Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {analysis.topConcerns.map((concern, index) => (
                <li key={index} className="text-orange-700">
                  {concern}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Section Scores */}
      <Card>
        <CardHeader>
          <CardTitle>System-by-System Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{section.sectionName}</h4>
                  <p className="text-sm text-gray-600">
                    Score: {section.score}/{section.maxPossible} (
                    {section.percentage.toFixed(1)}%)
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getSeverityTextColor(
                    section.severity
                  )} ${
                    section.severity === "critical"
                      ? "bg-red-100"
                      : section.severity === "high"
                      ? "bg-orange-100"
                      : section.severity === "moderate"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  {section.severity.toUpperCase()}
                </span>
              </div>
              <Progress
                value={section.percentage}
                className="h-2"
                indicatorClassName={getSeverityColor(section.severity)}
              />
              <p className="text-sm text-gray-600 italic">
                {section.interpretation}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Clinical Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700">
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
