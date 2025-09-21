export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => number {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return duration;
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(label: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const avg = values.reduce((sum, val) => sum + val, 0) / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// API timing middleware
export function withTiming<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  label: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const monitor = PerformanceMonitor.getInstance();
    const endTimer = monitor.startTimer(label);
    
    try {
      const result = await fn(...args);
      const duration = endTimer();
      
      // Log slow operations in development
      if (process.env.NODE_ENV !== 'production' && duration > 1000) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  };
}

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startRender: () => monitor.startTimer(`${componentName}:render`),
    startEffect: (effectName: string) => monitor.startTimer(`${componentName}:${effectName}`),
    getMetrics: () => monitor.getMetrics(`${componentName}:render`),
  };
}
