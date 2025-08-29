import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import {
  generateProtocolPDFTemplate,
  getDefaultTemplateOptions,
  validateProtocolData,
  type PDFProtocolData,
  type PDFTemplateOptions,
} from '../templates/protocol-pdf-template';
import {
  savePDFToStorage,
  generatePDFFilename,
  validatePDFBuffer,
  estimatePDFPageCount,
  formatFileSize,
  cleanupTempFiles,
  getPDFConfigForPaperSize,
  type PDFFileMetadata,
} from '../utils/pdf-helpers';

// PDF generation request interface
export interface PDFGenerationRequest {
  protocol: PDFProtocolData;
  options?: Partial<PDFTemplateOptions>;
  filename?: string;
}

// PDF generation result interface
export interface PDFGenerationResult {
  success: boolean;
  fileMetadata?: PDFFileMetadata;
  error?: string;
  generationTime?: number;
  debugInfo?: {
    templateSize: number;
    pdfSize: number;
    pageCount: number;
    processingTime: number;
  };
}

// Browser management
let browserInstance: Browser | null = null;
let browserTimeout: NodeJS.Timeout | null = null;

/**
 * Get or create browser instance with proper configuration
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    // Reset timeout when reusing browser
    resetBrowserTimeout();
    return browserInstance;
  }

  console.log('🚀 Launching new Puppeteer browser instance...');

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-translate',
      '--disable-sync',
      '--disable-background-networking',
      '--disable-software-rasterizer',
      '--disable-background-timer-throttling',
      '--disable-ipc-flooding-protection',
      '--memory-pressure-off',
      '--max_old_space_size=4096',
    ],
    timeout: 30000,
    protocolTimeout: 30000,
  };

  try {
    browserInstance = await puppeteer.launch(launchOptions);

    // Set up browser cleanup timeout (5 minutes of inactivity)
    resetBrowserTimeout();

    // Handle browser disconnection
    browserInstance.on('disconnected', () => {
      console.log('🔌 Browser disconnected');
      browserInstance = null;
      if (browserTimeout) {
        clearTimeout(browserTimeout);
        browserTimeout = null;
      }
    });

    console.log('✅ Browser launched successfully');
    return browserInstance;
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    throw new Error(
      `Browser launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Reset browser timeout
 */
function resetBrowserTimeout(): void {
  if (browserTimeout) {
    clearTimeout(browserTimeout);
  }

  // Close browser after 5 minutes of inactivity
  browserTimeout = setTimeout(
    async () => {
      if (browserInstance) {
        console.log('⏰ Closing idle browser instance...');
        try {
          await browserInstance.close();
        } catch (error) {
          console.error('Error closing browser:', error);
        } finally {
          browserInstance = null;
          browserTimeout = null;
        }
      }
    },
    5 * 60 * 1000
  ); // 5 minutes
}

/**
 * Create optimized page for PDF generation
 */
async function createOptimizedPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  // Set viewport for consistent rendering
  await page.setViewport({
    width: 1200,
    height: 1600,
    deviceScaleFactor: 2,
  });

  // Disable images and other resources to speed up rendering
  await page.setRequestInterception(true);
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (
      resourceType === 'image' ||
      resourceType === 'media' ||
      resourceType === 'font'
    ) {
      // Allow fonts but block images and media for faster rendering
      if (resourceType === 'font') {
        request.continue();
      } else {
        request.abort();
      }
    } else {
      request.continue();
    }
  });

  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  );

  return page;
}

/**
 * Generate PDF from HTML template
 */
async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFTemplateOptions
): Promise<Buffer> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await getBrowser();
    page = await createOptimizedPage(browser);

    console.log('📄 Setting HTML content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for any dynamic content to load
    await page.waitForTimeout(1000);

    console.log('🖨️ Generating PDF...');

    const pdfConfig = getPDFConfigForPaperSize(options.paperSize);

    const pdfOptions: PDFOptions = {
      format: pdfConfig.format,
      margin: pdfConfig.margin,
      printBackground: pdfConfig.printBackground,
      preferCSSPageSize: pdfConfig.preferCSSPageSize,
      displayHeaderFooter: pdfConfig.displayHeaderFooter,
      headerTemplate: pdfConfig.headerTemplate || '<div></div>',
      footerTemplate: pdfConfig.footerTemplate || '<div></div>',
      timeout: 30000,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    console.log(
      `✅ PDF generated in ${Date.now() - startTime}ms (${formatFileSize(pdfBuffer.length)})`
    );

    return pdfBuffer;
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  } finally {
    // Always close the page to prevent memory leaks
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.error('Error closing page:', error);
      }
    }
    // Don't close browser - let it timeout naturally for reuse
  }
}

