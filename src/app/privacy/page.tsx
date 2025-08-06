export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none">
        <p className="mb-4">
          Your privacy is important to us. This policy explains how we collect, use, 
          and protect your information.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Client health information and lab results</li>
          <li>Practitioner account information</li>
          <li>Usage data to improve our services</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide lab analysis services</li>
          <li>To generate health protocols</li>
          <li>To improve our AI analysis capabilities</li>
          <li>To communicate with practitioners</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Data Security</h2>
        <p className="mb-4">
          We use industry-standard encryption and security measures to protect your data.
          All data is stored on secure servers with regular backups.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Your Rights</h2>
        <p className="mb-4">
          You have the right to access, correct, or delete your personal information.
          Contact us at privacy@nutritionlabsystem.com for any privacy concerns.
        </p>
        
        <p className="mt-8 text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}