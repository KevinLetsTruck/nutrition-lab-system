'use client';

import Link from 'next/link';
import { ClaudeStatus } from '@/components/analysis/ClaudeStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            FNTP Nutrition System
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Nutritional Therapy Practice Management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* What's Built */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">
              ✅ What's Ready
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>• PostgreSQL Database Running</li>
              <li>• Authentication System (JWT)</li>
              <li>• Client Management API</li>
              <li>• Prisma ORM Configured</li>
              <li>• TypeScript Setup</li>
              <li>• Tailwind CSS Styling</li>
            </ul>
          </div>

          {/* API Endpoints */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              🚀 API Endpoints
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="font-mono text-sm">POST /api/auth/register</li>
              <li className="font-mono text-sm">POST /api/auth/login</li>
              <li className="font-mono text-sm">GET /api/clients</li>
              <li className="font-mono text-sm">POST /api/clients</li>
            </ul>
          </div>

          {/* Database Models */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-purple-600">
              📊 Database Models
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>• User (Authentication)</li>
              <li>• Client (Truck Drivers)</li>
              <li>• Document (Lab Reports)</li>
              <li>• Assessment (150 Questions)</li>
              <li>• Protocol (Nutrition Plans)</li>
              <li>• ClientNote (Session Notes)</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">
              ⚡ Quick Actions
            </h2>
            <div className="space-y-3">
              <Link 
                href="/register"
                className="block text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Create Admin Account
              </Link>
              <Link 
                href="/login"
                className="block text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Login
              </Link>
              <button
                onClick={() => window.open('http://localhost:5555', '_blank')}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
              >
                Open Prisma Studio
              </button>
            </div>
          </div>

          {/* Test API */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">
              🧪 Test API
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Run this in terminal to test:
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@fntp.com",
       "password":"secure123",
       "name":"Test User"}'`}
            </pre>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
              📁 Project Structure
            </h2>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• /src/app - Pages & API</li>
              <li>• /src/components - UI Components</li>
              <li>• /src/lib - Utilities & Auth</li>
              <li>• /src/types - TypeScript Types</li>
              <li>• /prisma - Database Schema</li>
              <li>• /docker - Docker Config</li>
            </ul>
          </div>
        </div>

        {/* Claude AI Status */}
        <div className="mt-12 max-w-4xl mx-auto">
          <ClaudeStatus />
        </div>
        
        {/* Next Steps */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-800">
            🎯 Ready to Build More!
          </h2>
          <p className="text-gray-700 mb-4">
            The foundation is complete. Next features to implement:
          </p>
          <ul className="grid md:grid-cols-2 gap-2 text-gray-700">
            <li>• Client Management Interface</li>
            <li>• Document Upload System (AWS S3)</li>
            <li>• 150-Question Assessment Form</li>
            <li>• AI Analysis with Claude</li>
            <li>• Protocol Generation</li>
            <li>• Dashboard & Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}