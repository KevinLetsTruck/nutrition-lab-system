import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testUploadAndAnalyze() {
  console.log('🧪 Testing Complete Upload and Analyze Flow...\n')
  
  try {
    // Step 1: Create a test PDF file
    console.log('📄 Step 1: Creating test PDF content...')
    const testContent = `NAQ Questions and Answers

Nutritional Assessment Questionnaire
Patient Name: Test Patient
Date: ${new Date().toISOString()}

Section 1: Energy
Q1: How is your energy level? Answer: Low (3/5)
Q2: Do you feel fatigued? Answer: Yes, frequently

Section 2: Digestion  
Q1: Any digestive issues? Answer: Sometimes after meals
Q2: Bloating after meals? Answer: Yes, especially with dairy

Section 3: Sleep
Q1: How is your sleep quality? Answer: Poor (2/5)
Q2: Do you wake up refreshed? Answer: Rarely

Symptom Burden Score: 45/100
Overall Health Score: 65/100`
    
    // Create a simple PDF-like buffer (in real scenario, this would be a PDF)
    const fileBuffer = Buffer.from(testContent)
    const fileName = `NAQ-Test-${Date.now()}.pdf`
    
    console.log('File name:', fileName)
    console.log('File size:', fileBuffer.length, 'bytes')
    
    // Step 2: Upload the file through the API
    console.log('\n📤 Step 2: Uploading file through API...')
    
    // Create FormData with the file
    const formData = new FormData()
    const blob = new Blob([fileBuffer], { type: 'application/pdf' })
    formData.append('file', blob, fileName)
    formData.append('clientEmail', 'test@example.com')
    formData.append('clientFirstName', 'Test')
    formData.append('clientLastName', 'Patient')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const uploadResult = await uploadResponse.json()
    console.log('Upload response status:', uploadResponse.status)
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2))
    
    if (!uploadResponse.ok || !uploadResult.success) {
      throw new Error(`Upload failed: ${uploadResult.error || 'Unknown error'}`)
    }
    
    const uploadedFile = uploadResult.files[0]
    console.log('✅ File uploaded successfully!')
    console.log('Lab Report ID:', uploadedFile.labReportId)
    console.log('Storage Path:', uploadedFile.storagePath)
    console.log('Bucket:', uploadedFile.bucket)
    
    // Step 3: Check if file exists in storage
    console.log('\n🔍 Step 3: Verifying file in storage...')
    const { data: fileData, error: fileError } = await supabase.storage
      .from(uploadedFile.bucket || 'general')
      .download(uploadedFile.storagePath)
    
    if (fileError) {
      console.log('❌ File not found in storage:', fileError.message)
    } else {
      console.log('✅ File exists in storage!')
      console.log('Downloaded size:', fileData.size, 'bytes')
    }
    
    // Step 4: Analyze the uploaded file
    console.log('\n🔬 Step 4: Analyzing the uploaded file...')
    const analyzeResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labReportId: uploadedFile.labReportId
      })
    })
    
    const analyzeResult = await analyzeResponse.json()
    console.log('Analyze response status:', analyzeResponse.status)
    
    if (analyzeResponse.ok) {
      console.log('✅ Analysis successful!')
      console.log('Full result keys:', Object.keys(analyzeResult))
      console.log('Analysis object:', analyzeResult.analysis ? 'Present' : 'Missing')
      console.log('Report Type:', analyzeResult.analysis?.reportType)
      console.log('Processing Time:', analyzeResult.processingTime, 'ms')
      console.log('Has Summary:', !!analyzeResult.summary)
      
      if (analyzeResult.analysis?.reportType !== 'nutriq') {
        console.log('⚠️  WARNING: Expected nutriq but got:', analyzeResult.analysis?.reportType)
      }
      
      console.log('\nAnalysis details:')
      console.log(JSON.stringify(analyzeResult, null, 2))
    } else {
      console.log('❌ Analysis failed!')
      console.log('Error:', analyzeResult.error)
      console.log('Details:', analyzeResult.details)
      console.log('Full response:', JSON.stringify(analyzeResult, null, 2))
    }
    
    // Step 5: Check the database record
    console.log('\n💾 Step 5: Checking database record...')
    const { data: dbRecord, error: dbError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('id', uploadedFile.labReportId)
      .single()
    
    if (dbError) {
      console.log('❌ Database error:', dbError.message)
    } else {
      console.log('Database record:')
      console.log('  Status:', dbRecord.status)
      console.log('  Report Type:', dbRecord.report_type)
      console.log('  File Path:', dbRecord.file_path)
      console.log('  Has Results:', !!dbRecord.results)
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testUploadAndAnalyze().catch(console.error)