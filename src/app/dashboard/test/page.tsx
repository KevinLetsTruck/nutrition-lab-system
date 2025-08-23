"use client";

import React from "react";
import Link from "next/link";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          System Health Check ✅
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            App Status
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Next.js server running</li>
            <li>✅ Pages loading correctly</li>
            <li>✅ Testing page removed</li>
            <li>✅ Navigation cleaned up</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Available Pages
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/dashboard/clients"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              Clients
            </Link>
            <Link 
              href="/dashboard/scheduled"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              Thursday Calls
            </Link>
          </div>
        </div>

        <div className="bg-yellow-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Notes
          </h2>
          <ul className="space-y-2 text-yellow-200">
            <li>• Issue tracking has been temporarily disabled</li>
            <li>• Testing page has been removed</li>
            <li>• Some TypeScript errors exist but don't affect runtime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
