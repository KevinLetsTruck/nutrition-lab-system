import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';

export interface PDFPage {
  pageNumber: number;
  imageBuffer: Buffer;
  base64: string;
}

export async function convertPDFToImages(pdfBuffer: Buffer): Promise<PDFPage[]> {
  try {
    // Configure pdf2pic for serverless environment
    const convert = fromBuffer(pdfBuffer, {
      density: 200, // DPI for good text recognition
      saveFilename: "page",
      savePath: "/tmp", // Use tmp directory in serverless
      format: "png",
      width: 1200,
      height: 1600
    });

    // Convert all pages
    const pages: PDFPage[] = [];
    let pageNumber = 1;
    
    while (true) {
      try {
        const result = await convert(pageNumber);
        if (!result) break;
        
        // Optimize image for vision API
        const optimizedBuffer = await sharp(result.buffer)
          .png({ quality: 90 })
          .resize(1200, null, { withoutEnlargement: true })
          .toBuffer();
        
        pages.push({
          pageNumber,
          imageBuffer: optimizedBuffer,
          base64: optimizedBuffer.toString('base64')
        });
        
        pageNumber++;
      } catch (error) {
        // No more pages
        break;
      }
    }
    
    return pages;
  } catch (error) {
    console.error('PDF to image conversion failed:', error);
    throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}