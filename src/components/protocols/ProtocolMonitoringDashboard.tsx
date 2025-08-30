'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  AlertTriangle, 
  Target,
  Calendar,
  Activity,
  BarChart3,
  Clock,
  User
} from 'lucide-react';

interface ProtocolData {
  protocol: {
    id: string;
    name: string;
    currentStatus: string;
    startDate: string;
    durationWeeks: number;
    client: {
      id: string;
      name: string;
    };
  };
  progressHistory: Array<{
    id: string;
    weekNumber: number;
    trackingDate: string;
    energyLevel: number | null;
    sleepQuality: number | null;
    digestionHealth: number | null;
    overallWellbeing: number | null;
    supplementCompliance: number | null;
    dietaryCompliance: number | null;
    lifestyleCompliance: number | null;
    symptomsNotes: string | null;
    challengesFaced: string | null;
    positiveChanges: string | null;
    questionsConcerns: string | null;
    submittedBy: string;
  }>;
  statusHistory: Array<{
    id: string;
    previousStatus: string | null;
    newStatus: string;
    reasonForChange: string | null;
    adjustmentNotes: string | null;
    changedAt: string;
  }>;
  progressSummary: {
    currentWeek: number;
    totalWeeks: number;
    latestScores: {
      energy: number | null;
      sleep: number | null;
      digestion: number | null;
      wellbeing: number | null;
      compliance: {
        supplements: number | null;
        dietary: number | null;
        lifestyle: number | null;
      };
    };
    trends: {
      energyTrend: 'improving' | 'stable' | 'declining';
      sleepTrend: 'improving' | 'stable' | 'declining';
      digestionTrend: 'improving' | 'stable' | 'declining';
      wellbeingTrend: 'improving' | 'stable' | 'declining';
    };
  } | null;
}

interface ProtocolMonitoringDashboardProps {
  protocolId: string;
}

