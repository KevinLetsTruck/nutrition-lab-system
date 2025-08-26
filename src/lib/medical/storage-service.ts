import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface UploadOptions {
  contentType?: string;
  documentType?: string;
  metadata?: Record<string, string>;
}

interface UploadResult {
  id: string;
  url: string;
  key: string;
  bucket: string;
}

interface DownloadResult {
  buffer: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class S3StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private region: string;
  private isConfigured: boolean = false;

  constructor() {
    this.region = process.env.S3_REGION || "us-east-1";
    this.bucketName = process.env.S3_MEDICAL_BUCKET_NAME || "";

    // Check if S3 is properly configured
    if (process.env.S3_ACCESS_KEY_ID && 
        process.env.S3_SECRET_ACCESS_KEY && 
        this.bucketName) {
      
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      });
      this.isConfigured = true;
    } else {
      console.warn("⚠️ S3 not configured - documents will be stored as metadata only");
      this.isConfigured = false;
    }
  }

  private checkConfiguration(): void {
    if (!this.isConfigured) {
      throw new Error("S3 storage is not configured. Please set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_MEDICAL_BUCKET_NAME environment variables.");
    }
  }

  /**
   * Upload a file to S3 (or return fallback URL if S3 not configured)
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    clientId: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const key = `clients/${clientId}/documents/${fileName}`;

    // If S3 is not configured, return a fallback response
    if (!this.isConfigured) {
      console.warn(`⚠️ S3 not configured - document ${fileName} stored as metadata only`);
      
      return {
        id: key,
        url: `/api/documents/fallback/${clientId}/${encodeURIComponent(fileName)}`,
        key,
        bucket: "local-fallback",
      };
    }

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: options.contentType || "application/octet-stream",
      Metadata: {
        clientId,
        documentType: options.documentType || "unknown",
        uploadedAt: new Date().toISOString(),
        ...options.metadata,
      },
    };

    await this.s3Client!.send(new PutObjectCommand(uploadParams));

    return {
      id: key,
      url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
      key,
      bucket: this.bucketName,
    };
  }

  /**
   * Download a file from S3
   */
  async downloadFile(key: string): Promise<DownloadResult> {
    this.checkConfiguration();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    if (!response.Body) {
      throw new Error("File not found or empty");
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body as any;

    for await (const chunk of reader) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return {
      buffer,
      contentType: response.ContentType,
      metadata: response.Metadata,
    };
  }

  /**
   * Download a file using fileUrl (supports both S3 URLs and keys, handles fallback URLs)
   */
  async downloadFileByUrl(fileUrl: string): Promise<DownloadResult> {
    // Handle fallback URLs when S3 is not configured
    if (fileUrl.includes("/api/documents/fallback/")) {
      throw new Error("Document file not available - stored as metadata only (S3 not configured)");
    }

    // If S3 is not configured, we can't download
    if (!this.isConfigured) {
      throw new Error("S3 storage is not configured - cannot download files");
    }

    let key: string;

    // Handle different URL formats
    if (fileUrl.startsWith("http")) {
      // Extract key from full S3 URL
      const urlParts = fileUrl.split("/");
      key = urlParts.slice(3).join("/"); // Remove https://bucket.s3.region.amazonaws.com/
    } else if (fileUrl.startsWith("clients/")) {
      // Already a key
      key = fileUrl;
    } else {
      // Assume it's a relative path, might need adjustment based on your schema
      key = fileUrl.replace("/uploads/", "");
    }

    return this.downloadFile(key);
  }

  /**
   * Get a presigned URL for temporary access
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch (error: any) {
      if (error.name === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );
  }

  /**
   * Test S3 connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          MaxKeys: 1,
        })
      );
      return true;
    } catch (error) {
      console.error("S3 connection test failed:", error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string) {
    const response = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );

    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }
}

// Create lazy-loaded singleton instance
let _medicalDocStorageInstance: S3StorageService | null = null;

export const medicalDocStorage = {
  getInstance(): S3StorageService {
    if (!_medicalDocStorageInstance) {
      _medicalDocStorageInstance = new S3StorageService();
    }
    return _medicalDocStorageInstance;
  },

  // Proxy all methods to the lazy-loaded instance
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    clientId: string,
    options: UploadOptions = {}
  ) {
    return this.getInstance().uploadFile(
      fileBuffer,
      fileName,
      clientId,
      options
    );
  },

  async downloadFile(key: string) {
    return this.getInstance().downloadFile(key);
  },

  async downloadFileByUrl(fileUrl: string) {
    return this.getInstance().downloadFileByUrl(fileUrl);
  },

  async getPresignedUrl(key: string, expiresIn: number = 3600) {
    return this.getInstance().getPresignedUrl(key, expiresIn);
  },

  async fileExists(key: string) {
    return this.getInstance().fileExists(key);
  },

  async deleteFile(key: string) {
    return this.getInstance().deleteFile(key);
  },

  async testConnection() {
    return this.getInstance().testConnection();
  },

  async getFileMetadata(key: string) {
    return this.getInstance().getFileMetadata(key);
  },
};

// Legacy export for backward compatibility
export const storageService = medicalDocStorage;
