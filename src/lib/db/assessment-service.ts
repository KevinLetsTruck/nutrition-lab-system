import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface AssessmentCreateInput {
  clientId: string
  assessmentType: 'structured' | 'nutriq' | 'health_history' | 'symptom_survey'
  responses?: any
  metadata?: any
}

export interface AssessmentUpdateInput {
  responses?: any
  structuredResponse?: any
  status?: 'active' | 'completed' | 'archived'
  completedAt?: Date
}

export interface AssessmentAnalysis {
  symptomBurden?: any
  rootCauses?: any
  priorityAreas?: string[]
  recommendations?: any
}

export class AssessmentService {
  /**
   * Create new assessment (AI conversation)
   */
  static async createAssessment(clientId: string, data: AssessmentCreateInput) {
    try {
      // Verify client exists
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      })

      if (!client) {
        throw new Error('Client not found')
      }

      // Create AI conversation
      const assessment = await prisma.aiConversation.create({
        data: {
          clientId,
          assessmentType: data.assessmentType,
          status: 'active',
          metadata: data.metadata || {}
        }
      })

      return assessment
    } catch (error) {
      console.error('Error creating assessment:', error)
      throw error
    }
  }

  /**
   * Get all assessments for a client
   */
  static async getAssessmentsByClient(clientId: string) {
    try {
      const assessments = await prisma.aiConversation.findMany({
        where: { clientId },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          analyses: true
        }
      })

      return assessments
    } catch (error) {
      console.error('Error fetching assessments:', error)
      throw error
    }
  }

  /**
   * Update assessment
   */
  static async updateAssessment(id: string, data: AssessmentUpdateInput) {
    try {
      const updateData: any = {}

      if (data.status) updateData.status = data.status
      if (data.completedAt) updateData.completedAt = data.completedAt
      if (data.responses) {
        // For AI conversations, we update metadata
        updateData.metadata = data.responses
      }

      const assessment = await prisma.aiConversation.update({
        where: { id },
        data: updateData
      })

      return assessment
    } catch (error) {
      console.error('Error updating assessment:', error)
      throw error
    }
  }

  /**
   * Complete assessment with analysis
   */
  static async completeAssessment(id: string, analysis: AssessmentAnalysis) {
    try {
      // Start a transaction to update both conversation and create analysis
      const result = await prisma.$transaction(async (tx) => {
        // Update conversation status
        const conversation = await tx.aiConversation.update({
          where: { id },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        })

        // Create analysis record
        const analysisRecord = await tx.conversationAnalysis.create({
          data: {
            conversationId: id,
            analysisType: 'comprehensive',
            results: {
              symptomBurden: analysis.symptomBurden,
              rootCauses: analysis.rootCauses,
              priorityAreas: analysis.priorityAreas,
              recommendations: analysis.recommendations
            }
          }
        })

        return { conversation, analysis: analysisRecord }
      })

      return result
    } catch (error) {
      console.error('Error completing assessment:', error)
      throw error
    }
  }

  /**
   * Add message to assessment conversation
   */
  static async addMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant' = 'user',
    structuredResponse?: any,
    questionId?: string,
    section?: string
  ) {
    try {
      const message = await prisma.conversationMessage.create({
        data: {
          conversationId,
          content,
          role,
          structuredResponse,
          questionId,
          section
        }
      })

      return message
    } catch (error) {
      console.error('Error adding message:', error)
      throw error
    }
  }

  /**
   * Get assessment by ID with full details
   */
  static async getAssessmentById(id: string) {
    try {
      const assessment = await prisma.aiConversation.findUnique({
        where: { id },
        include: {
          client: true,
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          analyses: true
        }
      })

      if (!assessment) {
        throw new Error('Assessment not found')
      }

      return assessment
    } catch (error) {
      console.error('Error fetching assessment:', error)
      throw error
    }
  }

  /**
   * Get active assessments
   */
  static async getActiveAssessments() {
    try {
      const assessments = await prisma.aiConversation.findMany({
        where: {
          status: 'active'
        },
        include: {
          client: true,
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return assessments
    } catch (error) {
      console.error('Error fetching active assessments:', error)
      throw error
    }
  }

  /**
   * Archive assessment
   */
  static async archiveAssessment(id: string) {
    try {
      const assessment = await prisma.aiConversation.update({
        where: { id },
        data: {
          status: 'archived'
        }
      })

      return assessment
    } catch (error) {
      console.error('Error archiving assessment:', error)
      throw error
    }
  }

  /**
   * Get assessment statistics for a client
   */
  static async getClientAssessmentStats(clientId: string) {
    try {
      const stats = await prisma.aiConversation.groupBy({
        by: ['assessmentType', 'status'],
        where: { clientId },
        _count: true
      })

      const totalAssessments = await prisma.aiConversation.count({
        where: { clientId }
      })

      const completedAssessments = await prisma.aiConversation.count({
        where: {
          clientId,
          status: 'completed'
        }
      })

      const lastAssessment = await prisma.aiConversation.findFirst({
        where: { clientId },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return {
        total: totalAssessments,
        completed: completedAssessments,
        inProgress: totalAssessments - completedAssessments,
        byType: stats,
        lastAssessmentDate: lastAssessment?.createdAt
      }
    } catch (error) {
      console.error('Error fetching assessment stats:', error)
      throw error
    }
  }
}

export default AssessmentService
