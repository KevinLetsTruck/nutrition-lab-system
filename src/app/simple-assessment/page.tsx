import { SimpleAssessmentForm } from "@/components/simple-assessment/SimpleAssessmentForm";
import { AssessmentErrorBoundary } from "@/components/simple-assessment/AssessmentErrorBoundary";

export default function SimpleAssessmentPage() {
  // In a real app, get this from auth or URL params
  // For testing, use the test client ID from our database
  const clientId = "cmeqhcsr30005v2ot9m97ljko"; // Test User client ID

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Health Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Answer 80 quick questions to get your personalized health insights
          </p>
        </div>

        <AssessmentErrorBoundary>
          <SimpleAssessmentForm clientId={clientId} />
        </AssessmentErrorBoundary>
      </div>
    </div>
  );
}
