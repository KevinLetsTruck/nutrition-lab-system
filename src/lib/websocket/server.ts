// Socket.IO Server for Real-time Medical Document Processing Updates
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedisConnection } from "@/lib/queue/config";
import jwt from "jsonwebtoken";

export interface SocketUser {
  userId: string;
  userEmail: string;
  role: string;
  clientIds: string[]; // Client IDs this user can access
}

export interface DocumentProgressUpdate {
  documentId: string;
  clientId: string;
  status: string;
  progress: number;
  currentStep: string;
  estimatedCompletion?: string;
  error?: string;
}

export interface AnalysisUpdate {
  documentId: string;
  clientId: string;
  analysisId: string;
  analysisType: string;
  status: string;
  confidence?: number;
  findings?: any[];
  criticalValues?: any[];
}

export interface NotificationUpdate {
  type: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

export class MedicalDocumentSocketServer {
  private io: SocketIOServer | null = null;
  private connectedUsers = new Map<string, SocketUser>();
  private userSockets = new Map<string, Set<string>>(); // userId -> socket IDs

  constructor() {
    this.setupEventHandlers();
  }

  async initialize(httpServer: any): Promise<void> {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(",") || [
          "http://localhost:3000",
        ],
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Set up Redis adapter for horizontal scaling
    try {
      const pubClient = getRedisConnection();
      const subClient = pubClient.duplicate();

      await subClient.connect();
      this.io.adapter(createAdapter(pubClient, subClient));

    } catch (error) {

    }

    this.setupMiddleware();
    this.setupConnectionHandlers();

  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("Authentication required"));
        }

        // Verify JWT token
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

        const user: SocketUser = {
          userId: payload.userId,
          userEmail: payload.email,
          role: payload.role,
          clientIds: payload.clientIds || [], // Assume this is included in the token
        };

        socket.data.user = user;
        this.connectedUsers.set(socket.id, user);

        // Track user socket connections
        if (!this.userSockets.has(user.userId)) {
          this.userSockets.set(user.userId, new Set());
        }
        this.userSockets.get(user.userId)?.add(socket.id);

