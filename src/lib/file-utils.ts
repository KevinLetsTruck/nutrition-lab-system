import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { tmpdir } from 'os'

export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  uploadDir: string
}

// For serverless environments, we'll use a simple in-memory approach
// In production, you'd want to use cloud storage like AWS S3 or Supabase Storage
export const defaultFileConfig: FileUploadConfig = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,txt').split(','),
  uploadDir: process.env.UPLOAD_DIR || './uploads' // Fallback to local directory
}

export async function saveFile(
  file: Buffer,
  filename: string,
  subdirectory: string = ''
): Promise<string> {
  try {
    // For now, we'll just return a virtual path since we can't write to filesystem in serverless
    // In production, you'd upload to cloud storage here
    const virtualPath = path.join(subdirectory, filename)
    
    // TODO: In production, implement cloud storage upload here
    // For example: await uploadToSupabaseStorage(file, filename, subdirectory)
    
    return virtualPath
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function validateFile(
  file: Express.Multer.File,
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
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1)
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
