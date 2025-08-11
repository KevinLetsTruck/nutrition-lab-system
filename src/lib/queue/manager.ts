// Queue Manager for Medical Document Processing
import { Queue, Worker, Job } from "bullmq";
import {
  QUEUE_NAMES,
  JOB_TYPES,
  getQueueOptions,
  getWorkerOptions,
  JobData,
  JobResult,
  QueueHealth,
  createJobId,
  calculateJobPriority,
  estimateJobDuration,
  QueueError,
  JobProcessingError,
} from "./config";
import { getRedisConnection } from "./config";
import { prisma } from "@/lib/db";

export class QueueManager {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();
  private isInitialized = false;

  constructor() {
    this.initializeQueues();
  }

  private async initializeQueues() {
    if (this.isInitialized) return;

    try {
      // Initialize all queues
      for (const [name, queueName] of Object.entries(QUEUE_NAMES)) {
        const queue = new Queue(queueName, getQueueOptions(queueName));
        this.queues.set(queueName, queue);

        // Set up queue event listeners
        this.setupQueueEvents(queue, queueName);
      }

      this.isInitialized = true;
      console.log("✅ Queue Manager initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Queue Manager:", error);
      throw new QueueError("Queue Manager initialization failed", "system");
    }
  }

  private setupQueueEvents(queue: Queue, queueName: string) {
    queue.on("error", (error) => {
      console.error(`Queue ${queueName} error:`, error);
    });

    queue.on("waiting", (job) => {
      console.log(`Job ${job.id} is waiting in queue ${queueName}`);
    });

    queue.on("active", (job) => {
      console.log(`Job ${job.id} started processing in queue ${queueName}`);
    });

    queue.on("completed", (job, result) => {
      console.log(`Job ${job.id} completed in queue ${queueName}`);
      this.updateJobStatus(job.id!, "COMPLETED", result);
    });

    queue.on("failed", (job, error) => {
      console.error(`Job ${job?.id} failed in queue ${queueName}:`, error);
      this.updateJobStatus(job?.id!, "FAILED", null, error.message);
    });

    queue.on("stalled", (job) => {
      console.warn(`Job ${job.id} stalled in queue ${queueName}`);
    });
  }

  private async updateJobStatus(
    jobId: string,
    status: string,
    result?: any,
    error?: string
  ) {
    try {
      await prisma.processingJob.updateMany({
        where: { jobId },
        data: {
          status: status as any,
          result: result || undefined,
          error: error ? { message: error } : undefined,
          completedAt: status === "COMPLETED" ? new Date() : undefined,
          failedAt: status === "FAILED" ? new Date() : undefined,
        },
      });
    } catch (dbError) {
      console.error("Failed to update job status in database:", dbError);
    }
  }

