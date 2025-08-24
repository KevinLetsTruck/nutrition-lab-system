import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryImageResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Convert PDF to high-quality images using Cloudinary
   * @param pdfUrl - The URL or base64 of the PDF to convert
   * @param options - Conversion options
   */
  async convertPdfToImages(
    pdfUrl: string,
    options: {
      quality?: number;
      format?: "jpg" | "png";
      dpi?: number;
      maxPages?: number;
    } = {}
  ): Promise<CloudinaryImageResult[]> {
    const { quality = 95, format = "jpg", dpi = 200, maxPages = 10 } = options;

    try {

      // Upload PDF to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(pdfUrl, {
        resource_type: "image",
        format: "pdf",
        folder: "medical-docs/pdf-conversion",
        use_filename: true,
        unique_filename: true,
      });

      // Convert each page to images
      const images: CloudinaryImageResult[] = [];

      // Get PDF info to determine page count
      const pdfInfo = await cloudinary.api.resource(uploadResult.public_id, {
        resource_type: "image",
        pages: true,
      });

      const pageCount = Math.min(pdfInfo.pages || 1, maxPages);

      for (let page = 1; page <= pageCount; page++) {
        try {
          const imageUrl = cloudinary.url(uploadResult.public_id, {
            resource_type: "image",
            format: format,
            quality: quality,
            page: page,
            dpr: dpi / 72, // Convert DPI to device pixel ratio
            transformation: [
              { dpr: "auto" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          });

          // Generate optimized image
          const optimizedResult = await cloudinary.uploader.upload(imageUrl, {
            resource_type: "image",
            folder: `medical-docs/pdf-conversion/pages`,
            public_id: `${uploadResult.public_id}_page_${page}`,
            overwrite: true,
            format: format,
            quality: quality,
            transformation: [
              { quality: `auto:good` },
              { dpr: "auto" },
              { fetch_format: "auto" },
            ],
          });

          images.push({
            url: optimizedResult.secure_url,
            publicId: optimizedResult.public_id,
            width: optimizedResult.width,
            height: optimizedResult.height,
            format: optimizedResult.format,
            bytes: optimizedResult.bytes,
          });

        } catch (pageError: any) {

        }
      }

      // Clean up original PDF from Cloudinary (optional)
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id, {
          resource_type: "image",
        });

      } catch (cleanupError) {

      }

      return images;
    } catch (error: any) {
      console.error("❌ PDF to image conversion failed:", error);
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  }

  /**
   * Delete images from Cloudinary
   * @param publicIds - Array of public IDs to delete
   */
  async deleteImages(publicIds: string[]): Promise<void> {
    try {
      for (const publicId of publicIds) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      }

    } catch (error: any) {

    }
  }

  /**
   * Test Cloudinary connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await cloudinary.api.ping();

      return true;
    } catch (error: any) {
      console.error("❌ Cloudinary connection failed:", error.message);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
