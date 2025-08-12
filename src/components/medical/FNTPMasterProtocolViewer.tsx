/**
 * FNTP Master Clinical Recommendation System - UI Component
 * Displays the comprehensive protocol with root cause analysis
 * Kevin Rutherford, FNTP - Truck Driver Health Optimization
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FNTPMasterProtocolViewerProps {
  documentId: string;
  onProtocolGenerated?: (protocol: any) => void;
}

interface RootCauseAnalysis {
  primary: string;
  secondary?: string;
  confidence: number;
  labTriggers: string[];
  symptomTriggers: string[];
  description: string;
}

interface PhaseProtocol {
  phase: number;
  name: string;
  duration: string;
  goal: string;
  supplements: ProtocolSupplement[];
  lifestyle: LifestyleRecommendation[];
  monitoring: MonitoringPoint[];
  education: EducationPoint[];
}

interface ProtocolSupplement {
  productId: string;
  product: {
    name: string;
    brand: string;
    source: string;
    url?: string;
  };
  dosage: string;
  timing: string;
  duration: string;
  purpose: string;
  priority: number;
  truckerInstructions: string;
  educationPoints: string[];
}

interface ClientEducationHandout {
  protocolName: string;
  rootCauseExplanation: string;
  phaseOverview: string;
  supplementInstructions: any[];
  truckingSchedule: {
    preTrip: string[];
    duringDrive: string[];
    breakTime: string[];
    eveningStop: string[];
    bedtime: string[];
    organization: string[];
  };
  successChecklist: string[];
  contactTriggers: string[];
  nextSteps: string[];
}

interface LifestyleRecommendation {
  category: string;
  recommendation: string;
  truckerSpecific: string;
  difficulty: string;
  frequency: string;
}

interface MonitoringPoint {
  type: string;
  description: string;
  frequency: string;
  target?: string;
  action?: string;
}

interface EducationPoint {
  topic: string;
  content: string;
  timelineExpectation?: string;
  troubleshooting?: string[];
}

export default function FNTPMasterProtocolViewer({
  documentId,
  onProtocolGenerated,
}: FNTPMasterProtocolViewerProps) {
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchProtocol = async (forceRegenerate = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/medical/documents/${documentId}/fntp-master-protocol`;
      const options = forceRegenerate
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              forceRegenerate: true,
              options: { includeDecisionTrees: true },
            }),
          }
        : {
            method: "GET",
          };

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch protocol");
      }

      setProtocol(data.masterProtocol || data);
      onProtocolGenerated?.(data.masterProtocol || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchProtocol();
    }
  }, [documentId]);

  const getRootCauseColor = (rootCause: string) => {
    const colors = {
      gut_dysfunction: "bg-orange-100 text-orange-800",
      hpa_axis_dysfunction: "bg-purple-100 text-purple-800",
      metabolic_dysfunction: "bg-red-100 text-red-800",
      inflammation_immune: "bg-yellow-100 text-yellow-800",
      cardiovascular_risk: "bg-blue-100 text-blue-800",
      detoxification_impairment: "bg-green-100 text-green-800",
    };
    return (
      colors[rootCause as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: "bg-red-500",
      2: "bg-orange-500",
      3: "bg-yellow-500",
      4: "bg-blue-500",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  };

  const getSourceBadgeColor = (source: string) => {
    const colors = {
      letstruck: "bg-green-100 text-green-800 border-green-300",
      biotics: "bg-blue-100 text-blue-800 border-blue-300",
      fullscript: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[source as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Generating FNTP Master Protocol...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Analyzing lab values, identifying root causes, and creating your
            personalized protocol...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">
            Protocol Generation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchProtocol()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!protocol) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>FNTP Master Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            No protocol generated yet. Generate your comprehensive FNTP protocol
            with root cause analysis.
          </p>
          <Button onClick={() => fetchProtocol(true)}>
            Generate FNTP Master Protocol
          </Button>
        </CardContent>
      </Card>
    );
  }

  const rootCause: RootCauseAnalysis = protocol.rootCauseAnalysis;
  const phases: PhaseProtocol[] = protocol.phases || [];
  const clientEducation: ClientEducationHandout = protocol.clientEducation;

  return (
    <div className="w-full space-y-6">
      {/* Header with Root Cause Analysis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-600">
                FNTP Master Clinical Protocol
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Root Cause Focused Protocol with IFM/Kresser Institute Standards
              </p>
            </div>
            <Button
              onClick={() => fetchProtocol(true)}
              variant="outline"
              size="sm"
            >
              Regenerate Protocol
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Primary Root Cause Identified
              </h3>
              <Badge
                className={`${getRootCauseColor(
                  rootCause.primary
                )} px-3 py-2 text-sm`}
              >
                {rootCause.primary.replace("_", " ").toUpperCase()}
              </Badge>
              <p className="text-gray-700 mt-2 text-sm">
                {rootCause.description}
              </p>
              <div className="mt-3">
                <span className="text-sm font-medium">Confidence Level: </span>
                <span className="text-lg font-bold text-blue-600">
                  {(rootCause.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Key Findings</h3>
              <div className="space-y-2">
                {rootCause.labTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Phases */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phase1">Phase 1</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {phases.map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-blue-600">
                      Phase {phase.phase}: {phase.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {phase.duration}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{phase.goal}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Supplements:
                        </span>
                        <Badge variant="outline">
                          {phase.supplements.length}/4 max
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lifestyle:</span>
                        <Badge variant="outline">
                          {phase.lifestyle.length} items
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Monitoring:</span>
                        <Badge variant="outline">
                          {phase.monitoring.length} points
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {phases.map((phase, phaseIndex) => (
          <TabsContent
            key={phaseIndex}
            value={`phase${phase.phase}`}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Phase {phase.phase}: {phase.name}
                  </span>
                  <Badge variant="outline">{phase.duration}</Badge>
                </CardTitle>
                <p className="text-gray-600">{phase.goal}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Supplements */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span>Supplements</span>
                      <Badge className="bg-green-100 text-green-800">
                        {phase.supplements.length}/4 (MANDATORY LIMIT)
                      </Badge>
                    </h3>
                    <div className="grid gap-4">
                      {phase.supplements.map((supplement, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {supplement.product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {supplement.product.brand}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getPriorityColor(
                                  supplement.priority
                                )}`}
                                title={`Priority ${supplement.priority}`}
                              />
                              <Badge
                                className={getSourceBadgeColor(
                                  supplement.product.source
                                )}
                              >
                                {supplement.product.source.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="font-medium text-sm">
                                Dosage:{" "}
                              </span>
                              <span className="text-sm">
                                {supplement.dosage}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-sm">
                                Timing:{" "}
                              </span>
                              <span className="text-sm">
                                {supplement.timing}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-sm">
                                Duration:{" "}
                              </span>
                              <span className="text-sm">
                                {supplement.duration}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-sm">
                                Priority:{" "}
                              </span>
                              <span className="text-sm">
                                {supplement.priority}
                              </span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="font-medium text-sm">
                              Purpose:{" "}
                            </span>
                            <span className="text-sm text-gray-700">
                              {supplement.purpose}
                            </span>
                          </div>

                          <div className="bg-blue-50 rounded p-3 mb-3">
                            <span className="font-medium text-sm text-blue-800">
                              Trucker Instructions:{" "}
                            </span>
                            <span className="text-sm text-blue-700">
                              {supplement.truckerInstructions}
                            </span>
                          </div>

                          {supplement.product.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(supplement.product.url, "_blank")
                              }
                            >
                              View Product
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle Recommendations */}
                  {phase.lifestyle.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-4">
                        Lifestyle Recommendations
                      </h3>
                      <div className="space-y-3">
                        {phase.lifestyle.map((lifestyle, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-blue-400 pl-4 py-2"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {lifestyle.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {lifestyle.difficulty}
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {lifestyle.frequency}
                              </span>
                            </div>
                            <p className="font-medium text-sm">
                              {lifestyle.recommendation}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">For truckers:</span>{" "}
                              {lifestyle.truckerSpecific}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monitoring Points */}
                  {phase.monitoring.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-4">
                        Monitoring & Success Metrics
                      </h3>
                      <div className="space-y-3">
                        {phase.monitoring.map((monitor, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded"
                          >
                            <Badge
                              className={
                                monitor.type === "red_flag"
                                  ? "bg-red-100 text-red-800"
                                  : monitor.type === "metric"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {monitor.type}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {monitor.description}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Frequency:</span>{" "}
                                {monitor.frequency}
                                {monitor.target && (
                                  <>
                                    <span className="ml-3 font-medium">
                                      Target:
                                    </span>{" "}
                                    {monitor.target}
                                  </>
                                )}
                              </p>
                              {monitor.action && (
                                <p className="text-xs text-red-600 mt-1">
                                  <span className="font-medium">Action:</span>{" "}
                                  {monitor.action}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Education & Handout</CardTitle>
              <p className="text-gray-600">
                Complete education materials for client implementation
              </p>
            </CardHeader>
            <CardContent>
              {clientEducation && (
                <div className="space-y-6">
                  {/* Protocol Name and Overview */}
                  <div>
                    <h3 className="font-bold text-xl mb-3 text-blue-600">
                      {clientEducation.protocolName}
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">
                        Root Cause Explanation:
                      </h4>
                      <p className="text-gray-700">
                        {clientEducation.rootCauseExplanation}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Phase Overview:</h4>
                      <div className="whitespace-pre-line text-gray-700">
                        {clientEducation.phaseOverview}
                      </div>
                    </div>
                  </div>

                  {/* Trucking Schedule */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      Trucking Implementation Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(clientEducation.truckingSchedule).map(
                        ([key, items]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3 capitalize text-blue-600">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </h4>
                            <ul className="space-y-2">
                              {items.map((item: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Success Checklist */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      Success Checklist (Week 2)
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {clientEducation.successChecklist.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Triggers */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      When to Contact Practitioner
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {clientEducation.contactTriggers.map(
                          (trigger, index) => (
                            <li
                              key={index}
                              className="text-sm flex items-start gap-2"
                            >
                              <span className="text-red-500 mt-1">⚠️</span>
                              <span>{trigger}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      Follow-up Schedule
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {clientEducation.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
