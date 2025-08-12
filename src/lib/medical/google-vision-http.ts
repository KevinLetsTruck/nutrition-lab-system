/**
 * Google Cloud Vision API client using direct HTTP requests
 * This avoids the complex Node.js dependencies of the official SDK
 */

interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description?: string;
      confidence?: number;
    }>;
    error?: {
      message: string;
    };
  }>;
}

export interface VisionOCRResult {
  text: string;
  confidence: number;
  pageCount: number;
  success: boolean;
  error?: string;
}

export class GoogleVisionHTTPService {
  private apiKey: string;
  private apiUrl = "https://vision.googleapis.com/v1/images:annotate";

  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("GOOGLE_CLOUD_API_KEY environment variable is required");
    }
  }

  /**
   * Process PDF document using Google Vision API via HTTP
   */
  async processPDFDocument(s3Key: string): Promise<VisionOCRResult> {
    try {
      console.log(`🔍 Processing PDF with Google Vision HTTP: ${s3Key}`);

      // Generate signed URL for the PDF
      const { storageService } = await import("@/lib/storage");
      const signedUrl = await storageService.generateSignedUrl(s3Key, 60 * 15);

      // Convert PDF to images using Cloudinary
      const { cloudinaryService } = await import(
        "@/lib/storage/cloudinary-service"
      );
      const images = await cloudinaryService.convertPdfToImages(signedUrl, {
        quality: 95,
        format: "jpg",
        dpi: 200,
        maxPages: 20,
      });

      if (images.length === 0) {
        throw new Error("No images generated from PDF");
      }

      console.log(
        `📖 Processing ${images.length} page(s) with Google Vision HTTP...`
      );

      let allText: string[] = [];
      let totalConfidence = 0;
      let validPages = 0;

      // Process each page
      for (let i = 0; i < images.length; i++) {
        try {
          console.log(
            `🔍 Processing page ${i + 1}/${images.length} with Google Vision...`
          );

          const result = await this.processImageUrl(images[i].url);
          if (result.text.trim()) {
            allText.push(`=== PAGE ${i + 1} ===\n${result.text}`);
            totalConfidence += result.confidence;
            validPages++;
          }

          console.log(
            `✅ Page ${i + 1} processed, confidence: ${Math.round(
              result.confidence
            )}%`
          );
        } catch (pageError: any) {
          console.warn(
            `⚠️ Failed to process page ${i + 1}:`,
            pageError.message
          );
        }
      }

      // Clean up Cloudinary images
      try {
        await cloudinaryService.deleteImages(
          images.map((img) => img.publicId).filter(Boolean)
        );
        console.log(`🧹 Cleaned up ${images.length} temporary images`);
      } catch (cleanupError: any) {
        console.warn("⚠️ Cleanup failed:", cleanupError.message);
      }

      // Calculate average confidence
      const averageConfidence =
        validPages > 0 ? totalConfidence / validPages : 0;
      const combinedText = allText.join("\n\n");

      console.log(
        `🎉 Google Vision HTTP OCR complete: ${validPages}/${images.length} pages processed`
      );
      console.log(`📊 Average confidence: ${Math.round(averageConfidence)}%`);
      console.log(`📝 Extracted ${combinedText.length} characters`);

      return {
        text: combinedText,
        confidence: averageConfidence,
        pageCount: images.length,
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision HTTP OCR failed:`, error);
      return {
        text: "",
        confidence: 0,
        pageCount: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process image document using Google Vision API via HTTP
   */
  async processImageDocument(s3Key: string): Promise<VisionOCRResult> {
    try {
      console.log(`🔍 Processing image with Google Vision HTTP: ${s3Key}`);

      // Generate signed URL for the image
      const { storageService } = await import("@/lib/storage");
      const signedUrl = await storageService.generateSignedUrl(s3Key, 60 * 15);

      // Process the image directly
      const result = await this.processImageUrl(signedUrl);

      console.log(`🎉 Google Vision HTTP OCR complete for image`);
      console.log(`📊 Confidence: ${Math.round(result.confidence)}%`);
      console.log(`📝 Extracted ${result.text.length} characters`);

      return {
        text: result.text,
        confidence: result.confidence,
        pageCount: 1,
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision HTTP OCR failed for image:`, error);
      return {
        text: "",
        confidence: 0,
        pageCount: 1,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process a single image URL using Google Vision API
   */
  private async processImageUrl(
    imageUrl: string
  ): Promise<{ text: string; confidence: number }> {
    try {
      // Convert image URL to base64
      const imageBase64 = await this.imageUrlToBase64(imageUrl);

      // Prepare Vision API request
      const requestBody = {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      };

      // Call Google Vision API
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vision API error: ${response.status} - ${errorText}`);
      }

      const data: VisionApiResponse = await response.json();

      if (data.responses[0]?.error) {
        throw new Error(`Vision API error: ${data.responses[0].error.message}`);
      }

      const textAnnotations = data.responses[0]?.textAnnotations || [];

      if (textAnnotations.length === 0) {
        return { text: "", confidence: 0 };
      }

      // First annotation contains the full text
      const fullText = textAnnotations[0].description || "";

      // Calculate average confidence from all annotations
      let totalConfidence = 0;
      let validDetections = 0;

      textAnnotations.forEach((annotation) => {
        if (annotation.confidence !== undefined && annotation.confidence > 0) {
          totalConfidence += annotation.confidence;
          validDetections++;
        }
      });

      const averageConfidence =
        validDetections > 0 ? (totalConfidence / validDetections) * 100 : 85;

      return {
        text: fullText,
        confidence: averageConfidence,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision API error:`, error);
      return { text: "", confidence: 0 };
    }
  }

  /**
   * Convert image URL to base64 for Vision API
   */
  private async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return base64;
    } catch (error: any) {
      console.error(`❌ Failed to convert image to base64:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const googleVisionHTTPService = new GoogleVisionHTTPService();
