#!/usr/bin/env tsx

/**
 * AI Service Cost Tracker
 * 
 * Track and estimate AI usage costs for the nutrition practice
 */

import { getAIService } from '../src/lib/ai';

// Approximate costs per 1K tokens (varies by model)
const COST_PER_1K_TOKENS = {
  anthropic: {
    'claude-3-opus': 0.015,
    'claude-3-sonnet': 0.003,
    'claude-3-haiku': 0.00025
  },
  openai: {
    'gpt-4-turbo': 0.01,
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.0005
  }
};

async function trackCosts() {
  console.log('💰 AI Service Cost Tracker\n');
  
  const aiService = getAIService();
  const metrics = aiService.getMetrics();
  
  console.log('📊 Usage Metrics:');
  console.log(`   Total Requests: ${metrics.totalRequests}`);
  console.log(`   Cache Hit Rate: ${metrics.cacheHitRate}`);
  console.log(`   Success Rate: ${metrics.successRate}`);
  console.log(`   Average Latency: ${metrics.averageLatencyMs}ms`);
  
  console.log('\n📈 Provider Usage:');
  Object.entries(metrics.providerUsage).forEach(([provider, count]) => {
    console.log(`   ${provider}: ${count} requests`);
  });
  
  // Estimate costs (assuming average 1K tokens per request)
  console.log('\n💵 Estimated Costs:');
  let totalCost = 0;
  
  if (metrics.providerUsage.anthropic) {
    const anthropicCost = metrics.providerUsage.anthropic * COST_PER_1K_TOKENS.anthropic['claude-3-sonnet'];
    console.log(`   Anthropic: $${anthropicCost.toFixed(2)}`);
    totalCost += anthropicCost;
  }
  
  if (metrics.providerUsage.openai) {
    const openaiCost = metrics.providerUsage.openai * COST_PER_1K_TOKENS.openai['gpt-4-turbo'];
    console.log(`   OpenAI: $${openaiCost.toFixed(2)}`);
    totalCost += openaiCost;
  }
  
  console.log(`   ─────────────`);
  console.log(`   Total: $${totalCost.toFixed(2)}`);
  
  // Calculate savings from caching
  const cacheHits = metrics.cacheHits || 0;
  const nonCachedRequests = Math.max(1, metrics.totalRequests - cacheHits);
  const avgCostPerRequest = totalCost / nonCachedRequests;
  const savings = cacheHits * avgCostPerRequest;
  
  if (metrics.totalRequests > 0) {
    console.log(`\n💾 Cache Savings: $${savings.toFixed(2)}`);
    console.log(`   (${cacheHits} cached responses)`);
  }
  
  // Recommendations
  console.log('\n💡 Cost Optimization Tips:');
  
  if (metrics.totalRequests === 0) {
    console.log('   ℹ️  No requests recorded yet - start using the AI service to see metrics');
  } else {
    if (parseFloat(metrics.cacheHitRate) < 30) {
      console.log('   ⚠️  Low cache hit rate - consider increasing TTL');
    }
    
    if (metrics.failedRequests > metrics.totalRequests * 0.05) {
      console.log('   ⚠️  High failure rate - check API keys and rate limits');
    }
    
    if ((metrics.providerUsage.anthropic || 0) > (metrics.providerUsage.openai || 0) * 2) {
      console.log('   💡 Consider using GPT-3.5 for simple queries to reduce costs');
    }
  }
  
  // Daily/Monthly projections
  if (metrics.totalRequests > 0 && metrics.startTime) {
    const hoursElapsed = Math.max(1, (Date.now() - metrics.startTime) / 3600000);
    const requestsPerHour = metrics.totalRequests / hoursElapsed;
    const dailyCost = (requestsPerHour * 24 * avgCostPerRequest);
    const monthlyCost = dailyCost * 30;
    
    console.log('\n📅 Projections:');
    console.log(`   Hourly: ${requestsPerHour.toFixed(0)} requests`);
    console.log(`   Daily Cost: $${dailyCost.toFixed(2)}`);
    console.log(`   Monthly Cost: $${monthlyCost.toFixed(2)}`);
  }
}

// Run cost tracking
trackCosts().catch(console.error);