import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  uploadDir: string
}

export const defaultFileConfig: FileUploadConfig = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png').split(','),
  uploadDir: process.env.UPLOAD_DIR || './uploads'
}

export async function saveFile(
  file: Buffer,
  filename: string,
  subdirectory: string = ''
): Promise<string> {
  const uploadPath = path.join(defaultFileConfig.uploadDir, subdirectory)
  
  // Ensure directory exists
  await mkdir(uploadPath, { recursive: true })
  
  const filePath = path.join(uploadPath, filename)
  await writeFile(filePath, file)
  
  return filePath
}

export function validateFile(
  file: Express.Multer.File,
  config: FileUploadConfig = defaultFileConfig
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.maxSize} bytes`
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
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = path.extname(originalName)
  const nameWithoutExt = path.basename(originalName, extension)
  
  return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`
}
