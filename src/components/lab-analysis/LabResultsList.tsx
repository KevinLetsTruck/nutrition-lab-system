'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

interface LabResult {
  id: string
  lab_name?: string
  collection_date?: string
  processing_status: string
  file_type?: string
  created_at: string
  ai_analysis?: any
  detected_patterns?: any[]
}

interface LabResultsListProps {
  results: LabResult[]
  compact?: boolean
}

export default function LabResultsList({ results, compact = false }: LabResultsListProps) {
  const [reprocessing, setReprocessing] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'success',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const reprocessResult = async (id: string) => {
    setReprocessing(id)
    try {
      await fetch('/api/lab-analysis/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_result_id: id })
      })
      // Refresh the list
      window.location.reload()
    } catch (error) {
      console.error('Failed to reprocess:', error)
    } finally {
      setReprocessing(null)
    }
  }

  const viewReport = (id: string) => {
    window.open(`/lab-analysis/report/${id}`, '_blank')
  }

  const downloadReport = async (id: string) => {
    try {
      const response = await fetch(`/api/lab-analysis/report?lab_result_id=${id}&format=pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lab-report-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  if (!results.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No lab results uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first lab report to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {results.map(result => (
          <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.processing_status)}
              <div>
                <p className="font-medium text-sm">
                  {result.lab_name || 'Lab Report'} - {format(new Date(result.collection_date || result.created_at), 'MMM dd, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.detected_patterns?.length || 0} patterns detected
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(result.processing_status)}
              {result.processing_status === 'completed' && (
                <Button size="sm" variant="ghost" onClick={() => viewReport(result.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Results History</CardTitle>
        <CardDescription>All uploaded lab documents and their processing status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lab/Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Patterns</TableHead>
              <TableHead>Analysis</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map(result => (
              <TableRow key={result.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{result.lab_name || 'Unknown Lab'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(result.collection_date || result.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {result.file_type?.toUpperCase() || 'PDF'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.processing_status)}
                    {getStatusBadge(result.processing_status)}
                  </div>
                </TableCell>
                <TableCell>
                  {result.processing_status === 'completed' ? (
                    <span className="font-medium">{result.detected_patterns?.length || 0}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {result.processing_status === 'completed' && result.ai_analysis ? (
                    <Badge variant="success">Complete</Badge>
                  ) : result.processing_status === 'processing' ? (
                    <Badge variant="secondary">In Progress</Badge>
                  ) : result.processing_status === 'failed' ? (
                    <Badge variant="destructive">Failed</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {result.processing_status === 'completed' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => viewReport(result.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => downloadReport(result.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(result.processing_status === 'failed' || result.processing_status === 'pending') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reprocessResult(result.id)}
                        disabled={reprocessing === result.id}
                      >
                        <RefreshCw className={`h-4 w-4 ${reprocessing === result.id ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}