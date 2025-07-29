import React from 'react'
import { cn } from '@/lib/utils'

export interface LabResult {
  testName: string
  value: string
  unit: string
  referenceRange: string
  status: 'normal' | 'high' | 'low' | 'critical'
  timestamp: Date
}

interface LabResultsProps {
  results: LabResult[]
  className?: string
}

export function LabResults({ results, className }: LabResultsProps) {
  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-lab-normal text-white'
      case 'high':
        return 'bg-lab-warning text-white'
      case 'low':
        return 'bg-lab-warning text-white'
      case 'critical':
        return 'bg-lab-critical text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: LabResult['status']) => {
    switch (status) {
      case 'normal':
        return '✓'
      case 'high':
      case 'low':
        return '⚠'
      case 'critical':
        return '✗'
      default:
        return '?'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900">Lab Results</h3>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.testName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.value} {result.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.referenceRange}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(result.status)
                    )}
                  >
                    <span className="mr-1">{getStatusIcon(result.status)}</span>
                    {result.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No lab results available
        </div>
      )}
    </div>
  )
}
