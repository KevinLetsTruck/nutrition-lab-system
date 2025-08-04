import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export interface Document {
  id: string
  clientId: string
  documentName: string
  documentType: string
  originalFilename?: string
  filePath?: string
  bucketName?: string
  mimeType?: string
  fileSizeBytes?: number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  metadata: any
}

export interface DocumentVersion {
  id: string
  documentId: string
  versionNumber: number
  extractedData: any
  enhancedData?: any
  ocrConfidence?: number
  processingMethod?: string
  changesFromPrevious?: any
  analysisResults?: any
  medicalTermsIdentified?: any
  validationStatus: 'pending' | 'validated' | 'rejected'
  validatedBy?: string
  validatedAt?: Date
  notes?: string
  createdAt: Date
  createdBy?: string
}

export interface VersionComparison {
  id: string
  documentId: string
  fromVersion: number
  toVersion: number
  fieldChanges: any
  addedValues?: any
  removedValues?: any
  modifiedValues?: any
  changeSummary?: string
  clinicalSignificance: 'critical' | 'significant' | 'minor' | 'none'
  createdAt: Date
  createdBy?: string
}

export interface DocumentAuditLog {
  id: string
  documentId: string
  versionId?: string
  action: 'created' | 'updated' | 'deleted' | 'validated' | 'compared'
  actionDetails?: any
  performedBy?: string
  performedAt: Date
  ipAddress?: string
  userAgent?: string
}

export class DocumentVersionService {
  /**
   * Create or update a document record
   */
  async upsertDocument(document: Partial<Document>): Promise<Document> {
    console.log('[DocumentVersionService] upsertDocument input:', document)
    
    // Convert camelCase to snake_case for database
    const dbDocument: any = {
      id: document.id,
      client_id: document.clientId,
      document_name: document.documentName,
      document_type: document.documentType,
      original_filename: document.originalFilename,
      file_path: document.filePath,
      bucket_name: document.bucketName,
      mime_type: document.mimeType,
      file_size_bytes: document.fileSizeBytes,
      is_active: document.isActive,
      metadata: document.metadata,
      updated_at: new Date().toISOString()
    }

    // Remove undefined values
    Object.keys(dbDocument).forEach(key => {
      if (dbDocument[key] === undefined) {
        delete dbDocument[key]
      }
    })

    console.log('[DocumentVersionService] dbDocument after cleanup:', dbDocument)

    const { data, error } = await supabase
      .from('documents')
      .upsert(dbDocument)
      .select()
      .single()

    if (error) {
      console.error('[DocumentVersionService] Supabase error:', error)
      throw new Error(`Failed to upsert document: ${error.message}`)
    }

    // Convert back to camelCase
    return {
      id: data.id,
      clientId: data.client_id,
      documentName: data.document_name,
      documentType: data.document_type,
      originalFilename: data.original_filename,
      filePath: data.file_path,
      bucketName: data.bucket_name,
      mimeType: data.mime_type,
      fileSizeBytes: data.file_size_bytes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active,
      metadata: data.metadata
    }
  }

  /**
   * Create a new version of a document
   */
  async createVersion(
    documentId: string,
    versionData: Partial<DocumentVersion>,
    userId?: string
  ): Promise<DocumentVersion> {
    // Convert camelCase to snake_case
    const dbVersion: any = {
      document_id: documentId,
      version_number: versionData.versionNumber,
      extracted_data: versionData.extractedData,
      enhanced_data: versionData.enhancedData,
      ocr_confidence: versionData.ocrConfidence,
      processing_method: versionData.processingMethod,
      changes_from_previous: versionData.changesFromPrevious,
      analysis_results: versionData.analysisResults,
      medical_terms_identified: versionData.medicalTermsIdentified,
      validation_status: versionData.validationStatus,
      validated_by: versionData.validatedBy,
      validated_at: versionData.validatedAt,
      notes: versionData.notes,
      created_by: userId
    }

    // Remove undefined values
    Object.keys(dbVersion).forEach(key => {
      if (dbVersion[key] === undefined) {
        delete dbVersion[key]
      }
    })

    const { data, error } = await supabase
      .from('document_versions')
      .insert(dbVersion)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create document version: ${error.message}`)
    }

    // Log the action
    await this.logAction(documentId, data.id, 'created', { version: data.version_number }, userId)

    // Convert back to camelCase
    return {
      id: data.id,
      documentId: data.document_id,
      versionNumber: data.version_number,
      extractedData: data.extracted_data,
      enhancedData: data.enhanced_data,
      ocrConfidence: data.ocr_confidence,
      processingMethod: data.processing_method,
      changesFromPrevious: data.changes_from_previous,
      analysisResults: data.analysis_results,
      medicalTermsIdentified: data.medical_terms_identified,
      validationStatus: data.validation_status,
      validatedBy: data.validated_by,
      validatedAt: data.validated_at ? new Date(data.validated_at) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by
    }
  }

  /**
   * Get all versions of a document
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })

    if (error) {
      throw new Error(`Failed to get document versions: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get a specific version of a document
   */
  async getVersion(documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .eq('version_number', versionNumber)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      throw new Error(`Failed to get document version: ${error.message}`)
    }

    return data
  }

