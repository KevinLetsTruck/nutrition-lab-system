'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Eye, 
  Download,
  AlertCircle,
  Activity,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Analysis {
  id: string;
  analysisDate: string;
  analysisVersion: string;
  status: string;
  sections: {
    executiveSummary: boolean;
    systemAnalysis: boolean;
    rootCauseAnalysis: boolean;
    protocolRecommendations: boolean;
    monitoringPlan: boolean;
    patientEducation: boolean;
  };
  practitionerNotes?: string;
  createdBy?: string;
  createdAt: string;
  protocolsGenerated: number;
  activeProtocols: number;
  analysisLength: number;
  sectionsDetected: number;
}

interface AnalysisHistoryData {
  client: {
    id: string;
    name: string;
  };
  totalAnalyses: number;
  analyses: Analysis[];
}

interface AnalysisHistoryListProps {
  clientId: string;
}

export function AnalysisHistoryList({ clientId }: AnalysisHistoryListProps) {
  const { token } = useAuth();
  const [data, setData] = useState<AnalysisHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);

  useEffect(() => {
    fetchAnalysisHistory();
  }, [clientId]);

  const fetchAnalysisHistory = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}/analysis/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis history');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const getSectionBadges = (sections: Analysis['sections']) => {
    const availableSections = Object.entries(sections)
      .filter(([_, available]) => available)
      .map(([section]) => section);

    return availableSections.map((section) => {
      const sectionNames: Record<string, string> = {
        executiveSummary: 'Summary',
        systemAnalysis: 'Systems',
        rootCauseAnalysis: 'Root Cause',
        protocolRecommendations: 'Protocol',
        monitoringPlan: 'Monitoring',
        patientEducation: 'Education'
      };

      return (
        <Badge key={section} variant="secondary" className="text-xs">
          {sectionNames[section] || section}
        </Badge>
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading analysis history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.analyses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyses Found</h3>
          <p className="text-gray-600 mb-4">
            This client doesn't have any Claude Desktop analyses imported yet.
          </p>
          <Button asChild>
            <a href={`/dashboard/clients/${clientId}/analysis/import`}>
              Import First Analysis
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analysis History
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {data.totalAnalyses} analysis(es) for {data.client.name}
              </p>
            </div>
            <Button size="sm" asChild>
              <a href={`/dashboard/clients/${clientId}/analysis/import`}>
                Import New Analysis
              </a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analyses Timeline */}
      <div className="space-y-4">
        {data.analyses.map((analysis, index) => (
          <Card key={analysis.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Analysis #{data.analyses.length - index}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(analysis.status)}
                    >
                      {analysis.status}
                    </Badge>
                    <Badge variant="outline">
                      {analysis.analysisVersion}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(analysis.analysisDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {Math.round(analysis.analysisLength / 100) / 10}K chars
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Sections Detected */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Sections Detected ({analysis.sectionsDetected})
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSectionBadges(analysis.sections)}
                </div>
              </div>

              {/* Protocols Generated */}
              {analysis.protocolsGenerated > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Protocols Generated
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{analysis.protocolsGenerated} total protocols</span>
                    {analysis.activeProtocols > 0 && (
                      <span className="text-green-600 font-medium">
                        {analysis.activeProtocols} active
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Practitioner Notes */}
              {analysis.practitionerNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Practitioner Notes
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                    {analysis.practitionerNotes}
                  </p>
                </div>
              )}

              {/* Timeline indicator */}
              {index < data.analyses.length - 1 && (
                <div className="absolute left-6 -bottom-4 w-0.5 h-8 bg-gray-200" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Tool */}
      {data.analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Compare analyses to track client progress and intervention effectiveness.
            </p>
            <Button variant="outline" disabled>
              <TrendingUp className="h-4 w-4 mr-2" />
              Compare Analyses (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