/**
 * Main PDF generation function
 */
export async function generateProtocolPDF(
  request: PDFGenerationRequest
): Promise<PDFGenerationResult> {
  const startTime = Date.now();

  try {
    // Validate input data
    const validationErrors = validateProtocolData(request.protocol);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`,
        generationTime: Date.now() - startTime,
      };
    }

    // Merge options with defaults
    const templateOptions: PDFTemplateOptions = {
      ...getDefaultTemplateOptions(),
      ...request.options,
    };

    console.log(
      `🔄 Starting PDF generation for protocol: ${request.protocol.protocolName}`
    );

    // Generate HTML template
    const htmlContent = generateProtocolPDFTemplate(
      request.protocol,
      templateOptions
    );

    // Generate PDF from HTML
    const pdfBuffer = await generatePDFFromHTML(htmlContent, templateOptions);

    // Validate generated PDF
    if (!validatePDFBuffer(pdfBuffer)) {
      throw new Error('Generated PDF is invalid or corrupted');
    }

    // Generate filename
    const filename =
      request.filename ||
      generatePDFFilename(request.protocol.id, request.protocol.protocolName);

    // Save to storage
    const fileMetadata = await savePDFToStorage(
      pdfBuffer,
      filename,
      request.protocol.id,
      request.protocol.client.id
    );

    // Estimate page count
    const pageCount = estimatePDFPageCount(pdfBuffer);
    fileMetadata.pages = pageCount;

    const generationTime = Date.now() - startTime;

    console.log(
      `🎉 PDF generation completed successfully in ${generationTime}ms`
    );

    return {
      success: true,
      fileMetadata,
      generationTime,
      debugInfo: {
        templateSize: htmlContent.length,
        pdfSize: pdfBuffer.length,
        pageCount,
        processingTime: generationTime,
      },
    };
  } catch (error) {
    console.error('❌ PDF generation failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      generationTime: Date.now() - startTime,
    };
  }
}

/**
 * Generate PDF with retry logic
 */
export async function generateProtocolPDFWithRetry(
  request: PDFGenerationRequest,
  maxRetries: number = 2
): Promise<PDFGenerationResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`📝 PDF generation attempt ${attempt}/${maxRetries + 1}`);

      const result = await generateProtocolPDF(request);

      if (result.success) {
        if (attempt > 1) {
          console.log(`✅ PDF generation succeeded on attempt ${attempt}`);
        }
        return result;
      } else {
        lastError = new Error(result.error);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

      // Force browser restart on error
      if (browserInstance) {
        try {
          await browserInstance.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        } finally {
          browserInstance = null;
          if (browserTimeout) {
            clearTimeout(browserTimeout);
            browserTimeout = null;
          }
        }
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt <= maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: `PDF generation failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
    generationTime: 0,
  };
}

/**
 * Cleanup browser resources
 */
export async function cleanup(): Promise<void> {
  if (browserTimeout) {
    clearTimeout(browserTimeout);
    browserTimeout = null;
  }

  if (browserInstance) {
    try {
      await browserInstance.close();
      console.log('🧹 Browser instance cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      browserInstance = null;
    }
  }
}

/**
 * Get browser status for monitoring
 */
export function getBrowserStatus(): {
  isActive: boolean;
  hasTimeout: boolean;
  connected?: boolean;
} {
  return {
    isActive: browserInstance !== null,
    hasTimeout: browserTimeout !== null,
    connected: browserInstance?.isConnected(),
  };
}

/**
 * Health check function for PDF service
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: Date;
}> {
  try {
    // Test basic PDF generation with minimal data
    const testProtocol: PDFProtocolData = {
      id: 'health-check',
      protocolName: 'Health Check Test',
      status: 'active',
      client: {
        id: 'test',
        firstName: 'Test',
        lastName: 'Client',
        email: 'test@example.com',
      },
      supplements: [],
    };

    const startTime = Date.now();
    const result = await generateProtocolPDF({ protocol: testProtocol });
    const duration = Date.now() - startTime;

    if (result.success) {
      return {
        status: duration < 10000 ? 'healthy' : 'degraded',
        message: `PDF service operational (${duration}ms)`,
        timestamp: new Date(),
      };
    } else {
      return {
        status: 'unhealthy',
        message: `PDF service error: ${result.error}`,
        timestamp: new Date(),
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  const shutdownHandler = async (signal: string) => {
    console.log(`📴 Received ${signal}, cleaning up PDF service...`);
    await cleanup();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.on('SIGINT', () => shutdownHandler('SIGINT'));
}
