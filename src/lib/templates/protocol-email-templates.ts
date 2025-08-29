import { format } from 'date-fns';
import { type ProtocolEmailData } from '../utils/email-helpers';

/**
 * Base email styles for Resend compatibility
 */
const baseStyles = `
<style>
  /* Email-safe CSS reset */
  body, table, td, p, a, li, blockquote {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  
  table, td {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  
  img {
    -ms-interpolation-mode: bicubic;
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
  }
  
  /* Base styles */
  body {
    margin: 0 !important;
    padding: 0 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
    background-color: #f3f4f6;
  }
  
  /* Container */
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  
  /* Header */
  .header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    text-align: center;
    padding: 40px 20px;
  }
  
  .logo {
    max-width: 200px;
    height: auto;
    margin-bottom: 20px;
  }
  
  .practice-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: 1px;
  }
  
  .tagline {
    font-size: 16px;
    margin: 0;
    opacity: 0.9;
  }
  
  /* Content */
  .content {
    padding: 40px 30px;
  }
  
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 20px 0;
  }
  
  .protocol-title {
    font-size: 24px;
    font-weight: 700;
    color: #10b981;
    margin: 0 0 8px 0;
  }
  
  .protocol-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 30px 0;
  }
  
  /* Protocol summary card */
  .protocol-summary {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #10b981;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .summary-row:last-child {
    border-bottom: none;
  }
  
  .summary-label {
    font-weight: 600;
    color: #374151;
  }
  
  .summary-value {
    color: #6b7280;
  }
  
  /* Attachment info */
  .attachment-info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
    text-align: center;
  }
  
  .attachment-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .attachment-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e40af;
    margin: 0 0 8px 0;
  }
  
  .attachment-details {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
  
  /* Instructions */
  .instructions {
    background: #fef7cd;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
  }
  
  .instructions-title {
    font-size: 18px;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
  }
  
  .instructions-icon {
    margin-right: 8px;
    font-size: 20px;
  }
  
  .instructions-list {
    margin: 0;
    padding-left: 20px;
    color: #78350f;
  }
  
  .instructions-list li {
    margin-bottom: 8px;
  }
  
  /* Custom message */
  .custom-message {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
    font-style: italic;
  }
  
  .custom-message-title {
    font-weight: 600;
    color: #166534;
    margin: 0 0 12px 0;
  }
  
  .custom-message-content {
    color: #15803d;
    line-height: 1.6;
    margin: 0;
  }
  
  /* CTA Button */
  .cta-container {
    text-align: center;
    margin: 40px 0;
  }
  
  .cta-button {
    display: inline-block;
    background: #10b981;
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    padding: 16px 32px;
    border-radius: 8px;
    margin: 0 10px 10px 0;
    transition: background-color 0.3s ease;
  }
  
  .cta-button:hover {
    background: #059669;
  }
  
  .cta-button.secondary {
    background: #6b7280;
  }
  
  .cta-button.secondary:hover {
    background: #4b5563;
  }
  
  /* Footer */
  .footer {
    background: #f9fafb;
    padding: 40px 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  
  .contact-info {
    margin-bottom: 20px;
  }
  
  .contact-item {
    display: inline-block;
    margin: 0 15px 8px 0;
    font-size: 14px;
    color: #6b7280;
  }
  
  .contact-link {
    color: #10b981;
    text-decoration: none;
  }
  
  .contact-link:hover {
    text-decoration: underline;
  }
  
  .disclaimer {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.5;
    margin: 20px 0 0 0;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }
  
  .unsubscribe {
    font-size: 12px;
    color: #9ca3af;
    margin: 10px 0 0 0;
  }
  
  .unsubscribe a {
    color: #6b7280;
    text-decoration: underline;
  }
  
  /* Mobile responsive */
  @media only screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
      max-width: 100% !important;
    }
    
    .content {
      padding: 20px !important;
    }
    
    .header {
      padding: 30px 20px !important;
    }
    
    .practice-name {
      font-size: 20px !important;
    }
    
    .protocol-title {
      font-size: 20px !important;
    }
    
    .summary-row {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .cta-button {
      display: block;
      width: 100%;
      margin: 10px 0;
    }
    
    .contact-item {
      display: block;
      margin: 0 0 8px 0;
    }
  }
</style>
`;

