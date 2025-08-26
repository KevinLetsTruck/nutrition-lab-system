'use client';

import { useEffect, useState } from 'react';

export function ClaudeStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkClaudeStatus();
  }, []);

  async function checkClaudeStatus() {
    try {
      const response = await fetch('/api/test-claude');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ 
        status: 'error', 
        message: 'Failed to check Claude status' 
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-gray-600">Checking Claude AI status...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 ${
      status?.connected 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <h3 className="font-semibold text-lg mb-2">
        🤖 Claude AI Integration
      </h3>

      {status?.connected ? (
        <div className="space-y-2">
          <p className="text-green-700">
            ✅ Connected and operational
          </p>
          <p className="text-sm text-gray-600">
            Model: {status.model}
          </p>
          {status.testAnalysis && (
            <div className="mt-3 p-3 bg-white rounded border border-green-100">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Sample Analysis:
              </p>
              <p className="text-xs text-gray-600">
                {status.testAnalysis.summary || 'Analysis successful'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-yellow-700">
            ⚠️ Not connected - API key required
          </p>
          <div className="text-sm space-y-2">
            {status?.instructions?.map((instruction: string, i: number) => (
              <p key={i} className="text-gray-600">
                {instruction}
              </p>
            ))}
          </div>
          <div className="mt-3 p-3 bg-white rounded border border-yellow-100">
            <p className="text-xs text-gray-600">
              Once configured, Claude will analyze lab reports, identify patterns, 
              and generate personalized protocols for your truck driver clients.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
