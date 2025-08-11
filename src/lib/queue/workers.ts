// Workers for Processing Medical Document Jobs
import { Worker, Job } from "bullmq";
import {
  QUEUE_NAMES,
  JOB_TYPES,
  getWorkerOptions,
  JobData,
  JobResult,
  OCRJobData,
  AnalysisJobData,
  NotificationJobData,
  CleanupJobData,
  OCRJobResult,
  AnalysisJobResult,
  JobProcessingError,
} from "./config";
import { prisma } from "@/lib/db";
import { storageService } from "@/lib/storage";

export class WorkerManager {
  private workers = new Map<string, Worker>();
  private isStarted = false;

  constructor() {
    this.setupWorkers();
  }

  private setupWorkers() {
    // OCR Extraction Worker
    this.createWorker(
      QUEUE_NAMES.OCR_EXTRACTION,
      this.processOCRJob.bind(this)
    );

    // Data Parsing Worker
    this.createWorker(
      QUEUE_NAMES.DOCUMENT_PROCESSING,
      this.processDataParsingJob.bind(this)
    );

    // Analysis Worker
    this.createWorker(QUEUE_NAMES.ANALYSIS, this.processAnalysisJob.bind(this));

    // Notification Worker
    this.createWorker(
      QUEUE_NAMES.NOTIFICATIONS,
      this.processNotificationJob.bind(this)
    );

    // Cleanup Worker
    this.createWorker(QUEUE_NAMES.CLEANUP, this.processCleanupJob.bind(this));
  }

  private createWorker(
    queueName: string,
    processor: (job: Job) => Promise<JobResult>
  ) {
    const worker = new Worker(
      queueName,
      processor,
      getWorkerOptions(queueName)
    );

    worker.on("error", (error) => {
      console.error(`Worker error in ${queueName}:`, error);
    });

    worker.on("failed", (job, error) => {
      console.error(`Job ${job?.id} failed in ${queueName}:`, error);
      this.handleJobFailure(job!, error);
    });

    worker.on("completed", (job, result) => {
      console.log(`Job ${job.id} completed in ${queueName}`);
      this.handleJobCompletion(job, result);
    });

    worker.on("active", (job) => {
      console.log(`Job ${job.id} started in ${queueName}`);
      this.handleJobStart(job);
    });

    this.workers.set(queueName, worker);
  }

  private async handleJobStart(job: Job) {
    try {
      await prisma.processingJob.updateMany({
        where: { jobId: job.id },
        data: {
          status: "ACTIVE",
          startedAt: new Date(),
          attempts: (job.attemptsMade || 0) + 1,
        },
      });
    } catch (error) {
      console.error("Failed to update job start status:", error);
    }
  }

  private async handleJobCompletion(job: Job, result: JobResult) {
    try {
      await prisma.processingJob.updateMany({
        where: { jobId: job.id },
        data: {
          status: "COMPLETED",
          result,
          completedAt: new Date(),
          actualTime: result.metadata?.processingTime || 0,
        },
      });
    } catch (error) {
      console.error("Failed to update job completion status:", error);
    }
  }

  private async handleJobFailure(job: Job, error: Error) {
    try {
      await prisma.processingJob.updateMany({
        where: { jobId: job.id },
        data: {
          status: "FAILED",
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          failedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error("Failed to update job failure status:", dbError);
    }
  }

  // OCR Processing
  private async processOCRJob(job: Job<OCRJobData>): Promise<OCRJobResult> {
    const startTime = Date.now();
    const { documentId, fileUrl, fileName, ocrProvider, options } = job.data;

    try {
      console.log(`🔍 Starting OCR extraction for document ${documentId}`);

      // Download file from storage
      const fileData = await this.downloadFile(fileUrl);

      // Perform OCR based on provider
      let extractedText = "";
      let confidence = 0;

      switch (ocrProvider) {
        case "CLAUDE":
          const claudeResult = await this.performClaudeOCR(
            fileData,
            fileName,
            options
          );
          extractedText = claudeResult.text;
          confidence = claudeResult.confidence;
          break;

        case "GOOGLE_VISION":
          const visionResult = await this.performGoogleVisionOCR(
            fileData,
            options
          );
          extractedText = visionResult.text;
          confidence = visionResult.confidence;
          break;

        case "TESSERACT":
          const tesseractResult = await this.performTesseractOCR(
            fileData,
            options
          );
          extractedText = tesseractResult.text;
          confidence = tesseractResult.confidence;
          break;

        default:
          throw new JobProcessingError(
            `Unsupported OCR provider: ${ocrProvider}`,
            JOB_TYPES.OCR_EXTRACTION,
            job.id!
          );
      }

      // Update document with extracted text
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText,
          ocrConfidence: confidence,
          ocrProvider,
          status: "OCR_COMPLETE",
        },
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        extractedText,
        confidence,
        ocrProvider,
        processingTime,
        metadata: {
          processingTime,
          textLength: extractedText.length,
          wordsExtracted: extractedText.split(/\s+/).length,
        },
      };
    } catch (error) {
      console.error(`OCR processing failed for document ${documentId}:`, error);

      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          processingError:
            error instanceof Error ? error.message : "OCR processing failed",
        },
      });

