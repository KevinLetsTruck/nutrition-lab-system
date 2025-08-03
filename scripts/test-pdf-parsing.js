require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const pdf = require('pdf-parse')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPDFParsing() {
  console.log('🔍 Testing PDF Parsing...\n')
  
  try {
    // Download a NAQ file
    const bucket = 'lab-files'
    const path = '2025/08/02/Symptom-Burden-Comparision-Graph_1754173782421_mgguehqusir.pdf'
    
    console.log(`📥 Downloading ${path} from ${bucket}...`)
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    if (error) {
      console.error('❌ Download error:', error)
      return
    }
    
    // Convert to buffer
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`✅ Downloaded file: ${(buffer.length / 1024).toFixed(2)} KB`)
    
    // Try to parse as PDF
    console.log('\n📄 Parsing PDF...')
    
    try {
      const pdfData = await pdf(buffer)
      
      console.log('\n✅ PDF parsed successfully!')
      console.log('Number of pages:', pdfData.numpages)
      console.log('PDF version:', pdfData.version)
      console.log('Text length:', pdfData.text.length)
      console.log('\nFirst 500 characters of text:')
      console.log('-'.repeat(50))
      console.log(pdfData.text.substring(0, 500))
      console.log('-'.repeat(50))
      
      // Check if it's mostly images
      const textDensity = pdfData.text.length / pdfData.numpages
      console.log(`\nText density: ${textDensity.toFixed(0)} chars/page`)
      
      if (textDensity < 100) {
        console.log('⚠️  This PDF appears to be image-based (scanned)')
      }
      
      // Look for NAQ/NutriQ keywords
      const keywords = ['NAQ', 'NutriQ', 'Nutritional', 'Assessment', 'Questionnaire', 'Symptom']
      console.log('\n🔍 Checking for keywords:')
      keywords.forEach(keyword => {
        const found = pdfData.text.toLowerCase().includes(keyword.toLowerCase())
        console.log(`  ${keyword}: ${found ? '✅' : '❌'}`)
      })
      
    } catch (pdfError) {
      console.error('❌ PDF parsing error:', pdfError.message)
      
      // Check if it's actually a PDF
      const header = buffer.slice(0, 4).toString('ascii')
      console.log('File header:', header)
      console.log('Is PDF?', header === '%PDF')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testPDFParsing().catch(console.error)