import { ImageAnnotatorClient } from "@google-cloud/vision";
import { cloudinaryService } from "@/lib/storage/cloudinary-service";
import { storageService } from "@/lib/storage";

export interface VisionOCRResult {
  text: string;
  confidence: number;
  pageCount: number;
  success: boolean;
  error?: string;
}

export class GoogleVisionOCRService {
  private client: ImageAnnotatorClient;

  constructor() {
    // Initialize the Vision API client
    this.client = new ImageAnnotatorClient();
  }

  /**
   * Process a PDF document using Google Cloud Vision API
   * @param s3Key The S3 key of the PDF document
   * @returns OCR result with extracted text
   */
  async processPDFDocument(s3Key: string): Promise<VisionOCRResult> {
    try {
      console.log(`🔍 Starting Google Vision OCR for PDF: ${s3Key}`);

      // Generate signed URL for Cloudinary to access the PDF
      const signedUrl = await storageService.generateSignedUrl(s3Key, 60 * 15); // 15 minutes
      console.log(`🔐 Generated signed URL for PDF access`);

      // Convert PDF to images using Cloudinary
      console.log(`📄 Converting PDF to images via Cloudinary...`);
      const imageUrls = await cloudinaryService.convertPdfToImages(signedUrl);
      console.log(`✅ PDF converted to ${imageUrls.length} images`);

      // Process each image with Google Vision API
      const allText: string[] = [];
      let totalConfidence = 0;
      let validPages = 0;

      for (let i = 0; i < imageUrls.length; i++) {
        try {
          console.log(
            `🔍 Processing page ${i + 1}/${
              imageUrls.length
            } with Google Vision...`
          );

          const result = await this.processImageUrl(imageUrls[i]);
          if (result.text.trim()) {
            allText.push(result.text);
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
          // Continue with other pages
        }
      }

      // Clean up Cloudinary images
      try {
        await cloudinaryService.deleteImages(
          imageUrls
            .map((url) => {
              // Extract public_id from Cloudinary URL
              const matches = url.match(/\/v\d+\/(.+)\.(jpg|png)/);
              return matches ? matches[1] : "";
            })
            .filter(Boolean)
        );
        console.log(`🧹 Cleaned up ${imageUrls.length} temporary images`);
      } catch (cleanupError: any) {
        console.warn(`⚠️ Cleanup warning:`, cleanupError.message);
      }

      // Calculate average confidence
      const averageConfidence =
        validPages > 0 ? totalConfidence / validPages : 0;
      const combinedText = allText.join("\n\n");

      console.log(
        `🎉 Google Vision OCR complete: ${validPages}/${imageUrls.length} pages processed`
      );
      console.log(`📊 Average confidence: ${Math.round(averageConfidence)}%`);
      console.log(`📝 Extracted ${combinedText.length} characters`);

      return {
        text: combinedText,
        confidence: averageConfidence,
        pageCount: imageUrls.length,
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision OCR failed:`, error);
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
   * Process a single image URL with Google Vision API
   * @param imageUrl URL of the image to process
   * @returns OCR result for the image
   */
  private async processImageUrl(
    imageUrl: string
  ): Promise<{ text: string; confidence: number }> {
    try {
      // Perform OCR on the image
      const [result] = await this.client.textDetection({
        image: { source: { imageUri: imageUrl } },
      });

      const textAnnotations = result.textAnnotations || [];

      if (textAnnotations.length === 0) {
        return { text: "", confidence: 0 };
      }

      // First annotation contains the full text
      const fullText = textAnnotations[0].description || "";

      // Calculate average confidence from all detected text elements
      let totalConfidence = 0;
      let validDetections = 0;

      textAnnotations.forEach((annotation) => {
        if (annotation.confidence !== undefined && annotation.confidence > 0) {
          totalConfidence += annotation.confidence;
          validDetections++;
        }
      });

      const averageConfidence =
        validDetections > 0 ? (totalConfidence / validDetections) * 100 : 85; // Default confidence if none provided

      return {
        text: fullText,
        confidence: averageConfidence,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision API error:`, error);
      throw new Error(`Vision API processing failed: ${error.message}`);
    }
  }

  /**
   * Process a single image document (non-PDF)
   * @param s3Key The S3 key of the image document
   * @returns OCR result with extracted text
   */
  async processImageDocument(s3Key: string): Promise<VisionOCRResult> {
    try {
      console.log(`🖼️ Starting Google Vision OCR for image: ${s3Key}`);

      // Generate signed URL for the image
      const signedUrl = await storageService.generateSignedUrl(s3Key, 60 * 15); // 15 minutes
      console.log(`🔐 Generated signed URL for image access`);

      // Process the image directly
      const result = await this.processImageUrl(signedUrl);

      console.log(`🎉 Google Vision OCR complete for image`);
      console.log(`📊 Confidence: ${Math.round(result.confidence)}%`);
      console.log(`📝 Extracted ${result.text.length} characters`);

      return {
        text: result.text,
        confidence: result.confidence,
        pageCount: 1,
        success: true,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision OCR failed for image:`, error);
      return {
        text: "",
        confidence: 0,
        pageCount: 1,
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const googleVisionOCRService = new GoogleVisionOCRService();
