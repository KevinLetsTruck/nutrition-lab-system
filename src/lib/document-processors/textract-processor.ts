import { 
  TextractClient, 
  AnalyzeDocumentCommand,
  Block,
  FeatureType,
  Document
} from '@aws-sdk/client-textract'

export interface ExtractedContent {
  text: string
  tables: ExtractedTable[]
  keyValuePairs: KeyValuePair[]
  confidence: number
  pageCount: number
  rawBlocks?: Block[]
}

export interface ExtractedTable {
  rows: string[][]
  confidence: number
}

export interface KeyValuePair {
  key: string
  value: string
  confidence: number
}

export class TextractProcessor {
  private client: TextractClient
  
  constructor() {
    // Initialize Textract client with credentials from environment
    this.client = new TextractClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
  }

  /**
   * Extract text, tables, and key-value pairs from a document
   */
  async extractFromDocument(documentBuffer: Buffer): Promise<ExtractedContent> {
    console.log('[TEXTRACT] Starting document analysis...')
    
    try {
      // Prepare the document
      const document: Document = {
        Bytes: new Uint8Array(documentBuffer)
      }

      // Configure what to extract
      const featureTypes: FeatureType[] = ['TABLES', 'FORMS']

      // Send to Textract
      const command = new AnalyzeDocumentCommand({
        Document: document,
        FeatureTypes: featureTypes
      })

      const response = await this.client.send(command)
      
      if (!response.Blocks) {
        throw new Error('No content extracted from document')
      }

      console.log(`[TEXTRACT] Extracted ${response.Blocks.length} blocks`)

      // Process the blocks
      const extractedContent = this.processBlocks(response.Blocks)
      
      return extractedContent
      
    } catch (error) {
      console.error('[TEXTRACT] Error:', error)
      throw new Error(`Textract processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process Textract blocks into structured content
   */
  private processBlocks(blocks: Block[]): ExtractedContent {
    const lines: string[] = []
    const tables: ExtractedTable[] = []
    const keyValuePairs: KeyValuePair[] = []
    const pageSet = new Set<number>()
    let totalConfidence = 0
    let confidenceCount = 0

    // Create a map of block IDs to blocks for relationship lookups
    const blockMap = new Map<string, Block>()
    blocks.forEach(block => {
      if (block.Id) {
        blockMap.set(block.Id, block)
      }
    })

    // Process each block
    blocks.forEach(block => {
      // Track pages
      if (block.Page) {
        pageSet.add(block.Page)
      }

      // Track confidence
      if (block.Confidence) {
        totalConfidence += block.Confidence
        confidenceCount++
      }

      switch (block.BlockType) {
        case 'LINE':
          if (block.Text) {
            lines.push(block.Text)
          }
          break

        case 'KEY_VALUE_SET':
          // Process key-value pairs
          const kvPair = this.extractKeyValuePair(block, blockMap)
          if (kvPair) {
            keyValuePairs.push(kvPair)
          }
          break

        case 'TABLE':
          // Process tables
          const table = this.extractTable(block, blockMap)
          if (table) {
            tables.push(table)
          }
          break
      }
    })

    // Join all text lines
    const fullText = lines.join('\n')
    
    // Calculate average confidence
    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0

    console.log('[TEXTRACT] Extraction complete:', {
      textLength: fullText.length,
      tableCount: tables.length,
      keyValueCount: keyValuePairs.length,
      pageCount: pageSet.size,
      avgConfidence: avgConfidence.toFixed(2)
    })

    return {
      text: fullText,
      tables,
      keyValuePairs,
      confidence: avgConfidence,
      pageCount: pageSet.size,
      rawBlocks: blocks
    }
  }

  /**
   * Extract key-value pair from blocks
   */
  private extractKeyValuePair(kvBlock: Block, blockMap: Map<string, Block>): KeyValuePair | null {
    if (!kvBlock.EntityTypes?.includes('KEY')) {
      return null
    }

    let key = ''
    let value = ''
    let confidence = kvBlock.Confidence || 0

    // Get the key text
    if (kvBlock.Relationships) {
      for (const relationship of kvBlock.Relationships) {
        if (relationship.Type === 'CHILD' && relationship.Ids) {
          for (const id of relationship.Ids) {
            const childBlock = blockMap.get(id)
            if (childBlock?.Text) {
              key += childBlock.Text + ' '
            }
          }
        }
      }
    }

    // Find the corresponding value
    if (kvBlock.Relationships) {
      for (const relationship of kvBlock.Relationships) {
        if (relationship.Type === 'VALUE' && relationship.Ids) {
          for (const valueId of relationship.Ids) {
            const valueBlock = blockMap.get(valueId)
            if (valueBlock?.Relationships) {
              for (const valueRel of valueBlock.Relationships) {
                if (valueRel.Type === 'CHILD' && valueRel.Ids) {
                  for (const id of valueRel.Ids) {
                    const childBlock = blockMap.get(id)
                    if (childBlock?.Text) {
                      value += childBlock.Text + ' '
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    key = key.trim()
    value = value.trim()

    if (key) {
      return { key, value, confidence }
    }

    return null
  }

  /**
   * Extract table from blocks
   */
  private extractTable(tableBlock: Block, blockMap: Map<string, Block>): ExtractedTable | null {
    if (!tableBlock.Relationships) {
      return null
    }

    const cells: Map<string, { row: number; col: number; text: string }> = new Map()
    let maxRow = 0
    let maxCol = 0

    // Get all cells in the table
    for (const relationship of tableBlock.Relationships) {
      if (relationship.Type === 'CHILD' && relationship.Ids) {
        for (const cellId of relationship.Ids) {
          const cellBlock = blockMap.get(cellId)
          if (cellBlock?.BlockType === 'CELL') {
            const rowIndex = cellBlock.RowIndex || 0
            const colIndex = cellBlock.ColumnIndex || 0
            maxRow = Math.max(maxRow, rowIndex)
            maxCol = Math.max(maxCol, colIndex)

            // Get cell text
            let cellText = ''
            if (cellBlock.Relationships) {
              for (const cellRel of cellBlock.Relationships) {
                if (cellRel.Type === 'CHILD' && cellRel.Ids) {
                  for (const id of cellRel.Ids) {
                    const childBlock = blockMap.get(id)
                    if (childBlock?.Text) {
                      cellText += childBlock.Text + ' '
                    }
                  }
                }
              }
            }

            cells.set(`${rowIndex}-${colIndex}`, {
              row: rowIndex - 1, // Convert to 0-based
              col: colIndex - 1,
              text: cellText.trim()
            })
          }
        }
      }
    }

    // Convert to 2D array
    const rows: string[][] = []
    for (let r = 0; r < maxRow; r++) {
      rows[r] = []
      for (let c = 0; c < maxCol; c++) {
        const cell = cells.get(`${r + 1}-${c + 1}`)
        rows[r][c] = cell?.text || ''
      }
    }

    return {
      rows,
      confidence: tableBlock.Confidence || 0
    }
  }

  /**
   * Extract specific patterns common in lab reports
   */
  extractLabReportPatterns(content: ExtractedContent): {
    patientInfo: Record<string, string>
    testResults: Array<{ name: string; value: string; range?: string; unit?: string }>
    dates: string[]
  } {
    const patientInfo: Record<string, string> = {}
    const testResults: Array<{ name: string; value: string; range?: string; unit?: string }> = []
    const dates: string[] = []

    // Extract from key-value pairs
    content.keyValuePairs.forEach(kv => {
      const keyLower = kv.key.toLowerCase()
      
      // Patient information
      if (keyLower.includes('patient') || keyLower.includes('name')) {
        patientInfo['name'] = kv.value
      } else if (keyLower.includes('dob') || keyLower.includes('birth')) {
        patientInfo['dateOfBirth'] = kv.value
      } else if (keyLower.includes('id') || keyLower.includes('mrn')) {
        patientInfo['patientId'] = kv.value
      }
      
      // Dates
      const dateMatch = kv.value.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
      if (dateMatch) {
        dates.push(dateMatch[0])
      }
    })

    // Extract test results from tables
    content.tables.forEach(table => {
      // Look for tables that appear to be test results
      if (table.rows.length > 1) {
        const headers = table.rows[0].map(h => h.toLowerCase())
        const testNameIdx = headers.findIndex(h => 
          h.includes('test') || h.includes('analyte') || h.includes('name')
        )
        const valueIdx = headers.findIndex(h => 
          h.includes('result') || h.includes('value')
        )
        const rangeIdx = headers.findIndex(h => 
          h.includes('range') || h.includes('reference')
        )
        const unitIdx = headers.findIndex(h => 
          h.includes('unit')
        )

        if (testNameIdx >= 0 && valueIdx >= 0) {
          // Extract test results from remaining rows
          for (let i = 1; i < table.rows.length; i++) {
            const row = table.rows[i]
            if (row[testNameIdx] && row[valueIdx]) {
              testResults.push({
                name: row[testNameIdx],
                value: row[valueIdx],
                range: rangeIdx >= 0 ? row[rangeIdx] : undefined,
                unit: unitIdx >= 0 ? row[unitIdx] : undefined
              })
            }
          }
        }
      }
    })

    return { patientInfo, testResults, dates }
  }
}