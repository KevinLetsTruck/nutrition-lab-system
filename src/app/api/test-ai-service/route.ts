import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';

export async function GET(request: NextRequest) {
  console.log('\n=== Testing AI Service Singleton ===\n');
  
  try {
    // Test 1: Get the AI service instance (lazy initialization)
    console.log('1. Getting AI service instance...');
    const aiService = getAIService();
    console.log('✓ AI service instance obtained');
    
    // Test 2: Verify singleton by getting instance again
    console.log('\n2. Verifying singleton pattern...');
    const sameInstance = getAIService();
    console.log('✓ Same instance returned:', aiService === sameInstance);
    
    // Test 3: Check provider health
    console.log('\n3. Checking provider health...');
    const health = await aiService.healthCheck();
    console.log('Provider health status:', health);
    
    // Test 4: Test completion with cache
    console.log('\n4. Testing completion...');
    const response = await aiService.complete("What is the capital of France?", {
      useCache: true,
      provider: 'mock' // Use mock provider for testing
    });
    console.log('Completion response:', {
      provider: response.provider,
      contentLength: response.content.length,
      cached: response.cached || false,
      latency: response.latency
    });
    
    // Test 5: Test cache hit (same prompt)
    console.log('\n5. Testing cache hit...');
    const cachedResponse = await aiService.complete("What is the capital of France?", {
      useCache: true,
      provider: 'mock'
    });
    console.log('Cached response:', {
      cached: cachedResponse.cached || false,
      sameContent: response.content === cachedResponse.content
    });
    
    // Test 6: Get metrics
    console.log('\n6. Getting metrics...');
    const metrics = aiService.getMetrics();
    console.log('Service metrics:', {
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      failedRequests: metrics.failedRequests,
      cacheHits: metrics.cacheHits,
      cacheHitRate: `${metrics.cacheHitRate.toFixed(2)}%`,
      successRate: `${metrics.successRate.toFixed(2)}%`,
      averageLatency: `${metrics.averageLatencyMs}ms`,
      providerUsage: metrics.providerUsage
    });
    
    // Test 7: Health analysis
    console.log('\n7. Testing health analysis...');
    const healthAnalysis = await aiService.analyzeHealth({
      bloodPressure: { systolic: 120, diastolic: 80 },
      heartRate: 70
    }, {
      provider: 'mock',
      useCache: true
    });
    console.log('Health analysis:', {
      summary: healthAnalysis.summary.substring(0, 100) + '...',
      findingsCount: healthAnalysis.findings.length,
      recommendationsCount: healthAnalysis.recommendations.length,
      confidence: healthAnalysis.confidence
    });
    
    // Test 8: Final metrics
    console.log('\n8. Final metrics after all tests...');
    const finalMetrics = aiService.getMetrics();
    console.log('Final service metrics:', {
      totalRequests: finalMetrics.totalRequests,
      cacheHits: finalMetrics.cacheHits,
      cacheHitRate: `${finalMetrics.cacheHitRate.toFixed(2)}%`,
      uptime: `${(finalMetrics.uptime / 1000).toFixed(2)}s`
    });
    
    console.log('\n=== All Tests Completed Successfully ===\n');
    
    return NextResponse.json({
      success: true,
      message: 'AI Service singleton tested successfully',
      results: {
        singleton: true,
        health,
        testResponse: {
          provider: response.provider,
          contentPreview: response.content.substring(0, 50) + '...',
          cached: response.cached || false
        },
        metrics: finalMetrics
      }
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Test POST endpoint for custom prompts
export async function POST(request: NextRequest) {
  try {
    const { prompt, provider, useCache = true } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }
    
    console.log('\n=== Testing AI Service with Custom Prompt ===');
    console.log('Prompt:', prompt);
    console.log('Provider:', provider || 'auto');
    console.log('Use Cache:', useCache);
    
    const aiService = getAIService();
    const response = await aiService.complete(prompt, {
      provider,
      useCache
    });
    
    console.log('Response received:', {
      provider: response.provider,
      contentLength: response.content.length,
      cached: response.cached || false,
      latency: response.latency
    });
    
    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        cached: response.cached || false,
        latency: response.latency,
        usage: response.usage
      },
      metrics: aiService.getMetrics()
    });
    
  } catch (error) {
    console.error('Custom prompt test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}