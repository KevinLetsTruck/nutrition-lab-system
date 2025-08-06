/**
 * CacheManager Usage Examples
 * Demonstrates how to use the AI service cache manager
 */

import { CacheManager } from '../cache-manager';

async function demonstrateCaching() {
  console.log('=== CACHE MANAGER DEMONSTRATION ===\n');

  // Create a cache manager with 5-minute TTL
  const cache = new CacheManager(5 * 60 * 1000);

  // Example 1: Basic caching
  console.log('1. Basic Caching:');
  const prompt = 'What are the health benefits of walking?';
  const options = { model: 'gpt-4', temperature: 0.7 };
  
  // Generate cache key
  const cacheKey = cache.generateKey(prompt, options);
  console.log(`Cache key (MD5): ${cacheKey}`);

  // Store a response
  const mockResponse = {
    content: 'Walking provides numerous health benefits including improved cardiovascular health...',
    provider: 'openai',
    timestamp: Date.now()
  };
  
  cache.set(cacheKey, mockResponse);
  console.log('Response cached successfully');

  // Retrieve from cache
  const cachedValue = cache.get(cacheKey);
  console.log('Retrieved from cache:', cachedValue ? 'Success' : 'Failed');

  // Example 2: Custom TTL
  console.log('\n2. Custom TTL (10 seconds):');
  const shortLivedKey = cache.generateKey('Short-lived query', {});
  cache.set(shortLivedKey, { data: 'This expires quickly' }, 10000); // 10 seconds
  
  console.log('Immediately after caching:', cache.get(shortLivedKey) ? 'Found' : 'Not found');
  
  // Wait 11 seconds to see expiration
  console.log('Waiting 11 seconds...');
  await new Promise(resolve => setTimeout(resolve, 11000));
  console.log('After 11 seconds:', cache.get(shortLivedKey) ? 'Found' : 'Not found (expired)');

  // Example 3: Cache statistics
  console.log('\n3. Cache Statistics:');
  const stats = cache.getStats();
  console.log(`Total entries: ${stats.size}`);
  console.log('Entries:', stats.entries.map(e => ({
    key: e.key.substring(0, 16) + '...',
    expiresAt: new Date(e.expiresAt).toLocaleTimeString()
  })));

  // Example 4: Different prompts generate different keys
  console.log('\n4. Cache Key Uniqueness:');
  const key1 = cache.generateKey('What is diabetes?', { model: 'gpt-4' });
  const key2 = cache.generateKey('What is diabetes?', { model: 'gpt-3.5' });
  const key3 = cache.generateKey('What is cancer?', { model: 'gpt-4' });
  
  console.log('Same prompt, different model:', key1 === key2 ? 'Same key' : 'Different keys');
  console.log('Different prompt, same model:', key1 === key3 ? 'Same key' : 'Different keys');

  // Example 5: Clear cache
  console.log('\n5. Clearing Cache:');
  console.log(`Before clear: ${cache.size()} entries`);
  cache.clear();
  console.log(`After clear: ${cache.size()} entries`);
}

// Demonstrate real-world usage with AI responses
async function realWorldExample() {
  console.log('\n=== REAL-WORLD AI CACHING EXAMPLE ===\n');

  const cache = new CacheManager(60 * 60 * 1000); // 1 hour TTL

  // Simulate AI service calls
  async function aiServiceCall(prompt: string, options: any) {
    const cacheKey = cache.generateKey(prompt, options);
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for prompt: "${prompt.substring(0, 30)}..."`);
      return { ...cached, fromCache: true };
    }

    // Simulate API call
    console.log(`❌ Cache MISS for prompt: "${prompt.substring(0, 30)}..." - calling API`);
    const response = {
      content: `AI response for: ${prompt}`,
      provider: options.provider || 'anthropic',
      timestamp: Date.now(),
      usage: { tokens: 100 }
    };

    // Cache the response
    cache.set(cacheKey, response);
    
    return { ...response, fromCache: false };
  }

  // Test repeated calls
  const healthPrompt = 'Analyze this blood test result: glucose 120 mg/dL';
  const options = { provider: 'anthropic', temperature: 0.3 };

  console.log('First call:');
  let result = await aiServiceCall(healthPrompt, options);
  console.log(`Response received (from cache: ${result.fromCache})`);

  console.log('\nSecond call (should be cached):');
  result = await aiServiceCall(healthPrompt, options);
  console.log(`Response received (from cache: ${result.fromCache})`);

  console.log('\nDifferent temperature (should NOT be cached):');
  result = await aiServiceCall(healthPrompt, { ...options, temperature: 0.7 });
  console.log(`Response received (from cache: ${result.fromCache})`);
}

// Run the demonstrations
if (require.main === module) {
  (async () => {
    await demonstrateCaching();
    await realWorldExample();
    
    console.log('\n=== DEMONSTRATION COMPLETE ===');
    process.exit(0); // Exit to stop the cleanup interval
  })();
}