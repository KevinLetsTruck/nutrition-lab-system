// Socket.IO Client for Real-time Medical Document Updates
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  DocumentProgressUpdate,
  AnalysisUpdate,
  NotificationUpdate,
} from "./server";

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  token?: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastPing: number | null;
}

export interface DocumentSubscription {
  documentId: string;
  isSubscribed: boolean;
  lastUpdate?: DocumentProgressUpdate;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    token,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastPing: null,
  });

  const [documentSubscriptions, setDocumentSubscriptions] = useState<
    Map<string, DocumentSubscription>
  >(new Map());
  const [notifications, setNotifications] = useState<NotificationUpdate[]>([]);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    const socketUrl =
      process.env.NODE_ENV === "production"
        ? window.location.origin
        : "http://localhost:3000";

    const socket = io(socketUrl, {
      auth: {
        token: token || localStorage.getItem("auth_token"),
      },
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection events
    socket.on("connect", () => {

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));
      onConnect?.();
    });

    socket.on("disconnect", (reason) => {

      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
      onDisconnect?.(reason);
    });

    socket.on("connect_error", (error) => {
      console.error("📡 Socket connection error:", error);
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message,
      }));
      onError?.(error);
    });

    // Reconnection events
    socket.on("reconnect", (attemptNumber) => {

    });

    socket.on("reconnect_error", (error) => {
      console.error("📡 Reconnection failed:", error);
    });

    // Ping/pong for connection health
    socket.on("pong", (data) => {
      setState((prev) => ({ ...prev, lastPing: Date.now() }));
    });

    // Document progress updates
    socket.on("document:progress", (update: DocumentProgressUpdate) => {
      setDocumentSubscriptions((prev) => {
        const newSubs = new Map(prev);
        const existing = newSubs.get(update.documentId);
        if (existing) {
          newSubs.set(update.documentId, {
            ...existing,
            lastUpdate: update,
          });
        }
        return newSubs;
      });
    });

    // Document status updates
    socket.on("document:status", (update: DocumentProgressUpdate) => {
      setDocumentSubscriptions((prev) => {
        const newSubs = new Map(prev);
        const existing = newSubs.get(update.documentId);
        if (existing) {
          newSubs.set(update.documentId, {
            ...existing,
            lastUpdate: update,
          });
        }
        return newSubs;
      });
    });

    // Analysis updates
    socket.on("analysis:update", (update: AnalysisUpdate) => {
      // Custom event for analysis-specific updates
      window.dispatchEvent(
        new CustomEvent("analysis:update", { detail: update })
      );
    });

    // Notifications
    socket.on("notification", (notification: NotificationUpdate) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50
    });

    // System events
    socket.on("system:alert", (alert: NotificationUpdate) => {
      setNotifications((prev) => [alert, ...prev.slice(0, 49)]);
    });

    socket.on("system:shutdown", (data) => {

      socket.disconnect();
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("📡 Socket error:", error);
      setState((prev) => ({ ...prev, error: error.message || "Socket error" }));
    });

    socketRef.current = socket;
    socket.connect();
  }, [token, onConnect, onDisconnect, onError]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastPing: null,
    });
    setDocumentSubscriptions(new Map());
  }, []);

  // Subscribe to document updates
  const subscribeToDocument = useCallback((documentId: string) => {
    if (!socketRef.current?.connected) {

      return;
    }

    socketRef.current.emit("subscribe:document", documentId);

    setDocumentSubscriptions((prev) => {
      const newSubs = new Map(prev);
      newSubs.set(documentId, {
        documentId,
        isSubscribed: true,
      });
      return newSubs;
    });

  }, []);

  // Unsubscribe from document updates
  const unsubscribeFromDocument = useCallback((documentId: string) => {
    if (!socketRef.current?.connected) {

      return;
    }

    socketRef.current.emit("unsubscribe:document", documentId);

    setDocumentSubscriptions((prev) => {
      const newSubs = new Map(prev);
      newSubs.delete(documentId);
      return newSubs;
    });

  }, []);

  // Request document status
  const requestDocumentStatus = useCallback((documentId: string) => {
    if (!socketRef.current?.connected) {

      return;
    }

    socketRef.current.emit("request:document-status", documentId);
  }, []);

  // Request queue status
  const requestQueueStatus = useCallback(() => {
    if (!socketRef.current?.connected) {

      return;
    }

    socketRef.current.emit("request:queue-status");
  }, []);

  // Send ping to test connection
  const ping = useCallback(() => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit("ping");
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Periodic ping for connection health
  useEffect(() => {
    if (!state.isConnected) return;

    const pingInterval = setInterval(ping, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [state.isConnected, ping]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      for (const documentId of documentSubscriptions.keys()) {
        unsubscribeFromDocument(documentId);
      }
    };
  }, []); // Only run on unmount

  return {
    // Connection state
    ...state,

    // Connection controls
    connect,
    disconnect,
    ping,

    // Document subscriptions
    subscribeToDocument,
    unsubscribeFromDocument,
    requestDocumentStatus,
    documentSubscriptions,

    // Queue monitoring
    requestQueueStatus,

    // Notifications
    notifications,
    clearNotifications,
    removeNotification,

    // Raw socket for advanced usage
    socket: socketRef.current,
  };
}

