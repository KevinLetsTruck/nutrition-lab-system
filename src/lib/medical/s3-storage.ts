import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class MedicalDocumentStorage {
  private bucketName = process.env.AWS_S3_BUCKET_NAME!;

  async uploadDocument(
    file: Buffer,
    filename: string,
    mimeType: string,
    clientId?: string
  ): Promise<{ key: string; url: string }> {
    try {
      const folder = clientId ? `clients/${clientId}` : "standalone";
      const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const uniqueId = uuidv4().split("-")[0]; // Short unique ID
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_"); // Clean filename
      const key = `medical-docs/${folder}/${timestamp}/${uniqueId}-${cleanFilename}`;

      console.log(`🔄 Uploading to S3: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          originalName: filename,
          uploadDate: new Date().toISOString(),
          clientId: clientId || "standalone",
        },
      });

      await s3Client.send(command);

      const url = `${process.env.AWS_S3_PUBLIC_URL}/${key}`;

      console.log(`✅ Upload successful: ${url}`);

      return { key, url };
    } catch (error) {
      console.error("❌ S3 Upload Error:", error);
      throw new Error(
        `Failed to upload to S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getDocument(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await s3Client.send(command);
      const chunks: Uint8Array[] = [];

      if (response.Body) {
        // @ts-ignore - AWS SDK streaming response
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error("❌ S3 Download Error:", error);
      throw new Error(
        `Failed to download from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error("❌ S3 Signed URL Error:", error);
      throw new Error(
        `Failed to generate signed URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteDocument(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`🗑️ Deleted from S3: ${key}`);
    } catch (error) {
      console.error("❌ S3 Delete Error:", error);
      throw new Error(
        `Failed to delete from S3: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log(`🧪 Testing S3 connection to bucket: ${this.bucketName}`);

      // First, try a simple list objects call to see if bucket exists
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await s3Client.send(listCommand);
      console.log("✅ S3 bucket access confirmed");

      // Now try uploading a test file
      const testKey = `test-connection-${Date.now()}.txt`;
      const testContent = Buffer.from("S3 connection test");

      // Upload test file
      const result = await this.uploadDocument(
        testContent,
        "test.txt",
        "text/plain"
      );
      console.log(`✅ Test upload successful: ${result.key}`);

      // Delete test file
      await this.deleteDocument(result.key);
      console.log("✅ Test file cleanup successful");

      console.log("✅ S3 connection test successful");
      return true;
    } catch (error) {
      console.error("❌ S3 connection test failed:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      return false;
    }
  }
}

export const medicalDocStorage = new MedicalDocumentStorage();
