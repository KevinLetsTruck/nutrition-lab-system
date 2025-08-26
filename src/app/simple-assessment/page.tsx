import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";

export default function SimpleAssessmentPage() {
  return (
    <div className="min-h-screen bg-brand-navy py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/dashboard/clients">
              <Button
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Notice Card */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-lg mx-auto mb-6">
              <Info className="h-8 w-8 text-blue-400" />
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Assessment Not Available
              </h1>

              <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
                Health assessments are not included in this simplified daily
                workflow app. This version focuses on core practice management
                features.
              </p>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">
                  Available Features
                </h3>
                <ul className="text-left space-y-2 text-gray-300">
                  <li>• Client management and tracking</li>
                  <li>• Appointment scheduling</li>
                  <li>• Session notes and documentation</li>
                  <li>• Basic document management</li>
                </ul>
              </div>

              <div className="pt-6">
                <Link href="/dashboard/clients">
                  <Button
                    size="lg"
                    className="bg-brand-green text-brand-darkNavy hover:bg-brand-green/90"
                  >
                    Go to Client Management
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
