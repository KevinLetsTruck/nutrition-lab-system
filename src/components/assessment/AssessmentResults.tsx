"use client";

import React from "react";
import {
  AssessmentSession,
  AssessmentScore,
  AIAnalysisResult,
  Finding,
  Recommendation,
} from "@/lib/assessment/types";
import { Card } from "@/components/ui/card";

interface AssessmentResultsProps {
  session: AssessmentSession;
  showAIAnalysis?: boolean;
}

/**
 * Display assessment results including scores and AI analysis
 */
export function AssessmentResults({
  session,
  showAIAnalysis = true,
}: AssessmentResultsProps) {
  const { scores, aiAnalysis } = session;

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  /**
   * Get risk level color
   */
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "severe":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "moderate":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!scores || scores.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No results available for this assessment.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Assessment Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Assessment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="font-medium">
              {session.completedAt
                ? new Date(session.completedAt).toLocaleDateString()
                : "In Progress"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="font-medium">{session.responses.length}</p>
          </div>
        </div>
      </Card>

      {/* Scores */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Assessment Scores</h2>
        <div className="space-y-4">
          {scores.map((score: AssessmentScore) => (
            <div key={score.ruleId} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{score.ruleName}</h3>
                  {score.category && (
                    <p className="text-sm text-gray-600">{score.category}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {score.score}
                    {score.maxScore && (
                      <span className="text-base font-normal">
                        /{score.maxScore}
                      </span>
                    )}
                  </p>
                  {score.maxScore && (
                    <p className="text-sm text-gray-600">
                      {Math.round((score.score / score.maxScore) * 100)}%
                    </p>
                  )}
                </div>
              </div>

              {score.interpretation && (
                <p className="text-sm text-gray-700 mb-2">
                  {score.interpretation}
                </p>
              )}

              {score.recommendations && score.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Recommendations:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {score.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* AI Analysis */}
      {showAIAnalysis && aiAnalysis && (
        <>
          {/* Findings */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Clinical Findings</h2>
            <div className="space-y-3">
              {aiAnalysis.findings.map((finding: Finding) => (
                <div
                  key={finding.id}
                  className={`p-4 rounded-lg ${getSeverityColor(
                    finding.severity
                  )}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{finding.description}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                        finding.severity
                      )}`}
                    >
                      {finding.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">Type: {finding.type}</p>
                  {finding.evidence.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Evidence:</p>
                      <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                        {finding.evidence.map((evidence, index) => (
                          <li key={index}>{evidence}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
            <div className="space-y-3">
              {aiAnalysis.recommendations.map((rec: Recommendation) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {rec.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{rec.description}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Rationale:</strong> {rec.rationale}
                  </p>
                  {rec.contraindications &&
                    rec.contraindications.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-600">
                          Contraindications:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                          {rec.contraindications.map((contra, index) => (
                            <li key={index}>{contra}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Factors */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Risk Factors</h2>
            <div className="space-y-3">
              {aiAnalysis.riskFactors.map((risk) => (
                <div
                  key={risk.id}
                  className={`p-4 rounded-lg ${getRiskLevelColor(risk.level)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{risk.factor}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(
                        risk.level
                      )}`}
                    >
                      {risk.level.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-sm mb-2">{risk.description}</p>
                  {risk.mitigationStrategies.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        Mitigation Strategies:
                      </p>
                      <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                        {risk.mitigationStrategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Analysis Metadata */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Analysis Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Analysis Date</p>
                <p className="font-medium">
                  {new Date(aiAnalysis.analyzedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">AI Model</p>
                <p className="font-medium">{aiAnalysis.model}</p>
              </div>
              <div>
                <p className="text-gray-600">Confidence Score</p>
                <p className="font-medium">
                  {Math.round(aiAnalysis.confidence * 100)}%
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
