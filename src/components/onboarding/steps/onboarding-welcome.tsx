'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Shield, 
  Clock, 
  FileText, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Activity,
  Users
} from 'lucide-react'

interface OnboardingWelcomeProps {
  onComplete: () => void
}

export function OnboardingWelcome({ onComplete }: OnboardingWelcomeProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl">
          <Heart className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Welcome to Your Health Journey
        </h2>
        <p className="text-dark-300 max-w-2xl mx-auto">
          We&apos;re excited to help you achieve optimal health through personalized functional medicine care. 
          This comprehensive onboarding process will help us understand your unique health profile.
        </p>
      </div>

      {/* Process Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-dark-700/50 border-dark-600 p-6 text-center">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Assessment</h3>
          <p className="text-sm text-dark-300">
            Share your health history, symptoms, and goals for a complete picture of your health
          </p>
        </Card>

        <Card className="bg-dark-700/50 border-dark-600 p-6 text-center">
          <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
          <p className="text-sm text-dark-300">
            Our advanced AI analyzes your data alongside lab results for personalized insights
          </p>
        </Card>

        <Card className="bg-dark-700/50 border-dark-600 p-6 text-center">
          <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Expert Care Team</h3>
          <p className="text-sm text-dark-300">
            Work with our functional medicine experts to create your personalized health plan
          </p>
        </Card>
      </div>

      {/* What to Expect */}
      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary-400" />
          <span>What to Expect</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-white">1</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Complete at Your Own Pace</h4>
              <p className="text-sm text-dark-300">
                This process takes approximately 30-45 minutes. You can save your progress and return later.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-white">2</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Comprehensive Health Assessment</h4>
              <p className="text-sm text-dark-300">
                Share your health history, current symptoms, medications, lifestyle factors, and goals.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-white">3</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Upload Supporting Documents</h4>
              <p className="text-sm text-dark-300">
                Upload lab reports, medical records, food photos, and other relevant health documents.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-white">4</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Personalized Health Plan</h4>
              <p className="text-sm text-dark-300">
                Receive a comprehensive analysis and personalized recommendations from our expert team.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span>Privacy & Security</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">HIPAA Compliant</h4>
              <p className="text-sm text-dark-300">
                Your health information is protected by strict privacy and security standards.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Secure Storage</h4>
              <p className="text-sm text-dark-300">
                All data is encrypted and stored securely in HIPAA-compliant systems.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Controlled Access</h4>
              <p className="text-sm text-dark-300">
                Only authorized healthcare professionals have access to your information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Your Control</h4>
              <p className="text-sm text-dark-300">
                You have full control over your data and can request changes or deletion at any time.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Get Started Button */}
      <div className="text-center">
        <Button 
          onClick={onComplete}
          size="lg"
          className="px-8 py-3 text-lg"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-dark-400 mt-3">
          Estimated completion time: 30-45 minutes
        </p>
      </div>
    </div>
  )
} 