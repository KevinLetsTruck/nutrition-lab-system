import fs from 'fs/promises';
import path from 'path';

// Email configuration interface
export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  practiceName: string;
  practicePhone?: string;
  practiceWebsite?: string;
  logoUrl?: string;
  primaryColor: string;
  supportEmail?: string;
}

// Email recipient interface
export interface EmailRecipient {
  email: string;
  name?: string;
  relationship?: 'client' | 'family' | 'practitioner' | 'other';
}

// Email attachment interface
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  disposition?: 'attachment' | 'inline';
}

// Email delivery status
export type EmailDeliveryStatus =
  | 'pending'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'failed'
  | 'complained'
  | 'unsubscribed';

// Email template data interface
export interface ProtocolEmailData {
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  protocol: {
    id: string;
    name: string;
    phase?: string;
    status: string;
    supplementCount: number;
    duration?: number;
    startDate?: Date;
  };
  practitioner: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
  };
  customMessage?: string;
  attachments?: {
    pdfFilename: string;
    pdfSize: string;
    pdfPages: number;
  };
  brandingConfig?: {
    primaryColor?: string;
    logoUrl?: string;
    practiceName?: string;
  };
}

/**
 * Get email configuration from environment variables
 */
export function getEmailConfig(): EmailConfig {
  return {
    fromEmail: process.env.FROM_EMAIL || 'protocols@fntp-nutrition.com',
    fromName: process.env.FROM_NAME || 'FNTP Nutrition Practice',
    replyTo: process.env.REPLY_TO_EMAIL,
    practiceName: process.env.PRACTICE_NAME || 'FNTP Nutrition Practice',
    practicePhone: process.env.PRACTICE_PHONE,
    practiceWebsite: process.env.PRACTICE_WEBSITE,
    logoUrl: process.env.PRACTICE_LOGO_URL,
    primaryColor: process.env.PRIMARY_COLOR || '#10b981',
    supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL,
  };
}

/**
 * Validate email address using basic regex
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate and clean email recipients
 */
export function validateAndCleanRecipients(
  recipients: (string | EmailRecipient)[]
): EmailRecipient[] {
  const cleanedRecipients: EmailRecipient[] = [];

  for (const recipient of recipients) {
    let email: string;
    let name: string | undefined;
    let relationship: EmailRecipient['relationship'] = 'other';

    if (typeof recipient === 'string') {
      email = recipient.trim();
    } else {
      email = recipient.email.trim();
      name = recipient.name?.trim();
      relationship = recipient.relationship || 'other';
    }

    if (validateEmail(email)) {
      // Check for duplicates
      if (
        !cleanedRecipients.some(
          r => r.email.toLowerCase() === email.toLowerCase()
        )
      ) {
        cleanedRecipients.push({
          email: email.toLowerCase(),
          name,
          relationship,
        });
      }
    }
  }

  return cleanedRecipients;
}

/**
 * Format recipient name for display
 */
export function formatRecipientName(recipient: EmailRecipient): string {
  if (recipient.name) {
    return `${recipient.name} <${recipient.email}>`;
  }
  return recipient.email;
}

/**
 * Generate email subject line
 */
export function generateEmailSubject(
  protocolName: string,
  clientName: string,
  customSubject?: string
): string {
  if (customSubject) {
    return customSubject;
  }

  return `Your Personalized Protocol: ${protocolName} - ${clientName}`;
}

/**
 * Create PDF attachment from file buffer
 */
export async function createPDFAttachment(
  pdfBuffer: Buffer,
  filename: string
): Promise<EmailAttachment> {
  return {
    filename,
    content: pdfBuffer,
    contentType: 'application/pdf',
    disposition: 'attachment',
  };
}

/**
 * Read PDF file and create attachment
 */
export async function createPDFAttachmentFromFile(
  filePath: string,
  filename?: string
): Promise<EmailAttachment> {
  const buffer = await fs.readFile(filePath);
  const attachmentFilename = filename || path.basename(filePath);

  return createPDFAttachment(buffer, attachmentFilename);
}

/**
 * Format file size for email display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate unique email tracking ID
 */
export function generateEmailTrackingId(
  protocolId: string,
  clientId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `protocol_${protocolId}_${clientId}_${timestamp}_${random}`;
}

/**
 * Extract domain from email address
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

/**
 * Categorize email by domain (for analytics)
 */
export function categorizeEmailDomain(
  email: string
): 'personal' | 'business' | 'medical' | 'other' {
  const domain = extractEmailDomain(email);

  // Personal email providers
  const personalDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com',
    'live.com',
    'msn.com',
  ];

  // Medical/healthcare domains
  const medicalDomains = ['.health', '.medical', '.clinic', '.hospital', '.md'];

  if (personalDomains.includes(domain)) {
    return 'personal';
  }

  if (medicalDomains.some(medDomain => domain.includes(medDomain))) {
    return 'medical';
  }

  // Business domains (non-personal, non-medical)
  if (domain && !personalDomains.includes(domain)) {
    return 'business';
  }

  return 'other';
}

/**
 * Create email preview text
 */
export function generateEmailPreviewText(
  protocolName: string,
  supplementCount: number
): string {
  return `Your ${protocolName} includes ${supplementCount} prioritized supplements and detailed implementation guidance.`;
}

