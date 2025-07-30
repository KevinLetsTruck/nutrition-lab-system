import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Brain,
  Zap,
  Shield,
  Coffee,
  Truck,
  Target,
  FileText,
  Printer
} from 'lucide-react'

interface SystemScore {
  system: string
  score: number
  severity: SeverityLevel
  issues: string[]
  recommendations: string[]
}

interface NutriQAnalysisData {
  type: 'nutriq'
  executiveSummary: {
    totalScore: number
    overallSeverity: SeverityLevel
    criticalSystems: number
    moderateSystems: number
    primaryConcerns: string[]
    keyFindings: string[]
  }
  systemScores: SystemScore[]
  recommendations: string[]
  priorityActions: string[]
  followUpTests: string[]
}

interface KBMAAnalysisData {
  type: 'kbmo'
  executiveSummary: {
    totalIggScore: number
    overallSeverity: SeverityLevel
    highSensitivityCount: number
    moderateSensitivityCount: number
    keyFindings: string[]
  }
  sensitivities: {
    high: Array<{ food: string; iggLevel: number; sensitivity: string; eliminationPeriod: string; reintroductionNotes: string }>
    moderate: Array<{ food: string; iggLevel: number; sensitivity: string; eliminationPeriod: string; reintroductionNotes: string }>
    low: Array<{ food: string; iggLevel: number; sensitivity: string; eliminationPeriod: string; reintroductionNotes: string }>
  }
  recommendations: string[]
  reintroductionSchedule: string[]
}

interface DutchAnalysisData {
  type: 'dutch'
  executiveSummary: {
    cortisolPattern: string
    overallSeverity: SeverityLevel
    keyFindings: string[]
  }
  cortisolData: any
  sexHormoneData: any
  organicAcids: any[]
  recommendations: string[]
}

interface GenericAnalysisData {
  type: 'generic'
  executiveSummary: {
    overallSeverity: SeverityLevel
    keyFindings: string[]
  }
  rawData: any
}

type AnalysisData = NutriQAnalysisData | KBMAAnalysisData | DutchAnalysisData | GenericAnalysisData

interface ProfessionalReportProps {
  analysisResults: any
  reportType: string
  clientName?: string
  reportDate?: string
  className?: string
}

interface SeverityLevel {
  level: 'low' | 'moderate' | 'high' | 'critical'
  color: string
  bgColor: string
  icon: React.ReactNode
}

const severityLevels: Record<string, SeverityLevel> = {
  low: {
    level: 'low',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: <CheckCircle className="h-4 w-4" />
  },
  moderate: {
    level: 'moderate',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: <Clock className="h-4 w-4" />
  },
  high: {
    level: 'high',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  critical: {
    level: 'critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: <AlertTriangle className="h-4 w-4" />
  }
}

const getSeverityLevel = (score: number): SeverityLevel => {
  if (score >= 80) return severityLevels.low
  if (score >= 60) return severityLevels.moderate
  if (score >= 40) return severityLevels.high
  return severityLevels.critical
}

const getBodySystemIcon = (system: string) => {
  switch (system.toLowerCase()) {
    case 'energy': return <Zap className="h-5 w-5" />
    case 'mood': return <Brain className="h-5 w-5" />
    case 'sleep': return <Coffee className="h-5 w-5" />
    case 'stress': return <Activity className="h-5 w-5" />
    case 'digestion': return <Heart className="h-5 w-5" />
    case 'immunity': return <Shield className="h-5 w-5" />
    default: return <Activity className="h-5 w-5" />
  }
}

const CollapsibleSection: React.FC<{
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="bg-dark-800/50 border-dark-700">
      <div 
        className="cursor-pointer hover:bg-dark-700/50 transition-colors p-6 border-b border-dark-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <CardTitle className="text-lg text-white">{title}</CardTitle>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-dark-300" />
          ) : (
            <ChevronRight className="h-5 w-5 text-dark-300" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="p-6 pt-0">
          {children}
        </div>
      )}
    </Card>
  )
}

