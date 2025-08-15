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
    <div className="min-h-screen bg-[#1a1f2e]">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TestTube className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-white">Testing Dashboard</h1>
                <p className="text-sm text-gray-400">Assessment Testing & Issue Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                System Active
              </Badge>
              <Badge className="bg-gray-700/50 text-gray-300 border-gray-600">
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
          <Card className={activeAssessment ? 'border-green-500 bg-gray-800/50' : 'bg-gray-800/50 border-gray-700'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ClipboardCheck className="h-8 w-8 text-green-600" />
                {activeAssessment && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">In Progress</Badge>
                )}
              </div>
              <h3 className="font-semibold mb-2 text-white">Assessment Testing</h3>
              {activeAssessment ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Module: {activeAssessment.currentModule}
                  </p>
                  <p className="text-sm text-gray-400">
                    Questions: {activeAssessment.questionsAsked || 0}
                  </p>
                  <Button 
                    onClick={resumeAssessment}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Resume Assessment
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-400 mb-3">
                    No active assessment
                  </p>
                  <Button 
                    onClick={startNewAssessment}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
          <Card className={stats.blockers > 0 ? 'border-red-500 bg-gray-800/50' : 'bg-gray-800/50 border-gray-700'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Bug className="h-8 w-8 text-red-600" />
                {stats.blockers > 0 && (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">
                    {stats.blockers} Blockers
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold mb-2 text-white">Issue Tracking</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Issues:</span>
                  <span className="font-bold text-white">{stats.totalIssues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Critical:</span>
                  <span className="font-bold text-red-400">{stats.criticalIssues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fixed:</span>
                  <span className="font-bold text-green-400">{stats.fixed}</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/assessment-issues')}
                variant="outline"
                className="w-full mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
                size="sm"
              >
                <Bug className="mr-2 h-4 w-4" />
                View All Issues
              </Button>
            </CardContent>
          </Card>

          {/* Quick Issue Log Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Quick Log</Badge>
              </div>
              <h3 className="font-semibold mb-2 text-white">Found an Issue?</h3>
              <p className="text-sm text-gray-400 mb-3">
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
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
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
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Monitor</Badge>
              </div>
              <h3 className="font-semibold mb-2 text-white">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">API Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">Claude AI Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">Database Ready</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/pipeline-monitor')}
                variant="outline"
                className="w-full mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
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
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
            <TabsTrigger value="guide" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Testing Guide</TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Recent Issues</TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Checklist</TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Testing Workflow</CardTitle>
                <CardDescription className="text-gray-400">Follow this process for systematic testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Start Assessment</h4>
                      <p className="text-sm text-gray-400">Click "Start New Test" to begin a fresh assessment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Answer Questions</h4>
                      <p className="text-sm text-gray-400">Test all question types, try edge cases</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Log Issues</h4>
                      <p className="text-sm text-gray-400">Use Ctrl+Shift+I for quick logging</p>
                      <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
                        <strong>Blocked?</strong> Stop and fix immediately<br />
                        <strong>Not blocked?</strong> Log and continue
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Test Features</h4>
                      <p className="text-sm text-gray-400">Pause/Resume, Back button, Auto-advance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Issues</CardTitle>
                <CardDescription className="text-gray-400">Latest issues logged during testing</CardDescription>
              </CardHeader>
              <CardContent>
                {recentIssues.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No issues logged yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-900/50">
                        <div className="flex items-center gap-3">
                          {issue.priority === 'CRITICAL' ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm text-white">{issue.title}</p>
                            <p className="text-xs text-gray-500">
                              {issue.category} • {issue.status}
                            </p>
                          </div>
                        </div>
                        {issue.blocksTesting && (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Blocker</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Testing Checklist</CardTitle>
                <CardDescription className="text-gray-400">Ensure comprehensive testing coverage</CardDescription>
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
                    <label key={i} className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer">
                      <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-600" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Keyboard Shortcuts</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>Ctrl+Shift+I - Quick log issue</div>
                      <div>Ctrl+Shift+D - Toggle dev toolbar</div>
                      <div>Y/N - Yes/No questions</div>
                      <div>A-E - Multiple choice</div>
                      <div>0-9 - Likert scale</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Issue Priority</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Critical</Badge>
                        <span className="text-gray-300">Blocks testing - fix immediately</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">High</Badge>
                        <span className="text-gray-300">Major issue - fix same day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Medium</Badge>
                        <span className="text-gray-300">Important - fix this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Navigation */}
        <Card className="mt-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessment/new')}
                className="justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessment-issues')}
                className="justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Bug className="mr-2 h-4 w-4" />
                Issue Tracker
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/pipeline-monitor')}
                className="justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Activity className="mr-2 h-4 w-4" />
                AI Monitor
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/assessments')}
                className="justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
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
