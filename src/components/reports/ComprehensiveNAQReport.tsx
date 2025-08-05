'use client'

import React, { useState } from 'react'
import { ComprehensiveNAQReport } from '@/lib/analysis/naq-report-generator'
import { NAQReportVisuals } from './NAQReportVisuals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Printer, Download, ChevronRight, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ComprehensiveNAQReportProps {
  report: ComprehensiveNAQReport
}

export const ComprehensiveNAQReportDisplay: React.FC<ComprehensiveNAQReportProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState('summary')
  
  const handlePrint = () => {
    window.print()
  }
  
  const handleExport = () => {
    // TODO: Implement PDF export
    console.log('Export PDF functionality to be implemented')
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{report.header.title}</h1>
            <div className="mt-2 space-y-1 text-gray-600">
              <p><span className="font-medium">Client:</span> {report.header.clientName}</p>
              <p><span className="font-medium">Date:</span> {report.header.assessmentDate}</p>
              <p><span className="font-medium">Practitioner:</span> {report.header.practitioner}</p>
            </div>
          </div>
          <div className="flex space-x-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Urgent Alerts */}
      {report.functionalMedicinePatterns.some(p => p.interventionPriority === 'immediate') && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Immediate Attention Required</AlertTitle>
          <AlertDescription className="text-red-800">
            Critical patterns identified that require intervention within 1 week. 
            See Root Cause Analysis and Intervention Protocol sections for details.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Content Sections */}
      <div className="space-y-6 print:space-y-8">
        {/* Executive Summary - Always visible in print */}
        <div className={activeTab === 'summary' ? 'block' : 'hidden print:block'}>
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.executiveSummary }} />
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Analysis */}
        <div className={activeTab === 'analysis' ? 'block' : 'hidden print:block'}>
          <div className="space-y-6">
            {/* Symptom Burden Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Symptom Burden Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.symptomBurdenAnalysis }} />
              </CardContent>
            </Card>
            
            {/* Root Cause Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.rootCauseAnalysis }} />
              </CardContent>
            </Card>
            
            {/* System Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>System-by-System Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.systemBySystemBreakdown }} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Functional Medicine Patterns */}
        <div className={activeTab === 'patterns' ? 'block' : 'hidden print:block'}>
          <div className="space-y-4">
            {report.functionalMedicinePatterns.map((pattern, index) => (
              <PatternCard key={index} pattern={pattern} index={index} />
            ))}
          </div>
        </div>
        
        {/* Intervention Protocol */}
        <div className={activeTab === 'protocol' ? 'block' : 'hidden print:block'}>
          <div className="space-y-6">
            {/* Intervention Phases */}
            <Card>
              <CardHeader>
                <CardTitle>Intervention Protocol</CardTitle>
                <CardDescription>
                  Expected timeline: {report.interventionProtocol.expectedTimeline}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterventionPhases phases={report.interventionProtocol.phases} />
              </CardContent>
            </Card>
            
            {/* Supplement Protocol */}
            <Card>
              <CardHeader>
                <CardTitle>Supplement Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <SupplementProtocol protocol={report.supplementRecommendations} />
              </CardContent>
            </Card>
            
            {/* Dietary Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <DietaryProtocol protocol={report.dietaryGuidelines} />
              </CardContent>
            </Card>
            
            {/* Lifestyle Modifications */}
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Modifications</CardTitle>
              </CardHeader>
              <CardContent>
                <LifestyleProtocol protocol={report.lifestyleModifications} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Visual Reports */}
        <div className={activeTab === 'visuals' ? 'block' : 'hidden print:block'}>
          {report.visualizations && (
            <NAQReportVisuals 
              data={report.functionalMedicinePatterns[0]?.affectedSystems ? 
                report.visualizations.systemScoreRadar : 
                {} as any} 
              patterns={report.functionalMedicinePatterns} 
            />
          )}
        </div>
        
        {/* Practitioner Notes */}
        <div className={activeTab === 'notes' ? 'block' : 'hidden print:block'}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practitioner Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {report.practitionerNotes}
                </div>
              </CardContent>
            </Card>
            
            {/* Truck Driver Specific */}
            <Card>
              <CardHeader>
                <CardTitle>Truck Driver-Specific Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.truckDriverSpecificAdvice }} />
              </CardContent>
            </Card>
            
            {/* Follow-Up */}
            <Card>
              <CardHeader>
                <CardTitle>Follow-Up Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.followUpRecommendations }} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600 print:block">
        <p>Report ID: {report.header.reportId}</p>
        <p>Generated: {report.metadata.generatedAt.toLocaleString()}</p>
        <p>Confidence: {Math.round(report.metadata.confidence * 100)}% | Data Completeness: {Math.round(report.metadata.dataCompleteness)}%</p>
      </div>
    </div>
  )
}

// Sub-components

