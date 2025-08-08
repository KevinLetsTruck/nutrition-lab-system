import { prisma } from '@/lib/prisma'
import { ProcessingStatus } from '@prisma/client'

export interface DocumentUploadInput {
  clientId: string
  fileName: string
  fileType: string
  fileSize: number
  storageUrl: string
  publicUrl?: string
  metadata?: any
}

export interface DocumentUpdateInput {
  publicUrl?: string
  metadata?: any
  status?: ProcessingStatus
  analysisResults?: any
  notes?: string
}

export class DocumentService {
  /**
   * Store document record after file upload
   */
  static async uploadDocument(clientId: string, fileData: DocumentUploadInput) {
    try {
      // Verify client exists
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      })

      if (!client) {
        throw new Error('Client not found')
      }

      // Create document record
      const document = await prisma.clientFile.create({
        data: {
          clientId,
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize,
          storageUrl: fileData.storageUrl,
          publicUrl: fileData.publicUrl,
          metadata: fileData.metadata || {}
        }
      })

      // If this is a lab report, create a lab report record
      if (fileData.metadata?.reportType) {
        await prisma.labReport.create({
          data: {
            clientId,
            reportType: fileData.metadata.reportType,
            reportDate: fileData.metadata.reportDate || new Date(),
            status: 'PENDING',
            filePath: fileData.storageUrl,
            fileSize: fileData.fileSize,
            notes: fileData.metadata.notes
          }
        })
      }

      return document
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  /**
   * Get all documents for a client
   */
  static async getDocumentsByClient(clientId: string, options?: { 
    limit?: number, 
    offset?: number,
    fileType?: string 
  }) {
    try {
      const where: any = { clientId }
      
      if (options?.fileType) {
        where.fileType = options.fileType
      }

      const documents = await prisma.clientFile.findMany({
        where,
        take: options?.limit || 50,
        skip: options?.offset || 0,
        orderBy: {
          uploadedAt: 'desc'
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      // Also get count for pagination
      const total = await prisma.clientFile.count({ where })

      return {
        documents,
        total,
        hasMore: (options?.offset || 0) + documents.length < total
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  }

  /**
   * Update document processing status
   */
  static async updateProcessingStatus(
    id: string, 
    status: ProcessingStatus, 
    data?: {
      analysisResults?: any
      notes?: string
      publicUrl?: string
    }
  ) {
    try {
      // First, find if this document has an associated lab report
      const labReport = await prisma.labReport.findFirst({
        where: {
          filePath: {
            contains: id
          }
        }
      })

      if (labReport) {
        // Update lab report status
        await prisma.labReport.update({
          where: { id: labReport.id },
          data: {
            status,
            analysisResults: data?.analysisResults,
            notes: data?.notes,
            updatedAt: new Date()
          }
        })
      }

      // Update the document metadata
      const document = await prisma.clientFile.update({
        where: { id },
        data: {
          publicUrl: data?.publicUrl,
          metadata: {
            ...data,
            processingStatus: status,
            processedAt: status === 'COMPLETED' ? new Date() : undefined
          }
        }
      })

      return document
    } catch (error) {
      console.error('Error updating document status:', error)
      throw error
    }
  }

  /**
   * Get documents pending processing
   */
  static async getDocumentsForProcessing(limit: number = 10) {
    try {
      // Get lab reports that are pending
      const pendingReports = await prisma.labReport.findMany({
        where: {
          status: 'PENDING'
        },
        take: limit,
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          client: true
        }
      })

      // Also check for client files that might need processing
      const pendingFiles = await prisma.clientFile.findMany({
        where: {
          metadata: {
            path: ['processingStatus'],
            equals: 'PENDING'
          }
        },
        take: limit,
        orderBy: {
          uploadedAt: 'asc'
        },
        include: {
          client: true
        }
      })

      return {
        labReports: pendingReports,
        clientFiles: pendingFiles
      }
    } catch (error) {
      console.error('Error fetching documents for processing:', error)
      throw error
    }
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string) {
    try {
      const document = await prisma.clientFile.findUnique({
        where: { id },
        include: {
          client: true
        }
      })

      if (!document) {
        throw new Error('Document not found')
      }

      return document
    } catch (error) {
      console.error('Error fetching document:', error)
      throw error
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(id: string) {
    try {
      // Check if document has associated lab report
      const labReport = await prisma.labReport.findFirst({
        where: {
          filePath: {
            contains: id
          }
        }
      })

      if (labReport) {
        // Delete lab report first
        await prisma.labReport.delete({
          where: { id: labReport.id }
        })
      }

      // Delete the document
      await prisma.clientFile.delete({
        where: { id }
      })

      return { success: true, id }
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  /**
   * Get recent uploads
   */
  static async getRecentUploads(limit: number = 10) {
    try {
      const documents = await prisma.clientFile.findMany({
        take: limit,
        orderBy: {
          uploadedAt: 'desc'
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      return documents
    } catch (error) {
      console.error('Error fetching recent uploads:', error)
      throw error
    }
  }

  /**
   * Get document statistics
   */
  static async getDocumentStats() {
    try {
      const [totalDocuments, totalSize, byType] = await Promise.all([
        prisma.clientFile.count(),
        prisma.clientFile.aggregate({
          _sum: {
            fileSize: true
          }
        }),
        prisma.clientFile.groupBy({
          by: ['fileType'],
          _count: true,
          _sum: {
            fileSize: true
          }
        })
      ])

      return {
        totalDocuments,
        totalSize: totalSize._sum.fileSize || 0,
        byType: byType.map(item => ({
          type: item.fileType,
          count: item._count,
          size: item._sum.fileSize || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching document stats:', error)
      throw error
    }
  }
}

export default DocumentService
