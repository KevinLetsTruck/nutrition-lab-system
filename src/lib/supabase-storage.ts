import { createServerSupabaseClient } from './supabase'

export interface StorageFile {
  path: string
  url: string
  size: number
  type: string
  bucket: string
  metadata?: Record<string, any>
}

export interface UploadResult {
  success: boolean
  file?: StorageFile
  error?: string
}

export class SupabaseStorageService {
  private client: any

  constructor() {
    this.client = createServerSupabaseClient()
  }

  // Storage bucket names
  static readonly BUCKETS = {
    LAB_FILES: 'lab-files',
    CGM_IMAGES: 'cgm-images', 
    FOOD_PHOTOS: 'food-photos',
    MEDICAL_RECORDS: 'medical-records',
    SUPPLEMENTS: 'supplements',
    GENERAL: 'general'
  } as const

  // Initialize storage buckets (run once during setup)
  async initializeBuckets() {
    const buckets = Object.values(SupabaseStorageService.BUCKETS)
    
    for (const bucketName of buckets) {
      try {
        const { data, error } = await this.client.storage.getBucket(bucketName)
        
        if (error && error.message.includes('not found')) {
          // Create bucket if it doesn't exist
          const { error: createError } = await this.client.storage.createBucket(bucketName, {
            public: false,
            allowedMimeTypes: this.getAllowedMimeTypes(bucketName),
            fileSizeLimit: 10485760 // 10MB
          })
          
          if (createError) {
            console.error(`Failed to create bucket ${bucketName}:`, createError)
          } else {
            console.log(`Created bucket: ${bucketName}`)
          }
        }
      } catch (error) {
        console.error(`Error checking/creating bucket ${bucketName}:`, error)
      }
    }
  }

  // Get allowed MIME types for each bucket
  private getAllowedMimeTypes(bucketName: string): string[] {
    switch (bucketName) {
      case SupabaseStorageService.BUCKETS.LAB_FILES:
        return ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain', 'text/csv']
      case SupabaseStorageService.BUCKETS.CGM_IMAGES:
        return ['image/jpeg', 'image/png', 'image/jpg', 'text/csv', 'text/plain']
      case SupabaseStorageService.BUCKETS.FOOD_PHOTOS:
        return ['image/jpeg', 'image/png', 'image/jpg']
      case SupabaseStorageService.BUCKETS.MEDICAL_RECORDS:
        return ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain']
      case SupabaseStorageService.BUCKETS.SUPPLEMENTS:
        return ['image/jpeg', 'image/png', 'image/jpg']
      case SupabaseStorageService.BUCKETS.GENERAL:
        return ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/csv', 'text/plain']
      default:
        return ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain']
    }
  }

  // Determine bucket based on file type and content
  private getBucketForFile(fileName: string, mimeType: string, category?: string): string {
    const lowerFileName = fileName.toLowerCase()
    
    // If category is specified, use it
    if (category) {
      switch (category) {
        case 'lab_reports':
          return SupabaseStorageService.BUCKETS.LAB_FILES
        case 'cgm_data':
          return SupabaseStorageService.BUCKETS.CGM_IMAGES
        case 'food_photos':
          return SupabaseStorageService.BUCKETS.FOOD_PHOTOS
        case 'medical_records':
          return SupabaseStorageService.BUCKETS.MEDICAL_RECORDS
        case 'supplements':
          return SupabaseStorageService.BUCKETS.SUPPLEMENTS
        default:
          return SupabaseStorageService.BUCKETS.GENERAL
      }
    }
    
    // Auto-detect based on filename and MIME type
    if (mimeType === 'application/pdf') {
      if (lowerFileName.includes('lab') || lowerFileName.includes('test') || 
          lowerFileName.includes('blood') || lowerFileName.includes('urine') ||
          lowerFileName.includes('stool') || lowerFileName.includes('hormone')) {
        return SupabaseStorageService.BUCKETS.LAB_FILES
      }
      if (lowerFileName.includes('medical') || lowerFileName.includes('record') ||
          lowerFileName.includes('doctor') || lowerFileName.includes('consultation')) {
        return SupabaseStorageService.BUCKETS.MEDICAL_RECORDS
      }
      return SupabaseStorageService.BUCKETS.GENERAL
    }
    
    if (mimeType.startsWith('image/')) {
      if (lowerFileName.includes('cgm') || lowerFileName.includes('glucose') ||
          lowerFileName.includes('blood sugar') || lowerFileName.includes('dexcom')) {
        return SupabaseStorageService.BUCKETS.CGM_IMAGES
      }
      if (lowerFileName.includes('food') || lowerFileName.includes('meal') ||
          lowerFileName.includes('diet') || lowerFileName.includes('nutrition')) {
        return SupabaseStorageService.BUCKETS.FOOD_PHOTOS
      }
      if (lowerFileName.includes('supplement') || lowerFileName.includes('vitamin') ||
          lowerFileName.includes('pill') || lowerFileName.includes('capsule')) {
        return SupabaseStorageService.BUCKETS.SUPPLEMENTS
      }
      return SupabaseStorageService.BUCKETS.GENERAL
    }
    
    if (mimeType === 'text/csv') {
      if (lowerFileName.includes('cgm') || lowerFileName.includes('glucose')) {
        return SupabaseStorageService.BUCKETS.CGM_IMAGES
      }
      return SupabaseStorageService.BUCKETS.GENERAL
    }
    
    return SupabaseStorageService.BUCKETS.GENERAL
  }