      throw new JobProcessingError(
        `OCR processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        JOB_TYPES.OCR_EXTRACTION,
        job.id!,
        true // retryable
      );
    }
  }

  // Analysis Processing
  private async processAnalysisJob(
    job: Job<AnalysisJobData>
  ): Promise<AnalysisJobResult> {
    const startTime = Date.now();
    const { documentId, clientId, labValues, analysisType, options } = job.data;

    try {
      console.log(`🧠 Starting analysis for document ${documentId}`);

      // Perform analysis based on type
      let analysisResult: any = {};

      switch (analysisType) {
        case "FUNCTIONAL_MEDICINE":
          analysisResult = await this.performFunctionalMedicineAnalysis(
            labValues,
            options
          );
          break;

        case "PATTERN_RECOGNITION":
          analysisResult = await this.performPatternAnalysis(
            labValues,
            options
          );
          break;

        case "TREND_ANALYSIS":
          analysisResult = await this.performTrendAnalysis(
            clientId,
            labValues,
            options
          );
          break;

        default:
          throw new JobProcessingError(
            `Unsupported analysis type: ${analysisType}`,
            JOB_TYPES.FUNCTIONAL_ANALYSIS,
            job.id!
          );
      }

      // Save analysis results
      await prisma.documentAnalysis.create({
        data: {
          documentId,
          clientId,
          analysisType: analysisType as any,
          patterns: analysisResult.patterns,
          findings: analysisResult.findings,
          criticalValues: analysisResult.criticalValues,
          recommendations: analysisResult.recommendations,
          insights: analysisResult.insights,
          confidence: analysisResult.confidence,
          status: "COMPLETED",
          processingTime: Date.now() - startTime,
          completedAt: new Date(),
        },
      });

      // Update document analysis status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          analysisStatus: "COMPLETED",
          analysisDate: new Date(),
        },
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        patterns: analysisResult.patterns,
        findings: analysisResult.findings,
        recommendations: analysisResult.recommendations,
        confidence: analysisResult.confidence,
        metadata: {
          processingTime,
          labValuesAnalyzed: labValues.length,
          patternsFound: analysisResult.patterns?.length || 0,
        },
      };
    } catch (error) {
      console.error(`Analysis failed for document ${documentId}:`, error);

      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          analysisStatus: "FAILED",
        },
      });

      throw new JobProcessingError(
        `Analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        JOB_TYPES.FUNCTIONAL_ANALYSIS,
        job.id!,
        true
      );
    }
  }

  // Notification Processing
  private async processNotificationJob(
    job: Job<NotificationJobData>
  ): Promise<JobResult> {
    const { notificationType, recipient, subject, message, data } = job.data;

    try {
      console.log(
        `📧 Sending ${notificationType} notification to ${recipient}`
      );

      switch (notificationType) {
        case "EMAIL":
          await this.sendEmailNotification(
            recipient,
            subject || "",
            message,
            data
          );
          break;

        case "SMS":
          await this.sendSMSNotification(recipient, message);
          break;

        case "WEBSOCKET":
          await this.sendWebSocketNotification(recipient, message, data);
          break;

        case "PUSH":
          await this.sendPushNotification(recipient, message, data);
          break;

        default:
          throw new JobProcessingError(
            `Unsupported notification type: ${notificationType}`,
            JOB_TYPES.NOTIFICATION,
            job.id!
          );
      }

      return {
        success: true,
        metadata: {
          processingTime: 0,
          notificationType,
          recipient,
        },
      };
    } catch (error) {
      console.error(`Notification failed:`, error);
      throw new JobProcessingError(
        `Notification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        JOB_TYPES.NOTIFICATION,
        job.id!,
        true
      );
    }
  }

  // Cleanup Processing
  private async processCleanupJob(
    job: Job<CleanupJobData>
  ): Promise<JobResult> {
    const { targetType, olderThan, batchSize } = job.data;

    try {
      console.log(
        `🧹 Starting cleanup of ${targetType} older than ${olderThan}`
      );

      let cleanedCount = 0;
      const cutoffDate = new Date(olderThan);

      switch (targetType) {
        case "FILES":
          cleanedCount = await this.cleanupOldFiles(cutoffDate, batchSize);
          break;

        case "AUDIT_LOGS":
          cleanedCount = await this.cleanupOldAuditLogs(cutoffDate, batchSize);
          break;

        case "TEMP_DATA":
          cleanedCount = await this.cleanupTempData(cutoffDate, batchSize);
          break;

        default:
          throw new JobProcessingError(
            `Unsupported cleanup target: ${targetType}`,
            JOB_TYPES.CLEANUP_FILES,
            job.id!
          );
      }

      return {
        success: true,
        data: { cleanedCount },
        metadata: {
          processingTime: 0,
          itemsCleaned: cleanedCount,
        },
      };
    } catch (error) {
      console.error(`Cleanup failed:`, error);
      throw new JobProcessingError(
        `Cleanup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        JOB_TYPES.CLEANUP_FILES,
        job.id!,
        true
      );
    }
  }

  // Helper methods for file operations
  private async downloadFile(fileUrl: string): Promise<Buffer> {
    // Extract storage ID from URL
    const storageId = fileUrl.split("/").pop() || "";
    const result = await storageService.downloadFile(storageId);
    return result.buffer;
  }

  // OCR Implementation Methods
  private async performClaudeOCR(
    fileData: Buffer,
    fileName: string,
    options: any
  ): Promise<{ text: string; confidence: number }> {
    // This would integrate with Claude API for OCR
    // For now, return a mock implementation
    const text = "Mock extracted text from Claude OCR";
    return { text, confidence: 0.95 };
  }

  private async performGoogleVisionOCR(
    fileData: Buffer,
    options: any
  ): Promise<{ text: string; confidence: number }> {
    // This would integrate with Google Vision API
    const text = "Mock extracted text from Google Vision";
    return { text, confidence: 0.9 };
  }

  private async performTesseractOCR(
    fileData: Buffer,
    options: any
  ): Promise<{ text: string; confidence: number }> {
    // This would integrate with Tesseract
    const text = "Mock extracted text from Tesseract";
    return { text, confidence: 0.85 };
  }

  // Analysis Implementation Methods
  private async performFunctionalMedicineAnalysis(
    labValues: any[],
    options: any
  ): Promise<any> {
    // Mock functional medicine analysis
    return {
      patterns: [
        {
          type: "NUTRIENT_DEFICIENCY",
          description: "Vitamin D insufficiency detected",
          confidence: 0.92,
          severity: "MODERATE",
        },
      ],
      findings: [
        {
          category: "VITAMIN_MINERAL",
          finding: "Vitamin D levels below functional range",
          significance: "HIGH",
        },
      ],
      criticalValues: [],
      recommendations: [
        {
          type: "SUPPLEMENT",
          title: "Vitamin D3 Supplementation",
          description: "4000-6000 IU daily for 3-6 months",
        },
      ],
      confidence: 0.89,
    };
  }

  private async performPatternAnalysis(
    labValues: any[],
    options: any
  ): Promise<any> {
    // Mock pattern analysis
    return {
      patterns: [
        {
          type: "INFLAMMATION",
          description: "Chronic inflammatory pattern detected",
          confidence: 0.78,
        },
      ],
      findings: [],
      confidence: 0.78,
    };
  }

  private async performTrendAnalysis(
    clientId: string,
    labValues: any[],
    options: any
  ): Promise<any> {
    // Mock trend analysis
    return {
      patterns: [],
      findings: [],
      trends: [
        {
          testName: "Vitamin D",
          trend: "IMPROVING",
          percentChange: 15.5,
        },
      ],
      confidence: 0.85,
    };
  }

  // Notification Implementation Methods
  private async sendEmailNotification(
    recipient: string,
    subject: string,
    message: string,
    data?: any
  ): Promise<void> {
    console.log(`📧 Email sent to ${recipient}: ${subject}`);
    // Implementation would use nodemailer or similar
  }

  private async sendSMSNotification(
    recipient: string,
    message: string
  ): Promise<void> {
    console.log(`📱 SMS sent to ${recipient}: ${message}`);
    // Implementation would use Twilio or similar
  }

  private async sendWebSocketNotification(
    recipient: string,
    message: string,
    data?: any
  ): Promise<void> {
    console.log(`🔌 WebSocket notification sent to ${recipient}`);
    // Implementation would use Socket.IO
  }

  private async sendPushNotification(
    recipient: string,
    message: string,
    data?: any
  ): Promise<void> {
    console.log(`📱 Push notification sent to ${recipient}`);
    // Implementation would use Firebase or similar
  }

  // Cleanup Implementation Methods
  private async cleanupOldFiles(
    cutoffDate: Date,
    batchSize: number
  ): Promise<number> {
    // Find and delete old files
    const oldDocuments = await prisma.document.findMany({
      where: {
        uploadedAt: { lt: cutoffDate },
        status: "ARCHIVED",
      },
      take: batchSize,
    });

    for (const doc of oldDocuments) {
      try {
        if (doc.storageKey) {
          await storageService.deleteFile(doc.storageKey);
        }
        await prisma.document.delete({ where: { id: doc.id } });
      } catch (error) {
        console.error(`Failed to cleanup document ${doc.id}:`, error);
      }
    }

    return oldDocuments.length;
  }

  private async cleanupOldAuditLogs(
    cutoffDate: Date,
    batchSize: number
  ): Promise<number> {
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  private async cleanupTempData(
    cutoffDate: Date,
    batchSize: number
  ): Promise<number> {
    // Cleanup temporary processing data
    const result = await prisma.processingJob.deleteMany({
      where: {
        scheduledAt: { lt: cutoffDate },
        status: { in: ["COMPLETED", "FAILED"] },
      },
    });

    return result.count;
  }

  // Worker lifecycle management
  async start(): Promise<void> {
    if (this.isStarted) return;

    console.log("🚀 Starting document processing workers...");

    // Workers start automatically when created
    this.isStarted = true;

    console.log(`✅ ${this.workers.size} workers started successfully`);
  }

  async stop(): Promise<void> {
    if (!this.isStarted) return;

    console.log("🛑 Stopping document processing workers...");

    for (const [queueName, worker] of this.workers) {
      try {
        await worker.close();
        console.log(`Worker ${queueName} stopped`);
      } catch (error) {
        console.error(`Failed to stop worker ${queueName}:`, error);
      }
    }

    this.workers.clear();
    this.isStarted = false;

    console.log("✅ All workers stopped");
  }

  async pause(queueName?: string): Promise<void> {
    if (queueName) {
      const worker = this.workers.get(queueName);
      if (worker) {
        await worker.pause();
        console.log(`Worker ${queueName} paused`);
      }
    } else {
      for (const [name, worker] of this.workers) {
        await worker.pause();
        console.log(`Worker ${name} paused`);
      }
    }
  }

  async resume(queueName?: string): Promise<void> {
    if (queueName) {
      const worker = this.workers.get(queueName);
      if (worker) {
        await worker.resume();
        console.log(`Worker ${queueName} resumed`);
      }
    } else {
      for (const [name, worker] of this.workers) {
        await worker.resume();
        console.log(`Worker ${name} resumed`);
      }
    }
  }

  getWorkerStatus(): Array<{ queueName: string; isRunning: boolean }> {
    return Array.from(this.workers.entries()).map(([queueName, worker]) => ({
      queueName,
      isRunning: worker.isRunning(),
    }));
  }
}

// Export singleton instance
export const workerManager = new WorkerManager();