  /**
   * Compare two versions of a document
   */
  async compareVersions(
    documentId: string,
    fromVersion: number,
    toVersion: number,
    userId?: string
  ): Promise<VersionComparison> {
    const [versionFrom, versionTo] = await Promise.all([
      this.getVersion(documentId, fromVersion),
      this.getVersion(documentId, toVersion)
    ])

    if (!versionFrom || !versionTo) {
      throw new Error('One or both versions not found')
    }

    // Calculate differences
    const fieldChanges = this.calculateFieldChanges(versionFrom, versionTo)
    const { added, removed, modified } = this.categorizeChanges(versionFrom, versionTo)
    const clinicalSignificance = this.assessClinicalSignificance(fieldChanges, versionFrom, versionTo)

    const comparison: Partial<VersionComparison> = {
      document_id: documentId,
      from_version: fromVersion,
      to_version: toVersion,
      field_changes: fieldChanges,
      added_values: added,
      removed_values: removed,
      modified_values: modified,
      change_summary: this.generateChangeSummary(fieldChanges),
      clinical_significance: clinicalSignificance,
      created_by: userId
    }

    const { data, error } = await supabase
      .from('version_comparisons')
      .insert(comparison)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create version comparison: ${error.message}`)
    }

    // Log the action
    await this.logAction(documentId, undefined, 'compared', { fromVersion, toVersion }, userId)

    return data
  }

  /**
   * Validate a document version
   */
  async validateVersion(
    documentId: string,
    versionNumber: number,
    validationStatus: 'validated' | 'rejected',
    notes: string,
    userId: string
  ): Promise<DocumentVersion> {
    const { data, error } = await supabase
      .from('document_versions')
      .update({
        validation_status: validationStatus,
        validated_by: userId,
        validated_at: new Date().toISOString(),
        notes
      })
      .eq('document_id', documentId)
      .eq('version_number', versionNumber)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to validate document version: ${error.message}`)
    }

    // Log the action
    await this.logAction(documentId, data.id, 'validated', { status: validationStatus }, userId)

    return data
  }

  /**
   * Get document history with all versions and comparisons
   */
  async getDocumentHistory(documentId: string): Promise<{
    document: Document
    versions: DocumentVersion[]
    comparisons: VersionComparison[]
    auditLog: DocumentAuditLog[]
  }> {
    const [document, versions, comparisons, auditLog] = await Promise.all([
      this.getDocument(documentId),
      this.getDocumentVersions(documentId),
      this.getVersionComparisons(documentId),
      this.getAuditLog(documentId)
    ])

    if (!document) {
      throw new Error('Document not found')
    }

    return {
      document,
      versions,
      comparisons,
      auditLog
    }
  }

  /**
   * Process a new document upload with versioning
   */
  async processDocumentUpload(
    clientId: string,
    fileName: string,
    documentType: string,
    extractedData: any,
    enhancedData?: any,
    metadata?: any,
    userId?: string
  ): Promise<{ document: Document; version: DocumentVersion }> {
    console.log('[DocumentVersionService] processDocumentUpload:', { clientId, fileName, documentType })
    
    // Check if document already exists
    const existingDoc = await this.findExistingDocument(clientId, fileName, documentType)
    console.log('[DocumentVersionService] Existing document:', existingDoc ? 'Found' : 'Not found', existingDoc?.id)

    let document: Document
    if (existingDoc) {
      // Update existing document - just update the timestamp
      console.log('[DocumentVersionService] Updating existing document')
      document = existingDoc // Use the existing document
      
      // Update the timestamp in the database
      const { error } = await supabase
        .from('documents')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingDoc.id)
      
      if (error) {
        console.error('[DocumentVersionService] Error updating document timestamp:', error)
      }
    } else {
      // Create new document - use camelCase for the service method
      console.log('[DocumentVersionService] Creating new document')
      document = await this.upsertDocument({
        clientId: clientId,
        documentName: fileName,
        documentType: documentType,
        originalFilename: fileName,
        metadata: metadata || {}
      })
    }

    // Create new version - use camelCase for the service method
    const version = await this.createVersion(
      document.id,
      {
        extractedData: extractedData,
        enhancedData: enhancedData,
        ocrConfidence: extractedData.ocrConfidence,
        processingMethod: extractedData.processingMethod || 'standard',
        analysisResults: extractedData.analysisResults,
        medicalTermsIdentified: extractedData.medicalTerms
      },
      userId
    )

    return { document, version }
  }

  // Private helper methods

  private async getDocument(documentId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get document: ${error.message}`)
    }

    return data
  }

  private async findExistingDocument(
    clientId: string,
    fileName: string,
    documentType: string
  ): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .eq('document_name', fileName)
      .eq('document_type', documentType)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('[DocumentVersionService] Error finding document:', error)
    }

    if (data) {
      // Convert snake_case to camelCase
      return {
        id: data.id,
        clientId: data.client_id,
        documentName: data.document_name,
        documentType: data.document_type,
        originalFilename: data.original_filename,
        filePath: data.file_path,
        bucketName: data.bucket_name,
        mimeType: data.mime_type,
        fileSizeBytes: data.file_size_bytes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isActive: data.is_active,
        metadata: data.metadata
      }
    }

    return null
  }

  private async getVersionComparisons(documentId: string): Promise<VersionComparison[]> {
    const { data, error } = await supabase
      .from('version_comparisons')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get version comparisons: ${error.message}`)
    }

    return data || []
  }

  private async getAuditLog(documentId: string): Promise<DocumentAuditLog[]> {
    const { data, error } = await supabase
      .from('document_audit_log')
      .select('*')
      .eq('document_id', documentId)
      .order('performed_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get audit log: ${error.message}`)
    }

    return data || []
  }

  private async logAction(
    documentId: string,
    versionId: string | undefined,
    action: DocumentAuditLog['action'],
    actionDetails: any,
    userId?: string
  ): Promise<void> {
    await supabase
      .from('document_audit_log')
      .insert({
        document_id: documentId,
        version_id: versionId,
        action,
        action_details: actionDetails,
        performed_by: userId
      })
  }

  private calculateFieldChanges(from: DocumentVersion, to: DocumentVersion): any {
    const changes: any = {}

    // Compare extracted data
    if (JSON.stringify(from.extractedData) !== JSON.stringify(to.extractedData)) {
      changes.extractedData = {
        from: from.extractedData,
        to: to.extractedData
      }
    }

    // Compare confidence scores
    if (from.ocrConfidence !== to.ocrConfidence) {
      changes.ocrConfidence = {
        from: from.ocrConfidence,
        to: to.ocrConfidence,
        change: to.ocrConfidence! - from.ocrConfidence!
      }
    }

    // Compare medical terms
    if (JSON.stringify(from.medicalTermsIdentified) !== JSON.stringify(to.medicalTermsIdentified)) {
      changes.medicalTerms = {
        from: from.medicalTermsIdentified,
        to: to.medicalTermsIdentified
      }
    }

    return changes
  }

  private categorizeChanges(from: DocumentVersion, to: DocumentVersion): {
    added: any
    removed: any
    modified: any
  } {
    // This is a simplified version - you would implement more sophisticated diffing
    const added: any = {}
    const removed: any = {}
    const modified: any = {}

    // Example: Compare medical terms
    const fromTerms = new Set(from.medicalTermsIdentified?.map((t: any) => t.term) || [])
    const toTerms = new Set(to.medicalTermsIdentified?.map((t: any) => t.term) || [])

    const addedTerms = [...toTerms].filter(t => !fromTerms.has(t))
    const removedTerms = [...fromTerms].filter(t => !toTerms.has(t))

    if (addedTerms.length > 0) added.medicalTerms = addedTerms
    if (removedTerms.length > 0) removed.medicalTerms = removedTerms

    return { added, removed, modified }
  }

  private assessClinicalSignificance(
    changes: any,
    from: DocumentVersion,
    to: DocumentVersion
  ): 'critical' | 'significant' | 'minor' | 'none' {
    // Assess based on confidence change
    if (changes.ocrConfidence) {
      const confidenceChange = Math.abs(changes.ocrConfidence.change)
      if (confidenceChange > 0.3) return 'critical'
      if (confidenceChange > 0.2) return 'significant'
      if (confidenceChange > 0.1) return 'minor'
    }

    // Assess based on medical terms changes
    if (changes.medicalTerms) {
      const fromCount = from.medicalTermsIdentified?.length || 0
      const toCount = to.medicalTermsIdentified?.length || 0
      const termChange = Math.abs(toCount - fromCount)
      
      if (termChange > 10) return 'significant'
      if (termChange > 5) return 'minor'
    }

    return Object.keys(changes).length > 0 ? 'minor' : 'none'
  }

  private generateChangeSummary(changes: any): string {
    const summaryParts: string[] = []

    if (changes.ocrConfidence) {
      const direction = changes.ocrConfidence.change > 0 ? 'increased' : 'decreased'
      summaryParts.push(`OCR confidence ${direction} by ${Math.abs(changes.ocrConfidence.change * 100).toFixed(1)}%`)
    }

    if (changes.medicalTerms) {
      summaryParts.push('Medical terms identified changed')
    }

    if (changes.extractedData) {
      summaryParts.push('Extracted data modified')
    }

    return summaryParts.join('; ') || 'No significant changes'
  }
}

// Export singleton instance
export const documentVersionService = new DocumentVersionService()