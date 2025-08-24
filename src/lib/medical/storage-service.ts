import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export class MedicalDocumentStorage {
  private bucketName: string;

  constructor() {
    // Use dev bucket in development, prod bucket in production
    const isDev = process.env.NODE_ENV === "development";
    this.bucketName = isDev
      ? process.env.S3_MEDICAL_BUCKET_NAME_DEV ||
        process.env.S3_MEDICAL_BUCKET_NAME!
      : process.env.S3_MEDICAL_BUCKET_NAME!;

  }

  async uploadDocument(
    file: Buffer,
    filename: string,
    mimeType: string,
    clientId?: string
  ): Promise<{ key: string; url: string; size: number; optimized: boolean }> {
    try {
      `);

      // Optimize images before upload
      let processedFile = file;
      let optimized = false;

      if (mimeType.startsWith("image/") && mimeType !== "application/pdf") {

        processedFile = await this.optimizeImage(file);
        optimized = true;

      }

      const folder = clientId ? `clients/${clientId}` : "standalone";
      const timestamp = new Date().toISOString().split("T")[0];
      const sanitizedFilename = this.sanitizeFilename(filename);
      const key = `medical-docs/${folder}/${timestamp}/${uuidv4()}-${sanitizedFilename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: processedFile,
        ContentType: mimeType,
        ServerSideEncryption: "AES256",
        Metadata: {
          originalName: filename,
          uploadDate: new Date().toISOString(),
          clientId: clientId || "standalone",
          practitioner: "kevin-rutherford-fntp",
          originalSize: file.length.toString(),
          optimized: optimized.toString(),
        },
      });

      await s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

      return {
        key,
        url,
        size: processedFile.length,
        optimized,
      };
    } catch (error) {
      console.error("❌ S3 Upload Error:", error);

      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes("NoSuchBucket")) {
          throw new Error(
            `S3 bucket '${this.bucketName}' does not exist. Please create it first.`
          );
        }
        if (error.message.includes("InvalidAccessKeyId")) {
          throw new Error(
            "Invalid S3 access key. Please check your credentials."
          );
        }
        if (error.message.includes("SignatureDoesNotMatch")) {
          throw new Error(
            "Invalid S3 secret key. Please check your credentials."
          );
        }
      }

      throw new Error(
        `Failed to upload document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      // First, get image metadata
      const metadata = await sharp(buffer).metadata();

      // Optimize based on image characteristics
      let sharpInstance = sharp(buffer);

      // Resize if too large (keep aspect ratio)
      if (metadata.width && metadata.width > 2000) {
        sharpInstance = sharpInstance.resize(2000, 2000, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Convert to JPEG with appropriate quality
      if (metadata.format !== "jpeg") {
        sharpInstance = sharpInstance.jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true,
        });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {

      return buffer;
    }
  }

  private sanitizeFilename(filename: string): string {
    // Remove or replace problematic characters
    return filename
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error("❌ Failed to generate download URL:", error);
      throw new Error("Failed to generate download URL");
    }
  }

  async checkDocumentExists(key: string): Promise<boolean> {
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async deleteDocument(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client.send(command);

    } catch (error) {
      console.error("❌ Failed to delete document:", error);
      throw new Error("Failed to delete document");
    }
  }

  // Test S3 connection
  async testConnection(): Promise<boolean> {
    try {
      const testKey = `test/${Date.now()}-connection-test.txt`;
      const testContent = Buffer.from("S3 connection test");

      // Upload test file
      await s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: testKey,
          Body: testContent,
          ContentType: "text/plain",
        })
      );

      // Delete test file
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: testKey,
        })
      );

      return true;
    } catch (error) {
      console.error("❌ S3 connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const medicalDocStorage = new MedicalDocumentStorage();
