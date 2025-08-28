// Demo script showing how to use the Email Service with Resend
// This script provides examples of API calls and expected responses

const environmentVariablesRequired = {
  // Required for Resend integration
  RESEND_API_KEY: 're_xxxxxxxxxxxxxxxxxx', // Get from https://resend.com/api-keys
  
  // Email configuration
  FROM_EMAIL: 'protocols@yourpractice.com', // Must be verified in Resend
  FROM_NAME: 'Your Nutrition Practice',
  
  // Practice information
  PRACTICE_NAME: 'Functional Nutrition Practice',
  PRACTITIONER_NAME: 'Dr. Jane Smith',
  PRACTITIONER_EMAIL: 'jane@yourpractice.com',
  PRACTITIONER_PHONE: '+1-555-123-4567',
  
  // Optional branding
  PRACTICE_LOGO_URL: 'https://yourpractice.com/logo.png',
  PRACTICE_WEBSITE: 'https://yourpractice.com',
  PRIMARY_COLOR: '#10b981',
  
  // Email limits (optional)
  EMAIL_DAILY_LIMIT: '100',
  EMAIL_MONTHLY_LIMIT: '3000',
  EMAIL_TEST_MODE: 'true', // Set to 'false' for production
};

const emailRequestExamples = {
  // Basic protocol delivery email with PDF
  basicDelivery: {
    recipients: ["client@example.com"],
    includePDF: true,
    includeGreeting: true,
    includeSupplements: true,
    includeSchedule: true,
    customMessage: "Hi Sarah! I'm excited to share your personalized protocol. Please review the attached PDF and don't hesitate to reach out with any questions.",
  },

  // Follow-up reminder email
  reminderEmail: {
    recipients: ["client@example.com"],
    followUpType: 'reminder',
    daysOnProtocol: 7,
    customMessage: "Hope you're feeling great on your new protocol! Just checking in to see how the first week has gone.",
  },

  // Check-in email after some time
  checkInEmail: {
    recipients: ["client@example.com"],
    followUpType: 'check-in',
    daysOnProtocol: 30,
    customMessage: "You've been on your protocol for a month now. I'd love to hear about your progress and any changes you've noticed!",
  },

  // Protocol adjustment email
  adjustmentEmail: {
    recipients: ["client@example.com"],
    followUpType: 'adjustment',
    daysOnProtocol: 21,
    customMessage: "Based on your feedback, I've made some adjustments to your protocol. Please review the updated recommendations.",
  },

  // Multiple recipients (client + family)
  familyDelivery: {
    recipients: ["client@example.com"],
    additionalRecipients: ["spouse@example.com", "adult-child@example.com"],
    includePDF: true,
    customMessage: "Sharing your protocol with the family members you requested. Everyone is on board to support your health journey!",
  },

  // Email without PDF attachment
  noPdfEmail: {
    recipients: ["client@example.com"],
    includePDF: false,
    customMessage: "Quick follow-up about your protocol questions from our call. The detailed PDF will be sent separately.",
  },

  // Custom branding and practitioner info
  customBranding: {
    recipients: ["client@example.com"],
    includePDF: true,
    primaryColor: '#2563eb',
    practiceName: 'Elite Functional Health',
    practitionerName: 'Dr. Michael Johnson',
    practitionerEmail: 'michael@elitefunctional.com',
    practitionerPhone: '+1-555-987-6543',
    subject: 'Your Elite Functional Health Protocol',
    customMessage: "Welcome to Elite Functional Health! Your personalized protocol is designed specifically for your unique health profile.",
  },

  // Test mode email (won't actually send)
  testEmail: {
    recipients: ["test@example.com"],
    includePDF: true,
    testMode: true,
    customMessage: "This is a test email that won't actually be sent - perfect for development and testing.",
  },
};