/**
 * Sanitize HTML content for email
 */
export function sanitizeHtmlForEmail(html: string): string {
  // Basic HTML sanitization for email compatibility
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove internal styles
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .trim();
}

/**
 * Generate unsubscribe link
 */
export function generateUnsubscribeLink(
  clientEmail: string,
  trackingId: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const encodedEmail = encodeURIComponent(clientEmail);
  return `${baseUrl}/unsubscribe?email=${encodedEmail}&id=${trackingId}`;
}

/**
 * Create email metadata for database storage
 */
export function createEmailMetadata(
  recipients: EmailRecipient[],
  subject: string,
  trackingId: string,
  attachments: EmailAttachment[] = []
): Record<string, any> {
  return {
    trackingId,
    subject,
    recipientCount: recipients.length,
    recipients: recipients.map(r => ({
      email: r.email,
      name: r.name,
      relationship: r.relationship,
      domain: extractEmailDomain(r.email),
      domainCategory: categorizeEmailDomain(r.email),
    })),
    attachments: attachments.map(a => ({
      filename: a.filename,
      contentType: a.contentType,
      size: a.content.length,
    })),
    sentAt: new Date().toISOString(),
    emailProvider: 'resend',
  };
}

/**
 * Parse Resend webhook payload
 */
export function parseResendWebhookPayload(payload: any): {
  messageId: string;
  eventType: EmailDeliveryStatus;
  timestamp: Date;
  email?: string;
  reason?: string;
} | null {
  try {
    if (!payload || !payload.type || !payload.data) {
      return null;
    }

    const eventTypeMapping: Record<string, EmailDeliveryStatus> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'pending',
      'email.complained': 'complained',
      'email.bounced': 'bounced',
      'email.clicked': 'delivered', // Consider clicked as delivered
      'email.opened': 'delivered', // Consider opened as delivered
    };

    const eventType = eventTypeMapping[payload.type];
    if (!eventType) {
      return null;
    }

    return {
      messageId: payload.data.message_id || payload.data.email_id,
      eventType,
      timestamp: new Date(
        payload.created_at || payload.timestamp || Date.now()
      ),
      email: payload.data.to || payload.data.email,
      reason: payload.data.reason || payload.data.error,
    };
  } catch (error) {
    console.error('Error parsing Resend webhook payload:', error);
    return null;
  }
}

/**
 * Format email delivery status for display
 */
export function formatDeliveryStatus(status: EmailDeliveryStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statusMap = {
    pending: { label: 'Pending', color: 'gray', icon: '⏳' },
    sending: { label: 'Sending', color: 'blue', icon: '📤' },
    sent: { label: 'Sent', color: 'green', icon: '✅' },
    delivered: { label: 'Delivered', color: 'green', icon: '📬' },
    bounced: { label: 'Bounced', color: 'red', icon: '❌' },
    failed: { label: 'Failed', color: 'red', icon: '⚠️' },
    complained: { label: 'Complained', color: 'orange', icon: '🚨' },
    unsubscribed: { label: 'Unsubscribed', color: 'gray', icon: '🚫' },
  };

  return statusMap[status] || statusMap.pending;
}

/**
 * Validate Resend API key format
 */
export function validateResendApiKey(apiKey?: string): boolean {
  if (!apiKey) return false;

  // Resend API keys start with 're_' followed by alphanumeric characters
  return /^re_[a-zA-Z0-9]+$/.test(apiKey);
}

/**
 * Get email sending limits and quotas
 */
export function getEmailLimits(): {
  dailyLimit: number;
  monthlyLimit: number;
  attachmentSizeLimit: number;
  recipientLimit: number;
} {
  return {
    dailyLimit: parseInt(process.env.EMAIL_DAILY_LIMIT || '100'),
    monthlyLimit: parseInt(process.env.EMAIL_MONTHLY_LIMIT || '3000'),
    attachmentSizeLimit: 25 * 1024 * 1024, // 25MB
    recipientLimit: 50, // Max recipients per email
  };
}

/**
 * Check if email sending is within limits
 */
export function checkEmailLimits(
  recipientCount: number,
  attachmentSizes: number[],
  dailySent: number = 0,
  monthlySent: number = 0
): {
  isValid: boolean;
  errors: string[];
} {
  const limits = getEmailLimits();
  const errors: string[] = [];

  if (recipientCount > limits.recipientLimit) {
    errors.push(
      `Too many recipients (${recipientCount}). Maximum allowed: ${limits.recipientLimit}`
    );
  }

  if (dailySent >= limits.dailyLimit) {
    errors.push(`Daily email limit reached (${limits.dailyLimit})`);
  }

  if (monthlySent >= limits.monthlyLimit) {
    errors.push(`Monthly email limit reached (${limits.monthlyLimit})`);
  }

  const totalAttachmentSize = attachmentSizes.reduce(
    (sum, size) => sum + size,
    0
  );
  if (totalAttachmentSize > limits.attachmentSizeLimit) {
    errors.push(
      `Attachment size too large (${formatFileSize(totalAttachmentSize)}). Maximum: ${formatFileSize(limits.attachmentSizeLimit)}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
