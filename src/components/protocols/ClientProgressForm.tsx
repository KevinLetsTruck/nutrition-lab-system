'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { TrendingUp, Heart, Moon, Utensils, Target, Loader2, CheckCircle } from 'lucide-react';

interface ClientProgressFormProps {
  protocolId: string;
  protocolName: string;
  currentWeek: number;
  onProgressSubmitted?: () => void;
}

export function ClientProgressForm({
  protocolId,
  protocolName,
  currentWeek,
  onProgressSubmitted,
}: ClientProgressFormProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Progress metrics (1-5 scale)
  const [energyLevel, setEnergyLevel] = useState([3]);
  const [sleepQuality, setSleepQuality] = useState([3]);
  const [digestionHealth, setDigestionHealth] = useState([3]);
  const [overallWellbeing, setOverallWellbeing] = useState([3]);
  
  // Compliance metrics (1-5 scale)
  const [supplementCompliance, setSupplementCompliance] = useState([3]);
  const [dietaryCompliance, setDietaryCompliance] = useState([3]);
  const [lifestyleCompliance, setLifestyleCompliance] = useState([3]);
  
  // Text feedback
  const [symptomsNotes, setSymptomsNotes] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [positiveChanges, setPositiveChanges] = useState('');
  const [questionsConcerns, setQuestionsConcerns] = useState('');

  const handleSubmit = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/protocols/${protocolId}/progress`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          energyLevel: energyLevel[0],
          sleepQuality: sleepQuality[0],
          digestionHealth: digestionHealth[0],
          overallWellbeing: overallWellbeing[0],
          supplementCompliance: supplementCompliance[0],
          dietaryCompliance: dietaryCompliance[0],
          lifestyleCompliance: lifestyleCompliance[0],
          symptomsNotes: symptomsNotes.trim() || undefined,
          challengesFaced: challengesFaced.trim() || undefined,
          positiveChanges: positiveChanges.trim() || undefined,
          questionsConcerns: questionsConcerns.trim() || undefined,
          weekNumber: currentWeek,
          submittedBy: 'client',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit progress');
      }

      setSubmitted(true);
      toast.success('Progress submitted successfully!', {
        description: `Week ${currentWeek} progress has been recorded and sent to your practitioner.`
      });

      onProgressSubmitted?.();

    } catch (error) {
      console.error('Progress submission error:', error);
      toast.error('Failed to submit progress', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score: number): string => {
    switch (score) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Good';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score <= 2) return 'text-red-600';
    if (score === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Progress Submitted Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your Week {currentWeek} progress has been recorded and sent to your practitioner.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another Update
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Target className="h-5 w-5 text-blue-600" />
            Week {currentWeek} Progress Check-in
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {protocolName} - How are you feeling this week?
          </p>
        </CardHeader>
      </Card>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Health & Wellbeing Metrics
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rate each area from 1 (Poor) to 5 (Excellent)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Energy Level
                </label>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(energyLevel[0])}`}>
                {getScoreLabel(energyLevel[0])} ({energyLevel[0]}/5)
              </span>
            </div>
            <Slider
              value={energyLevel}
              onValueChange={setEnergyLevel}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Sleep Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-600" />
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Sleep Quality
                </label>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(sleepQuality[0])}`}>
                {getScoreLabel(sleepQuality[0])} ({sleepQuality[0]}/5)
              </span>
            </div>
            <Slider
              value={sleepQuality}
              onValueChange={setSleepQuality}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Digestion Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-green-600" />
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Digestion Health
                </label>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(digestionHealth[0])}`}>
                {getScoreLabel(digestionHealth[0])} ({digestionHealth[0]}/5)
              </span>
            </div>
            <Slider
              value={digestionHealth}
              onValueChange={setDigestionHealth}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Overall Wellbeing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Overall Wellbeing
                </label>
              </div>
              <span className={`text-sm font-medium ${getScoreColor(overallWellbeing[0])}`}>
                {getScoreLabel(overallWellbeing[0])} ({overallWellbeing[0]}/5)
              </span>
            </div>
            <Slider
              value={overallWellbeing}
              onValueChange={setOverallWellbeing}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Protocol Compliance
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How well are you following your protocol recommendations?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supplement Compliance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Supplement Compliance
              </label>
              <span className={`text-sm font-medium ${getScoreColor(supplementCompliance[0])}`}>
                {getScoreLabel(supplementCompliance[0])} ({supplementCompliance[0]}/5)
              </span>
            </div>
            <Slider
              value={supplementCompliance}
              onValueChange={setSupplementCompliance}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How consistently did you take your supplements this week?
            </p>
          </div>

          {/* Dietary Compliance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Dietary Guidelines
              </label>
              <span className={`text-sm font-medium ${getScoreColor(dietaryCompliance[0])}`}>
                {getScoreLabel(dietaryCompliance[0])} ({dietaryCompliance[0]}/5)
              </span>
            </div>
            <Slider
              value={dietaryCompliance}
              onValueChange={setDietaryCompliance}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How well did you follow the dietary recommendations?
            </p>
          </div>

          {/* Lifestyle Compliance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Lifestyle Modifications
              </label>
              <span className={`text-sm font-medium ${getScoreColor(lifestyleCompliance[0])}`}>
                {getScoreLabel(lifestyleCompliance[0])} ({lifestyleCompliance[0]}/5)
              </span>
            </div>
            <Slider
              value={lifestyleCompliance}
              onValueChange={setLifestyleCompliance}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How consistently did you implement lifestyle changes?
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
            Weekly Feedback
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your experience and observations from this week
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Positive Changes You've Noticed
            </label>
            <Textarea
              value={positiveChanges}
              onChange={(e) => setPositiveChanges(e.target.value)}
              placeholder="What improvements have you experienced this week? (energy, mood, digestion, sleep, etc.)"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Challenges or Difficulties
            </label>
            <Textarea
              value={challengesFaced}
              onChange={(e) => setChallengesFaced(e.target.value)}
              placeholder="What challenges did you face following the protocol? (side effects, compliance issues, etc.)"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Symptoms or Concerns
            </label>
            <Textarea
              value={symptomsNotes}
              onChange={(e) => setSymptomsNotes(e.target.value)}
              placeholder="Any new symptoms, side effects, or health concerns this week?"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Questions for Your Practitioner
            </label>
            <Textarea
              value={questionsConcerns}
              onChange={(e) => setQuestionsConcerns(e.target.value)}
              placeholder="Any questions or concerns you'd like to discuss in your next session?"
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-900 dark:text-gray-100">
            Quick Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-lg font-bold ${getScoreColor(energyLevel[0])}`}>
                {energyLevel[0]}/5
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Energy</p>
            </div>
            <div>
              <div className={`text-lg font-bold ${getScoreColor(sleepQuality[0])}`}>
                {sleepQuality[0]}/5
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sleep</p>
            </div>
            <div>
              <div className={`text-lg font-bold ${getScoreColor(digestionHealth[0])}`}>
                {digestionHealth[0]}/5
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Digestion</p>
            </div>
            <div>
              <div className={`text-lg font-bold ${getScoreColor(overallWellbeing[0])}`}>
                {overallWellbeing[0]}/5
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Wellbeing</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Compliance Average
            </h4>
            <div className="flex justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(Math.round((supplementCompliance[0] + dietaryCompliance[0] + lifestyleCompliance[0]) / 3))}`}>
                  {Math.round((supplementCompliance[0] + dietaryCompliance[0] + lifestyleCompliance[0]) / 3)}/5
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Overall Compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-4 pb-8">
        <Button
          onClick={handleSubmit}
          disabled={loading || !token}
          className="w-full max-w-md"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Progress...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Submit Week {currentWeek} Progress
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
