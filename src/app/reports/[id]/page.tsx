'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { ProfessionalReport } from '@/components/lab/professional-report'
import { 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Play,
  Trash2
} from 'lucide-react'

interface LabReport {
  id: string
  client_id: string
  report_type: string
  report_date: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_path: string
  created_at: string
  updated_at: string
  analysis_results?: any
  notes?: string
  client?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<LabReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/${reportId}`)
      if (!response.ok) throw new Error('Failed to fetch report')
      
      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const processReport = async () => {
    if (!report) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labReportId: report.id })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to process report')
      }
      
      // Refresh report to show updated status
      await fetchReport(report.id)
    } catch (error) {
      console.error('Error processing report:', error)
      alert(`Failed to process report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  const deleteReport = async () => {
    if (!report || !confirm('Are you sure you want to delete this report?')) return
    
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete report')
      
      // Redirect back to results page
      router.push('/results')
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-navy-950">
        <Header />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-dark-400 mx-auto mb-4" />
              <p className="text-dark-300">Report not found</p>
              <Button 
                onClick={() => router.push('/results')} 
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => router.push('/results')} 
              variant="outline"
              className="bg-dark-800 border-dark-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
            
            <div className="flex gap-2">
              {report.status === 'pending' && (
                <Button
                  onClick={processReport}
                  disabled={processing}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {processing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span className="ml-1">Process Report</span>
                </Button>
              )}
              
              <Button
                onClick={deleteReport}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon(report.status)}
            <h1 className="text-3xl font-bold text-white">
              {report.report_type.toUpperCase()} Report
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
          </div>
          
          <div className="text-dark-300 space-y-1">
            {report.client && (
              <p><strong>Client:</strong> {report.client.first_name} {report.client.last_name} ({report.client.email})</p>
            )}
            <p><strong>Report Date:</strong> {new Date(report.report_date).toLocaleDateString()}</p>
            <p><strong>Uploaded:</strong> {new Date(report.created_at).toLocaleString()}</p>
            {report.notes && <p><strong>Notes:</strong> {report.notes}</p>}
          </div>
        </div>

        {/* Report Content */}
        {report.status === 'completed' && report.analysis_results ? (
          <ProfessionalReport
            analysisResults={report.analysis_results}
            reportType={report.report_type}
            clientName={report.client ? `${report.client.first_name} ${report.client.last_name}` : undefined}
            reportDate={report.report_date}
          />
        ) : report.status === 'failed' ? (
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="text-center py-12">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-white mb-2">Report processing failed</p>
              <p className="text-dark-300 mb-4">The analysis could not be completed. Please try processing again or contact support.</p>
              <Button onClick={processReport} disabled={processing}>
                {processing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="ml-1">Retry Processing</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-white mb-2">Report is {report.status}</p>
              <p className="text-dark-300">
                {report.status === 'pending' 
                  ? 'Click "Process Report" to begin analysis'
                  : 'Analysis is in progress. Please wait...'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
} 