const apiExamples = {
  // Example using curl
  curlBasicExample: `
# Send basic protocol email (replace [TOKEN] and [PROTOCOL_ID])
curl -X POST http://localhost:3000/api/protocols/[PROTOCOL_ID]/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer [TOKEN]" \\
  -d '${JSON.stringify(emailRequestExamples.basicDelivery, null, 2)}'
  `,

  curlFollowUpExample: `
# Send follow-up reminder email
curl -X POST http://localhost:3000/api/protocols/[PROTOCOL_ID]/email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer [TOKEN]" \\
  -d '${JSON.stringify(emailRequestExamples.reminderEmail, null, 2)}'
  `,

  // Example using fetch in JavaScript
  fetchExample: `
// Send protocol email using fetch
const response = await fetch(\`/api/protocols/\${protocolId}/email\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    recipients: ['client@example.com'],
    includePDF: true,
    includeGreeting: true,
    customMessage: 'Your personalized protocol is ready!',
  }),
});

const result = await response.json();
if (result.success) {
  console.log('Email sent successfully:', result.data.emailId);
  console.log('Delivery status:', result.data.status);
  console.log('PDF attached:', result.data.pdf.included);
} else {
  console.error('Email sending failed:', result.error);
}
  `,

  // React component example
  reactExample: `
// React component for sending protocol emails
const handleSendEmail = async (protocolId, emailType = 'delivery') => {
  setLoading(true);
  
  try {
    const requestBody = emailType === 'delivery' ? {
      recipients: [client.email],
      includePDF: true,
      includeGreeting: true,
      includeSupplements: true,
      includeSchedule: true,
      customMessage: customMessage,
    } : {
      recipients: [client.email],
      followUpType: emailType, // 'reminder', 'check-in', 'adjustment'
      daysOnProtocol: daysOnProtocol,
      customMessage: customMessage,
    };

    const response = await fetch(\`/api/protocols/\${protocolId}/email\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    if (result.success) {
      toast.success('Email sent successfully!', {
        description: \`Sent to \${result.data.delivery.recipientCount} recipient(s)\`,
      });
      
      // Update UI with delivery info
      setLastEmailSent({
        id: result.data.emailId,
        sentAt: result.data.delivery.sentAt,
        status: result.data.status,
        recipients: result.data.delivery.recipients,
      });
    } else {
      toast.error('Failed to send email', {
        description: result.error,
      });
    }
  } catch (error) {
    toast.error('Email sending error', {
      description: error.message,
    });
  } finally {
    setLoading(false);
  }
};
  `,
};

const expectedResponse = {
  success: true,
  data: {
    generationId: "gen_abc123xyz",
    emailId: "re_abc123xyz456", // Resend message ID
    trackingId: "protocol_xyz_client@example.com_1756340123456_abc123",
    status: "sent", // or "sending" in production
    message: "Protocol email sent successfully",
    
    delivery: {
      sentAt: "2025-08-28T12:34:56.789Z",
      recipients: ["client@example.com"],
      recipientCount: 1,
      subject: "Your Personalized Protocol: Digestive Health Protocol - John Doe",
      provider: "resend",
      deliveryStatus: "sent"
    },
    
    protocol: {
      id: "cmeunk5l40002v2exfz62uuv1",
      name: "Digestive Health Protocol",
      clientName: "John Doe",
      supplementCount: 4
    },
    
    pdf: {
      included: true,
      filename: "Digestive_Health_Protocol_John_Doe.pdf",
      size: "2.31 MB",
      pages: 3,
      source: "existing" // or "generated"
    },
    
    performance: {
      totalTime: 3456,
      emailSendTime: "2025-08-28T12:34:56.789Z",
      pdfGenerationIncluded: false
    }
  }
};

const resendDashboardInfo = {
  url: 'https://resend.com/emails',
  features: [
    'Email delivery tracking',
    'Bounce and spam reporting',
    'Open and click analytics',
    'Email templates management',
    'Domain verification',
    'Webhook configuration',
    'Usage analytics and billing'
  ]
};

console.log("📧 FNTP Email Service Integration Demo");
console.log("======================================");

console.log("\n🔧 Required Environment Variables:");
Object.entries(environmentVariablesRequired).forEach(([key, example]) => {
  console.log(`${key}=${example}`);
});

console.log("\n📝 Email Request Examples:");

console.log("\n1. Basic Protocol Delivery:");
console.log(JSON.stringify(emailRequestExamples.basicDelivery, null, 2));

