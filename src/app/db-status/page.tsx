'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, RefreshCw, Database } from 'lucide-react'

export default function DbStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db-connection')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({ success: false, error: 'Failed to check status' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-dark p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Database Connection Status
            </CardTitle>
            <CardDescription>
              Real-time status of your Supabase database connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : status ? (
              <>
                {/* Overall Status */}
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
                  status.success 
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {status.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {status.success ? 'Database Connected' : 'Database Unreachable'}
                    </p>
                    {status.error && <p className="text-sm">{status.error}</p>}
                    {status.details && <p className="text-sm opacity-75">{status.details}</p>}
                  </div>
                </div>

                {/* Environment Variables */}
                {status.environment && (
                  <div>
                    <h3 className="font-semibold mb-2">Environment Variables</h3>
                    <div className="space-y-1">
                      {Object.entries(status.environment).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-mono">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Database Info */}
                {status.database && (
                  <div>
                    <h3 className="font-semibold mb-2">Database Status</h3>
                    <div className="space-y-2 text-sm">
                      <p>Connected: {status.database.connected ? '✅ Yes' : '❌ No'}</p>
                      {status.database.userCount !== undefined && (
                        <p>Total Users: {status.database.userCount}</p>
                      )}
                      {status.database.error && (
                        <p className="text-red-600 dark:text-red-400">
                          Error: {status.database.error}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Supabase URL */}
                {status.supabaseUrl && (
                  <div className="text-sm">
                    <p className="font-semibold">Supabase URL:</p>
                    <p className="font-mono opacity-75">{status.supabaseUrl}</p>
                  </div>
                )}
              </>
            ) : (
              <p>No status data available</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button onClick={checkStatus} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>If database is unreachable:</p>
                <ol className="list-decimal list-inside mt-1">
                  <li>Check your Supabase dashboard</li>
                  <li>Ensure project is not paused</li>
                  <li>Verify connection strings</li>
                </ol>
              </div>
            </div>

            {!status?.success && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">🔗 Quick Links:</p>
                <div className="space-y-1">
                  <a 
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    → Open Supabase Dashboard
                  </a>
                  <a 
                    href="/reset-password"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    → Password Reset Page
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
