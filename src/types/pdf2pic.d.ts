declare module 'pdf2pic' {
  export interface Options {
    density: number;
    saveFilename: string;
    savePath: string;
    format: string;
    width?: number;
    height?: number;
    preserveAspectRatio?: boolean;
  }

  export interface ConvertResult {
    name: string;
    size: string;
    fileSize: number;
    path: string;
    page: number;
    buffer?: Buffer;
  }

  export interface Converter {
    (pageNumber: number): Promise<ConvertResult>;
  }

  export function fromPath(pdfPath: string, options: Options): Converter;
  export function fromBuffer(buffer: Buffer, options: Options): Converter;
  
  const pdf2pic: {
    fromPath: typeof fromPath;
    fromBuffer: typeof fromBuffer;
  };
  
  export default pdf2pic;
}