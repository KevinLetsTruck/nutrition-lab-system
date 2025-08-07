#!/usr/bin/env tsx

/**
 * Test Redis cache integration
 */

import { CacheManager } from '../src/lib/ai/cache-manager';

async function testCache() {
  console.log('🧪 Testing Cache Manager...\n');
  
  // Create a cache manager instance
  const cache = new CacheManager(60000); // 1 minute TTL
  
  // Wait a bit for Redis connection
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Test 1: Set and get
    console.log('1️⃣ Testing set/get:');
    const key = 'test-key-' + Date.now();
    const value = { test: 'data', timestamp: Date.now() };
    
    await cache.set(key, value);
    console.log('   ✅ Set value:', value);
    
    const retrieved = await cache.get(key);
    console.log('   ✅ Retrieved value:', retrieved);
    console.log('   Match:', JSON.stringify(value) === JSON.stringify(retrieved) ? '✅' : '❌');
    
    // Test 2: Check stats
    console.log('\n2️⃣ Testing stats:');
    const stats = await cache.getStats();
    console.log('   Type:', stats.type);
    console.log('   Size:', stats.size);
    console.log('   Entries:', stats.entries.length);
    
    // Test 3: Has key
    console.log('\n3️⃣ Testing has:');
    const hasKey = await cache.has(key);
    console.log('   Has key:', hasKey ? '✅' : '❌');
    
    const hasNonExistent = await cache.has('non-existent-key');
    console.log('   Has non-existent:', hasNonExistent ? '❌' : '✅');
    
    // Test 4: Delete
    console.log('\n4️⃣ Testing delete:');
    const deleted = await cache.delete(key);
    console.log('   Deleted:', deleted ? '✅' : '❌');
    
    const hasAfterDelete = await cache.has(key);
    console.log('   Has after delete:', hasAfterDelete ? '❌' : '✅');
    
    // Test 5: Clear
    console.log('\n5️⃣ Testing clear:');
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    
    const sizeBeforeClear = await cache.size();
    console.log('   Size before clear:', sizeBeforeClear);
    
    await cache.clear();
    
    const sizeAfterClear = await cache.size();
    console.log('   Size after clear:', sizeAfterClear);
    console.log('   Clear successful:', sizeAfterClear === 0 ? '✅' : '❌');
    
    // Test 6: TTL expiration (for in-memory)
    console.log('\n6️⃣ Testing TTL:');
    const ttlKey = 'ttl-test-' + Date.now();
    await cache.set(ttlKey, 'short-lived', 1000); // 1 second TTL
    
    const beforeExpiry = await cache.get(ttlKey);
    console.log('   Before expiry:', beforeExpiry ? '✅' : '❌');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const afterExpiry = await cache.get(ttlKey);
    console.log('   After expiry:', afterExpiry ? '❌' : '✅');
    
    // Clean up
    if (cache.destroy) {
      cache.destroy();
    }
    
    console.log('\n✨ Cache tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testCache();