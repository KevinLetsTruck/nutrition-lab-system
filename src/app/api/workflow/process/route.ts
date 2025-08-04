import { NextRequest, NextResponse } from 'next/server'
import { AutomatedWorkflowManager } from '@/lib/workflow/automated-workflow-manager'

export async function POST(request: NextRequest) {
  console.log('[WORKFLOW-API] Starting workflow processing')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId') as string | null
    const workflowType = formData.get('workflowType') as string || 'document'
    
    // Configuration options
    const config = {
      autoSelectPrompts: formData.get('autoSelectPrompts') !== 'false',
      performQualityChecks: formData.get('performQualityChecks') !== 'false',
      generateProtocols: formData.get('generateProtocols') !== 'false',
      sendNotifications: formData.get('sendNotifications') !== 'false',
      trackProgress: formData.get('trackProgress') !== 'false'
    }

    const workflowManager = new AutomatedWorkflowManager(config)

    if (workflowType === 'document' && file) {
      // Process document workflow
      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = Buffer.from(arrayBuffer)
      
      const result = await workflowManager.processDocument(
        fileBuffer,
        clientId || crypto.randomUUID(),
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        }
      )
      
      return NextResponse.json({
        success: result.overallStatus === 'success',
        workflowId: result.workflowId,
        status: result.overallStatus,
        steps: result.steps.map(step => ({
          name: step.name,
          status: step.status,
          duration: step.endTime && step.startTime 
            ? step.endTime.getTime() - step.startTime.getTime() 
            : null,
          error: step.error
        })),
        totalDuration: result.totalDuration,
        analysisId: result.analysisResults?.analysisId,
        documentType: result.analysisResults?.documentType,
        hasProtocols: !!result.protocols,
        hasNotifications: !!result.notifications,
        urgentAlerts: result.notifications?.urgentAlerts || []
      })
      
    } else if (workflowType === 'comprehensive' && clientId) {
      // Process comprehensive client analysis
      const result = await workflowManager.processClientComprehensive(clientId)
      
      return NextResponse.json({
        success: result.overallStatus === 'success',
        workflowId: result.workflowId,
        status: result.overallStatus,
        steps: result.steps,
        totalDuration: result.totalDuration
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid workflow request. Provide either file for document workflow or clientId for comprehensive workflow.' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('[WORKFLOW-API] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Workflow processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get workflow status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')
    const clientId = searchParams.get('clientId')
    
    const workflowManager = new AutomatedWorkflowManager()
    
    if (workflowId) {
      // Get specific workflow status
      const status = await workflowManager.getWorkflowStatus(workflowId)
      return NextResponse.json({ success: true, workflow: status })
      
    } else if (clientId) {
      // Get all workflows for a client
      const workflows = await workflowManager.getClientWorkflows(clientId)
      return NextResponse.json({ success: true, workflows })
      
    } else {
      return NextResponse.json(
        { error: 'Provide either workflowId or clientId' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('[WORKFLOW-API] GET Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflow data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}