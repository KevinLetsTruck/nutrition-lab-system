import { Resend } from 'resend'
import { createServerSupabaseClient } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface EmailSequence {
  delay: number // hours
  subject: string
  template: string
  content: Record<string, boolean | undefined>
}

export class EmailService {
  private supabase = createServerSupabaseClient()

  // Email verification
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
      
      const html = this.getVerificationEmailTemplate(firstName, verificationUrl)
      
      await resend.emails.send({
        from: 'Kevin Rutherford <kevin@destinationhealth.com>',
        to: email,
        subject: 'Verify Your Email - DestinationHealth',
        html
      })

      return true
    } catch (error) {
      console.error('Email verification error:', error)
      return false
    }
  }

  // Welcome email sequence
  async sendWelcomeSequence(userId: string, sequenceType: string, step: number): Promise<boolean> {
    try {
      // Get user data
      const { data: user } = await this.supabase
        .from('users')
        .select(`
          email,
          client_profiles (
            first_name,
            last_name
          )
        `)
        .eq('id', userId)
        .single()

      if (!user) {
        throw new Error('User not found')
      }

      const firstName = user.client_profiles?.[0]?.first_name || 'there'
      const emailConfig = this.getEmailSequenceConfig(sequenceType, step)

      if (!emailConfig) {
        throw new Error('Invalid email sequence configuration')
      }

      const html = this.renderEmailTemplate(emailConfig.template, {
        firstName,
        ...emailConfig.content
      })

      await resend.emails.send({
        from: 'Kevin Rutherford <kevin@destinationhealth.com>',
        to: user.email,
        subject: emailConfig.subject,
        html
      })

      // Track email sent
      await this.trackEmailSent(userId, sequenceType, step)

      return true
    } catch (error) {
      console.error('Welcome sequence error:', error)
      return false
    }
  }

  // Get email sequence configuration
  private getEmailSequenceConfig(sequenceType: string, step: number): EmailSequence | null {
    const sequences = {
      onboardingComplete: [
        {
          delay: 0,
          subject: "Welcome to DestinationHealth - Your Journey Begins Now!",
          template: "welcome_immediate",
          content: {
            personalizedGreeting: true,
            nextSteps: true,
            kevinIntroduction: true,
            expectationSetting: true
          }
        },
        {
          delay: 24,
          subject: "Preparing for Your Discovery Call - What to Expect",
          template: "discovery_prep",
          content: {
            callPreparation: true,
            commonQuestions: true,
            truckDriverSpecificTips: true
          }
        },
        {
          delay: 72,
          subject: "Your Health Transformation Toolkit",
          template: "resource_delivery",
          content: {
            freeResources: true,
            healthyTruckingTips: true,
            successStories: true
          }
        },
        {
          delay: 168,
          subject: "Ready to Schedule Your Coaching Session?",
          template: "coaching_invitation",
          content: {
            schedulingLink: true,
            programOverview: true,
            specialOffers: true
          }
        }
      ]
    }

    const sequence = sequences[sequenceType as keyof typeof sequences]
    return sequence ? sequence[step] : null
  }

  // Track email sent in database
  private async trackEmailSent(userId: string, sequenceType: string, step: number): Promise<void> {
    try {
      // Get or create email sequence record
      const { data: existingSequence } = await this.supabase
        .from('email_sequences')
        .select('*')
        .eq('user_id', userId)
        .eq('sequence_type', sequenceType)
        .single()

      if (existingSequence) {
        // Update existing sequence
        const emailsSent = existingSequence.emails_sent || []
        emailsSent.push({
          step,
          sentAt: new Date().toISOString(),
          subject: this.getEmailSequenceConfig(sequenceType, step)?.subject
        })

        await this.supabase
          .from('email_sequences')
          .update({
            emails_sent: emailsSent,
            current_step: step + 1
          })
          .eq('id', existingSequence.id)
      } else {
        // Create new sequence
        await this.supabase
          .from('email_sequences')
          .insert({
            user_id: userId,
            sequence_type: sequenceType,
            emails_sent: [{
              step,
              sentAt: new Date().toISOString(),
              subject: this.getEmailSequenceConfig(sequenceType, step)?.subject
            }],
            current_step: step + 1
          })
      }
    } catch (error) {
      console.error('Track email sent error:', error)
    }
  }

  // Render email template
  private renderEmailTemplate(template: string, data: Record<string, any>): string {
    const templates = {
      welcome_immediate: this.getWelcomeImmediateTemplate(data),
      discovery_prep: this.getDiscoveryPrepTemplate(data),
      resource_delivery: this.getResourceDeliveryTemplate(data),
      coaching_invitation: this.getCoachingInvitationTemplate(data)
    }

    return templates[template as keyof typeof templates] || ''
  }

  // Email templates
  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
          <div style="background: #10b981; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">D</span>
          </div>
          <h1 style="color: white; margin: 0 0 10px 0;">Verify Your Email</h1>
          <p style="color: #cbd5e1; margin: 0;">Complete your DestinationHealth registration</p>
        </div>
        
        <div style="background: white; padding: 40px 20px;">
          <h2 style="color: #1e293b;">Hi ${firstName},</h2>
          
          <p>Thank you for creating your DestinationHealth account! To complete your registration and start your health transformation journey, please verify your email address.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
          
          <p>To your health,<br>
          <strong>Kevin Rutherford, FNTP</strong><br>
          <em>Truck Driver Health Specialist</em></p>
        </div>
      </div>
    `
  }

  private getWelcomeImmediateTemplate(data: Record<string, any>): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
          <div style="background: #10b981; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">D</span>
          </div>
          <h1 style="color: white; margin: 0 0 10px 0;">Welcome to DestinationHealth!</h1>
          <p style="color: #cbd5e1; margin: 0;">Your health transformation journey starts here</p>
        </div>
        
        <div style="background: white; padding: 40px 20px;">
          <h2 style="color: #1e293b;">Hi ${data.firstName},</h2>
          
          <p>Congratulations on taking the first step toward optimizing your health as a professional driver! I'm Kevin Rutherford, FNTP, and I'm excited to be your guide on this journey.</p>
          
          <p>Your comprehensive health assessment has been received and I'm already reviewing your unique situation. As someone who specializes in truck driver health, I understand the unique challenges you face on the road.</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What to Expect Next:</h3>
            <ul style="color: #475569;">
              <li><strong>Discovery Call:</strong> I'll call you within 24-48 hours to discuss your goals</li>
              <li><strong>Personalized Analysis:</strong> I'll prepare customized recommendations based on your assessment</li>
              <li><strong>Coaching Session:</strong> We'll schedule your first comprehensive session</li>
            </ul>
          </div>
          
          <p>Keep an eye on your phone - my call could come at any time over the next couple of days. I'm excited to learn more about your specific health goals and how I can help you achieve them while maintaining your driving career.</p>
          
          <p>To your health,<br>
          <strong>Kevin Rutherford, FNTP</strong><br>
          <em>Truck Driver Health Specialist</em></p>
        </div>
      </div>
    `
  }

  private getDiscoveryPrepTemplate(data: Record<string, any>): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
          <div style="background: #3b82f6; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">📞</span>
          </div>
          <h1 style="color: white; margin: 0 0 10px 0;">Preparing for Your Discovery Call</h1>
          <p style="color: #cbd5e1; margin: 0;">What to expect and how to prepare</p>
        </div>
        
        <div style="background: white; padding: 40px 20px;">
          <h2 style="color: #1e293b;">Hi ${data.firstName},</h2>
          
          <p>I hope you're doing well! I wanted to reach out to prepare you for our upcoming discovery call. This call is an important step in your health journey, and I want to make sure we make the most of our time together.</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What We'll Cover:</h3>
            <ul style="color: #475569;">
              <li>Review of your health assessment</li>
              <li>Discussion of your specific health goals</li>
              <li>Current challenges you're facing on the road</li>
              <li>Questions about your DOT medical requirements</li>
              <li>Next steps in your personalized program</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">💡 Pro Tips for Truck Drivers:</h3>
            <ul style="color: #92400e;">
              <li>Find a quiet place to talk (truck stop, rest area, or home)</li>
              <li>Have your health assessment responses handy</li>
              <li>Think about your biggest health challenges on the road</li>
              <li>Note any specific questions about nutrition or supplements</li>
            </ul>
          </div>
          
          <p>I'm looking forward to our conversation and helping you create a health plan that works with your driving schedule.</p>
          
          <p>Best regards,<br>
          <strong>Kevin Rutherford, FNTP</strong></p>
        </div>
      </div>
    `
  }

  private getResourceDeliveryTemplate(data: Record<string, any>): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
          <div style="background: #8b5cf6; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">📚</span>
          </div>
          <h1 style="color: white; margin: 0 0 10px 0;">Your Health Transformation Toolkit</h1>
          <p style="color: #cbd5e1; margin: 0;">Free resources to jumpstart your journey</p>
        </div>
        
        <div style="background: white; padding: 40px 20px;">
          <h2 style="color: #1e293b;">Hi ${data.firstName},</h2>
          
          <p>I hope you're having a great week! I wanted to share some valuable resources that I've created specifically for truck drivers like you. These tools will help you start implementing healthy habits right away.</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">🎁 Your Free Resources:</h3>
            <ul style="color: #475569;">
              <li><strong>Truck Stop Nutrition Guide:</strong> Healthy food options at major truck stops</li>
              <li><strong>On-the-Road Exercise Routine:</strong> 10-minute workouts you can do anywhere</li>
              <li><strong>Sleep Optimization Tips:</strong> Better rest for safer driving</li>
              <li><strong>DOT Medical Checklist:</strong> Stay compliant and healthy</li>
            </ul>
          </div>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">🚛 Success Story Spotlight:</h3>
            <p style="color: #166534; font-style: italic;">
              "Kevin helped me lose 30 pounds and get my blood pressure under control. 
              I feel better than I have in years, and my DOT physical was a breeze!" 
              - Mike, OTR Driver, 3 years with DestinationHealth
            </p>
          </div>
          
          <p>These resources are yours to keep and share with fellow drivers. Start implementing them today, and you'll see results before we even have our first coaching session!</p>
          
          <p>To your health,<br>
          <strong>Kevin Rutherford, FNTP</strong></p>
        </div>
      </div>
    `
  }

  private getCoachingInvitationTemplate(data: Record<string, any>): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
          <div style="background: #f59e0b; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">🎯</span>
          </div>
          <h1 style="color: white; margin: 0 0 10px 0;">Ready to Schedule Your Coaching Session?</h1>
          <p style="color: #cbd5e1; margin: 0;">Take the next step in your health transformation</p>
        </div>
        
        <div style="background: white; padding: 40px 20px;">
          <h2 style="color: #1e293b;">Hi ${data.firstName},</h2>
          
          <p>I hope you've been enjoying the resources I sent you! Now it's time to take your health journey to the next level with a comprehensive coaching session.</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What's Included in Your Session:</h3>
            <ul style="color: #475569;">
              <li>Personalized nutrition plan for your driving schedule</li>
              <li>Supplement recommendations for optimal health</li>
              <li>Lifestyle strategies for better energy and focus</li>
              <li>DOT medical optimization plan</li>
              <li>Ongoing support and accountability</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">🎉 Special Offer for New Clients:</h3>
            <p style="color: #92400e; font-weight: bold;">
              Book your first session this week and receive a complimentary 
              "Truck Driver Health Starter Kit" (valued at $97)
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/schedule" style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Schedule Your Session
            </a>
          </div>
          
          <p>I'm excited to work with you and help you achieve your health goals while maintaining your successful driving career.</p>
          
          <p>To your health,<br>
          <strong>Kevin Rutherford, FNTP</strong></p>
        </div>
      </div>
    `
  }

  // Start email sequence for a user
  async startEmailSequence(userId: string, sequenceType: string): Promise<boolean> {
    try {
      // Send immediate email (step 0)
      await this.sendWelcomeSequence(userId, sequenceType, 0)
      
      // Schedule future emails (you might want to use a job queue for this)
      // For now, we'll just track the sequence start
      
      return true
    } catch (error) {
      console.error('Start email sequence error:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService() 