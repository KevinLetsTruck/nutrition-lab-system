'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Download, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalysisData {
  assessment: {
    id: string;
    completedAt: string;
    questionsAsked: number;
    questionsSaved: number;
  };
  analysis: {
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
    seedOilScore: {
      exposureLevel: number;
      damageIndicators: number;
      recoveryPotential: number;
      priorityLevel: string;
      recommendations: string[];
    };
  };
}

const MODULE_NAMES: Record<string, string> = {
  ASSIMILATION: 'Digestive System',
  DEFENSE_REPAIR: 'Immune System',
  ENERGY: 'Energy & Metabolism',
  BIOTRANSFORMATION: 'Detoxification',
  TRANSPORT: 'Cardiovascular',
  COMMUNICATION: 'Hormones & Brain',
  STRUCTURAL: 'Musculoskeletal'
};

export default function AssessmentResultsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/analysis`);
      if (!response.ok) throw new Error('Failed to fetch results');

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load assessment results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Analyzing your assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load assessment results'}</p>
          <Button onClick={() => router.push('/assessments')}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const { assessment, analysis } = data;
  const scoreColor = analysis.overallScore >= 80 ? 'text-green-600' : 
                     analysis.overallScore >= 60 ? 'text-yellow-600' : 
                     analysis.overallScore >= 40 ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/assessments')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Health Assessment Results</h1>
          <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
            {analysis.overallScore}/100
          </div>
          <p className="text-gray-600 text-lg">{analysis.aiSummary}</p>

          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div>
              <span className="text-gray-500">Questions Asked:</span>
              <span className="ml-2 font-semibold">{assessment.questionsAsked}</span>
            </div>
            <div>
              <span className="text-gray-500">Questions Saved by AI:</span>
              <span className="ml-2 font-semibold text-green-600">{assessment.questionsSaved}</span>
            </div>
          </div>
        </Card>

        {/* Module Scores */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Health Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.nodeScores).map(([module, score]) => (
              <div key={module} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{MODULE_NAMES[module] || module}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className={`h-2 rounded-full ${
                        score >= 80 ? 'bg-green-500' : 
                        score >= 60 ? 'bg-yellow-500' : 
                        score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="font-semibold w-12 text-right">{score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Findings & Concerns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Primary Concerns</h2>
            <ul className="space-y-2">
              {analysis.primaryConcerns.map((concern, i) => (
                <li key={i} className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{concern}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Strengths</h2>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Seed Oil Assessment */}
        {analysis.seedOilScore.priorityLevel !== 'LOW' && (
          <Card className="p-6 mb-6 border-orange-200 bg-orange-50">
            <h2 className="text-xl font-semibold mb-4">Seed Oil Exposure Assessment</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.seedOilScore.exposureLevel}/10
                </div>
                <div className="text-sm text-gray-600">Exposure Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analysis.seedOilScore.damageIndicators}/10
                </div>
                <div className="text-sm text-gray-600">Damage Indicators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.seedOilScore.recoveryPotential}/10
                </div>
                <div className="text-sm text-gray-600">Recovery Potential</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Recommendations:</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.seedOilScore.recommendations.map((rec, i) => (
                  <li key={i} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Suggested Labs */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recommended Laboratory Tests</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-600 mb-2">Essential Tests</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.suggestedLabs.essential.map((lab, i) => (
                  <li key={i} className="text-gray-700">{lab}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-yellow-600 mb-2">Recommended Tests</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.suggestedLabs.recommended.map((lab, i) => (
                  <li key={i} className="text-gray-700">{lab}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-600 mb-2">Optional Tests</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.suggestedLabs.optional.map((lab, i) => (
                  <li key={i} className="text-gray-700">{lab}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => router.push('/protocols/generate')}>
            Generate Treatment Protocol
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/assessments')}>
            Back to Assessments
          </Button>
        </div>
      </div>
    </div>
  );
}
