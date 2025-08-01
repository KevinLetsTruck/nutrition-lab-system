'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReportData, HighlightData, SupplementRecommendation } from '../PractitionerAnalysis'

interface InterventionProtocolProps {
  data: ReportData
  mode: 'full' | 'coaching'
  onHighlight: (text: string, color?: HighlightData['color']) => void
}

const InterventionProtocol: React.FC<InterventionProtocolProps> = ({ data, mode, onHighlight }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['immediate']))
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

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'letstruck': return 'bg-blue-600'
      case 'biotics': return 'bg-green-600'
      case 'fullscript': return 'bg-purple-600'
      default: return 'bg-gray-600'
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'letstruck': return 'Letstruck.com'
      case 'biotics': return 'Biotics Research'
      case 'fullscript': return 'Fullscript'
      default: return source
    }
  }

  const renderSupplement = (supplement: SupplementRecommendation, index: number) => (
    <div 
      key={index}
      className="p-4 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
      onClick={() => onHighlight(`${supplement.product} - ${supplement.dosage}`, 'blue')}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className={`font-medium text-white ${isCoachingMode ? 'text-lg' : ''}`}>
            {supplement.product}
          </h4>
          <p className="text-gray-300 text-sm">
            {supplement.dosage} • {supplement.timing} • {supplement.duration}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${getSourceColor(supplement.source)}`}>
            {getSourceLabel(supplement.source)}
          </Badge>
          {supplement.truckCompatible && (
            <Badge variant="warning" className="text-xs">
              🚛 Truck Ready
            </Badge>
          )}
        </div>
      </div>
      {supplement.notes && (
        <p className="text-gray-400 text-sm italic">
          {supplement.notes}
        </p>
      )}
    </div>
  )

  return (
    <Card className={isCoachingMode ? 'text-lg' : ''}>
      <CardHeader>
        <CardTitle className={`text-white ${isCoachingMode ? 'text-2xl' : ''} flex items-center gap-2`}>
          <span>💊</span>
          Intervention Protocol
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-6 ${isCoachingMode ? 'space-y-8' : ''}`}>
          
          {/* Immediate Actions */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('immediate')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                Immediate Actions (Week 1-2)
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="warning">Priority</Badge>
                <span className="text-gray-400">
                  {expandedSections.has('immediate') ? '−' : '+'}
                </span>
              </div>
            </div>
            
            {expandedSections.has('immediate') && (
              <div className="mt-4 space-y-4">
                {/* Supplements */}
                {data.analysis?.interventionProtocol.immediate.supplements && (
                  <div>
                    <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Priority Supplements
                    </h4>
                    <div className="space-y-3">
                      {data.analysis.interventionProtocol.immediate.supplements.map((supplement, index) => 
                        renderSupplement(supplement, index)
                      )}
                    </div>
                  </div>
                )}

                {/* Dietary Changes */}
                {data.analysis?.interventionProtocol.immediate.dietary && (
                  <div>
                    <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Dietary Modifications
                    </h4>
                    <div className="space-y-2">
                      {data.analysis.interventionProtocol.immediate.dietary.map((item, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-green-900/20 border-l-4 border-green-500 rounded-lg cursor-pointer hover:bg-green-900/30 transition-colors"
                          onClick={() => onHighlight(item, 'green')}
                        >
                          <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle Changes */}
                {data.analysis?.interventionProtocol.immediate.lifestyle && (
                  <div>
                    <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Lifestyle Modifications
                    </h4>
                    <div className="space-y-2">
                      {data.analysis.interventionProtocol.immediate.lifestyle.map((item, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-lg cursor-pointer hover:bg-blue-900/30 transition-colors"
                          onClick={() => onHighlight(item, 'blue')}
                        >
                          <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phased Protocol */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('phased')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                Phased Protocol (Weeks 2-8)
              </h3>
              <span className="text-gray-400">
                {expandedSections.has('phased') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('phased') && (
              <div className="mt-4 space-y-6">
                {/* Weeks 2-4 */}
                <div>
                  <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''} flex items-center gap-2`}>
                    <Badge variant="default">Weeks 2-4</Badge>
                    Foundation Building
                  </h4>
                  {data.analysis?.interventionProtocol.phased.week2_4 && (
                    <div className="space-y-3">
                      {data.analysis.interventionProtocol.phased.week2_4.map((supplement, index) => 
                        renderSupplement(supplement, index)
                      )}
                    </div>
                  )}
                </div>

                {/* Weeks 4-8 */}
                <div>
                  <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''} flex items-center gap-2`}>
                    <Badge variant="secondary">Weeks 4-8</Badge>
                    Advanced Support
                  </h4>
                  {data.analysis?.interventionProtocol.phased.week4_8 && (
                    <div className="space-y-3">
                      {data.analysis.interventionProtocol.phased.week4_8.map((supplement, index) => 
                        renderSupplement(supplement, index)
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Truck Driver Modifications */}
          {data.client.truckDriver && data.analysis?.interventionProtocol.truckDriverMods && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                onClick={() => toggleSection('truck')}
              >
                <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''} flex items-center gap-2`}>
                  <span>🚛</span>
                  Truck Driver Modifications
                </h3>
                <span className="text-gray-400">
                  {expandedSections.has('truck') ? '−' : '+'}
                </span>
              </div>
              
              {expandedSections.has('truck') && (
                <div className="mt-4 space-y-3">
                  {data.analysis.interventionProtocol.truckDriverMods.map((mod, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-lg cursor-pointer hover:bg-orange-900/30 transition-colors"
                      onClick={() => onHighlight(mod, 'yellow')}
                    >
                      <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                        {mod}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Expected Timeline */}
          {data.analysis?.expectedTimeline && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                onClick={() => toggleSection('timeline')}
              >
                <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                  Expected Timeline for Improvement
                </h3>
                <span className="text-gray-400">
                  {expandedSections.has('timeline') ? '−' : '+'}
                </span>
              </div>
              
              {expandedSections.has('timeline') && (
                <div className="mt-4">
                  <div className="p-4 bg-purple-900/20 border-l-4 border-purple-500 rounded-lg">
                    <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                      {data.analysis.expectedTimeline}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance Strategies */}
          {data.analysis?.complianceStrategies && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                onClick={() => toggleSection('compliance')}
              >
                <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                  Compliance Optimization Strategies
                </h3>
                <span className="text-gray-400">
                  {expandedSections.has('compliance') ? '−' : '+'}
                </span>
              </div>
              
              {expandedSections.has('compliance') && (
                <div className="mt-4 space-y-3">
                  {data.analysis.complianceStrategies.map((strategy, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-green-900/20 border-l-4 border-green-500 rounded-lg cursor-pointer hover:bg-green-900/30 transition-colors"
                      onClick={() => onHighlight(strategy, 'green')}
                    >
                      <p className={`text-white ${isCoachingMode ? 'text-lg' : ''}`}>
                        {strategy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Supplement Source Guide */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('sources')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                Supplement Source Guide
              </h3>
              <span className="text-gray-400">
                {expandedSections.has('sources') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('sources') && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                    <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Letstruck.com
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Specialized for truck drivers. Algae-based omega-3, non-refrigerated options, DOT-compliant supplements.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 border-l-4 border-green-500 rounded-lg">
                    <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Biotics Research
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Professional-grade supplements. High-quality formulations, practitioner-recommended, clinical-grade.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 border-l-4 border-purple-500 rounded-lg">
                    <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Fullscript
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Broader selection. Multiple brands, competitive pricing, comprehensive supplement library.
                    </p>
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

export default InterventionProtocol 