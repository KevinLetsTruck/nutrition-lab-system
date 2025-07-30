'use client'

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6">
            Welcome to Your Health Journey!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Thank you for completing your health assessment. Your information has been 
            securely submitted and Kevin Rutherford, FNTP will be reviewing your profile.
          </p>
          
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">What Happens Next:</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Initial Review</h4>
                  <p className="text-gray-400 text-sm">Kevin will analyze your health assessment and prepare personalized recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Discovery Call</h4>
                  <p className="text-gray-400 text-sm">You'll receive a call within 24-48 hours to discuss your goals and answer questions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Coaching Session</h4>
                  <p className="text-gray-400 text-sm">Schedule your first comprehensive coaching session to begin your transformation</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8">
            <p className="text-green-400 text-sm">
              💡 <strong>Pro Tip:</strong> Check your email for important updates and resources 
              we'll be sending to help you prepare for your coaching journey.
            </p>
          </div>
          
          <button 
            onClick={() => window.location.href = 'mailto:support@destinationhealth.com'}
            className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Have Questions? Contact Us
          </button>
        </div>
      </div>
    </div>
  )
} 