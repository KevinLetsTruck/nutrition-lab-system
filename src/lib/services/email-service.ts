import { Resend } from 'resend';
import {
  getEmailConfig,
  validateAndCleanRecipients,
  generateEmailSubject,
  generateEmailTrackingId,
  createEmailMetadata,
  validateResendApiKey,
  checkEmailLimits,
  type EmailRecipient,
  type EmailAttachment,
  type ProtocolEmailData,
  type EmailDeliveryStatus
} from '../utils/email-helpers';
import {
  generateProtocolDeliveryEmail,
  generateProtocolDeliveryTextEmail,
  generateProtocolFollowUpEmail,
  generateEmailPreview,
  validateEmailTemplateData
} from '../templates/protocol-email-templates';

// Email sending request interface
export interface EmailSendRequest {
  recipients: (string | EmailRecipient)[];
  subject?: string;
  templateData: ProtocolEmailData;
  attachments?: EmailAttachment[];
  customMessage?: string;
  trackingId?: string;
  replyTo?: string;
  testMode?: boolean;
}

// Email sending result interface
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  trackingId: string;
  recipientCount: number;
  error?: string;
  deliveryStatus: EmailDeliveryStatus;
  metadata?: {
    subject: string;
    emailProvider: string;
    sentAt: Date;
    attachmentCount: number;
    totalSize: number;
  };
}

// Follow-up email request
export interface FollowUpEmailRequest {
  recipients: (string | EmailRecipient)[];
  templateData: ProtocolEmailData & {
    followUpType: 'reminder' | 'check-in' | 'adjustment';
    daysOnProtocol?: number;
  };
  customMessage?: string;
}

// Email service configuration
interface EmailServiceConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  testMode: boolean;
  dailyLimit: number;
  monthlyLimit: number;
}

// Global email service instance
let resendClient: Resend | null = null;
let serviceConfig: EmailServiceConfig | null = null;

/**
 * Initialize the email service with configuration
 */
function initializeEmailService(): EmailServiceConfig {
  if (serviceConfig) {
    return serviceConfig;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }

  if (!validateResendApiKey(apiKey)) {
    throw new Error('Invalid Resend API key format');
  }

  const emailConfig = getEmailConfig();
  
  serviceConfig = {
    apiKey,
    fromEmail: emailConfig.fromEmail,
    fromName: emailConfig.fromName,
    testMode: process.env.NODE_ENV === 'development' || process.env.EMAIL_TEST_MODE === 'true',
    dailyLimit: parseInt(process.env.EMAIL_DAILY_LIMIT || '100'),
    monthlyLimit: parseInt(process.env.EMAIL_MONTHLY_LIMIT || '3000'),
  };

  // Initialize Resend client
  resendClient = new Resend(apiKey);

  console.log(`📧 Email service initialized (${serviceConfig.testMode ? 'TEST' : 'PRODUCTION'} mode)`);
  
  return serviceConfig;
}

/**
 * Get Resend client instance
 */
function getResendClient(): Resend {
  if (!resendClient) {
    initializeEmailService();
  }
  return resendClient!;
}

/**
 * Send a protocol delivery email
 */
