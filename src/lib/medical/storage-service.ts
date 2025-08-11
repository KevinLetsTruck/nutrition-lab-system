/**
 * Medical Document Storage Service
 * 
 * Handles document storage for medical files
 * Currently stubbed for testing - replace with real S3 implementation
 */

export class MedicalDocumentStorage {
  private isStubMode = true

  async uploadDocument(
    file: Buffer, 
    filename: string, 
    mimeType: string, 
    clientId?: string
  ): Promise<{ key: string; url: string }> {
    console.log(`[STORAGE${this.isStubMode ? ' STUB' : ''}] Uploading ${filename} (${mimeType}) for client ${clientId || 'standalone'}`)
    
    if (this.isStubMode) {
      // Return fake S3 response for testing
      const key = `stub-key-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const url = `https://stub-bucket.s3.amazonaws.com/${key}`
      
      console.log(`[STORAGE STUB] Generated fake key: ${key}`)
      console.log(`[STORAGE STUB] Generated fake URL: ${url}`)
      
      return { key, url }
    }

    // TODO: Implement real S3 upload
    throw new Error('Real S3 implementation not configured')
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    console.log(`[STORAGE${this.isStubMode ? ' STUB' : ''}] Generating signed URL for ${key}`)
    
    if (this.isStubMode) {
      const signedUrl = `https://stub-bucket.s3.amazonaws.com/${key}?X-Amz-Signature=stub-signature&X-Amz-Expires=3600`
      console.log(`[STORAGE STUB] Generated signed URL: ${signedUrl}`)
      return signedUrl
    }

    // TODO: Implement real S3 signed URL generation
    throw new Error('Real S3 implementation not configured')
  }

  async deleteDocument(key: string): Promise<void> {
    console.log(`[STORAGE${this.isStubMode ? ' STUB' : ''}] Deleting document ${key}`)
    
    if (this.isStubMode) {
      console.log(`[STORAGE STUB] Would delete ${key} from S3`)
      return
    }

    // TODO: Implement real S3 deletion
    throw new Error('Real S3 implementation not configured')
  }

  async checkDocumentExists(key: string): Promise<boolean> {
    console.log(`[STORAGE${this.isStubMode ? ' STUB' : ''}] Checking if ${key} exists`)
    
    if (this.isStubMode) {
      // Return true for stub mode
      console.log(`[STORAGE STUB] Document ${key} exists (stub response)`)
      return true
    }

    // TODO: Implement real S3 existence check
    throw new Error('Real S3 implementation not configured')
  }

  // Configuration methods
  enableRealS3Mode(): void {
    this.isStubMode = false
    console.log('[STORAGE] Switched to real S3 mode')
  }

  enableStubMode(): void {
    this.isStubMode = true
    console.log('[STORAGE] Switched to stub mode')
  }

  isInStubMode(): boolean {
    return this.isStubMode
  }
}

// Export singleton instance
export const medicalDocStorage = new MedicalDocumentStorage()

// For testing - allow switching modes
export { MedicalDocumentStorage }
