import { googleVisionHTTPService, VisionOCRResult } from "./google-vision-http";
import { prisma } from "@/lib/db/prisma";
import { medicalDocStorage } from "./s3-storage";
import { labValueExtractor } from "./lab-extractor";

interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  method: "google-vision" | "pdf-text" | "hybrid";
  pageCount?: number;
  wordCount: number;
}

interface DocumentProcessingResult {
  ocrResult: OCRResult;
  documentType: string;
  labSource?: string;
  extractedData?: any;
}

export class MedicalOCRService {
  private maxRetries = 3;
  private retryDelay = 2000;

  /**
   * Initialize Google Vision API (no initialization needed - using singleton)
   */
  async initializeOCR(): Promise<void> {
    console.log(
      "✅ Google Vision OCR service ready (no initialization required)"
    );
    return Promise.resolve();
  }

  /**
   * Process document with comprehensive error handling and retry logic
   */
  async processDocument(documentId: string): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    console.log(`🔍 Starting OCR processing for document: ${documentId}`);

    try {
      // Set processing timeout (10 minutes)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Processing timeout after 10 minutes")),
          10 * 60 * 1000
        );
      });

      const processingPromise = this.performDocumentProcessing(documentId);

      // Race between actual processing and timeout
      return await Promise.race([processingPromise, timeoutPromise]);
    } catch (error: any) {
      console.error(`❌ Document processing failed for ${documentId}:`, error);

      // Update document status to failed
      try {
        await prisma.medicalDocument.update({
          where: { id: documentId },
          data: {
            status: "FAILED",
            processedAt: new Date(),
            ocrText: `Processing failed: ${error.message}`,
            ocrConfidence: 0,
          },
        });
      } catch (dbError) {
        console.error("❌ Failed to update document status:", dbError);
      }

      throw error;
    }
  }

  private async performDocumentProcessing(
    documentId: string
  ): Promise<DocumentProcessingResult> {
    // Get document details
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    console.log(
      `📄 Processing: ${document.originalFileName} (${document.documentType})`
    );

    // Update status to processing
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });

    // Process based on file type
    const mimeType = document.metadata?.mimeType as string;
    let ocrResult: OCRResult;

    if (mimeType === "application/pdf") {
      console.log("📑 Processing PDF document with Google Vision API...");
      ocrResult = await this.processPDFWithGoogleVision(document.s3Key!);
    } else if (mimeType?.startsWith("image/")) {
      console.log("🖼️ Processing image document with Google Vision API...");
      ocrResult = await this.processImageWithGoogleVision(document.s3Key!);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Update document with OCR results
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        metadata: {
          ...document.metadata,
          ocrMethod: ocrResult.method,
          processingTime: ocrResult.processingTime,
          pageCount: ocrResult.pageCount,
          wordCount: ocrResult.wordCount,
        },
      },
    });

    // Extract lab values if this is a lab report
    if (document.documentType === "lab_report") {
      console.log("🧪 Extracting lab values from OCR text...");
      try {
        await labValueExtractor.extractLabValues(documentId, ocrResult.text);
        console.log("✅ Lab values extracted successfully");
      } catch (labError: any) {
        console.warn("⚠️ Lab value extraction failed:", labError.message);
      }
    }

    // Classify document type and detect lab source
    const classification = this.classifyDocument(ocrResult.text);

    console.log(
      `🎉 Document processing completed in ${Date.now() - Date.now()}ms`
    );

    return {
      ocrResult,
      documentType: classification.type,
      labSource: classification.labSource,
      extractedData: classification.extractedData,
    };
  }

  /**
   * Process PDF document using Google Vision API
   */
  private async processPDFWithGoogleVision(s3Key: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Processing PDF with Google Vision: ${s3Key}`);

      const visionResult = await googleVisionHTTPService.processPDFDocument(
        s3Key
      );

      if (!visionResult.success) {
        throw new Error(
          visionResult.error || "Google Vision processing failed"
        );
      }

      const processingTime = Date.now() - startTime;
      const wordCount = visionResult.text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      console.log(
        `✅ PDF processed successfully: ${wordCount} words, ${Math.round(
          visionResult.confidence
        )}% confidence`
      );

      return {
        text: visionResult.text,
        confidence: visionResult.confidence,
        processingTime,
        method: "google-vision",
        pageCount: visionResult.pageCount,
        wordCount,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision PDF processing failed:`, error);
      throw new Error(`Google Vision PDF processing failed: ${error.message}`);
    }
  }

  /**
   * Process image document using Google Vision API
   */
  private async processImageWithGoogleVision(
    s3Key: string
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Processing image with Google Vision: ${s3Key}`);

      const visionResult = await googleVisionHTTPService.processImageDocument(
        s3Key
      );

      if (!visionResult.success) {
        throw new Error(
          visionResult.error || "Google Vision processing failed"
        );
      }

      const processingTime = Date.now() - startTime;
      const wordCount = visionResult.text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      console.log(
        `✅ Image processed successfully: ${wordCount} words, ${Math.round(
          visionResult.confidence
        )}% confidence`
      );

      return {
        text: visionResult.text,
        confidence: visionResult.confidence,
        processingTime,
        method: "google-vision",
        pageCount: visionResult.pageCount,
        wordCount,
      };
    } catch (error: any) {
      console.error(`❌ Google Vision image processing failed:`, error);
      throw new Error(
        `Google Vision image processing failed: ${error.message}`
      );
    }
  }

  /**
   * Classify document type based on OCR text
   */
  private classifyDocument(text: string): {
    type: string;
    labSource?: string;
    extractedData?: any;
  } {
    const normalizedText = text.toLowerCase();

    // Lab report patterns
    const labPatterns = [
      /\b(lab|laboratory|blood work|chemistry|cbc|comprehensive)\b/,
      /\b(glucose|cholesterol|hemoglobin|creatinine)\b/,
      /\b(mg\/dl|mmol\/l|g\/dl|µg\/dl)\b/,
    ];

    for (const pattern of labPatterns) {
      if (pattern.test(normalizedText)) {
        return { type: "lab_report", labSource: this.detectLabSource(text) };
      }
    }

    // Assessment patterns
    const assessmentPatterns = [
      /\b(assessment|evaluation|consultation|visit)\b/,
      /\b(recommendation|treatment|plan)\b/,
    ];

    for (const pattern of assessmentPatterns) {
      if (pattern.test(normalizedText)) {
        return { type: "assessment" };
      }
    }

    return { type: "unknown" };
  }

  /**
   * Detect lab source from OCR text
   */
  private detectLabSource(text: string): string {
    const sources = [
      { name: "LabCorp", patterns: [/labcorp/i, /laboratory corporation/i] },
      { name: "Quest", patterns: [/quest/i, /quest diagnostics/i] },
      { name: "Mayo Clinic", patterns: [/mayo clinic/i, /mayo medical/i] },
    ];

    for (const source of sources) {
      for (const pattern of source.patterns) {
        if (pattern.test(text)) {
          return source.name;
        }
      }
    }

    return "Unknown";
  }

  /**
   * Cleanup resources (Google Vision requires no cleanup)
   */
  async cleanup(): Promise<void> {
    console.log(
      "✅ Google Vision OCR service cleanup complete (no resources to clean)"
    );
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const medicalOCRService = new MedicalOCRService();

// Cleanup on process exit
process.on("beforeExit", async () => {
  await medicalOCRService.cleanup();
});
