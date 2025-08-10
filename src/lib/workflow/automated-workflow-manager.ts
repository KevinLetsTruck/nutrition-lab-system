import { UnifiedAnalysisOrchestrator } from '../analysis/unified-analysis-orchestrator'
// import { supabase } from '../supabase' // TODO: Replace with Prisma
// Database operations handled through supabase directly

export interface WorkflowConfig {
  autoSelectPrompts: boolean
  performQualityChecks: boolean
  generateProtocols: boolean
  sendNotifications: boolean
  trackProgress: boolean
}

export interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  startTime?: Date
  endTime?: Date
  result?: any
  error?: string
}

export interface WorkflowResult {
  workflowId: string
  clientId: string
  documentId?: string
  steps: WorkflowStep[]
  overallStatus: 'success' | 'partial' | 'failed'
  totalDuration: number
  analysisResults?: any
  protocols?: any
  notifications?: any
}

export class AutomatedWorkflowManager {
  private orchestrator: UnifiedAnalysisOrchestrator
  private config: WorkflowConfig

  constructor(config?: Partial<WorkflowConfig>) {
    this.orchestrator = new UnifiedAnalysisOrchestrator()
    this.config = {
      autoSelectPrompts: true,
      performQualityChecks: true,
      generateProtocols: true,
      sendNotifications: true,
      trackProgress: true,
      ...config
    }
  }

  async processDocument(
    fileBuffer: Buffer,
    clientId: string,
    metadata: Record<string, any>
  ): Promise<WorkflowResult> {
    const workflowId = crypto.randomUUID()
    const startTime = Date.now()
    const steps: WorkflowStep[] = []
    
    console.log('[WORKFLOW] Starting automated workflow:', workflowId)

    try {
      // Step 1: Document Analysis
      const analysisStep = await this.executeStep('document_analysis', async () => {
        return await this.orchestrator.analyzeDocument({
          fileBuffer,
          clientId,
          analysisType: 'document',
          metadata
        })
      })
      steps.push(analysisStep)

      if (analysisStep.status === 'failed') {
        throw new Error('Document analysis failed')
      }

      const analysisResult = analysisStep.result

      // Step 2: Quality Checks
      if (this.config.performQualityChecks) {
        const qaStep = await this.executeStep('quality_assurance', async () => {
          return await this.performQualityAssurance(analysisResult)
        })
        steps.push(qaStep)
      }

      // Step 3: Protocol Generation
      let protocols = null
      if (this.config.generateProtocols && analysisResult.functionalAnalysis) {
        const protocolStep = await this.executeStep('protocol_generation', async () => {
          return await this.generateProtocols(analysisResult, clientId)
        })
        steps.push(protocolStep)
        protocols = protocolStep.result
      }

      // Step 4: Data Storage
      const storageStep = await this.executeStep('data_storage', async () => {
        return await this.storeResults(workflowId, clientId, analysisResult, protocols)
      })
      steps.push(storageStep)

      // Step 5: Notifications
      let notifications = null
      if (this.config.sendNotifications) {
        const notificationStep = await this.executeStep('notifications', async () => {
          return await this.sendNotifications(clientId, analysisResult, protocols)
        })
        steps.push(notificationStep)
        notifications = notificationStep.result
      }

      // Determine overall status
      const failedSteps = steps.filter(s => s.status === 'failed').length
      const overallStatus = failedSteps === 0 ? 'success' : failedSteps < steps.length ? 'partial' : 'failed'

      return {
        workflowId,
        clientId,
        documentId: analysisResult.analysisId,
        steps,
        overallStatus,
        totalDuration: Date.now() - startTime,
        analysisResults: analysisResult,
        protocols,
        notifications
      }

    } catch (error) {
      console.error('[WORKFLOW] Workflow failed:', error)
      
      return {
        workflowId,
        clientId,
        steps,
        overallStatus: 'failed',
        totalDuration: Date.now() - startTime
      }
    }
  }

  async processClientComprehensive(clientId: string): Promise<WorkflowResult> {
    const workflowId = crypto.randomUUID()
    const startTime = Date.now()
    const steps: WorkflowStep[] = []
    
    console.log('[WORKFLOW] Starting comprehensive client analysis:', workflowId)

    try {
      // Step 1: Comprehensive Analysis
      const analysisStep = await this.executeStep('comprehensive_analysis', async () => {
        return await this.orchestrator.analyzeDocument({
          clientId,
          analysisType: 'comprehensive'
        })
      })
      steps.push(analysisStep)

      // Continue with remaining steps...
      
      return {
        workflowId,
        clientId,
        steps,
        overallStatus: 'success',
        totalDuration: Date.now() - startTime,
        analysisResults: analysisStep.result
      }

    } catch (error) {
      console.error('[WORKFLOW] Comprehensive workflow failed:', error)
      
      return {
        workflowId,
        clientId,
        steps,
        overallStatus: 'failed',
        totalDuration: Date.now() - startTime
      }
    }
  }

