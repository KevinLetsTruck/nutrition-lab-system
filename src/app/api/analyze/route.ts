import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import PDFLabParser from '@/lib/lab-analyzers/pdf-parser'

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', 'pdfs', filename)
    
    // Read the PDF file
    const pdfBuffer = await readFile(filePath)
    
    // Parse the PDF
    const parser = PDFLabParser.getInstance()
    const parsedReport = await parser.parseLabReport(pdfBuffer)
    
    return NextResponse.json({
      success: true,
      data: parsedReport
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze PDF' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Analysis endpoint ready' })
}
