import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { sendProtocolEmail, sendFollowUpEmail } from "@/lib/services/email-service";
import { generateProtocolPDFWithRetry } from "@/lib/services/pdf-service";
import { createPDFAttachment, formatFileSize } from "@/lib/utils/email-helpers";
import fs from 'fs/promises';

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * POST /api/protocols/[id]/email
 * Send protocol via email to client using Resend
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

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

    console.log(`📧 Sending protocol email for protocol: ${id}`);

    // Fetch protocol with all related data
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
        analysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisVersion: true,
          },
        },
        protocolSupplements: {
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

    // Check if this is a follow-up email
    const followUpType = body.followUpType as 'reminder' | 'check-in' | 'adjustment' | undefined;
    const isFollowUp = !!followUpType;

    let pdfAttachment = null;
    let pdfMetadata = null;

    // Generate PDF attachment if requested (not for follow-up emails)
    if (!isFollowUp && body.includePDF !== false) {
      console.log('📄 Generating PDF attachment...');
      
      // Check if PDF already exists in recent generations
      const existingPDFGeneration = await prisma.protocolGeneration.findFirst({
        where: {
          protocolId: protocol.id,
          pdfUrl: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPDFGeneration && existingPDFGeneration.pdfUrl && body.useExistingPDF !== false) {
        console.log('📄 Using existing PDF from recent generation');
        try {
          // Try to read existing PDF file
          const pdfPath = existingPDFGeneration.pdfUrl.startsWith('/')
            ? `./public${existingPDFGeneration.pdfUrl}`
            : existingPDFGeneration.pdfUrl;

          if (pdfPath.startsWith('./public/')) {
            const pdfBuffer = await fs.readFile(pdfPath);
            const generationData = existingPDFGeneration.generationData as any;
            
            pdfAttachment = await createPDFAttachment(
              pdfBuffer,
              generationData?.filename || `${protocol.protocolName}.pdf`
            );
            
            pdfMetadata = {
              filename: pdfAttachment.filename,
              size: pdfBuffer.length,
              sizeFormatted: formatFileSize(pdfBuffer.length),
              pages: generationData?.pageCount || 1,
              source: 'existing',
            };
          }
        } catch (error) {
          console.warn('❌ Could not read existing PDF, generating new one:', error);
        }
      }

      // Generate new PDF if no existing one found or couldn't read it
      if (!pdfAttachment) {
        console.log('📄 Generating new PDF...');
        
        // Transform protocol data for PDF generation
        const pdfProtocolData = {
          id: protocol.id,
          protocolName: protocol.protocolName,
          protocolPhase: protocol.protocolPhase || undefined,
          status: protocol.status,
          startDate: protocol.startDate || undefined,
          durationWeeks: protocol.durationWeeks || undefined,
          greeting: protocol.greeting || undefined,
          clinicalFocus: protocol.clinicalFocus || undefined,
          currentStatus: protocol.currentStatus || undefined,
          protocolNotes: protocol.protocolNotes || undefined,
          effectivenessRating: protocol.effectivenessRating || undefined,
          client: {
            id: protocol.client.id,
            firstName: protocol.client.firstName,
            lastName: protocol.client.lastName,
            email: protocol.client.email,
          },
          analysis: protocol.analysis ? {
            id: protocol.analysis.id,
            analysisDate: protocol.analysis.analysisDate,
            analysisVersion: protocol.analysis.analysisVersion,
          } : undefined,
          supplements: protocol.protocolSupplements.map(supplement => ({
            id: supplement.id,
            productName: supplement.productName,
            dosage: supplement.dosage,
            timing: supplement.timing,
            purpose: supplement.purpose || undefined,
            priority: supplement.priority,
            isActive: supplement.isActive,
          })),
          dailySchedule: protocol.dailySchedule as any || undefined,
        };

        // Generate PDF
        const pdfResult = await generateProtocolPDFWithRetry({
          protocol: pdfProtocolData,
          options: {
            paperSize: body.paperSize || 'A4',
            includeGreeting: body.includeGreeting !== false,
            includeSupplements: body.includeSupplements !== false,
            includeSchedule: body.includeSchedule !== false,
            brandingConfig: protocol.brandingConfig as any || {
              theme: 'professional',
              primaryColor: '#10b981',
            },
          },
        });

        if (!pdfResult.success || !pdfResult.fileMetadata) {
          return NextResponse.json<APIResponse>(
            { success: false, error: `PDF generation failed: ${pdfResult.error}` },
            { status: 500 }
          );
        }

        // Create PDF attachment from generated file
        if (pdfResult.fileMetadata.filePath.startsWith('./public/')) {
          const pdfBuffer = await fs.readFile(pdfResult.fileMetadata.filePath);
          pdfAttachment = await createPDFAttachment(
            pdfBuffer,
            pdfResult.fileMetadata.filename
          );
        } else {
          // For S3 URLs, we'd need to download the file first
          // For now, skip attachment if it's remote
          console.warn('⚠️ Remote PDF URLs not supported for email attachments yet');
        }

        pdfMetadata = {
          filename: pdfResult.fileMetadata.filename,
          size: pdfResult.fileMetadata.size,
          sizeFormatted: formatFileSize(pdfResult.fileMetadata.size),
          pages: pdfResult.fileMetadata.pages || 1,
          source: 'generated',
        };
      }
    }

    // Prepare email template data
    const templateData = {
      client: {
        firstName: protocol.client.firstName,
        lastName: protocol.client.lastName,
        email: protocol.client.email,
      },
      protocol: {
        id: protocol.id,
        name: protocol.protocolName,
        phase: protocol.protocolPhase || undefined,
        status: protocol.status,
        supplementCount: protocol.protocolSupplements.filter(s => s.isActive).length,
        duration: protocol.durationWeeks || undefined,
        startDate: protocol.startDate || undefined,
      },
      practitioner: {
        name: body.practitionerName || process.env.PRACTITIONER_NAME || 'Your Nutrition Practitioner',
        title: body.practitionerTitle || process.env.PRACTITIONER_TITLE,
        email: body.practitionerEmail || process.env.PRACTITIONER_EMAIL,
        phone: body.practitionerPhone || process.env.PRACTITIONER_PHONE,
      },
      customMessage: body.customMessage,
      attachments: pdfMetadata ? {
        pdfFilename: pdfMetadata.filename,
        pdfSize: pdfMetadata.sizeFormatted,
        pdfPages: pdfMetadata.pages,
      } : undefined,
      brandingConfig: {
        primaryColor: body.primaryColor || protocol.brandingConfig?.primaryColor || '#10b981',
        logoUrl: body.logoUrl || process.env.PRACTICE_LOGO_URL,
        practiceName: body.practiceName || process.env.PRACTICE_NAME || 'FNTP Nutrition Practice',
      },
    };

    // Send email based on type
    let emailResult;
    
    if (isFollowUp) {
      console.log(`📧 Sending follow-up email (${followUpType})`);
      emailResult = await sendFollowUpEmail({
        recipients: allRecipients,
        templateData: {
          ...templateData,
          followUpType,
          daysOnProtocol: body.daysOnProtocol,
        },
        customMessage: body.customMessage,
      });
    } else {
      console.log('📧 Sending protocol delivery email');
      emailResult = await sendProtocolEmail({
        recipients: allRecipients,
        subject: body.subject,
        templateData,
        attachments: pdfAttachment ? [pdfAttachment] : undefined,
        customMessage: body.customMessage,
        replyTo: body.replyTo,
        testMode: body.testMode,
      });
    }

    if (!emailResult.success) {
      return NextResponse.json<APIResponse>(
        { success: false, error: emailResult.error || "Email sending failed" },
        { status: 500 }
      );
    }

    // Create protocol generation record for email delivery
    const protocolGeneration = await prisma.protocolGeneration.create({
      data: {
        protocolId: protocol.id,
        clientId: protocol.clientId,
        emailSentAt: new Date(),
        emailRecipients: allRecipients,
        pdfUrl: pdfMetadata?.source === 'generated' ? null : undefined, // Only set if PDF was included
        generationData: {
          // Email delivery details
          generationType: isFollowUp ? 'email-followup' : 'email-delivery',
          followUpType: followUpType || undefined,
          emailId: emailResult.messageId,
          trackingId: emailResult.trackingId,
          sentBy: authUser.id,
          sentAt: new Date().toISOString(),
          deliveryStatus: emailResult.deliveryStatus,
          
          // Email content details
          subject: body.subject || emailResult.metadata?.subject,
          recipientCount: emailResult.recipientCount,
          hasCustomMessage: !!body.customMessage,
          includedPDF: !!pdfAttachment,
          pdfMetadata: pdfMetadata,
          
          // Template and branding
          templateData: templateData,
          emailProvider: 'resend',
          
          // Request details
          requestedBy: authUser.id,
          requestedAt: startTime,
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          
          // Performance metrics
          emailSendTime: emailResult.metadata?.sentAt,
          totalTime: Date.now() - startTime,
        },
      },
    });

    const totalTime = Date.now() - startTime;
    console.log(`✅ Protocol email sent successfully in ${totalTime}ms`);
    console.log(`   Message ID: ${emailResult.messageId}`);
    console.log(`   Recipients: ${emailResult.recipientCount}`);
    console.log(`   PDF Attached: ${!!pdfAttachment}`);

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        generationId: protocolGeneration.id,
        emailId: emailResult.messageId,
        trackingId: emailResult.trackingId,
        status: emailResult.deliveryStatus,
        message: `Protocol email sent successfully`,
        
        // Delivery information
        delivery: {
          sentAt: protocolGeneration.emailSentAt,
          recipients: allRecipients,
          recipientCount: emailResult.recipientCount,
          subject: body.subject || emailResult.metadata?.subject,
          provider: 'resend',
          deliveryStatus: emailResult.deliveryStatus,
        },
        
        // Protocol information
        protocol: {
          id: protocol.id,
          name: protocol.protocolName,
          clientName: `${protocol.client.firstName} ${protocol.client.lastName}`,
          supplementCount: protocol.protocolSupplements.filter(s => s.isActive).length,
        },
        
        // PDF attachment info
        pdf: pdfMetadata ? {
          included: true,
          filename: pdfMetadata.filename,
          size: pdfMetadata.sizeFormatted,
          pages: pdfMetadata.pages,
          source: pdfMetadata.source,
        } : {
          included: false,
          reason: isFollowUp ? 'Follow-up emails do not include PDF attachments' : 'PDF attachment was disabled',
        },
        
        // Performance metrics
        performance: {
          totalTime: Date.now() - startTime,
          emailSendTime: emailResult.metadata?.sentAt,
          pdfGenerationIncluded: !!pdfMetadata && pdfMetadata.source === 'generated',
        },
      },
    });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Protocol email sending failed after ${totalTime}ms:`, error);
    
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Failed to send protocol email",
        details: error instanceof Error ? error.message : String(error),
        processingTime: totalTime,
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
