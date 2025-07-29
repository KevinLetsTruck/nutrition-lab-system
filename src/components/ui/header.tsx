'use client'

import React from 'react'
import { Activity, BarChart3, FileText, Settings, User } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-dark-900/50 backdrop-blur-md border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NutritionLab</h1>
                <p className="text-xs text-dark-400">AI-Powered Analysis</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a href="/" className="flex items-center space-x-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a href="/reports" className="flex items-center space-x-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </a>
            <a href="/clients" className="flex items-center space-x-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              <User className="w-4 h-4" />
              <span>Clients</span>
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-dark-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 