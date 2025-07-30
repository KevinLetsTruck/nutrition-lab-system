'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { ProfessionalReport } from '@/components/lab/professional-report'
import { 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Play,
  Trash2,
  Eye,
  EyeOff
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

export default function ResultsPage() {
  const [reports, setReports] = useState<LabReport[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'professional' | 'raw'>('professional')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const processReport = async (reportId: string) => {
    setProcessingIds(prev => new Set([...prev, reportId]))
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labReportId: reportId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to process report')
      }
      
      // Refresh reports to show updated status
      await fetchReports()
    } catch (error) {
      console.error('Error processing report:', error)
      alert(`Failed to process report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete report')
      
      // Refresh reports
      await fetchReports()
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report')
    }
  }

  const clearPendingReports = async () => {
    if (!confirm('Are you sure you want to delete ALL pending reports? This cannot be undone.')) return
    
    try {
      const response = await fetch('/api/reports/clear-pending', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to clear pending reports')
      
      const result = await response.json()
      alert(`Cleared ${result.deleted} pending reports`)
      
      // Refresh reports
      await fetchReports()
    } catch (error) {
      console.error('Error clearing pending reports:', error)
      alert('Failed to clear pending reports')
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

  const filteredReports = selectedStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === selectedStatus)

  const statusCounts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    processing: reports.filter(r => r.status === 'processing').length,
    completed: reports.filter(r => r.status === 'completed').length,
    failed: reports.filter(r => r.status === 'failed').length
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Lab Report Results</h1>
          <p className="text-dark-300">View and manage all uploaded lab reports</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={fetchReports} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {statusCounts.pending > 0 && (
              <Button 
                onClick={clearPendingReports} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear {statusCounts.pending} Pending Reports
              </Button>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('professional')}
              variant="outline"
              size="sm"
              className={viewMode === 'professional' ? 'bg-primary-600 hover:bg-primary-700 border-primary-600' : 'bg-dark-800 border-dark-600'}
            >
              <Eye className="h-4 w-4 mr-2" />
              Professional View
            </Button>
            <Button
              onClick={() => setViewMode('raw')}
              variant="outline"
              size="sm"
              className={viewMode === 'raw' ? 'bg-primary-600 hover:bg-primary-700 border-primary-600' : 'bg-dark-800 border-dark-600'}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Raw Data
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-dark-400 mx-auto mb-4" />
              <p className="text-dark-300">No reports found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="bg-dark-800/50 border-dark-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(report.status)}
                        <h3 className="text-lg font-semibold text-white">
                          {report.report_type.toUpperCase()} Report
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-dark-300 space-y-1">
                        {report.client && (
                          <p>Client: {report.client.first_name} {report.client.last_name} ({report.client.email})</p>
                        )}
                        <p>Report Date: {new Date(report.report_date).toLocaleDateString()}</p>
                        <p>Uploaded: {new Date(report.created_at).toLocaleString()}</p>
                        {report.notes && <p>Notes: {report.notes}</p>}
                      </div>

                      {report.status === 'completed' && report.analysis_results && (
                        <div className="mt-4">
                          {viewMode === 'professional' ? (
                            <ProfessionalReport
                              analysisResults={report.analysis_results}
                              reportType={report.report_type}
                              clientName={report.client ? `${report.client.first_name} ${report.client.last_name}` : undefined}
                              reportDate={report.report_date}
                            />
                          ) : (
                            <div className="p-4 bg-dark-700 rounded-lg">
                              <h4 className="text-sm font-medium text-white mb-2">Raw Analysis Data</h4>
                              <pre className="text-xs text-dark-300 overflow-x-auto">
                                {JSON.stringify(report.analysis_results.summary || report.analysis_results, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {report.status === 'completed' && (
                        <Button
                          onClick={() => window.open(`/reports/${report.id}`, '_blank')}
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="ml-1">View Full Report</span>
                        </Button>
                      )}
                      
                      {report.status === 'pending' && (
                        <Button
                          onClick={() => processReport(report.id)}
                          disabled={processingIds.has(report.id)}
                          size="sm"
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          {processingIds.has(report.id) ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span className="ml-1">Process Now</span>
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => deleteReport(report.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 