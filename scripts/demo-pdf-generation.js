// Demo script showing how to test the PDF generation API
// This script provides examples of API calls and expected responses

const testData = {
  // Basic PDF generation request
  basicRequest: {
    paperSize: 'A4',
    includeGreeting: true,
    includeSupplements: true,
    includeSchedule: true,
    theme: 'professional',
    primaryColor: '#10b981',
  },

  // Advanced PDF generation with custom branding
  customRequest: {
    paperSize: 'Letter',
    includeGreeting: true,
    includeSupplements: true,
    includeDietaryGuidelines: true,
    includeLifestyleModifications: true,
    includeSchedule: true,
    theme: 'professional',
    primaryColor: '#2563eb',
    logoUrl: 'https://example.com/logo.png',
    includeClinicLogo: true,
  },

  // Minimal PDF (supplements only)
  minimalRequest: {
    paperSize: 'A4',
    includeGreeting: false,
    includeSupplements: true,
    includeSchedule: false,
    theme: 'professional',
  },
};

const apiExamples = {
  // Example using curl
  curlExample: `
# Generate PDF for protocol (replace [TOKEN] and [PROTOCOL_ID])
curl -X POST http://localhost:3000/api/protocols/[PROTOCOL_ID]/generate-pdf \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer [TOKEN]" \\
  -d '${JSON.stringify(testData.basicRequest, null, 2)}'
  `,

  // Example using fetch in JavaScript
  fetchExample: `
// Generate PDF using fetch
const response = await fetch(\`/api/protocols/\${protocolId}/generate-pdf\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`,
  },
  body: JSON.stringify(${JSON.stringify(testData.basicRequest, null, 2)}),
});

const result = await response.json();
if (result.success) {
  console.log('PDF generated:', result.data.file.url);
  // Download or display the PDF
  window.open(result.data.download.url, '_blank');
} else {
  console.error('PDF generation failed:', result.error);
}`,

  // Example React component usage
  reactExample: `
// React component for PDF generation
const handleGeneratePDF = async (protocolId) => {
  setGenerating(true);
  try {
    const response = await fetch(\`/api/protocols/\${protocolId}/generate-pdf\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
      body: JSON.stringify({
        paperSize: 'A4',
        includeGreeting: true,
        includeSupplements: true,
        includeSchedule: true,
        primaryColor: '#10b981',
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      toast.success('PDF generated successfully', {
        description: \`\${result.data.file.sizeFormatted} • \${result.data.file.pages} pages\`,
      });
      
      // Open PDF in new tab
      window.open(result.data.download.url, '_blank');
    } else {
      toast.error('Failed to generate PDF', {
        description: result.error,
      });
    }
  } catch (error) {
    toast.error('PDF generation error', {
      description: error.message,
    });
  } finally {
    setGenerating(false);
  }
};`,
};

const expectedResponse = {
  success: true,
  data: {
    generationId: "gen_abc123",
    pdfUrl: "/generated-pdfs/protocol_xyz_2025-08-28T12-34-56-789Z.pdf",
    status: "generated",
    message: "PDF generation completed successfully",
    
    file: {
      filename: "Digestive_Health_Protocol_Protocol_Test.pdf",
      url: "/generated-pdfs/protocol_xyz_2025-08-28T12-34-56-789Z.pdf",
      size: 2419200,
      sizeFormatted: "2.31 MB",
      pages: 3,
      generatedAt: "2025-08-28T12:34:56.789Z"
    },
    
    protocol: {
      id: "cmeunk5l40002v2exfz62uuv1",
      name: "Digestive Health Protocol",
      clientName: "Protocol Test",
      supplementCount: 4
    },
    
    performance: {
      generationTime: 2345,
      totalTime: 2456,
      templateSize: 45678,
      pdfSize: 2419200
    },
    
    download: {
      url: "/generated-pdfs/protocol_xyz_2025-08-28T12-34-56-789Z.pdf",
      filename: "Digestive_Health_Protocol_Protocol_Test.pdf",
      contentType: "application/pdf",
      disposition: "inline"
    }
  }
};

console.log("🎯 FNTP PDF Generation Service Demo");
console.log("=====================================");

console.log("\n📋 Available Request Options:");
console.log("- paperSize: 'A4' | 'Letter'");
console.log("- includeGreeting: boolean");
console.log("- includeSupplements: boolean");
console.log("- includeDietaryGuidelines: boolean");
console.log("- includeLifestyleModifications: boolean");
console.log("- includeSchedule: boolean");
console.log("- theme: 'professional' (default)");
console.log("- primaryColor: hex color (default: '#10b981')");
console.log("- logoUrl: string (optional)");
console.log("- includeClinicLogo: boolean");
console.log("- filename: string (optional, auto-generated if not provided)");

console.log("\n📝 Example Request Bodies:");
console.log("\n1. Basic Request:");
console.log(JSON.stringify(testData.basicRequest, null, 2));

console.log("\n2. Custom Branding:");
console.log(JSON.stringify(testData.customRequest, null, 2));

console.log("\n3. Minimal PDF:");
console.log(JSON.stringify(testData.minimalRequest, null, 2));

console.log("\n🔗 API Examples:");
console.log(apiExamples.curlExample);

console.log("\n💻 JavaScript Fetch Example:");
console.log(apiExamples.fetchExample);

console.log("\n⚛️  React Component Example:");
console.log(apiExamples.reactExample);

console.log("\n📊 Expected Response Structure:");
console.log(JSON.stringify(expectedResponse, null, 2));

console.log("\n🎨 PDF Design Features:");
console.log("✅ Green sidebar (#10b981) with vertical 'FUNCTIONAL HEALTH' text");
console.log("✅ Professional medical document styling");
console.log("✅ Client name and protocol title in header");
console.log("✅ Status badges and metadata display");
console.log("✅ Priority supplement cards with detailed information");
console.log("✅ Daily schedule with time-based organization");
console.log("✅ Clinical focus and greeting sections");
console.log("✅ Protocol notes and current status");
console.log("✅ Analysis reference linking (if available)");
console.log("✅ Footer with generation date and personalization");
console.log("✅ Page counting and print optimization");
console.log("✅ Responsive design for A4/Letter paper sizes");

console.log("\n🚀 Ready to Test!");
console.log("1. Start your development server: npm run dev");
console.log("2. Get an authentication token from your login");
console.log("3. Use the test protocol ID: cmeunk5l40002v2exfz62uuv1");
console.log("4. Make a POST request to generate PDF");
console.log("5. Check the generated PDF in ./public/generated-pdfs/");

console.log("\n📁 Generated PDFs are stored in:");
console.log("- Local: ./public/generated-pdfs/");
console.log("- S3: protocols/ folder (if AWS configured)");
console.log("- Database: Tracked in ProtocolGeneration table");

console.log("\n🎉 PDF Generation Service is ready for production use!");