export function ProtocolMonitoringDashboard({ protocolId }: ProtocolMonitoringDashboardProps) {
  const { token } = useAuth();
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (protocolId && token) {
      fetchProtocolProgress();
    }
  }, [protocolId, token]);

  const fetchProtocolProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/protocols/${protocolId}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProtocolData(data);
      } else {
        toast.error('Failed to load protocol progress');
      }
    } catch (error) {
      console.error('Error fetching protocol progress:', error);
      toast.error('Error loading protocol data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <ArrowRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'discontinued': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score: number | null): string => {
    if (!score) return 'text-gray-400';
    if (score <= 2) return 'text-red-600';
    if (score === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAverageScore = (progress: ProtocolData['progressHistory'][0]): number => {
    const scores = [
      progress.energyLevel,
      progress.sleepQuality,
      progress.digestionHealth,
      progress.overallWellbeing
    ].filter(score => score !== null);
    
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((sum, score) => sum + score!, 0) / scores.length) * 10) / 10;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading protocol progress...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!protocolData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No progress data available</p>
            <Button variant="outline" onClick={fetchProtocolProgress} className="mt-4">
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { protocol, progressHistory, progressSummary, statusHistory } = protocolData;

  return (
    <div className="space-y-6">
      {/* Protocol Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Activity className="h-5 w-5 text-blue-600" />
              {protocol.name}
            </CardTitle>
            <Badge className={`${getStatusColor(protocol.currentStatus)} border`}>
              {protocol.currentStatus.charAt(0).toUpperCase() + protocol.currentStatus.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {protocol.client.name}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Started: {protocol.startDate ? formatDate(protocol.startDate) : 'Not started'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Week {progressSummary?.currentWeek || 1} of {protocol.durationWeeks || 'ongoing'}
            </div>
          </div>
        </CardHeader>
      </Card>

      {progressSummary && (
        <>
          {/* Current Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Latest Health Metrics (Week {progressSummary.currentWeek})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-3xl font-bold ${getScoreColor(progressSummary.latestScores.energy)}`}>
                      {progressSummary.latestScores.energy || '--'}/5
                    </span>
                    {getTrendIcon(progressSummary.trends.energyTrend)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Energy</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-3xl font-bold ${getScoreColor(progressSummary.latestScores.sleep)}`}>
                      {progressSummary.latestScores.sleep || '--'}/5
                    </span>
                    {getTrendIcon(progressSummary.trends.sleepTrend)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sleep</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-3xl font-bold ${getScoreColor(progressSummary.latestScores.digestion)}`}>
                      {progressSummary.latestScores.digestion || '--'}/5
                    </span>
                    {getTrendIcon(progressSummary.trends.digestionTrend)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Digestion</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-3xl font-bold ${getScoreColor(progressSummary.latestScores.wellbeing)}`}>
                      {progressSummary.latestScores.wellbeing || '--'}/5
                    </span>
                    {getTrendIcon(progressSummary.trends.wellbeingTrend)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Wellbeing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Protocol Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getScoreColor(progressSummary.latestScores.compliance.supplements)}`}>
                    {progressSummary.latestScores.compliance.supplements || '--'}/5
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Supplements</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getScoreColor(progressSummary.latestScores.compliance.dietary)}`}>
                    {progressSummary.latestScores.compliance.dietary || '--'}/5
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dietary</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getScoreColor(progressSummary.latestScores.compliance.lifestyle)}`}>
                    {progressSummary.latestScores.compliance.lifestyle || '--'}/5
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Lifestyle</p>
                </div>
              </div>
              
              {/* Overall Compliance Score */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Compliance</div>
                  <div className={`text-3xl font-bold ${
                    getScoreColor(
                      progressSummary.latestScores.compliance.supplements && 
                      progressSummary.latestScores.compliance.dietary && 
                      progressSummary.latestScores.compliance.lifestyle 
                        ? Math.round((progressSummary.latestScores.compliance.supplements + 
                                     progressSummary.latestScores.compliance.dietary + 
                                     progressSummary.latestScores.compliance.lifestyle) / 3)
                        : null
                    )
                  }`}>
                    {progressSummary.latestScores.compliance.supplements && 
                     progressSummary.latestScores.compliance.dietary && 
                     progressSummary.latestScores.compliance.lifestyle 
                      ? Math.round((progressSummary.latestScores.compliance.supplements + 
                                   progressSummary.latestScores.compliance.dietary + 
                                   progressSummary.latestScores.compliance.lifestyle) / 3)
                      : '--'}/5
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Progress Timeline
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progressHistory.length} progress reports submitted
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressHistory.slice(-5).reverse().map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          Week {progress.weekNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(progress.trackingDate)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${getScoreColor(progress.energyLevel)}`}>
                            {progress.energyLevel || '--'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Energy</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${getScoreColor(progress.sleepQuality)}`}>
                            {progress.sleepQuality || '--'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Sleep</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${getScoreColor(progress.digestionHealth)}`}>
                            {progress.digestionHealth || '--'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Digestion</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-semibold ${getScoreColor(progress.overallWellbeing)}`}>
                            {progress.overallWellbeing || '--'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Wellbeing</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Avg: {getAverageScore(progress)}/5
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          by {progress.submittedBy}
                        </div>
                      </div>
                      {progress.questionsConcerns && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" title="Client has questions" />
                      )}
                    </div>
                  </div>
                ))}
                
                {progressHistory.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No progress reports yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Progress tracking will appear here once client submits their first report
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Client Feedback */}
          {progressHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  Latest Client Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latest = progressHistory[progressHistory.length - 1];
                  const hasFeedback = latest.positiveChanges || latest.challengesFaced || latest.symptomsNotes || latest.questionsConcerns;
                  
                  if (!hasFeedback) {
                    return (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No feedback provided in latest progress report
                      </p>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      {latest.positiveChanges && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                            ✅ Positive Changes
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {latest.positiveChanges}
                          </p>
                        </div>
                      )}
                      
                      {latest.challengesFaced && (
                        <div>
                          <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                            ⚠️ Challenges Faced
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {latest.challengesFaced}
                          </p>
                        </div>
                      )}
                      
                      {latest.symptomsNotes && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                            🩺 Symptoms/Concerns
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {latest.symptomsNotes}
                          </p>
                        </div>
                      )}
                      
                      {latest.questionsConcerns && (
                        <div>
                          <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                            ❓ Questions for You
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {latest.questionsConcerns}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Progress Data State */}
      {!progressSummary && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Progress Data Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This protocol hasn't had any progress reports submitted yet.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Progress tracking will show here once the client submits their first weekly check-in.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getAverageScore(progress: ProtocolData['progressHistory'][0]): number {
  const scores = [
    progress.energyLevel,
    progress.sleepQuality,
    progress.digestionHealth,
    progress.overallWellbeing
  ].filter(score => score !== null);
  
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((sum, score) => sum + score!, 0) / scores.length) * 10) / 10;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
