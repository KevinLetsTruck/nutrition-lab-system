// Storage Configuration for Medical Documents
import { S3Client } from "@aws-sdk/client-s3";
import { v2 as cloudinary } from "cloudinary";

export type StorageProvider = "S3" | "CLOUDINARY" | "LOCAL";

// Storage configuration interface
export interface StorageConfig {
  provider: StorageProvider;
  maxFileSize: number;
  allowedTypes: string[];
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyId?: string;
  };
}

// Get storage configuration from environment
export function getStorageConfig(): StorageConfig {
  return {
    provider:
      (process.env.DOCUMENT_STORAGE_PROVIDER as StorageProvider) || "LOCAL",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB default
    allowedTypes: (
      process.env.ALLOWED_FILE_TYPES || "pdf,jpg,jpeg,png,tiff,doc,docx,txt"
    ).split(","),
    encryption: {
      enabled: process.env.MEDICAL_DOC_ENCRYPTION_KEY ? true : false,
      algorithm: "aes-256-gcm",
      keyId: process.env.MEDICAL_DOC_ENCRYPTION_KEY,
    },
  };
}

// AWS S3 Configuration
export class S3Config {
  private static instance: S3Client;

  static getInstance(): S3Client {
    if (!S3Config.instance) {
      if (
        !process.env.AWS_ACCESS_KEY_ID ||
        !process.env.AWS_SECRET_ACCESS_KEY
      ) {
        throw new Error("AWS credentials not configured");
      }

      S3Config.instance = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
    return S3Config.instance;
  }

  static getBucketName(): string {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new Error("AWS S3 bucket not configured");
    }
    return bucket;
  }

  static getRegion(): string {
    return process.env.AWS_S3_REGION || process.env.AWS_REGION || "us-east-1";
  }
}

// Cloudinary Configuration
export class CloudinaryConfig {
  private static configured = false;

  static configure() {
    if (CloudinaryConfig.configured) return;

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary credentials not configured");
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    CloudinaryConfig.configured = true;
  }

  static getInstance() {
    CloudinaryConfig.configure();
    return cloudinary;
  }

  static getUploadPreset(): string {
    return process.env.CLOUDINARY_UPLOAD_PRESET || "medical_documents";
  }

  static getFolder(): string {
    return process.env.CLOUDINARY_FOLDER || "fntp-medical-docs";
  }
}

// File validation utilities
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFile(file: File): FileValidationResult {
  const config = getStorageConfig();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (file.size > config.maxFileSize) {
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(
        config.maxFileSize /
        1024 /
        1024
      ).toFixed(2)}MB`
    );
  }

  // Check file type
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !config.allowedTypes.includes(fileExtension)) {
    errors.push(
      `File type '.${fileExtension}' is not allowed. Allowed types: ${config.allowedTypes.join(
        ", "
      )}`
    );
  }

  // Security checks
  const dangerousExtensions = ["exe", "bat", "cmd", "scr", "vbs", "js", "jar"];
  if (fileExtension && dangerousExtensions.includes(fileExtension)) {
    errors.push("File type blocked for security reasons");
  }

  // MIME type validation
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedMimeTypes.includes(file.type)) {
    warnings.push(`MIME type '${file.type}' may not be supported`);
  }

  // File name validation
  if (file.name.length > 255) {
    errors.push("File name too long (maximum 255 characters)");
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [/\.\./g, /[<>:"|?*]/g];
  if (suspiciousPatterns.some((pattern) => pattern.test(file.name))) {
    errors.push("File name contains invalid characters");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Generate secure file names
export function generateSecureFileName(
  originalName: string,
  clientId?: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);

  // Extract and sanitize extension
  const parts = originalName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const baseName = parts
    .join(".")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50);

  // Include client ID prefix for organization
  const prefix = clientId ? `${clientId.substring(0, 8)}_` : "";

  return `${prefix}${timestamp}_${randomString}_${baseName}${
    extension ? "." + extension : ""
  }`;
}

// Storage path utilities
export function getStoragePath(
  fileName: string,
  clientId: string,
  documentType?: string
): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  return `medical-docs/${year}/${month}/${clientId}/${
    documentType || "general"
  }/${fileName}`;
}

// Encryption utilities for local storage
export async function encryptFileBuffer(
  buffer: Buffer,
  key: string
): Promise<Buffer> {
  if (!key || key.length !== 32) {
    throw new Error("Invalid encryption key - must be 32 characters");
  }

  const crypto = await import("crypto");
  const algorithm = "aes-256-gcm";
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, key);
  cipher.setIV(iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine IV, authTag, and encrypted data
  return Buffer.concat([iv, authTag, encrypted]);
}

export async function decryptFileBuffer(
  encryptedBuffer: Buffer,
  key: string
): Promise<Buffer> {
  if (!key || key.length !== 32) {
    throw new Error("Invalid decryption key - must be 32 characters");
  }

  const crypto = await import("crypto");
  const algorithm = "aes-256-gcm";

  // Extract IV, authTag, and encrypted data
  const iv = encryptedBuffer.slice(0, 16);
  const authTag = encryptedBuffer.slice(16, 32);
  const encrypted = encryptedBuffer.slice(32);

  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setIV(iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// Health check for storage services
export async function checkStorageHealth(): Promise<{
  provider: StorageProvider;
  status: "healthy" | "unhealthy";
  details: Record<string, any>;
}> {
  const config = getStorageConfig();

  try {
    switch (config.provider) {
      case "S3":
        const s3 = S3Config.getInstance();
        await s3.send({ input: { Bucket: S3Config.getBucketName() } } as any);
        return {
          provider: "S3",
          status: "healthy",
          details: {
            bucket: S3Config.getBucketName(),
            region: S3Config.getRegion(),
          },
        };

      case "CLOUDINARY":
        const cloudinary = CloudinaryConfig.getInstance();
        await cloudinary.api.ping();
        return {
          provider: "CLOUDINARY",
          status: "healthy",
          details: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          },
        };

      case "LOCAL":
        const fs = await import("fs/promises");
        const uploadDir = "./public/uploads";
        await fs.access(uploadDir);
        return {
          provider: "LOCAL",
          status: "healthy",
          details: {
            uploadDir,
          },
        };

      default:
        throw new Error(`Unknown storage provider: ${config.provider}`);
    }
  } catch (error) {
    return {
      provider: config.provider,
      status: "unhealthy",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
