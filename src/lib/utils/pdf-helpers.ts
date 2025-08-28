import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// PDF generation configuration
export interface PDFConfig {
  format: 'A4' | 'Letter';
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground: boolean;
  preferCSSPageSize: boolean;
  displayHeaderFooter: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

// Default PDF configuration
export const DEFAULT_PDF_CONFIG: PDFConfig = {
  format: 'A4',
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.75in',
    left: '0.5in',
  },
  printBackground: true,
  preferCSSPageSize: false,
  displayHeaderFooter: true,
  footerTemplate: `
    <div style="
      font-size: 10px; 
      color: #666; 
      text-align: center; 
      width: 100%; 
      padding: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <span>Generated on <span class="date"></span> • Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>
  `,
};

// File storage configuration
export interface StorageConfig {
  type: 'local' | 's3';
  localPath?: string;
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

// PDF file metadata
export interface PDFFileMetadata {
  filename: string;
  filePath: string;
  url: string;
  size: number;
  pages?: number;
  generatedAt: Date;
  protocolId: string;
  clientId: string;
}

/**
 * Generate unique filename for PDF
 */
export function generatePDFFilename(protocolId: string, protocolName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedName = protocolName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  
  return `protocol_${protocolId}_${sanitizedName}_${timestamp}.pdf`;
}

/**
 * Get storage configuration from environment variables
 */
export function getStorageConfig(): StorageConfig {
  // Check if S3 is configured
  if (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  ) {
    return {
      type: 's3',
      s3: {
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };
  }

  // Fall back to local storage
  return {
    type: 'local',
    localPath: process.env.PDF_STORAGE_PATH || './public/generated-pdfs',
  };
}

/**
 * Create local storage directory if it doesn't exist
 */
export async function ensureLocalStorageDirectory(storagePath: string): Promise<void> {
  try {
    await fs.access(storagePath);
  } catch {
    await fs.mkdir(storagePath, { recursive: true });
  }
}

/**
 * Save PDF to local storage
 */
export async function saveToLocalStorage(
  buffer: Buffer,
  filename: string,
  storagePath: string
): Promise<PDFFileMetadata> {
  await ensureLocalStorageDirectory(storagePath);
  
  const filePath = path.join(storagePath, filename);
  await fs.writeFile(filePath, buffer);
  
  const stats = await fs.stat(filePath);
  
  return {
    filename,
    filePath,
    url: `/generated-pdfs/${filename}`,
    size: stats.size,
    generatedAt: new Date(),
    protocolId: extractProtocolIdFromFilename(filename),
    clientId: '', // Will be filled by caller
  };
}

/**
 * Upload PDF to S3 storage
 */
export async function uploadToS3(
  buffer: Buffer,
  filename: string,
  config: StorageConfig['s3']
): Promise<PDFFileMetadata> {
  if (!config) {
    throw new Error('S3 configuration is required');
  }

  const s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const key = `protocols/${filename}`;
  
  const uploadCommand = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
    ContentDisposition: `inline; filename="${filename}"`,
    Metadata: {
      'generated-at': new Date().toISOString(),
      'content-type': 'protocol-pdf',
    },
  });

  await s3Client.send(uploadCommand);

  // Generate presigned URL for access (expires in 7 days)
  const getCommand = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });
  
  const signedUrl = await getSignedUrl(s3Client, getCommand, { 
    expiresIn: 7 * 24 * 60 * 60 // 7 days
  });

  return {
    filename,
    filePath: key,
    url: signedUrl,
    size: buffer.length,
    generatedAt: new Date(),
    protocolId: extractProtocolIdFromFilename(filename),
    clientId: '', // Will be filled by caller
  };
}

/**
 * Save PDF buffer to configured storage
 */
export async function savePDFToStorage(
  buffer: Buffer,
  filename: string,
  protocolId: string,
  clientId: string
): Promise<PDFFileMetadata> {
  const config = getStorageConfig();
  
  let metadata: PDFFileMetadata;
  
  if (config.type === 's3' && config.s3) {
    metadata = await uploadToS3(buffer, filename, config.s3);
  } else {
    metadata = await saveToLocalStorage(
      buffer,
      filename,
      config.localPath || './public/generated-pdfs'
    );
  }
  
  // Fill in the client ID
  metadata.clientId = clientId;
  metadata.protocolId = protocolId;
  
  return metadata;
}

/**
 * Extract protocol ID from filename
 */
function extractProtocolIdFromFilename(filename: string): string {
  const match = filename.match(/protocol_([^_]+)_/);
  return match ? match[1] : '';
}

/**
 * Calculate PDF page count from buffer (approximate)
 * This is a simple heuristic - for accurate page counts, you'd need to parse the PDF
 */
export function estimatePDFPageCount(buffer: Buffer): number {
  const pdfString = buffer.toString();
  const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g);
  return pageMatches ? pageMatches.length : 1;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  const cleanupPromises = filePaths.map(async (filePath) => {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to cleanup temp file ${filePath}:`, error);
    }
  });
  
  await Promise.all(cleanupPromises);
}

/**
 * Validate PDF buffer
 */
export function validatePDFBuffer(buffer: Buffer): boolean {
  // Check if buffer starts with PDF signature
  return buffer.length > 0 && buffer.toString('ascii', 0, 4) === '%PDF';
}

/**
 * Get PDF generation options for different paper sizes
 */
export function getPDFConfigForPaperSize(paperSize: 'A4' | 'Letter'): PDFConfig {
  return {
    ...DEFAULT_PDF_CONFIG,
    format: paperSize,
    margin: paperSize === 'Letter' 
      ? {
          top: '0.75in',
          right: '0.75in', 
          bottom: '1in',
          left: '0.75in',
        }
      : DEFAULT_PDF_CONFIG.margin,
  };
}

/**
 * Create safe filename from protocol name
 */
export function createSafeFilename(input: string): string {
  return input
    .replace(/[^a-z0-9\-_\s]/gi, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase()
    .substring(0, 50); // Limit length
}

/**
 * Generate download headers for PDF response
 */
export function getPDFDownloadHeaders(filename: string, inline: boolean = true): Record<string, string> {
  const disposition = inline ? 'inline' : 'attachment';
  
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${disposition}; filename="${filename}"`,
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Expires': '-1',
    'Pragma': 'no-cache',
  };
}
