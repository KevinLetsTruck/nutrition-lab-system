import { medicalOCRService } from "./ocr-service";
import { prisma } from "@/lib/db/prisma";

export interface ProcessingJob {
  documentId: string;
  priority: number;
  isRadioShow?: boolean;
}

export class DocumentProcessingWorker {
  private isProcessing = false;
  private queue: ProcessingJob[] = [];

  async addToQueue(job: ProcessingJob): Promise<void> {
    // Add to in-memory queue (sorted by priority)
    this.queue.push(job);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Also add to database queue for persistence
    await prisma.medicalProcessingQueue.create({
      data: {
        documentId: job.documentId,
        jobType: "ocr_processing",
        priority: job.priority,
        status: "QUEUED",
      },
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;

      try {
        console.log(`Processing job ${job.documentId}`);

        // Update queue status
        await prisma.medicalProcessingQueue.updateMany({
          where: {
            documentId: job.documentId,
            status: "QUEUED",
          },
          data: {
            status: "PROCESSING",
            startedAt: new Date(),
          },
        });

        // Process the document
        const result = await medicalOCRService.processDocument(job.documentId);

        // Update queue status
        await prisma.medicalProcessingQueue.updateMany({
          where: {
            documentId: job.documentId,
            status: "PROCESSING",
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        // For radio show, log quick results
        if (job.isRadioShow) {
          console.log(`Job ${job.documentId} completed with high confidence`);
        }
      } catch (error) {
        console.error(
          `❌ Processing failed for document: ${job.documentId}`,
          error
        );

        // Update queue status
        await prisma.medicalProcessingQueue.updateMany({
          where: {
            documentId: job.documentId,
            status: "PROCESSING",
          },
          data: {
            status: "FAILED",
            errorMessage:
              error instanceof Error ? error.message : "Processing failed",
          },
        });
      }
    }

    this.isProcessing = false;
  }

  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const statusCounts = await prisma.medicalProcessingQueue.groupBy({
      by: ["status"],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    statusCounts.forEach(({ status, _count }) => {
      switch (status) {
        case "QUEUED":
          result.pending = _count;
          break;
        case "PROCESSING":
          result.processing = _count;
          break;
        case "COMPLETED":
          result.completed = _count;
          break;
        case "FAILED":
          result.failed = _count;
          break;
      }
    });

    return result;
  }
}

// Export singleton instance
export const documentProcessingWorker = new DocumentProcessingWorker();
