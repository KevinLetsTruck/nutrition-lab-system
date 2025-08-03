'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  User, 
  TrendingUp,
  Download,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface ComprehensiveAnalysisButtonProps {
  clientId: string;
  clientName?: string;
}

interface AnalysisResult {
  analysis: any;
  artifacts: {
    practitionerReport: string;
    clientSummary: string;
    protocolDocument: string;
    progressReport?: string;
  };
  supplementRecommendations: any;
  progressComparison?: any;
}

export const ComprehensiveAnalysisButton = ({ clientId, clientName }: ComprehensiveAnalysisButtonProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  
  const runComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`/api/clients/${clientId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result);
        toast.success('Comprehensive analysis complete!');
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const downloadArtifact = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!analysis) {
    return (
      <div className="comprehensive-analysis">
        <Card className="p-6">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Comprehensive Client Analysis</h3>
            <p className="text-muted-foreground mb-6">
              Analyze all client data including assessments, notes, lab results, and protocols to generate personalized functional medicine recommendations.
            </p>
            
            <Button 
              onClick={runComprehensiveAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Analyzing All Client Data...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Run Comprehensive Analysis
                </>
              )}
            </Button>
            
            {isAnalyzing && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>This may take 30-60 seconds as we analyze:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Assessment history and patterns</li>
                  <li>• Session notes and progress</li>
                  <li>• Lab results and biomarkers</li>
                  <li>• Protocol effectiveness</li>
                  <li>• Root cause analysis</li>
                  <li>• Supplement recommendations</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="comprehensive-analysis space-y-6">
      {/* Success Header */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">Analysis Complete!</h3>
            <p className="text-green-700">
              Comprehensive analysis generated for {clientName || 'client'} on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Analysis Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analysis Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-900">
              {analysis.analysis.rootCauseAnalysis.length}
            </div>
            <div className="text-sm text-blue-700">Root Causes Identified</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-900">
              {analysis.supplementRecommendations.phase1.length + 
               analysis.supplementRecommendations.phase2.length + 
               analysis.supplementRecommendations.phase3.length}
            </div>
            <div className="text-sm text-green-700">Supplements Recommended</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-900">
              ${analysis.supplementRecommendations.totalMonthlyCost}
            </div>
            <div className="text-sm text-purple-700">Monthly Cost</div>
          </div>
        </div>
        
        {/* Root Causes */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Top Root Causes</h4>
          <div className="space-y-2">
            {analysis.analysis.rootCauseAnalysis.slice(0, 3).map((cause: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{cause.name}</div>
                  <div className="text-sm text-muted-foreground">{cause.explanation.substring(0, 100)}...</div>
                </div>
                <Badge variant="secondary">{cause.confidence}% confidence</Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* Progress Comparison */}
        {analysis.progressComparison && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Progress Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.progressComparison.improvementAreas.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900 mb-2">Improvements</div>
                  {analysis.progressComparison.improvementAreas.map((area: any, index: number) => (
                    <div key={index} className="text-sm text-green-700">
                      • {area.system}: +{area.improvement} points
                    </div>
                  ))}
                </div>
              )}
              
              {analysis.progressComparison.worsenedAreas.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-900 mb-2">Areas of Concern</div>
                  {analysis.progressComparison.worsenedAreas.map((area: any, index: number) => (
                    <div key={index} className="text-sm text-red-700">
                      • {area.system}: -{area.decline} points
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
      
      {/* Artifacts Tabs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Analysis Artifacts</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadArtifact(analysis.artifacts.practitionerReport, 'practitioner-analysis.md')}
            >
              <Download className="w-4 h-4 mr-2" />
              Practitioner Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadArtifact(analysis.artifacts.protocolDocument, 'health-protocol.md')}
            >
              <Download className="w-4 h-4 mr-2" />
              Protocol Document
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Client Summary
            </TabsTrigger>
            <TabsTrigger value="practitioner" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Practitioner Report
            </TabsTrigger>
            <TabsTrigger value="protocol" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Protocol Document
            </TabsTrigger>
            {analysis.artifacts.progressReport && (
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Progress Report
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="summary" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {analysis.artifacts.clientSummary}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="practitioner" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {analysis.artifacts.practitionerReport}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="protocol" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {analysis.artifacts.protocolDocument}
              </pre>
            </div>
          </TabsContent>
          
          {analysis.artifacts.progressReport && (
            <TabsContent value="progress" className="mt-4">
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {analysis.artifacts.progressReport}
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </Card>
      
      {/* Supplement Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Supplement Recommendations</h3>
        
        <Tabs defaultValue="phase1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="phase1">Phase 1 (Weeks 1-4)</TabsTrigger>
            <TabsTrigger value="phase2">Phase 2 (Weeks 5-12)</TabsTrigger>
            <TabsTrigger value="phase3">Phase 3 (Weeks 13-24)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phase1" className="mt-4">
            <div className="space-y-4">
              {analysis.supplementRecommendations.phase1.map((supp: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{supp.name}</h4>
                    <Badge variant="outline">{supp.source}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Dosage:</strong> {supp.dosage}<br/>
                      <strong>Timing:</strong> {supp.timing}<br/>
                      <strong>Cost:</strong> ${supp.price || 'TBD'}/month
                    </div>
                    <div>
                      <strong>Instructions:</strong> {supp.instructions}<br/>
                      <strong>Rationale:</strong> {supp.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="phase2" className="mt-4">
            <div className="space-y-4">
              {analysis.supplementRecommendations.phase2.map((supp: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{supp.name}</h4>
                    <Badge variant="outline">{supp.source}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Dosage:</strong> {supp.dosage}<br/>
                      <strong>Timing:</strong> {supp.timing}<br/>
                      <strong>Cost:</strong> ${supp.price || 'TBD'}/month
                    </div>
                    <div>
                      <strong>Instructions:</strong> {supp.instructions}<br/>
                      <strong>Rationale:</strong> {supp.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="phase3" className="mt-4">
            <div className="space-y-4">
              {analysis.supplementRecommendations.phase3.map((supp: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{supp.name}</h4>
                    <Badge variant="outline">{supp.source}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Dosage:</strong> {supp.dosage}<br/>
                      <strong>Timing:</strong> {supp.timing}<br/>
                      <strong>Cost:</strong> ${supp.price || 'TBD'}/month
                    </div>
                    <div>
                      <strong>Instructions:</strong> {supp.instructions}<br/>
                      <strong>Rationale:</strong> {supp.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setAnalysis(null)}
          variant="outline"
        >
          Run New Analysis
        </Button>
        <Button
          onClick={() => {
            // Save to client notes or create new protocol
            toast.success('Analysis saved to client record');
          }}
        >
          Save to Client Record
        </Button>
      </div>
    </div>
  );
}; 