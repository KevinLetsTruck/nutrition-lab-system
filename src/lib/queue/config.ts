// Redis and BullMQ Configuration for Document Processing
import { Queue, Worker, QueueOptions, WorkerOptions, Job } from "bullmq";
import Redis from "ioredis";

// Queue configuration
export interface QueueConfig {
  defaultJobOptions: {
    removeOnComplete: number;
    removeOnFail: number;
    attempts: number;
    backoff: {
      type: string;
      delay: number;
    };
  };
  concurrency: number;
  maxStalledCount: number;
  stalledInterval: number;
}

// Redis connection configuration
export function getRedisConfig() {
  const redisUrl =
    process.env.REDIS_URL ||
    process.env.QUEUE_REDIS_URL ||
    "redis://localhost:6379";

  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      username: url.username || undefined,
      db: parseInt(url.pathname.slice(1)) || 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      family: 4,
    };
  } catch (error) {
    // Fallback for non-URL format

    return {
      host: "localhost",
      port: 6379,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    };
  }
}

// Create Redis connection
let redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    const config = getRedisConfig();
    redisConnection = new Redis(config);

    redisConnection.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    redisConnection.on("connect", () => {

    });

    redisConnection.on("reconnecting", () => {

    });
  }

  return redisConnection;
}

// Queue names
export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: "document-processing",
  OCR_EXTRACTION: "ocr-extraction",
  DATA_PARSING: "data-parsing",
  ANALYSIS: "analysis",
  NOTIFICATIONS: "notifications",
  CLEANUP: "cleanup",
} as const;

export type QueueName = keyof typeof QUEUE_NAMES;

// Job types
export const JOB_TYPES = {
  OCR_EXTRACTION: "ocr_extraction",
  DATA_PARSING: "data_parsing",
  VALUE_EXTRACTION: "value_extraction",
  FUNCTIONAL_ANALYSIS: "functional_analysis",
  PATTERN_ANALYSIS: "pattern_analysis",
  TREND_ANALYSIS: "trend_analysis",
  REPORT_GENERATION: "report_generation",
  NOTIFICATION: "notification",
  CLEANUP_FILES: "cleanup_files",
  AUDIT_LOG_CLEANUP: "audit_log_cleanup",
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

// Default queue configuration
export function getDefaultQueueConfig(): QueueConfig {
  return {
    defaultJobOptions: {
      removeOnComplete: 50, // Keep last 50 completed jobs
      removeOnFail: 100, // Keep last 100 failed jobs
      attempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || "3"),
      backoff: {
        type: "exponential",
        delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || "5000"),
      },
    },
    concurrency: parseInt(process.env.QUEUE_DEFAULT_CONCURRENCY || "3"),
    maxStalledCount: 1,
    stalledInterval: 30000, // 30 seconds
  };
}

// Queue options
export function getQueueOptions(queueName: string): QueueOptions {
  const config = getDefaultQueueConfig();
  const connection = getRedisConnection();

  return {
    connection,
    defaultJobOptions: {
      ...config.defaultJobOptions,
      delay: 0, // No delay by default
      priority: 0, // Default priority
      lifo: false, // First in, first out
    },
  };
}

// Worker options
export function getWorkerOptions(queueName: string): WorkerOptions {
  const config = getDefaultQueueConfig();
  const connection = getRedisConnection();

  return {
    connection,
    concurrency: config.concurrency,
    maxStalledCount: config.maxStalledCount,
    stalledInterval: config.stalledInterval,
    autorun: true,
    removeOnComplete: {
      count: config.defaultJobOptions.removeOnComplete,
    },
    removeOnFail: {
      count: config.defaultJobOptions.removeOnFail,
    },
  };
}

