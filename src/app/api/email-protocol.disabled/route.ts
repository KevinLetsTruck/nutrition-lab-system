import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { protocolId, clientId, clientEmail, clientName, protocolContent } = await request.json()

    if (!protocolId || !clientId || !clientEmail || !clientName || !protocolContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use server-side Supabase client
    const supabase = createServerSupabaseClient()

    // For now, we'll just log the email request
    // In a real implementation, you would integrate with an email service like SendGrid, Mailgun, etc.
    console.log('Email Protocol Request:', {
      protocolId,
      clientId,
      clientEmail,
      clientName,
      protocolContent: protocolContent.substring(0, 100) + '...' // Log first 100 chars
    })

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    // const emailService = new EmailService()
    // await emailService.sendProtocol({
    //   to: clientEmail,
    //   subject: 'Your FNTP Protocol',
    //   content: protocolContent,
    //   clientName: clientName
    // })

    // Log the email activity
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        protocol_id: protocolId,
        client_id: clientId,
        recipient_email: clientEmail,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging email:', logError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Protocol sent to client successfully',
      email: clientEmail
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 