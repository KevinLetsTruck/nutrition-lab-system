'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayCircle, 
  Bug, 
  Activity,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  RotateCcw,
  Settings,
  TestTube,
  BarChart,
  FileText,
  Home,
  ArrowRight,
  Sparkles,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function TestingDashboard() {
  const router = useRouter();
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    criticalIssues: 0,
    blockers: 0,
    fixed: 0
  });

  useEffect(() => {
    // Load assessment state
    const savedState = localStorage.getItem('assessment-state');
    if (savedState) {
      setActiveAssessment(JSON.parse(savedState));
    }

    // Load recent issues
    const issues = JSON.parse(localStorage.getItem('assessment-issues') || '[]');
    setRecentIssues(issues.slice(0, 5));
    
    // Calculate stats
    setStats({
      totalIssues: issues.length,
      criticalIssues: issues.filter((i: any) => i.priority === 'CRITICAL').length,
      blockers: issues.filter((i: any) => i.blocksTesting).length,
      fixed: issues.filter((i: any) => i.status === 'FIXED').length
    });
  }, []);

  const startNewAssessment = () => {
    // Clear any existing assessment
    localStorage.removeItem('assessment-state');
    router.push('/dashboard/assessment/new');
  };

  const resumeAssessment = () => {
    if (activeAssessment?.assessmentId) {
      router.push(`/dashboard/assessment/${activeAssessment.assessmentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TestTube className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold">Testing Dashboard</h1>
                <p className="text-sm text-gray-600">Assessment Testing & Issue Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                <Activity className="h-3 w-3 mr-1" />
                System Active
              </Badge>
              <Badge variant="outline">
                Test Mode: ON
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Assessment Status Card */}
          <Card className={activeAssessment ? 'border-green-500 bg-green-50' : 'border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ClipboardCheck className="h-8 w-8 text-green-600" />
                {activeAssessment && (
                  <Badge className="bg-green-600">In Progress</Badge>
                )}
              </div>
              <h3 className="font-semibold mb-2">Assessment Testing</h3>
              {activeAssessment ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Module: {activeAssessment.currentModule}
                  </p>
                  <p className="text-sm text-gray-600">
                    Questions: {activeAssessment.questionsAsked || 0}
                  </p>
                  <Button 
                    onClick={resumeAssessment}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Resume Assessment
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    No active assessment
                  </p>
                  <Button 
                    onClick={startNewAssessment}
                    className="w-full"
                    size="sm"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start New Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues Summary Card */}
          <Card className={stats.blockers > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Bug className="h-8 w-8 text-red-600" />
                {stats.blockers > 0 && (
                  <Badge className="bg-red-600 animate-pulse">
                    {stats.blockers} Blockers
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold mb-2">Issue Tracking</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Issues:</span>
                  <span className="font-bold">{stats.totalIssues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Critical:</span>
                  <span className="font-bold text-red-600">{stats.criticalIssues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fixed:</span>
                  <span className="font-bold text-green-600">{stats.fixed}</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/assessment-issues')}
                variant="outline"
                className="w-full mt-3"
                size="sm"
              >
                <Bug className="mr-2 h-4 w-4" />
                View All Issues
              </Button>
            </CardContent>
          </Card>

          {/* Quick Issue Log Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <Badge variant="outline">Quick Log</Badge>
              </div>
              <h3 className="font-semibold mb-2">Found an Issue?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Log it quickly while testing
              </p>
              <Button 
                onClick={() => {
                  const issue = prompt('Describe the issue:');
                  if (issue) {
                    const newIssue = {
                      id: `quick-${Date.now()}`,
                      title: issue,
                      category: 'BUG',
                      priority: 'MEDIUM',
                      status: 'OPEN',
                      createdAt: new Date(),
                      updatedAt: new Date()
                    };
                    const existing = JSON.parse(localStorage.getItem('assessment-issues') || '[]');
                    existing.unshift(newIssue);
                    localStorage.setItem('assessment-issues', JSON.stringify(existing));
                    toast.success('Issue logged!');
                    window.location.reload();
                  }
                }}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Quick Log Issue
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Or press Ctrl+Shift+I
              </p>
            </CardContent>
          </Card>

          {/* System Monitor Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-blue-600" />
                <Badge variant="outline">Monitor</Badge>
              </div>
              <h3 className="font-semibold mb-2">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">API Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Claude AI Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Database Ready</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/pipeline-monitor')}
                variant="outline"
                className="w-full mt-3"
                size="sm"
              >
                <Activity className="mr-2 h-4 w-4" />
                AI Monitor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="guide" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guide">Testing Guide</TabsTrigger>
            <TabsTrigger value="recent">Recent Issues</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <Card>
              <CardHeader>
                <CardTitle>Testing Workflow</CardTitle>
                <CardDescription>Follow this process for systematic testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Start Assessment</h4>
                      <p className="text-sm text-gray-600">Click "Start New Test" to begin a fresh assessment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Answer Questions</h4>
                      <p className="text-sm text-gray-600">Test all question types, try edge cases</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Log Issues</h4>
                      <p className="text-sm text-gray-600">Use Ctrl+Shift+I for quick logging</p>
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                        <strong>Blocked?</strong> Stop and fix immediately<br />
                        <strong>Not blocked?</strong> Log and continue
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Test Features</h4>
                      <p className="text-sm text-gray-600">Pause/Resume, Back button, Auto-advance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
                <CardDescription>Latest issues logged during testing</CardDescription>
              </CardHeader>
              <CardContent>
                {recentIssues.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No issues logged yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {issue.priority === 'CRITICAL' ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{issue.title}</p>
                            <p className="text-xs text-gray-500">
                              {issue.category} • {issue.status}
                            </p>
                          </div>
                        </div>
                        {issue.blocksTesting && (
                          <Badge className="bg-red-600">Blocker</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>Testing Checklist</CardTitle>
                <CardDescription>Ensure comprehensive testing coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Test all 8 question types',
                    'Try keyboard shortcuts',
                    'Test pause and resume',
                    'Check mobile responsiveness',
                    'Verify auto-save works',
                    'Test back button',
                    'Check progress tracking',
                    'Review AI question selection',
                    'Complete full assessment',
                    'Review results page'
                  ].map((item, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Ctrl+Shift+I - Quick log issue</div>
                      <div>Ctrl+Shift+D - Toggle dev toolbar</div>
                      <div>Y/N - Yes/No questions</div>
                      <div>A-E - Multiple choice</div>
                      <div>0-9 - Likert scale</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Issue Priority</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600">Critical</Badge>
                        <span>Blocks testing - fix immediately</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-600">High</Badge>
                        <span>Major issue - fix same day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-600">Medium</Badge>
                        <span>Important - fix this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessment/new')}
                className="justify-start"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessment-issues')}
                className="justify-start"
              >
                <Bug className="mr-2 h-4 w-4" />
                Issue Tracker
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/pipeline-monitor')}
                className="justify-start"
              >
                <Activity className="mr-2 h-4 w-4" />
                AI Monitor
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessments')}
                className="justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                All Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
