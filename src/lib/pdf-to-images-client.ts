/**
 * Client-side PDF to image conversion using PDF.js
 * This runs in the browser and doesn't require server-side dependencies
 */

// Use dynamic import to avoid SSR issues
let pdfjsLib: any;

if (typeof window !== 'undefined') {
  import('pdfjs-dist').then(pdfjs => {
    pdfjsLib = pdfjs;
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  });
}

export interface PDFImage {
  pageNumber: number;
  base64: string;
  width: number;
  height: number;
}

export interface PDFConversionOptions {
  scale?: number;        // Default: 2.0 for good quality
  maxPages?: number;     // Default: 10 to limit processing
  imageFormat?: string;  // Default: 'image/png'
  quality?: number;      // For JPEG, 0-1, default: 0.92
}

/**
 * Convert a PDF file to images in the browser
 */
export async function convertPDFToImages(
  file: File | ArrayBuffer,
  options: PDFConversionOptions = {}
): Promise<PDFImage[]> {
  const {
    scale = 2.0,
    maxPages = 10,
    imageFormat = 'image/png',
    quality = 0.92
  } = options;

  console.log('[PDF-TO-IMAGES] Starting client-side PDF conversion...');

  try {
    // Get the PDF data
    const arrayBuffer = file instanceof File 
      ? await file.arrayBuffer() 
      : file;

    // Load the PDF
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, maxPages);
    
    console.log(`[PDF-TO-IMAGES] PDF loaded: ${pdf.numPages} pages (processing ${numPages})`);

    const images: PDFImage[] = [];

    // Convert each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Convert to base64
        const base64 = canvas.toDataURL(imageFormat, quality);
        
        // Remove data URL prefix to get just base64
        const base64Data = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        images.push({
          pageNumber: pageNum,
          base64: base64Data,
          width: viewport.width,
          height: viewport.height
        });

        console.log(`[PDF-TO-IMAGES] Converted page ${pageNum}/${numPages}`);

        // Clean up
        page.cleanup();
      } catch (pageError) {
        console.error(`[PDF-TO-IMAGES] Error converting page ${pageNum}:`, pageError);
      }
    }

    console.log(`[PDF-TO-IMAGES] Successfully converted ${images.length} pages`);
    return images;

  } catch (error) {
    console.error('[PDF-TO-IMAGES] PDF conversion error:', error);
    throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a PDF can be converted (valid PDF file)
 */
export async function isPDFConvertible(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check PDF header
    const header = String.fromCharCode(...uint8Array.slice(0, 4));
    return header === '%PDF';
  } catch {
    return false;
  }
}

/**
 * Get PDF metadata
 */
export async function getPDFInfo(file: File): Promise<{
  numPages: number;
  encrypted: boolean;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    return {
      numPages: pdf.numPages,
      encrypted: false
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('password')) {
      return { numPages: 0, encrypted: true };
    }
    throw error;
  }
}