console.log("\n2. Follow-up Reminder:");
console.log(JSON.stringify(emailRequestExamples.reminderEmail, null, 2));

console.log("\n3. Check-in Email:");
console.log(JSON.stringify(emailRequestExamples.checkInEmail, null, 2));

console.log("\n4. Multiple Recipients:");
console.log(JSON.stringify(emailRequestExamples.familyDelivery, null, 2));

console.log("\n5. Custom Branding:");
console.log(JSON.stringify(emailRequestExamples.customBranding, null, 2));

console.log("\n🔗 API Examples:");
console.log(apiExamples.curlBasicExample);
console.log(apiExamples.curlFollowUpExample);

console.log("\n💻 JavaScript Fetch Example:");
console.log(apiExamples.fetchExample);

console.log("\n⚛️  React Component Example:");
console.log(apiExamples.reactExample);

console.log("\n📊 Expected Response Structure:");
console.log(JSON.stringify(expectedResponse, null, 2));

console.log("\n📧 Email Service Features:");
console.log("✅ Professional HTML email templates with medical styling");
console.log("✅ Automatic PDF attachment from protocol generation");
console.log("✅ Multiple recipient support (client + family members)");
console.log("✅ Follow-up email types (reminder, check-in, adjustment)");
console.log("✅ Custom branding and practitioner information");
console.log("✅ Mobile-responsive email design");
console.log("✅ Email delivery tracking with Resend");
console.log("✅ Database tracking of all sent emails");
console.log("✅ Test mode for development and debugging");
console.log("✅ Integration with existing PDF generation service");
console.log("✅ Proper error handling and validation");
console.log("✅ Support for custom messages and personalization");

console.log("\n🎨 Email Template Features:");
console.log("✅ Green header matching PDF design (#10b981)");
console.log("✅ Protocol summary with key details");
console.log("✅ PDF attachment information and file details");
console.log("✅ Implementation instructions for clients");
console.log("✅ Practitioner contact information and branding");
console.log("✅ Professional medical disclaimer");
console.log("✅ Mobile-responsive design optimized for all devices");
console.log("✅ Resend-compatible HTML and CSS styling");

console.log("\n📈 Resend Dashboard Integration:");
console.log(`Dashboard URL: ${resendDashboardInfo.url}`);
console.log("Available features:");
resendDashboardInfo.features.forEach(feature => {
  console.log(`  • ${feature}`);
});

console.log("\n🚀 Getting Started:");
console.log("1. Sign up for Resend account at https://resend.com");
console.log("2. Verify your domain for sending emails");
console.log("3. Generate API key and add to environment variables");
console.log("4. Configure practice and practitioner information");
console.log("5. Test with EMAIL_TEST_MODE=true first");
console.log("6. Use the test protocol ID: cmeunk5l40002v2exfz62uuv1");
console.log("7. Monitor delivery in Resend dashboard");
console.log("8. Check database tracking in ProtocolGeneration table");

console.log("\n📁 Email Delivery Workflow:");
console.log("1. 📋 Protocol Created → Client assessment complete");
console.log("2. 🤖 Analysis Generated → Claude provides recommendations");
console.log("3. 💊 Protocol Built → Supplements and schedule defined");
console.log("4. 📄 PDF Generated → Professional protocol document created");
console.log("5. 📧 Email Sent → Client receives branded email with PDF");
console.log("6. 📊 Delivery Tracked → Status updates via Resend webhooks");
console.log("7. 🔄 Follow-ups → Automated reminders and check-ins");

console.log("\n⚠️  Production Checklist:");
console.log("✅ Domain verified in Resend");
console.log("✅ FROM_EMAIL using verified domain");
console.log("✅ EMAIL_TEST_MODE set to 'false'");
console.log("✅ All practitioner information configured");
console.log("✅ Practice branding (logo, colors) set up");
console.log("✅ Daily/monthly email limits appropriate");
console.log("✅ Webhook endpoints configured (optional)");
console.log("✅ Error handling and monitoring in place");

console.log("\n🎉 Email Service is ready for production use!");
console.log("Complete Protocol Development Workflow: Analysis → Protocol → PDF → Email → Delivery ✅");
