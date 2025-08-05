'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function AuthDebug() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [cookieDebug, setCookieDebug] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    setLoading(true)
    try {
      // Check auth status
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      const authData = await authResponse.json()
      setAuthStatus({
        status: authResponse.status,
        ok: authResponse.ok,
        data: authData
      })

      // Check cookie debug
      const cookieResponse = await fetch('/api/auth/debug-cookies', {
        credentials: 'include'
      })
      const cookieData = await cookieResponse.json()
      setCookieDebug(cookieData)
    } catch (error) {
      console.error('Auth debug error:', error)
      setAuthStatus({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return <div className="text-sm text-gray-500">Checking authentication...</div>
  }

  return (
    <Card className="p-4 mb-4 bg-gray-50">
      <h3 className="font-semibold mb-2">Authentication Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Auth Status:</strong> {authStatus?.ok ? '✅ Authenticated' : '❌ Not Authenticated'}
        </div>
        <div>
          <strong>Status Code:</strong> {authStatus?.status}
        </div>
        
        {cookieDebug && (
          <>
            <div>
              <strong>Environment:</strong> {cookieDebug.environment} {cookieDebug.isVercel && '(Vercel)'}
            </div>
            <div>
              <strong>Has Auth Token:</strong> {cookieDebug.hasAuthToken ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Cookie Count:</strong> {cookieDebug.cookieCount}
            </div>
            {cookieDebug.authTokenLength > 0 && (
              <div>
                <strong>Token Length:</strong> {cookieDebug.authTokenLength} chars
              </div>
            )}
          </>
        )}
        
        {authStatus?.data?.user && (
          <div>
            <strong>User:</strong> {authStatus.data.user.email} ({authStatus.data.user.role})
          </div>
        )}
      </div>
      
      <Button 
        onClick={checkAuth} 
        size="sm" 
        className="mt-2"
        variant="outline"
      >
        Refresh Auth Status
      </Button>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-gray-600">Raw Debug Data</summary>
        <pre className="text-xs mt-2 overflow-auto">
          {JSON.stringify({ authStatus, cookieDebug }, null, 2)}
        </pre>
      </details>
    </Card>
  )
}