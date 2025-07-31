const Anthropic = require('@anthropic-ai/sdk')

async function testAnthropicKey() {
  console.log('🔍 Testing Anthropic API Key...')
  
  // Check if API key exists
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is missing!')
    console.log('💡 Make sure to set it in Vercel dashboard or locally')
    return false
  }
  
  console.log('✅ API Key found')
  console.log('📏 Key length:', apiKey.length)
  console.log('🔑 Key format valid:', apiKey.startsWith('sk-ant-'))
  
  try {
    // Initialize client
    const client = new Anthropic({ 
      apiKey,
      defaultHeaders: {
        'anthropic-version': '2023-06-01'
      }
    })
    
    console.log('✅ Anthropic client initialized successfully')
    
    // Test with a simple prompt
    console.log('🧪 Testing API call...')
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      temperature: 0,
      system: 'You are a helpful assistant.',
      messages: [{ 
        role: 'user', 
        content: 'Say "Hello, API key is working!" and nothing else.' 
      }]
    })
    
    if (message.content && message.content.length > 0 && message.content[0].type === 'text') {
      console.log('✅ API call successful!')
      console.log('📝 Response:', message.content[0].text)
      return true
    } else {
      console.error('❌ Unexpected response format')
      return false
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error.message)
    
    if (error.status === 401) {
      console.error('🔑 Authentication failed - check your API key')
    } else if (error.status === 400) {
      console.error('📝 Bad request - check your prompt format')
    } else if (error.status === 429) {
      console.error('⏰ Rate limit exceeded')
    } else {
      console.error('🌐 Network or other error')
    }
    
    return false
  }
}

// Run the test
testAnthropicKey()
  .then(success => {
    if (success) {
      console.log('\n🎉 Anthropic API key is working correctly!')
      process.exit(0)
    } else {
      console.log('\n💥 Anthropic API key test failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Test error:', error)
    process.exit(1)
  }) 