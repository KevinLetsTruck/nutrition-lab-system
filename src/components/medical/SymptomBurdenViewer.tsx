"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  TrendingUp,
  Pill,
  Activity,
  Brain,
  Heart,
  Zap,
  Shield,
} from "lucide-react";

interface SymptomBurdenViewerProps {
  documentId: string;
}

interface DeficiencyData {
  name: string;
  score: number;
  totalPossible: number;
  percentage: number;
  severity: string;
}

interface ConditionData {
  name: string;
  score: number;
  totalPossible: number;
  percentage: number;
}

export default function SymptomBurdenViewer({
  documentId,
}: SymptomBurdenViewerProps) {
  const [totalBurden, setTotalBurden] = useState<number | null>(null);
  const [deficiencies, setDeficiencies] = useState<DeficiencyData[]>([]);
  const [conditions, setConditions] = useState<ConditionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSymptomBurdenData();
  }, [documentId]);

  const fetchSymptomBurdenData = async () => {
    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/lab-values`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();

      // Extract total burden
      const totalBurdenValue = data.labValues.find(
        (lv: any) => lv.standardName === "total_symptom_burden"
      );
      if (totalBurdenValue) {
        setTotalBurden(totalBurdenValue.value);
      }

      // Extract deficiencies
      const deficiencyData = data.labValues
        .filter((lv: any) => lv.standardName === "nutritional_deficiency")
        .map((lv: any) => {
          const metadata = lv.metadata || {};
          return {
            name: lv.testName,
            score: lv.value || metadata.score || 0,
            totalPossible: metadata.totalPossible || 100,
            percentage: metadata.percentage || 0,
            severity: lv.flag || "normal",
          };
        })
        .sort(
          (a: DeficiencyData, b: DeficiencyData) => b.percentage - a.percentage
        );

      setDeficiencies(deficiencyData);

      // Extract conditions
      const conditionData = data.labValues
        .filter((lv: any) => lv.standardName === "symptom_condition")
        .map((lv: any) => {
          const metadata = lv.metadata || {};
          return {
            name: lv.testName,
            score: lv.value || metadata.score || 0,
            totalPossible: metadata.totalPossible || 100,
            percentage: metadata.percentage || 0,
          };
        })
        .sort(
          (a: ConditionData, b: ConditionData) => b.percentage - a.percentage
        );

      setConditions(conditionData);
    } catch (error) {
      console.error("Error fetching symptom burden data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("fatty") || lowerName.includes("omega"))
      return <Pill className="h-4 w-4" />;
    if (lowerName.includes("vitamin") || lowerName.includes("mineral"))
      return <Zap className="h-4 w-4" />;
    if (lowerName.includes("adrenal") || lowerName.includes("stress"))
      return <Brain className="h-4 w-4" />;
    if (lowerName.includes("cardio") || lowerName.includes("heart"))
      return <Heart className="h-4 w-4" />;
    if (lowerName.includes("immune")) return <Shield className="h-4 w-4" />;
    if (lowerName.includes("liver") || lowerName.includes("toxic"))
      return <Activity className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 50) return "bg-red-500";
    if (percentage >= 40) return "bg-orange-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getSeverityTextColor = (percentage: number) => {
    if (percentage >= 50) return "text-red-600";
    if (percentage >= 40) return "text-orange-600";
    if (percentage >= 25) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Burden Score */}
      {totalBurden !== null && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Total Symptom Burden Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-orange-700">
                {totalBurden}
              </p>
              <p className="text-sm text-orange-600 mt-2">
                {totalBurden > 500
                  ? "High symptom burden - comprehensive support needed"
                  : totalBurden > 300
                  ? "Moderate symptom burden - targeted interventions recommended"
                  : "Low to moderate symptom burden"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nutritional Deficiencies */}
      {deficiencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Potential Nutritional Deficiencies</CardTitle>
            <p className="text-sm text-gray-600">
              Based on symptom patterns, these nutrients may need support
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {deficiencies.map((def, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(def.name)}
                    <span className="font-medium">{def.name}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${getSeverityTextColor(
                        def.percentage
                      )}`}
                    >
                      {def.percentage}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {def.score}/{def.totalPossible}
                    </p>
                  </div>
                </div>
                <Progress
                  value={def.percentage}
                  className="h-2"
                  indicatorClassName={getSeverityColor(def.percentage)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Potential Conditions */}
      {conditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Potential Conditions</CardTitle>
            <p className="text-sm text-gray-600">
              System dysfunctions indicated by symptom patterns
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditions.slice(0, 10).map((condition, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(condition.name)}
                    <span className="font-medium">{condition.name}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${getSeverityTextColor(
                        condition.percentage
                      )}`}
                    >
                      {condition.percentage}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {condition.score}/{condition.totalPossible}
                    </p>
                  </div>
                </div>
                <Progress
                  value={condition.percentage}
                  className="h-2"
                  indicatorClassName={getSeverityColor(condition.percentage)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Priorities */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Clinical Priorities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-700 mb-1">
                Top Nutritional Needs:
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                {deficiencies.slice(0, 3).map((def, index) => (
                  <li key={index}>
                    {def.name} ({def.percentage}%)
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-1">
                Primary System Concerns:
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                {conditions.slice(0, 3).map((cond, index) => (
                  <li key={index}>
                    {cond.name} ({cond.percentage}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
