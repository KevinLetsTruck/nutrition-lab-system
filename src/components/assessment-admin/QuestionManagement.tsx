'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Settings,
  BarChart3,
  Brain,
  Target,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Zap,
  Activity,
} from 'lucide-react';

interface QuestionData {
  id: number;
  questionText: string;
  systemCategory: string;
  subCategory: string;
  diagnosticWeight: number;
  isActive: boolean;
  modernFMUpdate: boolean;
  clinicalNotes: string;
  testingNotes?: string;
}

interface SystemCategory {
  name: string;
  questionCount: number;
  diagnosticPriority: number;
  description: string;
}

interface QuestionAnalytics {
  questionId: number;
  diagnosticAccuracy: number;
  completionRate: number;
  optimizationPriority: 'high' | 'medium' | 'low';
  recommendedActions: Array<{
    action: string;
    description: string;
    priority: number;
  }>;
}

export function QuestionManagement() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [systemCategories, setSystemCategories] = useState<Record<string, SystemCategory>>({});
  const [analytics, setAnalytics] = useState<QuestionAnalytics[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  // Filters
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showModernOnly, setShowModernOnly] = useState(false);
  
  // Dialog states
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false);

  useEffect(() => {
    if (token) {
      fetchQuestionData();
    }
  }, [token, selectedSystem, showInactive, showModernOnly]);

  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedSystem !== 'all') params.append('system', selectedSystem);
      if (!showInactive) params.append('activeOnly', 'true');
      if (showModernOnly) params.append('modernOnly', 'true');

      const response = await fetch(`/api/assessment-admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setSystemCategories(data.systemCategories || {});
        setAnalytics(data.analytics || []);
        setStatistics(data.statistics || null);
      } else {
        toast.error('Failed to load question data');
      }
    } catch (error) {
      console.error('Error fetching question data:', error);
      toast.error('Error loading questions');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question =>
    searchTerm === '' || 
    question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.systemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Settings className="h-5 w-5 text-blue-600" />
            Comprehensive Assessment Management
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Manage 270+ functional medicine questions with performance analytics and optimization
          </p>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {statistics.currentQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questions Built</div>
              <div className="text-xs text-gray-500">
                Target: {statistics.targetQuestions}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {statistics.systemsImplemented}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Body Systems</div>
              <div className="text-xs text-gray-500">
                {statistics.percentComplete}% Complete
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {statistics.modernFMQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Modern FM</div>
              <div className="text-xs text-gray-500">
                New categories
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {questions.filter(q => q.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Questions</div>
              <div className="text-xs text-gray-500">
                Ready for use
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-600" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                {Object.entries(systemCategories).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                Show Inactive
              </label>
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showModernOnly}
                  onChange={(e) => setShowModernOnly(e.target.checked)}
                  className="rounded"
                />
                Modern FM Only
              </label>
            </div>
            
            <Button onClick={() => setShowNewQuestionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Management Tabs */}
      <Tabs defaultValue="questions">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="systems">Systems</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                <span>Question Library ({filteredQuestions.length} questions)</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {questions.filter(q => q.isActive).length} active
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((question) => {
                    const questionAnalytics = analytics.find(a => a.questionId === question.id);
                    
                    return (
                      <div 
                        key={question.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          question.isActive 
                            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                Q{question.id}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {question.systemCategory}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.subCategory}
                              </Badge>
                              {question.modernFMUpdate && (
                                <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-300">
                                  Modern FM
                                </Badge>
                              )}
                              {!question.isActive && (
                                <Badge className="text-xs bg-red-100 text-red-800 border-red-300">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {question.questionText}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Weight: {question.diagnosticWeight}</span>
                              {questionAnalytics && (
                                <>
                                  <span className={getPerformanceColor(questionAnalytics.diagnosticAccuracy)}>
                                    Accuracy: {questionAnalytics.diagnosticAccuracy}%
                                  </span>
                                  <span>Completion: {questionAnalytics.completionRate.toFixed(1)}%</span>
                                  <Badge 
                                    className={`${getPriorityColor(questionAnalytics.optimizationPriority)} text-xs border`}
                                  >
                                    {questionAnalytics.optimizationPriority} priority
                                  </Badge>
                                </>
                              )}
                            </div>
                            
                            {question.testingNotes && (
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  <strong>Testing Notes:</strong> {question.testingNotes}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            {questionAnalytics && questionAnalytics.optimizationPriority === 'high' && (
                              <AlertTriangle className="h-4 w-4 text-red-600" title="Needs optimization" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">No questions match your filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Systems Tab */}
        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(systemCategories).map(([key, category]) => {
                  const systemQuestions = questions.filter(q => q.systemCategory === key);
                  const activeQuestions = systemQuestions.filter(q => q.isActive);
                  const modernQuestions = systemQuestions.filter(q => q.modernFMUpdate);
                  const avgWeight = systemQuestions.reduce((sum, q) => sum + q.diagnosticWeight, 0) / systemQuestions.length;
                  
                  return (
                    <Card key={key} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {category.name}
                          </h4>
                          <Badge 
                            className={`text-xs ${
                              category.diagnosticPriority === 1 ? 'bg-red-100 text-red-800 border-red-300' :
                              category.diagnosticPriority === 2 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-green-100 text-green-800 border-green-300'
                            } border`}
                          >
                            Priority {category.diagnosticPriority}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {activeQuestions.length}/{category.questionCount}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg Weight:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {avgWeight.toFixed(1)}
                            </span>
                          </div>
                          
                          {modernQuestions.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Modern FM:</span>
                              <span className="font-medium text-purple-600">
                                {modernQuestions.length}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSystem(key)}
                            className="text-xs h-7"
                          >
                            View Questions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Question Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {analytics.filter(a => a.diagnosticAccuracy >= 75).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">High Performing</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingDown className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {analytics.filter(a => a.optimizationPriority === 'high').length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Need Optimization</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {analytics.filter(a => a.diagnosticAccuracy < 60).length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Consider Removal</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    {analytics
                      .filter(a => a.optimizationPriority === 'high')
                      .slice(0, 10)
                      .map((analytic) => {
                        const question = questions.find(q => q.id === analytic.questionId);
                        if (!question) return null;
                        
                        return (
                          <div key={analytic.questionId} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    Q{question.id}
                                  </span>
                                  <Badge className={`${getPriorityColor(analytic.optimizationPriority)} text-xs border`}>
                                    {analytic.optimizationPriority} priority
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  {question.questionText.substring(0, 100)}...
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs">
                                  <span className={getPerformanceColor(analytic.diagnosticAccuracy)}>
                                    Accuracy: {analytic.diagnosticAccuracy}%
                                  </span>
                                  <span>Completion: {analytic.completionRate.toFixed(1)}%</span>
                                </div>
                                
                                {analytic.recommendedActions.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Recommended Actions:
                                    </p>
                                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                      {analytic.recommendedActions.slice(0, 3).map((action, index) => (
                                        <li key={index}>• {action.description}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingQuestion(question)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Optimize
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Analytics will appear here once assessment data is collected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Analytics Tab */}
        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  System performance analytics will be available once assessment data is collected
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Target className="h-5 w-5 text-orange-600" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Implementation Status */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Implementation Progress
                    </h4>
                  </div>
                  {statistics && (
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        Current: {statistics.currentQuestions} questions ({statistics.percentComplete}% of target)
                      </p>
                      <p>Target: {statistics.targetQuestions} questions for complete FM assessment</p>
                      <p>Modern FM categories: {statistics.modernFMQuestions} questions implemented</p>
                    </div>
                  )}
                </div>

                {/* Next Development Priorities */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Development Priorities
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-2 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            High Priority
                          </span>
                        </div>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• Complete digestive system questions (48 total)</li>
                          <li>• Finish energy/adrenal questions (42 total)</li>
                          <li>• Add modern FM categories (EMF, seed oils, mold)</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            Medium Priority
                          </span>
                        </div>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                          <li>• Optimize question weights based on usage</li>
                          <li>• Add client feedback collection system</li>
                          <li>• Implement A/B testing for question variants</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={true} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">
                Edit Question {editingQuestion.id}
              </DialogTitle>
              <DialogDescription>
                Modify question text, diagnostic weight, and testing notes for optimization
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Question Text
                </label>
                <Textarea
                  defaultValue={editingQuestion.questionText}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Diagnostic Weight
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="3.0"
                    defaultValue={editingQuestion.diagnosticWeight}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Status
                  </label>
                  <Select defaultValue={editingQuestion.isActive ? 'active' : 'inactive'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Testing Notes
                </label>
                <Textarea
                  placeholder="Notes about question performance, client feedback, or optimization needs..."
                  defaultValue={editingQuestion.testingNotes || ''}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