  // Upload file to Supabase Storage
  async uploadFile(
    file: File | Buffer,
    fileName: string,
    category?: string,
    metadata?: Record<string, any>
  ): Promise<UploadResult> {
    try {
      const mimeType = file instanceof File ? file.type : 'application/octet-stream'
      const fileSize = file instanceof File ? file.size : (file as Buffer).length
      
      // Determine bucket
      const bucket = this.getBucketForFile(fileName, mimeType, category)
      
      // Generate unique path
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
      const nameWithoutExt = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName
      const uniqueFileName = `${nameWithoutExt}_${timestamp}_${randomString}${extension ? '.' + extension : ''}`
      
      // Create path with date-based organization
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const path = `${year}/${month}/${day}/${uniqueFileName}`
      
      // Upload file
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file, {
          contentType: mimeType,
          upsert: false,
          metadata: {
            originalName: fileName,
            size: fileSize,
            uploadedAt: new Date().toISOString(),
            category,
            ...metadata
          }
        })
      
      if (error) {
        console.error('Upload error:', error)
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        }
      }
      
      // Get public URL
      const { data: urlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(path)
      
      const storageFile: StorageFile = {
        path,
        url: urlData.publicUrl,
        size: fileSize,
        type: mimeType,
        bucket,
        metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          category,
          ...metadata
        }
      }
      
      return {
        success: true,
        file: storageFile
      }
      
    } catch (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  // Download file from Supabase Storage
  async downloadFile(bucket: string, path: string): Promise<Buffer | null> {
    console.log('[STORAGE] downloadFile called with:', { bucket, path })
    
    try {
      console.log('[STORAGE] Attempting to download from Supabase Storage...')
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path)
      
      if (error) {
        console.error('[STORAGE] Download error from Supabase:', error)
        console.error('[STORAGE] Error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode,
          name: error.name
        })
        return null
      }
      
      console.log('[STORAGE] Download successful, converting to Buffer...')
      
      // Convert to Buffer
      const arrayBuffer = await data.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      console.log('[STORAGE] Buffer created, size:', buffer.length)
      return buffer
      
    } catch (error) {
      console.error('[STORAGE] Storage download error:', error)
      console.error('[STORAGE] Error type:', typeof error)
      console.error('[STORAGE] Error details:', error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error)
      return null
    }
  }

  // Get file URL (public or signed)
  async getFileUrl(bucket: string, path: string, signed = false): Promise<string | null> {
    try {
      if (signed) {
        const { data, error } = await this.client.storage
          .from(bucket)
          .createSignedUrl(path, 3600) // 1 hour expiry
        
        if (error) {
          console.error('Signed URL error:', error)
          return null
        }
        
        return data.signedUrl
      } else {
        const { data } = this.client.storage
          .from(bucket)
          .getPublicUrl(path)
        
        return data.publicUrl
      }
    } catch (error) {
      console.error('Get URL error:', error)
      return null
    }
  }

  // Delete file from Supabase Storage
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([path])
      
      if (error) {
        console.error('Delete error:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Storage delete error:', error)
      return false
    }
  }

  // List files in a bucket
  async listFiles(bucket: string, folder?: string): Promise<StorageFile[]> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .list(folder || '')
      
      if (error) {
        console.error('List files error:', error)
        return []
      }
      
      return data.map((file: any) => ({
        path: file.name,
        url: this.client.storage.from(bucket).getPublicUrl(file.name).data.publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'application/octet-stream',
        bucket,
        metadata: file.metadata
      }))
    } catch (error) {
      console.error('List files error:', error)
      return []
    }
  }

  // Get file metadata
  async getFileMetadata(bucket: string, path: string): Promise<any> {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'))
      
      if (error) {
        console.error('Get metadata error:', error)
        return null
      }
      
      const fileName = path.split('/').pop()
      const file = data.find((f: any) => f.name === fileName)
      
      return file?.metadata || null
    } catch (error) {
      console.error('Get metadata error:', error)
      return null
    }
  }
}

// Export singleton instance
export const storageService = new SupabaseStorageService() 