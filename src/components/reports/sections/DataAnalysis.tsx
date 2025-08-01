'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReportData, HighlightData } from '../PractitionerAnalysis'

interface DataAnalysisProps {
  data: ReportData
  mode: 'full' | 'coaching'
  onHighlight: (text: string, color?: HighlightData['color']) => void
}

const DataAnalysis: React.FC<DataAnalysisProps> = ({ data, mode, onHighlight }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['nutriq']))
  const isCoachingMode = mode === 'coaching'

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getSystemSeverity = (score: number) => {
    if (score >= 8) return { color: 'destructive', label: 'Critical' }
    if (score >= 6) return { color: 'secondary', label: 'Moderate' }
    return { color: 'primary', label: 'Mild' }
  }

  return (
    <Card className={isCoachingMode ? 'text-lg' : ''}>
      <CardHeader>
        <CardTitle className={`text-white ${isCoachingMode ? 'text-2xl' : ''}`}>
          Comprehensive Data Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-6 ${isCoachingMode ? 'space-y-8' : ''}`}>
          
          {/* NutriQ Summary */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('nutriq')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                NutriQ Assessment Summary
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Total Score: {data.nutriqData.totalScore}/60
                </Badge>
                <span className="text-gray-400">
                  {expandedSections.has('nutriq') ? '−' : '+'}
                </span>
              </div>
            </div>
            
            {expandedSections.has('nutriq') && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data.nutriqData.bodySystems).map(([system, systemData]) => {
                    const severity = getSystemSeverity(systemData.score)
                    return (
                      <div 
                        key={system}
                        className="p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                        onClick={() => onHighlight(`${system} system: ${systemData.score}/10 - ${severity.label}`, 'yellow')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium text-white capitalize ${isCoachingMode ? 'text-lg' : ''}`}>
                            {system}
                          </span>
                          <Badge 
                            variant={systemData.score >= 7 ? 'warning' : systemData.score >= 5 ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {systemData.score}/10
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {systemData.issues.slice(0, 2).map((issue, index) => (
                            <p key={index} className="text-gray-300 text-sm">
                              • {issue}
                            </p>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                  <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                    Key Recommendations
                  </h4>
                  <div className="space-y-1">
                    {data.nutriqData.overallRecommendations.slice(0, 3).map((rec, index) => (
                      <p key={index} className="text-gray-300 text-sm">
                        • {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lab Findings */}
          {data.labData.length > 0 && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                onClick={() => toggleSection('labs')}
              >
                <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                  Lab Findings
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {data.labData.length} Reports
                  </Badge>
                  <span className="text-gray-400">
                    {expandedSections.has('labs') ? '−' : '+'}
                  </span>
                </div>
              </div>
              
              {expandedSections.has('labs') && (
                <div className="mt-4 space-y-4">
                  {data.labData.map((lab) => (
                    <div key={lab.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-medium text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                          {lab.reportType.toUpperCase()} - {new Date(lab.reportDate).toLocaleDateString()}
                        </h4>
                        <Badge variant={lab.status === 'completed' ? 'secondary' : 'default'}>
                          {lab.status}
                        </Badge>
                      </div>
                      
                      {lab.results && (
                        <div className="space-y-2">
                          {Object.entries(lab.results).slice(0, 5).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-white font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {lab.notes && (
                        <p className="text-gray-400 text-sm mt-3 italic">
                          {lab.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pattern Recognition */}
          {data.analysis?.systemInterconnections && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                onClick={() => toggleSection('patterns')}
              >
                <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                  Pattern Recognition & System Interconnections
                </h3>
                <span className="text-gray-400">
                  {expandedSections.has('patterns') ? '−' : '+'}
                </span>
              </div>
              
              {expandedSections.has('patterns') && (
                <div className="mt-4 space-y-3">
                  {data.analysis.systemInterconnections.map((pattern, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-green-900/20 border-l-4 border-green-500 rounded-lg cursor-pointer hover:bg-green-900/30 transition-colors"
                      onClick={() => onHighlight(pattern, 'green')}
                    >
                      <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                        {pattern}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress Tracking */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('progress')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                Progress Tracking
              </h3>
              <span className="text-gray-400">
                {expandedSections.has('progress') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('progress') && (
              <div className="mt-4 space-y-4">
                {/* Protocol History */}
                <div>
                  <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                    Protocol History
                  </h4>
                  <div className="space-y-3">
                    {data.protocols.map((protocol) => (
                      <div key={protocol.id} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                            {protocol.phase}
                          </span>
                          <Badge variant={protocol.status === 'active' ? 'secondary' : 'default'}>
                            {protocol.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            Started: {new Date(protocol.startDate).toLocaleDateString()}
                          </span>
                          {protocol.compliance !== undefined && (
                            <span className="text-green-400">
                              Compliance: {protocol.compliance}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Notes Summary */}
                <div>
                  <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                    Recent Notes Summary
                  </h4>
                  <div className="space-y-2">
                    {data.notes.slice(0, 3).map((note) => (
                      <div 
                        key={note.id}
                        className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                        onClick={() => onHighlight(note.content.substring(0, 100), 'blue')}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="default" className="text-xs">
                            {note.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            {new Date(note.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {note.content.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DataAnalysis 