  private async executeStep(
    stepName: string,
    executor: () => Promise<any>
  ): Promise<WorkflowStep> {
    const step: WorkflowStep = {
      id: crypto.randomUUID(),
      name: stepName,
      status: 'in_progress',
      startTime: new Date()
    }

    console.log(`[WORKFLOW] Executing step: ${stepName}`)

    try {
      const result = await executor()
      step.status = 'completed'
      step.result = result
      step.endTime = new Date()
      console.log(`[WORKFLOW] Step completed: ${stepName}`)
    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : 'Unknown error'
      step.endTime = new Date()
      console.error(`[WORKFLOW] Step failed: ${stepName}`, error)
    }

    return step
  }

  private async performQualityAssurance(analysisResult: any): Promise<any> {
    const checks: {
      dataCompleteness: boolean
      analysisDepth: boolean
      recommendationQuality: boolean
      redFlags: any[]
      warnings: string[]
    } = {
      dataCompleteness: true,
      analysisDepth: true,
      recommendationQuality: true,
      redFlags: [],
      warnings: []
    }

    // Check data completeness
    if (!analysisResult.extractedData || Object.keys(analysisResult.extractedData).length === 0) {
      checks.dataCompleteness = false
      checks.warnings.push('No data extracted from document')
    }

    // Check analysis depth
    if (!analysisResult.functionalAnalysis) {
      checks.analysisDepth = false
      checks.warnings.push('Functional analysis incomplete')
    }

    // Check for red flags in the analysis
    if (analysisResult.functionalAnalysis?.riskStratification?.immediateRisks?.length > 0) {
      checks.redFlags = analysisResult.functionalAnalysis.riskStratification.immediateRisks
    }

    return checks
  }

  private async generateProtocols(analysisResult: any, clientId: string): Promise<any> {
    const protocols: any = {
      supplementProtocol: null,
      lifestyleProtocol: null,
      monitoringProtocol: null,
      followUpSchedule: null
    }

    if (analysisResult.functionalAnalysis) {
      // Generate supplement protocol
      protocols.supplementProtocol = analysisResult.functionalAnalysis.supplementStrategy

      // Generate lifestyle protocol
      protocols.lifestyleProtocol = analysisResult.functionalAnalysis.lifestyleModifications

      // Generate monitoring protocol
      protocols.monitoringProtocol = {
        metrics: analysisResult.functionalAnalysis.safetyCriticalMonitoring,
        frequency: 'Weekly',
        method: 'Self-monitoring with app tracking'
      }

      // Generate follow-up schedule
      protocols.followUpSchedule = analysisResult.functionalAnalysis.followUpSchedule
    }

    // Store protocols in database
    await this.storeProtocols(clientId, protocols)

    return protocols
  }

  private async storeResults(
    workflowId: string,
    clientId: string,
    analysisResult: any,
    protocols: any
  ): Promise<any> {
    try {
      // Store workflow execution
      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_executions')
        .insert({
          id: workflowId,
          client_id: clientId,
          analysis_id: analysisResult.analysisId,
          status: 'completed',
          results: analysisResult,
          protocols: protocols,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (workflowError) {
        console.error('[WORKFLOW] Error storing workflow:', workflowError)
        throw workflowError
      }

      return { stored: true, workflowId }
    } catch (error) {
      console.error('[WORKFLOW] Storage error:', error)
      throw error
    }
  }

  private async storeProtocols(clientId: string, protocols: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('client_protocols')
        .insert({
          client_id: clientId,
          protocols: protocols,
          created_at: new Date().toISOString(),
          active: true
        })

      if (error) {
        console.error('[WORKFLOW] Error storing protocols:', error)
      }
    } catch (error) {
      console.error('[WORKFLOW] Protocol storage error:', error)
    }
  }

  private async sendNotifications(
    clientId: string,
    analysisResult: any,
    protocols: any
  ): Promise<any> {
    const notifications = {
      clientNotified: false,
      practitionerNotified: false,
      urgentAlerts: []
    }

    // Check for urgent alerts
    if (analysisResult.functionalAnalysis?.riskStratification?.immediateRisks?.length > 0) {
      notifications.urgentAlerts = analysisResult.functionalAnalysis.riskStratification.immediateRisks
      
      // Send urgent notification (implementation would use email/SMS service)
      console.log('[WORKFLOW] URGENT: Immediate health risks detected for client:', clientId)
    }

    // Send standard notifications
    // (Implementation would integrate with notification service)
    
    return notifications
  }

  // Monitor workflow progress
  async getWorkflowStatus(workflowId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', workflowId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('[WORKFLOW] Error fetching workflow status:', error)
      throw error
    }
  }

  // Get all workflows for a client
  async getClientWorkflows(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('[WORKFLOW] Error fetching client workflows:', error)
      throw error
    }
  }
}