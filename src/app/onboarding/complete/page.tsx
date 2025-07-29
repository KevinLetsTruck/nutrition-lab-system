import { CheckCircle, Mail, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function OnboardingCompletePage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card className="bg-dark-800/50 border-dark-700 p-8">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Onboarding Complete!
          </h1>
          <p className="text-xl text-dark-300 mb-8">
            Thank you for completing your comprehensive health assessment. 
            Our team will review your information and get back to you soon.
          </p>

          {/* Next Steps */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4 text-left">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-white">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Review Process</h3>
                <p className="text-dark-300">
                  Our functional medicine experts will review your comprehensive health profile 
                  and prepare personalized recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-left">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-white">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Email Confirmation</h3>
                <p className="text-dark-300">
                  You&apos;ll receive a detailed confirmation email with next steps and 
                  scheduling information within 24-48 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-left">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-white">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Initial Consultation</h3>
                <p className="text-dark-300">
                  Schedule your first consultation to discuss your personalized health plan 
                  and begin your journey to optimal wellness.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Need Immediate Assistance?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Email Support</p>
                  <p className="text-dark-300">support@nutritionlab.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-primary-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Response Time</p>
                  <p className="text-dark-300">24-48 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/">
              <Button size="lg" className="w-full md:w-auto">
                <span>Return to Home</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <p className="text-sm text-dark-400">
              You can close this window. Your information has been securely saved.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 