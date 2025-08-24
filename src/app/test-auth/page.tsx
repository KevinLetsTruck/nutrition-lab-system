'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function TestAuthPage() {
  const { token, user, login, logout } = useAuth();
  const [email, setEmail] = useState('admin@fntp.com');
  const [password, setPassword] = useState('secure123');
  const [testResult, setTestResult] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      setTestResult('Login successful!');
    } catch (error) {
      setTestResult(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testClientCreation = async () => {
    if (!token) {
      setTestResult('No token available');
      return;
    }

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: `test-${Date.now()}@example.com`,
          phone: '555-1234',
          isTruckDriver: true,
          dotNumber: '1234567',
          healthGoals: ['Test goal'],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(`Client created successfully! ID: ${data.id}`);
      } else {
        setTestResult(`Client creation failed: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
            <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : '❌ Not logged in'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button
            onClick={testClientCreation}
            disabled={!token}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Test Client Creation
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
