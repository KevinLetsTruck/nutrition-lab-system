import { spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

export interface PDFRepairResult {
  success: boolean;
  repairedBuffer?: Buffer;
  error?: string;
  method: string;
}

export class PDFRepairUtility {
  /**
   * Attempts to repair/convert a PDF to make it compatible with Textract
   */
  static async repairPDFForTextract(originalBuffer: Buffer): Promise<PDFRepairResult> {
    console.log('[PDF-REPAIR] Attempting to repair PDF for Textract compatibility...');
    
    try {
      // Method 1: Try using Ghostscript to convert to a standard PDF format
      const ghostscriptResult = await this.convertWithGhostscript(originalBuffer);
      if (ghostscriptResult.success) {
        console.log('[PDF-REPAIR] Ghostscript conversion successful');
        return ghostscriptResult;
      }
      
      // Method 2: Try using pdftk to repair the PDF
      const pdftkResult = await this.repairWithPDFtk(originalBuffer);
      if (pdftkResult.success) {
        console.log('[PDF-REPAIR] PDFtk repair successful');
        return pdftkResult;
      }
      
      // Method 3: Try using qpdf to repair the PDF
      const qpdfResult = await this.repairWithQPDF(originalBuffer);
      if (qpdfResult.success) {
        console.log('[PDF-REPAIR] QPDF repair successful');
        return qpdfResult;
      }
      
      console.log('[PDF-REPAIR] All repair methods failed');
      return {
        success: false,
        error: 'All PDF repair methods failed',
        method: 'none'
      };
      
    } catch (error) {
      console.error('[PDF-REPAIR] Error during repair:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'error'
      };
    }
  }
  
  /**
   * Convert PDF using Ghostscript
   */
  private static async convertWithGhostscript(originalBuffer: Buffer): Promise<PDFRepairResult> {
    try {
      // Check if Ghostscript is available
      const gsAvailable = await this.checkCommandAvailable('gs');
      if (!gsAvailable) {
        console.log('[PDF-REPAIR] Ghostscript not available');
        return { success: false, error: 'Ghostscript not available', method: 'ghostscript' };
      }
      
      // Create temporary files
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
      const outputPath = path.join(tempDir, `output-${Date.now()}.pdf`);
      
      // Write input file
      await writeFile(inputPath, originalBuffer);
      
      // Run Ghostscript conversion
      const result = await this.runCommand('gs', [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/printer',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputPath}`,
        inputPath
      ]);
      
      if (result.success) {
        // Read the converted file
        const repairedBuffer = await this.readFile(outputPath);
        
        // Clean up
        await this.cleanupFiles([inputPath, outputPath]);
        
        return {
          success: true,
          repairedBuffer,
          method: 'ghostscript'
        };
      }
      
      // Clean up
      await this.cleanupFiles([inputPath, outputPath]);
      
      return {
        success: false,
        error: result.error,
        method: 'ghostscript'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'ghostscript'
      };
    }
  }
  
  /**
   * Repair PDF using PDFtk
   */
  private static async repairWithPDFtk(originalBuffer: Buffer): Promise<PDFRepairResult> {
    try {
      // Check if PDFtk is available
      const pdftkAvailable = await this.checkCommandAvailable('pdftk');
      if (!pdftkAvailable) {
        console.log('[PDF-REPAIR] PDFtk not available');
        return { success: false, error: 'PDFtk not available', method: 'pdftk' };
      }
      
      // Create temporary files
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
      const outputPath = path.join(tempDir, `output-${Date.now()}.pdf`);
      
      // Write input file
      await writeFile(inputPath, originalBuffer);
      
      // Run PDFtk repair
      const result = await this.runCommand('pdftk', [
        inputPath,
        'output',
        outputPath,
        'flatten'
      ]);
      
      if (result.success) {
        // Read the repaired file
        const repairedBuffer = await this.readFile(outputPath);
        
        // Clean up
        await this.cleanupFiles([inputPath, outputPath]);
        
        return {
          success: true,
          repairedBuffer,
          method: 'pdftk'
        };
      }
      
      // Clean up
      await this.cleanupFiles([inputPath, outputPath]);
      
      return {
        success: false,
        error: result.error,
        method: 'pdftk'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'pdftk'
      };
    }
  }
  
  /**
   * Repair PDF using QPDF
   */
  private static async repairWithQPDF(originalBuffer: Buffer): Promise<PDFRepairResult> {
    try {
      // Check if QPDF is available
      const qpdfAvailable = await this.checkCommandAvailable('qpdf');
      if (!qpdfAvailable) {
        console.log('[PDF-REPAIR] QPDF not available');
        return { success: false, error: 'QPDF not available', method: 'qpdf' };
      }
      
      // Create temporary files
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
      const outputPath = path.join(tempDir, `output-${Date.now()}.pdf`);
      
      // Write input file
      await writeFile(inputPath, originalBuffer);
      
      // Run QPDF repair
      const result = await this.runCommand('qpdf', [
        '--replace-input',
        '--linearize',
        inputPath,
        outputPath
      ]);
      
      if (result.success) {
        // Read the repaired file
        const repairedBuffer = await this.readFile(outputPath);
        
        // Clean up
        await this.cleanupFiles([inputPath, outputPath]);
        
        return {
          success: true,
          repairedBuffer,
          method: 'qpdf'
        };
      }
      
      // Clean up
      await this.cleanupFiles([inputPath, outputPath]);
      
      return {
        success: false,
        error: result.error,
        method: 'qpdf'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'qpdf'
      };
    }
  }
  
  /**
   * Check if a command is available
   */
  private static async checkCommandAvailable(command: string): Promise<boolean> {
    try {
      const result = await this.runCommand('which', [command]);
      return result.success;
    } catch {
      return false;
    }
  }
  
  /**
   * Run a command and return result
   */
  private static async runCommand(command: string, args: string[]): Promise<{ success: boolean; error?: string; output?: string }> {
    return new Promise((resolve) => {
      const child = spawn(command, args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout });
        } else {
          resolve({ success: false, error: stderr || `Command failed with code ${code}` });
        }
      });
      
      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }
  
  /**
   * Read a file and return buffer
   */
  private static async readFile(filePath: string): Promise<Buffer> {
    const { readFile } = await import('fs/promises');
    return readFile(filePath);
  }
  
  /**
   * Clean up temporary files
   */
  private static async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.warn(`[PDF-REPAIR] Could not delete ${filePath}:`, error);
      }
    }
  }
} 