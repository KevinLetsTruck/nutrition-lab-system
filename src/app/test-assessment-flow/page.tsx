'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function TestAssessmentPage() {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);

  // Test client ID (you can change this to test with different clients)
  const TEST_CLIENT_ID = 'cmei0b0110000v2uyevy1jwpv';

  const startAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: TEST_CLIENT_ID })
      });

      const data = await response.json();
      if (data.success && data.data) {
        setAssessmentId(data.data.assessmentId);
        setCurrentQuestion(data.data.firstQuestion);
        await fetchProgress(data.data.assessmentId);
      } else {
        setError(data.error || 'Failed to start assessment');
      }
    } catch (err) {
      setError('Failed to start assessment: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (id: string) => {
    try {
      const response = await fetch(`/api/assessment/${id}/progress`);
      const data = await response.json();
      if (data.progress) {
        setProgress(data.progress);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const submitAnswer = async () => {
    if (!assessmentId || !currentQuestion || selectedAnswer === null) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: selectedAnswer
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.complete) {
          setComplete(true);
          setCurrentQuestion(null);
        } else if (data.data?.nextQuestion) {
          setCurrentQuestion(data.data.nextQuestion);
          setProgress(data.data.progress);
          setSelectedAnswer(null);
        }
      } else {
        setError(data.error || 'Failed to submit answer');
      }
    } catch (err) {
      setError('Failed to submit answer: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'LIKERT_SCALE':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Never/None (0)</span>
              <span>Always/Severe (10)</span>
            </div>
            <Slider
              value={[selectedAnswer || 5]}
              onValueChange={(value) => setSelectedAnswer(value[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="text-center text-lg font-semibold">
              Selected: {selectedAnswer ?? 5}
            </div>
          </div>
        );

      case 'YES_NO':
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        );

      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            {currentQuestion.options?.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option.label || option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'FREQUENCY':
        const frequencies = ['never', 'rarely', 'sometimes', 'often', 'always'];
        return (
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            {frequencies.map((freq) => (
              <div key={freq} className="flex items-center space-x-2">
                <RadioGroupItem value={freq} id={freq} />
                <Label htmlFor={freq} className="capitalize">{freq}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'TEXT':
        return (
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
        );

      default:
        return (
          <div className="text-gray-500">
            Question type '{currentQuestion.type}' not yet implemented
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Test Page</CardTitle>
          <p className="text-sm text-gray-600">Testing assessment flow with client ID: {TEST_CLIENT_ID}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!assessmentId && !complete && (
            <div className="text-center">
              <Button onClick={startAssessment} disabled={loading}>
                {loading ? 'Starting...' : 'Start Assessment'}
              </Button>
            </div>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {progress.questionsAnswered} questions answered</span>
                <span>{progress.percentComplete}% complete</span>
              </div>
              <Progress value={progress.percentComplete} />
              <div className="text-sm text-gray-600">
                Current Module: {progress.currentModule} ({progress.moduleProgress})
              </div>
            </div>
          )}

          {currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-600">
                      Module: {currentQuestion.module}
                    </div>
                    {currentQuestion.isSeedOilQuestion && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
                        Seed Oil Assessment
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {currentQuestion.id}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{currentQuestion.text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderQuestionInput()}
                <Button 
                  onClick={submitAnswer} 
                  disabled={loading || selectedAnswer === null}
                  className="w-full"
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </CardContent>
            </Card>
          )}

          {complete && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">
                Assessment Complete! 🎉
              </div>
              <p>The assessment has been completed successfully.</p>
              <Button onClick={() => window.location.reload()}>
                Start New Assessment
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          )}

          {assessmentId && (
            <div className="text-xs text-gray-500 text-center">
              Assessment ID: {assessmentId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
