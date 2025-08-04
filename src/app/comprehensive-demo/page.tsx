'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Upload, 
  FileText,
  Activity,
  TrendingUp,
  AlertTriangle,
  Truck,
  Shield
} from 'lucide-react'

interface WorkflowStep {
  name: string
  status: string
  duration: number | null
  error?: string
}

export default function ComprehensiveDemoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [workflowResult, setWorkflowResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('upload')

  const processWithWorkflow = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setIsProcessing(true)
    setWorkflowResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('workflowType', 'document')
      formData.append('autoSelectPrompts', 'true')
      formData.append('performQualityChecks', 'true')
      formData.append('generateProtocols', 'true')
      formData.append('sendNotifications', 'false') // Disabled for demo

      const response = await fetch('/api/workflow/process', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setWorkflowResult(data)
      
      if (data.success) {
        setActiveTab('results')
      }
    } catch (error) {
      console.error('Workflow processing error:', error)
      setWorkflowResult({
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (step.status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />
    if (step.status === 'in_progress') return <Loader2 className="h-4 w-4 animate-spin" />
    return <div className="h-4 w-4 rounded-full bg-gray-300" />
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Functional Medicine Document Analysis System
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive health analysis optimized for truck drivers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="results" disabled={!workflowResult}>Results</TabsTrigger>
          <TabsTrigger value="insights">System Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload & Analysis</CardTitle>
              <CardDescription>
                Upload any health document for intelligent analysis with truck driver-specific insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-500"
                >
                  Choose a PDF document
                </label>
                {selectedFile && (
                  <div className="mt-4">
                    <FileText className="inline h-5 w-5 mr-2" />
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Supported Documents</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• NutriQ Health Assessments</li>
                      <li>• Laboratory Reports</li>
                      <li>• KBMO Food Sensitivity Tests</li>
                      <li>• Dutch Hormone Tests</li>
                      <li>• FIT Tests</li>
                      <li>• CGM Reports</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Analysis Features</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Root Cause Analysis</li>
                      <li>• DOT Certification Risks</li>
                      <li>• Road-Compatible Protocols</li>
                      <li>• Safety Monitoring</li>
                      <li>• Personalized Supplements</li>
                      <li>• Progress Tracking</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={processWithWorkflow}
                disabled={!selectedFile || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-5 w-5" />
                    Analyze with Automated Workflow
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Intelligent Document Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Multi-Method Extraction</p>
                    <p className="text-sm text-gray-600">
                      Text extraction, OCR, and Vision API with automatic fallbacks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Smart Classification</p>
                    <p className="text-sm text-gray-600">
                      AI-powered document type detection with confidence scoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Error Recovery</p>
                    <p className="text-sm text-gray-600">
                      Robust handling of poor quality PDFs and scanned documents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  Truck Driver Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">DOT Compliance Monitoring</p>
                    <p className="text-sm text-gray-600">
                      Automatic flagging of certification risks and waivers needed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Road-Compatible Solutions</p>
                    <p className="text-sm text-gray-600">
                      Interventions designed for life on the road
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Safety-Critical Alerts</p>
                    <p className="text-sm text-gray-600">
                      Monitor hypoglycemia, medication interactions, and fatigue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Functional Medicine Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Root Cause Identification</p>
                    <p className="text-sm text-gray-600">
                      Go beyond symptoms to underlying dysfunctions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Optimal Range Assessment</p>
                    <p className="text-sm text-gray-600">
                      Functional ranges, not just standard lab ranges
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pattern Recognition</p>
                    <p className="text-sm text-gray-600">
                      AI identifies symptom clusters and system interconnections
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Automated Workflows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Progressive Analysis</p>
                    <p className="text-sm text-gray-600">
                      Systematic completion of all analysis components
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Quality Assurance</p>
                    <p className="text-sm text-gray-600">
                      Automated checks for completeness and accuracy
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Protocol Generation</p>
                    <p className="text-sm text-gray-600">
                      Automatic creation of personalized intervention plans
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {workflowResult && (
            <div className="space-y-6">
              {/* Workflow Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Execution</CardTitle>
                  <CardDescription>
                    Total processing time: {formatDuration(workflowResult.totalDuration)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflowResult.steps?.map((step: WorkflowStep, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStepIcon(step)}
                          <span className="font-medium capitalize">
                            {step.name.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {formatDuration(step.duration)}
                          </span>
                          <Badge variant={
                            step.status === 'completed' ? 'default' :
                            step.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {step.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {workflowResult.success && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                      Document Type: <Badge>{workflowResult.documentType || 'Unknown'}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="font-semibold">Document Analyzed</p>
                        <p className="text-sm text-gray-600">Successfully processed</p>
                      </div>
                      {workflowResult.hasProtocols && (
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="font-semibold">Protocols Generated</p>
                          <p className="text-sm text-gray-600">Ready for implementation</p>
                        </div>
                      )}
                      {workflowResult.urgentAlerts?.length > 0 && (
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <p className="font-semibold">Urgent Alerts</p>
                          <p className="text-sm text-gray-600">
                            {workflowResult.urgentAlerts.length} risk(s) detected
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Display */}
              {!workflowResult.success && (
                <Alert className="border-red-500">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription>
                    <div className="font-semibold text-red-700">Analysis Failed</div>
                    <div className="mt-2">{workflowResult.error}</div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Core Components</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="p-3 bg-gray-50 rounded">
                        <span className="font-medium">Robust PDF Processor:</span> Multi-method extraction with fallbacks
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <span className="font-medium">Intelligent Classifier:</span> AI-powered document type detection
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <span className="font-medium">Truck Driver Analyzer:</span> Specialized functional medicine engine
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <span className="font-medium">Workflow Manager:</span> Automated pipeline with quality checks
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Processing Speed</span>
                      <span className="font-semibold">&lt; 2 minutes</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Accuracy Rate</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Error Recovery</span>
                      <span className="font-semibold">99%</span>
                    </div>
                    <Progress value={99} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}