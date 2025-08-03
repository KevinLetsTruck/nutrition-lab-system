declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion: string
    IsAcroFormPresent: boolean
    IsXFAPresent: boolean
    Title?: string
    Author?: string
    Subject?: string
    Keywords?: string
    Creator?: string
    Producer?: string
    CreationDate?: string
    ModDate?: string
  }

  interface PDFMetadata {
    _metadata?: {
      [key: string]: any
    }
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata | null
    text: string
    version: string
  }

  interface PDFOptions {
    pagerender?: (pageData: any) => string
    max?: number
    version?: string
  }

  function parse(dataBuffer: Buffer | ArrayBuffer | Uint8Array, options?: PDFOptions): Promise<PDFData>

  export = parse
}