// Hook for listening to analysis updates
export function useAnalysisUpdates() {
  const [analysisUpdates, setAnalysisUpdates] = useState<AnalysisUpdate[]>([]);

  useEffect(() => {
    const handleAnalysisUpdate = (event: CustomEvent<AnalysisUpdate>) => {
      setAnalysisUpdates((prev) => [event.detail, ...prev.slice(0, 9)]); // Keep last 10
    };

    window.addEventListener(
      "analysis:update",
      handleAnalysisUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "analysis:update",
        handleAnalysisUpdate as EventListener
      );
    };
  }, []);

  const clearAnalysisUpdates = useCallback(() => {
    setAnalysisUpdates([]);
  }, []);

  return {
    analysisUpdates,
    clearAnalysisUpdates,
  };
}

// Hook for document progress tracking
export function useDocumentProgress(documentId: string) {
  const {
    subscribeToDocument,
    unsubscribeFromDocument,
    documentSubscriptions,
  } = useWebSocket();
  const [progress, setProgress] = useState<DocumentProgressUpdate | null>(null);

  useEffect(() => {
    if (documentId) {
      subscribeToDocument(documentId);

      return () => {
        unsubscribeFromDocument(documentId);
      };
    }
  }, [documentId, subscribeToDocument, unsubscribeFromDocument]);

  useEffect(() => {
    const subscription = documentSubscriptions.get(documentId);
    if (subscription?.lastUpdate) {
      setProgress(subscription.lastUpdate);
    }
  }, [documentId, documentSubscriptions]);

  return progress;
}

// WebSocket context provider
import { createContext, useContext, ReactNode } from "react";

interface WebSocketContextType {
  webSocket: ReturnType<typeof useWebSocket>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({
  children,
  options = {},
}: {
  children: ReactNode;
  options?: UseWebSocketOptions;
}) {
  const webSocket = useWebSocket(options);

  return (
    <WebSocketContext.Provider value={{ webSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context.webSocket;
}

// Utility functions
export function formatNotification(notification: NotificationUpdate): string {
  return `[${notification.type}] ${notification.title}: ${notification.message}`;
}

export function getNotificationIcon(type: NotificationUpdate["type"]): string {
  const icons = {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
  };
  return icons[type] || "ℹ️";
}

export function isDocumentProcessing(update?: DocumentProgressUpdate): boolean {
  if (!update) return false;
  return update.progress < 100 && update.status !== "FAILED";
}

export function getProgressColor(progress: number, status: string): string {
  if (status === "FAILED") return "red";
  if (progress === 100) return "green";
  if (progress >= 75) return "blue";
  if (progress >= 50) return "yellow";
  return "gray";
}
