import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        configured: false 
      })
    }

    const resend = new Resend(apiKey)
    
    // Test sending a simple email
    const result = await resend.emails.send({
      from: 'Kevin Rutherford <onboarding@resend.dev>',
      to: 'trucktax@icloud.com',
      subject: 'Test Email from Nutrition Lab System',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email service is working.</p>'
    })

    return NextResponse.json({ 
      success: true, 
      result,
      configured: true 
    })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      configured: !!process.env.RESEND_API_KEY,
      details: error
    }, { status: 500 })
  }
} 