        next();
      } catch (error) {
        console.error("Socket authentication failed:", error);
        next(new Error("Invalid authentication token"));
      }
    });

    // Rate limiting middleware
    this.io.use((socket, next) => {
      // Simple rate limiting - max 100 events per minute
      const now = Date.now();
      const windowStart = now - 60000; // 1 minute window

      if (!socket.data.eventHistory) {
        socket.data.eventHistory = [];
      }

      // Clean old events
      socket.data.eventHistory = socket.data.eventHistory.filter(
        (time: number) => time > windowStart
      );

      if (socket.data.eventHistory.length >= 100) {
        return next(new Error("Rate limit exceeded"));
      }

      socket.data.eventHistory.push(now);
      next();
    });
  }

  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      const user = socket.data.user as SocketUser;
      `);

      // Join user to their own room
      socket.join(`user:${user.userId}`);

      // Join client rooms based on access
      user.clientIds.forEach((clientId) => {
        socket.join(`client:${clientId}`);
      });

      // Subscribe to document updates for accessible clients
      this.subscribeToDocumentUpdates(socket, user);

      // Handle client events
      this.setupClientEventHandlers(socket, user);

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        : ${reason}`
        );
        this.handleDisconnection(socket, user);
      });
    });
  }

  private setupClientEventHandlers(socket: any, user: SocketUser): void {
    // Subscribe to specific document updates
    socket.on("subscribe:document", (documentId: string) => {
      this.handleDocumentSubscription(socket, user, documentId);
    });

    // Unsubscribe from document updates
    socket.on("unsubscribe:document", (documentId: string) => {
      socket.leave(`document:${documentId}`);

    });

    // Request document status
    socket.on("request:document-status", async (documentId: string) => {
      await this.sendDocumentStatus(socket, user, documentId);
    });

    // Request queue status
    socket.on("request:queue-status", async () => {
      await this.sendQueueStatus(socket, user);
    });

    // Heartbeat/ping
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });
  }

  private async handleDocumentSubscription(
    socket: any,
    user: SocketUser,
    documentId: string
  ): Promise<void> {
    try {
      // Verify user has access to this document
      const hasAccess = await this.verifyDocumentAccess(user, documentId);

      if (!hasAccess) {
        socket.emit("error", {
          type: "ACCESS_DENIED",
          message: "You do not have access to this document",
        });
        return;
      }

      // Join document room
      socket.join(`document:${documentId}`);

      // Send current document status
      await this.sendDocumentStatus(socket, user, documentId);
    } catch (error) {
      console.error("Failed to handle document subscription:", error);
      socket.emit("error", {
        type: "SUBSCRIPTION_FAILED",
        message: "Failed to subscribe to document updates",
      });
    }
  }

  private async verifyDocumentAccess(
    user: SocketUser,
    documentId: string
  ): Promise<boolean> {
    try {
      const { prisma } = await import("@/lib/db");
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { clientId: true },
      });

      return document ? user.clientIds.includes(document.clientId) : false;
    } catch (error) {
      console.error("Failed to verify document access:", error);
      return false;
    }
  }

  private async sendDocumentStatus(
    socket: any,
    user: SocketUser,
    documentId: string
  ): Promise<void> {
    try {
      const { prisma } = await import("@/lib/db");

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          processingJobs: {
            where: { status: { in: ["PENDING", "ACTIVE"] } },
            orderBy: { scheduledAt: "asc" },
          },
          labValues: { take: 5 },
          documentAnalyses: {
            where: { status: "COMPLETED" },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      });

      if (!document) return;

      const progress = this.calculateDocumentProgress(
        document.status,
        document.processingJobs
      );

      const update: DocumentProgressUpdate = {
        documentId,
        clientId: document.clientId,
        status: document.status,
        progress: progress.percentage,
        currentStep: progress.currentStep,
        estimatedCompletion: progress.estimatedCompletion,
        error: document.processingError || undefined,
      };

      socket.emit("document:status", update);
    } catch (error) {
      console.error("Failed to send document status:", error);
    }
  }

  private async sendQueueStatus(socket: any, user: SocketUser): Promise<void> {
    try {
      const { queueManager } = await import("@/lib/queue/manager");
      const queueHealth = await queueManager.getAllQueuesHealth();

      socket.emit("queue:status", {
        queues: queueHealth,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to send queue status:", error);
    }
  }

  private calculateDocumentProgress(
    status: string,
    jobs: any[]
  ): {
    percentage: number;
    currentStep: string;
    estimatedCompletion?: string;
  } {
    const statusProgress: Record<string, number> = {
      UPLOADED: 0,
      QUEUED: 10,
      PROCESSING: 25,
      OCR_COMPLETE: 40,
      EXTRACTION_COMPLETE: 60,
      ANALYSIS_COMPLETE: 80,
      COMPLETED: 100,
      FAILED: 0,
    };

    const percentage = statusProgress[status] || 0;
    const activeJob = jobs.find((job) => job.status === "ACTIVE");
    const currentStep = activeJob?.jobType || status;

    // Calculate estimated completion
    let estimatedCompletion: string | undefined;
    if (percentage < 100 && jobs.length > 0) {
      const totalEstimatedTime = jobs.reduce(
        (sum, job) => sum + (job.estimatedTime || 60),
        0
      );
      estimatedCompletion = new Date(
        Date.now() + totalEstimatedTime * 1000
      ).toISOString();
    }

    return { percentage, currentStep, estimatedCompletion };
  }

  private handleDisconnection(socket: any, user: SocketUser): void {
    this.connectedUsers.delete(socket.id);

    const userSocketSet = this.userSockets.get(user.userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(user.userId);
      }
    }
  }

  private setupEventHandlers(): void {
    // Handle process events for graceful shutdown
    process.on("SIGTERM", () => {

      this.shutdown();
    });

    process.on("SIGINT", () => {

      this.shutdown();
    });
  }

  // Public methods for broadcasting updates
  async broadcastDocumentProgress(
    update: DocumentProgressUpdate
  ): Promise<void> {
    if (!this.io) return;

    // Broadcast to document room
    this.io
      .to(`document:${update.documentId}`)
      .emit("document:progress", update);

    // Also broadcast to client room
    this.io.to(`client:${update.clientId}`).emit("document:progress", update);

  }

  async broadcastAnalysisUpdate(update: AnalysisUpdate): Promise<void> {
    if (!this.io) return;

    this.io.to(`document:${update.documentId}`).emit("analysis:update", update);
    this.io.to(`client:${update.clientId}`).emit("analysis:update", update);

  }

  async sendNotificationToUser(
    userId: string,
    notification: NotificationUpdate
  ): Promise<void> {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit("notification", notification);

  }

  async sendNotificationToClient(
    clientId: string,
    notification: NotificationUpdate
  ): Promise<void> {
    if (!this.io) return;

    this.io.to(`client:${clientId}`).emit("notification", notification);

  }

  async broadcastSystemAlert(alert: NotificationUpdate): Promise<void> {
    if (!this.io) return;

    this.io.emit("system:alert", alert);

  }

  // Administrative methods
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  getConnectedUsers(): Array<{ socketId: string; user: SocketUser }> {
    return Array.from(this.connectedUsers.entries()).map(
      ([socketId, user]) => ({
        socketId,
        user,
      })
    );
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  async disconnectUser(userId: string, reason?: string): Promise<void> {
    if (!this.io) return;

    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);

        }
      }
    }
  }

  async shutdown(): Promise<void> {
    if (this.io) {
      // Notify all connected clients
      this.io.emit("system:shutdown", {
        message: "Server is shutting down",
        timestamp: new Date().toISOString(),
      });

      // Close all connections
      this.io.close();

    }
  }

  // Health check
  getHealthStatus(): {
    status: "healthy" | "unhealthy";
    connectedUsers: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    return {
      status: this.io ? "healthy" : "unhealthy",
      connectedUsers: this.getConnectedUsersCount(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}

// Export singleton instance
export const socketServer = new MedicalDocumentSocketServer();

// Export types
export type {
  SocketUser,
  DocumentProgressUpdate,
  AnalysisUpdate,
  NotificationUpdate,
};
