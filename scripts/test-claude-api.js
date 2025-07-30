require('dotenv').config({ path: '.env.local' })
const Anthropic = require('@anthropic-ai/sdk')

async function testClaudeAPI() {
  console.log('===== Testing Claude API Connection =====')
  
  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  console.log('API Key present:', !!apiKey)
  console.log('API Key length:', apiKey ? apiKey.length : 0)
  console.log('API Key format valid:', apiKey ? apiKey.startsWith('sk-ant-') : false)
  console.log('API Key preview:', apiKey ? apiKey.substring(0, 15) + '...' : 'not set')
  
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY not found in environment variables')
    return
  }
  
  try {
    // Initialize client
    console.log('\nInitializing Anthropic client...')
    const client = new Anthropic({ apiKey })
    console.log('Client initialized successfully')
    
    // Test simple API call
    console.log('\nTesting API call...')
    const startTime = Date.now()
    
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      temperature: 0,
      system: 'You are a helpful assistant. Respond briefly.',
      messages: [{ role: 'user', content: 'Say "API connection successful" if you can read this.' }]
    })
    
    const endTime = Date.now()
    console.log('API call completed in', endTime - startTime, 'ms')
    console.log('Response:', message.content[0].text)
    console.log('Model used:', message.model)
    console.log('Usage:', message.usage)
    
    // Test lab report analysis
    console.log('\n===== Testing Lab Report Analysis =====')
    const testLabText = `
      NUTRIQ ASSESSMENT REPORT
      Patient Name: Test Patient
      Date: 2024-01-15
      
      Body System Scores:
      Energy: 85/100
      Mood: 72/100
      Sleep: 68/100
      Stress: 45/100
      Digestion: 90/100
      Immunity: 78/100
    `
    
    const analysisMessage = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0,
      system: 'You are an expert at identifying lab report types. Return only one of: nutriq, kbmo, dutch, cgm, food_photo',
      messages: [{ role: 'user', content: `What type of lab report is this?\n\n${testLabText}` }]
    })
    
    console.log('Report type detected:', analysisMessage.content[0].text.trim())
    
    console.log('\n✅ All tests passed! Claude API is working correctly.')
    
  } catch (error) {
    console.error('\n❌ API Test Failed!')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    
    if (error.status) {
      console.error('HTTP Status:', error.status)
    }
    
    if (error.error) {
      console.error('Error details:', JSON.stringify(error.error, null, 2))
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'))
    }
    
    // Specific error guidance
    if (error.status === 401) {
      console.error('\n⚠️  Invalid API key. Please check your ANTHROPIC_API_KEY.')
      console.error('Make sure it starts with "sk-ant-" and is valid.')
    } else if (error.status === 429) {
      console.error('\n⚠️  Rate limit exceeded. Wait a moment and try again.')
    } else if (error.message.includes('fetch failed')) {
      console.error('\n⚠️  Network error. Check your internet connection.')
    }
  }
}

// Run the test
testClaudeAPI().catch(console.error) 