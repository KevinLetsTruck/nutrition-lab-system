'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertCircle, 
  Clock, 
  FileText, 
  Heart, 
  Target, 
  TrendingUp,
  Truck,
  Moon,
  Apple,
  Activity
} from 'lucide-react'
import { CallNotesSummaryProps, CallPriority } from '@/types/calls'
import { format } from 'date-fns'

export function CallNotesSummary({ callRecording }: CallNotesSummaryProps) {
  const summary = callRecording.ai_summary

  if (!summary) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">No AI summary available for this call.</p>
        </CardContent>
      </Card>
    )
  }

  const getPriorityColor = (priority: CallPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 text-white'
      case 'high':
        return 'bg-orange-600 text-white'
      case 'normal':
        return 'bg-blue-600 text-white'
      case 'low':
        return 'bg-gray-600 text-white'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-gray-100">Call Summary</CardTitle>
            <CardDescription className="text-gray-400">
              {format(new Date(callRecording.call_date), 'PPP')} • {formatDuration(callRecording.duration_seconds)}
            </CardDescription>
          </div>
          <Badge className={getPriorityColor(summary.priority)}>
            {summary.priority.toUpperCase()} PRIORITY
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Summary */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-500" />
            Overview
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">{summary.callSummary}</p>
        </div>

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="health" className="data-[state=active]:bg-gray-700">
              Health Updates
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="data-[state=active]:bg-gray-700">
              Lifestyle
            </TabsTrigger>
            <TabsTrigger value="concerns" className="data-[state=active]:bg-gray-700">
              Concerns
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-gray-700">
              Action Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-4 space-y-4">
            {/* New Symptoms */}
            {summary.healthUpdates.newSymptoms.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  New Symptoms Reported
                </h5>
                <ul className="space-y-1">
                  {summary.healthUpdates.newSymptoms.map((symptom, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-5 relative">
                      <span className="absolute left-0">•</span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Symptom Changes */}
            {summary.healthUpdates.symptomChanges.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Symptom Changes
                </h5>
                <ul className="space-y-1">
                  {summary.healthUpdates.symptomChanges.map((change, index) => (
                    <li key={index} className="text-sm text-gray-300 pl-5 relative">
                      <span className="absolute left-0">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compliance */}
            {summary.healthUpdates.compliance && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Treatment Compliance
                </h5>
                <p className="text-sm text-gray-300">{summary.healthUpdates.compliance}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-4 space-y-4">
            {/* Driving */}
            {summary.lifestyleFactors.driving && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-500" />
                  Driving & Work Schedule
                </h5>
                <p className="text-sm text-gray-300">{summary.lifestyleFactors.driving}</p>
              </div>
            )}

            {/* Sleep */}
            {summary.lifestyleFactors.sleep && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-purple-500" />
                  Sleep Patterns
                </h5>
                <p className="text-sm text-gray-300">{summary.lifestyleFactors.sleep}</p>
              </div>
            )}

            {/* Diet */}
            {summary.lifestyleFactors.diet && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Apple className="h-4 w-4 text-green-500" />
                  Diet & Nutrition
                </h5>
                <p className="text-sm text-gray-300">{summary.lifestyleFactors.diet}</p>
              </div>
            )}

            {/* Exercise */}
            {summary.lifestyleFactors.exercise && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  Physical Activity
                </h5>
                <p className="text-sm text-gray-300">{summary.lifestyleFactors.exercise}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="concerns" className="mt-4">
            {summary.concerns.length > 0 ? (
              <ul className="space-y-2">
                {summary.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span className="text-sm text-gray-300">{concern}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No specific concerns noted during this call.</p>
            )}
          </TabsContent>

          <TabsContent value="actions" className="mt-4 space-y-4">
            {/* Action Items */}
            {summary.actionItems.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  Action Items
                </h5>
                <ul className="space-y-2">
                  {summary.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border border-gray-600 mt-0.5" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {summary.nextSteps && (
              <div>
                <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Next Steps
                </h5>
                <p className="text-sm text-gray-300">{summary.nextSteps}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}