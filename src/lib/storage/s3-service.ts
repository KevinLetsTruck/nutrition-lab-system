// AWS S3 Storage Service for Medical Documents
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Config, getStoragePath, encryptFileBuffer } from "./config";

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  etag?: string;
}

export interface S3DownloadResult {
  buffer: Buffer;
  contentType: string;
  size: number;
  lastModified?: Date;
}

export class S3StorageService {
  private s3Client = S3Config.getInstance();
  private bucketName = S3Config.getBucketName();

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    clientId: string,
    options: {
      contentType?: string;
      documentType?: string;
      encrypt?: boolean;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<S3UploadResult> {
    try {
      const {
        contentType,
        documentType,
        encrypt = true,
        metadata = {},
      } = options;

      // Generate storage path
      const key = getStoragePath(fileName, clientId, documentType);

      // Encrypt file if enabled
      let finalBuffer = buffer;
      if (encrypt && process.env.MEDICAL_DOC_ENCRYPTION_KEY) {
        finalBuffer = await encryptFileBuffer(
          buffer,
          process.env.MEDICAL_DOC_ENCRYPTION_KEY
        );
        metadata["encrypted"] = "true";
        metadata["encryption-algorithm"] = "aes-256-gcm";
      }

      // Prepare S3 metadata
      const s3Metadata = {
        "client-id": clientId,
        "document-type": documentType || "unknown",
        "original-filename": fileName,
        "upload-timestamp": new Date().toISOString(),
        "hipaa-compliant": "true",
        ...metadata,
      };

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: finalBuffer,
        ContentType: contentType || "application/octet-stream",
        Metadata: s3Metadata,
        ServerSideEncryption: "AES256", // Server-side encryption
        StorageClass: "STANDARD_IA", // Infrequent Access for cost optimization
        TagSet: [
          { Key: "Type", Value: "medical-document" },
          { Key: "ClientId", Value: clientId },
          { Key: "Environment", Value: process.env.NODE_ENV || "development" },
        ],
      });

      const result = await this.s3Client.send(command);
      const url = `https://${
        this.bucketName
      }.s3.${S3Config.getRegion()}.amazonaws.com/${key}`;

      return {
        key,
        url,
        bucket: this.bucketName,
        size: finalBuffer.length,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(
        `Failed to upload file to S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async downloadFile(key: string): Promise<S3DownloadResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result = await this.s3Client.send(command);

      if (!result.Body) {
        throw new Error("File not found or empty");
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = result.Body as ReadableStream;
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      const buffer = Buffer.concat(chunks);

      return {
        buffer,
        contentType: result.ContentType || "application/octet-stream",
        size: result.ContentLength || buffer.length,
        lastModified: result.LastModified,
      };
    } catch (error) {
      console.error("S3 download error:", error);
      throw new Error(
        `Failed to download file from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error(
        `Failed to delete file from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileMetadata(key: string): Promise<Record<string, any>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result = await this.s3Client.send(command);

      return {
        size: result.ContentLength,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata || {},
        encrypted: result.ServerSideEncryption === "AES256",
      };
    } catch (error) {
      console.error("S3 metadata error:", error);
      throw new Error(
        `Failed to get file metadata from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generatePresignedUrl(
    key: string,
    operation: "get" | "put" = "get",
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command =
        operation === "get"
          ? new GetObjectCommand({ Bucket: this.bucketName, Key: key })
          : new PutObjectCommand({ Bucket: this.bucketName, Key: key });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error("S3 presigned URL error:", error);
      throw new Error(
        `Failed to generate presigned URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async listFiles(
    prefix: string,
    maxKeys: number = 100
  ): Promise<
    Array<{
      key: string;
      size: number;
      lastModified: Date;
      etag: string;
    }>
  > {
    try {
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const result = await this.s3Client.send(command);

      return (result.Contents || []).map((obj) => ({
        key: obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified!,
        etag: obj.ETag!,
      }));
    } catch (error) {
      console.error("S3 list error:", error);
      throw new Error(
        `Failed to list files from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const { CopyObjectCommand } = await import("@aws-sdk/client-s3");

      const command = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey,
        MetadataDirective: "COPY",
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("S3 copy error:", error);
      throw new Error(
        `Failed to copy file in S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getStorageUsage(prefix?: string): Promise<{
    fileCount: number;
    totalSize: number;
    averageSize: number;
  }> {
    try {
      const files = await this.listFiles(prefix || "", 1000);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      return {
        fileCount: files.length,
        totalSize,
        averageSize: files.length > 0 ? totalSize / files.length : 0,
      };
    } catch (error) {
      console.error("S3 storage usage error:", error);
      throw new Error(
        `Failed to get storage usage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Batch operations for efficiency
  async uploadMultipleFiles(
    files: Array<{
      buffer: Buffer;
      fileName: string;
      clientId: string;
      options?: any;
    }>
  ): Promise<S3UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.fileName, file.clientId, file.options)
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("S3 batch upload error:", error);
      throw new Error(
        `Failed to upload multiple files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteMultipleFiles(keys: string[]): Promise<void> {
    try {
      const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("S3 batch delete error:", error);
      throw new Error(
        `Failed to delete multiple files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
