'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReportData, HighlightData } from '../PractitionerAnalysis'

interface ClinicalInsightsProps {
  data: ReportData
  mode: 'full' | 'coaching'
  onHighlight: (text: string, color?: HighlightData['color']) => void
}

const ClinicalInsights: React.FC<ClinicalInsightsProps> = ({ data, mode, onHighlight }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['functional']))
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

  const getInterventionLikelihood = () => {
    const totalScore = data.nutriqData.totalScore
    if (totalScore >= 45) return { level: 'High', color: 'destructive', percentage: '85-95%' }
    if (totalScore >= 30) return { level: 'Moderate', color: 'secondary', percentage: '60-80%' }
    return { level: 'Low', color: 'primary', percentage: '40-60%' }
  }

  const getRiskLevel = () => {
    const criticalSystems = Object.values(data.nutriqData.bodySystems)
      .filter(system => system.score >= 7).length
    
    if (criticalSystems >= 3) return { level: 'High Risk', color: 'destructive' }
    if (criticalSystems >= 2) return { level: 'Moderate Risk', color: 'secondary' }
    return { level: 'Low Risk', color: 'primary' }
  }

  const interventionLikelihood = getInterventionLikelihood()
  const riskLevel = getRiskLevel()

  return (
    <Card className={`${isCoachingMode ? 'text-lg' : ''} border-orange-500/50`}>
      <CardHeader>
        <CardTitle className={`text-white ${isCoachingMode ? 'text-2xl' : ''} flex items-center gap-2`}>
          <span>🧬</span>
          Clinical Insights (Practitioner Only)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`space-y-6 ${isCoachingMode ? 'space-y-8' : ''}`}>
          
          {/* Functional Medicine Correlations */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('functional')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                Functional Medicine Correlations
              </h3>
              <span className="text-gray-400">
                {expandedSections.has('functional') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('functional') && (
              <div className="mt-4 space-y-4">
                {/* HPA Axis Assessment */}
                <div className="p-4 bg-purple-900/20 border-l-4 border-purple-500 rounded-lg">
                  <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                    HPA Axis Assessment
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Stress Score:</span>
                      <Badge variant={data.nutriqData.bodySystems.stress.score >= 7 ? 'orange' : 'default'}>
                        {data.nutriqData.bodySystems.stress.score}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Sleep Score:</span>
                      <Badge variant={data.nutriqData.bodySystems.sleep.score >= 7 ? 'orange' : 'default'}>
                        {data.nutriqData.bodySystems.sleep.score}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Energy Score:</span>
                      <Badge variant={data.nutriqData.bodySystems.energy.score >= 7 ? 'orange' : 'default'}>
                        {data.nutriqData.bodySystems.energy.score}/10
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-3">
                    {data.nutriqData.bodySystems.stress.score >= 7 && data.nutriqData.bodySystems.sleep.score >= 7 
                      ? 'High likelihood of HPA axis dysregulation. Consider cortisol testing and adaptogenic support.'
                      : 'HPA axis appears relatively stable. Focus on foundational support.'
                    }
                  </p>
                </div>

                {/* Gut-Brain Axis */}
                <div className="p-4 bg-green-900/20 border-l-4 border-green-500 rounded-lg">
                  <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                    Gut-Brain Axis Assessment
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Digestion Score:</span>
                      <Badge variant={data.nutriqData.bodySystems.digestion.score >= 7 ? 'orange' : 'default'}>
                        {data.nutriqData.bodySystems.digestion.score}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Mood Score:</span>
                      <Badge variant={data.nutriqData.bodySystems.mood.score >= 7 ? 'orange' : 'default'}>
                        {data.nutriqData.bodySystems.mood.score}/10
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-3">
                    {data.nutriqData.bodySystems.digestion.score >= 7 && data.nutriqData.bodySystems.mood.score >= 7
                      ? 'Strong gut-brain connection indicated. Prioritize gut healing protocols.'
                      : 'Moderate gut-brain connection. Consider targeted gut support.'
                    }
                  </p>
                </div>

                {/* Immune-Inflammatory Axis */}
                <div className="p-4 bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                  <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                    Immune-Inflammatory Axis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Immunity Score:</span>
                      <Badge variant={data.nutriqData.bodySystems.immunity.score >= 7 ? 'orange' : 'default'}>
                        {data.nutriqData.bodySystems.immunity.score}/10
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-3">
                    {data.nutriqData.bodySystems.immunity.score >= 7
                      ? 'High inflammatory load detected. Consider anti-inflammatory protocols and immune support.'
                      : 'Moderate immune function. Focus on foundational immune support.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Truck Driver Risk Factors */}
          {data.client.truckDriver && (
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                onClick={() => toggleSection('truck')}
              >
                <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                  🚛 Truck Driver Risk Factors
                </h3>
                <span className="text-gray-400">
                  {expandedSections.has('truck') ? '−' : '+'}
                </span>
              </div>
              
              {expandedSections.has('truck') && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-900/20 border-l-4 border-orange-500 rounded-lg">
                      <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                        Lifestyle Risk Factors
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Irregular sleep patterns</li>
                        <li>• Limited access to healthy food</li>
                        <li>• Prolonged sitting</li>
                        <li>• High stress environment</li>
                        <li>• Limited exercise opportunities</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg">
                      <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                        Health Risk Factors
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• Increased cardiovascular risk</li>
                        <li>• Metabolic syndrome risk</li>
                        <li>• Vitamin D deficiency</li>
                        <li>• Digestive issues</li>
                        <li>• Mental health challenges</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                    <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Intervention Considerations
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Focus on non-refrigerated supplements</li>
                      <li>• Schedule protocols around drive times</li>
                      <li>• Emphasize meal prep strategies</li>
                      <li>• Consider DOT compliance requirements</li>
                      <li>• Prioritize stress management techniques</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Intervention Success Likelihood */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('intervention')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                Intervention Success Assessment
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={interventionLikelihood.color === 'destructive' ? 'orange' : interventionLikelihood.color === 'secondary' ? 'default' : 'blue'}>
                  {interventionLikelihood.level}
                </Badge>
                <span className="text-gray-400">
                  {expandedSections.has('intervention') ? '−' : '+'}
                </span>
              </div>
            </div>
            
            {expandedSections.has('intervention') && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Success Probability
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Intervention Success:</span>
                          <span className="text-white font-medium">{interventionLikelihood.percentage}</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              interventionLikelihood.color === 'destructive' ? 'bg-red-500' :
                              interventionLikelihood.color === 'secondary' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ 
                              width: interventionLikelihood.percentage === '85-95%' ? '90%' :
                                     interventionLikelihood.percentage === '60-80%' ? '70%' : '50%'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Risk Level:</span>
                          <Badge variant={riskLevel.color === 'destructive' ? 'orange' : riskLevel.color === 'secondary' ? 'default' : 'blue'} className="text-xs">
                            {riskLevel.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h4 className={`font-medium text-white mb-3 ${isCoachingMode ? 'text-lg' : ''}`}>
                      Key Factors
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Motivation Level:</span>
                        <Badge variant="blue">High</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Compliance History:</span>
                        <Badge variant="default">Moderate</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Support System:</span>
                        <Badge variant="blue">Good</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Financial Resources:</span>
                        <Badge variant="default">Adequate</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-900/20 border-l-4 border-green-500 rounded-lg">
                  <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                    Recommendations for Success
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Start with foundational protocols to build confidence</li>
                    <li>• Provide clear, simple instructions for truck stop compliance</li>
                    <li>• Schedule regular check-ins to maintain motivation</li>
                    <li>• Focus on immediate, noticeable improvements</li>
                    <li>• Consider group coaching for peer support</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Red Flags & Referrals */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              onClick={() => toggleSection('redflags')}
            >
              <h3 className={`font-semibold text-white ${isCoachingMode ? 'text-xl' : ''}`}>
                ⚠️ Red Flags & Referral Needs
              </h3>
              <span className="text-gray-400">
                {expandedSections.has('redflags') ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.has('redflags') && (
              <div className="mt-4 space-y-4">
                {data.nutriqData.totalScore >= 45 ? (
                  <div className="p-4 bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                    <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                      High Priority Referrals
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Consider referral to functional medicine physician</li>
                      <li>• Evaluate need for comprehensive lab testing</li>
                      <li>• Assess for underlying chronic conditions</li>
                      <li>• Consider mental health professional consultation</li>
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 bg-green-900/20 border-l-4 border-green-500 rounded-lg">
                    <h4 className={`font-medium text-white mb-2 ${isCoachingMode ? 'text-lg' : ''}`}>
                      No Immediate Red Flags
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Client appears suitable for nutrition coaching protocols. Monitor progress and adjust as needed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClinicalInsights 