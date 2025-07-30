'use client'

import React from 'react'
import { Activity, BarChart3, FileText, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from './badge'

export function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DH</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">DestinationHealth</span>
                <Badge variant="fntp" size="sm" className="text-xs">
                  FNTP Certified
                </Badge>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/onboarding" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              New Client
            </Link>
            <Link href="/streamlined-onboarding" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Quick Onboarding
            </Link>
            <Link href="/results" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              View Results
            </Link>
            <Link href="/reports" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Reports
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 