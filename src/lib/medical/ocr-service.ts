import { googleVisionHTTPService, VisionOCRResult } from "./google-vision-http";
import { prisma } from "@/lib/db/prisma";
import { medicalDocStorage } from "./s3-storage";
import { labValueExtractor } from "./lab-extractor";
import {
  DocumentType,
  ProcessingStatus,
  MedicalDocStatus,
} from "@prisma/client";
import { claudeService } from "@/lib/api/claude";

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
   * Generate a human-readable functional medicine report
   */
  private generateReadableReport(analysis: any): string {
    const report = analysis.narrativeReport;
    const summary = analysis.summary;
    const patterns = analysis.patterns;
    const recommendations = analysis.recommendations;
    const truckDriverConsiderations = analysis.truckDriverConsiderations;

    return `
FUNCTIONAL MEDICINE ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()} by Kevin Rutherford, FNTP

${report.introduction}

WHAT WE FOUND IN YOUR LABS
${report.whatWeFound}

WHAT THIS MEANS FOR YOUR HEALTH
${report.whatThisMeans}

ROOT CAUSE ANALYSIS
${report.rootCauseExplanation}

THE GOOD NEWS
${report.positiveNews}

YOUR NEXT STEPS
${report.nextSteps}

IMMEDIATE PRIORITIES (Start This Week)
${recommendations.immediate.map((r, i) => `${i + 1}. ${r}`).join("\n")}

SHORT-TERM GOALS (Next 1-3 Months)
${recommendations.shortTerm.map((r, i) => `${i + 1}. ${r}`).join("\n")}

LONG-TERM HEALTH OPTIMIZATION
${recommendations.longTerm.map((r, i) => `${i + 1}. ${r}`).join("\n")}

${
  truckDriverConsiderations.relevant
    ? `
TRUCK DRIVER SPECIFIC STRATEGIES
The road presents unique challenges, but we can work with your lifestyle:

Challenges We're Addressing:
${truckDriverConsiderations.specificChallenges
  .map((c, i) => `• ${c}`)
  .join("\n")}

Road-Ready Solutions:
${truckDriverConsiderations.adaptedRecommendations
  .map((r, i) => `• ${r}`)
  .join("\n")}
`
    : ""
}

PATTERNS IDENTIFIED
${patterns
  .map(
    (p, i) => `${i + 1}. ${p.name} (${p.severity} severity)
   What it means: ${p.explanation}
   Lab markers: ${p.markers.join(", ")}`
  )
  .join("\n\n")}

ADDITIONAL TESTING RECOMMENDATIONS
${report.additionalTesting}

OVERALL HEALTH ASSESSMENT: ${summary.overallHealth.toUpperCase()}

PRIMARY CONCERNS TO ADDRESS:
${summary.primaryConcerns.map((c, i) => `• ${c}`).join("\n")}

POSITIVE FINDINGS TO BUILD ON:
${summary.positiveFindings.map((f, i) => `• ${f}`).join("\n")}

---
This analysis was prepared by Kevin Rutherford, FNTP
Functional Nutrition Therapy Practitioner
Specializing in Truck Driver Health & Metabolic Optimization

Remember: You're not broken, and small consistent changes can lead to 
significant improvements in how you feel and perform on the road.
`;
  }

  /**
   * Map test name to lab category for database storage
   */
  private mapTestNameToCategory(testName: string): string {
    const name = testName.toLowerCase();

    // Basic Metabolic Panel
    if (
      name.includes("glucose") ||
      name.includes("bun") ||
      name.includes("creatinine") ||
      name.includes("sodium") ||
      name.includes("potassium") ||
      name.includes("chloride") ||
      name.includes("co2") ||
      name.includes("carbon dioxide")
    ) {
      return "BASIC_METABOLIC";
    }

    // Comprehensive Metabolic Panel
    if (
      name.includes("albumin") ||
      name.includes("protein") ||
      name.includes("bilirubin") ||
      name.includes("alt") ||
      name.includes("ast") ||
      name.includes("alkaline")
    ) {
      return "COMPREHENSIVE_METABOLIC";
    }

    // Lipid Panel
    if (
      name.includes("cholesterol") ||
      name.includes("hdl") ||
      name.includes("ldl") ||
      name.includes("triglyceride")
    ) {
      return "LIPID_PANEL";
    }

    // Thyroid
    if (
      name.includes("tsh") ||
      name.includes("t3") ||
      name.includes("t4") ||
      name.includes("thyroid")
    ) {
      return "THYROID";
    }

    // Hormones
    if (
      name.includes("testosterone") ||
      name.includes("estrogen") ||
      name.includes("cortisol") ||
      name.includes("dhea") ||
      name.includes("progesterone")
    ) {
      return "HORMONE";
    }

    // Vitamins and Minerals
    if (
      name.includes("vitamin") ||
      name.includes("b12") ||
      name.includes("folate") ||
      name.includes("iron") ||
      name.includes("ferritin") ||
      name.includes("magnesium") ||
      name.includes("zinc")
    ) {
      return "VITAMIN_MINERAL";
    }

    // Inflammatory markers
    if (
      name.includes("crp") ||
      name.includes("esr") ||
      name.includes("sed rate")
    ) {
      return "INFLAMMATORY_MARKERS";
    }

    return "OTHER";
  }

  /**
   * Map classification type to DocumentType enum
   */
  private mapToDocumentType(type: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
      lab_report: DocumentType.LAB_REPORT,
      nutriq_assessment: DocumentType.ASSESSMENT_FORM,
      symptom_assessment: DocumentType.ASSESSMENT_FORM,
      food_sensitivity: DocumentType.LAB_REPORT,
      imaging: DocumentType.IMAGING_REPORT,
      clinical_notes: DocumentType.CLINICAL_NOTES,
      pathology: DocumentType.PATHOLOGY_REPORT,
      prescription: DocumentType.PRESCRIPTION,
      insurance: DocumentType.INSURANCE_CARD,
      intake: DocumentType.INTAKE_FORM,
    };
    return typeMap[type] || DocumentType.UNKNOWN;
  }

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
            status: MedicalDocStatus.FAILED,
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
      `📄 Processing: ${document.originalFileName || document.fileName} (${
        document.documentType
      })`
    );

    // Update status to processing
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { status: MedicalDocStatus.PROCESSING },
    });

    // Process based on file type
    const mimeType = document.metadata?.mimeType as string;
    let ocrResult: OCRResult;

    if (mimeType === "application/pdf") {
      console.log("📑 Processing PDF document with Google Vision API...");
      ocrResult = await this.processPDFWithGoogleVision(
        document.storageKey || (document.metadata?.s3Key as string)
      );
    } else if (mimeType?.startsWith("image/")) {
      console.log("🖼️ Processing image document with Google Vision API...");
      ocrResult = await this.processImageWithGoogleVision(
        document.storageKey || (document.metadata?.s3Key as string)
      );
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Classify document type and detect lab source
    const classification = this.classifyDocument(ocrResult.text);

    console.log(
      `📋 Document type detected: ${classification.type} (was: ${document.documentType})`
    );

    // Update document with OCR results and detected type
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        status: MedicalDocStatus.COMPLETED,
        processedAt: new Date(),
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        documentType: this.mapToDocumentType(classification.type),

        metadata: {
          ...document.metadata,
          ocrMethod: ocrResult.method,
          processingTime: ocrResult.processingTime,
          pageCount: ocrResult.pageCount,
          wordCount: ocrResult.wordCount,
          originalDocumentType: document.documentType,
          labSource: classification.labSource,
        },
      },
    });

    // Extract lab values if this is a lab report or assessment
    if (
      classification.type === "lab_report" ||
      classification.type === "nutriq_assessment" ||
      classification.type === "symptom_assessment"
    ) {
      console.log("🧪 Extracting values from OCR text...");

      // NEW: Analyze document structure first with Claude
      let structureAnalysis = null;
      try {
        console.log("🔍 Analyzing document structure with Claude...");
        structureAnalysis = await claudeService.analyzeDocumentStructure(
          ocrResult.text
        );

        console.log("✅ Document structure analysis complete");
        console.log("📊 OCR Quality:", structureAnalysis.ocrQuality.overall);
        console.log("📄 Document Type:", structureAnalysis.documentType);
        console.log(
          "🎯 Extraction Strategy:",
          structureAnalysis.extractionStrategy.recommendedApproach
        );

        // Update document metadata with structure analysis
        await prisma.medicalDocument.update({
          where: { id: documentId },
          data: {
            metadata: {
              ...document.metadata,
              ocrMethod: ocrResult.method,
              processingTime: ocrResult.processingTime,
              pageCount: ocrResult.pageCount,
              wordCount: ocrResult.wordCount,
              originalDocumentType: document.documentType,
              labSource: classification.labSource,
              structureAnalysis,
              processingPipeline: {
                version: "2.0",
                structureAnalyzed: true,
                analysisTimestamp: new Date().toISOString(),
              },
            },
          },
        });
      } catch (structureError: any) {
        console.warn("⚠️ Structure analysis failed:", structureError.message);
        // Continue with extraction as fallback
      }

      try {
        // Use AI-powered extraction with structure awareness if available
        if (structureAnalysis) {
          console.log("🤖 Using AI-powered extraction with structure analysis");

          try {
            const aiExtraction =
              await claudeService.extractLabValuesWithStructure(
                ocrResult.text,
                structureAnalysis
              );

            console.log(
              `✅ AI extracted ${aiExtraction.labValues.length} lab values`
            );
            console.log(
              `📊 Extraction confidence: ${aiExtraction.extractionSummary.confidence}`
            );

            // Get document to retrieve clientId
            const docForClient = await prisma.medicalDocument.findUnique({
              where: { id: documentId },
              select: { clientId: true },
            });

            const clientId = docForClient?.clientId || "standalone";

            // Delete existing lab values for this document
            await prisma.medicalLabValue.deleteMany({
              where: { documentId },
            });

            // Convert AI extraction to database format and save
            if (aiExtraction.labValues.length > 0) {
              await prisma.medicalLabValue.createMany({
                data: aiExtraction.labValues.map((lab) => ({
                  id: `${documentId}_${lab.testName.replace(
                    /\s+/g,
                    "_"
                  )}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  documentId,
                  testName: lab.testName,
                  standardName: lab.standardName || null,
                  value: lab.value,
                  valueText: lab.value.toString(),
                  unit: lab.unit,
                  referenceMin: lab.referenceRange?.low || null,
                  referenceMax: lab.referenceRange?.high || null,
                  functionalMin: lab.functionalRange?.low || null,
                  functionalMax: lab.functionalRange?.high || null,
                  flag: lab.flags?.join(", ") || null,
                  confidence: lab.confidence,
                })),
              });
            }

            // Store extraction metadata in document
            await prisma.medicalDocument.update({
              where: { id: documentId },
              data: {
                metadata: {
                  ...document.metadata,
                  ocrMethod: ocrResult.method,
                  processingTime: ocrResult.processingTime,
                  pageCount: ocrResult.pageCount,
                  wordCount: ocrResult.wordCount,
                  originalDocumentType: document.documentType,
                  labSource: classification.labSource,
                  structureAnalysis,
                  aiExtraction: {
                    summary: aiExtraction.extractionSummary,
                    validationChecks: aiExtraction.validationChecks,
                    missedValues: aiExtraction.missedValues,
                  },
                  processingPipeline: {
                    version: "2.0",
                    structureAnalyzed: true,
                    aiExtractionUsed: true,
                    analysisTimestamp: new Date().toISOString(),
                  },
                },
              },
            });

            console.log("✅ AI extraction completed and saved successfully");

            // Automatic Functional Medicine Analysis
            if (aiExtraction.labValues.length > 0) {
              try {
                console.log(
                  "🔬 Running Functional Medicine Pattern Analysis..."
                );

                // Get client information if available
                const client = docForClient?.clientId
                  ? await prisma.client.findUnique({
                      where: { id: docForClient.clientId },
                      select: {
                        firstName: true,
                        lastName: true,
                        healthGoals: true,
                        medications: true,
                        conditions: true,
                        // Add truck driver indicator if available
                      },
                    })
                  : null;

                // Run functional analysis
                const functionalAnalysis =
                  await claudeService.analyzeFunctionalPatterns(
                    aiExtraction.labValues,
                    client
                  );

                console.log(`✅ Functional analysis complete`);
                console.log(
                  `📊 Overall Health: ${functionalAnalysis.summary.overallHealth}`
                );
                console.log(
                  `🎯 Patterns Found: ${functionalAnalysis.patterns.length}`
                );
                console.log(
                  `🔍 Root Causes Identified: ${functionalAnalysis.rootCauses.length}`
                );

                // Generate human-readable report
                const reportContent =
                  this.generateReadableReport(functionalAnalysis);

                // Update document metadata with functional analysis and report
                await prisma.medicalDocument.update({
                  where: { id: documentId },
                  data: {
                    metadata: {
                      ...document.metadata,
                      ocrMethod: ocrResult.method,
                      processingTime: ocrResult.processingTime,
                      pageCount: ocrResult.pageCount,
                      wordCount: ocrResult.wordCount,
                      originalDocumentType: document.documentType,
                      labSource: classification.labSource,
                      structureAnalysis,
                      aiExtraction: {
                        summary: aiExtraction.extractionSummary,
                        validationChecks: aiExtraction.validationChecks,
                        missedValues: aiExtraction.missedValues,
                      },
                      functionalAnalysis: {
                        summary: functionalAnalysis.summary,
                        patterns: functionalAnalysis.patterns,
                        rootCauses: functionalAnalysis.rootCauses,
                        systemsAssessment: functionalAnalysis.systemsAssessment,
                        recommendations: functionalAnalysis.recommendations,
                        truckDriverConsiderations:
                          functionalAnalysis.truckDriverConsiderations,
                        additionalTestsNeeded:
                          functionalAnalysis.additionalTestsNeeded,
                      },
                      narrativeReport: reportContent,
                      processingPipeline: {
                        version: "3.0",
                        structureAnalyzed: true,
                        aiExtractionUsed: true,
                        functionalAnalysisCompleted: true,
                        analysisTimestamp: new Date().toISOString(),
                      },
                    },
                  },
                });

                console.log(
                  "📄 Functional Medicine report generated and saved"
                );
              } catch (analysisError: any) {
                console.error("❌ Functional analysis failed:", analysisError);
                // Continue processing even if analysis fails
                console.log(
                  "📝 Document processing will continue without functional analysis"
                );
              }
            }

            // If confidence is low, still run regex as backup
            if (aiExtraction.extractionSummary.confidence < 0.8) {
              console.log(
                "⚠️ Low AI confidence, running regex extraction as backup"
              );
              await labValueExtractor.extractLabValues(
                documentId,
                ocrResult.text
              );
            }
          } catch (aiError: any) {
            console.error(
              "❌ AI extraction failed, falling back to regex:",
              aiError
            );
            // Fall back to existing regex extraction
            await labValueExtractor.extractLabValues(
              documentId,
              ocrResult.text
            );
          }
        } else {
          // No structure analysis available, use existing regex extraction
          console.log(
            "📝 Using regex extraction (no structure analysis available)"
          );
          await labValueExtractor.extractLabValues(documentId, ocrResult.text);
        }

        console.log("✅ Values extracted successfully");
      } catch (labError: any) {
        console.warn("⚠️ Value extraction failed:", labError.message);
      }
    }

    console.log(`🎉 Document processing completed successfully`);

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

    // Check for Symptom Burden Report first (most specific)
    if (
      normalizedText.includes("symptom burden report") ||
      (normalizedText.includes("potential nutritional deficiencies") &&
        normalizedText.includes("potential conditions"))
    ) {
      return { type: "symptom_assessment" };
    }

    // Check for Symptom Burden Bar Graph
    if (
      normalizedText.includes("symptom burden") &&
      (normalizedText.includes("bar graph") ||
        normalizedText.includes("priority") ||
        (normalizedText.includes("upper gi") &&
          normalizedText.includes("liver")))
    ) {
      return { type: "symptom_assessment" };
    }

    // Check for Nutri-Q Severity Report
    if (
      normalizedText.includes("severity report") ||
      (normalizedText.includes("nutri-q") &&
        normalizedText.includes("severe") &&
        normalizedText.includes("moderate"))
    ) {
      return { type: "symptom_assessment" };
    }

    // Check for NAQ assessment
    if (
      normalizedText.includes("naq questions") ||
      normalizedText.includes("nutritional assessment questionnaire") ||
      normalizedText.includes("nutri-q") ||
      (normalizedText.includes("naq") &&
        normalizedText.includes("questions/answers"))
    ) {
      return { type: "nutriq_assessment" };
    }

    // Check for food sensitivity
    if (
      normalizedText.includes("food sensitivity") ||
      normalizedText.includes("kbmo") ||
      normalizedText.includes("fit 176")
    ) {
      return { type: "food_sensitivity" };
    }

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