  // Queue operations
  async addJob<T extends JobData>(
    queueName: string,
    jobData: T,
    options: {
      priority?: number;
      delay?: number;
      attempts?: number;
      removeOnComplete?: number;
      removeOnFail?: number;
    } = {}
  ): Promise<Job<T>> {
    await this.initializeQueues();

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    try {
      // Calculate priority if not provided
      const priority =
        options.priority ||
        calculateJobPriority(jobData.type, jobData.priority);

      // Estimate duration for monitoring
      const estimatedDuration = estimateJobDuration(jobData.type);

      // Create database record
      await prisma.processingJob.create({
        data: {
          documentId: jobData.documentId,
          jobType: jobData.type as any,
          jobId: jobData.jobId,
          queueName,
          priority,
          status: "PENDING",
          config: jobData,
          estimatedTime: estimatedDuration,
          maxAttempts: options.attempts || 3,
        },
      });

      // Add job to queue
      const job = await queue.add(jobData.type, jobData, {
        jobId: jobData.jobId,
        priority,
        delay: options.delay || 0,
        attempts: options.attempts || 3,
        removeOnComplete: options.removeOnComplete || 50,
        removeOnFail: options.removeOnFail || 100,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      });

      console.log(`✅ Job ${job.id} added to queue ${queueName}`);
      return job;
    } catch (error) {
      console.error(`Failed to add job to queue ${queueName}:`, error);
      throw new QueueError(
        `Failed to add job to queue: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        queueName,
        jobData.jobId
      );
    }
  }

  // Specific job creation methods
  async addOCRJob(
    documentId: string,
    clientId: string,
    fileUrl: string,
    fileName: string,
    fileType: string,
    options: {
      priority?: number;
      ocrProvider?: "CLAUDE" | "GOOGLE_VISION" | "TESSERACT";
      language?: string;
      dpi?: number;
      userId?: string;
    } = {}
  ): Promise<Job> {
    const jobId = createJobId(JOB_TYPES.OCR_EXTRACTION, documentId);

    const jobData = {
      jobId,
      documentId,
      clientId,
      userId: options.userId,
      priority: options.priority || 5,
      type: JOB_TYPES.OCR_EXTRACTION,
      fileUrl,
      fileName,
      fileType,
      ocrProvider: options.ocrProvider || "CLAUDE",
      options: {
        language: options.language || "en",
        dpi: options.dpi || 300,
        enhanceImage: true,
      },
      createdAt: new Date().toISOString(),
      metadata: {
        originalFileName: fileName,
        fileSize: 0, // Will be updated by worker
      },
    };

    return this.addJob(QUEUE_NAMES.OCR_EXTRACTION, jobData, {
      priority: options.priority,
    });
  }

  async addAnalysisJob(
    documentId: string,
    clientId: string,
    labValues: any[],
    analysisType: string,
    options: {
      priority?: number;
      includeRecommendations?: boolean;
      includeTrends?: boolean;
      compareWithPrevious?: boolean;
      userId?: string;
    } = {}
  ): Promise<Job> {
    const jobId = createJobId(JOB_TYPES.FUNCTIONAL_ANALYSIS, documentId);

    const jobData = {
      jobId,
      documentId,
      clientId,
      userId: options.userId,
      priority: options.priority || 5,
      type: JOB_TYPES.FUNCTIONAL_ANALYSIS,
      labValues,
      analysisType,
      options: {
        includeRecommendations: options.includeRecommendations || true,
        includeTrends: options.includeTrends || true,
        compareWithPrevious: options.compareWithPrevious || false,
      },
      createdAt: new Date().toISOString(),
      metadata: {
        labValueCount: labValues.length,
      },
    };

    return this.addJob(QUEUE_NAMES.ANALYSIS, jobData, {
      priority: options.priority,
    });
  }

  async addNotificationJob(
    documentId: string,
    clientId: string,
    notificationType: "EMAIL" | "SMS" | "PUSH" | "WEBSOCKET",
    recipient: string,
    message: string,
    options: {
      priority?: number;
      subject?: string;
      data?: Record<string, any>;
      userId?: string;
    } = {}
  ): Promise<Job> {
    const jobId = createJobId(JOB_TYPES.NOTIFICATION, documentId);

    const jobData = {
      jobId,
      documentId,
      clientId,
      userId: options.userId,
      priority: options.priority || 5,
      type: JOB_TYPES.NOTIFICATION,
      notificationType,
      recipient,
      subject: options.subject,
      message,
      data: options.data,
      createdAt: new Date().toISOString(),
      metadata: {
        notificationType,
      },
    };

    return this.addJob(QUEUE_NAMES.NOTIFICATIONS, jobData, {
      priority: options.priority,
    });
  }

  // Queue management
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    await queue.pause();
    console.log(`Queue ${queueName} paused`);
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    await queue.resume();
    console.log(`Queue ${queueName} resumed`);
  }

  async drainQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    await queue.drain();
    console.log(`Queue ${queueName} drained`);
  }

  async cleanQueue(
    queueName: string,
    gracePeriod: number = 3600000, // 1 hour
    limit: number = 100
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    const cleaned = await queue.clean(gracePeriod, limit, "completed");
    console.log(`Cleaned ${cleaned.length} jobs from queue ${queueName}`);
  }

  // Job management
  async getJob(queueName: string, jobId: string): Promise<Job | null> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    return await queue.getJob(jobId);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`Job ${jobId} removed from queue ${queueName}`);
    }
  }

  async retryJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    const job = await queue.getJob(jobId);
    if (job && job.isFailed()) {
      await job.retry();
      console.log(`Job ${jobId} retried in queue ${queueName}`);
    }
  }

  // Monitoring and health checks
  async getQueueHealth(queueName: string): Promise<QueueHealth> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    const delayed = await queue.getDelayed();
    const isPaused = await queue.isPaused();

    // Calculate metrics
    const totalJobs =
      waiting.length + active.length + completed.length + failed.length;
    const errorRate = totalJobs > 0 ? (failed.length / totalJobs) * 100 : 0;

    // Get worker info
    const workers = this.workers.get(queueName);
    const workerInfo = {
      active: workers ? 1 : 0, // Simplified - in production you'd track multiple workers
      available: workers ? 1 : 0,
    };

    // Determine status
    let status: "healthy" | "warning" | "critical" = "healthy";
    if (errorRate > 50 || isPaused) {
      status = "critical";
    } else if (errorRate > 20 || waiting.length > 100) {
      status = "warning";
    }

    return {
      queueName,
      status,
      metrics: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused: isPaused,
      },
      workers: workerInfo,
      lastJobProcessed: completed[0]?.processedOn?.toString(),
      errorRate,
    };
  }

  async getAllQueuesHealth(): Promise<QueueHealth[]> {
    const healthChecks = [];

    for (const queueName of Object.values(QUEUE_NAMES)) {
      try {
        const health = await this.getQueueHealth(queueName);
        healthChecks.push(health);
      } catch (error) {
        console.error(`Failed to get health for queue ${queueName}:`, error);
        healthChecks.push({
          queueName,
          status: "critical" as const,
          metrics: {
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            paused: true,
          },
          workers: {
            active: 0,
            available: 0,
          },
          errorRate: 100,
        });
      }
    }

    return healthChecks;
  }

  // Batch operations
  async addBulkJobs<T extends JobData>(
    queueName: string,
    jobs: Array<{ data: T; options?: any }>
  ): Promise<Job[]> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new QueueError(`Queue ${queueName} not found`, queueName);
    }

    try {
      const bulkJobs = jobs.map((job) => ({
        name: job.data.type,
        data: job.data,
        opts: {
          jobId: job.data.jobId,
          priority: job.options?.priority || job.data.priority,
          ...job.options,
        },
      }));

      return await queue.addBulk(bulkJobs);
    } catch (error) {
      console.error(`Failed to add bulk jobs to queue ${queueName}:`, error);
      throw new QueueError(
        `Failed to add bulk jobs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        queueName
      );
    }
  }

  // Cleanup and shutdown
  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up Queue Manager...");

    // Close all workers
    for (const [name, worker] of this.workers) {
      try {
        await worker.close();
        console.log(`Worker ${name} closed`);
      } catch (error) {
        console.error(`Failed to close worker ${name}:`, error);
      }
    }

    // Close all queues
    for (const [name, queue] of this.queues) {
      try {
        await queue.close();
        console.log(`Queue ${name} closed`);
      } catch (error) {
        console.error(`Failed to close queue ${name}:`, error);
      }
    }

    // Close Redis connection
    try {
      const redis = getRedisConnection();
      await redis.quit();
      console.log("Redis connection closed");
    } catch (error) {
      console.error("Failed to close Redis connection:", error);
    }

    this.queues.clear();
    this.workers.clear();
    this.isInitialized = false;

    console.log("✅ Queue Manager cleanup completed");
  }
}

// Export singleton instance
export const queueManager = new QueueManager();

// Export types and utilities
export type { QueueHealth, JobData, JobResult };
export { JOB_TYPES, QUEUE_NAMES, QueueError, JobProcessingError };
