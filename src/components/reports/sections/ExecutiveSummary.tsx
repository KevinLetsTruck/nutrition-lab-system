'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReportData, HighlightData } from '../PractitionerAnalysis'

interface ExecutiveSummaryProps {
  data: ReportData
  mode: 'full' | 'coaching'
  onHighlight: (text: string, color?: HighlightData['color']) => void
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data, mode, onHighlight }) => {
  const isCoachingMode = mode === 'coaching'
  
  // Extract key insights from the data
  const primaryConcerns = data.nutriqData.bodySystems
  const topSystems = Object.entries(primaryConcerns)
    .sort(([,a], [,b]) => b.score - a.score)
    .slice(0, 3)
    .map(([system, data]) => ({ system, ...data }))

  const criticalActionItems = [
    ...data.nutriqData.priorityActions.slice(0, 2),
    ...(data.analysis?.rootCauses.slice(0, 1) || [])
  ]

  const complianceStatus = data.protocols.find(p => p.status === 'active')
  const progressSinceLastSession = complianceStatus 
    ? `Protocol compliance: ${complianceStatus.compliance || 0}%`
    : 'No active protocol'

  return (
    <Card className={isCoachingMode ? 'text-lg' : ''}>
      <CardHeader>
        <CardTitle className={`text-white ${isCoachingMode ? 'text-2xl' : ''}`}>
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 ${isCoachingMode ? 'space-y-6' : ''}`}>
          
          {/* Primary Health Concerns */}
          <div>
            <h3 className={`font-semibold text-white mb-2 ${isCoachingMode ? 'text-xl' : ''}`}>
              Primary Health Concerns
            </h3>
            <div className="space-y-2">
              {topSystems.map(({ system, score, issues }) => (
                <div 
                  key={system}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => onHighlight(`${system} system score: ${score}/10`, 'yellow')}
                >
                  <div>
                    <span className={`font-medium text-white capitalize ${isCoachingMode ? 'text-lg' : ''}`}>
                      {system}
                    </span>
                    <Badge 
                      variant={score >= 7 ? 'orange' : score >= 5 ? 'default' : 'blue'}
                      className="ml-2"
                    >
                      {score}/10
                    </Badge>
                  </div>
                  {issues.length > 0 && (
                    <span className="text-gray-400 text-sm">
                      {issues[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Root Causes */}
          {data.analysis?.rootCauses && (
            <div>
              <h3 className={`font-semibold text-white mb-2 ${isCoachingMode ? 'text-xl' : ''}`}>
                Root Causes
              </h3>
              <div className="space-y-2">
                {data.analysis.rootCauses.slice(0, 3).map((cause, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-red-900/20 border-l-4 border-red-500 rounded-lg cursor-pointer hover:bg-red-900/30 transition-colors"
                    onClick={() => onHighlight(cause, 'red')}
                  >
                    <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                      {cause}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress & Compliance */}
          <div>
            <h3 className={`font-semibold text-white mb-2 ${isCoachingMode ? 'text-xl' : ''}`}>
              Progress & Compliance
            </h3>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                {progressSinceLastSession}
              </p>
              {complianceStatus && (
                <div className="mt-2">
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${complianceStatus.compliance || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Protocol: {complianceStatus.phase}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Action Items */}
          <div>
            <h3 className={`font-semibold text-white mb-2 ${isCoachingMode ? 'text-xl' : ''}`}>
              Critical Action Items
            </h3>
            <div className="space-y-2">
              {criticalActionItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/30 transition-colors"
                  onClick={() => onHighlight(item, 'blue')}
                >
                  <span className="text-blue-400 font-bold mr-3 text-lg">•</span>
                  <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Truck Driver Specific Notes */}
          {data.client.truckDriver && (
            <div>
              <h3 className={`font-semibold text-white mb-2 ${isCoachingMode ? 'text-xl' : ''}`}>
                Truck Driver Considerations
              </h3>
              <div className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-lg">
                <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                  • Schedule supplements around drive times
                </p>
                <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                  • Focus on non-refrigerated options
                </p>
                <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                  • Consider DOT compliance requirements
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ExecutiveSummary 