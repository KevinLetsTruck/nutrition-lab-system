"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Target,
  Pills,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  Zap,
} from "lucide-react";

interface Analysis {
  id: string;
  analysisData: any;
  rootCauses: string[];
  riskFactors: string[];
  priorityAreas: string[];
  confidence: number;
  analysisDate: string;
  version: string;
  protocolPhases: ProtocolPhase[];
  supplements: Supplement[];
  protocolHistory: ProtocolHistory[];
}

interface ProtocolPhase {
  id: string;
  phase: string;
  name: string;
  description: string;
  duration: string;
  supplements: any[];
  lifestyle: any[];
  dietary: any[];
  monitoring: any[];
  status: string;
}

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  priority: string;
  category: string;
  phase: string;
  rationale?: string;
  productUrl?: string;
  estimatedCost: number;
  status: string;
}

interface ProtocolHistory {
  id: string;
  action: string;
  details: any;
  timestamp: string;
}

interface AnalysisResultsViewerProps {
  clientId: string;
  clientName: string;
}

export function AnalysisResultsViewer({ 
  clientId, 
  clientName 
}: AnalysisResultsViewerProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, [clientId]);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAnalyses([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/clients/${clientId}/import-analysis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If it's a 404 or 500, just show no analyses instead of error
        console.warn("Could not fetch analyses:", response.status);
        setAnalyses([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalyses(data.analyses || []);
      if (data.analyses && data.analyses.length > 0) {
        setSelectedAnalysis(data.analyses[0]); // Select most recent
      }
    } catch (err) {
      console.warn("Error fetching analyses:", err);
      // Don't show error, just show no analyses
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-yellow-500";
      case "LOW": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-300">Loading analyses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-400 mb-2">Error loading analyses</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <Button onClick={fetchAnalyses} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 mb-2">No analyses imported yet</p>
            <p className="text-gray-500 text-sm">
              Import Claude analysis results to see comprehensive protocols
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Selection */}
      {analyses.length > 1 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-400" />
              Analysis History
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedAnalysis?.id === analysis.id
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {new Date(analysis.analysisDate).toLocaleDateString()}
                    </span>
                    <span className={`text-sm ${getConfidenceColor(analysis.confidence)}`}>
                      {(analysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {analysis.rootCauses.length} root causes • {analysis.supplements.length} supplements
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Analysis Details */}
      {selectedAnalysis && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-400" />
                Analysis Results
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-gray-300">
                  v{selectedAnalysis.version}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={getConfidenceColor(selectedAnalysis.confidence)}
                >
                  {(selectedAnalysis.confidence * 100).toFixed(1)}% Confidence
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="phases">Protocol Phases</TabsTrigger>
                <TabsTrigger value="supplements">Supplements</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Root Causes */}
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-red-400" />
                    Root Causes
                  </h4>
                  <div className="space-y-1">
                    {selectedAnalysis.rootCauses.map((cause, index) => (
                      <div key={index} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
                        {cause}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Areas */}
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-400" />
                    Priority Intervention Areas
                  </h4>
                  <div className="space-y-1">
                    {selectedAnalysis.priorityAreas.map((area, index) => (
                      <div key={index} className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-300 text-sm">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-400" />
                    Risk Factors
                  </h4>
                  <div className="space-y-1">
                    {selectedAnalysis.riskFactors.map((factor, index) => (
                      <div key={index} className="p-2 bg-orange-500/10 border border-orange-500/20 rounded text-orange-300 text-sm">
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="phases" className="space-y-4">
                {selectedAnalysis.protocolPhases.map((phase) => (
                  <Card key={phase.id} className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{phase.name}</h4>
                        <Badge variant="outline" className="text-gray-300">
                          {phase.duration}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{phase.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {phase.supplements.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-white mb-1">Supplements</h5>
                          <div className="text-xs text-gray-300">
                            {phase.supplements.length} recommendations
                          </div>
                        </div>
                      )}
                      {phase.lifestyle.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-white mb-1">Lifestyle</h5>
                          <div className="text-xs text-gray-300">
                            {phase.lifestyle.length} interventions
                          </div>
                        </div>
                      )}
                      {phase.dietary.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-white mb-1">Dietary</h5>
                          <div className="text-xs text-gray-300">
                            {phase.dietary.length} recommendations
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="supplements" className="space-y-4">
                <div className="grid gap-3">
                  {selectedAnalysis.supplements.map((supplement) => (
                    <Card key={supplement.id} className="bg-gray-700 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{supplement.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`${getPriorityColor(supplement.priority)} text-white`}
                            >
                              {supplement.priority}
                            </Badge>
                            <Badge variant="outline" className="text-gray-300">
                              {supplement.phase}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Dosage:</span>
                            <span className="text-white ml-1">{supplement.dosage}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Timing:</span>
                            <span className="text-white ml-1">{supplement.timing}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-1">{supplement.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Category:</span>
                            <span className="text-white ml-1">{supplement.category}</span>
                          </div>
                        </div>
                        {supplement.rationale && (
                          <div className="mt-2 p-2 bg-gray-600 rounded text-xs text-gray-300">
                            <strong>Rationale:</strong> {supplement.rationale}
                          </div>
                        )}
                        {supplement.productUrl && (
                          <div className="mt-2">
                            <a 
                              href={supplement.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs"
                            >
                              View Product →
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  {selectedAnalysis.protocolHistory.map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-700 border border-gray-600 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white">{entry.action}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {entry.details && (
                        <div className="text-xs text-gray-300">
                          {JSON.stringify(entry.details, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
