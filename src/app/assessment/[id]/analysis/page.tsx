"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function AnalysisPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      // Check if this is a test assessment
      if (params.id && (params.id as string).startsWith("test-")) {
        // Try to get analysis from sessionStorage
        const storedAnalysis = sessionStorage.getItem(`analysis-${params.id}`);
        if (storedAnalysis) {
          setAnalysis(JSON.parse(storedAnalysis));
          setLoading(false);
          return;
        }
      }

      // Normal fetch for non-test assessments
      const res = await fetch(`/api/assessment/${params.id}/analysis`);
      const data = await res.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else if (data.isTest) {
        setError(
          "Test analysis not found. Please complete the assessment again."
        );
      } else {
        setError(data.error || "No analysis found");
      }
    } catch (err) {
      setError("Failed to fetch analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Functional Medicine Analysis
        </h1>

        {/* Show raw analysis if structured data is not available */}
        {analysis.rawAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Analysis Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {analysis.rawAnalysis}
                </p>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>Note:</strong> The analysis engine needs more
                  comprehensive assessment data to provide detailed functional
                  medicine recommendations. Please ensure all assessment
                  questions are answered completely.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary Patterns */}
        {!analysis.rawAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                Primary Patterns Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.primaryPatterns?.map((pattern: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900">
                      {pattern.pattern}
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {pattern.evidence?.map((item: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                        >
                          <CheckCircle className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Priorities */}
        {!analysis.rawAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">System Priorities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysis.systemPriorities || {}).map(
                  ([key, value]: [string, any]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="w-8 text-center">
                          {key.charAt(0)}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          {key
                            .split("_")[1]
                            ?.replace(/([A-Z])/g, " $1")
                            .trim()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                        {value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Findings */}
        {!analysis.rawAnalysis && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 text-lg">
                  Most Concerning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyFindings?.most_concerning?.map(
                    (item: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400 text-lg">
                  Positive Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyFindings?.positive_findings?.map(
                    (item: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400 text-lg">
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyFindings?.risk_factors?.map(
                    (item: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lab Recommendations */}
        {!analysis.rawAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                Laboratory Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Essential Labs
                  </h3>
                  <ul className="space-y-2">
                    {analysis.labRecommendations?.essential?.map(
                      (lab: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <Badge variant="default" className="mr-2 mt-0.5">
                            Must Have
                          </Badge>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {lab}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Additional Labs
                  </h3>
                  <ul className="space-y-2">
                    {analysis.labRecommendations?.additional?.map(
                      (lab: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <Badge variant="outline" className="mr-2 mt-0.5">
                            Optional
                          </Badge>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {lab}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supplement Protocol */}
        {!analysis.rawAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                Supplement Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Foundation Supplements
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.supplementProtocol?.foundation?.map(
                      (supp: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                        >
                          <h4 className="font-medium text-gray-900">
                            {supp.supplement}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <strong>Dosage:</strong> {supp.dosage}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Timing:</strong> {supp.timing}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Reason:</strong> {supp.rationale}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">
                    Targeted Supplements
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.supplementProtocol?.targeted?.map(
                      (supp: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                        >
                          <h4 className="font-medium text-gray-900">
                            {supp.supplement}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <strong>Dosage:</strong> {supp.dosage}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Timing:</strong> {supp.timing}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Reason:</strong> {supp.rationale}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {analysis.supplementProtocol?.timeline && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      <strong>Implementation Timeline:</strong>{" "}
                      {analysis.supplementProtocol.timeline}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Treatment Phases */}
        {!analysis.rawAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis.treatmentPhases || {}).map(
                  ([key, phase]: [string, any]) => (
                    <div key={key} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-900">
                        Phase {key.split("_")[1]} ({phase.weeks}): {phase.focus}
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {phase.actions?.map((action: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                          >
                            <span className="mr-2">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Analysis Version: {analysis.analysisVersion}</span>
              <span>Analyzed by: {analysis.analyzedBy}</span>
              <span>
                Generated: {new Date(analysis.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
