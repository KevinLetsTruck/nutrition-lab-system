import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

// Cache for rendered pages
const pageCache = new Map<
  string,
  { canvas: HTMLCanvasElement; timestamp: number }
>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Cache for PDF documents
const documentCache = new Map<string, { pdf: any; timestamp: number }>();
const DOCUMENT_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Performance monitoring
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  pageCount: number;
  fileSize: number;
}

export class PDFPerformanceOptimizer {
  private static instance: PDFPerformanceOptimizer;
  private metrics: PerformanceMetrics[] = [];

  static getInstance(): PDFPerformanceOptimizer {
    if (!PDFPerformanceOptimizer.instance) {
      PDFPerformanceOptimizer.instance = new PDFPerformanceOptimizer();
    }
    return PDFPerformanceOptimizer.instance;
  }

  // Clear expired cache entries
  private clearExpiredCache() {
    const now = Date.now();

    // Clear page cache
    for (const [key, value] of pageCache.entries()) {
      if (now - value.timestamp > CACHE_EXPIRY) {
        pageCache.delete(key);
      }
    }

    // Clear document cache
    for (const [key, value] of documentCache.entries()) {
      if (now - value.timestamp > DOCUMENT_CACHE_EXPIRY) {
        documentCache.delete(key);
      }
    }
  }

  // Load PDF with caching
  async loadPDF(url: string, options?: any): Promise<any> {
    const startTime = performance.now();
    this.clearExpiredCache();

    // Check document cache
    const cacheKey = `${url}_${JSON.stringify(options || {})}`;
    const cached = documentCache.get(cacheKey);

    if (cached) {

      return cached.pdf;
    }

    try {
      const loadingTask = pdfjsLib.getDocument({
        url,
        cMapUrl: "/cmaps/",
        cMapPacked: true,
        ...options,
      });

      const pdf = await loadingTask.promise;

      // Cache the document
      documentCache.set(cacheKey, {
        pdf,
        timestamp: Date.now(),
      });

      const loadTime = performance.now() - startTime;
      }ms:`, url);

      return pdf;
    } catch (error) {
      console.error("Error loading PDF:", error);
      throw error;
    }
  }

  // Render page with caching
  async renderPage(
    pdf: any,
    pageNumber: number,
    scale: number,
    canvas: HTMLCanvasElement
  ): Promise<void> {
    const startTime = performance.now();
    const cacheKey = `${pdf.fingerprint}_${pageNumber}_${scale}`;

    // Check cache
    const cached = pageCache.get(cacheKey);
    if (cached) {
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = cached.canvas.width;
        canvas.height = cached.canvas.height;
        context.drawImage(cached.canvas, 0, 0);

        return;
      }
    }

    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext("2d");

      if (!context) throw new Error("Canvas context not available");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Cache the rendered page
      const cacheCanvas = document.createElement("canvas");
      cacheCanvas.width = canvas.width;
      cacheCanvas.height = canvas.height;
      const cacheContext = cacheCanvas.getContext("2d");

      if (cacheContext) {
        cacheContext.drawImage(canvas, 0, 0);
        pageCache.set(cacheKey, {
          canvas: cacheCanvas,
          timestamp: Date.now(),
        });
      }

      const renderTime = performance.now() - startTime;
      }ms`);
    } catch (error) {
      console.error("Error rendering page:", error);
      throw error;
    }
  }

  // Preload pages for better performance
  async preloadPages(
    pdf: any,
    currentPage: number,
    scale: number,
    preloadCount = 2
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let i = 1; i <= preloadCount; i++) {
      const nextPage = currentPage + i;
      const prevPage = currentPage - i;

      if (nextPage <= pdf.numPages) {
        promises.push(this.preloadPage(pdf, nextPage, scale));
      }

      if (prevPage >= 1) {
        promises.push(this.preloadPage(pdf, prevPage, scale));
      }
    }

    try {
      await Promise.all(promises);
    } catch (error) {

    }
  }

  private async preloadPage(
    pdf: any,
    pageNumber: number,
    scale: number
  ): Promise<void> {
    const cacheKey = `${pdf.fingerprint}_${pageNumber}_${scale}`;

    if (pageCache.has(cacheKey)) {
      return; // Already cached
    }

    try {
      const offscreenCanvas = document.createElement("canvas");
      await this.renderPage(pdf, pageNumber, scale, offscreenCanvas);
    } catch (error) {

    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      pagesCached: pageCache.size,
      documentsCached: documentCache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [, value] of pageCache.entries()) {
      // Estimate canvas memory usage (width * height * 4 bytes per pixel)
      totalSize += value.canvas.width * value.canvas.height * 4;
    }

    return totalSize;
  }

  // Clear all caches
  clearCache() {
    pageCache.clear();
    documentCache.clear();

  }

  // Record performance metrics
  recordMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Get performance analytics
  getPerformanceAnalytics() {
    if (this.metrics.length === 0) {
      return null;
    }

    const loadTimes = this.metrics.map((m) => m.loadTime);
    const renderTimes = this.metrics.map((m) => m.renderTime);

    return {
      averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      averageRenderTime:
        renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
      totalDocuments: this.metrics.length,
      cacheStats: this.getCacheStats(),
    };
  }
}

// Utility functions for PDF text extraction
export async function extractTextFromPDF(pdf: any): Promise<string> {
  const textContent: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      const pageText = text.items.map((item: any) => item.str).join(" ");
      textContent.push(pageText);
    } catch (error) {

    }
  }

  return textContent.join("\n");
}

// Search within PDF text
export async function searchInPDF(
  pdf: any,
  searchTerm: string,
  caseSensitive = false
): Promise<Array<{ page: number; matches: number; snippet: string }>> {
  const results: Array<{ page: number; matches: number; snippet: string }> = [];
  const searchRegex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    caseSensitive ? "g" : "gi"
  );

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      const matches = pageText.match(searchRegex);
      if (matches && matches.length > 0) {
        const firstMatchIndex = pageText.search(searchRegex);
        const snippet = pageText.substring(
          Math.max(0, firstMatchIndex - 50),
          Math.min(pageText.length, firstMatchIndex + searchTerm.length + 50)
        );

        results.push({
          page: i,
          matches: matches.length,
          snippet: `...${snippet}...`,
        });
      }
    } catch (error) {

    }
  }

  return results;
}

// PDF validation utilities
export function validatePDF(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.includes("pdf")) {
    return { isValid: false, error: "File must be a PDF" };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 50MB" };
  }

  return { isValid: true };
}

// PDF metadata extraction
export async function getPDFMetadata(pdf: any) {
  try {
    const metadata = await pdf.getMetadata();
    return {
      title: metadata.info?.Title || "Untitled",
      author: metadata.info?.Author || "Unknown",
      subject: metadata.info?.Subject || "",
      creator: metadata.info?.Creator || "",
      producer: metadata.info?.Producer || "",
      creationDate: metadata.info?.CreationDate || null,
      modificationDate: metadata.info?.ModDate || null,
      pageCount: pdf.numPages,
      fingerprint: pdf.fingerprint,
    };
  } catch (error) {

    return {
      title: "Untitled",
      author: "Unknown",
      subject: "",
      creator: "",
      producer: "",
      creationDate: null,
      modificationDate: null,
      pageCount: pdf.numPages,
      fingerprint: pdf.fingerprint,
    };
  }
}

export default PDFPerformanceOptimizer;