export function ProfessionalReport({ 
  analysisResults, 
  reportType, 
  clientName, 
  reportDate,
  className 
}: ProfessionalReportProps) {
  const [printMode, setPrintMode] = useState(false)

  const handlePrint = () => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, 100)
  }

  // Parse analysis results based on report type
  const parseAnalysis = (): AnalysisData | null => {
    if (!analysisResults) return null

    switch (reportType.toLowerCase()) {
      case 'nutriq':
        return parseNutriQAnalysis(analysisResults)
      case 'kbmo':
        return parseKBMAAnalysis(analysisResults)
      case 'dutch':
        return parseDutchAnalysis(analysisResults)
      default:
        return parseGenericAnalysis(analysisResults)
    }
  }

  const parseNutriQAnalysis = (results: any): NutriQAnalysisData => {
    const nutriqData = results.nutriqAnalysis || results
    const totalScore = nutriqData.totalScore || 0
    const bodySystems = nutriqData.bodySystems || {}
    
    // Calculate severity scores and priorities
    const systemScores = Object.entries(bodySystems).map(([system, data]: [string, any]) => ({
      system,
      score: data.score || 0,
      severity: getSeverityLevel(data.score || 0),
      issues: data.issues || [],
      recommendations: data.recommendations || []
    }))

    // Sort by severity (lowest scores first)
    systemScores.sort((a, b) => a.score - b.score)

    // Calculate overall severity
    const averageScore = systemScores.reduce((sum, s) => sum + s.score, 0) / systemScores.length
    const overallSeverity = getSeverityLevel(averageScore)

    // Generate executive summary
    const criticalSystems = systemScores.filter(s => s.score < 40)
    const moderateSystems = systemScores.filter(s => s.score >= 40 && s.score < 60)
    
    const executiveSummary = {
      totalScore,
      overallSeverity,
      criticalSystems: criticalSystems.length,
      moderateSystems: moderateSystems.length,
      primaryConcerns: criticalSystems.slice(0, 3).map(s => s.system),
      keyFindings: [
        `Overall health score: ${totalScore}/100`,
        `${criticalSystems.length} body systems require immediate attention`,
        `${moderateSystems.length} body systems need monitoring`,
        `Primary focus areas: ${criticalSystems.slice(0, 3).map(s => s.system).join(', ')}`
      ]
    }

    return {
      type: 'nutriq',
      executiveSummary,
      systemScores,
      recommendations: nutriqData.overallRecommendations || [],
      priorityActions: nutriqData.priorityActions || [],
      followUpTests: nutriqData.followUpTests || []
    }
  }

  const parseKBMAAnalysis = (results: any): KBMAAnalysisData => {
    const kbmoData = results.kbmoAnalysis || results
    const totalIggScore = kbmoData.totalIggScore || 0
    const highSensitivity = kbmoData.highSensitivityFoods || []
    const moderateSensitivity = kbmoData.moderateSensitivityFoods || []
    
    const severity = totalIggScore > 100 ? 'critical' : 
                    totalIggScore > 50 ? 'high' : 
                    totalIggScore > 25 ? 'moderate' : 'low'

    return {
      type: 'kbmo',
      executiveSummary: {
        totalIggScore,
        overallSeverity: severityLevels[severity],
        highSensitivityCount: highSensitivity.length,
        moderateSensitivityCount: moderateSensitivity.length,
        keyFindings: [
          `Total IgG score: ${totalIggScore}`,
          `${highSensitivity.length} high sensitivity foods identified`,
          `${moderateSensitivity.length} moderate sensitivity foods identified`,
          `Elimination diet recommended for ${highSensitivity.length + moderateSensitivity.length} foods`
        ]
      },
      sensitivities: {
        high: highSensitivity,
        moderate: moderateSensitivity,
        low: kbmoData.lowSensitivityFoods || []
      },
      recommendations: kbmoData.eliminationDietPlan || [],
      reintroductionSchedule: kbmoData.reintroductionSchedule || []
    }
  }

  const parseDutchAnalysis = (results: any): DutchAnalysisData => {
    const dutchData = results.dutchAnalysis || results
    const cortisolPattern = dutchData.cortisolPattern || {}
    const sexHormones = dutchData.sexHormones || {}
    
    return {
      type: 'dutch',
      executiveSummary: {
        cortisolPattern: cortisolPattern.pattern || 'normal',
        overallSeverity: severityLevels.moderate, // Default for hormone tests
        keyFindings: [
          `Cortisol pattern: ${cortisolPattern.pattern || 'normal'}`,
          `Sex hormone analysis completed`,
          `${dutchData.organicAcids?.length || 0} organic acids analyzed`
        ]
      },
      cortisolData: cortisolPattern,
      sexHormoneData: sexHormones,
      organicAcids: dutchData.organicAcids || [],
      recommendations: dutchData.recommendations || []
    }
  }

  const parseGenericAnalysis = (results: any): GenericAnalysisData => {
    return {
      type: 'generic',
      executiveSummary: {
        overallSeverity: severityLevels.moderate,
        keyFindings: ['Analysis completed', 'Review detailed results below']
      },
      rawData: results
    }
  }

  const analysis = parseAnalysis()
  if (!analysis) {
    return (
      <Card className="bg-dark-800/50 border-dark-700">
        <CardContent className="p-6">
          <p className="text-dark-300">No analysis data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${printMode ? 'print-mode' : ''} ${className}`}>
      {/* Print Button */}
      {!printMode && (
        <div className="flex justify-end">
          <Button onClick={handlePrint} variant="outline" className="bg-dark-800 border-dark-600">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      )}

      {/* Report Header */}
      <Card className="bg-dark-800/50 border-dark-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                FNTP Practitioner Report
              </h1>
              <div className="text-dark-300 space-y-1">
                {clientName && <p><strong>Client:</strong> {clientName}</p>}
                {reportDate && <p><strong>Report Date:</strong> {new Date(reportDate).toLocaleDateString()}</p>}
                <p><strong>Report Type:</strong> {reportType.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${analysis.executiveSummary.overallSeverity.bgColor} ${analysis.executiveSummary.overallSeverity.color}`}>
                {analysis.executiveSummary.overallSeverity.icon}
                {analysis.executiveSummary.overallSeverity.level.toUpperCase()} PRIORITY
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <CollapsibleSection 
        title="Executive Summary" 
        icon={<FileText className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.executiveSummary.keyFindings.map((finding, index) => (
              <div key={index} className="p-3 bg-dark-700 rounded-lg">
                <p className="text-sm text-white">{finding}</p>
              </div>
            ))}
          </div>
          
          {analysis.type === 'nutriq' && (
            <div className="p-4 bg-dark-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Overall Health Score</h4>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-white">
                  {analysis.executiveSummary.totalScore}/100
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.executiveSummary.overallSeverity.bgColor} ${analysis.executiveSummary.overallSeverity.color}`}>
                  {analysis.executiveSummary.overallSeverity.level.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Body Systems Assessment */}
      {analysis.type === 'nutriq' && 'systemScores' in analysis && analysis.systemScores && (
        <CollapsibleSection 
          title="Body Systems Assessment" 
          icon={<Activity className="h-5 w-5" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {analysis.systemScores.map((system: SystemScore) => (
              <div key={system.system} className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getBodySystemIcon(system.system)}
                    <h4 className="font-medium text-white capitalize">{system.system}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white">{system.score}/100</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${system.severity.bgColor} ${system.severity.color}`}>
                      {system.severity.icon}
                      {system.severity.level}
                    </div>
                  </div>
                </div>
                
                {system.issues.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-dark-300 mb-2">Key Issues:</h5>
                    <ul className="text-sm text-dark-300 space-y-1">
                      {system.issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {system.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-dark-300 mb-2">Recommendations:</h5>
                    <ul className="text-sm text-dark-300 space-y-1">
                                             {system.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Root Cause Analysis */}
      <CollapsibleSection 
        title="Root Cause Analysis" 
        icon={<Target className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-dark-700 rounded-lg">
            <h4 className="font-medium text-white mb-3">Functional Medicine Perspective</h4>
            <div className="text-sm text-dark-300 space-y-2">
              {analysis.type === 'nutriq' && (
                <>
                  <p>Based on the comprehensive body systems analysis, the following root causes have been identified:</p>
                  <ul className="space-y-1 ml-4">
                                         {analysis.systemScores?.filter((s: SystemScore) => s.score < 60).map((system: SystemScore, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        <span><strong className="text-white capitalize">{system.system} dysfunction</strong> - {system.issues[0] || 'Requires further investigation'}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {analysis.type === 'kbmo' && (
                <>
                  <p>Food sensitivity analysis reveals potential underlying causes:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span><strong className="text-white">Gut barrier dysfunction</strong> - Multiple food sensitivities indicate compromised intestinal permeability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span><strong className="text-white">Immune system dysregulation</strong> - Elevated IgG responses suggest chronic immune activation</span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Truck Driver Risk Factors */}
      <CollapsibleSection 
        title="Truck Driver Risk Factors" 
        icon={<Truck className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <h4 className="font-medium text-white mb-3">Occupational Health Considerations</h4>
              <ul className="text-sm text-dark-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong className="text-white">Sedentary lifestyle</strong> - Prolonged sitting affects circulation and metabolism</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong className="text-white">Irregular sleep patterns</strong> - Shift work disrupts circadian rhythms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong className="text-white">Limited food options</strong> - Truck stop meals often lack nutritional quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span><strong className="text-white">Stress and isolation</strong> - Long hours alone can impact mental health</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-dark-700 rounded-lg">
              <h4 className="font-medium text-white mb-3">Risk Mitigation Strategies</h4>
              <ul className="text-sm text-dark-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Implement regular movement breaks every 2 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Pack healthy, portable meals and snacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Establish consistent sleep hygiene practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Maintain regular communication with family and support network</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Intervention Priority Matrix */}
      <CollapsibleSection 
        title="Intervention Priority Matrix" 
        icon={<TrendingUp className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* High Priority */}
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                High Priority (Immediate)
              </h4>
              <ul className="text-sm text-dark-300 space-y-2">
                                 {analysis.type === 'nutriq' && 'systemScores' in analysis && analysis.systemScores?.filter((s: SystemScore) => s.score < 40).map((system: SystemScore, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong className="text-white capitalize">{system.system}</strong> - {system.recommendations[0] || 'Immediate intervention required'}</span>
                  </li>
                ))}
                                 {analysis.type === 'kbmo' && 'sensitivities' in analysis && analysis.sensitivities?.high.slice(0, 3).map((food: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong className="text-white">Eliminate {food.food}</strong> - High sensitivity (IgG: {food.iggLevel})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Medium Priority */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Medium Priority (1-2 weeks)
              </h4>
              <ul className="text-sm text-dark-300 space-y-2">
                                 {analysis.type === 'nutriq' && 'systemScores' in analysis && analysis.systemScores?.filter((s: SystemScore) => s.score >= 40 && s.score < 60).map((system: SystemScore, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span><strong className="text-white capitalize">{system.system}</strong> - {system.recommendations[0] || 'Monitor and support'}</span>
                  </li>
                ))}
                                 {analysis.type === 'kbmo' && 'sensitivities' in analysis && analysis.sensitivities?.moderate.slice(0, 3).map((food: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span><strong className="text-white">Reduce {food.food}</strong> - Moderate sensitivity (IgG: {food.iggLevel})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Low Priority */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Low Priority (Maintenance)
              </h4>
              <ul className="text-sm text-dark-300 space-y-2">
                                 {analysis.type === 'nutriq' && 'systemScores' in analysis && analysis.systemScores?.filter((s: SystemScore) => s.score >= 60).map((system: SystemScore, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong className="text-white capitalize">{system.system}</strong> - Continue current practices</span>
                  </li>
                ))}
                                 {analysis.type === 'kbmo' && 'sensitivities' in analysis && analysis.sensitivities?.low.slice(0, 3).map((food: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span><strong className="text-white">{food.food}</strong> - Low sensitivity, can consume occasionally</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Recommendations */}
      {'recommendations' in analysis && analysis.recommendations && analysis.recommendations.length > 0 && (
        <CollapsibleSection 
          title="Detailed Recommendations" 
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <h4 className="font-medium text-white mb-3">Action Plan</h4>
              <ul className="text-sm text-dark-300 space-y-2">
                                 {analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Follow-up Tests */}
      {'followUpTests' in analysis && analysis.followUpTests && analysis.followUpTests.length > 0 && (
        <CollapsibleSection 
          title="Follow-up Testing" 
          icon={<FileText className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <h4 className="font-medium text-white mb-3">Recommended Tests</h4>
              <ul className="text-sm text-dark-300 space-y-2">
                                 {analysis.followUpTests.map((test: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {test}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print-mode {
            background: white !important;
            color: black !important;
          }
          .print-mode * {
            background: white !important;
            color: black !important;
            border-color: #ccc !important;
          }
          .print-mode .bg-dark-800,
          .print-mode .bg-dark-700 {
            background: #f8f9fa !important;
            border: 1px solid #dee2e6 !important;
          }
          .print-mode .text-white {
            color: black !important;
          }
          .print-mode .text-dark-300 {
            color: #6c757d !important;
          }
          .print-mode .bg-red-500\/10 {
            background: #fef2f2 !important;
            border: 1px solid #fecaca !important;
          }
          .print-mode .bg-yellow-500\/10 {
            background: #fffbeb !important;
            border: 1px solid #fed7aa !important;
          }
          .print-mode .bg-green-500\/10 {
            background: #f0fdf4 !important;
            border: 1px solid #bbf7d0 !important;
          }
        }
      `}</style>
    </div>
  )
} 