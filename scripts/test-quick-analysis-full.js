require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const MasterAnalyzer = require('../src/lib/lab-analyzers/master-analyzer').default

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQuickAnalysis() {
  console.log('🧪 Testing Quick Analysis Full Flow...\n')
  
  try {
    // Find a recent NAQ file
    const bucket = 'lab-files'
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const todayPath = `${year}/${month}/${day}`
    
    console.log(`📁 Looking for test file in ${bucket}/${todayPath}`)
    
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(todayPath, { limit: 10 })
    
    if (listError || !files || files.length === 0) {
      console.error('❌ No files found to test')
      return
    }
    
    // Find a NAQ file
    const naqFile = files.find(f => f.name.toLowerCase().includes('naq'))
    if (!naqFile) {
      console.error('❌ No NAQ file found to test')
      return
    }
    
    const filePath = `${todayPath}/${naqFile.name}`
    console.log(`✅ Found test file: ${filePath}`)
    
    // Download the file
    console.log('\n📥 Downloading file...')
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath)
    
    if (downloadError) {
      console.error('❌ Download error:', downloadError)
      return
    }
    
    // Convert to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    console.log(`✅ Downloaded file: ${(fileBuffer.length / 1024).toFixed(2)} KB`)
    
    // Test the analyzer
    console.log('\n🔬 Testing Master Analyzer...')
    console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing')
    
    try {
      const analyzer = MasterAnalyzer.getInstance()
      console.log('✅ Analyzer instance created')
      
      console.log('\n🤖 Attempting analysis...')
      const result = await analyzer.analyzeReport(fileBuffer)
      
      console.log('\n✅ Analysis successful!')
      console.log('Report Type:', result.reportType)
      console.log('Processing Time:', result.processingTime)
      console.log('Summary:', result.analysis?.summary ? 'Present' : 'Missing')
      
    } catch (analyzerError) {
      console.error('\n❌ Analyzer error:', analyzerError.message)
      if (analyzerError.stack) {
        console.error('Stack trace:', analyzerError.stack)
      }
      
      // Check for specific error types
      if (analyzerError.message.includes('ANTHROPIC_API_KEY')) {
        console.error('\n🔑 API Key Issue: The Anthropic API key is missing or invalid')
      } else if (analyzerError.message.includes('AI analysis failed')) {
        console.error('\n🤖 AI Service Issue: The Claude API returned an error')
      } else if (analyzerError.message.includes('PDF')) {
        console.error('\n📄 PDF Issue: Problem parsing the PDF file')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testQuickAnalysis().catch(console.error)