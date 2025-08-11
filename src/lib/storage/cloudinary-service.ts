// Cloudinary Storage Service for Medical Documents
import { CloudinaryConfig, getStoragePath } from "./config";
import { UploadApiResponse, UploadApiOptions } from "cloudinary";

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  size: number;
  format: string;
  signature: string;
}

export interface CloudinaryDownloadResult {
  buffer: Buffer;
  contentType: string;
  size: number;
  format: string;
}

export class CloudinaryStorageService {
  private cloudinary = CloudinaryConfig.getInstance();

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    clientId: string,
    options: {
      documentType?: string;
      tags?: string[];
      metadata?: Record<string, string>;
      resourceType?: "image" | "video" | "raw" | "auto";
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const {
        documentType,
        tags = [],
        metadata = {},
        resourceType = "auto",
      } = options;

      // Generate public ID using our path structure
      const folder = CloudinaryConfig.getFolder();
      const timestamp = Date.now();
      const publicId = `${folder}/${clientId}/${
        documentType || "general"
      }/${timestamp}_${fileName}`;

      // Prepare upload options
      const uploadOptions: UploadApiOptions = {
        public_id: publicId,
        resource_type: resourceType,
        folder: folder,
        tags: [
          "medical-document",
          `client-${clientId}`,
          `type-${documentType || "unknown"}`,
          `env-${process.env.NODE_ENV || "development"}`,
          ...tags,
        ],
        context: {
          client_id: clientId,
          document_type: documentType || "unknown",
          original_filename: fileName,
          upload_timestamp: new Date().toISOString(),
          hipaa_compliant: "true",
          ...metadata,
        },
        overwrite: false,
        unique_filename: true,
        use_filename: false,
        // Enable access control for medical documents
        access_mode: "authenticated",
        // Auto-detect file type
        invalidate: true,
      };

      // Convert buffer to base64 for upload
      const base64Data = `data:application/octet-stream;base64,${buffer.toString(
        "base64"
      )}`;

      const result = await this.cloudinary.uploader.upload(
        base64Data,
        uploadOptions
      );

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        size: result.bytes,
        format: result.format,
        signature: result.signature,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error(
        `Failed to upload file to Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async downloadFile(publicId: string): Promise<CloudinaryDownloadResult> {
    try {
      // Generate download URL
      const url = this.cloudinary.url(publicId, {
        resource_type: "auto",
        secure: true,
        sign_url: true,
        type: "authenticated",
      });

      // Fetch file from Cloudinary
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType =
        response.headers.get("content-type") || "application/octet-stream";

      // Extract format from public ID or content type
      const format =
        publicId.split(".").pop() || contentType.split("/").pop() || "unknown";

      return {
        buffer,
        contentType,
        size: buffer.length,
        format,
      };
    } catch (error) {
      console.error("Cloudinary download error:", error);
      throw new Error(
        `Failed to download file from Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await this.cloudinary.uploader.destroy(publicId, {
        resource_type: "auto",
        invalidate: true,
      });
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw new Error(
        `Failed to delete file from Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async fileExists(publicId: string): Promise<boolean> {
    try {
      const result = await this.cloudinary.api.resource(publicId, {
        resource_type: "auto",
      });
      return !!result;
    } catch (error) {
      return false;
    }
  }

  async getFileMetadata(publicId: string): Promise<Record<string, any>> {
    try {
      const result = await this.cloudinary.api.resource(publicId, {
        resource_type: "auto",
        image_metadata: true,
        colors: true,
        faces: true,
      });

      return {
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
        uploadedAt: result.uploaded_at,
        url: result.url,
        secureUrl: result.secure_url,
        tags: result.tags || [],
        context: result.context || {},
        metadata: result.image_metadata || {},
        signature: result.signature,
      };
    } catch (error) {
      console.error("Cloudinary metadata error:", error);
      throw new Error(
        `Failed to get file metadata from Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateSignedUrl(
    publicId: string,
    options: {
      expiresAt?: number;
      transformation?: any;
      download?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const { expiresAt, transformation = {}, download = false } = options;

      // Calculate expiration timestamp (default 1 hour)
      const expiration = expiresAt || Math.floor(Date.now() / 1000) + 3600;

      const urlOptions = {
        resource_type: "auto" as const,
        secure: true,
        sign_url: true,
        type: "authenticated" as const,
        expires_at: expiration,
        ...transformation,
      };

      if (download) {
        (urlOptions as any).flags = "attachment";
      }

      return this.cloudinary.url(publicId, urlOptions);
    } catch (error) {
      console.error("Cloudinary signed URL error:", error);
      throw new Error(
        `Failed to generate signed URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async listFiles(
    prefix: string,
    options: {
      maxResults?: number;
      nextCursor?: string;
      tags?: string[];
    } = {}
  ): Promise<{
    resources: Array<{
      publicId: string;
      size: number;
      format: string;
      createdAt: string;
      url: string;
    }>;
    nextCursor?: string;
  }> {
    try {
      const { maxResults = 100, nextCursor, tags = [] } = options;

      const searchOptions: any = {
        resource_type: "auto",
        type: "upload",
        prefix,
        max_results: maxResults,
      };

      if (nextCursor) {
        searchOptions.next_cursor = nextCursor;
      }

      if (tags.length > 0) {
        searchOptions.tags = true;
      }

      const result = await this.cloudinary.api.resources(searchOptions);

      const resources = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        size: resource.bytes,
        format: resource.format,
        createdAt: resource.created_at,
        url: resource.secure_url,
      }));

      return {
        resources,
        nextCursor: result.next_cursor,
      };
    } catch (error) {
      console.error("Cloudinary list error:", error);
      throw new Error(
        `Failed to list files from Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async searchFiles(
    query: string,
    options: {
      maxResults?: number;
      nextCursor?: string;
    } = {}
  ): Promise<{
    resources: Array<{
      publicId: string;
      size: number;
      format: string;
      score: number;
    }>;
    nextCursor?: string;
  }> {
    try {
      const { maxResults = 50, nextCursor } = options;

      const searchOptions: any = {
        expression: query,
        max_results: maxResults,
        with_field: ["context", "tags"],
      };

      if (nextCursor) {
        searchOptions.next_cursor = nextCursor;
      }

      const result = await this.cloudinary.search.execute(searchOptions);

      const resources = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        size: resource.bytes,
        format: resource.format,
        score: resource.score || 0,
      }));

      return {
        resources,
        nextCursor: result.next_cursor,
      };
    } catch (error) {
      console.error("Cloudinary search error:", error);
      throw new Error(
        `Failed to search files in Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateMetadata(
    publicId: string,
    metadata: Record<string, string>
  ): Promise<void> {
    try {
      await this.cloudinary.api.update(publicId, {
        context: metadata,
        resource_type: "auto",
      });
    } catch (error) {
      console.error("Cloudinary metadata update error:", error);
      throw new Error(
        `Failed to update metadata: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async addTags(publicId: string, tags: string[]): Promise<void> {
    try {
      await this.cloudinary.api.update(publicId, {
        tags: tags.join(","),
        resource_type: "auto",
      });
    } catch (error) {
      console.error("Cloudinary tags error:", error);
      throw new Error(
        `Failed to add tags: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getStorageUsage(folder?: string): Promise<{
    fileCount: number;
    totalSize: number;
    averageSize: number;
  }> {
    try {
      const result = await this.cloudinary.api.usage({
        folder: folder || CloudinaryConfig.getFolder(),
      });

      return {
        fileCount: result.resources || 0,
        totalSize: result.total_size || 0,
        averageSize:
          result.resources > 0 ? result.total_size / result.resources : 0,
      };
    } catch (error) {
      console.error("Cloudinary usage error:", error);
      throw new Error(
        `Failed to get storage usage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Batch operations
  async uploadMultipleFiles(
    files: Array<{
      buffer: Buffer;
      fileName: string;
      clientId: string;
      options?: any;
    }>
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.fileName, file.clientId, file.options)
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Cloudinary batch upload error:", error);
      throw new Error(
        `Failed to upload multiple files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    try {
      await this.cloudinary.api.delete_resources(publicIds, {
        resource_type: "auto",
        invalidate: true,
      });
    } catch (error) {
      console.error("Cloudinary batch delete error:", error);
      throw new Error(
        `Failed to delete multiple files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Image/PDF specific operations for medical documents
  async generateThumbnail(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<string> {
    try {
      const { width = 200, height = 200, quality = 80 } = options;

      return this.cloudinary.url(publicId, {
        resource_type: "auto",
        secure: true,
        transformation: [
          { width, height, crop: "fill", quality },
          { format: "jpg" },
        ],
      });
    } catch (error) {
      console.error("Cloudinary thumbnail error:", error);
      throw new Error(
        `Failed to generate thumbnail: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async extractTextFromImage(publicId: string): Promise<string> {
    try {
      // Use Cloudinary's AI-powered text extraction
      const result = await this.cloudinary.api.resource(publicId, {
        resource_type: "image",
        ocr: "adv_ocr",
      });

      return (
        result.info?.ocr?.adv_ocr?.data
          ?.map((item: any) => item.textAnnotations?.[0]?.description)
          .join(" ") || ""
      );
    } catch (error) {
      console.error("Cloudinary OCR error:", error);
      throw new Error(
        `Failed to extract text: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
