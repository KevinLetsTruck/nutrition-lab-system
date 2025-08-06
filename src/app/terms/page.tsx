export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-gray max-w-none">
        <p className="mb-4">
          Welcome to Nutrition Lab System. By using our service, you agree to these terms.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Service Description</h2>
        <p className="mb-4">
          Nutrition Lab System provides lab analysis and health protocol generation services
          for Functional Nutritional Therapy Practitioners.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Privacy & Data</h2>
        <p className="mb-4">
          We take your privacy seriously. All client data is encrypted and stored securely.
          We do not share your data with third parties.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Usage</h2>
        <p className="mb-4">
          This system is intended for use by qualified healthcare practitioners only.
          The information provided is not a substitute for professional medical advice.
        </p>
        
        <p className="mt-8 text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}