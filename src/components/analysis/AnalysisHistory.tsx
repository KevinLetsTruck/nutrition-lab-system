'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Target,
  AlertCircle
} from 'lucide-react';

interface Analysis {
  id: string;
  analysisData: any;
  rootCauses: string[];
  priorityAreas: string[];
  confidence: number;
  analysisDate: string;
  version: string;
  analysisType: string;
  triggerEvent?: string;
  relatedDocuments: string[];
  parentAnalysis?: {
    id: string;
    analysisDate: string;
    analysisType: string;
  };
  childAnalyses: {
    id: string;
    analysisDate: string;
    analysisType: string;
  }[];
}

interface AnalysisHistoryProps {
  clientId: string;
  clientName: string;
}

export function AnalysisHistory({ clientId, clientName }: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisHistory();
  }, [clientId]);

  const fetchAnalysisHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients/${clientId}/analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis history');
      }

      const data = await response.json();
      setAnalyses(data.analyses);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'INITIAL': return 'bg-blue-100 text-blue-800';
      case 'FOLLOW_UP': return 'bg-green-100 text-green-800';
      case 'PROTOCOL_REVIEW': return 'bg-purple-100 text-purple-800';
      case 'SYMPTOM_CHANGE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading analysis history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Error loading analysis history: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analysis Overview for {clientName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</div>
                <div className="text-sm text-gray-600">Total Analyses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.followUpAnalyses}</div>
                <div className="text-sm text-gray-600">Follow-ups</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(stats.averageConfidence)}`}>
                  {(stats.averageConfidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.protocolReviews}</div>
                <div className="text-sm text-gray-600">Protocol Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Analysis Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No analyses found</p>
              <p className="text-sm text-gray-500">Import a Claude analysis to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis, index) => (
                <div key={analysis.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getAnalysisTypeColor(analysis.analysisType)}>
                          {analysis.analysisType.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {formatDate(analysis.analysisDate)}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                        {(analysis.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedAnalysis(
                        expandedAnalysis === analysis.id ? null : analysis.id
                      )}
                    >
                      {expandedAnalysis === analysis.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {analysis.triggerEvent && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Triggered by:</strong> {analysis.triggerEvent}
                    </div>
                  )}

                  {expandedAnalysis === analysis.id && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {analysis.rootCauses.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Root Causes ({analysis.rootCauses.length})
                          </h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {analysis.rootCauses.slice(0, 5).map((cause, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.priorityAreas.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Priority Areas ({analysis.priorityAreas.length})
                          </h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {analysis.priorityAreas.slice(0, 5).map((area, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.relatedDocuments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            Related Documents ({analysis.relatedDocuments.length})
                          </h4>
                          <p className="text-sm text-gray-600">
                            Analysis based on {analysis.relatedDocuments.length} recent document(s)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
