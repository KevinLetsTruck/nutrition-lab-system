'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AssessmentQuestion, 
  QuestionType,
  ClientResponse,
  FunctionalModule 
} from '@/lib/assessment/types';
import { AlertCircle, TrendingUp, Brain, Heart, Shield, Zap, Recycle, GitBranch } from 'lucide-react';

interface AssessmentFlowProps {
  assessmentId: string;
}

const MODULE_ICONS = {
  SCREENING: AlertCircle,
  ASSIMILATION: TrendingUp,
  DEFENSE_REPAIR: Shield,
  ENERGY: Zap,
  BIOTRANSFORMATION: Recycle,
  TRANSPORT: Heart,
  COMMUNICATION: Brain,
  STRUCTURAL: GitBranch,
};

const MODULE_COLORS = {
  SCREENING: 'bg-blue-500',
  ASSIMILATION: 'bg-green-500',
  DEFENSE_REPAIR: 'bg-purple-500',
  ENERGY: 'bg-yellow-500',
  BIOTRANSFORMATION: 'bg-orange-500',
  TRANSPORT: 'bg-red-500',
  COMMUNICATION: 'bg-indigo-500',
  STRUCTURAL: 'bg-gray-500',
};

export default function AssessmentFlow({ assessmentId }: AssessmentFlowProps) {
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [currentModule, setCurrentModule] = useState<FunctionalModule>(FunctionalModule.SCREENING);
  const [response, setResponse] = useState<any>(null);
  const [progress, setProgress] = useState({
    questionsAsked: 0,
    questionsSaved: 0,
    estimatedRemaining: 250,
    moduleScores: [] as any[],
    patterns: [] as any[],
    seedOilMetrics: {
      exposureLevel: 0,
      damageIndicators: 0,
      recoveryPotential: 10
    }
  });

  // Fetch next question
  const fetchNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/next-question`);
      const data = await res.json();
      
      if (data.success && data.data) {
        if (data.data.completed || data.data.earlyTermination) {
          // Assessment complete
          window.location.href = `/assessment/${assessmentId}/results`;
        } else {
          setCurrentQuestion(data.data.question);
          setCurrentModule(data.data.module || currentModule);
          setProgress(data.data.progress || progress);
          setResponse(null); // Reset response for new question
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit response
  const submitResponse = async () => {
    if (!currentQuestion || response === null) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          responseValue: response,
          responseType: currentQuestion.type
        })
      });
      
      const data = await res.json();
      if (data.success) {
        fetchNextQuestion();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNextQuestion();
  }, [assessmentId]);

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case QuestionType.LIKERT_SCALE:
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentQuestion.scaleMin || 'Strongly Disagree'}</span>
              <span>{currentQuestion.scaleMax || 'Strongly Agree'}</span>
            </div>
            <Slider
              value={[response || 5]}
              onValueChange={(value) => setResponse(value[0])}
              min={currentQuestion.scale?.min || 0}
              max={currentQuestion.scale?.max || 10}
              step={1}
              className="w-full"
            />
            <div className="text-center text-2xl font-bold">
              {response || 5}
            </div>
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={String(option.value)} id={String(option.value)} />
                <Label htmlFor={String(option.value)} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case QuestionType.YES_NO:
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        );

      case QuestionType.TEXT:
        return (
          <Textarea
            value={response || ''}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={currentQuestion.placeholder}
            maxLength={currentQuestion.maxLength}
            className="min-h-[100px]"
          />
        );

      case QuestionType.NUMBER:
        return (
          <Input
            type="number"
            value={response || ''}
            onChange={(e) => setResponse(e.target.value)}
            min={currentQuestion.validationRules?.find(r => r.type === 'min')?.value}
            max={currentQuestion.validationRules?.find(r => r.type === 'max')?.value}
            className="w-32"
          />
        );

      case QuestionType.MULTI_SELECT:
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={String(option.value)}
                  checked={(response || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const current = response || [];
                    if (checked) {
                      setResponse([...current, option.value]);
                    } else {
                      setResponse(current.filter((v: any) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={String(option.value)} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case QuestionType.FREQUENCY:
        return (
          <RadioGroup value={response} onValueChange={setResponse}>
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value={String(option.value)} id={String(option.value)} />
                <Label htmlFor={String(option.value)} className="cursor-pointer">
                  {option.label}
                  {option.description && (
                    <span className="text-sm text-gray-500 ml-2">({option.description})</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  // Calculate overall progress percentage
  const progressPercentage = Math.min(
    (progress.questionsAsked / 225) * 100, // Target 225 questions average
    100
  );

  const ModuleIcon = MODULE_ICONS[currentModule];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Question {progress.questionsAsked + 1}</p>
              <p className="text-xs text-gray-500">
                Estimated {Math.ceil(progress.estimatedRemaining * 0.25)} minutes remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-600">
                {progress.questionsSaved} questions saved
              </p>
              <p className="text-xs text-gray-500">through AI optimization</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          
          {/* Module Progress Indicators */}
          <div className="flex justify-between mt-4">
            {Object.values(FunctionalModule).map((module) => {
              const Icon = MODULE_ICONS[module];
              const isActive = module === currentModule;
              const moduleScore = progress.moduleScores.find(m => m.module === module);
              const isCompleted = moduleScore?.completionStatus === 'complete' || 
                                moduleScore?.completionStatus === 'sufficient';
              
              return (
                <div
                  key={module}
                  className={`flex flex-col items-center ${
                    isActive ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isCompleted ? 'bg-green-100' : 
                      isActive ? MODULE_COLORS[module] + ' text-white' : 
                      'bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs mt-1">
                    {module.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Detection Alert */}
      {progress.patterns.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Pattern Detected: {progress.patterns[0].name}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  AI is focusing questions to explore this pattern more deeply.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {currentQuestion?.text}
            </CardTitle>
            {ModuleIcon && (
              <div className={`p-2 rounded-full ${MODULE_COLORS[currentModule]} text-white`}>
                <ModuleIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          {currentQuestion?.helpText && (
            <p className="text-sm text-gray-600 mt-2">{currentQuestion.helpText}</p>
          )}
        </CardHeader>
        <CardContent>
          {renderQuestion()}
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/assessment/${assessmentId}/pause`}
              disabled={loading}
            >
              Save & Exit
            </Button>
            <Button
              onClick={submitResponse}
              disabled={loading || response === null}
            >
              {loading ? 'Processing...' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seed Oil Metrics (if relevant) */}
      {progress.seedOilMetrics.exposureLevel > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Seed Oil Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Exposure</p>
                <p className="font-semibold">{progress.seedOilMetrics.exposureLevel}/10</p>
              </div>
              <div>
                <p className="text-gray-600">Damage</p>
                <p className="font-semibold">{progress.seedOilMetrics.damageIndicators}/10</p>
              </div>
              <div>
                <p className="text-gray-600">Recovery Potential</p>
                <p className="font-semibold">{progress.seedOilMetrics.recoveryPotential}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}