import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DH</span>
              </div>
              <span className="text-xl font-bold text-white">DestinationHealth</span>
            </div>
            <p className="text-gray-400 mt-4 max-w-sm leading-relaxed">
              Kevin Rutherford, FNTP - Functional Nutritional Therapy Practitioner 
              specializing in truck driver health optimization since 2020.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>NutriQ Health Assessments</li>
              <li>Food Sensitivity Testing</li>
              <li>Hormone Analysis</li>
              <li>DOT Health Optimization</li>
              <li>Functional Medicine Protocols</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Professional</h4>
            <ul className="space-y-2 text-gray-400">
              <li>FNTP Certified</li>
              <li>Truck Driver Specialist</li>
              <li>Functional Medicine Approach</li>
              <li>Remote Consultations</li>
              <li>DOT Medical Compliance</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2024 DestinationHealth. All rights reserved. | Kevin Rutherford, FNTP</p>
          <p className="text-sm mt-2">
            Specializing in professional driver health optimization and DOT medical compliance
          </p>
        </div>
      </div>
    </footer>
  )
} 