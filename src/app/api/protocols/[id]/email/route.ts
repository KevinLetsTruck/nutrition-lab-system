import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * POST /api/protocols/[id]/email
 * Send protocol via email to client (stub implementation)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Fetch protocol with client data
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        protocolSupplements: {
          where: { isActive: true },
          orderBy: { priority: "asc" },
        },
      },
    });

    if (!protocol) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Protocol not found" },
        { status: 404 }
      );
    }

    // Validate email recipients
    const recipients = body.recipients || [protocol.client.email];
    const additionalRecipients = body.additionalRecipients || [];
    const allRecipients = [...recipients, ...additionalRecipients].filter(
      (email, index, arr) => email && arr.indexOf(email) === index
    );

    if (allRecipients.length === 0) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "No valid email recipients provided" },
        { status: 400 }
      );
    }

    // Email content data
    const emailData = {
      subject: body.subject || `Your Personalized Protocol: ${protocol.protocolName}`,
      clientName: `${protocol.client.firstName} ${protocol.client.lastName}`,
      protocolName: protocol.protocolName,
      greeting: protocol.greeting,
      clinicalFocus: protocol.clinicalFocus,
      supplementCount: protocol.protocolSupplements.length,
      phase: protocol.protocolPhase,
      duration: protocol.durationWeeks,
      
      // Email customization options
      includeGreeting: body.includeGreeting !== false,
      includePDF: body.includePDF !== false,
      includeInstructions: body.includeInstructions !== false,
      includeFollowUp: body.includeFollowUp !== false,
      
      // Custom message from practitioner
      customMessage: body.customMessage || '',
      
      // Template and branding
      template: body.template || 'professional',
      branding: protocol.brandingConfig || {
        theme: 'professional',
        includeClinicLogo: true,
      },
    };

    // TODO: Implement actual email sending
    // This would typically integrate with:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP
    
    // Mock email sending process
    const mockEmailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create protocol generation record for email delivery
    const protocolGeneration = await prisma.protocolGeneration.create({
      data: {
        protocolId: protocol.id,
        clientId: protocol.clientId,
        emailSentAt: new Date(),
        emailRecipients: allRecipients,
        generationData: {
          ...emailData,
          generationType: 'email',
          emailId: mockEmailId,
          sentBy: authUser.id,
          sentAt: new Date().toISOString(),
          deliveryStatus: 'sent',
          
          // Email delivery details (mock)
          deliveryDetails: {
            provider: 'mock-email-service',
            messageId: mockEmailId,
            recipients: allRecipients.map(email => ({
              email,
              status: 'sent',
              deliveredAt: new Date().toISOString(),
            })),
          },
          
          // Email content metadata
          contentDetails: {
            hasAttachments: body.includePDF,
            templateUsed: emailData.template,
            characterCount: (emailData.greeting?.length || 0) + 
                            (emailData.customMessage?.length || 0) + 
                            (emailData.clinicalFocus?.length || 0),
          },
        },
      },
    });

    // In a real implementation, this would:
    // 1. Generate HTML email template with protocol data
    // 2. Optionally attach PDF version of protocol
    // 3. Send email via chosen email service
    // 4. Handle delivery confirmations and bounces
    // 5. Update delivery status in database

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        generationId: protocolGeneration.id,
        emailId: mockEmailId,
        status: 'sent',
        message: 'Protocol email sent successfully (stub implementation)',
        
        // Delivery information
        delivery: {
          sentAt: protocolGeneration.emailSentAt,
          recipients: allRecipients,
          recipientCount: allRecipients.length,
          subject: emailData.subject,
        },
        
        // Protocol information
        protocol: {
          id: protocol.id,
          name: protocol.protocolName,
          clientName: emailData.clientName,
          supplementCount: emailData.supplementCount,
        },
        
        // Mock delivery tracking
        tracking: {
          trackingId: mockEmailId,
          expectedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          deliveryStatus: 'in_transit',
          canTrack: true,
        },
      },
    });

  } catch (error: any) {
    console.error("Error sending protocol email:", error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Failed to send protocol email",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/protocols/[id]/email
 * Get email delivery history for a protocol
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch email delivery history
    const emailDeliveries = await prisma.protocolGeneration.findMany({
      where: { 
        protocolId: id,
        emailSentAt: { not: null }, // Only email deliveries
      },
      orderBy: { emailSentAt: "desc" },
      take: 20, // Last 20 email deliveries
    });

    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id },
      select: {
        id: true,
        protocolName: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!protocol) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Protocol not found" },
        { status: 404 }
      );
    }

    // Process email delivery data
    const deliveryHistory = emailDeliveries.map(delivery => {
      const generationData = delivery.generationData as any;
      
      return {
        id: delivery.id,
        sentAt: delivery.emailSentAt,
        recipients: delivery.emailRecipients,
        subject: generationData?.subject || `Protocol: ${protocol.protocolName}`,
        status: generationData?.deliveryDetails?.status || 'sent',
        emailId: generationData?.emailId,
        template: generationData?.template || 'professional',
        recipientCount: delivery.emailRecipients.length,
        
        // Content details
        includedPDF: generationData?.includePDF,
        customMessage: !!generationData?.customMessage,
        characterCount: generationData?.contentDetails?.characterCount || 0,
      };
    });

    // Calculate delivery statistics
    const stats = {
      totalDeliveries: emailDeliveries.length,
      uniqueRecipients: new Set(
        emailDeliveries.flatMap(d => d.emailRecipients)
      ).size,
      lastDelivery: emailDeliveries[0]?.emailSentAt || null,
      mostRecentRecipients: emailDeliveries[0]?.emailRecipients || [],
    };

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        protocol: {
          id: protocol.id,
          name: protocol.protocolName,
          clientName: `${protocol.client.firstName} ${protocol.client.lastName}`,
          clientEmail: protocol.client.email,
        },
        deliveryHistory,
        statistics: stats,
      },
    });

  } catch (error: any) {
    console.error("Error fetching email delivery history:", error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Failed to fetch email delivery history",
      },
      { status: 500 }
    );
  }
}
