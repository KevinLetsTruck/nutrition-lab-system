import { Resend } from 'resend'

export interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private static instance: EmailService
  private resend: Resend

  private constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY not found. Email notifications will be disabled.')
      this.resend = null as any
    } else {
      this.resend = new Resend(apiKey)
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendAnalysisCompleteNotification(
    clientEmail: string,
    clientName: string,
    reportType: string,
    reportId: string,
    confidence: number
  ): Promise<boolean> {
    if (!this.resend) {
      console.log('Email service not configured. Skipping notification.')
      return false
    }

    try {
      const subject = `Your ${reportType.toUpperCase()} Analysis is Complete`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Analysis Complete</h2>
          <p>Hello ${clientName},</p>
          <p>Your ${reportType.toUpperCase()} analysis has been completed successfully!</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Analysis Details:</h3>
            <ul>
              <li><strong>Report Type:</strong> ${reportType.toUpperCase()}</li>
              <li><strong>Confidence Score:</strong> ${(confidence * 100).toFixed(1)}%</li>
              <li><strong>Report ID:</strong> ${reportId}</li>
            </ul>
          </div>
          
          <p>Your nutritionist will review the results and contact you with recommendations.</p>
          
          <p>Best regards,<br>Your Nutrition Lab Team</p>
        </div>
      `

      const text = `
        Analysis Complete
        
        Hello ${clientName},
        
        Your ${reportType.toUpperCase()} analysis has been completed successfully!
        
        Analysis Details:
        - Report Type: ${reportType.toUpperCase()}
        - Confidence Score: ${(confidence * 100).toFixed(1)}%
        - Report ID: ${reportId}
        
        Your nutritionist will review the results and contact you with recommendations.
        
        Best regards,
        Your Nutrition Lab Team
      `

      const notification: EmailNotification = {
        to: clientEmail,
        subject,
        html,
        text
      }

      await this.sendEmail(notification)
      console.log(`✅ Analysis complete notification sent to ${clientEmail}`)
      return true

    } catch (error) {
      console.error('Failed to send analysis complete notification:', error)
      return false
    }
  }

  async sendAnalysisFailedNotification(
    clientEmail: string,
    clientName: string,
    reportType: string,
    errorMessage: string
  ): Promise<boolean> {
    if (!this.resend) {
      console.log('Email service not configured. Skipping notification.')
      return false
    }

    try {
      const subject = `Analysis Failed - ${reportType.toUpperCase()} Report`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Analysis Failed</h2>
          <p>Hello ${clientName},</p>
          <p>We encountered an issue while processing your ${reportType.toUpperCase()} report.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Error Details:</h3>
            <p>${errorMessage}</p>
          </div>
          
          <p>Our team has been notified and will investigate the issue. We'll contact you once it's resolved.</p>
          
          <p>If you have any questions, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>Your Nutrition Lab Team</p>
        </div>
      `

      const text = `
        Analysis Failed
        
        Hello ${clientName},
        
        We encountered an issue while processing your ${reportType.toUpperCase()} report.
        
        Error Details:
        ${errorMessage}
        
        Our team has been notified and will investigate the issue. We'll contact you once it's resolved.
        
        If you have any questions, please don't hesitate to reach out.
        
        Best regards,
        Your Nutrition Lab Team
      `

      const notification: EmailNotification = {
        to: clientEmail,
        subject,
        html,
        text
      }

      await this.sendEmail(notification)
      console.log(`⚠️ Analysis failed notification sent to ${clientEmail}`)
      return true

    } catch (error) {
      console.error('Failed to send analysis failed notification:', error)
      return false
    }
  }

  async sendBatchProcessingCompleteNotification(
    clientEmail: string,
    clientName: string,
    totalProcessed: number,
    successful: number,
    failed: number
  ): Promise<boolean> {
    if (!this.resend) {
      console.log('Email service not configured. Skipping notification.')
      return false
    }

    try {
      const subject = `Batch Processing Complete - ${successful} Reports Analyzed`
      
      const successRate = ((successful / totalProcessed) * 100).toFixed(1)
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Batch Processing Complete</h2>
          <p>Hello ${clientName},</p>
          <p>Your batch of lab reports has been processed!</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Processing Summary:</h3>
            <ul>
              <li><strong>Total Reports:</strong> ${totalProcessed}</li>
              <li><strong>Successfully Processed:</strong> ${successful}</li>
              <li><strong>Failed:</strong> ${failed}</li>
              <li><strong>Success Rate:</strong> ${successRate}%</li>
            </ul>
          </div>
          
          ${failed > 0 ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Note:</strong> ${failed} report(s) failed to process. Our team will investigate and reprocess them.</p>
          </div>
          ` : ''}
          
          <p>Your nutritionist will review all successful analyses and contact you with comprehensive recommendations.</p>
          
          <p>Best regards,<br>Your Nutrition Lab Team</p>
        </div>
      `

      const text = `
        Batch Processing Complete
        
        Hello ${clientName},
        
        Your batch of lab reports has been processed!
        
        Processing Summary:
        - Total Reports: ${totalProcessed}
        - Successfully Processed: ${successful}
        - Failed: ${failed}
        - Success Rate: ${successRate}%
        
        ${failed > 0 ? `Note: ${failed} report(s) failed to process. Our team will investigate and reprocess them.` : ''}
        
        Your nutritionist will review all successful analyses and contact you with comprehensive recommendations.
        
        Best regards,
        Your Nutrition Lab Team
      `

      const notification: EmailNotification = {
        to: clientEmail,
        subject,
        html,
        text
      }

      await this.sendEmail(notification)
      console.log(`✅ Batch processing notification sent to ${clientEmail}`)
      return true

    } catch (error) {
      console.error('Failed to send batch processing notification:', error)
      return false
    }
  }

  private async sendEmail(notification: EmailNotification): Promise<void> {
    if (!this.resend) {
      throw new Error('Resend not configured')
    }

    const { data, error } = await this.resend.emails.send({
      from: 'Nutrition Lab <noreply@yourdomain.com>',
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
      text: notification.text
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log(`Email sent successfully: ${data?.id}`)
  }

  // Test method to verify email configuration
  async testEmailConfiguration(): Promise<boolean> {
    if (!this.resend) {
      console.log('Email service not configured')
      return false
    }

    try {
      const testNotification: EmailNotification = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email from the Nutrition Lab System.</p>',
        text: 'This is a test email from the Nutrition Lab System.'
      }

      await this.sendEmail(testNotification)
      console.log('✅ Email configuration test successful')
      return true
    } catch (error) {
      console.error('❌ Email configuration test failed:', error)
      return false
    }
  }
}

export default EmailService 