const PatternCard: React.FC<{ pattern: any, index: number }> = ({ pattern, index }) => {
  const priorityColors = {
    immediate: 'destructive',
    high: 'warning',
    moderate: 'secondary',
    low: 'default'
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {index + 1}. {pattern.name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant={priorityColors[pattern.interventionPriority as keyof typeof priorityColors]}>
                {pattern.interventionPriority} priority
              </Badge>
              <Badge variant="outline">
                {Math.round(pattern.confidence * 100)}% confidence
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Affected Systems</h4>
          <div className="flex flex-wrap gap-2">
            {pattern.affectedSystems.map((system: string) => (
              <Badge key={system} variant="secondary">{system}</Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Key Indicators</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {pattern.keyIndicators.map((indicator: string, i: number) => (
              <li key={i}>{indicator}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Functional Medicine Interpretation</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{pattern.functionalMedicineInterpretation}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Truck Driver Relevance</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{pattern.truckDriverRelevance}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const InterventionPhases: React.FC<{ phases: any[] }> = ({ phases }) => {
  return (
    <div className="space-y-6">
      {phases.map((phase, index) => (
        <div key={index} className="relative">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
              {index + 1}
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">{phase.phase}</h3>
              <p className="text-sm text-gray-600 mb-2">Duration: {phase.duration}</p>
              
              <div className="mb-3">
                <h4 className="font-medium mb-1">Goals:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {phase.goals.map((goal: string, i: number) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-3">
                <h4 className="font-medium mb-1">Success Metrics:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {phase.successMetrics.map((metric: string, i: number) => (
                    <li key={i}>{metric}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {index < phases.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300"></div>
          )}
        </div>
      ))}
    </div>
  )
}

const SupplementProtocol: React.FC<{ protocol: any }> = ({ protocol }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Immediate Start (Week 1-2)</h3>
        <div className="space-y-3">
          {protocol.immediate.map((supp: any, index: number) => (
            <SupplementCard key={index} supplement={supp} />
          ))}
        </div>
      </div>
      
      {protocol.shortTerm.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Short Term (Week 3-8)</h3>
          <div className="space-y-3">
            {protocol.shortTerm.map((supp: any, index: number) => (
              <SupplementCard key={index} supplement={supp} />
            ))}
          </div>
        </div>
      )}
      
      {protocol.longTerm.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Long Term Maintenance</h3>
          <div className="space-y-3">
            {protocol.longTerm.map((supp: any, index: number) => (
              <SupplementCard key={index} supplement={supp} />
            ))}
          </div>
        </div>
      )}
      
      <Alert>
        <AlertDescription>
          <div dangerouslySetInnerHTML={{ __html: protocol.notes }} />
        </AlertDescription>
      </Alert>
    </div>
  )
}

const SupplementCard: React.FC<{ supplement: any }> = ({ supplement }) => {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{supplement.name}</h4>
        <Badge variant="secondary">{supplement.dosage}</Badge>
      </div>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Timing:</span> {supplement.timing} | 
        <span className="font-medium ml-2">Duration:</span> {supplement.duration}
      </p>
      <p className="text-sm">{supplement.rationale}</p>
      {supplement.truckDriverTip && (
        <p className="text-sm text-blue-700 italic">
          💡 Truck Driver Tip: {supplement.truckDriverTip}
        </p>
      )}
    </div>
  )
}

const DietaryProtocol: React.FC<{ protocol: any }> = ({ protocol }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Elimination Phase</h3>
        <div className="flex flex-wrap gap-2">
          {protocol.eliminationPhase.map((food: string) => (
            <Badge key={food} variant="destructive">{food}</Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Truck Stop Guidelines</h3>
        <ul className="space-y-2">
          {protocol.truckStopGuidelines.map((guideline: string, index: number) => (
            <li key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: guideline }} />
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Sample Daily Meal Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(protocol.mealPlanExample).map(([meal, options]) => (
            <div key={meal}>
              <h4 className="font-medium capitalize mb-2">{meal}</h4>
              <ul className="text-sm space-y-1">
                {(options as string[]).map((option, i) => (
                  <li key={i} className="text-gray-700">{option}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const LifestyleProtocol: React.FC<{ protocol: any }> = ({ protocol }) => {
  const categories = [
    { key: 'sleep', icon: '😴', title: 'Sleep Optimization' },
    { key: 'exercise', icon: '💪', title: 'Movement & Exercise' },
    { key: 'stressManagement', icon: '🧘', title: 'Stress Management' },
    { key: 'environmental', icon: '🌿', title: 'Environmental Health' }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map(({ key, icon, title }) => (
        <div key={key} className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            {title}
          </h3>
          <ul className="space-y-1">
            {protocol[key].map((item: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <ChevronRight className="w-4 h-4 mt-0.5 mr-1 flex-shrink-0 text-gray-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default ComprehensiveNAQReportDisplay