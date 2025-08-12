// Unified Storage Service for Medical Documents
import { getStorageConfig, StorageProvider } from "./config";
import { S3StorageService } from "./s3-service";
import { CloudinaryService } from "./cloudinary-service";
import { cloudinaryService } from "./cloudinary-service";
import { promises as fs } from "fs";
import path from "path";

export interface StorageUploadResult {
  id: string;
  url: string;
  size: number;
  provider: StorageProvider;
  key?: string; // S3 key
  publicId?: string; // Cloudinary public ID
}

export interface StorageDownloadResult {
  buffer: Buffer;
  contentType: string;
  size: number;
}

export class UnifiedStorageService {
  private config = getStorageConfig();
  private s3Service?: S3StorageService;
  private cloudinaryService?: CloudinaryService;

  constructor() {
    // Initialize services based on configuration
    if (this.config.provider === "S3") {
      this.s3Service = new S3StorageService();
    } else if (this.config.provider === "CLOUDINARY") {
      this.cloudinaryService = new CloudinaryService();
    }
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    clientId: string,
    options: {
      contentType?: string;
      documentType?: string;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<StorageUploadResult> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) throw new Error("S3 service not initialized");

          const s3Result = await this.s3Service.uploadFile(
            buffer,
            fileName,
            clientId,
            options
          );
          return {
            id: s3Result.key,
            url: s3Result.url,
            size: s3Result.size,
            provider: "S3",
            key: s3Result.key,
          };

        case "CLOUDINARY":
          if (!this.cloudinaryService)
            throw new Error("Cloudinary service not initialized");

          const cloudinaryResult = await this.cloudinaryService.uploadFile(
            buffer,
            fileName,
            clientId,
            {
              documentType: options.documentType,
              metadata: options.metadata,
            }
          );
          return {
            id: cloudinaryResult.publicId,
            url: cloudinaryResult.secureUrl,
            size: cloudinaryResult.size,
            provider: "CLOUDINARY",
            publicId: cloudinaryResult.publicId,
          };

        case "LOCAL":
          return await this.uploadFileLocally(
            buffer,
            fileName,
            clientId,
            options
          );

        default:
          throw new Error(
            `Unsupported storage provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error("Storage upload error:", error);
      throw new Error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async downloadFile(storageId: string): Promise<StorageDownloadResult> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) throw new Error("S3 service not initialized");
          return await this.s3Service.downloadFile(storageId);

        case "CLOUDINARY":
          if (!this.cloudinaryService)
            throw new Error("Cloudinary service not initialized");
          return await this.cloudinaryService.downloadFile(storageId);

        case "LOCAL":
          return await this.downloadFileLocally(storageId);

        default:
          throw new Error(
            `Unsupported storage provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error("Storage download error:", error);
      throw new Error(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteFile(storageId: string): Promise<void> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) throw new Error("S3 service not initialized");
          await this.s3Service.deleteFile(storageId);
          break;

        case "CLOUDINARY":
          if (!this.cloudinaryService)
            throw new Error("Cloudinary service not initialized");
          await this.cloudinaryService.deleteFile(storageId);
          break;

        case "LOCAL":
          await this.deleteFileLocally(storageId);
          break;

        default:
          throw new Error(
            `Unsupported storage provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error("Storage delete error:", error);
      throw new Error(
        `Delete failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async fileExists(storageId: string): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) return false;
          return await this.s3Service.fileExists(storageId);

        case "CLOUDINARY":
          if (!this.cloudinaryService) return false;
          return await this.cloudinaryService.fileExists(storageId);

        case "LOCAL":
          return await this.fileExistsLocally(storageId);

        default:
          return false;
      }
    } catch (error) {
      console.error("Storage file exists check error:", error);
      return false;
    }
  }

  async getFileMetadata(storageId: string): Promise<Record<string, any>> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) throw new Error("S3 service not initialized");
          return await this.s3Service.getFileMetadata(storageId);

        case "CLOUDINARY":
          if (!this.cloudinaryService)
            throw new Error("Cloudinary service not initialized");
          return await this.cloudinaryService.getFileMetadata(storageId);

        case "LOCAL":
          return await this.getFileMetadataLocally(storageId);

        default:
          throw new Error(
            `Unsupported storage provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error("Storage metadata error:", error);
      throw new Error(
        `Metadata retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateSignedUrl(
    storageId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) throw new Error("S3 service not initialized");
          return await this.s3Service.generatePresignedUrl(
            storageId,
            "get",
            expiresIn
          );

        case "CLOUDINARY":
          if (!this.cloudinaryService)
            throw new Error("Cloudinary service not initialized");
          const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
          return await this.cloudinaryService.generateSignedUrl(storageId, {
            expiresAt,
          });

        case "LOCAL":
          // For local files, return the direct URL (not recommended for production)
          return `/uploads/${storageId}`;

        default:
          throw new Error(
            `Unsupported storage provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error("Storage signed URL error:", error);
      throw new Error(
        `Signed URL generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Local storage implementation
  private async uploadFileLocally(
    buffer: Buffer,
    fileName: string,
    clientId: string,
    options: any
  ): Promise<StorageUploadResult> {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    const uniqueFileName = `${timestamp}_${randomString}_${baseName}${extension}`;

    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    const stats = await fs.stat(filePath);

    return {
      id: uniqueFileName,
      url: `/uploads/${uniqueFileName}`,
      size: stats.size,
      provider: "LOCAL",
    };
  }

  private async downloadFileLocally(
    fileName: string
  ): Promise<StorageDownloadResult> {
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    const buffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    // Determine content type from extension
    const extension = path.extname(fileName).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".tiff": "image/tiff",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return {
      buffer,
      contentType: contentTypeMap[extension] || "application/octet-stream",
      size: stats.size,
    };
  }

  private async deleteFileLocally(fileName: string): Promise<void> {
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.unlink(filePath);
  }

  private async fileExistsLocally(fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getFileMetadataLocally(
    fileName: string
  ): Promise<Record<string, any>> {
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    const stats = await fs.stat(filePath);

    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  }

  // Batch operations
  async uploadMultipleFiles(
    files: Array<{
      buffer: Buffer;
      fileName: string;
      clientId: string;
      options?: any;
    }>
  ): Promise<StorageUploadResult[]> {
    switch (this.config.provider) {
      case "S3":
        if (!this.s3Service) throw new Error("S3 service not initialized");
        const s3Results = await this.s3Service.uploadMultipleFiles(files);
        return s3Results.map((result) => ({
          id: result.key,
          url: result.url,
          size: result.size,
          provider: "S3" as StorageProvider,
          key: result.key,
        }));

      case "CLOUDINARY":
        if (!this.cloudinaryService)
          throw new Error("Cloudinary service not initialized");
        const cloudinaryResults =
          await this.cloudinaryService.uploadMultipleFiles(files);
        return cloudinaryResults.map((result) => ({
          id: result.publicId,
          url: result.secureUrl,
          size: result.size,
          provider: "CLOUDINARY" as StorageProvider,
          publicId: result.publicId,
        }));

      case "LOCAL":
        const uploadPromises = files.map((file) =>
          this.uploadFileLocally(
            file.buffer,
            file.fileName,
            file.clientId,
            file.options
          )
        );
        return await Promise.all(uploadPromises);

      default:
        throw new Error(
          `Unsupported storage provider: ${this.config.provider}`
        );
    }
  }

  async deleteMultipleFiles(storageIds: string[]): Promise<void> {
    switch (this.config.provider) {
      case "S3":
        if (!this.s3Service) throw new Error("S3 service not initialized");
        await this.s3Service.deleteMultipleFiles(storageIds);
        break;

      case "CLOUDINARY":
        if (!this.cloudinaryService)
          throw new Error("Cloudinary service not initialized");
        await this.cloudinaryService.deleteMultipleFiles(storageIds);
        break;

      case "LOCAL":
        const deletePromises = storageIds.map((id) =>
          this.deleteFileLocally(id)
        );
        await Promise.all(deletePromises);
        break;

      default:
        throw new Error(
          `Unsupported storage provider: ${this.config.provider}`
        );
    }
  }

  // Health check
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    details: any;
  }> {
    try {
      switch (this.config.provider) {
        case "S3":
          if (!this.s3Service) throw new Error("S3 service not initialized");
          // Test S3 connection by listing bucket
          await this.s3Service.listFiles("", 1);
          return { status: "healthy", details: { provider: "S3" } };

        case "CLOUDINARY":
          if (!this.cloudinaryService)
            throw new Error("Cloudinary service not initialized");
          // Test Cloudinary connection
          await this.cloudinaryService.getStorageUsage();
          return { status: "healthy", details: { provider: "CLOUDINARY" } };

        case "LOCAL":
          // Test local storage access
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await fs.access(uploadDir);
          return {
            status: "healthy",
            details: { provider: "LOCAL", uploadDir },
          };

        default:
          throw new Error(`Unknown storage provider: ${this.config.provider}`);
      }
    } catch (error) {
      return {
        status: "unhealthy",
        details: {
          provider: this.config.provider,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}

// Export singleton instance
export const storageService = new UnifiedStorageService();

// Export types and functions
export type {
  StorageUploadResult,
  StorageDownloadResult,
  StorageProvider,
} from "./config";
export { getStorageConfig } from "./config";