export async function sendProtocolEmail(request: EmailSendRequest): Promise<EmailSendResult> {
  const startTime = Date.now();

  try {
    // Initialize service if needed
    const config = initializeEmailService();
    const resend = getResendClient();

    console.log(`📤 Sending protocol email to ${request.recipients.length} recipients`);

    // Validate template data
    const validationErrors = validateEmailTemplateData(request.templateData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Template validation failed: ${validationErrors.join(', ')}`,
        trackingId: request.trackingId || generateEmailTrackingId(
          request.templateData.protocol.id,
          request.templateData.client.email
        ),
        recipientCount: 0,
        deliveryStatus: 'failed',
      };
    }

    // Clean and validate recipients
    const cleanedRecipients = validateAndCleanRecipients(request.recipients);
    if (cleanedRecipients.length === 0) {
      return {
        success: false,
        error: 'No valid email recipients provided',
        trackingId: request.trackingId || generateEmailTrackingId(
          request.templateData.protocol.id,
          request.templateData.client.email
        ),
        recipientCount: 0,
        deliveryStatus: 'failed',
      };
    }

    // Check sending limits
    const attachmentSizes = request.attachments?.map(a => a.content.length) || [];
    const limitCheck = checkEmailLimits(cleanedRecipients.length, attachmentSizes);
    if (!limitCheck.isValid) {
      return {
        success: false,
        error: limitCheck.errors.join(', '),
        trackingId: request.trackingId || generateEmailTrackingId(
          request.templateData.protocol.id,
          request.templateData.client.email
        ),
        recipientCount: cleanedRecipients.length,
        deliveryStatus: 'failed',
      };
    }

    // Generate tracking ID
    const trackingId = request.trackingId || generateEmailTrackingId(
      request.templateData.protocol.id,
      request.templateData.client.email
    );

    // Merge custom message into template data
    const templateData = {
      ...request.templateData,
      customMessage: request.customMessage || request.templateData.customMessage,
    };

    // Generate email content
    const htmlContent = generateProtocolDeliveryEmail(templateData);
    const textContent = generateProtocolDeliveryTextEmail(templateData);
    const previewText = generateEmailPreview(
      templateData.protocol.name,
      templateData.protocol.supplementCount
    );

    // Generate subject
    const subject = request.subject || generateEmailSubject(
      templateData.protocol.name,
      `${templateData.client.firstName} ${templateData.client.lastName}`
    );

    // Prepare Resend email data
    const resendData: any = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: cleanedRecipients.map(r => r.email),
      subject,
      html: htmlContent,
      text: textContent,
      reply_to: request.replyTo,
      headers: {
        'X-Protocol-ID': templateData.protocol.id,
        'X-Client-ID': templateData.client.email,
        'X-Tracking-ID': trackingId,
      },
      tags: [
        { name: 'type', value: 'protocol-delivery' },
        { name: 'protocol-id', value: templateData.protocol.id },
        { name: 'client-email', value: templateData.client.email },
      ],
    };

    // Add attachments if provided
    if (request.attachments && request.attachments.length > 0) {
      resendData.attachments = request.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
        disposition: attachment.disposition || 'attachment',
      }));
    }

    // Send email in test mode or production
    let result;
    if (config.testMode && !request.testMode) {
      console.log('📧 TEST MODE: Email would be sent with the following data:');
      console.log(`  To: ${cleanedRecipients.map(r => r.email).join(', ')}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Attachments: ${request.attachments?.length || 0}`);
      console.log(`  Tracking ID: ${trackingId}`);
      
      // Mock successful response
      result = {
        id: `test_${trackingId}`,
        to: cleanedRecipients.map(r => r.email),
        from: resendData.from,
        created_at: new Date().toISOString(),
      };
    } else {
      // Send real email
      result = await resend.emails.send(resendData);
    }

    const sendTime = Date.now() - startTime;
    console.log(`✅ Protocol email sent successfully in ${sendTime}ms`);
    console.log(`   Message ID: ${result.id}`);
    console.log(`   Recipients: ${cleanedRecipients.length}`);
    console.log(`   Attachments: ${request.attachments?.length || 0}`);

    // Create metadata for database storage
    const metadata = createEmailMetadata(
      cleanedRecipients,
      subject,
      trackingId,
      request.attachments
    );

    return {
      success: true,
      messageId: result.id,
      trackingId,
      recipientCount: cleanedRecipients.length,
      deliveryStatus: config.testMode ? 'sent' : 'sending',
      metadata: {
        subject,
        emailProvider: 'resend',
        sentAt: new Date(),
        attachmentCount: request.attachments?.length || 0,
        totalSize: attachmentSizes.reduce((sum, size) => sum + size, 0) + htmlContent.length,
        ...metadata,
      },
    };

  } catch (error: any) {
    const sendTime = Date.now() - startTime;
    console.error(`❌ Email sending failed after ${sendTime}ms:`, error);

    return {
      success: false,
      error: error.message || 'Unknown email sending error',
      trackingId: request.trackingId || generateEmailTrackingId(
        request.templateData.protocol.id,
        request.templateData.client.email
      ),
      recipientCount: 0,
      deliveryStatus: 'failed',
    };
  }
}

/**
 * Send a follow-up email (reminder, check-in, etc.)
 */
export async function sendFollowUpEmail(request: FollowUpEmailRequest): Promise<EmailSendResult> {
  try {
    const config = initializeEmailService();
    const resend = getResendClient();

    // Clean recipients
    const cleanedRecipients = validateAndCleanRecipients(request.recipients);
    if (cleanedRecipients.length === 0) {
      throw new Error('No valid email recipients provided');
    }

    // Generate tracking ID
    const trackingId = generateEmailTrackingId(
      request.templateData.protocol.id,
      request.templateData.client.email
    );

    // Generate follow-up email content
    const htmlContent = generateProtocolFollowUpEmail(request.templateData);
    const subject = `${request.templateData.followUpType === 'reminder' ? 'Reminder' : 
                     request.templateData.followUpType === 'check-in' ? 'Check-in' : 
                     'Update'}: ${request.templateData.protocol.name}`;

    // Send email
    const resendData = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: cleanedRecipients.map(r => r.email),
      subject,
      html: htmlContent,
      headers: {
        'X-Protocol-ID': request.templateData.protocol.id,
        'X-Tracking-ID': trackingId,
        'X-Email-Type': `follow-up-${request.templateData.followUpType}`,
      },
      tags: [
        { name: 'type', value: 'protocol-follow-up' },
        { name: 'follow-up-type', value: request.templateData.followUpType },
        { name: 'protocol-id', value: request.templateData.protocol.id },
      ],
    };

    const result = config.testMode 
      ? { id: `test_followup_${trackingId}`, to: cleanedRecipients.map(r => r.email) }
      : await resend.emails.send(resendData);

    console.log(`📧 Follow-up email (${request.templateData.followUpType}) sent: ${result.id}`);

    return {
      success: true,
      messageId: result.id,
      trackingId,
      recipientCount: cleanedRecipients.length,
      deliveryStatus: config.testMode ? 'sent' : 'sending',
    };

  } catch (error: any) {
    console.error('❌ Follow-up email sending failed:', error);
    return {
      success: false,
      error: error.message,
      trackingId: generateEmailTrackingId(
        request.templateData.protocol.id,
        request.templateData.client.email
      ),
      recipientCount: 0,
      deliveryStatus: 'failed',
    };
  }
}

/**
 * Test email service configuration
 */
export async function testEmailService(): Promise<{
  success: boolean;
  config: any;
  error?: string;
}> {
  try {
    const config = initializeEmailService();
    const resend = getResendClient();

    // Test basic API connectivity
    // Note: Resend doesn't have a dedicated test endpoint, so we'll validate the config
    
    return {
      success: true,
      config: {
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        testMode: config.testMode,
        dailyLimit: config.dailyLimit,
        monthlyLimit: config.monthlyLimit,
        apiKeyValid: validateResendApiKey(config.apiKey),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      config: null,
      error: error.message,
    };
  }
}

/**
 * Get email service health status
 */
export async function getEmailServiceHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: Date;
  details: any;
}> {
  try {
    const testResult = await testEmailService();
    
    if (testResult.success) {
      return {
        status: 'healthy',
        message: 'Email service is operational',
        timestamp: new Date(),
        details: testResult.config,
      };
    } else {
      return {
        status: 'unhealthy',
        message: `Email service configuration error: ${testResult.error}`,
        timestamp: new Date(),
        details: testResult,
      };
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      message: `Email service health check failed: ${error.message}`,
      timestamp: new Date(),
      details: { error: error.message },
    };
  }
}

/**
 * Update email delivery status from webhook
 */
export async function updateEmailDeliveryStatus(
  messageId: string,
  status: EmailDeliveryStatus,
  reason?: string
): Promise<boolean> {
  try {
    console.log(`📧 Email delivery status update: ${messageId} -> ${status}`);
    if (reason) {
      console.log(`   Reason: ${reason}`);
    }
    
    // This function would typically update the database
    // For now, just log the status update
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update email delivery status:', error);
    return false;
  }
}

/**
 * Get email sending statistics
 */
export async function getEmailStats(period: 'day' | 'week' | 'month'): Promise<{
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  complained: number;
}> {
  // This would typically query the database for actual statistics
  // For now, return mock data
  return {
    sent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
    complained: 0,
  };
}

/**
 * Validate email template before sending
 */
export function validateEmailTemplate(templateData: ProtocolEmailData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors = validateEmailTemplateData(templateData);
  const warnings: string[] = [];

  // Additional warnings for better email delivery
  if (!templateData.practitioner.email) {
    warnings.push('Practitioner email not provided - clients cannot reply directly');
  }

  if (!templateData.attachments) {
    warnings.push('No PDF attachment - clients will receive email without protocol document');
  }

  if (templateData.protocol.supplementCount === 0) {
    warnings.push('Protocol has no supplements - ensure this is intentional');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Service initialization on module load
try {
  if (process.env.RESEND_API_KEY) {
    initializeEmailService();
  }
} catch (error) {
  console.warn('📧 Email service initialization deferred:', (error as Error).message);
}