/**
 * Generate the main protocol delivery email template
 */
export function generateProtocolDeliveryEmail(data: ProtocolEmailData): string {
  const {
    client,
    protocol,
    practitioner,
    customMessage,
    attachments,
    brandingConfig,
  } = data;

  const practiceName =
    brandingConfig?.practiceName || 'FNTP Nutrition Practice';
  const primaryColor = brandingConfig?.primaryColor || '#10b981';
  const logoUrl = brandingConfig?.logoUrl;

  const clientFullName = `${client.firstName} ${client.lastName}`;
  const protocolPhase = protocol.phase ? ` - ${protocol.phase}` : '';
  const startDateText = protocol.startDate
    ? format(protocol.startDate, 'MMMM d, yyyy')
    : 'As discussed';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Protocol: ${protocol.name}</title>
  ${baseStyles.replace(/#10b981/g, primaryColor)}
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${practiceName}" class="logo" />` : ''}
      <div class="practice-name">${practiceName}</div>
      <div class="tagline">Functional Health & Nutrition</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">Hello ${client.firstName}! 👋</div>
      
      <p>I'm excited to share your personalized functional nutrition protocol. This comprehensive plan has been carefully crafted based on your unique health assessment and goals.</p>

      <div class="protocol-title">${protocol.name}${protocolPhase}</div>
      <div class="protocol-subtitle">Your personalized functional nutrition protocol</div>

      <!-- Protocol Summary -->
      <div class="protocol-summary">
        <div class="summary-row">
          <span class="summary-label">📋 Protocol Status</span>
          <span class="summary-value">${protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1)}</span>
        </div>
        
        <div class="summary-row">
          <span class="summary-label">💊 Priority Supplements</span>
          <span class="summary-value">${protocol.supplementCount} recommendations</span>
        </div>
        
        ${
          protocol.duration
            ? `
          <div class="summary-row">
            <span class="summary-label">⏱️ Duration</span>
            <span class="summary-value">${protocol.duration} weeks</span>
          </div>
        `
            : ''
        }
        
        <div class="summary-row">
          <span class="summary-label">🗓️ Start Date</span>
          <span class="summary-value">${startDateText}</span>
        </div>
      </div>

      <!-- PDF Attachment Info -->
      ${
        attachments
          ? `
        <div class="attachment-info">
          <div class="attachment-icon">📄</div>
          <div class="attachment-title">Your Complete Protocol</div>
          <div class="attachment-details">
            ${attachments.pdfFilename} • ${attachments.pdfSize} • ${attachments.pdfPages} pages
          </div>
        </div>
      `
          : ''
      }

      <!-- Implementation Instructions -->
      <div class="instructions">
        <div class="instructions-title">
          <span class="instructions-icon">📋</span>
          Implementation Guide
        </div>
        <ul class="instructions-list">
          <li><strong>Download and review</strong> your complete protocol PDF attachment</li>
          <li><strong>Start gradually</strong> - begin with priority supplements and build up</li>
          <li><strong>Follow the daily schedule</strong> for optimal timing and absorption</li>
          <li><strong>Track your progress</strong> and note any changes or concerns</li>
          <li><strong>Stay in touch</strong> - don't hesitate to reach out with questions</li>
        </ul>
      </div>

      <!-- Custom Message -->
      ${
        customMessage
          ? `
        <div class="custom-message">
          <div class="custom-message-title">Personal Message from ${practitioner.name}</div>
          <div class="custom-message-content">${customMessage.replace(/\n/g, '<br>')}</div>
        </div>
      `
          : ''
      }

      <p>Remember, this protocol is specifically designed for your unique needs. Please review the complete document for detailed instructions, timing, and important considerations.</p>

      <p>Your health journey is important to me, and I'm here to support you every step of the way. If you have any questions about your protocol or experience any concerns, please don't hesitate to reach out.</p>

      <p>To your health and vitality!</p>
      
      <p><strong>${practitioner.name}</strong><br>
      ${practitioner.title ? `${practitioner.title}<br>` : ''}
      ${practiceName}</p>

      <!-- Call-to-Action Buttons -->
      <div class="cta-container">
        ${
          practitioner.email
            ? `
          <a href="mailto:${practitioner.email}?subject=Question about ${protocol.name}" class="cta-button">
            📧 Ask a Question
          </a>
        `
            : ''
        }
        ${
          practitioner.phone
            ? `
          <a href="tel:${practitioner.phone}" class="cta-button secondary">
            📞 Call Practice
          </a>
        `
            : ''
        }
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="contact-info">
        ${
          practitioner.email
            ? `
          <div class="contact-item">
            📧 <a href="mailto:${practitioner.email}" class="contact-link">${practitioner.email}</a>
          </div>
        `
            : ''
        }
        
        ${
          practitioner.phone
            ? `
          <div class="contact-item">
            📞 <a href="tel:${practitioner.phone}" class="contact-link">${practitioner.phone}</a>
          </div>
        `
            : ''
        }
        
        ${
          process.env.PRACTICE_WEBSITE
            ? `
          <div class="contact-item">
            🌐 <a href="${process.env.PRACTICE_WEBSITE}" class="contact-link">Visit Website</a>
          </div>
        `
            : ''
        }
      </div>

      <div class="disclaimer">
        <p><strong>Important:</strong> This protocol is for educational purposes and should not replace professional medical advice. Please consult with your healthcare provider before making any significant changes to your supplement regimen or health routine. Individual results may vary.</p>
        
        <p>This personalized protocol was generated on ${format(new Date(), 'MMMM d, yyyy')} specifically for ${clientFullName}. Please do not share this protocol with others as it is designed for your unique health profile.</p>
      </div>

      <div class="unsubscribe">
        <p>You received this email because you requested your personalized protocol from ${practiceName}.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate a follow-up email template
 */
export function generateProtocolFollowUpEmail(
  data: ProtocolEmailData & {
    followUpType: 'reminder' | 'check-in' | 'adjustment';
    daysOnProtocol?: number;
  }
): string {
  const { client, protocol, practitioner, followUpType, daysOnProtocol } = data;
  const clientFullName = `${client.firstName} ${client.lastName}`;

  const followUpContent = {
    reminder: {
      subject: `Friendly Reminder: Your ${protocol.name} Protocol`,
      title: 'Protocol Reminder',
      icon: '⏰',
      message: `This is a friendly reminder about your ${protocol.name} protocol. I hope you're feeling great and making progress!`,
    },
    'check-in': {
      subject: `How are you feeling? ${protocol.name} Check-in`,
      title: 'Protocol Check-in',
      icon: '💚',
      message: `${daysOnProtocol ? `You've been on your protocol for ${daysOnProtocol} days now.` : ''} I'd love to hear how you're feeling and address any questions you might have.`,
    },
    adjustment: {
      subject: `Protocol Updates: ${protocol.name}`,
      title: 'Protocol Adjustment',
      icon: '🔄',
      message: `Based on your progress and feedback, I've made some adjustments to your protocol. Please review the updated recommendations.`,
    },
  };

  const content = followUpContent[followUpType];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="practice-name">${data.brandingConfig?.practiceName || 'FNTP Nutrition Practice'}</div>
      <div class="tagline">${content.title}</div>
    </div>

    <div class="content">
      <div class="greeting">Hi ${client.firstName}! ${content.icon}</div>
      
      <p>${content.message}</p>

      <div class="protocol-summary">
        <div class="summary-row">
          <span class="summary-label">Your Protocol</span>
          <span class="summary-value">${protocol.name}</span>
        </div>
        ${
          daysOnProtocol
            ? `
          <div class="summary-row">
            <span class="summary-label">Days on Protocol</span>
            <span class="summary-value">${daysOnProtocol}</span>
          </div>
        `
            : ''
        }
      </div>

      <p>Your health journey is unique, and I want to ensure you're getting the most out of your personalized protocol. Please don't hesitate to reach out if you have any questions, concerns, or would like to share how you're feeling.</p>

      <p>Looking forward to hearing from you!</p>
      
      <p><strong>${practitioner.name}</strong></p>

      <div class="cta-container">
        <a href="mailto:${practitioner.email}?subject=Protocol Update - ${clientFullName}" class="cta-button">
          📧 Send Update
        </a>
      </div>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>This follow-up email is part of your personalized care from ${data.brandingConfig?.practiceName || 'FNTP Nutrition Practice'}.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate a simple text-only version for email clients that don't support HTML
 */
export function generateProtocolDeliveryTextEmail(
  data: ProtocolEmailData
): string {
  const { client, protocol, practitioner, customMessage, attachments } = data;
  const clientFullName = `${client.firstName} ${client.lastName}`;
  const practiceName =
    data.brandingConfig?.practiceName || 'FNTP Nutrition Practice';

  return `
Hello ${client.firstName}!

I'm excited to share your personalized functional nutrition protocol: ${protocol.name}

PROTOCOL SUMMARY:
- Status: ${protocol.status}
- Supplements: ${protocol.supplementCount} priority recommendations
${protocol.duration ? `- Duration: ${protocol.duration} weeks` : ''}
${protocol.startDate ? `- Start Date: ${format(protocol.startDate, 'MMMM d, yyyy')}` : ''}

${
  attachments
    ? `
ATTACHMENT:
Your complete protocol document is attached: ${attachments.pdfFilename} (${attachments.pdfSize}, ${attachments.pdfPages} pages)
`
    : ''
}

IMPLEMENTATION GUIDE:
1. Download and review your complete protocol PDF attachment
2. Start gradually - begin with priority supplements and build up
3. Follow the daily schedule for optimal timing and absorption
4. Track your progress and note any changes or concerns
5. Stay in touch - don't hesitate to reach out with questions

${
  customMessage
    ? `
PERSONAL MESSAGE:
${customMessage}
`
    : ''
}

Remember, this protocol is specifically designed for your unique needs. Please review the complete document for detailed instructions, timing, and important considerations.

Your health journey is important to me, and I'm here to support you every step of the way. If you have any questions about your protocol or experience any concerns, please don't hesitate to reach out.

To your health and vitality!

${practitioner.name}
${practitioner.title ? practitioner.title : ''}
${practiceName}

${practitioner.email ? `Email: ${practitioner.email}` : ''}
${practitioner.phone ? `Phone: ${practitioner.phone}` : ''}

---
IMPORTANT: This protocol is for educational purposes and should not replace professional medical advice. Please consult with your healthcare provider before making any significant changes to your supplement regimen or health routine.

This personalized protocol was generated on ${format(new Date(), 'MMMM d, yyyy')} specifically for ${clientFullName}.
  `.trim();
}

/**
 * Generate email preview text for better inbox display
 */
export function generateEmailPreview(
  protocolName: string,
  supplementCount: number
): string {
  return `Your personalized ${protocolName} with ${supplementCount} priority supplements is ready for download and implementation.`;
}

/**
 * Validate email template data
 */
export function validateEmailTemplateData(data: ProtocolEmailData): string[] {
  const errors: string[] = [];

  if (!data.client?.firstName) {
    errors.push('Client first name is required');
  }

  if (!data.client?.lastName) {
    errors.push('Client last name is required');
  }

  if (!data.client?.email) {
    errors.push('Client email is required');
  }

  if (!data.protocol?.name) {
    errors.push('Protocol name is required');
  }

  if (!data.practitioner?.name) {
    errors.push('Practitioner name is required');
  }

  if (
    data.protocol?.supplementCount === undefined ||
    data.protocol.supplementCount < 0
  ) {
    errors.push('Valid supplement count is required');
  }

  return errors;
}