// Job data interfaces
export interface BaseJobData {
  jobId: string;
  documentId: string;
  clientId: string;
  userId?: string;
  priority: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface OCRJobData extends BaseJobData {
  type: typeof JOB_TYPES.OCR_EXTRACTION;
  fileUrl: string;
  fileName: string;
  fileType: string;
  ocrProvider: "CLAUDE" | "GOOGLE_VISION" | "TESSERACT";
  options: {
    language?: string;
    dpi?: number;
    enhanceImage?: boolean;
  };
}

export interface DataParsingJobData extends BaseJobData {
  type: typeof JOB_TYPES.DATA_PARSING;
  extractedText: string;
  documentType: string;
  labType?: string;
  options: {
    structuredOutput?: boolean;
    validateData?: boolean;
  };
}

export interface AnalysisJobData extends BaseJobData {
  type:
    | typeof JOB_TYPES.FUNCTIONAL_ANALYSIS
    | typeof JOB_TYPES.PATTERN_ANALYSIS
    | typeof JOB_TYPES.TREND_ANALYSIS;
  labValues: Array<{
    testName: string;
    value: string;
    unit?: string;
    referenceRange?: any;
  }>;
  analysisType: string;
  options: {
    includeRecommendations?: boolean;
    includeTrends?: boolean;
    compareWithPrevious?: boolean;
  };
}

export interface NotificationJobData extends BaseJobData {
  type: typeof JOB_TYPES.NOTIFICATION;
  notificationType: "EMAIL" | "SMS" | "PUSH" | "WEBSOCKET";
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
}

export interface CleanupJobData extends BaseJobData {
  type: typeof JOB_TYPES.CLEANUP_FILES | typeof JOB_TYPES.AUDIT_LOG_CLEANUP;
  targetType: "FILES" | "AUDIT_LOGS" | "TEMP_DATA";
  olderThan: string; // ISO date string
  batchSize: number;
}

export type JobData =
  | OCRJobData
  | DataParsingJobData
  | AnalysisJobData
  | NotificationJobData
  | CleanupJobData;

// Job priority levels
export const JOB_PRIORITIES = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 5,
  LOW: 8,
  BATCH: 10,
} as const;

// Job result interfaces
export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    processingTime: number;
    memoryUsage?: number;
    tokensUsed?: number;
    cost?: number;
  };
}

export interface OCRJobResult extends JobResult {
  extractedText?: string;
  confidence?: number;
  ocrProvider?: string;
  processingTime: number;
}

export interface AnalysisJobResult extends JobResult {
  patterns?: any[];
  findings?: any[];
  recommendations?: any[];
  confidence?: number;
  insights?: any[];
}

// Queue health monitoring
export interface QueueHealth {
  queueName: string;
  status: "healthy" | "warning" | "critical";
  metrics: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  };
  workers: {
    active: number;
    available: number;
  };
  lastJobProcessed?: string;
  averageProcessingTime?: number;
  errorRate?: number;
}

// Utility functions
export function createJobId(type: JobType, documentId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${documentId}_${timestamp}_${random}`;
}

export function calculateJobPriority(
  documentType: string,
  clientPriority: number = 5,
  urgencyFlags: string[] = []
): number {
  let priority = clientPriority;

  // Critical document types get higher priority
  if (["PATHOLOGY_REPORT", "CRITICAL_LAB"].includes(documentType)) {
    priority = Math.min(priority, JOB_PRIORITIES.HIGH);
  }

  // Urgency flags
  if (urgencyFlags.includes("STAT") || urgencyFlags.includes("CRITICAL")) {
    priority = JOB_PRIORITIES.CRITICAL;
  } else if (urgencyFlags.includes("URGENT")) {
    priority = JOB_PRIORITIES.HIGH;
  }

  return Math.max(1, Math.min(10, priority));
}

export function estimateJobDuration(type: JobType, fileSize?: number): number {
  const fileSizeMB = fileSize ? fileSize / (1024 * 1024) : 1;

  switch (type) {
    case JOB_TYPES.OCR_EXTRACTION:
      return Math.max(30, fileSizeMB * 10); // 10 seconds per MB, min 30 seconds
    case JOB_TYPES.DATA_PARSING:
      return Math.max(15, fileSizeMB * 5); // 5 seconds per MB, min 15 seconds
    case JOB_TYPES.VALUE_EXTRACTION:
      return Math.max(20, fileSizeMB * 8); // 8 seconds per MB, min 20 seconds
    case JOB_TYPES.FUNCTIONAL_ANALYSIS:
      return Math.max(45, fileSizeMB * 15); // 15 seconds per MB, min 45 seconds
    case JOB_TYPES.PATTERN_ANALYSIS:
      return Math.max(60, fileSizeMB * 20); // 20 seconds per MB, min 60 seconds
    case JOB_TYPES.TREND_ANALYSIS:
      return Math.max(30, fileSizeMB * 12); // 12 seconds per MB, min 30 seconds
    case JOB_TYPES.REPORT_GENERATION:
      return 120; // 2 minutes
    case JOB_TYPES.NOTIFICATION:
      return 5; // 5 seconds
    default:
      return 60; // Default 1 minute
  }
}

// Error handling
export class QueueError extends Error {
  constructor(
    message: string,
    public queueName: string,
    public jobId?: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = "QueueError";
  }
}

export class JobProcessingError extends Error {
  constructor(
    message: string,
    public jobType: JobType,
    public jobId: string,
    public retryable: boolean = true,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = "JobProcessingError";
  }
}
