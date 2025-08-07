import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai';

/**
 * AI Service Health Check Endpoint
 * 
 * Provides comprehensive health status and metrics for the AI service
 * Useful for monitoring, dashboards, and alerting systems
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get the AI service singleton
    const aiService = getAIService();
    
    // Run health check on all providers
    const providerHealth = await aiService.healthCheck();
    
    // Get current metrics
    const metrics = aiService.getMetrics();
    
    // Analyze provider health to determine overall status
    const providers = Object.entries(providerHealth).map(([name, health]) => ({
      name,
      healthy: health.healthy,
      lastCheck: health.lastCheck.toISOString(),
      responseTime: health.responseTime || null
    }));
    
    const healthyProviders = providers.filter(p => p.healthy);
    const totalProviders = providers.length;
    const healthyCount = healthyProviders.length;
    
    // Determine overall status
    let overallStatus: 'operational' | 'degraded' | 'down';
    let statusMessage: string;
    
    if (healthyCount === totalProviders) {
      overallStatus = 'operational';
      statusMessage = 'All AI providers are operational';
    } else if (healthyCount > 0) {
      overallStatus = 'degraded';
      statusMessage = `${healthyCount}/${totalProviders} providers operational`;
    } else {
      overallStatus = 'down';
      statusMessage = 'No AI providers are operational';
    }
    
    // Calculate additional metrics
    const uptimeHours = (metrics.uptime / (1000 * 60 * 60)).toFixed(2);
    const avgResponseTime = metrics.averageLatencyMs;
    
    // Build response
    const response = {
      status: overallStatus,
      message: statusMessage,
      timestamp: new Date().toISOString(),
      checkDuration: Date.now() - startTime,
      service: {
        name: 'AI Service',
        version: '1.0.0',
        uptime: {
          milliseconds: metrics.uptime,
          hours: parseFloat(uptimeHours),
          startTime: new Date(metrics.startTime).toISOString()
        }
      },
      providers: {
        total: totalProviders,
        healthy: healthyCount,
        details: providers
      },
      metrics: {
        requests: {
          total: metrics.totalRequests,
          successful: metrics.successfulRequests,
          failed: metrics.failedRequests,
          successRate: `${metrics.successRate.toFixed(2)}%`
        },
        cache: {
          hits: metrics.cacheHits,
          hitRate: `${metrics.cacheHitRate.toFixed(2)}%`
        },
        performance: {
          averageLatencyMs: avgResponseTime,
          averageLatency: avgResponseTime > 1000 
            ? `${(avgResponseTime / 1000).toFixed(2)}s` 
            : `${avgResponseTime}ms`
        },
        providerUsage: metrics.providerUsage
      },
      alerts: [] as Array<{
        level: string;
        message: string;
        affectedProviders?: string[];
        action?: string;
      }>
    };
    
    // Add alerts if needed
    if (overallStatus === 'degraded') {
      response.alerts.push({
        level: 'warning',
        message: 'Some AI providers are not responding',
        affectedProviders: providers.filter(p => !p.healthy).map(p => p.name)
      });
    }
    
    if (overallStatus === 'down') {
      response.alerts.push({
        level: 'critical',
        message: 'All AI providers are down',
        action: 'Check API keys and provider status'
      });
    }
    
    if (metrics.failedRequests > 0) {
      const failureRate = (metrics.failedRequests / metrics.totalRequests) * 100;
      if (failureRate > 10) {
        response.alerts.push({
          level: 'warning',
          message: `High failure rate: ${failureRate.toFixed(2)}%`,
          failedRequests: metrics.failedRequests,
          lastError: metrics.lastError
        });
      }
    }
    
    if (avgResponseTime > 5000) {
      response.alerts.push({
        level: 'warning',
        message: 'High average response time',
        averageLatency: response.metrics.performance.averageLatency
      });
    }
    
    // Set appropriate status code
    const statusCode = overallStatus === 'operational' ? 200 : 
                      overallStatus === 'degraded' ? 207 : 503;
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': overallStatus
      }
    });
    
  } catch (error) {
    console.error('[AI Health] Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: {
        name: 'AI Service',
        version: '1.0.0'
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'error'
      }
    });
  }
}

/**
 * OPTIONS method for CORS support
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}