import path from 'path'
import { storageService, StorageFile } from './supabase-storage'

export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
}

// Configuration for file uploads
export const defaultFileConfig: FileUploadConfig = {
  maxSize: parseInt((process.env.MAX_FILE_SIZE || '10485760').trim()), // 10MB
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,txt').split(',').map(type => type.trim())
}

// Upload file to Supabase Storage
export async function saveFile(
  file: Buffer | File,
  filename: string,
  category?: string,
  metadata?: Record<string, any>
): Promise<StorageFile> {
  try {
    const result = await storageService.uploadFile(file, filename, category, metadata)
    
    if (!result.success || !result.file) {
      throw new Error(result.error || 'Upload failed')
    }
    
    return result.file
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Download file from Supabase Storage
export async function loadFile(bucket: string, path: string): Promise<Buffer | null> {
  try {
    return await storageService.downloadFile(bucket, path)
  } catch (error) {
    console.error('Error loading file:', error)
    return null
  }
}

// Get file URL from Supabase Storage
export async function getFileUrl(bucket: string, path: string, signed = false): Promise<string | null> {
  try {
    return await storageService.getFileUrl(bucket, path, signed)
  } catch (error) {
    console.error('Error getting file URL:', error)
    return null
  }
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    return await storageService.deleteFile(bucket, path)
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

export function validateFile(
  file: Express.Multer.File | File,
  config: FileUploadConfig = defaultFileConfig
): { valid: boolean; error?: string } {
  try {
    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${(config.maxSize / 1024 / 1024).toFixed(2)}MB`
      }
    }
    
    // Check file type
    const fileName = 'originalname' in file ? file.originalname : file.name
    const fileExtension = path.extname(fileName).toLowerCase().slice(1)
    if (!config.allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type ${fileExtension} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      }
    }
    
    return { valid: true }
  } catch (error) {
    console.error('Error validating file:', error)
    return {
      valid: false,
      error: 'File validation failed'
    }
  }
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, extension)
  
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`
}

// Helper function to get file info for logging
export function getFileInfo(file: Express.Multer.File | File) {
  const fileName = 'originalname' in file ? file.originalname : file.name
  const fileType = 'mimetype' in file ? file.mimetype : file.type
  
  return {
    name: fileName,
    size: file.size,
    type: fileType,
    extension: path.extname(fileName).toLowerCase()
  }
}

// Initialize storage buckets (call this during app startup)
export async function initializeStorage(): Promise<void> {
  try {
    await storageService.initializeBuckets()
    console.log('Storage buckets initialized successfully')
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error)
  }
}
